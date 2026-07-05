#!/usr/bin/env node
// =============================================================================
// GLP-1 Prospection — Scrape, Verify, Send, Learn
// Usage: node scripts/prospection.mjs [scrape|verify|send|report|all]
// =============================================================================
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createTransport } from 'nodemailer';
import dns from 'dns/promises';
import dnsSync from 'dns';
import net from 'net';

// Force Google DNS to avoid local resolver issues
dnsSync.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPA_URL, SUPA_KEY);

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER || 'robin@glp1-france.fr';
const SMTP_PASS = process.env.SMTP_PASS;
const REPORT_EMAIL = 'robinallainmkg@gmail.com';
const FROM_NAME = 'Robin Allain — GLP-1 France';
const FROM_EMAIL = SMTP_USER;
const SITE_URL = 'https://glp1-france.fr';

// Warmup schedule: days since first send → daily limit
const WARMUP_SCHEDULE = [
  { maxDays: 7, limit: 10 },
  { maxDays: 14, limit: 25 },
  { maxDays: 21, limit: 50 },
  { maxDays: Infinity, limit: 100 },
];

const transporter = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

// =============================================================================
// SCRAPE — Find prospect emails from Google & websites
// =============================================================================
const SEARCH_QUERIES = [
  // Pharmacies en ligne — par médicament
  { q: 'pharmacie en ligne ozempic France contact email', type: 'pharmacie_en_ligne' },
  { q: 'pharmacie en ligne wegovy achat France', type: 'pharmacie_en_ligne' },
  { q: 'pharmacie en ligne mounjaro tirzepatide France', type: 'pharmacie_en_ligne' },
  { q: 'pharmacie en ligne saxenda liraglutide', type: 'pharmacie_en_ligne' },
  { q: 'pharmacie en ligne perte de poids médicament', type: 'pharmacie_en_ligne' },
  { q: 'pharmacie agréée vente en ligne minceur France', type: 'pharmacie_en_ligne' },
  { q: 'pharmacie en ligne diabète type 2 traitement', type: 'pharmacie_en_ligne' },
  { q: 'acheter compléments perte de poids pharmacie en ligne', type: 'pharmacie_en_ligne' },
  // Parapharmacies / compléments
  { q: 'parapharmacie minceur compléments brûleur France', type: 'parapharmacie' },
  { q: 'boutique compléments alimentaires régime France', type: 'parapharmacie' },
  { q: 'alternative naturelle ozempic complément alimentaire', type: 'parapharmacie' },
  { q: 'berbérine complément minceur boutique France', type: 'parapharmacie' },
  { q: 'compléments coupe faim naturel boutique en ligne', type: 'parapharmacie' },
  { q: 'programme minceur livraison repas France', type: 'parapharmacie' },
  { q: 'substitut repas protéiné régime boutique', type: 'parapharmacie' },
  { q: 'konjac glucomannane complément perte poids', type: 'parapharmacie' },
  // Cliniques / Téléconsultation
  { q: 'téléconsultation perte de poids médecin France', type: 'clinique_teleconsultation' },
  { q: 'médecin prescripteur ozempic wegovy téléconsultation', type: 'clinique_teleconsultation' },
  { q: 'clinique obésité traitement France contact', type: 'clinique_teleconsultation' },
  { q: 'nutritionniste en ligne consultation perte de poids', type: 'clinique_teleconsultation' },
  { q: 'coaching minceur en ligne programme personnalisé', type: 'clinique_teleconsultation' },
  { q: 'plateforme santé prescription perte de poids', type: 'clinique_teleconsultation' },
  { q: 'diététicien en ligne consultation France', type: 'clinique_teleconsultation' },
  { q: 'centre amaigrissement cure minceur France', type: 'clinique_teleconsultation' },
  // Par ville (gros marchés)
  { q: 'pharmacie perte de poids Paris contact', type: 'pharmacie_en_ligne' },
  { q: 'clinique minceur Lyon téléconsultation', type: 'clinique_teleconsultation' },
  { q: 'nutritionniste perte de poids Marseille', type: 'clinique_teleconsultation' },
  { q: 'pharmacie en ligne Toulouse minceur', type: 'pharmacie_en_ligne' },
  { q: 'centre obésité Bordeaux contact', type: 'clinique_teleconsultation' },
  { q: 'diététicien Lille consultation en ligne', type: 'clinique_teleconsultation' },
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const EXCLUDED_DOMAINS = new Set([
  'example.com', 'sentry.io', 'google.com', 'facebook.com', 'twitter.com',
  'instagram.com', 'youtube.com', 'linkedin.com', 'wikipedia.org', 'w3.org',
  'schema.org', 'cloudflare.com', 'amazonaws.com', 'glp1-france.fr',
  'wixpress.com', 'shopify.com', 'wordpress.com', 'gravatar.com',
]);

// Emails génériques sans valeur business — on veut des décideurs, pas des boîtes SAV
const GENERIC_PREFIXES = new Set([
  'noreply', 'no-reply', 'mailer-daemon', 'postmaster', 'abuse', 'webmaster',
  'service.client', 'service-client', 'serviceclient', 'sav',
  'support', 'help', 'assistance', 'aide',
  'newsletter', 'news', 'marketing',
  'recrutement', 'rh', 'hr', 'jobs', 'careers',
  'legal', 'juridique', 'rgpd', 'dpo', 'privacy',
  'admin', 'root', 'hostmaster', 'billing', 'facturation',
  'unsubscribe', 'bounce', 'feedback',
]);

function isValidProspectEmail(email) {
  const lower = email.toLowerCase().trim();
  const [localPart, domain] = lower.split('@');
  if (!domain) return false;
  if (EXCLUDED_DOMAINS.has(domain)) return false;
  // Generic prefixes = no decision maker behind
  if (GENERIC_PREFIXES.has(localPart)) return false;
  // Must have real TLD
  if (!/\.[a-z]{2,}$/.test(domain)) return false;
  // Filter out image filenames caught by regex
  if (/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)$/i.test(lower)) return false;
  // Filter out Sentry DSNs and technical URLs
  if (domain.includes('sentry.io') || domain.includes('ingest.')) return false;
  // Filter out malformed emails
  if (/u003e|\\u/.test(email) || lower.length > 60) return false;
  // Domain parts must be valid
  if (domain.split('.').some(p => p.length === 0 || p.length > 30)) return false;
  return true;
}

