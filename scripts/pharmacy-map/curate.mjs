#!/usr/bin/env node
/**
 * Pharmacy-curator : modération auto-assistée des soumissions GLP-1.
 *
 * Étapes :
 *   1. Fetch pending submissions (verified=FALSE, source='user', display=TRUE)
 *   2. Applique les règles : auto-approve / auto-reject / keep-pending
 *   3. Lance l'export JSON (public/data/*.json)
 *   4. Git commit + push sur main
 *   5. Notifie Discord
 *   6. Renvoie un rapport JSON
 *
 * Usage :
 *   node scripts/pharmacy-map/curate.mjs [--dry-run] [--skip-git] [--skip-discord]
 *
 * Return : JSON summary stdout (+ exit 0 si OK, 1 si erreur)
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'node:child_process';

const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_GIT = process.argv.includes('--skip-git');
const SKIP_DISCORD = process.argv.includes('--skip-discord');

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || '';

if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─────────────────────────────────────────────────────────────
// Règles de modération — validées avec user ±30% sur CEPS/prix moyens
// ─────────────────────────────────────────────────────────────
const PRICE_RANGES = {
  // [min_ok, max_ok, min_safe, max_safe] — auto-approve si dans [min_ok, max_ok]
  //                                        auto-reject si hors [min_safe, max_safe]
  ozempic: { ok: [54, 101], safe: [30, 200] },
  wegovy: { ok: [118, 468], safe: [80, 600] },
  mounjaro: { ok: [161, 572], safe: [100, 700] },
  saxenda: { ok: [161, 299], safe: [100, 500] },
};

const SPAM_PATTERNS = [
  /https?:\/\//i,
  /\b(crypto|bitcoin|nft|porn|xxx|cialis|viagra)\b/i,
  /@[\w.-]+\.[a-z]{2,}/i, // emails
];

function classifyPrice(drug, price) {
  const r = PRICE_RANGES[drug];
  if (!r) return 'pending';
  if (price < r.safe[0] || price > r.safe[1]) return 'reject_aberrant';
  if (price >= r.ok[0] && price <= r.ok[1]) return 'ok';
  return 'marginal';
}

function isSpammyNote(notes) {
  if (!notes) return false;
  if (notes.length > 200) return true;
  return SPAM_PATTERNS.some((p) => p.test(notes));
}

async function fetchPendingWithContext() {
  // Pending submissions
  const { data: pending, error } = await supabase
    .from('pharmacy_prices')
    .select('id, pharmacy_id, drug_slug, dose, price_eur, source, submitted_at, submitted_by_session, notes')
    .eq('verified', false)
    .eq('display', true)
    .eq('source', 'user')
    .order('submitted_at', { ascending: true });
  if (error) throw error;

  // Session history : combien de soumissions ont été faites dans les dernières 24h par chaque session
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent, error: err2 } = await supabase
    .from('pharmacy_prices')
    .select('submitted_by_session')
    .eq('source', 'user')
    .gte('submitted_at', since);
  if (err2) throw err2;

  const sessionCount24h = {};
  for (const r of recent || []) {
    const sid = r.submitted_by_session || 'unknown';
    sessionCount24h[sid] = (sessionCount24h[sid] || 0) + 1;
  }

  return { pending: pending || [], sessionCount24h };
}

function decide(row, ctx) {
  const priceNum = Number(row.price_eur);
  const priceClass = classifyPrice(row.drug_slug, priceNum);
  const spam = isSpammyNote(row.notes);
  const sessionCount = ctx.sessionCount24h[row.submitted_by_session] || 0;

  // Rejet franc
  if (priceClass === 'reject_aberrant') {
    return { action: 'reject', reason: `prix aberrant (${priceNum}€ hors [${PRICE_RANGES[row.drug_slug]?.safe.join('-')}])` };
  }
  if (spam) {
    return { action: 'reject', reason: 'note suspecte (URL/email/spam)' };
  }
  if (sessionCount > 10) {
    return { action: 'reject', reason: `session spam (${sessionCount} soumissions/24h)` };
  }

  // Approve auto
  if (priceClass === 'ok' && sessionCount <= 5) {
    return { action: 'approve', reason: `prix dans range CEPS ±30% (${priceNum}€)` };
  }

  // Sinon : human review
  const reasons = [];
  if (priceClass === 'marginal') reasons.push(`prix marginal ${priceNum}€`);
  if (sessionCount > 5) reasons.push(`session active (${sessionCount}/24h)`);
  return { action: 'pending', reason: reasons.join(' · ') || 'review manuel requis' };
}

async function apply(id, action) {
  if (DRY_RUN) return;
  const patch = action === 'approve'
    ? { verified: true, verified_at: new Date().toISOString(), display: true }
    : { display: false };
  const { error } = await supabase.from('pharmacy_prices').update(patch).eq('id', id);
  if (error) throw error;
}

async function runJsonExport() {
  if (DRY_RUN) return { ok: true, skipped: true };
  try {
    execSync('node scripts/pharmacy-map/export-pharmacies-json.mjs', {
      stdio: 'pipe',
      env: process.env,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function runGit(summary) {
  if (DRY_RUN || SKIP_GIT) return { ok: true, skipped: true };
  try {
    // On ne commit que si pharmacies.json ou latest-prices.json ont réellement changé.
    // pharmacy-stats.json contient un timestamp updated_at qui change à chaque run —
    // on l'inclut dans le commit s'il y a déjà un vrai changement, sinon on le laisse.
    const dataStatus = execSync(
      'git status --porcelain public/data/pharmacies.json public/data/latest-prices.json',
      { encoding: 'utf8' },
    ).trim();
    if (!dataStatus) {
      // Rien de significatif — on revert stats.json pour éviter un diff de pur timestamp
      try { execSync('git checkout -- public/data/pharmacy-stats.json'); } catch {}
      return { ok: true, skipped: true, reason: 'no-meaningful-changes' };
    }

    const msg = `chore(pharmacy-map): refresh prices (${summary.approved} approved, ${summary.rejected} rejected, ${summary.pending} pending)`;
    execSync('git add public/data/pharmacies.json public/data/latest-prices.json public/data/pharmacy-stats.json');
    execSync(`git commit -m ${JSON.stringify(msg)}`);
    execSync('git push origin HEAD:main');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function sendDiscord(summary, gitResult) {
  if (SKIP_DISCORD || !DISCORD_WEBHOOK) return { ok: true, skipped: true };

  const lines = [
    `💊 **Pharmacy Curator** — ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`,
    `📥 ${summary.total} soumissions traitées`,
    `✅ ${summary.approved} auto-validées · ❌ ${summary.rejected} auto-rejetées · ⏳ ${summary.pending} en attente review`,
  ];
  if (gitResult.ok && !gitResult.skipped) {
    lines.push(`🚀 Push sur main → deploy auto`);
  } else if (gitResult.skipped) {
    lines.push(`ℹ️ Pas de changement data (pas de push)`);
  } else {
    lines.push(`⚠️ Git error : ${gitResult.error}`);
  }
  if (summary.pending > 0) {
    lines.push(`🔗 Review sur https://glp1-france.fr/admin/pharmacy-prices/`);
  }

  try {
    const r = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: lines.join('\n').slice(0, 2000) }),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function main() {
  const t0 = Date.now();
  console.error(`[curate] start${DRY_RUN ? ' (DRY-RUN)' : ''}`);

  const { pending, sessionCount24h } = await fetchPendingWithContext();
  console.error(`[curate] ${pending.length} pending submissions to evaluate`);

  const summary = {
    total: pending.length,
    approved: 0,
    rejected: 0,
    pending: 0,
    decisions: [],
  };

  for (const row of pending) {
    const decision = decide(row, { sessionCount24h });
    summary.decisions.push({
      id: row.id,
      pharmacy_id: row.pharmacy_id,
      drug: row.drug_slug,
      price: Number(row.price_eur),
      action: decision.action,
      reason: decision.reason,
    });

    try {
      if (decision.action === 'approve') {
        await apply(row.id, 'approve');
        summary.approved += 1;
      } else if (decision.action === 'reject') {
        await apply(row.id, 'reject');
        summary.rejected += 1;
      } else {
        summary.pending += 1;
      }
    } catch (e) {
      console.error(`[curate] apply failed for ${row.id}:`, e.message);
    }
  }

  console.error(`[curate] decisions: ${summary.approved} approve · ${summary.rejected} reject · ${summary.pending} pending`);

  const exportResult = await runJsonExport();
  const gitResult = exportResult.ok ? runGit(summary) : { ok: false, error: 'export failed' };
  const discordResult = await sendDiscord(summary, gitResult);

  const report = {
    ok: true,
    dry_run: DRY_RUN,
    duration_ms: Date.now() - t0,
    summary,
    export: exportResult,
    git: gitResult,
    discord: discordResult,
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error('[curate] fatal:', err);
  console.log(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
