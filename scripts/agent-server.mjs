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
  'editorial':         'Traite les tickets, liens internes et opportunites (commit+push main)',
  'validator':         'Valide le site (build + deploy production si OK)',
  'internal-links':    'Analyse le maillage interne et suggere des liens',
  'autopilot':         'Lance l\'autopilot. Boucle infinie, traite tout, ne t\'arrete jamais.',
};

// Track running agents
const running = new Map();

// Output buffers — keep last N lines per agent (persists after agent stops)
const MAX_LINES = 500;
const outputBuffers = new Map(); // name -> { lines: [], offset: 0 }

function appendOutput(name, text, level) {
  if (!outputBuffers.has(name)) outputBuffers.set(name, { lines: [], startedAt: new Date().toISOString() });
  const buf = outputBuffers.get(name);
  const newLines = text.split('\n');
  for (const line of newLines) {
    if (line.trim()) {
      buf.lines.push({ ts: new Date().toISOString(), text: line, level: level || 'info' });
      if (buf.lines.length > MAX_LINES) buf.lines.shift();
    }
  }
}

// ========== HUMAN-READABLE CONSOLE OUTPUT ==========

// Summarize tool calls into clear French
function summarizeTool(toolName, input) {
  const inp = input || {};
  switch (toolName) {
    case 'Read': {
      const f = (inp.file_path || '').split('/').slice(-2).join('/');
      return f ? `Lecture ${f}` : null;
    }
    case 'Edit': {
      const f = (inp.file_path || '').split('/').slice(-2).join('/');
      return `Modification ${f}`;
    }
    case 'Write': {
      const f = (inp.file_path || '').split('/').slice(-2).join('/');
      return `Ecriture ${f}`;
    }
    case 'Bash': {
      const cmd = (inp.command || '').trim();
      if (!cmd) return null;
      if (cmd.includes('git add') || cmd.includes('git commit')) return `Git: ${cmd.slice(0, 80)}`;
      if (cmd.includes('git push')) return `Git push`;
      if (cmd.includes('git diff')) return `Git diff`;
      if (cmd.includes('astro build') || cmd.includes('npm run build')) return `Build du site`;
      if (cmd.includes('curl') && cmd.includes('supabase')) return `Requete Supabase`;
      if (cmd.includes('node ')) return `Execution script`;
      return `Commande: ${cmd.slice(0, 70)}`;
    }
    case 'Grep': return `Recherche "${inp.pattern || ''}" dans ${inp.path || 'le projet'}`;
    case 'Glob': return `Scan fichiers ${inp.pattern || ''}`;
    case 'Agent': return `Sous-agent: ${inp.description || ''}`;
    case 'WebSearch': return `Recherche web: ${inp.query || ''}`;
    case 'WebFetch': return `Fetch web`;
    case 'TodoWrite': return null; // noise
    default: {
      // MCP tools
      if (toolName.includes('execute_sql')) {
        const sql = (inp.sql || inp.query || '').replace(/\s+/g, ' ').slice(0, 100);
        return `SQL: ${sql}`;
      }
      if (toolName.includes('supabase') || toolName.includes('mcp__100191b9')) {
        const action = toolName.split('__').pop();
        return `Supabase: ${action}`;
      }
      // Generic MCP
      if (toolName.startsWith('mcp__')) {
        const parts = toolName.split('__');
        return `Outil: ${parts[parts.length - 1]}`;
      }
      return `Outil: ${toolName}`;
    }
  }
}

