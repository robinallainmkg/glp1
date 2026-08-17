#!/usr/bin/env node
// =============================================================================
// Sync Analytics — Fetch GA4 + GSC data → Supabase
//
// Usage:
//   node scripts/sync-analytics.mjs              # sync last 7 days
//   node scripts/sync-analytics.mjs --days 30    # sync last 30 days
//   node scripts/sync-analytics.mjs --setup      # first-time OAuth setup
//   node scripts/sync-analytics.mjs --discover   # list GA4 properties + GSC sites
//
// Requires in .env:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET — from Google Cloud Console
//   GOOGLE_REFRESH_TOKEN — obtained via --setup
//   GA4_PROPERTY_ID — e.g. properties/123456789 (find via --discover)
//   GSC_SITE_URL — e.g. https://glp1-france.com (find via --discover)
//   SUPABASE_URL, SUPABASE_ANON_KEY
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { createSign } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const ENV_PATH = join(PROJECT_ROOT, '.env');

// Load .env
function loadEnv() {
  try {
    const envFile = readFileSync(ENV_PATH, 'utf-8');
    for (const line of envFile.split('\n')) {
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...vals] = line.split('=');
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  } catch(e) {}
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
let REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
let GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
let GSC_SITE_URL = process.env.GSC_SITE_URL;

// Parse args
const args = process.argv.slice(2);
const daysIdx = args.indexOf('--days');
const DAYS = daysIdx >= 0 ? parseInt(args[daysIdx + 1]) : 7;
const SETUP_MODE = args.includes('--setup');
const DISCOVER_MODE = args.includes('--discover');

const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly'
].join(' ');

const REDIRECT_PORT = 9876;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

// =============================================================================
// OAuth2 — Interactive setup (first time)
// =============================================================================

async function oauthSetup() {
  console.log('\n🔐 OAuth2 Setup — Premiere connexion Google\n');

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Ajoute d\'abord dans .env :');
    console.error('   GOOGLE_CLIENT_ID=<ton-client-id>.apps.googleusercontent.com');
    console.error('   GOOGLE_CLIENT_SECRET=<ton-client-secret>');
    process.exit(1);
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  console.log('📋 Etape 1: Ouvre cette URL dans ton navigateur :\n');
  console.log(authUrl);
  console.log('\n⏳ En attente du callback sur http://localhost:' + REDIRECT_PORT + '...\n');

  // Try to open browser automatically
  const { exec } = await import('child_process');
  exec(`open "${authUrl}"`);

  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>❌ Erreur</h1><p>' + error + '</p>');
          reject(new Error(error));
          server.close();
          return;
        }

        if (!code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>❌ Pas de code</h1>');
          reject(new Error('No code'));
          server.close();
          return;
        }

        // Exchange code for tokens
        try {
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code'
            })
          });

          const tokens = await tokenRes.json();

          if (tokens.error) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h1>❌ Erreur token</h1><p>${tokens.error_description || tokens.error}</p>`);
            reject(new Error(tokens.error));
            server.close();
            return;
          }

          // Save refresh token to .env
          const refreshToken = tokens.refresh_token;
          if (refreshToken) {
            appendToEnv('GOOGLE_REFRESH_TOKEN', refreshToken);
            REFRESH_TOKEN = refreshToken;
            console.log('✅ Refresh token sauvegarde dans .env');
          }

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <h1 style="color:green">✅ Connexion reussie !</h1>
            <p>Tu peux fermer cet onglet.</p>
            <p>Refresh token sauvegarde dans .env</p>
            <p>Lance maintenant : <code>node scripts/sync-analytics.mjs --discover</code></p>
          `);

          resolve(tokens.access_token);
          server.close();
        } catch(e) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<h1>❌ Erreur</h1><p>${e.message}</p>`);
          reject(e);
          server.close();
        }
      }
    });

    server.listen(REDIRECT_PORT, () => {
      console.log(`🌐 Serveur callback pret sur http://localhost:${REDIRECT_PORT}`);
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      console.error('\n❌ Timeout — pas de callback recu');
      server.close();
      reject(new Error('Timeout'));
    }, 120000);
  });
}

