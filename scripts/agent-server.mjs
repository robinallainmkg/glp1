#!/usr/bin/env node
// =============================================================================
// Agent Server — HTTP endpoint to launch Claude Code agents from the dashboard
// Usage: node scripts/agent-server.mjs
// Stop: Ctrl+C
// =============================================================================

import { createServer } from 'http';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const PORT = 7854;

const AGENTS = {
  'seo-audit':      'Realise l\'audit SEO complet du site',
  'analytics':      'Analyse les keywords et le positionnement',
  'fact-check':     'Verifie les articles contre les sources officielles',
  'opportunities':  'Cherche les opportunites de contenu',
  'editorial':      'Traite les tickets, liens internes et opportunites',
  'validator':      'Valide le site - build, frontmatter, liens, images',
  'internal-links': 'Analyse le maillage interne et suggere des liens',
};

// Track running agents
const running = new Map();

// Supabase helper
async function sbPatch(path, data) {
  if (!SUPABASE_URL) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
  } catch(e) {}
}

async function sbInsert(table, data) {
  if (!SUPABASE_URL) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    const result = await r.json();
    return Array.isArray(result) ? result[0] : result;
  } catch(e) { return null; }
}

function launchAgent(name) {
  if (running.has(name)) {
    return { ok: false, error: `${name} est deja en cours` };
  }

  const prompt = AGENTS[name];
  if (!prompt) {
    return { ok: false, error: `Agent inconnu: ${name}` };
  }

  console.log(`🚀 [${new Date().toLocaleTimeString()}] Lancement: ${name}`);

  const child = spawn('claude', ['-p', prompt, '--agent', name], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PATH: process.env.PATH }
  });

  let output = '';
  child.stdout.on('data', d => { output += d.toString(); });
  child.stderr.on('data', d => { output += d.toString(); });

  running.set(name, { pid: child.pid, started: new Date() });

  child.on('close', async (code) => {
    running.delete(name);
    const status = code === 0 ? 'completed' : 'failed';
    console.log(`${code === 0 ? '✅' : '❌'} [${new Date().toLocaleTimeString()}] ${name} ${status} (exit ${code})`);

    // Update queue if we have a task ID
    if (child._queueId) {
      await sbPatch(`agent_queue?id=eq.${child._queueId}`, {
        status,
        completed_at: new Date().toISOString(),
        error_message: code !== 0 ? output.slice(-200) : null
      });
    }
  });

  // Create queue entry for dashboard tracking
  sbInsert('agent_queue', {
    agent_name: name,
    status: 'running',
    started_at: new Date().toISOString()
  }).then(entry => {
    if (entry?.id) child._queueId = entry.id;
  });

  return { ok: true, pid: child.pid };
}

function stopAgent(name) {
  const info = running.get(name);
  if (!info) return { ok: false, error: `${name} n'est pas en cours` };

  try {
    process.kill(info.pid, 'SIGTERM');
    running.delete(name);
    console.log(`⏹️ [${new Date().toLocaleTimeString()}] ${name} arrete`);
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// HTTP Server
const server = createServer(async (req, res) => {
  // CORS headers for dashboard
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET /status — list running agents
  if (req.method === 'GET' && url.pathname === '/status') {
    const agents = {};
    for (const [name, info] of running) {
      agents[name] = { pid: info.pid, uptime: Math.round((Date.now() - info.started) / 1000) + 's' };
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ running: agents, available: Object.keys(AGENTS) }));
    return;
  }

  // POST /launch — launch an agent
  if (req.method === 'POST' && url.pathname === '/launch') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const { agent } = JSON.parse(body);
        const result = launchAgent(agent);
        res.writeHead(result.ok ? 200 : 409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // POST /stop — stop an agent
  if (req.method === 'POST' && url.pathname === '/stop') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const { agent } = JSON.parse(body);
        const result = stopAgent(agent);
        res.writeHead(result.ok ? 200 : 404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // POST /pipeline — launch full pipeline
  if (req.method === 'POST' && url.pathname === '/pipeline') {
    const wave1 = ['seo-audit', 'analytics', 'fact-check', 'opportunities', 'internal-links'];
    const alreadyRunning = wave1.filter(a => running.has(a));
    if (alreadyRunning.length > 0 || running.has('editorial') || running.has('validator')) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: `Agents deja en cours: ${[...running.keys()].join(', ')}` }));
      return;
    }

    // Launch wave 1 in parallel
    const results = wave1.map(a => ({ agent: a, ...launchAgent(a) }));

    // TODO: wave 2 & 3 should wait for previous waves — for now just queue them
    console.log('📋 Pipeline lance — Vague 1 en cours, Vague 2 & 3 a lancer manuellement apres');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, wave1: results, note: 'Vague 1 lancee. Lancer editorial apres completion, puis validator.' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🤖 Agent Server en ecoute sur http://127.0.0.1:${PORT}`);
  console.log(`   Agents disponibles: ${Object.keys(AGENTS).join(', ')}`);
  console.log(`   Endpoints:`);
  console.log(`     GET  /status   — voir les agents en cours`);
  console.log(`     POST /launch   — { "agent": "editorial" }`);
  console.log(`     POST /stop     — { "agent": "editorial" }`);
  console.log(`     POST /pipeline — lancer le pipeline complet`);
  console.log(`   Ctrl+C pour arreter\n`);
});
