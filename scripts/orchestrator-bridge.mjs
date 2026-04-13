#!/usr/bin/env node
// =============================================================================
// Orchestrator Bridge — secure HTTP proxy between Anthropic Managed Agent
// (running in the cloud) and the local agent-server.mjs on port 7854.
//
// Why a bridge and not direct exposure:
//   - agent-server.mjs has no auth and is meant for localhost only
//   - the bridge adds a bearer token check
//   - the bridge tracks cumulative budget and refuses calls over the cap
//   - the bridge logs every orchestrator call for audit
//
// Usage:
//   ORCHESTRATOR_TOKEN=... node scripts/orchestrator-bridge.mjs
//
// Expose via Cloudflare Tunnel:
//   cloudflared tunnel --url http://localhost:7855
// =============================================================================

import { createServer } from 'http';
import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Load .env
try {
  const envFile = readFileSync(join(PROJECT_ROOT, '.env'), 'utf-8');
  for (const line of envFile.split('\n')) {
    if (line && !line.startsWith('#')) {
      const [key, ...vals] = line.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
} catch(e) {}

const PORT = 7855;
const UPSTREAM = 'http://127.0.0.1:7854';
const TOKEN = process.env.ORCHESTRATOR_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!TOKEN) {
  console.error('FATAL: ORCHESTRATOR_TOKEN env var is required');
  process.exit(1);
}

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Budget cap in USD (matches the 50€ hard cap)
const HARD_BUDGET_USD = 54;
const WARN_THRESHOLD_USD = 40;
const DEGRADE_THRESHOLD_USD = 48;

// Logs dir
const LOG_DIR = join(PROJECT_ROOT, 'logs');
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = join(LOG_DIR, 'orchestrator-bridge.log');

function log(level, msg, extra = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra }) + '\n';
  appendFileSync(LOG_FILE, line);
  console.log(`[${level}] ${msg}`, Object.keys(extra).length ? extra : '');
}

// Whitelist of endpoints the orchestrator can hit
const ALLOWED_ROUTES = [
  { method: 'GET', path: '/status' },
  { method: 'GET', path: '/pipeline/status' },
  { method: 'GET', path: '/autopilot/status' },
  { method: 'POST', path: '/pipeline' },
  { method: 'POST', path: '/launch' },
  { method: 'POST', path: '/sync-analytics' },
];

function isAllowed(method, path) {
  return ALLOWED_ROUTES.some(r => r.method === method && (r.path === path || path.startsWith(r.path + '/')));
}

// Budget: read current month cumulative from Supabase
async function getBudgetState() {
  if (!supabase) return { cumulative: 0, mode: 'normal' };
  try {
    const { data } = await supabase
      .from('orchestrator_state')
      .select('budget_cumulative_usd')
      .eq('id', 'singleton')
      .maybeSingle();
    const cum = data?.budget_cumulative_usd || 0;
    let mode = 'normal';
    if (cum > DEGRADE_THRESHOLD_USD) mode = 'frozen';
    else if (cum > WARN_THRESHOLD_USD) mode = 'degraded';
    return { cumulative: cum, mode };
  } catch(e) {
    return { cumulative: 0, mode: 'normal' };
  }
}

async function proxyRequest(method, path, body) {
  const url = UPSTREAM + path;
  const init = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) init.body = body;
  const r = await fetch(url, init);
  const text = await r.text();
  return { status: r.status, body: text };
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Auth check
  const auth = req.headers['authorization'] || '';
  const provided = auth.replace(/^Bearer\s+/i, '');
  if (provided !== TOKEN) {
    log('warn', 'unauthorized', { ip: req.socket.remoteAddress, path: req.url });
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'unauthorized' }));
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health / budget endpoint (always available)
  if (req.method === 'GET' && url.pathname === '/health') {
    const budget = await getBudgetState();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      budget,
      cap_usd: HARD_BUDGET_USD,
      warn_threshold: WARN_THRESHOLD_USD,
      degrade_threshold: DEGRADE_THRESHOLD_USD
    }));
    return;
  }

  // Budget track endpoint — orchestrator reports its API spend here
  if (req.method === 'POST' && url.pathname === '/budget/track') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      try {
        const { usd, label } = JSON.parse(body);
        if (typeof usd !== 'number') throw new Error('usd required');
        if (supabase) {
          const { data } = await supabase
            .from('orchestrator_state')
            .select('budget_cumulative_usd')
            .eq('id', 'singleton')
            .maybeSingle();
          const current = data?.budget_cumulative_usd || 0;
          await supabase.from('orchestrator_state').upsert({
            id: 'singleton',
            budget_cumulative_usd: current + usd,
            updated_at: new Date().toISOString()
          });
          await supabase.from('orchestrator_decisions').insert({
            kind: 'budget_track',
            payload: { usd, label, cumulative: current + usd }
          });
        }
        log('info', 'budget_track', { usd, label });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Budget gate
  const budget = await getBudgetState();
  if (budget.mode === 'frozen' && req.method === 'POST') {
    log('warn', 'budget_frozen_rejected', { path: url.pathname, cumulative: budget.cumulative });
    res.writeHead(402, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'budget_frozen', cumulative: budget.cumulative, cap: HARD_BUDGET_USD }));
    return;
  }

  // Route whitelist
  if (!isAllowed(req.method, url.pathname)) {
    log('warn', 'route_not_allowed', { method: req.method, path: url.pathname });
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'route_not_allowed' }));
    return;
  }

  // Proxy to upstream
  let body = '';
  req.on('data', d => body += d);
  req.on('end', async () => {
    try {
      const result = await proxyRequest(req.method, url.pathname + url.search, req.method === 'POST' ? body : null);
      log('info', 'proxy', { method: req.method, path: url.pathname, status: result.status, budget: budget.mode });
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(result.body);
    } catch(e) {
      log('error', 'proxy_failed', { err: e.message });
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'upstream_unreachable', detail: e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nOrchestrator Bridge listening on http://127.0.0.1:${PORT}`);
  console.log(`Upstream: ${UPSTREAM}`);
  console.log(`Budget cap: $${HARD_BUDGET_USD} (warn $${WARN_THRESHOLD_USD}, degrade $${DEGRADE_THRESHOLD_USD})`);
  console.log(`Logs: ${LOG_FILE}`);
  console.log(`\nExpose publicly with:`);
  console.log(`  cloudflared tunnel --url http://localhost:${PORT}`);
  console.log(`\nAllowed routes:`);
  ALLOWED_ROUTES.forEach(r => console.log(`  ${r.method} ${r.path}`));
});