function appendToEnv(key, value) {
  let content = '';
  try { content = readFileSync(ENV_PATH, 'utf-8'); } catch(e) {}

  // Replace or append
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  writeFileSync(ENV_PATH, content.trim() + '\n');
}

// =============================================================================
// Auth — Service Account (preferred) ou OAuth refresh token (legacy fallback)
// =============================================================================
//
// Le service account JSON est cherché dans 3 endroits par ordre de priorité :
//   1. $GOOGLE_APPLICATION_CREDENTIALS (variable d'env standard Google)
//      → recommandé : un seul JSON centralisé pour tous tes projets.
//      → set via : [Environment]::SetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', '<path>', 'User')
//      → typique : C:\Users\<user>\.gcloud\ga-service-account.json
//   2. secrets/ga-service-account.json (local au repo, fallback portable)
//   3. OAuth refresh token via .env (legacy, déprécié — expire dans 6 mois)

function resolveServiceAccountPath() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath && existsSync(envPath)) return envPath;
  const localPath = join(PROJECT_ROOT, 'secrets', 'ga-service-account.json');
  if (existsSync(localPath)) return localPath;
  return null;
}

function base64UrlEncode(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getServiceAccountToken() {
  const saPath = resolveServiceAccountPath();
  if (!saPath) throw new Error('Service account JSON introuvable (ni $GOOGLE_APPLICATION_CREDENTIALS ni secrets/ga-service-account.json)');
  const sa = JSON.parse(readFileSync(saPath, 'utf-8'));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: SCOPES,
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${headerB64}.${payloadB64}`;

  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(sa.private_key);
  const jwt = `${unsigned}.${base64UrlEncode(signature)}`;

  const r = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await r.json();
  if (data.error) throw new Error(`Service account auth error: ${data.error_description || data.error}`);
  return data.access_token;
}

async function getOAuthToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await r.json();
  if (data.error) throw new Error(`OAuth refresh error: ${data.error_description || data.error}`);
  return data.access_token;
}

async function getAccessToken() {
  // Préfère service account si dispo (plus de refresh token qui expire)
  const saPath = resolveServiceAccountPath();
  if (saPath) {
    console.log(`🔑 Auth via service account (${saPath})`);
    return getServiceAccountToken();
  }
  console.log('🔑 Auth via OAuth refresh token (legacy)');
  return getOAuthToken();
}

// =============================================================================
// Discover — List GA4 properties and GSC sites
// =============================================================================

async function discover(token) {
  console.log('\n🔍 Recherche des comptes GA4 et sites GSC...\n');

  // GA4 — List account summaries
  console.log('📊 GA4 Properties:');
  console.log('─'.repeat(60));
  try {
    const r = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await r.json();

    if (data.accountSummaries) {
      for (const account of data.accountSummaries) {
        console.log(`\n  Account: ${account.displayName} (${account.account})`);
        for (const prop of (account.propertySummaries || [])) {
          const isGlp1 = prop.displayName?.toLowerCase().includes('glp') ||
                         prop.property?.includes('glp');
          const marker = isGlp1 ? ' ← 🎯' : '';
          console.log(`    ${prop.property} — ${prop.displayName}${marker}`);
        }
      }
    } else {
      console.log('  Aucun compte trouve. Verifie que ton compte Google a acces a GA4.');
      if (data.error) console.log(`  Erreur: ${data.error.message}`);
    }
  } catch(e) {
    console.error(`  Erreur GA4: ${e.message}`);
  }

  // GSC — List sites
  console.log('\n\n🔍 GSC Sites:');
  console.log('─'.repeat(60));
  try {
    const r = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await r.json();

    if (data.siteEntry) {
      for (const site of data.siteEntry) {
        const isGlp1 = site.siteUrl?.includes('glp');
        const marker = isGlp1 ? ' ← 🎯' : '';
        console.log(`  ${site.siteUrl} (${site.permissionLevel})${marker}`);
      }
    } else {
      console.log('  Aucun site trouve. Verifie que ton compte a acces a GSC.');
    }
  } catch(e) {
    console.error(`  Erreur GSC: ${e.message}`);
  }

  console.log('\n\n📋 Ajoute dans .env :');
  console.log('   GA4_PROPERTY_ID=properties/XXXXXXX');
  console.log('   GSC_SITE_URL=https://glp1-france.com');
  console.log('\nPuis lance : node scripts/sync-analytics.mjs');
}

// =============================================================================
// Supabase helpers
// =============================================================================

async function sbUpsert(table, rows, onConflict) {
  if (!rows.length) return;
  const url = onConflict
    ? `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`
    : `${SUPABASE_URL}/rest/v1/${table}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(rows)
  });
  if (!r.ok) console.error(`  ❌ Upsert ${table}: ${await r.text()}`);
  else console.log(`  ✅ ${table}: ${rows.length} rows`);
}