async function fetchPage(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
  finally { clearTimeout(timer); }
}

function extractEmails(html) {
  if (!html) return [];
  const found = html.match(EMAIL_REGEX) || [];
  // Deduplicate case-insensitive
  const seen = new Set();
  return found.filter(e => {
    const lower = e.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return isValidProspectEmail(e);
  });
}

function extractCompanyName(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return host.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  } catch { return null; }
}

async function searchWeb(query) {
  // DuckDuckGo HTML POST — reliable, no API key needed
  try {
    const res = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `q=${encodeURIComponent(query)}`,
    });
    if (!res.ok) return [];
    const html = await res.text();

    const urls = [...html.matchAll(/class="result__a" href="(https?:\/\/[^"]+)"/g)]
      .map(m => m[1])
      .filter(u => !u.includes('duckduckgo.') && !u.includes('google.') && !u.includes('youtube.') && !u.includes('wikipedia.') && !u.includes('glp1-france.fr'));

    return [...new Set(urls)].slice(0, 10);
  } catch { return []; }
}

// DIRECT TARGETS — Only businesses that have a REAL connection to GLP-1 / weight loss
// No generic pharmacies, no supermarkets, no pure SAV emails
const DIRECT_TARGETS = [
  // === Pharmacies en ligne avec rayon minceur/diabète ===
  { url: 'https://www.pharma-gdd.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.pharmashopi.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.lasante.net', type: 'pharmacie_en_ligne' },
  { url: 'https://www.illicopharma.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.pharmarket.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.shop-pharmacie.fr', type: 'pharmacie_en_ligne' },
  { url: 'https://www.easyparapharmacie.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.doctipharma.fr', type: 'pharmacie_en_ligne' },
  { url: 'https://www.moncoinsante.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.cocooncenter.com', type: 'pharmacie_en_ligne' },

  // === Compléments minceur / alternatives GLP-1 naturelles ===
  { url: 'https://www.weightworld.fr', type: 'parapharmacie' },
  { url: 'https://www.nutrimea.com', type: 'parapharmacie' },
  { url: 'https://www.nutriandco.com', type: 'parapharmacie' },
  { url: 'https://www.dynveo.fr', type: 'parapharmacie' },
  { url: 'https://www.nutripure.fr', type: 'parapharmacie' },
  { url: 'https://www.anastore.com', type: 'parapharmacie' },
  { url: 'https://www.biovea.com', type: 'parapharmacie' },
  { url: 'https://www.naturalforme.fr', type: 'parapharmacie' },
  { url: 'https://www.herboristerie-moderne.fr', type: 'parapharmacie' },
  { url: 'https://www.dieti-natura.com', type: 'parapharmacie' },

  // === Téléconsultation / cliniques perte de poids ===
  { url: 'https://www.charles.co', type: 'clinique_teleconsultation' },  // santé homme, prescrit GLP-1
  { url: 'https://www.mia.co', type: 'clinique_teleconsultation' },      // santé femme, perte de poids
  { url: 'https://www.feeli.io', type: 'clinique_teleconsultation' },    // téléconsultation généraliste
  { url: 'https://www.hellocare.com', type: 'clinique_teleconsultation' },
  { url: 'https://www.medadom.com', type: 'clinique_teleconsultation' },
  { url: 'https://www.concilio.com', type: 'clinique_teleconsultation' },
  { url: 'https://www.qare.fr', type: 'clinique_teleconsultation' },
  { url: 'https://www.livi.fr', type: 'clinique_teleconsultation' },

  // === Cliniques obésité / centres spécialisés ===
  { url: 'https://www.rnpc.fr', type: 'clinique_teleconsultation' },
  { url: 'https://www.naturhouse.fr', type: 'clinique_teleconsultation' },
  { url: 'https://www.dietbon.com', type: 'parapharmacie' },
  { url: 'https://www.cheef.fr', type: 'parapharmacie' },
  { url: 'https://www.kitchendiet.fr', type: 'parapharmacie' },
  { url: 'https://www.comme-jaime.fr', type: 'parapharmacie' },
  { url: 'https://www.linecoaching.com', type: 'clinique_teleconsultation' },

  // === Pharmacies en ligne (vague 2) ===
  { url: 'https://www.pharmacie-du-centre.fr', type: 'pharmacie_en_ligne' },
  { url: 'https://www.parapharmadirect.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.santediscount.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.pharmacie-lafayette.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.pharmacie-prado-mermoz.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.pharmaciedesteinfort.com', type: 'pharmacie_en_ligne' },
  { url: 'https://www.mapharma.fr', type: 'pharmacie_en_ligne' },
  { url: 'https://www.universpharmacie.fr', type: 'pharmacie_en_ligne' },
  { url: 'https://www.1001beauty.fr', type: 'parapharmacie' },
  { url: 'https://www.pharmasimple.com', type: 'pharmacie_en_ligne' },

  // === Compléments minceur (vague 2) ===
  { url: 'https://www.yvery.com', type: 'parapharmacie' },
  { url: 'https://www.myprotein.fr', type: 'parapharmacie' },
  { url: 'https://www.bulk.com/fr', type: 'parapharmacie' },
  { url: 'https://www.toutelanutrition.com', type: 'parapharmacie' },
  { url: 'https://www.foodspring.fr', type: 'parapharmacie' },
  { url: 'https://www.supersmart.com', type: 'parapharmacie' },
  { url: 'https://www.vitall-plus.com', type: 'parapharmacie' },
  { url: 'https://www.cell-innov.com', type: 'parapharmacie' },
  { url: 'https://www.unae.fr', type: 'parapharmacie' },
  { url: 'https://www.holistica.fr', type: 'parapharmacie' },

  // === Téléconsultation / cliniques (vague 2) ===
  { url: 'https://www.noomhealth.com', type: 'clinique_teleconsultation' },
  { url: 'https://www.oviva.com/fr', type: 'clinique_teleconsultation' },
  { url: 'https://www.biloba.fr', type: 'clinique_teleconsultation' },
  { url: 'https://www.mnm-coaching.com', type: 'clinique_teleconsultation' },
  { url: 'https://www.methodelaurentphilip.fr', type: 'clinique_teleconsultation' },
  { url: 'https://www.mapatho.com', type: 'clinique_teleconsultation' },
  { url: 'https://www.betterise.me', type: 'clinique_teleconsultation' },
  { url: 'https://www.deuxiemeavis.fr', type: 'clinique_teleconsultation' },
  { url: 'https://www.sante-pratique-paris.fr', type: 'clinique_teleconsultation' },
];

