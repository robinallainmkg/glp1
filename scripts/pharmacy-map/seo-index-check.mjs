#!/usr/bin/env node
/**
 * SEO Index Watcher — lit les métriques GSC depuis Supabase pour suivre
 * la progression de l'indexation Google des 22 544 pages du site.
 *
 * Signal principal : nombre de pages ayant reçu au moins 1 impression GSC
 * sur les 30 derniers jours (= effectivement indexées et servies en SERP).
 *
 * Usage :
 *   node scripts/pharmacy-map/seo-index-check.mjs [--skip-discord]
 *
 * Retourne un JSON rapport sur stdout + notifie Discord (sauf si --skip-discord).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

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

// Totaux pages du site — approximation basée sur les datasets connus
const SITE_PAGES = {
  pharmacies_per_site: 20040,   // /pharmacies/[ville]/[pharmacie]/
  cp_pages: 2139,               // /pharmacies/cp/[zipcode]/
  ville_pages: 100,             // /pharmacies/[ville]/
  core_pages: 365,              // homepage + articles + admin + outils
  get total() {
    return this.pharmacies_per_site + this.cp_pages + this.ville_pages + this.core_pages;
  },
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function indexedPagesByWindow(fromDate) {
  // Pages ayant reçu >=1 impression depuis fromDate
  const { data, error } = await supabase.rpc('count_indexed_pages_since', { since_date: fromDate })
    .single();

  if (error || !data) {
    // Fallback si la RPC n'existe pas : query directe
    const { data: rows, error: err2 } = await supabase
      .from('gsc_metrics')
      .select('page_path')
      .gte('date', fromDate)
      .gt('impressions', 0);
    if (err2) throw err2;
    return new Set((rows || []).map((r) => r.page_path)).size;
  }
  return data.count || 0;
}

async function indexedPagesBreakdown(fromDate) {
  // Catégorise les pages indexées par type
  const { data, error } = await supabase
    .from('gsc_metrics')
    .select('page_path')
    .gte('date', fromDate)
    .gt('impressions', 0);
  if (error) throw error;

  const paths = new Set((data || []).map((r) => r.page_path));
  const buckets = {
    per_pharmacy: 0,
    cp: 0,
    ville: 0,
    outils: 0,
    collections: 0,
    guides: 0,
    other: 0,
  };
  for (const p of paths) {
    if (p.match(/^\/pharmacies\/[^/]+\/[^/]+\/?$/) && !p.startsWith('/pharmacies/cp/')) {
      buckets.per_pharmacy++;
    } else if (p.startsWith('/pharmacies/cp/')) {
      buckets.cp++;
    } else if (p.match(/^\/pharmacies\/[^/]+\/?$/)) {
      buckets.ville++;
    } else if (p.startsWith('/outils/')) {
      buckets.outils++;
    } else if (p.startsWith('/collections/')) {
      buckets.collections++;
    } else if (p.startsWith('/guides/')) {
      buckets.guides++;
    } else {
      buckets.other++;
    }
  }
  return { total: paths.size, buckets };
}

async function topGainers(sinceDate, limit = 10) {
  // Pages qui ont GAGNÉ le plus d'impressions dans la fenêtre
  const { data, error } = await supabase
    .from('gsc_metrics')
    .select('page_path, impressions, clicks')
    .gte('date', sinceDate);
  if (error) throw error;

  const byPage = {};
  for (const r of data || []) {
    if (!byPage[r.page_path]) byPage[r.page_path] = { impressions: 0, clicks: 0 };
    byPage[r.page_path].impressions += r.impressions || 0;
    byPage[r.page_path].clicks += r.clicks || 0;
  }
  return Object.entries(byPage)
    .sort((a, b) => b[1].impressions - a[1].impressions)
    .slice(0, limit)
    .map(([path, m]) => ({ path, impressions: m.impressions, clicks: m.clicks }));
}

async function sendDiscord(summary) {
  if (SKIP_DISCORD || !DISCORD_WEBHOOK) return { ok: true, skipped: true };

  const pct = ((summary.indexed_30d / summary.total_pages) * 100).toFixed(1);
  const pctPrev = ((summary.indexed_60d / summary.total_pages) * 100).toFixed(1);
  const trend = summary.indexed_30d - summary.indexed_60d;
  const trendEmoji = trend > 50 ? '📈' : trend < -50 ? '📉' : '➡️';

  const lines = [
    `🔍 **SEO Index Watcher** — ${new Date().toLocaleDateString('fr-FR')}`,
    ``,
    `**Indexation Google** : ${summary.indexed_30d} / ${summary.total_pages} pages (${pct}%) ${trendEmoji}`,
    `Vs il y a 30 jours : ${summary.indexed_60d} (${pctPrev}%)`,
    ``,
    `**Par type de page** :`,
    `· Pages pharmacies individuelles : **${summary.buckets.per_pharmacy}** / 20 040`,
    `· Pages codes postaux : **${summary.buckets.cp}** / 2 139`,
    `· Pages villes : **${summary.buckets.ville}** / 100`,
    `· Articles collections : **${summary.buckets.collections}**`,
    `· Guides : **${summary.buckets.guides}**`,
    `· Outils : **${summary.buckets.outils}**`,
    ``,
    `**Top 5 gagnants (impressions 30j)** :`,
    ...summary.top_gainers.slice(0, 5).map((t, i) =>
      `${i + 1}. \`${t.path}\` · ${t.impressions} imp · ${t.clicks} clics`,
    ),
  ];

  // Reco si ratio trop bas
  if (Number(pct) < 10 && summary.total_pages > 10000) {
    lines.push('');
    lines.push(`⚠️ **Ratio indexation < 10%** — envisager \`noindex\` sur pharmacies sans prix communautaire.`);
  } else if (Number(pct) > 30) {
    lines.push('');
    lines.push(`✅ Bon ratio d'indexation, on continue.`);
  }

  const body = lines.join('\n').slice(0, 2000);
  try {
    const r = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: body }),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function main() {
  console.error('[seo-index] start');
  const t0 = Date.now();

  const since30 = daysAgo(30);
  const since60 = daysAgo(60);

  const [breakdown30, indexed60, gainers] = await Promise.all([
    indexedPagesBreakdown(since30),
    indexedPagesByWindow(since60),
    topGainers(since30, 10),
  ]);

  const summary = {
    total_pages: SITE_PAGES.total,
    indexed_30d: breakdown30.total,
    indexed_60d: indexed60,
    ratio_30d_pct: Number(((breakdown30.total / SITE_PAGES.total) * 100).toFixed(1)),
    buckets: breakdown30.buckets,
    top_gainers: gainers,
    as_of: new Date().toISOString().slice(0, 10),
  };

  const discord = await sendDiscord(summary);

  const report = {
    ok: true,
    duration_ms: Date.now() - t0,
    summary,
    discord,
  };
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error('[seo-index] fatal:', err);
  console.log(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