// Filter assistant text: keep meaningful lines, skip thinking/filler
function isUsefulText(line) {
  if (!line || line.length < 3) return false;
  // Skip markdown formatting noise
  if (/^[#\-\*]{1,3}\s*$/.test(line)) return false;
  if (/^```/.test(line)) return false;
  // Skip thinking/planning filler
  if (/^(Let me|I'll|I need to|I should|Now I|First,|Next,|OK |Alright|Looking at|Let's|Checking|Hmm|Ok,)/i.test(line)) return false;
  if (/^(Thinking|Analyzing|Considering|Planning|Reviewing|Understanding)/i.test(line)) return false;
  // Keep everything else (results, actions, summaries)
  return true;
}

// Classify text importance: 'action' | 'result' | 'progress' | 'info' | null
function classifyText(line) {
  if (/(\d+)\s*(tickets?|corrections?|articles?|problemes?|erreurs?|liens?|issues?)\s*(crees?|trouves?|traites?|inseres?|verifies?|corriges?|generes?)/i.test(line)) return 'result';
  if (/(termine|complete|fini|done|succes|success|deploye)/i.test(line)) return 'result';
  if (/^(CYCLE|PHASE|VAGUE|ETAPE|MODE|=+)/i.test(line)) return 'progress';
  if (/(score|position|coverage|pourcentage|moyenne|rank).*\d/i.test(line)) return 'result';
  if (/(article|page|fichier).*:/i.test(line) && line.length < 150) return 'action';
  if (/^(Correction|Insertion|Creation|Verification|Modification|Mise a jour|Traitement)/i.test(line)) return 'action';
  if (/(erreur|error|failed|echoue|broken|manquant|missing)/i.test(line)) return 'error';
  return 'info';
}

// Track per-agent cost
const agentCosts = new Map(); // name -> total USD

// Parse stream-json output from claude CLI — human-readable version
function parseStreamJson(name, rawLine) {
  if (!rawLine.trim()) return;
  try {
    const event = JSON.parse(rawLine);

    switch (event.type) {
      case 'assistant':
        if (event.message?.content) {
          for (const block of event.message.content) {
            if (block.type === 'text' && block.text) {
              for (const line of block.text.split('\n')) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (!isUsefulText(trimmed)) continue;
                const cls = classifyText(trimmed);
                const prefix = cls === 'result' ? '✅ ' : cls === 'progress' ? '📍 ' : cls === 'action' ? '▸ ' : cls === 'error' ? '❌ ' : '';
                appendOutput(name, `${prefix}${trimmed}`, cls);
              }
            } else if (block.type === 'tool_use') {
              const summary = summarizeTool(block.name, block.input);
              if (summary) appendOutput(name, `   ↳ ${summary}`, 'tool');
            }
          }
        }
        break;

      case 'content_block_delta':
        if (event.delta?.type === 'text_delta' && event.delta.text) {
          const text = event.delta.text;
          const buf = outputBuffers.get(name);
          // Accumulate text deltas into complete lines
          if (text.includes('\n')) {
            for (const line of text.split('\n')) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (!isUsefulText(trimmed)) continue;
              const cls = classifyText(trimmed);
              const prefix = cls === 'result' ? '✅ ' : cls === 'progress' ? '📍 ' : cls === 'action' ? '▸ ' : cls === 'error' ? '❌ ' : '';
              appendOutput(name, `${prefix}${trimmed}`, cls);
            }
          } else if (text.trim()) {
            const last = buf?.lines[buf.lines.length - 1];
            if (last && !last.text.startsWith('   ↳') && (Date.now() - new Date(last.ts).getTime()) < 3000) {
              last.text += text;
              last.ts = new Date().toISOString();
            } else if (isUsefulText(text.trim())) {
              appendOutput(name, text.trim(), 'info');
            }
          }
        }
        break;

      case 'result':
        if (event.result) {
          appendOutput(name, `━━━ TERMINE ━━━`, 'result');
          if (typeof event.result === 'string') {
            for (const line of event.result.split('\n').slice(0, 5)) {
              if (line.trim()) appendOutput(name, `  ${line.trim()}`, 'result');
            }
          }
        }
        if (event.cost_usd !== undefined) {
          const cost = event.cost_usd;
          const prev = agentCosts.get(name) || 0;
          agentCosts.set(name, prev + cost);
          appendOutput(name, `💰 Cout de ce run: $${cost.toFixed(3)} (total: $${(prev + cost).toFixed(3)})`, 'cost');
        }
        break;

      case 'tool_use': {
        const summary = summarizeTool(event.name, event.input);
        if (summary) appendOutput(name, `   ↳ ${summary}`, 'tool');
        break;
      }

      case 'tool_result': {
        // Only show tool results that contain useful info (errors, counts, etc.)
        const content = typeof event.content === 'string' ? event.content : JSON.stringify(event.content || '');
        // Show errors
        if (/error|fail|exception/i.test(content) && content.length < 300) {
          appendOutput(name, `   ⚠ ${content.slice(0, 150)}`, 'error');
        }
        // Show results with numbers (likely counts, scores)
        else if (/\d+\s*(rows?|articles?|tickets?|created|inserted|updated|deleted)/i.test(content)) {
          const match = content.match(/(\d+\s*(rows?|articles?|tickets?|created|inserted|updated|deleted)[^.]*)/i);
          if (match) appendOutput(name, `   → ${match[1]}`, 'result');
        }
        // Skip everything else (file contents, large JSON, etc.)
        break;
      }

      case 'system':
        if (event.subtype === 'init') {
          appendOutput(name, `🚀 Agent initialise`, 'progress');
        } else if (event.message) {
          appendOutput(name, `⚙ ${event.message}`, 'info');
        }
        break;

      default:
        // Skip ALL noise: rate_limit_event, content_block_start/stop, message_start/stop, etc.
        break;
    }
  } catch(e) {
    // Not valid JSON — only show non-empty, non-debug lines
    const trimmed = rawLine.trim();
    if (trimmed && !trimmed.startsWith('{') && trimmed.length > 5) {
      appendOutput(name, trimmed, 'info');
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

// Resolve instance name: fact-check -> fact-check, fact-check (if running) -> fact-check-2, etc.
function resolveInstanceName(baseName) {
  if (!running.has(baseName)) return baseName;
  for (let i = 2; i <= 10; i++) {
    const instanceName = `${baseName}-${i}`;
    if (!running.has(instanceName)) return instanceName;
  }
  return null; // max 10 instances
}

// Get the base agent name (strip instance suffix)
function getBaseAgent(instanceName) {
  // Check direct match first
  if (AGENTS[instanceName]) return instanceName;
  // Try stripping -N suffix
  const match = instanceName.match(/^(.+)-(\d+)$/);
  if (match && AGENTS[match[1]]) return match[1];
  return null;
}

function launchAgent(name, { allowMultiple = false } = {}) {
  const baseAgent = getBaseAgent(name) || name;
  const prompt = AGENTS[baseAgent];
  if (!prompt) {
    return { ok: false, error: `Agent inconnu: ${name}` };
  }

  let instanceName = name;
  if (running.has(name)) {
    if (!allowMultiple) {
      return { ok: false, error: `${name} est deja en cours` };
    }
    // Find next available instance name
    instanceName = resolveInstanceName(baseAgent);
    if (!instanceName) {
      return { ok: false, error: `Max instances atteint pour ${baseAgent}` };
    }
  }

  // Count how many instances of this base agent are running (for partitioning)
  let runningInstanceCount = 0;
  for (const [k, info] of running) {
    if (info.baseAgent === baseAgent || k === baseAgent) runningInstanceCount++;
  }
  const totalInstances = runningInstanceCount + 1; // including this new one
  const instanceIndex = runningInstanceCount; // 0-based

  // Build partitioned prompt to avoid cannibalization
  let finalPrompt = prompt;
  if (totalInstances > 1) {
    const partitions = [
      { range: 'a-g', desc: 'slugs commencant par a a g' },
      { range: 'h-n', desc: 'slugs commencant par h a n' },
      { range: 'o-z', desc: 'slugs commencant par o a z' },
    ];
    // For > 3 instances, use modulo
    if (totalInstances <= 3) {
      const p = partitions[instanceIndex] || partitions[2];
      finalPrompt += `\n\nPARTITION: Tu es l'instance ${instanceIndex + 1}/${totalInstances}. Traite UNIQUEMENT les articles/pages dont le slug commence par ${p.range}. Ignore les autres pour eviter les doublons avec les autres instances.`;
    } else {
      finalPrompt += `\n\nPARTITION: Tu es l'instance ${instanceIndex + 1}/${totalInstances}. Traite UNIQUEMENT les articles dont (id modulo ${totalInstances}) = ${instanceIndex}. Ignore les autres.`;
    }
    appendOutput(instanceName, `📍 Instance ${instanceIndex + 1}/${totalInstances} — partition assignee`, 'progress');
  }

  console.log(`🚀 [${new Date().toLocaleTimeString()}] Lancement: ${instanceName}${instanceName !== baseAgent ? ` (instance ${instanceIndex + 1}/${totalInstances} de ${baseAgent})` : ''}`);

  const child = spawn('claude', [
    '-p', finalPrompt,
    '--agent', baseAgent,
    '--output-format', 'stream-json',
    '--verbose',
    '--dangerously-skip-permissions'
  ], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PATH: process.env.PATH }
  });

  // Reset output buffer for this instance
  outputBuffers.set(instanceName, { lines: [{ ts: new Date().toISOString(), text: `🚀 Agent ${instanceName} lance (PID ${child.pid})` }], startedAt: new Date().toISOString() });

  let output = '';
  let stdoutBuffer = '';
  child.stdout.on('data', d => {
    const text = d.toString();
    output += text;
    stdoutBuffer += text;
    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop();
    for (const line of lines) {
      parseStreamJson(instanceName, line);
    }
  });
  child.stderr.on('data', d => {
    const text = d.toString();
    output += text;
    appendOutput(instanceName, `⚠️ ${text.trim()}`);
  });

  running.set(instanceName, { pid: child.pid, started: new Date(), baseAgent });

  child.on('close', async (code) => {
    running.delete(instanceName);
    const status = code === 0 ? 'completed' : 'failed';
    appendOutput(instanceName, `\n${code === 0 ? '✅' : '❌'} Agent ${instanceName} ${status} (exit code ${code})`);
    console.log(`${code === 0 ? '✅' : '❌'} [${new Date().toLocaleTimeString()}] ${instanceName} ${status} (exit ${code})`);

    // Update queue if we have a task ID
    if (child._queueId) {
      await sbPatch(`agent_queue?id=eq.${child._queueId}`, {
        status,
        completed_at: new Date().toISOString(),
        error_message: code !== 0 ? output.slice(-200) : null
      });
    }

    // If strategist just completed successfully, execute its decisions
    if (baseAgent === 'strategist' && code === 0) {
      console.log('🤖 Strategist termine — execution des decisions...');
      await executeStrategistDecisions();
    }

    // If an editorial agent finished, check if there are remaining tickets
    if (baseAgent.startsWith('editorial') && code === 0) {
      setTimeout(() => checkAndRelaunchIfNeeded(instanceName), 10000);
    }
  });

  // Create queue entry for dashboard tracking
  sbInsert('agent_queue', {
    agent_name: instanceName,
    status: 'running',
    started_at: new Date().toISOString()
  }).then(entry => {
    if (entry?.id) child._queueId = entry.id;
  });

  return { ok: true, pid: child.pid, instance: instanceName };
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
    // Aggregate costs
    const costs = {};
    for (const [n, c] of agentCosts) costs[n] = c;
    const totalCost = [...agentCosts.values()].reduce((s, c) => s + c, 0);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ running: agents, available: Object.keys(AGENTS), buffers, costs, totalCost }));
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

  // POST /launch — launch an agent (supports { allowMultiple: true } for multi-instance)
  if (req.method === 'POST' && url.pathname === '/launch') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const { agent, allowMultiple } = JSON.parse(body);
        const result = launchAgent(agent, { allowMultiple: !!allowMultiple });
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