// =============================================================================
// Date helpers
// =============================================================================

function dateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

function slugFromPath(path) {
  return path.replace(/^\//, '').replace(/\/$/, '').replace(/\/index\.html$/, '') || null;
}

// =============================================================================
// GA4 — Google Analytics Data API v1
// =============================================================================

async function fetchGA4(token, days) {
  console.log(`\n📊 GA4 — Fetching ${days} days...`);

  const { start, end } = dateRange(days);

  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'date' },
        { name: 'sessionDefaultChannelGroup' }
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'newUsers' }
      ],
      limit: 10000,
      dimensionFilter: {
        notExpression: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: { matchType: 'CONTAINS', value: '/admin' }
          }
        }
      }
    })
  });

  if (!r.ok) {
    console.error(`  ❌ GA4 API error: ${await r.text()}`);
    return [];
  }

  const data = await r.json();
  const rows = (data.rows || []).map(row => ({
    page_path: row.dimensionValues[0].value,
    date: row.dimensionValues[1].value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
    source: row.dimensionValues[2].value.toLowerCase(),
    article_slug: slugFromPath(row.dimensionValues[0].value),
    pageviews: parseInt(row.metricValues[0].value) || 0,
    sessions: parseInt(row.metricValues[1].value) || 0,
    avg_time_on_page: parseFloat(row.metricValues[2].value) || 0,
    bounce_rate: parseFloat(row.metricValues[3].value) || 0,
    new_users: parseInt(row.metricValues[4].value) || 0,
    synced_at: new Date().toISOString()
  }));

  console.log(`  📈 ${rows.length} rows fetched`);
  return rows;
}

// =============================================================================
// GSC — Google Search Console API
// =============================================================================

