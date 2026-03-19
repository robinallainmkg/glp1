#!/usr/bin/env node
/**
 * SEO Audit Script — glp1-france.fr
 * Audite le dossier dist/ et enregistre les résultats dans Supabase
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DIST = path.resolve('dist');
const MAX_PAGES = 260;

const results = [];
let runId = null;

// ---- Helpers ----

function extractTag(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : null;
}

function getFiles(dir, ext) {
  const out = [];
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(ext)) out.push(full);
    }
  }
  walk(dir);
  return out;
}

function distPathToUrl(filePath) {
  return filePath.replace(DIST, '').replace(/\\/g, '/').replace(/index\.html$/, '') || '/';
}

function addResult(audit_type, severity, page_url, issue_title, issue_detail, recommendation) {
  results.push({ audit_type, severity, page_url, issue_title, issue_detail, recommendation });
}

// ---- 3.1 Crawlabilité ----

function auditCrawlability() {
  console.log('3.1 Crawlabilité...');
  const robotsPath = path.join('public', 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    addResult('crawlability', 'critical', '/', 'robots.txt manquant', 'Le fichier robots.txt est absent de /public/', 'Créer public/robots.txt avec les règles appropriées');
  }

  const sitemapPaths = [
    path.join(DIST, 'sitemap-index.xml'),
    path.join(DIST, 'sitemap.xml'),
    path.join('public', 'sitemap.xml'),
  ];
  const sitemapExists = sitemapPaths.some(p => fs.existsSync(p));
  if (!sitemapExists) {
    addResult('crawlability', 'critical', '/', 'Sitemap XML manquant', 'Aucun sitemap XML trouvé dans dist/', 'Configurer @astrojs/sitemap dans astro.config.mjs');
  } else {
    console.log('  ✓ Sitemap présent');
  }
}

// ---- 3.2 Meta tags ----

function auditMetaTags(htmlFiles) {
  console.log('3.2 Meta tags...');
  for (const file of htmlFiles) {
    const url = distPathToUrl(file);
    const html = fs.readFileSync(file, 'utf-8');

    // Title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch) {
      addResult('meta_tags', 'critical', url, 'Title manquant', `Pas de balise <title> sur ${url}`, 'Ajouter une balise <title> unique et descriptive');
    } else {
      const title = titleMatch[1].trim();
      if (title.length > 60) {
        addResult('meta_tags', 'warning', url, 'Title trop long', `Title "${title.substring(0,60)}..." (${title.length} car.)`, 'Réduire le title à moins de 60 caractères');
      }
    }

    // Description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
      || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    if (!descMatch) {
      addResult('meta_tags', 'warning', url, 'Meta description manquante', `Pas de meta description sur ${url}`, 'Ajouter une meta description < 160 caractères');
    } else {
      const desc = descMatch[1].trim();
      if (desc.length > 160) {
        addResult('meta_tags', 'warning', url, 'Meta description trop longue', `Description ${desc.length} car. (max 160)`, 'Réduire la meta description à moins de 160 caractères');
      }
    }

    // Canonical
    if (!html.includes('rel="canonical"') && !html.includes("rel='canonical'")) {
      addResult('meta_tags', 'warning', url, 'Canonical manquant', `Pas de lien canonical sur ${url}`, 'Ajouter <link rel="canonical" href="...">');
    }

    // OG tags
    if (!html.includes('og:title')) {
      addResult('meta_tags', 'info', url, 'og:title manquant', `Pas de balise og:title sur ${url}`, 'Ajouter les balises Open Graph pour le partage social');
    }
  }
}

// ---- 3.3 Headings ----

function auditHeadings(htmlFiles) {
  console.log('3.3 Headings...');
  for (const file of htmlFiles) {
    const url = distPathToUrl(file);
    const html = fs.readFileSync(file, 'utf-8');

    // Skip nav/footer — just count in body
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1] : html;

    const h1s = body.match(/<h1[\s>]/gi) || [];
    if (h1s.length === 0) {
      addResult('headings', 'critical', url, 'H1 manquant', `Pas de balise h1 sur ${url}`, 'Ajouter un H1 unique et descriptif');
    } else if (h1s.length > 1) {
      addResult('headings', 'warning', url, 'Plusieurs H1', `${h1s.length} balises h1 sur ${url}`, 'Ne garder qu\'un seul H1 par page');
    }
  }
}

// ---- 3.4 Images ----

function auditImages(htmlFiles) {
  console.log('3.4 Images...');
  let missingAlt = 0;

  for (const file of htmlFiles) {
    const url = distPathToUrl(file);
    const html = fs.readFileSync(file, 'utf-8');
    const imgTags = html.matchAll(/<img\s([^>]*)>/gi);
    for (const match of imgTags) {
      const attrs = match[1];
      if (!attrs.includes('alt=')) {
        missingAlt++;
        if (missingAlt <= 20) { // limite le volume
          addResult('images', 'warning', url, 'Image sans attribut alt', `<img ${attrs.substring(0,80)}> sans alt`, 'Ajouter un attribut alt descriptif à chaque image');
        }
      }
    }
  }
  if (missingAlt > 20) {
    console.log(`  ... ${missingAlt} images sans alt (20 rapportées)`);
  }
}

// ---- 3.5 Maillage interne ----

function auditInternalLinks(htmlFiles) {
  console.log('3.5 Maillage interne...');

  // Collecter toutes les URLs existantes
  const existingUrls = new Set();
  for (const file of htmlFiles) {
    existingUrls.add(distPathToUrl(file));
  }
  // Ajouter les redirects
  const redirectsPath = path.join(DIST, '_redirects');
  const redirectSources = new Set();
  if (fs.existsSync(redirectsPath)) {
    const lines = fs.readFileSync(redirectsPath, 'utf-8').split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts[0]) redirectSources.add(parts[0]);
    }
  }

  const brokenLinks = new Map();
  const incomingLinks = new Map();

  // Init incomingLinks
  for (const url of existingUrls) incomingLinks.set(url, 0);

  for (const file of htmlFiles) {
    const fromUrl = distPathToUrl(file);
    const html = fs.readFileSync(file, 'utf-8');
    const links = html.matchAll(/href=["']([^"'#?]+)["']/gi);
    for (const match of links) {
      let href = match[1];
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      // Normaliser
      if (!href.endsWith('/') && !href.includes('.')) href += '/';
      if (incomingLinks.has(href)) {
        incomingLinks.set(href, incomingLinks.get(href) + 1);
      } else if (!existingUrls.has(href) && !redirectSources.has(href) && !href.startsWith('/admin') && href !== '/') {
        if (!brokenLinks.has(href)) brokenLinks.set(href, fromUrl);
      }
    }
  }

  // Liens cassés
  let brokenCount = 0;
  for (const [href, fromUrl] of brokenLinks) {
    brokenCount++;
    if (brokenCount <= 30) {
      addResult('internal_links', 'critical', fromUrl, 'Lien interne cassé', `Lien vers ${href} introuvable dans dist/`, `Corriger ou supprimer le lien vers ${href}`);
    }
  }
  if (brokenCount > 30) console.log(`  ... ${brokenCount} liens cassés (30 rapportés)`);

  // Pages orphelines
  let orphanCount = 0;
  for (const [url, count] of incomingLinks) {
    if (count === 0 && url !== '/' && !url.includes('/admin') && !url.includes('/404')) {
      orphanCount++;
      if (orphanCount <= 10) {
        addResult('internal_links', 'warning', url, 'Page orpheline', `Aucun lien interne ne pointe vers ${url}`, 'Ajouter des liens internes vers cette page');
      }
    }
  }
  if (orphanCount > 10) console.log(`  ... ${orphanCount} pages orphelines (10 rapportées)`);

  console.log(`  ${brokenCount} liens cassés, ${orphanCount} pages orphelines`);
}

// ---- 3.6 Performance ----

function auditPerformance(htmlFiles) {
  console.log('3.6 Performance...');

  // Taille HTML
  for (const file of htmlFiles) {
    const url = distPathToUrl(file);
    const size = fs.statSync(file).size;
    if (size > 100 * 1024) {
      addResult('performance', 'warning', url, 'Fichier HTML volumineux', `${file} fait ${Math.round(size/1024)}KB`, 'Réduire la taille du HTML (images inline, scripts)');
    }
  }

  // Taille totale dist
  let totalSize = 0;
  for (const file of getFiles(DIST, '')) {
    try { totalSize += fs.statSync(file).size; } catch {}
  }
  const totalMB = (totalSize / 1024 / 1024).toFixed(1);
  console.log(`  Taille totale dist: ${totalMB} MB`);
  addResult('performance', 'info', '/', 'Taille totale du site', `${totalMB} MB au total`, totalSize > 50*1024*1024 ? 'Optimiser les assets' : 'Taille acceptable');

  // Compter CSS/JS
  const cssFiles = getFiles(DIST, '.css').length;
  const jsFiles = getFiles(DIST, '.js').length;
  console.log(`  ${cssFiles} fichiers CSS, ${jsFiles} fichiers JS`);
  addResult('performance', 'info', '/', 'Inventaire assets', `${cssFiles} CSS, ${jsFiles} JS`, 'Vérifier la minification et le bundling');
}

// ---- Main ----

async function main() {
  console.log('=== SEO Audit GLP1 France ===\n');

  // 1. Init run
  const { data: runData, error: runErr } = await supabase
    .from('agent_runs')
    .insert({ agent_name: 'seo-audit', status: 'started' })
    .select('id')
    .single();

  if (runErr) {
    console.error('Erreur init run:', runErr.message);
    process.exit(1);
  }
  runId = runData.id;
  console.log(`Run ID: ${runId}\n`);

  // 2. Collecter les pages HTML — priorité aux pages de contenu, pas admin
  const allHtml = getFiles(DIST, '.html');
  const contentPages = allHtml.filter(f => !f.includes(`${path.sep}admin${path.sep}`) && !f.includes('/admin/'));
  const adminPages = allHtml.filter(f => f.includes(`${path.sep}admin${path.sep}`) || f.includes('/admin/'));
  // Priorité: contenu d'abord, admin ensuite
  const prioritized = [...contentPages, ...adminPages];
  const htmlFiles = prioritized.slice(0, MAX_PAGES);
  console.log(`Pages à auditer: ${htmlFiles.length} / ${allHtml.length} total (${contentPages.length} contenu + ${adminPages.length} admin)\n`);

  // 3. Audits
  auditCrawlability();
  auditMetaTags(htmlFiles);
  auditHeadings(htmlFiles);
  auditImages(htmlFiles);
  auditInternalLinks(htmlFiles);
  auditPerformance(htmlFiles);

  console.log(`\nTotal résultats: ${results.length}`);

  // 4. Enregistrement Supabase (par batch de 50)
  const insertable = results.map(r => ({ ...r, agent_run_id: runId }));
  for (let i = 0; i < insertable.length; i += 50) {
    const batch = insertable.slice(i, i + 50);
    const { error } = await supabase.from('seo_audit_results').insert(batch);
    if (error) console.error('Insert error batch', i, error.message);
  }
  console.log('✓ Résultats insérés dans seo_audit_results');

  // 5. Correction tickets
  const criticalWarning = results.filter(r => r.severity === 'critical' || r.severity === 'warning');
  const typeMap = {
    'meta_tags': { title: 'seo_issue', urgence: 'urgent', other: 'missing_description', otherUrgence: 'warning' },
    'headings': { title: 'heading_issue', urgence: 'urgent', other: 'heading_issue', otherUrgence: 'warning' },
    'images': { title: 'missing_image', urgence: 'warning' },
    'internal_links': { title: 'broken_link', urgence: 'urgent', other: 'broken_link', otherUrgence: 'warning' },
  };

  // Récupérer les articles en une requête
  const { data: articlesData } = await supabase.from('articles').select('id, title, slug').eq('is_active', true);
  const articlesBySlug = {};
  for (const a of (articlesData || [])) articlesBySlug[a.slug] = a;

  let ticketsCreated = 0;
  for (const r of criticalWarning) {
    if (!typeMap[r.audit_type]) continue;
    if (r.page_url.includes('/admin')) continue; // Ignorer les pages admin

    // Extraire le slug depuis l'URL:
    // /collections/effets-secondaires-glp1/slug/ → effets-secondaires-glp1/slug
    // /traitements-glp1/slug/ → traitements-glp1/slug
    let urlPath = r.page_url.replace(/^\//, '').replace(/\/$/, '');
    // Supprimer le préfixe "collections/"
    if (urlPath.startsWith('collections/')) urlPath = urlPath.slice('collections/'.length);
    const lastSegment = urlPath.split('/').pop();
    const article = articlesBySlug[urlPath] || articlesBySlug[lastSegment];
    if (!article) continue;

    const tm = typeMap[r.audit_type];
    let ticketType = tm.title;
    let urgence = tm.urgence;

    // Affiner par issue_title
    if (r.audit_type === 'meta_tags' && r.issue_title.includes('description')) {
      ticketType = 'missing_description';
      urgence = 'warning';
    }

    const ticket = {
      article_id: article.id,
      slug: article.slug,
      title: article.title,
      source_agent: 'seo-audit',
      ticket_type: ticketType,
      urgence,
      before_exact: r.issue_detail,
      after_suggested: r.recommendation,
      claim_original: r.issue_title,
      realite_actuelle: r.issue_detail,
      statut: 'approved',
    };

    // Vérifier si un ticket actif existe déjà (non deployed, non rejected)
    const { data: existing } = await supabase
      .from('correction_tickets')
      .select('id')
      .eq('article_id', article.id)
      .eq('ticket_type', ticketType)
      .eq('source_agent', 'seo-audit')
      .not('statut', 'in', '("deployed","rejected")')
      .limit(1);
    if (existing && existing.length > 0) continue; // Skip si ticket actif existe déjà

    const { error } = await supabase
      .from('correction_tickets')
      .insert(ticket);

    if (!error) ticketsCreated++;
  }
  console.log(`✓ ${ticketsCreated} tickets créés`);

  // Résumé
  const critical = results.filter(r => r.severity === 'critical').length;
  const warning = results.filter(r => r.severity === 'warning').length;
  const info = results.filter(r => r.severity === 'info').length;

  console.log(`\nRésumé: ${critical} critiques, ${warning} warnings, ${info} infos`);

  // 6. Finaliser le run
  await supabase.from('agent_runs').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    items_processed: htmlFiles.length,
    items_errors: critical + warning,
    metadata: {
      pages_audited: htmlFiles.length,
      total_pages: allHtml.length,
      critical,
      warning,
      info,
      tickets_created: ticketsCreated,
    },
  }).eq('id', runId);

  console.log('\n✅ Audit SEO terminé!');
  console.log(`Run ID: ${runId}`);

  return { runId, critical, warning, info, ticketsCreated, pagesAudited: htmlFiles.length };
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