async function scrapeContactPage(siteUrl) {
  // Try common contact page paths
  const base = new URL(siteUrl).origin;
  const paths = ['/contact', '/nous-contacter', '/contactez-nous', '/a-propos', '/mentions-legales', '/qui-sommes-nous', ''];
  const emails = new Set();

  for (const path of paths) {
    const html = await fetchPage(base + path);
    for (const email of extractEmails(html || '')) {
      emails.add(email);
    }
    if (emails.size > 0) break; // Got emails, stop
    await sleep(1000);
  }
  return [...emails];
}

async function insertProspect(email, company, website, type, sourceUrl) {
  const { data: existing } = await supabase
    .from('prospects')
    .select('id')
    .eq('email', email)
    .limit(1);

  if (existing?.length) return 'skipped';

  const { error } = await supabase.from('prospects').insert({
    email,
    company,
    website,
    prospect_type: type,
    source_url: sourceUrl,
    status: 'new',
  });

  if (!error) return 'new';
  if (error.code === '23505') return 'skipped';
  return 'error: ' + error.message;
}

async function runScrape() {
  let totalNew = 0;
  let totalSkipped = 0;

  // --- Phase 1: Direct targets (most reliable) ---
  // Pick 8-10 random targets each run to avoid scraping all every time
  const shuffledTargets = DIRECT_TARGETS.sort(() => Math.random() - 0.5);
  const targets = shuffledTargets.slice(0, 10);

  console.log(`🎯 Scraping ${targets.length} sites directs...\n`);

  for (const { url, type } of targets) {
    const company = extractCompanyName(url);
    console.log(`  🔎 ${company} (${url})`);
    const emails = await scrapeContactPage(url);

    if (emails.length === 0) {
      console.log(`     ⚠️ Aucun email trouvé`);
    }

    for (const email of emails) {
      const result = await insertProspect(email, company, new URL(url).origin, type, url);
      if (result === 'new') {
        console.log(`     ✅ Nouveau: ${email}`);
        totalNew++;
      } else if (result === 'skipped') {
        totalSkipped++;
      } else {
        console.log(`     ⚠️ ${email}: ${result}`);
      }
    }

    await sleep(1500);
  }

  // --- Phase 2: DuckDuckGo search ---
  const shuffledQueries = SEARCH_QUERIES.sort(() => Math.random() - 0.5);
  const queries = shuffledQueries.slice(0, 8);

  console.log(`\n🔍 Scraping ${queries.length} requêtes DuckDuckGo...\n`);

  for (const { q, type } of queries) {
    console.log(`  🔎 "${q}" (${type})`);
    const urls = await searchWeb(q);
    console.log(`     ${urls.length} résultats trouvés`);

    for (const url of urls) {
      const emails = await scrapeContactPage(url);
      const company = extractCompanyName(url);

      for (const email of emails) {
        const result = await insertProspect(email, company, new URL(url).origin, type, url);
        if (result === 'new') {
          console.log(`     ✅ Nouveau: ${email} (${company || 'N/A'})`);
          totalNew++;
        } else if (result === 'skipped') {
          totalSkipped++;
        } else {
          console.log(`     ⚠️ ${email}: ${result}`);
        }
      }

      await sleep(2000);
    }

    await sleep(3000);
  }

  console.log(`\n📊 Scraping terminé: ${totalNew} nouveaux prospects, ${totalSkipped} doublons ignorés`);
}

// =============================================================================
// SMTP Email Verification
// =============================================================================
async function verifyEmailSMTP(email) {
  const domain = email.split('@')[1];

  // Step 1: Check MX records (fast, always works)
  let mxRecords;
  try {
    mxRecords = await dns.resolveMx(domain);
    if (!mxRecords.length) return { valid: false, reason: 'no_mx' };
  } catch (e) {
    // Try A record fallback (some domains don't have MX but accept mail)
    try {
      await dns.resolve4(domain);
      // Domain exists but no MX — could still accept mail, mark as valid (MX-only)
      return { valid: true, reason: 'mx_fallback_a_record' };
    } catch {
      return { valid: false, reason: 'domain_not_found' };
    }
  }

  // Step 2: Try SMTP RCPT TO verification (may fail if port 25 blocked)
  const mx = mxRecords.sort((a, b) => a.priority - b.priority)[0].exchange;

  try {
    const smtpResult = await new Promise((resolve) => {
      const socket = net.createConnection(25, mx);
      let step = 0;

      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({ valid: null, reason: 'smtp_timeout' }); // null = inconclusive
      }, 8000);

      socket.on('data', (data) => {
        const response = data.toString();
        if (step === 0 && response.startsWith('220')) {
          socket.write(`EHLO glp1-france.fr\r\n`);
          step = 1;
        } else if (step === 1 && response.startsWith('250')) {
          socket.write(`MAIL FROM:<verify@glp1-france.fr>\r\n`);
          step = 2;
        } else if (step === 2 && response.startsWith('250')) {
          socket.write(`RCPT TO:<${email}>\r\n`);
          step = 3;
        } else if (step === 3) {
          clearTimeout(timeout);
          socket.write('QUIT\r\n');
          socket.end();
          resolve({ valid: response.startsWith('250'), reason: response.startsWith('250') ? 'smtp_ok' : 'smtp_rejected' });
        }
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        resolve({ valid: null, reason: 'smtp_connection_error' }); // null = inconclusive
      });
    });

    // If SMTP gave a definitive answer, use it
    if (smtpResult.valid !== null) return smtpResult;

    // SMTP inconclusive (port 25 blocked) — MX exists, so trust that
    return { valid: true, reason: 'mx_valid_smtp_blocked' };
  } catch {
    // SMTP failed entirely, but MX exists — trust MX
    return { valid: true, reason: 'mx_valid_smtp_error' };
  }
}

