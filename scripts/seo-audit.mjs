#!/usr/bin/env node
/**
 * SEO Audit Agent — GLP1 France
 * Audite le build dist/ et enregistre les resultats dans Supabase
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const DIST = path.resolve('dist');
const SRC_CONTENT = path.resolve('src/content');
const PUBLIC = path.resolve('public');
const MAX_PAGES = 50;

// --- Supabase ---
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Helper: use Supabase REST API for CRUD operations
async function insertRow(table, row) {
  const { data, error } = await supabase.from(table).insert(row).select();
  if (error) console.error(`Insert ${table} error:`, error.message);
  return data;
}

async function updateRow(table, id, updates) {
  const { data, error } = await supabase.from(table).update(updates).eq('id', id).select();
  if (error) console.error(`Update ${table} error:`, error.message);
  return data;
}

async function selectRow(table, filters) {
  let q = supabase.from(table).select('*');
  for (const [k, v] of Object.entries(filters)) {
    q = q.eq(k, v);
  }
  const { data, error } = await q.limit(1);
  if (error) console.error(`Select ${table} error:`, error.message);
  return data;
}

// --- Redirects from astro config ---
const REDIRECT_SOURCES = [
  '/collections/medicaments-glp1/wegovy-avis',
  '/collections/medicaments-glp1/saxenda-prix',
  '/collections/medicaments-glp1/ozempic-injection-prix',
  '/collections/medicaments-glp1/mounjaro-effet-secondaire',
  '/collections/medicaments-glp1/mounjaro-injection-pour-maigrir',
  '/collections/medicaments-glp1/victoza-posologie',
  '/collections/medicaments-glp1/victoza-rupture',
  '/collections/medicaments-glp1/trulicity-ou-ozempic',
  '/collections/medicaments-glp1/trulicity-danger',
  '/guides/guide-complet-trulicity/',
  '/guides/guide-complet-januvia/',
  '/guides/guide-complet-mounjaro/',
  '/guides/guide-complet-ozempic/',
  '/guides/guide-complet-saxenda/',
  '/index-backup-original/',
  '/diagnostic-live-content-backup/',
  '/quel-traitement-glp1-choisir-backup/',
  '/quel-traitement-glp1-choisir-fixed/',
  '/test-affiliation/',
  '/admin-stats-new/',
  '/experts/',
  '/produits-recommandes/',
  '/collections/glp1-cout/wegovy-prix/',
  '/guide-debutant/',
  '/guide-glp1-perte-de-poids/',
  '/guide-beaute-perte-de-poids-glp1/',
  '/qu-est-ce-que-glp1/',
  '/temoignage-marie-transformation-glp1/',
  '/temoignage-sophie-transformation-glp1/',
  '/temoignage-laurent-transformation-glp1/',
  '/pages-statiques/serena-williams-glp1/',
  '/legal/confidentialite/',
  '/legal/cgu/',
  '/medicaments-glp1/mounjaro-prix-france/',
  '/mounjaro-prix/',
  '/mounjaro/',
  '/nouveaux-medicaments-perdre-poids/',
  '/medicaments-glp1',
  '/temoignages-glp1/'
];

// Robots.txt Disallow rules
const DISALLOW_RULES = [
  '/admin/', '/admin-', '/test-', '/demo-', '/_', '/api/',
  '/diagnostic-', '/index-backup',
  '/quel-traitement-glp1-choisir-backup', '/quel-traitement-glp1-choisir-fixed',
  '/guide-beaute-perte-de-poids-glp1', '/produits-recommandes',
  '/experts', '/temoignages-glp1', '/temoignage-'
];

// Suffix rules (/*-backup matches anything ending with -backup)
const DISALLOW_SUFFIX_RULES = ['-backup'];

function isBlockedByRobots(urlPath) {
  // Prefix rules
  for (const rule of DISALLOW_RULES) {
    if (urlPath.startsWith(rule)) return true;
  }
  // Suffix rules (from /*-backup pattern)
  for (const suffix of DISALLOW_SUFFIX_RULES) {
    if (urlPath.endsWith(suffix) || urlPath.endsWith(suffix + '/')) return true;
  }
  // File extension rules
  if (/\.(json|log|backup|bak)(\?|$)/.test(urlPath)) return true;
  return false;
}

function isRedirectPage(html) {
  return html.includes('window.location.replace') ||
    html.includes('http-equiv="refresh"') ||
    html.includes('<meta http-equiv="refresh"');
}

function isAdminPage(urlPath) {
  return urlPath.startsWith('/admin/') || urlPath.startsWith('/admin-');
}

// --- Collect all HTML files ---
function collectHtmlFiles(dir, base = '') {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base + '/' + entry.name;
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(fullPath, relPath));
    } else if (entry.name.endsWith('.html')) {
      results.push({ path: fullPath, url: relPath.replace(/\/index\.html$/, '/').replace(/\.html$/, '/') });
    }
  }
  return results;
}

// --- Strip script tags ---
function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

// --- Extract links from HTML (excluding scripts) ---
function extractLinks(html) {
  const cleaned = stripScripts(html);
  const links = [];
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(cleaned))) {
    links.push(m[1]);
  }
  return links;
}

// --- Main audit ---
async function main() {
  const results = [];
  const stats = { pages_audited: 0, critical: 0, warning: 0, info: 0, tickets_created: 0 };

  // 1. Init run
  console.log('=== SEO Audit Start ===');
  const runData = await insertRow('agent_runs', { agent_name: 'seo-audit', status: 'started' });
  const runId = runData?.[0]?.id;
  if (!runId) { console.error('Failed to create run'); process.exit(1); }
  console.log(`Run ID: ${runId}`);

  function addResult(r) {
    results.push(r);
    stats[r.severity] = (stats[r.severity] || 0) + 1;
  }

  // 2. Crawlability
  console.log('\n--- Crawlability ---');
  if (fs.existsSync(path.join(PUBLIC, 'robots.txt'))) {
    console.log('  robots.txt: OK');
  } else {
    addResult({ audit_type: 'crawlability', severity: 'critical', page_url: '/robots.txt', issue_title: 'robots.txt manquant', issue_detail: 'Le fichier robots.txt est absent', recommendation: 'Creer public/robots.txt avec les regles appropriees' });
  }

  // Sitemap
  const sitemapExists = fs.existsSync(path.join(DIST, 'sitemap-index.xml'));
  if (sitemapExists) {
    console.log('  sitemap-index.xml: OK');
    const sitemapContent = fs.readFileSync(path.join(DIST, 'sitemap-0.xml'), 'utf8');
    const sitemapUrls = [];
    const locRe = /<loc>([^<]+)<\/loc>/g;
    let lm;
    while ((lm = locRe.exec(sitemapContent))) {
      sitemapUrls.push(lm[1]);
    }
    console.log(`  Sitemap URLs: ${sitemapUrls.length}`);

    let blockedInSitemap = 0;
    for (const url of sitemapUrls) {
      const urlPath = new URL(url).pathname;
      if (isBlockedByRobots(urlPath)) {
        blockedInSitemap++;
        addResult({ audit_type: 'crawlability', severity: 'critical', page_url: urlPath, issue_title: 'URL sitemap bloquee par robots.txt', issue_detail: `${urlPath} est dans le sitemap mais bloquee par robots.txt`, recommendation: `Retirer ${urlPath} du sitemap ou du Disallow robots.txt` });
      }
    }
    if (blockedInSitemap === 0) console.log('  Coherence sitemap/robots.txt: OK');
    else console.log(`  !! ${blockedInSitemap} URL(s) du sitemap bloquee(s) par robots.txt`);
  } else {
    addResult({ audit_type: 'crawlability', severity: 'critical', page_url: '/sitemap-index.xml', issue_title: 'Sitemap manquant', issue_detail: 'Aucun sitemap XML genere dans dist/', recommendation: 'Verifier la configuration @astrojs/sitemap' });
  }

  // 3. Collect pages
  const allPages = collectHtmlFiles(DIST);
  console.log(`\nTotal HTML files: ${allPages.length}`);

  const contentPages = allPages
    .filter(p => !isAdminPage(p.url))
    .slice(0, MAX_PAGES);

  console.log(`Content pages to audit: ${contentPages.length}`);
  stats.pages_audited = contentPages.length;

  // All known dist paths for link checking
  const allDistPaths = new Set();
  for (const p of allPages) {
    allDistPaths.add(p.url);
    allDistPaths.add(p.url.replace(/\/$/, ''));
    if (!p.url.endsWith('/')) allDistPaths.add(p.url + '/');
  }

  // Track internal links for orphan detection
  const internalLinksTo = new Map();

  // 4. Per-page audits
  for (const page of contentPages) {
    const html = fs.readFileSync(page.path, 'utf8');
    const isRedirect = isRedirectPage(html);

    // --- Meta tags ---
    if (!isRedirect) {
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      if (!titleMatch || !titleMatch[1].trim()) {
        addResult({ audit_type: 'meta_tags', severity: 'critical', page_url: page.url, issue_title: 'Title manquant', issue_detail: `Pas de <title> sur ${page.url}`, recommendation: 'Ajouter une balise <title> unique et descriptive' });
      } else if (titleMatch[1].length > 60) {
        addResult({ audit_type: 'meta_tags', severity: 'warning', page_url: page.url, issue_title: 'Title trop long', issue_detail: `Title: ${titleMatch[1].length} caracteres (max 60) — "${titleMatch[1].substring(0, 70)}..."`, recommendation: 'Raccourcir le title a 60 caracteres max' });
      }

      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/);
      if (!descMatch) {
        addResult({ audit_type: 'meta_tags', severity: 'warning', page_url: page.url, issue_title: 'Meta description manquante', issue_detail: `Pas de meta description sur ${page.url}`, recommendation: 'Ajouter une meta description de 120-160 caracteres' });
      } else if (descMatch[1].length > 160) {
        addResult({ audit_type: 'meta_tags', severity: 'warning', page_url: page.url, issue_title: 'Meta description trop longue', issue_detail: `Description: ${descMatch[1].length} caracteres (max 160)`, recommendation: 'Raccourcir la meta description a 160 caracteres max' });
      }

      const canonicalMatch = html.match(/<link\s+rel="canonical"/);
      if (!canonicalMatch) {
        addResult({ audit_type: 'meta_tags', severity: 'warning', page_url: page.url, issue_title: 'Canonical manquant', issue_detail: `Pas de <link rel="canonical"> sur ${page.url}`, recommendation: 'Ajouter un lien canonical pointant vers la page elle-meme' });
      }

      const ogTitle = html.match(/<meta\s+property="og:title"/);
      const ogDesc = html.match(/<meta\s+property="og:description"/);
      if (!ogTitle || !ogDesc) {
        addResult({ audit_type: 'meta_tags', severity: 'info', page_url: page.url, issue_title: 'OG tags incomplets', issue_detail: `${!ogTitle ? 'og:title manquant' : ''}${!ogTitle && !ogDesc ? ', ' : ''}${!ogDesc ? 'og:description manquant' : ''}`, recommendation: 'Ajouter les balises Open Graph pour un meilleur partage social' });
      }
    }

    // --- Headings ---
    if (!isRedirect) {
      const h1Matches = html.match(/<h1[\s>]/g);
      const h1Count = h1Matches ? h1Matches.length : 0;
      if (h1Count === 0) {
        addResult({ audit_type: 'headings', severity: 'critical', page_url: page.url, issue_title: 'H1 manquant', issue_detail: `Aucun <h1> trouve sur ${page.url}`, recommendation: 'Ajouter un <h1> unique decrivant le contenu principal' });
      } else if (h1Count > 1) {
        addResult({ audit_type: 'headings', severity: 'warning', page_url: page.url, issue_title: 'Multiple H1', issue_detail: `${h1Count} balises <h1> trouvees (devrait etre 1)`, recommendation: 'Garder un seul <h1> par page' });
      }

      // Heading hierarchy
      const headingRe = /<h([1-6])[\s>]/g;
      let hm;
      let lastLevel = 0;
      let hierarchyBroken = false;
      while ((hm = headingRe.exec(html))) {
        const level = parseInt(hm[1]);
        if (lastLevel > 0 && level > lastLevel + 1) {
          hierarchyBroken = true;
          break;
        }
        lastLevel = level;
      }
      if (hierarchyBroken) {
        addResult({ audit_type: 'headings', severity: 'warning', page_url: page.url, issue_title: 'Hierarchie headings cassee', issue_detail: 'Saut de niveau dans les headings (ex: h1 -> h3)', recommendation: 'Respecter la hierarchie h1 > h2 > h3 sans saut' });
      }
    }

    // --- Images ---
    if (!isRedirect) {
      const cleanHtml = stripScripts(html);
      const imgRe = /<img\s[^>]*>/gi;
      let im;
      let missingAlt = 0;
      while ((im = imgRe.exec(cleanHtml))) {
        if (!im[0].includes('alt=')) missingAlt++;
      }
      if (missingAlt > 0) {
        addResult({ audit_type: 'images', severity: 'warning', page_url: page.url, issue_title: 'Images sans alt', issue_detail: `${missingAlt} image(s) sans attribut alt sur ${page.url}`, recommendation: 'Ajouter un attribut alt descriptif a chaque image' });
      }
    }

    // --- Internal links ---
    if (!isRedirect && !isAdminPage(page.url)) {
      const links = extractLinks(html);
      for (const link of links) {
        if (link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('javascript:')) continue;
        if (link.startsWith('http://') || link.startsWith('https://')) {
          if (!link.includes('glp1-france.fr')) continue;
          try {
            const u = new URL(link);
            const intPath = u.pathname;
            if (!isAdminPage(intPath)) {
              if (!internalLinksTo.has(intPath)) internalLinksTo.set(intPath, []);
              internalLinksTo.get(intPath).push(page.url);
            }
          } catch {}
          continue;
        }
        let resolved = link;
        if (!resolved.startsWith('/')) {
          resolved = path.posix.resolve(page.url, link);
        }
        if (!resolved.endsWith('/') && !resolved.includes('.')) resolved += '/';

        if (!isAdminPage(resolved)) {
          if (!internalLinksTo.has(resolved)) internalLinksTo.set(resolved, []);
          internalLinksTo.get(resolved).push(page.url);
        }

        // Check broken link
        const isRedirectSource = REDIRECT_SOURCES.some(r => resolved === r || resolved === r + '/' || resolved + '/' === r);
        if (!isRedirectSource && !isAdminPage(resolved)) {
          const exists = allDistPaths.has(resolved) || allDistPaths.has(resolved.replace(/\/$/, '')) || allDistPaths.has(resolved.endsWith('/') ? resolved : resolved + '/');
          if (!exists && !resolved.includes('?') && !resolved.includes('#') && !resolved.endsWith('.xml') && !resolved.endsWith('.json') && !resolved.endsWith('.js') && !resolved.endsWith('.css') && !resolved.endsWith('.svg') && !resolved.endsWith('.png') && !resolved.endsWith('.jpg') && !resolved.endsWith('.webp') && !resolved.endsWith('.ico') && !resolved.endsWith('.pdf')) {
            addResult({ audit_type: 'internal_links', severity: 'critical', page_url: page.url, issue_title: 'Lien interne casse', issue_detail: `Lien vers ${resolved} introuvable dans dist/`, recommendation: `Corriger ou supprimer le lien vers ${resolved}` });
          }
        }
      }
    }
  }

  // --- Orphan pages ---
  console.log('\n--- Orphan pages ---');
  const nonAdminNonBlocked = allPages.filter(p => !isAdminPage(p.url) && !isBlockedByRobots(p.url));
  let orphanCount = 0;
  for (const page of nonAdminNonBlocked) {
    if (page.url === '/' || page.url === '/404/') continue;
    const hasLink = internalLinksTo.has(page.url) || internalLinksTo.has(page.url.replace(/\/$/, ''));
    if (!hasLink) {
      const isRedir = REDIRECT_SOURCES.some(r => page.url === r + '/' || page.url === r);
      if (!isRedir) {
        orphanCount++;
        if (orphanCount <= 20) {
          addResult({ audit_type: 'internal_links', severity: 'warning', page_url: page.url, issue_title: 'Page orpheline', issue_detail: `Aucun lien interne ne pointe vers ${page.url}`, recommendation: `Ajouter au moins un lien interne vers ${page.url}` });
        }
      }
    }
  }
  console.log(`  ${orphanCount} pages orphelines detectees`);

  // --- Check frontmatter images ---
  console.log('\n--- Frontmatter images ---');
  if (fs.existsSync(SRC_CONTENT)) {
    const mdFiles = [];
    function collectMd(dir) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) collectMd(path.join(dir, e.name));
        else if (e.name.endsWith('.md') || e.name.endsWith('.mdx')) mdFiles.push(path.join(dir, e.name));
      }
    }
    collectMd(SRC_CONTENT);
    let missingThumbs = 0;

    for (const mdFile of mdFiles.slice(0, 50)) {
      const content = fs.readFileSync(mdFile, 'utf8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;
      const fm = fmMatch[1];
      const slug = path.basename(mdFile).replace(/\.(md|mdx)$/, '');

      const hasImage = /^(image|thumbnail|heroImage)\s*:/m.test(fm);
      if (!hasImage) {
        missingThumbs++;
        addResult({ audit_type: 'images', severity: 'warning', page_url: `/${slug}/`, issue_title: 'Thumbnail manquante', issue_detail: `L'article ${slug} n'a pas d'image dans son frontmatter`, recommendation: 'Ajouter une image (image, thumbnail ou heroImage) dans le frontmatter' });
      } else {
        const imgMatch = fm.match(/^(?:image|thumbnail|heroImage)\s*:\s*['"]?([^'"\n]+)['"]?/m);
        if (imgMatch) {
          let imgPath = imgMatch[1].trim();
          if (imgPath.startsWith('/')) {
            const fullImgPath = path.join(PUBLIC, imgPath);
            if (!fs.existsSync(fullImgPath)) {
              addResult({ audit_type: 'images', severity: 'warning', page_url: `/${slug}/`, issue_title: 'Image frontmatter introuvable', issue_detail: `Image ${imgPath} referencee dans ${slug} introuvable`, recommendation: `Verifier que ${imgPath} existe ou corriger le chemin` });
            }
          }
        }
      }
    }
    console.log(`  ${missingThumbs} articles sans thumbnail`);
  }

  // --- Performance ---
  console.log('\n--- Performance ---');
  let totalSize = 0, cssCount = 0, jsCount = 0, largeFiles = 0;

  function measureDir(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) { measureDir(fp); continue; }
      const st = fs.statSync(fp);
      totalSize += st.size;
      if (e.name.endsWith('.css')) cssCount++;
      if (e.name.endsWith('.js')) jsCount++;
      if (e.name.endsWith('.html') && st.size > 100 * 1024) {
        largeFiles++;
        const relUrl = '/' + path.relative(DIST, fp).replace(/\\/g, '/').replace(/index\.html$/, '');
        addResult({ audit_type: 'performance', severity: 'warning', page_url: relUrl, issue_title: 'HTML trop volumineux', issue_detail: `${(st.size / 1024).toFixed(0)} KB (max recommande: 100 KB)`, recommendation: 'Reduire le contenu ou paginer' });
      }
      if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(e.name) && st.size > 500 * 1024) {
        const relPath = '/' + path.relative(DIST, fp).replace(/\\/g, '/');
        addResult({ audit_type: 'images', severity: 'warning', page_url: relPath, issue_title: 'Image trop volumineuse', issue_detail: `${(st.size / 1024).toFixed(0)} KB (max: 500 KB)`, recommendation: 'Compresser ou convertir en WebP' });
      }
    }
  }
  measureDir(DIST);

  console.log(`  Total: ${(totalSize / 1024 / 1024).toFixed(1)} MB | CSS: ${cssCount} | JS: ${jsCount} | HTML >100KB: ${largeFiles}`);
  addResult({ audit_type: 'performance', severity: 'info', page_url: '/', issue_title: 'Statistiques de performance', issue_detail: `Taille totale: ${(totalSize / 1024 / 1024).toFixed(1)} MB, ${cssCount} CSS, ${jsCount} JS, ${largeFiles} HTML > 100KB`, recommendation: 'Monitorer la taille totale du site' });

  // --- Save results to Supabase ---
  console.log(`\n=== Saving ${results.length} results to Supabase ===`);

  // Batch insert results (in chunks of 50)
  for (let i = 0; i < results.length; i += 50) {
    const batch = results.slice(i, i + 50).map(r => ({
      agent_run_id: runId,
      audit_type: r.audit_type,
      severity: r.severity,
      page_url: r.page_url,
      issue_title: r.issue_title,
      issue_detail: (r.issue_detail || '').substring(0, 2000),
      recommendation: (r.recommendation || '').substring(0, 2000)
    }));
    await insertRow('seo_audit_results', batch);
  }

  // --- Create correction tickets ---
  console.log('\n=== Creating correction tickets ===');
  const ticketableResults = results.filter(r =>
    (r.severity === 'critical' || r.severity === 'warning') &&
    ['meta_tags', 'headings', 'images', 'internal_links'].includes(r.audit_type)
  );

  function getTicketType(r) {
    if (r.audit_type === 'meta_tags' && r.issue_title.includes('Title')) return { type: 'seo_issue', urgence: 'urgent' };
    if (r.audit_type === 'meta_tags') return { type: 'missing_description', urgence: 'warning' };
    if (r.audit_type === 'headings') return { type: 'heading_issue', urgence: r.severity === 'critical' ? 'urgent' : 'warning' };
    if (r.audit_type === 'images') return { type: 'missing_image', urgence: 'warning' };
    if (r.audit_type === 'internal_links' && r.issue_title.includes('casse')) return { type: 'broken_link', urgence: 'urgent' };
    return null;
  }

  for (const r of ticketableResults) {
    const tt = getTicketType(r);
    if (!tt) continue;

    const slug = r.page_url.replace(/^\//, '').replace(/\/$/, '').split('/').pop();
    if (!slug) continue;

    const articleData = await selectRow('articles', { slug, is_active: true });
    if (!articleData || articleData.length === 0) continue;

    const article = articleData[0];
    // Check if ticket already exists (avoid duplicates)
    const existing = await supabase.from('correction_tickets')
      .select('id')
      .eq('article_id', article.id)
      .eq('ticket_type', tt.type)
      .eq('source_agent', 'seo-audit')
      .not('statut', 'in', '("deployed","rejected")')
      .limit(1);
    if (existing.data && existing.data.length > 0) continue;

    await insertRow('correction_tickets', {
      article_id: article.id, slug, title: article.title,
      source_agent: 'seo-audit', ticket_type: tt.type, urgence: tt.urgence,
      before_exact: (r.issue_detail || '').substring(0, 2000),
      after_suggested: (r.recommendation || '').substring(0, 2000),
      claim_original: (r.issue_title || '').substring(0, 2000),
      realite_actuelle: (r.issue_detail || '').substring(0, 2000),
      statut: 'approved'
    });
    stats.tickets_created++;
  }

  console.log(`  Tickets created: ${stats.tickets_created}`);

  // --- Finalize run ---
  await updateRow('agent_runs', runId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    items_processed: stats.pages_audited,
    items_errors: stats.critical + stats.warning,
    metadata: { pages_audited: stats.pages_audited, critical: stats.critical, warning: stats.warning, info: stats.info, tickets_created: stats.tickets_created }
  });

  // --- Summary ---
  console.log('\n========================================');
  console.log('         SEO AUDIT SUMMARY');
  console.log('========================================');
  console.log(`Pages auditees : ${stats.pages_audited}`);
  console.log(`Critical       : ${stats.critical}`);
  console.log(`Warning        : ${stats.warning}`);
  console.log(`Info           : ${stats.info}`);
  console.log(`Tickets crees  : ${stats.tickets_created}`);
  console.log(`Run ID         : ${runId}`);
  console.log('========================================');

  const criticals = results.filter(r => r.severity === 'critical');
  if (criticals.length > 0) {
    console.log('\n--- ISSUES CRITIQUES ---');
    for (const c of criticals) {
      console.log(`  [${c.audit_type}] ${c.page_url}: ${c.issue_title}`);
      console.log(`    -> ${c.issue_detail}`);
    }
  }

  const warnings = results.filter(r => r.severity === 'warning');
  if (warnings.length > 0) {
    console.log(`\n--- WARNINGS (${warnings.length} total, top 30) ---`);
    for (const w of warnings.slice(0, 30)) {
      console.log(`  [${w.audit_type}] ${w.page_url}: ${w.issue_title}`);
    }
    if (warnings.length > 30) console.log(`  ... et ${warnings.length - 30} autres`);
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
