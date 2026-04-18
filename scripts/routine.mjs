#!/usr/bin/env node
// =============================================================================
// ROUTINE GLP-1 — Script unique a lancer a chaque session
//
// Usage:
//   node scripts/routine.mjs              # Pipeline complet
//   node scripts/routine.mjs --sync-only  # Sync analytics uniquement
//   node scripts/routine.mjs --dry-run    # Affiche ce qui serait lance sans executer
//
// Ce script remplace l'ancien autopilot. Il fait UN cycle complet :
//   1. Sync analytics (GA4 + GSC → Supabase)
//   2. Demarre le agent-server (si pas deja en cours)
//   3. Lance les agents GENERATE en parallele (fact-check, seo-audit, opportunities, internal-links)
//   4. Attend la fin des agents GENERATE
//   5. Lance les agents EDIT (editorial x4 partitionne)
//   6. Attend la fin des agents EDIT
//   7. Lance le validator (build check → push main → deploy FTP)
//   8. Rapport final
// =============================================================================

import { execSync, spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const AGENT_SERVER_URL = 'http://127.0.0.1:7854';

const args = process.argv.slice(2);
const SYNC_ONLY = args.includes('--sync-only');
const DRY_RUN = args.includes('--dry-run');

// =============================================================================
// Helpers
// =============================================================================

function log(msg) { console.log(`[${new Date().toLocaleTimeString('fr-FR')}] ${msg}`); }

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  return res.json();
}

async function launchAgent(name, prompt) {
  const body = { agent: name };
  if (prompt) body.prompt = prompt;
  const res = await fetch(`${AGENT_SERVER_URL}/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function waitForAgents(filter, maxWaitMs = 600000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const status = await fetchJSON(`${AGENT_SERVER_URL}/status`);
    const running = Object.keys(status.running || {}).filter(k => {
      if (!filter) return true;
      return filter.some(f => k.includes(f));
    });
    if (running.length === 0) return true;
    log(`  En attente: ${running.join(', ')}`);
    await new Promise(r => setTimeout(r, 15000));
  }
  log('  TIMEOUT — agents pas termines');
  return false;
}

async function isAgentServerRunning() {
  try {
    const res = await fetch(`${AGENT_SERVER_URL}/status`);
    return res.ok;
  } catch { return false; }
}

// =============================================================================
// Phase 0 — Sync Analytics
// =============================================================================

async function syncAnalytics() {
  log('=== PHASE 0 : Sync Analytics (GA4 + GSC) ===');
  if (DRY_RUN) { log('  [DRY RUN] node scripts/sync-analytics.mjs --days 7'); return; }

  try {
    const output = execSync('node scripts/sync-analytics.mjs --days 7', {
      cwd: PROJECT_ROOT,
      timeout: 120000,
      encoding: 'utf8'
    });
    const match = output.match(/GA4: (\d+) rows[\s\S]*GSC: (\d+) rows/);
    if (match) {
      log(`  GA4: ${match[1]} lignes | GSC: ${match[2]} lignes`);
    } else {
      log('  Sync terminee');
    }
  } catch (e) {
    log(`  ERREUR sync analytics: ${e.message?.substring(0, 200)}`);
    log('  → Continuer sans analytics fraiches');
  }
}

// =============================================================================
// Phase 1 — Start Agent Server
// =============================================================================

async function ensureAgentServer() {
  log('=== PHASE 1 : Agent Server ===');

  if (await isAgentServerRunning()) {
    log('  Agent server deja en cours');
    return;
  }

  if (DRY_RUN) { log('  [DRY RUN] node scripts/agent-server.mjs'); return; }

  log('  Demarrage agent-server...');
  const child = spawn('node', ['scripts/agent-server.mjs'], {
    cwd: PROJECT_ROOT,
    detached: true,
    stdio: 'ignore'
  });
  child.unref();

  // Wait for it to be ready
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000));
    if (await isAgentServerRunning()) {
      log('  Agent server pret');
      return;
    }
  }
  throw new Error('Agent server failed to start');
}

// =============================================================================
// Phase 2 — GENERATE (fact-check, seo-audit, opportunities, internal-links)
// =============================================================================

async function phaseGenerate() {
  log('=== PHASE 2 : GENERATE (audit + fact-check + opportunities + maillage) ===');

  const agents = ['fact-check', 'seo-audit', 'opportunities', 'internal-links'];

  if (DRY_RUN) {
    agents.forEach(a => log(`  [DRY RUN] launch ${a}`));
    return;
  }

  for (const agent of agents) {
    const result = await launchAgent(agent);
    log(`  Lance: ${agent} (PID: ${result.pid || 'N/A'})`);
  }

  log('  Attente fin des agents GENERATE...');
  await waitForAgents(agents, 900000); // 15 min max
  log('  GENERATE termine');
}

// =============================================================================
// Phase 3 — EDIT (editorial x4 partitionne)
// =============================================================================

async function phaseEdit() {
  log('=== PHASE 3 : EDIT (editorial x4 partitions) ===');

  if (DRY_RUN) {
    for (let i = 0; i < 4; i++) log(`  [DRY RUN] launch editorial partition ${i+1}/4`);
    return;
  }

  for (let i = 0; i < 4; i++) {
    const result = await launchAgent('editorial',
      `Traite les corrections (partition ${i+1}/4, filtre: article_id mod 4 = ${i})`);
    log(`  Lance: editorial ${i+1}/4 (PID: ${result.pid || 'N/A'})`);
  }

  log('  Attente fin des agents EDIT...');
  await waitForAgents(['editorial'], 900000);
  log('  EDIT termine');
}

// =============================================================================
// Phase 4 — VALIDATE + DEPLOY
// =============================================================================

async function phaseValidate() {
  log('=== PHASE 4 : VALIDATE + DEPLOY ===');

  if (DRY_RUN) { log('  [DRY RUN] launch validator'); return; }

  const result = await launchAgent('validator');
  log(`  Lance: validator (PID: ${result.pid || 'N/A'})`);

  log('  Attente fin du validator...');
  await waitForAgents(['validator'], 600000);
  log('  VALIDATE termine');
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const startTime = Date.now();

  console.log('');
  console.log('============================================================');
  console.log('  ROUTINE GLP-1 FRANCE — Pipeline complet');
  console.log('============================================================');
  console.log('');

  // Phase 0: Sync analytics
  await syncAnalytics();

  if (SYNC_ONLY) {
    log('=== Mode --sync-only, arret apres sync ===');
    return;
  }

  // Phase 1: Ensure agent server
  await ensureAgentServer();

  // Phase 2: GENERATE
  await phaseGenerate();

  // Phase 3: EDIT
  await phaseEdit();

  // Phase 4: VALIDATE + DEPLOY
  await phaseValidate();

  // Rapport
  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log('');
  console.log('============================================================');
  log(`ROUTINE TERMINEE en ${Math.floor(duration/60)}m${duration%60}s`);
  console.log('============================================================');
}

main().catch(e => {
  console.error('ERREUR FATALE:', e.message);
  process.exit(1);
});