// =============================================================================
// VERIFY command — check unverified prospects
// =============================================================================
async function runVerify() {
  const { data: prospects } = await supabase
    .from('prospects')
    .select('id, email')
    .eq('status', 'new')
    .is('smtp_valid', null)
    .limit(50);

  if (!prospects?.length) {
    console.log('Aucun prospect à vérifier');
    return;
  }

  console.log(`${prospects.length} emails à vérifier...`);
  for (const p of prospects) {
    const result = await verifyEmailSMTP(p.email);
    console.log(`  ${p.email}: ${result.valid ? '✅' : '❌'} (${result.reason})`);

    await supabase.from('prospects').update({
      smtp_valid: result.valid,
      smtp_checked_at: new Date().toISOString(),
      status: result.valid ? 'verified' : 'invalid',
    }).eq('id', p.id);

    // Rate limit SMTP checks
    await sleep(2000);
  }
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================
function getTemplate(prospect, campaign, variant) {
  const subject = variant === 'a' ? campaign.subject_a : (campaign.subject_b || campaign.subject_a);
  const filledSubject = subject
    .replace('{company}', prospect.company || 'votre pharmacie')
    .replace('{name}', prospect.name || 'Madame, Monsieur');

  // Supabase Edge Function tracking
  const TRACK_BASE = 'https://ywekaivgjzsmdocchvum.supabase.co/functions/v1/track';
  const trackPixel = `<img src="${TRACK_BASE}/open?sid=${prospect.id}&cid=${campaign.id}" width="1" height="1" style="display:none" alt="">`;

  // Tracked link helper — redirects through Edge Function for click tracking
  const trackedLink = (targetUrl) => {
    const encoded = encodeURIComponent(targetUrl);
    return `${TRACK_BASE}/click?sid=${prospect.id}&cid=${campaign.id}&url=${encoded}`;
  };

  // UTM wrapper for final destination URLs
  const utm = `utm_source=prospection&utm_medium=email&utm_campaign=${campaign.name}&utm_content=${variant}`;
  const siteLink = trackedLink(`${SITE_URL}/?${utm}`);
  const diagLink = trackedLink(`${SITE_URL}/guides/quel-traitement-glp1-choisir/?${utm}`);

  const templates = {
    pharmacie: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.7;">
  <p>Bonjour${prospect.name ? ' ' + prospect.name : ''},</p>

  <p>Je me permets de vous contacter car j'ai découvert ${prospect.company || 'votre pharmacie en ligne'}${prospect.website ? ' (' + prospect.website + ')' : ''} et votre gamme liée aux traitements de perte de poids.</p>

  <p>Je suis le fondateur de <a href="${siteLink}" style="color: #2563eb; text-decoration: none; font-weight: 600;">GLP-1 France</a>, le site de référence francophone sur les traitements GLP-1 (Ozempic, Wegovy, Mounjaro, ...).</p>

  <p><strong>Quelques chiffres :</strong></p>
  <ul style="padding-left: 1.2em;">
    <li>📊 <strong>50 000 visiteurs/mois</strong> — des patients qui cherchent activement un traitement GLP-1</li>
    <li>🎯 <strong>500 diagnostics complétés/mois</strong> — des leads ultra-qualifiés avec profil médical</li>
    <li>🏥 Audience 100% française, majoritairement 35-60 ans</li>
  </ul>

  <p>Je cherche des partenaires pharmaciens pour leur <strong>transmettre ces patients qualifiés</strong>. Concrètement : une personne complète notre diagnostic en ligne, on identifie le traitement adapté, et on la redirige vers votre pharmacie.</p>

  <p>Est-ce qu'un créneau de 15 minutes cette semaine vous conviendrait pour en discuter ?</p>

  <p>Bien cordialement,</p>

  <p style="margin-bottom: 0.25em;"><strong>Robin Allain</strong></p>
  <p style="margin-top: 0; color: #64748b; font-size: 0.9em;">
    Fondateur — <a href="${siteLink}" style="color: #2563eb; text-decoration: none;">GLP-1 France</a><br>
    robin@glp1-france.fr
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0 0.5em;">
  <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">
    Si vous ne souhaitez plus recevoir nos messages, <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(prospect.email)}" style="color: #94a3b8;">cliquez ici</a>.
  </p>
  ${trackPixel}
</div>`,

    parapharmacie: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.7;">
  <p>Bonjour${prospect.name ? ' ' + prospect.name : ''},</p>

  <p>Je tombe sur ${prospect.company || 'votre boutique'}${prospect.website ? ' (' + prospect.website + ')' : ''} et je vois que vous proposez des produits liés à la perte de poids et au bien-être.</p>

  <p>Chez <a href="${siteLink}" style="color: #2563eb; text-decoration: none; font-weight: 600;">GLP-1 France</a>, on informe chaque mois <strong>50 000 visiteurs</strong> sur les traitements GLP-1 et les alternatives naturelles (berbérine, chrome, probiotiques...).</p>

  <p>Une bonne partie de notre audience cherche justement des <strong>compléments alimentaires</strong> pour accompagner ou remplacer les traitements médicaux. On a <strong>500 diagnostics par mois</strong> avec des profils détaillés.</p>

  <p>L'idée serait simple : on recommande vos produits aux visiteurs dont le profil correspond, en échange d'une commission ou d'un partenariat fixe.</p>

  <p>Ça vous dirait qu'on en parle 15 minutes ?</p>

  <p>À bientôt,</p>

  <p style="margin-bottom: 0.25em;"><strong>Robin Allain</strong></p>
  <p style="margin-top: 0; color: #64748b; font-size: 0.9em;">
    Fondateur — <a href="${siteLink}" style="color: #2563eb; text-decoration: none;">GLP-1 France</a><br>
    robin@glp1-france.fr
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0 0.5em;">
  <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">
    Si vous ne souhaitez plus recevoir nos messages, <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(prospect.email)}" style="color: #94a3b8;">cliquez ici</a>.
  </p>
  ${trackPixel}
</div>`,

    clinique: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.7;">
  <p>Bonjour${prospect.name ? ' ' + prospect.name : ''},</p>

  <p>Je me permets de vous écrire car j'ai vu que ${prospect.company || 'votre clinique'}${prospect.website ? ' (' + prospect.website + ')' : ''} propose des consultations liées à la perte de poids ou à la prescription de GLP-1.</p>

  <p>Je gère <a href="${siteLink}" style="color: #2563eb; text-decoration: none; font-weight: 600;">GLP-1 France</a>, le premier site d'information francophone sur les traitements GLP-1. On reçoit <strong>50 000 visiteurs par mois</strong> et <strong>500 personnes complètent notre diagnostic en ligne chaque mois</strong>.</p>

  <p>Ces patients sont <strong>déjà informés et motivés</strong> — ils cherchent un médecin prescripteur. Aujourd'hui, on les oriente vers des ressources génériques, mais j'aimerais pouvoir les diriger vers des praticiens comme vous.</p>

  <p><strong>Le deal :</strong> on vous envoie des patients qualifiés (diagnostic complété, profil médical renseigné), vous les recevez en consultation. On discute du modèle ensemble.</p>

  <p>Disponible pour un appel de 15 minutes cette semaine ?</p>

  <p>Bien cordialement,</p>

  <p style="margin-bottom: 0.25em;"><strong>Robin Allain</strong></p>
  <p style="margin-top: 0; color: #64748b; font-size: 0.9em;">
    Fondateur — <a href="${siteLink}" style="color: #2563eb; text-decoration: none;">GLP-1 France</a><br>
    robin@glp1-france.fr
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0 0.5em;">
  <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">
    Si vous ne souhaitez plus recevoir nos messages, <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(prospect.email)}" style="color: #94a3b8;">cliquez ici</a>.
  </p>
  ${trackPixel}
</div>`
  };

  const templateMap = {
    pharmacie_en_ligne: 'pharmacie',
    parapharmacie: 'parapharmacie',
    clinique_teleconsultation: 'clinique',
  };

  const key = templateMap[prospect.prospect_type] || campaign.template_key || 'pharmacie';
  return { subject: filledSubject, html: templates[key] || templates.pharmacie };
}

// =============================================================================
// FOLLOW-UP TEMPLATES (J+3, J+7, J+14)
// =============================================================================
const FOLLOWUP_DELAYS = [3, 7, 14]; // days after initial send

function getFollowUpTemplate(prospect, campaign, step) {
  const TRACK_BASE = 'https://ywekaivgjzsmdocchvum.supabase.co/functions/v1/track';
  const trackPixel = `<img src="${TRACK_BASE}/open?sid=${prospect.id}&cid=${campaign.id}" width="1" height="1" style="display:none" alt="">`;
  const trackedLink = (targetUrl) => `${TRACK_BASE}/click?sid=${prospect.id}&cid=${campaign.id}&url=${encodeURIComponent(targetUrl)}`;
  const utm = `utm_source=prospection&utm_medium=email&utm_campaign=${campaign.name}&utm_content=followup${step}`;
  const siteLink = trackedLink(`${SITE_URL}/?${utm}`);
  const diagLink = trackedLink(`${SITE_URL}/guides/quel-traitement-glp1-choisir/?${utm}`);

  const originalSubject = (campaign.subject_a || '')
    .replace('{company}', prospect.company || 'votre entreprise')
    .replace('{name}', prospect.name || 'Madame, Monsieur');
  const subject = `Re: ${originalSubject}`;

  const footer = `
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0 0.5em;">
  <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">
    Si vous ne souhaitez plus recevoir nos messages, <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(prospect.email)}" style="color: #94a3b8;">cliquez ici</a>.
  </p>
  ${trackPixel}`;

  const sig = `
  <p style="margin-bottom: 0.25em;"><strong>Robin Allain</strong></p>
  <p style="margin-top: 0; color: #64748b; font-size: 0.9em;">
    Fondateur — <a href="${siteLink}" style="color: #2563eb; text-decoration: none;">GLP-1 France</a><br>
    robin@glp1-france.fr
  </p>`;

  const templates = {
    // J+3 — Relance courte, curiosité
    1: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.7;">
  <p>Bonjour${prospect.name ? ' ' + prospect.name : ''},</p>

  <p>Je me permets de revenir vers vous suite à mon message de la semaine dernière.</p>

  <p>Je comprends que vous êtes probablement très sollicité — je voulais juste m'assurer que ma proposition n'était pas passée entre les mailles.</p>

  <p>Pour rappel, on gère <a href="${siteLink}" style="color: #2563eb; text-decoration: none; font-weight: 600;">GLP-1 France</a> (50K visiteurs/mois) et on cherche des partenaires pour leur rediriger nos patients qualifiés.</p>

  <p>Un rapide échange de 10 minutes vous conviendrait ?</p>

  <p>Bonne journée,</p>
  ${sig}
  ${footer}
</div>`,

    // J+7 — Angle preuve/valeur
    2: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.7;">
  <p>Bonjour${prospect.name ? ' ' + prospect.name : ''},</p>

  <p>Petit update rapide — ce mois-ci on a dépassé les <strong>500 diagnostics complétés</strong> sur <a href="${siteLink}" style="color: #2563eb; text-decoration: none;">GLP-1 France</a>.</p>

  <p>Concrètement, ça représente 500 personnes qui :</p>
  <ul style="padding-left: 1.2em;">
    <li>Cherchent activement un traitement GLP-1 (Ozempic, Wegovy, Mounjaro...)</li>
    <li>Ont renseigné leur profil médical complet</li>
    <li>Sont prêtes à passer à l'action</li>
  </ul>

  <p>Aujourd'hui ces leads ne sont dirigés vers personne en particulier. Si vous êtes intéressé, on pourrait tester un partenariat pilote sans engagement.</p>

  <p>Qu'en pensez-vous ?</p>
  ${sig}
  ${footer}
