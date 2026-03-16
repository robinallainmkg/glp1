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
  'strategist':        'Analyse GA/GSC + etat pipeline, prend des decisions strategiques et oriente les agents',
  'seo-audit':         'Realise l\'audit SEO complet du site',
  'analytics':         'Analyse les keywords et le positionnement',
  'fact-check':        'Verifie les articles contre les sources officielles',
  'opportunities':     'Cherche les opportunites de contenu',
  'editorial':         'Traite les tickets, liens internes et opportunites',
  'editorial-medical': 'Corrige les tickets medicaux urgents (false_claim, missing_info, outdated_info, price_update)',
  'editorial-seo':     'Corrige les tickets SEO et technique + maillage interne',
  'editorial-content': 'Cree de nouveaux articles + corrections techniques (broken_link, missing_image)',
  'validator':         'Valide le site - build, frontmatter, liens, images',
  'internal-links':    'Analyse le maillage interne et suggere des liens',
  'autopilot':         'Lance l\'autopilot. Boucle infinie, traite tout, ne t\'arrete jamais.',
};

// Track running agents
const running = new Map();

// Output buffers — keep last N lines per agent (persists after agent stops)
const MAX_LINES = 500;
const outputBuffers = new Map(); // name -> { lines: [], offset: 0 }

function appendOutput(name, text) {
  if (!outputBuffers.has(name)) outputBuffers.set(name, { lines: [], startedAt: new Date().toISOString() });
  const buf = outputBuffers.get(name);
  const newLines = text.split('\n');
  for (const line of newLines) {
    if (line.trim()) {
      buf.lines.push({ ts: new Date().toISOString(), text: line });
      if (buf.lines.length > MAX_LINES) buf.lines.shift();
    }
  }
}

// Parse stream-json output from claude CLI
function parseStreamJson(name, rawLine) {
  if (!rawLine.trim()) return;
  try {
    const event = JSON.parse(rawLine);
    // Types: system, assistant, result, tool_use, tool_result, etc.
    const ts = new Date().toISOString();

    switch (event.type) {
      case 'assistant':
        // Assistant text message
        if (event.message?.content) {
          for (const block of event.message.content) {
            if (block.type === 'text' && block.text) {
              // Split long text into lines
              for (const line of block.text.split('\n')) {
                if (line.trim()) appendOutput(name, `💬 ${line}`);
              }
            } else if (block.type === 'tool_use') {
              appendOutput(name, `🔧 Tool: ${block.name}${block.input ? ' — ' + JSON.stringify(block.input).slice(0, 150) : ''}`);
            }
          }
        }
        break;

      case 'content_block_delta':
        if (event.delta?.type === 'text_delta' && event.delta.text) {
          // Streaming text deltas — accumulate
          const text = event.delta.text;
          if (text.includes('\n')) {
            for (const line of text.split('\n')) {
              if (line.trim()) appendOutput(name, `💬 ${line}`);
            }
          } else if (text.trim()) {
            // Append to last line if it's a partial
            const buf = outputBuffers.get(name);
            const last = buf?.lines[buf.lines.length - 1];
            if (last && last.text.startsWith('💬 ') && (Date.now() - new Date(last.ts).getTime()) < 2000) {
              last.text += text;
              last.ts = ts;
            } else {
              appendOutput(name, `💬 ${text}`);
            }
          }
        }
        break;

      case 'result':
        if (event.result) {
          appendOutput(name, `✅ Resultat final recu`);
          if (typeof event.result === 'string') {
            for (const line of event.result.split('\n').slice(0, 10)) {
              if (line.trim()) appendOutput(name, `📋 ${line}`);
            }
          }
        }
        if (event.cost_usd !== undefined) {
          appendOutput(name, `💰 Cout: $${event.cost_usd.toFixed(4)}`);
        }
        break;

      case 'tool_use':
        appendOutput(name, `🔧 ${event.name || 'tool'}(${JSON.stringify(event.input || {}).slice(0, 120)})`);
        break;

      case 'tool_result':
        const preview = typeof event.content === 'string' ? event.content.slice(0, 100) : JSON.stringify(event.content || '').slice(0, 100);
        appendOutput(name, `📎 Resultat: ${preview}${preview.length >= 100 ? '...' : ''}`);
        break;

      case 'system':
        appendOutput(name, `⚙️ ${event.message || event.subtype || 'system'}`);
        break;

      default:
        // Log unknown events for debugging
        if (event.type) {
          appendOutput(name, `⚡ [${event.type}] ${JSON.stringify(event).slice(0, 120)}`);
        }
    }
  } catch(e) {
    // Not valid JSON — log as raw text
    if (rawLine.trim()) {
      appendOutput(name, rawLine.trim());
    }
  }
}

