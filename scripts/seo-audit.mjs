// Script d'audit SEO complet — glp1-france.fr
// Exécution: node scripts/seo-audit.mjs

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const __dirname2 = dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname2, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const MAX_PAGES = 50;

let runId = null;
const results = [];
const tickets = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function fileSize(p) {
  try { return fs.statSync(p).size; } catch { return 0; }
}

function extract(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : null;
}

function extractAll(html, regex) {
  return [...html.matchAll(regex)].map(m => m[1] || m[0]);
}

function urlToSlug(url) {
  // /collections/effets-secondaires-glp1/ozempic-danger/ → effets-secondaires-glp1/ozempic-danger
  const stripped = url.replace(/^\/|\/$/g, '');
  if (stripped.startsWith('collections/')) return stripped.replace(/^collections\//, '');
  // Pages non-collection : dernier segment
  const parts = stripped.split('/');
  return parts[parts.length - 1] || '';
}

function isAdminOrTechPage(url) {
  return url.startsWith('/admin') || url.startsWith('/test-') || url.startsWith('/demo-') ||
    url.startsWith('/diagnostic-') || url.startsWith('/index-backup') || url.startsWith('/api/') ||
    url.startsWith('/quel-traitement-glp1-choisir-backup') || url.startsWith('/quel-traitement-glp1-choisir-fixed');
}

function addResult(type, severity, url, title, detail, reco) {
  results.push({ audit_type: type, severity, page_url: url, issue_title: title, issue_detail: detail, recommendation: reco });
  const s = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';
  console.log(`  ${s} [${type}] ${title} — ${url}`);
}

// ── 1. Initialiser le run ─────────────────────────────────────────────────────

async function initRun() {
  const { data, error } = await supabase.from('agent_runs').insert({ agent_name: 'seo-audit', status: 'started' }).select('id').single();
  if (error) { console.error('Erreur init run:', error); process.exit(1); }
  runId = data.id;
  console.log(`✅ Run créé: ${runId}`);
}

// ── 2. Crawlabilité ──────────────────────────────────────────────────────────

function auditCrawlability() {
  console.log('\n📋 Audit Crawlabilité...');

  // robots.txt
  const robotsTxt = readFile(`${PUBLIC}/robots.txt`) || readFile(`${DIST}/robots.txt`);
  if (!robotsTxt) {
    addResult('crawlability', 'critical', '/', 'robots.txt manquant', 'Le fichier robots.txt est absent', 'Créer un robots.txt avec Sitemap: et règles User-agent');
  } else {
    if (!robotsTxt.includes('Sitemap:')) {
      addResult('crawlability', 'warning', '/', 'robots.txt sans Sitemap', 'robots.txt ne référence pas le sitemap', 'Ajouter Sitemap: https://glp1-france.fr/sitemap.xml');
    }
    console.log('  ✅ robots.txt OK');
  }

  // sitemap
  const sitemapPaths = [`${DIST}/sitemap.xml`, `${PUBLIC}/sitemap.xml`, `${DIST}/sitemap-0.xml`];
  const sitemapExists = sitemapPaths.some(p => fs.existsSync(p));
  if (!sitemapExists) {
    addResult('crawlability', 'critical', '/', 'Sitemap XML manquant', 'Aucun sitemap.xml trouvé dans dist/ ou public/', 'Activer @astrojs/sitemap dans astro.config.mjs');
  } else {
    console.log('  ✅ Sitemap OK');
  }
}

// ── 3. Collecter les pages ────────────────────────────────────────────────────

function collectPages() {
  const allHtml = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Exclure admin/* (pages admin)
        if (!full.includes('/admin/') && !full.includes('\\admin\\') &&
            !full.includes('/admin-dashboard') && !full.includes('/admin-stats')) {
          walk(full);
        }
      } else if (entry.name === 'index.html' || entry.name === '404.html') {
        allHtml.push(full);
      }
    }
  }
  walk(DIST);
  return allHtml.slice(0, MAX_PAGES);
}

// ── 4. Audit Meta Tags ────────────────────────────────────────────────────────

function auditMetaTags(pages) {
  console.log(`\n🏷  Audit Meta Tags (${pages.length} pages)...`);
  for (const p of pages) {
    const html = readFile(p);
    if (!html) continue;
    const url = p.replace(DIST, '').replace(/\\/g, '/').replace(/\/index\.html$/, '/') || '/';
    if (isAdminOrTechPage(url)) continue; // Exclure les pages admin/tech

    // Title
    const title = extract(html, /<title[^>]*>([^<]+)<\/title>/i);
    if (!title) {
      addResult('meta_tags', 'critical', url, 'Title manquant', 'La page n\'a pas de balise <title>', 'Ajouter une balise <title> unique et descriptive');
    } else if (title.length > 60) {
      addResult('meta_tags', 'warning', url, `Title trop long (${title.length} car.)`, `Title: "${title.substring(0, 80)}..."`, 'Réduire le title à moins de 60 caractères');
    }

    // Meta description
    const desc = extract(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
              || extract(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
    if (!desc) {
      addResult('meta_tags', 'warning', url, 'Meta description manquante', 'Aucune meta description trouvée', 'Ajouter une meta description entre 120 et 160 caractères');
    } else if (desc.length > 160) {
      addResult('meta_tags', 'warning', url, `Meta description trop longue (${desc.length} car.)`, `Description: "${desc.substring(0, 100)}..."`, 'Réduire la meta description à moins de 160 caractères');
    }

    // Canonical
    if (!html.includes('rel="canonical"') && !html.includes("rel='canonical'")) {
      addResult('meta_tags', 'warning', url, 'Canonical manquant', 'Pas de balise canonical sur cette page', 'Ajouter <link rel="canonical" href="...">');
    }

    // OG tags
    if (!html.includes('og:title')) {
      addResult('meta_tags', 'info', url, 'og:title manquant', 'Pas de balise Open Graph title', 'Ajouter <meta property="og:title">');
    }
    if (!html.includes('og:description')) {
      addResult('meta_tags', 'info', url, 'og:description manquant', 'Pas de balise Open Graph description', 'Ajouter <meta property="og:description">');
    }
  }
}

// ── 5. Audit Headings ─────────────────────────────────────────────────────────

function auditHeadings(pages) {
  console.log('\n📑 Audit Headings...');
  for (const p of pages) {
    const html = readFile(p);
    if (!html) continue;
    const url = p.replace(DIST, '').replace(/\\/g, '/').replace(/\/index\.html$/, '/') || '/';
    if (isAdminOrTechPage(url)) continue;

    // Détecter les H1 (y compris ceux avec des éléments enfants)
    const h1Count = [...html.matchAll(/<h1[\s>]/gi)].length;
    if (h1Count === 0) {
      addResult('headings', 'critical', url, 'H1 manquant', 'La page n\'a aucun h1', 'Ajouter exactement un <h1> avec le mot-clé principal');
    } else if (h1Count > 1) {
      addResult('headings', 'warning', url, `Plusieurs H1 (${h1Count})`, `${h1Count} balises H1 détectées`, 'Réduire à un seul <h1> par page');
    }

    // Vérifier la hiérarchie: pas de H3 sans H2
    const hasH3 = /<h3[^>]*>/i.test(html);
    const hasH2 = /<h2[^>]*>/i.test(html);
    if (hasH3 && !hasH2) {
      addResult('headings', 'warning', url, 'H3 sans H2 (hiérarchie cassée)', 'La page a des H3 mais pas de H2', 'Respecter la hiérarchie h1 > h2 > h3');
    }
  }
}

// ── 6. Audit Images ──────────────────────────────────────────────────────────

function auditImages(pages) {
  console.log('\n🖼  Audit Images...');
  for (const p of pages) {
    const html = readFile(p);
    if (!html) continue;
    const url = p.replace(DIST, '').replace(/\\/g, '/').replace(/\/index\.html$/, '/') || '/';
    if (isAdminOrTechPage(url)) continue;

    // Images sans alt
    const imgTags = [...html.matchAll(/<img\s([^>]+)>/gi)].map(m => m[1]);
    for (const attrs of imgTags) {
      if (!attrs.includes('alt=')) {
        const srcMatch = attrs.match(/src=["']([^"']+)["']/);
        const src = srcMatch ? srcMatch[1] : 'inconnu';
        addResult('images', 'warning', url, 'Image sans attribut alt', `<img src="${src.substring(0, 80)}"> sans alt`, 'Ajouter un attribut alt descriptif à toutes les images');
        break; // Un seul ticket par page pour éviter le flood
      }
    }
  }
}

// ── 7. Audit Maillage Interne ─────────────────────────────────────────────────

function auditInternalLinks(pages) {
  console.log('\n🔗 Audit Maillage Interne...');

  // Construire l'index des URLs existantes
  const existingUrls = new Set();
  function walkDist(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDist(full);
      } else if (entry.name === 'index.html') {
        const url = full.replace(DIST, '').replace(/\\/g, '/').replace('/index.html', '/');
        existingUrls.add(url);
        existingUrls.add(url.replace(/\/$/, '')); // sans slash final
      }
    }
  }
  walkDist(DIST);
  existingUrls.add('/');

  // Compter les liens entrants par page
  const incomingLinks = {};
  for (const p of pages) {
    const url = p.replace(DIST, '').replace(/\\/g, '/').replace(/\/index\.html$/, '/') || '/';
    if (!incomingLinks[url]) incomingLinks[url] = 0;
  }

  const brokenLinks = new Set();

  for (const p of pages) {
    const html = readFile(p);
    if (!html) continue;
    const url = p.replace(DIST, '').replace(/\\/g, '/').replace(/\/index\.html$/, '/') || '/';

    // Extraire les liens internes
    const hrefs = [...html.matchAll(/href=["']([^"'#?]+)["']/gi)]
      .map(m => m[1])
      .filter(h => h.startsWith('/') && !h.startsWith('//'));

    for (const href of hrefs) {
      const normalized = href.endsWith('/') ? href : href + '/';
      if (incomingLinks[normalized] !== undefined) incomingLinks[normalized]++;
      if (incomingLinks[href] !== undefined) incomingLinks[href]++;

      // Vérifier si le lien existe
      const targetPath = path.join(DIST, href, 'index.html');
      const targetFile = path.join(DIST, href);
      const exists = fs.existsSync(targetPath) ||
                     fs.existsSync(targetFile) ||
                     existingUrls.has(href) ||
                     existingUrls.has(normalized) ||
                     href === '/' ||
                     href.startsWith('/_') ||
                     href.startsWith('/api/') ||
                     href.includes('.');

      if (!exists && !brokenLinks.has(href) && brokenLinks.size < 20) {
        brokenLinks.add(href);
        addResult('internal_links', 'critical', url, `Lien interne cassé: ${href}`, `La page "${href}" n'existe pas dans dist/`, `Corriger ou supprimer le lien vers ${href}`);
      }
    }
  }

  // Pages orphelines (max 10)
  let orphanCount = 0;
  for (const [url, count] of Object.entries(incomingLinks)) {
    if (count === 0 && url !== '/' && orphanCount < 10) {
      addResult('internal_links', 'warning', url, 'Page orpheline', `Aucun lien interne ne pointe vers ${url}`, 'Ajouter des liens internes depuis d\'autres pages');
      orphanCount++;
    }
  }
}

// ── 8. Audit Performance ──────────────────────────────────────────────────────

function auditPerformance(pages) {
  console.log('\n⚡ Audit Performance...');

  let totalSize = 0;
  for (const p of pages) {
    const size = fileSize(p);
    totalSize += size;
    const url = p.replace(DIST, '').replace(/\\/g, '/').replace(/\/index\.html$/, '/') || '/';
    if (size > 100 * 1024) {
      addResult('performance', 'warning', url, `HTML volumineux (${Math.round(size/1024)}KB)`, `Le fichier HTML fait ${Math.round(size/1024)}KB`, 'Réduire le HTML inline, vérifier les islands Astro');
    }
  }

  // Compter CSS/JS
  const cssFiles = fs.existsSync(`${DIST}/_astro`) ? fs.readdirSync(`${DIST}/_astro`).filter(f => f.endsWith('.css')) : [];
  const jsFiles = fs.existsSync(`${DIST}/_astro`) ? fs.readdirSync(`${DIST}/_astro`).filter(f => f.endsWith('.js')) : [];

  if (cssFiles.length > 10) {
    addResult('performance', 'info', '/', `Nombreux fichiers CSS (${cssFiles.length})`, `${cssFiles.length} fichiers CSS dans _astro/`, 'Vérifier si le bundle CSS peut être optimisé');
  }
  if (jsFiles.length > 20) {
    addResult('performance', 'info', '/', `Nombreux fichiers JS (${jsFiles.length})`, `${jsFiles.length} fichiers JS dans _astro/`, 'Vérifier le code splitting Astro');
  }

  const totalMB = Math.round(totalSize / 1024 / 1024 * 10) / 10;
  console.log(`  📊 Taille totale auditée: ${totalMB}MB`);
}

// ── 9. Sauvegarder les résultats ──────────────────────────────────────────────

async function saveResults() {
  console.log(`\n💾 Sauvegarde de ${results.length} résultats dans Supabase...`);

  const toInsert = results.map(r => ({ ...r, agent_run_id: runId }));

  // Insérer par batches de 50
  for (let i = 0; i < toInsert.length; i += 50) {
    const batch = toInsert.slice(i, i + 50);
    const { error } = await supabase.from('seo_audit_results').insert(batch);
    if (error) console.error('Erreur insert résultats:', error.message);
  }
  console.log('  ✅ Résultats sauvegardés');
}

// ── 10. Créer les correction_tickets ─────────────────────────────────────────

async function createTickets() {
  console.log('\n🎫 Création des correction_tickets...');

  const TICKET_MAP = {
    'meta_tags-critical': { ticket_type: 'seo_issue', urgence: 'urgent' },
    'meta_tags-warning': { ticket_type: 'missing_description', urgence: 'warning' },
    'headings-critical': { ticket_type: 'heading_issue', urgence: 'urgent' },
    'headings-warning': { ticket_type: 'heading_issue', urgence: 'warning' },
    'images-warning': { ticket_type: 'missing_image', urgence: 'warning' },
    'internal_links-critical': { ticket_type: 'broken_link', urgence: 'urgent' },
  };

  // Filtrer uniquement critical/warning et avec mapping ticket
  const ticketResults = results.filter(r => {
    const key = `${r.audit_type}-${r.severity}`;
    return TICKET_MAP[key] && (r.severity === 'critical' || r.severity === 'warning');
  });

  console.log(`  ${ticketResults.length} issues éligibles pour tickets`);
  let ticketsCreated = 0;

  for (const r of ticketResults) {
    const key = `${r.audit_type}-${r.severity}`;
    const { ticket_type, urgence } = TICKET_MAP[key];

    const slug = urlToSlug(r.page_url);
    if (!slug) continue;

    // Récupérer l'article — essayer plusieurs formats de slug
    let article = null;
    for (const slugTry of [slug, slug.split('/').pop()]) {
      const { data } = await supabase
        .from('articles')
        .select('id, title')
        .eq('slug', slugTry)
        .eq('is_active', true)
        .limit(1)
        .single();
      if (data) { article = data; break; }
    }

    if (!article) continue;

    // Créer le ticket
    const { error } = await supabase.from('correction_tickets').insert({
      article_id: article.id,
      slug,
      title: article.title,
      source_agent: 'seo-audit',
      ticket_type,
      urgence,
      before_exact: r.issue_detail,
      after_suggested: r.recommendation,
      claim_original: r.issue_title,
      realite_actuelle: r.issue_detail,
      statut: 'approved'
    }).select();

    if (!error) ticketsCreated++;
    // Ignorer les conflits ON CONFLICT (pas supporté via JS client, mais les doublons exact seront refusés par la DB)
  }

  console.log(`  ✅ ${ticketsCreated} tickets créés`);
  return ticketsCreated;
}

// ── 11. Finaliser le run ──────────────────────────────────────────────────────

async function finalizeRun(ticketsCreated, pagesCount) {
  const critical = results.filter(r => r.severity === 'critical').length;
  const warning = results.filter(r => r.severity === 'warning').length;
  const info = results.filter(r => r.severity === 'info').length;

  await supabase.from('agent_runs').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    items_processed: pagesCount,
    items_errors: critical + warning,
    metadata: {
      pages_audited: pagesCount,
      critical,
      warning,
      info,
      tickets_created: ticketsCreated
    }
  }).eq('id', runId);

  console.log('\n' + '='.repeat(60));
  console.log('✅ AUDIT SEO TERMINÉ');
  console.log('='.repeat(60));
  console.log(`Pages auditées : ${pagesCount}`);
  console.log(`🔴 Critical    : ${critical}`);
  console.log(`🟡 Warning     : ${warning}`);
  console.log(`🔵 Info        : ${info}`);
  console.log(`🎫 Tickets     : ${ticketsCreated}`);
  console.log(`Run ID         : ${runId}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Démarrage de l\'audit SEO — glp1-france.fr');
  console.log('='.repeat(60));

  await initRun();

  auditCrawlability();

  const pages = collectPages();
  console.log(`\n📂 ${pages.length} pages collectées pour audit`);

  auditMetaTags(pages);
  auditHeadings(pages);
  auditImages(pages);
  auditInternalLinks(pages);
  auditPerformance(pages);

  console.log(`\n📊 Total issues trouvées: ${results.length}`);

  await saveResults();
  const ticketsCreated = await createTickets();
  await finalizeRun(ticketsCreated, pages.length);
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