</div>`,

    // J+14 — Breakup email
    3: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.7;">
  <p>Bonjour${prospect.name ? ' ' + prospect.name : ''},</p>

  <p>Je ne veux pas vous encombrer, donc ce sera mon dernier message.</p>

  <p>Si le timing n'est pas le bon ou si ce type de partenariat ne vous intéresse pas, aucun souci — je comprends tout à fait.</p>

  <p>Si à l'avenir vous cherchez un canal d'acquisition de patients GLP-1 qualifiés, n'hésitez pas à me recontacter. Notre site continue de croître et les profils sont de plus en plus précis.</p>

  <p>Je vous souhaite une excellente continuation,</p>
  ${sig}
  ${footer}
</div>`
  };

  return { subject, html: templates[step] || templates[1] };
}

// =============================================================================
// FOLLOWUP command — send follow-up emails to non-responders
// =============================================================================
async function runFollowUp() {
  // Get warmup limit (shared with initial sends)
  const today = new Date().toISOString().split('T')[0];
  const { count: sentToday } = await supabase
    .from('prospection_sends')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', today + 'T00:00:00Z');

  const { data: firstSend } = await supabase
    .from('prospection_sends')
    .select('sent_at')
    .order('sent_at', { ascending: true })
    .limit(1);

  const daysSinceFirst = firstSend?.length
    ? Math.floor((Date.now() - new Date(firstSend[0].sent_at).getTime()) / 86400000)
    : 0;

  const warmupLimit = WARMUP_SCHEDULE.find(w => daysSinceFirst <= w.maxDays)?.limit || 10;
  const remaining = warmupLimit - (sentToday || 0);

  if (remaining <= 0) {
    console.log(`🔄 Follow-up: limite warmup atteinte (${warmupLimit}/jour)`);
    return;
  }

  // Get active campaign
  const { data: campaigns } = await supabase
    .from('prospection_campaigns')
    .select('*')
    .eq('status', 'active')
    .limit(1);

  if (!campaigns?.length) return;
  const campaign = campaigns[0];

  // Find the latest send per prospect for this campaign (max follow_up_step)
  const { data: latestSends } = await supabase
    .from('prospection_sends')
    .select('*, prospects!inner(id, email, name, company, website, prospect_type, status)')
    .eq('campaign_id', campaign.id)
    .is('replied_at', null)       // No reply
    .eq('bounced', false)         // Not bounced
    .lt('follow_up_step', 3)     // Not yet at breakup
    .order('follow_up_step', { ascending: false });

  if (!latestSends?.length) {
    console.log('🔄 Follow-up: aucun prospect éligible');
    return;
  }

  // Deduplicate: keep only the latest step per prospect
  const byProspect = new Map();
  for (const send of latestSends) {
    const pid = send.prospect_id;
    if (!byProspect.has(pid) || send.follow_up_step > byProspect.get(pid).follow_up_step) {
      byProspect.set(pid, send);
    }
  }

  // Filter by delay and prospect status
  const now = Date.now();
  const eligible = [];
  for (const [pid, send] of byProspect) {
    const prospect = send.prospects;
    if (prospect.status === 'unsubscribed' || prospect.status === 'bounced') continue;

    const nextStep = send.follow_up_step + 1;
    const delayDays = FOLLOWUP_DELAYS[nextStep - 1]; // step 1 → 3 days, step 2 → 7 days, step 3 → 14 days
    if (!delayDays) continue;

    const sentAt = new Date(send.sent_at).getTime();
    const eligibleAfter = sentAt + delayDays * 86400000;

    if (now >= eligibleAfter) {
      eligible.push({ send, prospect, nextStep });
    }
  }

  if (!eligible.length) {
    console.log('🔄 Follow-up: aucun prospect éligible (trop tôt ou tous répondus)');
    return;
  }

  const toSend = eligible.slice(0, remaining);
  console.log(`🔄 Follow-up: ${toSend.length} relances à envoyer (step ${toSend.map(e => e.nextStep).join(', ')})...\n`);

  let sent = 0;
  for (const { send, prospect, nextStep } of toSend) {
    const { subject, html } = getFollowUpTemplate(prospect, campaign, nextStep);

    try {
      const info = await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: prospect.email,
        subject,
        html,
        inReplyTo: send.message_id,
        references: send.message_id,
      });

      console.log(`  ✅ ${prospect.email} (relance ${nextStep}/3) — ${info.messageId}`);

      await supabase.from('prospection_sends').insert({
        prospect_id: prospect.id,
        campaign_id: campaign.id,
        subject_variant: send.subject_variant,
        message_id: info.messageId,
        follow_up_step: nextStep,
      });

      sent++;
    } catch (err) {
      console.log(`  ❌ ${prospect.email}: ${err.message}`);
      if (err.responseCode >= 500) {
        await supabase.from('prospects').update({ status: 'bounced' }).eq('id', prospect.id);
      }
    }

    const delay = 30000 + Math.random() * 90000;
    console.log(`  ⏳ Pause ${Math.round(delay/1000)}s...`);
    await sleep(delay);
  }

  console.log(`\n📊 Follow-up: ${sent} relances envoyées`);
}