// Execute strategist decisions after it completes
async function executeStrategistDecisions() {
  if (!SUPABASE_URL) return;
  try {
    // Fetch unapplied launch_agent decisions
    const r = await fetch(`${SUPABASE_URL}/rest/v1/strategist_decisions?decision_type=eq.launch_agent&applied=eq.false&order=created_at.asc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });
    const decisions = await r.json();
    if (!Array.isArray(decisions) || decisions.length === 0) {
      appendOutput('strategist', '📋 Aucune decision launch_agent a executer');
      return;
    }

    for (const decision of decisions) {
      const agentName = decision.target_agent;
      if (!agentName || !AGENTS[agentName]) {
        appendOutput('strategist', `⚠️ Agent inconnu dans decision: ${agentName}`);
        continue;
      }

      appendOutput('strategist', `🤖 Auto-lancement: ${agentName} — ${decision.reason?.slice(0, 80)}...`);
      const result = launchAgent(agentName);

      if (result.ok) {
        appendOutput('strategist', `✅ ${agentName} lance (PID ${result.pid})`);
      } else {
        appendOutput('strategist', `❌ Echec lancement ${agentName}: ${result.error}`);
      }

      // Mark decision as applied
      await fetch(`${SUPABASE_URL}/rest/v1/strategist_decisions?id=eq.${decision.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ applied: true })
      });
    }

    appendOutput('strategist', `🏁 ${decisions.length} decision(s) executee(s)`);
  } catch(e) {
    appendOutput('strategist', `❌ Erreur execution decisions: ${e.message}`);
  }
}