async function fetchGSC(token, days) {
  console.log(`\n🔍 GSC — Fetching ${days} days...`);

  const { start, end } = dateRange(days);

  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate: start,
      endDate: end,
      dimensions: ['page', 'query', 'date'],
      rowLimit: 25000,
      dimensionFilterGroups: [{
        filters: [{
          dimension: 'page',
          operator: 'notContains',
          expression: '/admin'
        }]
      }]
    })
  });

  if (!r.ok) {
    console.error(`  ❌ GSC API error: ${await r.text()}`);
    return [];
  }

  const data = await r.json();
  const allRows = (data.rows || []).map(row => {
    const pagePath = new URL(row.keys[0]).pathname;
    return {
      page_path: pagePath,
      query: row.keys[1],
      date: row.keys[2],
      article_slug: slugFromPath(pagePath),
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
      synced_at: new Date().toISOString()
    };
  });

  // Keep only rows from the top 500 pages by impressions to limit Supabase disk IO
  const pageImpressions = new Map();
  for (const row of allRows) {
    pageImpressions.set(row.page_path, (pageImpressions.get(row.page_path) || 0) + row.impressions);
  }
  const top500Pages = new Set(
    [...pageImpressions.entries()].sort((a, b) => b[1] - a[1]).slice(0, 500).map(([p]) => p)
  );
  const rows = allRows.filter(r => top500Pages.has(r.page_path));

  console.log(`  🔎 ${rows.length} rows fetched (${allRows.length} total, capped to top ${top500Pages.size} pages)`);
  return rows;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('📡 Sync Analytics → Supabase');
  console.log('='.repeat(60));

  // Service account prioritaire — OAuth n'est requis QUE s'il n'y a pas de SA.
  const hasServiceAccount = !!resolveServiceAccountPath();

  // Check OAuth credentials (uniquement si pas de service account)
  if (!hasServiceAccount && (!CLIENT_ID || !CLIENT_SECRET)) {
    console.error('\n❌ Ajoute dans .env :');
    console.error('   GOOGLE_CLIENT_ID=ton-client-id');
    console.error('   GOOGLE_CLIENT_SECRET=ton-client-secret');
    console.error('   (ou fournis un service account via $GOOGLE_APPLICATION_CREDENTIALS)');
    process.exit(1);
  }

  // Mode --setup : first-time OAuth flow
  if (SETUP_MODE) {
    const token = await oauthSetup();
    if (DISCOVER_MODE) await discover(token);
    return;
  }

  // Check refresh token (uniquement si pas de service account)
  if (!hasServiceAccount && !REFRESH_TOKEN) {
    console.error('\n❌ Pas de GOOGLE_REFRESH_TOKEN dans .env');
    console.error('   Lance d\'abord : node scripts/sync-analytics.mjs --setup');
    process.exit(1);
  }

  // Get access token
  console.log('\n🔐 Authentification Google...');
  const token = await getAccessToken();
  console.log('  ✅ Authentifie');

  // Mode --discover : list accounts
  if (DISCOVER_MODE) {
    await discover(token);
    return;
  }

  // Check GA4 + GSC config
  if (!GA4_PROPERTY_ID || !GSC_SITE_URL) {
    console.error('\n❌ Ajoute dans .env :');
    console.error('   GA4_PROPERTY_ID=properties/XXXXXXX');
    console.error('   GSC_SITE_URL=https://glp1-france.com');
    console.error('\n   Lance : node scripts/sync-analytics.mjs --discover pour trouver les IDs');
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('\n❌ Ajoute dans .env : SUPABASE_URL et SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log(`   Period: last ${DAYS} days`);
  console.log(`   GA4: ${GA4_PROPERTY_ID}`);
  console.log(`   GSC: ${GSC_SITE_URL}`);

  // Fetch data
  const [gaRows, gscRows] = await Promise.all([
    fetchGA4(token, DAYS),
    fetchGSC(token, DAYS)
  ]);

  // Upsert to Supabase (batch by 500)
  console.log('\n💾 Syncing to Supabase...');

  for (let i = 0; i < gaRows.length; i += 500) {
    await sbUpsert('ga_metrics', gaRows.slice(i, i + 500), 'page_path,date,source');
  }

  for (let i = 0; i < gscRows.length; i += 500) {
    await sbUpsert('gsc_metrics', gscRows.slice(i, i + 500), 'page_path,query,date');
  }

  console.log('\n✅ Sync terminee !');
  console.log(`   GA4: ${gaRows.length} rows`);
  console.log(`   GSC: ${gscRows.length} rows`);
  console.log('='.repeat(60));

  // Fail-fast : GSC a toujours des lignes en fonctionnement normal.
  // 0 ligne = API en erreur (403 permissions, quota…) — on fait echouer le job
  // pour que la panne soit visible dans GitHub Actions au lieu de rester verte
  // (panne du 10-17/08/2026 masquee 6 jours par un exit 0).
  if (gscRows.length === 0) {
    console.error('❌ GSC: 0 rows — la sync GSC a echoue (voir erreur API plus haut). Exit 1.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