// =============================================================================
// SEND command — send emails with warmup
// =============================================================================
async function runSend() {
  // Calculate warmup limit
  const { data: firstSend } = await supabase
    .from('prospection_sends')
    .select('sent_at')
    .order('sent_at', { ascending: true })
    .limit(1);

  const daysSinceFirst = firstSend?.length
    ? Math.floor((Date.now() - new Date(firstSend[0].sent_at).getTime()) / 86400000)
    : 0;

  const warmupLimit = WARMUP_SCHEDULE.find(w => daysSinceFirst <= w.maxDays)?.limit || 10;

  // How many sent today?
  const today = new Date().toISOString().split('T')[0];
  const { count: sentToday } = await supabase
    .from('prospection_sends')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', today + 'T00:00:00Z');

  const remaining = warmupLimit - (sentToday || 0);
  if (remaining <= 0) {
    console.log(`Limite warmup atteinte pour aujourd'hui (${warmupLimit}/jour, jour ${daysSinceFirst})`);
    return;
  }

  console.log(`📧 Warmup jour ${daysSinceFirst} — limite: ${warmupLimit}/jour — déjà envoyés: ${sentToday} — restants: ${remaining}`);

  // Get active campaign
  const { data: campaigns } = await supabase
    .from('prospection_campaigns')
    .select('*')
    .eq('status', 'active')
    .limit(1);

  if (!campaigns?.length) {
    console.log('Aucune campagne active. Créez-en une dans Supabase.');
    return;
  }
  const campaign = campaigns[0];

  // Get verified prospects not yet contacted for this campaign
  const { data: alreadySent } = await supabase
    .from('prospection_sends')
    .select('prospect_id')
    .eq('campaign_id', campaign.id);

  const sentIds = (alreadySent || []).map(s => s.prospect_id);

  let query = supabase
    .from('prospects')
    .select('*')
    .eq('status', 'verified')
    .eq('smtp_valid', true)
    .limit(remaining);

  if (sentIds.length > 0) {
    // Filter out already sent - use not.in for array filter
    query = query.not('id', 'in', `(${sentIds.join(',')})`);
  }

  // If campaign targets a specific type
  if (campaign.prospect_type) {
    query = query.eq('prospect_type', campaign.prospect_type);
  }

  const { data: prospects } = await query;

  if (!prospects?.length) {
    console.log('Aucun prospect vérifié disponible pour cette campagne.');
    return;
  }

  console.log(`${prospects.length} emails à envoyer...`);
  let sent = 0, bounced = 0;

  for (const prospect of prospects) {
    const variant = Math.random() < 0.5 ? 'a' : 'b';
    const { subject, html } = getTemplate(prospect, campaign, variant);

    try {
      const info = await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: prospect.email,
        subject,
        html,
      });

      console.log(`  ✅ ${prospect.email} (${variant.toUpperCase()}) — ${info.messageId}`);

      await supabase.from('prospection_sends').insert({
        prospect_id: prospect.id,
        campaign_id: campaign.id,
        subject_variant: variant,
        message_id: info.messageId,
      });

      await supabase.from('prospects').update({ status: 'contacted' }).eq('id', prospect.id);
      sent++;
    } catch (err) {
      console.log(`  ❌ ${prospect.email}: ${err.message}`);
      if (err.responseCode >= 500) {
        await supabase.from('prospects').update({ status: 'bounced' }).eq('id', prospect.id);
        bounced++;
      }
    }

    // Spacing between sends (30-120s random)
    const delay = 30000 + Math.random() * 90000;
    console.log(`  ⏳ Pause ${Math.round(delay/1000)}s...`);
    await sleep(delay);
  }

  // Update campaign stats
  await supabase.from('prospection_campaigns').update({
    total_sent: campaign.total_sent + sent,
    total_bounced: campaign.total_bounced + bounced,
    updated_at: new Date().toISOString(),
  }).eq('id', campaign.id);

  console.log(`\n📊 Bilan: ${sent} envoyés, ${bounced} bounced`);
}