// After editorial finishes, check if remaining tickets need processing
async function checkAndRelaunchIfNeeded(finishedAgent) {
  if (!SUPABASE_URL) return;

  // Don't relaunch if other editorials are still running
  const editorialsRunning = [...running.keys()].filter(k => k.startsWith('editorial'));
  if (editorialsRunning.length > 0) {
    console.log(`⏳ ${editorialsRunning.length} editorial(s) encore en cours, on attend...`);
    return;
  }

  try {
    // Count remaining approved tickets
    const r = await fetch(`${SUPABASE_URL}/rest/v1/correction_tickets?statut=eq.approved&select=id`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const tickets = await r.json();
    const remaining = Array.isArray(tickets) ? tickets.length : 0;

    if (remaining > 0) {
      appendOutput(finishedAgent, `\n🔄 ${remaining} tickets restants — relance du strategist pour redistribuer...`);
      console.log(`🔄 [${new Date().toLocaleTimeString()}] ${remaining} tickets restants — relance strategist`);
      launchAgent('strategist');
    } else {
      appendOutput(finishedAgent, `\n✅ Tous les tickets traites ! Pipeline termine.`);
      console.log(`✅ [${new Date().toLocaleTimeString()}] Pipeline termine — 0 tickets restants`);
    }
  } catch(e) {
    console.log(`⚠️ Erreur check tickets: ${e.message}`);
  }
}

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

  const child = spawn('claude', [
    '-p', prompt,
    '--agent', name,
    '--output-format', 'stream-json',
    '--verbose',
    '--dangerously-skip-permissions'
  ], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PATH: process.env.PATH }
  });

  // Reset output buffer for this agent
  outputBuffers.set(name, { lines: [{ ts: new Date().toISOString(), text: `🚀 Agent ${name} lance (PID ${child.pid})` }], startedAt: new Date().toISOString() });

  let output = '';
  let stdoutBuffer = '';
  child.stdout.on('data', d => {
    const text = d.toString();
    output += text;
    // stream-json emits one JSON object per line
    stdoutBuffer += text;
    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop(); // keep incomplete last line
    for (const line of lines) {
      parseStreamJson(name, line);
    }
  });
  child.stderr.on('data', d => {
    const text = d.toString();
    output += text;
    appendOutput(name, `⚠️ ${text.trim()}`);
  });

  running.set(name, { pid: child.pid, started: new Date() });

  child.on('close', async (code) => {
    running.delete(name);
    const status = code === 0 ? 'completed' : 'failed';
    appendOutput(name, `\n${code === 0 ? '✅' : '❌'} Agent ${name} ${status} (exit code ${code})`);
    console.log(`${code === 0 ? '✅' : '❌'} [${new Date().toLocaleTimeString()}] ${name} ${status} (exit ${code})`);

    // Update queue if we have a task ID
    if (child._queueId) {
      await sbPatch(`agent_queue?id=eq.${child._queueId}`, {
        status,
        completed_at: new Date().toISOString(),
        error_message: code !== 0 ? output.slice(-200) : null
      });
    }

    // If strategist just completed successfully, execute its decisions
    if (name === 'strategist' && code === 0) {
      console.log('🤖 Strategist termine — execution des decisions...');
      await executeStrategistDecisions();
    }

    // If an editorial agent finished, check if there are remaining tickets
    if (name.startsWith('editorial') && code === 0) {
      // Wait 10s for Supabase to settle, then check remaining tickets
      setTimeout(() => checkAndRelaunchIfNeeded(name), 10000);
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

  // GET /status — list running agents + buffer info
  if (req.method === 'GET' && url.pathname === '/status') {
    const agents = {};
    for (const [name, info] of running) {
      agents[name] = {
        pid: info.pid,
        uptime: Math.round((Date.now() - info.started) / 1000) + 's',
        lines: outputBuffers.get(name)?.lines.length || 0
      };
    }
    // Include agents with buffers (even stopped)
    const buffers = {};
    for (const [name, buf] of outputBuffers) {
      buffers[name] = { lines: buf.lines.length, startedAt: buf.startedAt, running: running.has(name) };
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ running: agents, available: Object.keys(AGENTS), buffers }));
    return;
  }

  // GET /output/:agent — stream agent output (with ?since=N for incremental)
  if (req.method === 'GET' && url.pathname.startsWith('/output/')) {
    const agentName = url.pathname.replace('/output/', '');
    const since = parseInt(url.searchParams.get('since') || '0');
    const buf = outputBuffers.get(agentName);

    if (!buf) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ agent: agentName, lines: [], total: 0, running: false }));
      return;
    }

    // Return lines after 'since' index
    const lines = since > 0 ? buf.lines.slice(since) : buf.lines;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      agent: agentName,
      lines,
      total: buf.lines.length,
      running: running.has(agentName),
      startedAt: buf.startedAt
    }));
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

  // POST /sync-analytics — run sync-analytics.mjs script
  if (req.method === 'POST' && url.pathname === '/sync-analytics') {
    if (running.has('sync-analytics')) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Sync already running' }));
      return;
    }

    console.log(`📡 [${new Date().toLocaleTimeString()}] Lancement sync-analytics`);
    const child = spawn('node', ['scripts/sync-analytics.mjs'], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PATH: process.env.PATH }
    });

    let output = '';
    child.stdout.on('data', d => { output += d.toString(); process.stdout.write(d); });
    child.stderr.on('data', d => { output += d.toString(); process.stderr.write(d); });

    running.set('sync-analytics', { pid: child.pid, started: new Date() });
    child.on('close', (code) => {
      running.delete('sync-analytics');
      console.log(`${code === 0 ? '✅' : '❌'} sync-analytics done (exit ${code})`);
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, pid: child.pid }));
    return;
  }

  // POST /pipeline — launch full pipeline
  if (req.method === 'POST' && url.pathname === '/pipeline') {
    if (running.size > 0) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: `Agents deja en cours: ${[...running.keys()].join(', ')}` }));
      return;
    }

    // New pipeline:
    // Vague 0: sync-analytics (script) + strategist (agent) — sequential, strategist after sync
    // Vague 1: seo-audit + analytics + fact-check + opportunities + internal-links — parallel
    // Vague 2: editorial
    // Vague 3: validator
    // For now: launch wave 1 + strategist in parallel, the rest is manual
    const wave1 = ['seo-audit', 'analytics', 'fact-check', 'opportunities', 'internal-links', 'strategist'];
    const results = wave1.map(a => ({ agent: a, ...launchAgent(a) }));

    console.log('📋 Pipeline lance — Vague 1 + Strategist en cours');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      launched: results,
      note: 'Vague 1 + Strategist lances. Lancer editorial apres completion, puis validator.'
    }));
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