// =============================================================================
// REPORT command — daily stats + email report
// =============================================================================
async function runReport() {
  const today = new Date().toISOString().split('T')[0];

  // Get all campaigns
  const { data: campaigns } = await supabase
    .from('prospection_campaigns')
    .select('*')
    .in('status', ['active', 'paused', 'completed']);

  if (!campaigns?.length) {
    console.log('Aucune campagne trouvée.');
    return;
  }

  let reportHtml = `
<div style="font-family: -apple-system, sans-serif; max-width: 700px; margin: 0 auto; color: #1e293b;">
  <h1 style="color: #2563eb; font-size: 1.5em;">📊 Rapport Prospection — ${today}</h1>`;

  // Stats by vertical (prospect_type)
  const { data: allSends } = await supabase
    .from('prospection_sends')
    .select('*, prospects!inner(prospect_type, email, company)')
    .order('sent_at', { ascending: false });

  const verticals = {};
  for (const send of (allSends || [])) {
    const type = send.prospects?.prospect_type || 'unknown';
    if (!verticals[type]) verticals[type] = { sent: 0, opened: 0, replied: 0, bounced: 0 };
    verticals[type].sent++;
    if (send.opened_at) verticals[type].opened++;
    if (send.replied_at) verticals[type].replied++;
    if (send.bounced) verticals[type].bounced++;
  }

  reportHtml += `<h2 style="color: #1e40af; font-size: 1.2em;">📋 Par verticale</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
    <tr style="background: #f1f5f9;"><th style="padding: 8px; text-align: left;">Verticale</th><th>Envoyés</th><th>Ouverts</th><th>Réponses</th><th>Bounce</th><th>Taux ouv.</th><th>Taux rép.</th></tr>`;

  for (const [type, stats] of Object.entries(verticals)) {
    const openRate = stats.sent ? ((stats.opened / stats.sent) * 100).toFixed(1) : '0';
    const replyRate = stats.sent ? ((stats.replied / stats.sent) * 100).toFixed(1) : '0';
    const label = { pharmacie_en_ligne: '💊 Pharmacies', parapharmacie: '🌿 Parapharmacies', clinique_teleconsultation: '🏥 Cliniques' }[type] || type;
    reportHtml += `<tr><td style="padding: 6px;">${label}</td><td style="text-align:center;">${stats.sent}</td><td style="text-align:center;">${stats.opened}</td><td style="text-align:center;">${stats.replied}</td><td style="text-align:center;">${stats.bounced}</td><td style="text-align:center;">${openRate}%</td><td style="text-align:center;">${replyRate}%</td></tr>`;
  }
  reportHtml += `</table>`;

  // Stats by hook (subject variant)
  const hooks = { a: { sent: 0, opened: 0, replied: 0 }, b: { sent: 0, opened: 0, replied: 0 } };
  for (const send of (allSends || [])) {
    const v = send.subject_variant || 'a';
    hooks[v].sent++;
    if (send.opened_at) hooks[v].opened++;
    if (send.replied_at) hooks[v].replied++;
  }

  reportHtml += `<h2 style="color: #1e40af; font-size: 1.2em;">🎯 Par hook (A/B test)</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
    <tr style="background: #f1f5f9;"><th style="padding: 8px; text-align: left;">Variante</th><th>Envoyés</th><th>Ouverts</th><th>Réponses</th><th>Taux ouv.</th></tr>`;

  for (const [v, stats] of Object.entries(hooks)) {
    if (stats.sent === 0) continue;
    const openRate = ((stats.opened / stats.sent) * 100).toFixed(1);
    const subjectLabel = campaigns[0] ? (v === 'a' ? campaigns[0].subject_a : campaigns[0].subject_b) : v.toUpperCase();
    reportHtml += `<tr><td style="padding: 6px;">${v.toUpperCase()}: "${subjectLabel || 'N/A'}"</td><td style="text-align:center;">${stats.sent}</td><td style="text-align:center;">${stats.opened}</td><td style="text-align:center;">${stats.replied}</td><td style="text-align:center;">${openRate}%</td></tr>`;
  }
  reportHtml += `</table>`;

  // Prospects chauds (replies)
  const { data: replies } = await supabase
    .from('prospection_sends')
    .select('*, prospects!inner(email, company, prospect_type)')
    .not('replied_at', 'is', null)
    .order('replied_at', { ascending: false })
    .limit(10);

  if (replies?.length) {
    reportHtml += `<h2 style="color: #16a34a; font-size: 1.2em;">🔥 Prospects chauds (réponses)</h2><ul>`;
    for (const r of replies) {
      reportHtml += `<li><strong>${r.prospects.company || r.prospects.email}</strong> — ${r.prospects.prospect_type} — répondu le ${new Date(r.replied_at).toLocaleDateString('fr-FR')}</li>`;
    }
    reportHtml += `</ul>`;
  }

  // Total stats
  const totalProspects = await supabase.from('prospects').select('id', { count: 'exact', head: true });
  const verifiedCount = await supabase.from('prospects').select('id', { count: 'exact', head: true }).eq('status', 'verified');

  reportHtml += `
  <h2 style="color: #1e40af; font-size: 1.2em;">📈 Pipeline</h2>
  <p>Total prospects : <strong>${totalProspects.count || 0}</strong> | Vérifiés en attente : <strong>${verifiedCount.count || 0}</strong></p>

  <hr style="border: none; border-top: 1px solid #e2e8f0;">
  <p style="font-size: 0.8em; color: #94a3b8;">Rapport auto-généré par l'agent Prospection GLP-1</p>
</div>`;

  // Send report email
  try {
    await transporter.sendMail({
      from: `"GLP-1 Prospection Bot" <${FROM_EMAIL}>`,
      to: REPORT_EMAIL,
      subject: `📊 Rapport Prospection GLP-1 — ${today}`,
      html: reportHtml,
    });
    console.log(`✅ Rapport envoyé à ${REPORT_EMAIL}`);
  } catch (err) {
    console.error(`❌ Erreur envoi rapport: ${err.message}`);
  }

  // Save daily stats
  for (const campaign of campaigns) {
    const campaignSends = (allSends || []).filter(s => s.campaign_id === campaign.id);
    const todaySends = campaignSends.filter(s => s.sent_at?.startsWith(today));

    if (todaySends.length > 0) {
      const stats = {
        date: today,
        campaign_id: campaign.id,
        sent: todaySends.length,
        opened: todaySends.filter(s => s.opened_at).length,
        replied: todaySends.filter(s => s.replied_at).length,
        bounced: todaySends.filter(s => s.bounced).length,
      };
      stats.open_rate = stats.sent ? (stats.opened / stats.sent * 100) : 0;
      stats.reply_rate = stats.sent ? (stats.replied / stats.sent * 100) : 0;
      stats.bounce_rate = stats.sent ? (stats.bounced / stats.sent * 100) : 0;

      await supabase.from('prospection_daily_stats').upsert(stats, { onConflict: 'date,campaign_id' });
    }
  }
}

// =============================================================================
// Utils
// =============================================================================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// =============================================================================
// CLI
// =============================================================================
const command = process.argv[2] || 'all';

async function main() {
  console.log(`\n🚀 Prospection GLP-1 — Mode: ${command}\n`);

  switch (command) {
    case 'scrape':
      await runScrape();
      break;
    case 'verify':
      await runVerify();
      break;
    case 'send':
      await runSend();
      break;
    case 'followup':
      await runFollowUp();
      break;
    case 'report':
      await runReport();
      break;
    case 'all':
      await runScrape();
      await runVerify();
      await runSend();
      await runFollowUp();
      await runReport();
      break;
    default:
      console.log('Usage: node scripts/prospection.mjs [scrape|verify|send|followup|report|all]');
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
