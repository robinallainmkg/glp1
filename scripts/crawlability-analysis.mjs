#!/usr/bin/env node

/**
 * Analyse de crawlabilite du site GLP1
 *
 * Lance apres `npm run astro:build` pour analyser le dossier dist/.
 * Genere un rapport dans AUDIT-TECHNIQUE.md (section Crawlabilite).
 *
 * Usage :
 *   npm run astro:build && node scripts/crawlability-analysis.mjs
 *   node scripts/crawlability-analysis.mjs --dist ./dist  # chemin custom
 *   node scripts/crawlability-analysis.mjs --json          # sortie JSON
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// --- CLI arguments ---
const args = process.argv.slice(2);
const distIndex = args.indexOf('--dist');
const DIST_DIR = distIndex !== -1 ? path.resolve(args[distIndex + 1]) : path.join(PROJECT_ROOT, 'dist');
const JSON_OUTPUT = args.includes('--json');
const SITE_URL = 'https://glp1-france.fr';

// Supabase (optionnel — stocke le rapport si les variables sont presentes)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- Helpers ---

function getAllHtmlFiles(dir, base = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllHtmlFiles(fullPath, base));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

function htmlPathToUrl(htmlPath, distDir) {
  let relative = path.relative(distDir, htmlPath).replace(/\\/g, '/');
  // index.html -> /
  if (relative === 'index.html') return '/';
  // foo/index.html -> /foo/
  if (relative.endsWith('/index.html')) {
    return '/' + relative.replace(/\/index\.html$/, '/');
  }
  // foo.html -> /foo/
  if (relative.endsWith('.html')) {
    return '/' + relative.replace(/\.html$/, '/');
  }
  return '/' + relative;
}

function extractLinks(htmlContent, pageUrl) {
  const links = [];
  // Regex to find href attributes in <a> tags
  const hrefRegex = /<a\s[^>]*?href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = hrefRegex.exec(htmlContent)) !== null) {
    const href = match[1];
    if (!href) continue;
    // Normalize internal links
    if (href.startsWith('/') && !href.startsWith('//')) {
      links.push(normalizeUrl(href));
    } else if (href.startsWith(SITE_URL)) {
      links.push(normalizeUrl(href.replace(SITE_URL, '')));
    } else if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#')) {
      // Relative link
      const resolved = path.posix.resolve(path.posix.dirname(pageUrl), href);
      links.push(normalizeUrl(resolved));
    }
  }
  return [...new Set(links)];
}

function normalizeUrl(url) {
  let u = url.split('#')[0].split('?')[0];
  if (u !== '/' && !u.endsWith('/')) u += '/';
  if (!u.startsWith('/')) u = '/' + u;
  return u;
}

function extractMeta(htmlContent) {
  const meta = {};

  // Check noindex
  const robotsMatch = htmlContent.match(/<meta\s[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    || htmlContent.match(/<meta\s[^>]*content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i);
  if (robotsMatch) {
    meta.noindex = robotsMatch[1].toLowerCase().includes('noindex');
    meta.robotsContent = robotsMatch[1];
  } else {
    meta.noindex = false;
  }

  // Title
  const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  meta.title = titleMatch ? titleMatch[1].trim() : '';

  // Canonical
  const canonicalMatch = htmlContent.match(/<link\s[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  meta.canonical = canonicalMatch ? canonicalMatch[1] : null;

  return meta;
}

function parseSitemap(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) return { urls: [], priorities: {} };
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const urls = [];
  const priorities = {};

  // Simple regex parsing (no XML parser dependency needed)
  const urlBlocks = content.match(/<url>[\s\S]*?<\/url>/g) || [];
  for (const block of urlBlocks) {
    const locMatch = block.match(/<loc>(.*?)<\/loc>/);
    const priorityMatch = block.match(/<priority>(.*?)<\/priority>/);
    if (locMatch) {
      let loc = locMatch[1].replace(SITE_URL, '');
      loc = normalizeUrl(loc || '/');
      urls.push(loc);
      if (priorityMatch) {
        priorities[loc] = parseFloat(priorityMatch[1]);
      }
    }
  }
  return { urls, priorities };
}

function isImportantPage(url) {
  // Homepage, collections, treatment guides, articles
  if (url === '/') return true;
  if (url.startsWith('/traitements-glp1/')) return true;
  if (url.startsWith('/articles/')) return true;
  if (url.startsWith('/guides/')) return true;
  if (url.startsWith('/collections/')) return true;
  if (url.startsWith('/glp1-cout/')) return true;
  if (url.startsWith('/glp1-perte-de-poids/')) return true;
  if (url.startsWith('/effets-secondaires-glp1/')) return true;
  if (url.startsWith('/alternatives-glp1/')) return true;
  if (url.startsWith('/glp1-diabete/')) return true;
  return false;
}

function isExcludedPage(url) {
  // Admin pages, API, disabled pages
  if (url.startsWith('/admin')) return true;
  if (url.startsWith('/api/')) return true;
  if (url.startsWith('/_')) return true;
  if (url === '/404/') return true;
  return false;
}

// --- Supabase storage ---

async function storeInSupabase(report) {
  try {
    const payload = {
      summary: report.summary,
      orphan_pages: report.orphanPages,
      unreachable_pages: report.unreachablePages,
      deep_pages: report.deepPages,
      noindex_pages: report.noindexPages,
      missing_from_sitemap: report.missingFromSitemap,
      sitemap_ghosts: report.sitemapGhosts,
      priority_issues: report.priorityIssues,
      article_scores: report.articleScores
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/crawlability_reports`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Erreur Supabase (${response.status}) : ${text}`);
      return;
    }

    console.log('Rapport stocke dans Supabase (crawlability_reports)');

    // Keep only the 10 most recent reports
    const listRes = await fetch(
      `${SUPABASE_URL}/rest/v1/crawlability_reports?select=id&order=created_at.desc&offset=10`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        }
      }
    );
    if (listRes.ok) {
      const old = await listRes.json();
      for (const row of old) {
        await fetch(`${SUPABASE_URL}/rest/v1/crawlability_reports?id=eq.${row.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          }
        });
      }
      if (old.length > 0) {
        console.log(`${old.length} ancien(s) rapport(s) supprime(s)`);
      }
    }
  } catch (err) {
    console.error('Erreur stockage Supabase :', err.message);
  }
}

// --- Main analysis ---

async function analyze() {
  console.log(`\n=== Analyse de crawlabilite — ${DIST_DIR} ===\n`);

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Erreur : dist/ non trouve a ${DIST_DIR}`);
    console.error('Lancez d\'abord : npm run astro:build');
    process.exit(1);
  }

  // 1. Collect all HTML pages
  const htmlFiles = getAllHtmlFiles(DIST_DIR);
  const pages = new Map(); // url -> { path, links, meta, incomingLinks }

  for (const file of htmlFiles) {
    const url = htmlPathToUrl(file, DIST_DIR);
    if (isExcludedPage(url)) continue;

    const content = fs.readFileSync(file, 'utf-8');
    const links = extractLinks(content, url);
    const meta = extractMeta(content);

    pages.set(url, {
      path: path.relative(DIST_DIR, file),
      links,
      meta,
      incomingLinks: [],
      depth: Infinity
    });
  }

  console.log(`Pages analysees : ${pages.size}`);

  // 2. Build link graph
  for (const [sourceUrl, pageData] of pages) {
    for (const targetUrl of pageData.links) {
      const targetPage = pages.get(targetUrl);
      if (targetPage) {
        targetPage.incomingLinks.push(sourceUrl);
      }
    }
  }

  // 3. Compute crawl depth (BFS from homepage)
  const homepage = pages.get('/');
  if (homepage) {
    homepage.depth = 1;
    const queue = ['/'];
    while (queue.length > 0) {
      const current = queue.shift();
      const currentPage = pages.get(current);
      if (!currentPage) continue;
      const nextDepth = currentPage.depth + 1;
      for (const link of currentPage.links) {
        const target = pages.get(link);
        if (target && target.depth > nextDepth) {
          target.depth = nextDepth;
          queue.push(link);
        }
      }
    }
  }

  // 4. Orphan pages (0 incoming links, not homepage)
  const orphanPages = [];
  for (const [url, data] of pages) {
    if (url === '/') continue;
    if (data.incomingLinks.length === 0) {
      orphanPages.push(url);
    }
  }

  // 5. Deep pages (depth > 3)
  const deepPages = [];
  for (const [url, data] of pages) {
    if (data.depth > 3 && data.depth !== Infinity) {
      deepPages.push({ url, depth: data.depth });
    }
  }
  deepPages.sort((a, b) => b.depth - a.depth);

  // 6. Unreachable pages (depth = Infinity, not homepage)
  const unreachablePages = [];
  for (const [url, data] of pages) {
    if (url === '/' ) continue;
    if (data.depth === Infinity) {
      unreachablePages.push(url);
    }
  }

  // 7. Noindex pages
  const noindexPages = [];
  for (const [url, data] of pages) {
    if (data.meta.noindex) {
      noindexPages.push({ url, important: isImportantPage(url) });
    }
  }

  // 8. Sitemap analysis
  const sitemapPath = path.join(DIST_DIR, 'sitemap-0.xml');
  const sitemapIndexPath = path.join(DIST_DIR, 'sitemap-index.xml');
  let sitemap = { urls: [], priorities: {} };

  // Try sitemap-0.xml first, then sitemap.xml
  if (fs.existsSync(sitemapPath)) {
    sitemap = parseSitemap(sitemapPath);
  } else {
    const altPath = path.join(DIST_DIR, 'sitemap.xml');
    if (fs.existsSync(altPath)) {
      sitemap = parseSitemap(altPath);
    }
  }

  const pageUrls = new Set(pages.keys());
  const sitemapUrls = new Set(sitemap.urls);

  // Pages in dist but not in sitemap
  const missingFromSitemap = [];
  for (const url of pageUrls) {
    if (!sitemapUrls.has(url) && isImportantPage(url)) {
      missingFromSitemap.push(url);
    }
  }

  // Pages in sitemap but not in dist (404 potentiels)
  const sitemapGhosts = [];
  for (const url of sitemapUrls) {
    if (!pageUrls.has(url)) {
      sitemapGhosts.push(url);
    }
  }

  // 9. Priority check
  const priorityIssues = [];
  if (sitemap.priorities['/'] !== undefined && sitemap.priorities['/'] < 1.0) {
    priorityIssues.push({ url: '/', current: sitemap.priorities['/'], expected: 1.0, reason: 'Homepage' });
  }
  for (const [url, priority] of Object.entries(sitemap.priorities)) {
    if (url.startsWith('/collections/') && priority < 0.9) {
      priorityIssues.push({ url, current: priority, expected: 0.9, reason: 'Page categorie' });
    }
    if ((url.startsWith('/traitements-glp1/') || url.startsWith('/articles/') || url.startsWith('/guides/')) && priority < 0.8) {
      priorityIssues.push({ url, current: priority, expected: 0.8, reason: 'Article/Guide' });
    }
  }

  // 10. Internal linking score per article
  const articleScores = [];
  for (const [url, data] of pages) {
    if (isExcludedPage(url)) continue;
    articleScores.push({
      url,
      incomingCount: data.incomingLinks.length,
      outgoingCount: data.links.filter(l => pages.has(l)).length,
      depth: data.depth === Infinity ? 'non atteignable' : data.depth
    });
  }
  articleScores.sort((a, b) => a.incomingCount - b.incomingCount);

  // --- Build report ---
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: pages.size,
      orphanCount: orphanPages.length,
      unreachableCount: unreachablePages.length,
      deepPagesCount: deepPages.length,
      noindexCount: noindexPages.length,
      sitemapUrlCount: sitemapUrls.size,
      missingFromSitemapCount: missingFromSitemap.length,
      sitemapGhostsCount: sitemapGhosts.length,
      priorityIssuesCount: priorityIssues.length
    },
    orphanPages,
    unreachablePages,
    deepPages,
    noindexPages,
    missingFromSitemap,
    sitemapGhosts,
    priorityIssues,
    articleScores
  };

  // Console output
  printReport(report);

  // Generate AUDIT-TECHNIQUE.md
  generateAuditFile(report);

  if (JSON_OUTPUT) {
    const jsonPath = path.join(PROJECT_ROOT, 'crawlability-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`\nRapport JSON : ${jsonPath}`);
  }

  // Store in Supabase if credentials available
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    await storeInSupabase(report);
  } else {
    console.log('\nSupabase non configure — rapport non stocke en base.');
  }

  // Exit code non-zero if critical issues
  const criticalIssues = orphanPages.filter(u => isImportantPage(u)).length + unreachablePages.filter(u => isImportantPage(u)).length;
  if (criticalIssues > 0) {
    console.log(`\n⚠ ${criticalIssues} pages importantes orphelines ou non atteignables`);
  }

  return report;
}

function printReport(report) {
  console.log('\n--- Resume ---');
  console.log(`Pages totales        : ${report.summary.totalPages}`);
  console.log(`Pages orphelines     : ${report.summary.orphanCount}`);
  console.log(`Pages non atteignables : ${report.summary.unreachableCount}`);
  console.log(`Pages profondes (>3) : ${report.summary.deepPagesCount}`);
  console.log(`Pages noindex        : ${report.summary.noindexCount}`);
  console.log(`URLs sitemap         : ${report.summary.sitemapUrlCount}`);
  console.log(`Absentes du sitemap  : ${report.summary.missingFromSitemapCount}`);
  console.log(`Fantomes sitemap     : ${report.summary.sitemapGhostsCount}`);
  console.log(`Problemes priorite   : ${report.summary.priorityIssuesCount}`);

  if (report.orphanPages.length > 0) {
    console.log('\n--- Pages orphelines (0 liens entrants) ---');
    for (const url of report.orphanPages.slice(0, 20)) {
      console.log(`  ${isImportantPage(url) ? '⚠' : ' '} ${url}`);
    }
    if (report.orphanPages.length > 20) {
      console.log(`  ... et ${report.orphanPages.length - 20} autres`);
    }
  }

  if (report.unreachablePages.length > 0) {
    console.log('\n--- Pages non atteignables depuis homepage ---');
    for (const url of report.unreachablePages.slice(0, 20)) {
      console.log(`  ${url}`);
    }
    if (report.unreachablePages.length > 20) {
      console.log(`  ... et ${report.unreachablePages.length - 20} autres`);
    }
  }

  if (report.deepPages.length > 0) {
    console.log('\n--- Pages profondes (niveau > 3) ---');
    for (const p of report.deepPages.slice(0, 20)) {
      console.log(`  niveau ${p.depth} : ${p.url}`);
    }
  }

  if (report.noindexPages.length > 0) {
    console.log('\n--- Pages noindex ---');
    for (const p of report.noindexPages) {
      console.log(`  ${p.important ? '⚠ IMPORTANT' : ' '} ${p.url}`);
    }
  }

  if (report.missingFromSitemap.length > 0) {
    console.log('\n--- Pages importantes absentes du sitemap ---');
    for (const url of report.missingFromSitemap) {
      console.log(`  ${url}`);
    }
  }

  if (report.sitemapGhosts.length > 0) {
    console.log('\n--- Fantomes sitemap (404 potentiels) ---');
    for (const url of report.sitemapGhosts) {
      console.log(`  ${url}`);
    }
  }

  if (report.priorityIssues.length > 0) {
    console.log('\n--- Problemes de priorite sitemap ---');
    for (const p of report.priorityIssues) {
      console.log(`  ${p.url} : ${p.current} → devrait etre ${p.expected} (${p.reason})`);
    }
  }

  // Top articles with fewest incoming links
  console.log('\n--- Articles avec le moins de liens entrants (top 15) ---');
  const importantLow = report.articleScores.filter(a => isImportantPage(a.url)).slice(0, 15);
  for (const a of importantLow) {
    console.log(`  [${a.incomingCount} in / ${a.outgoingCount} out] (prof. ${a.depth}) ${a.url}`);
  }
}

function generateAuditFile(report) {
  const auditPath = path.join(PROJECT_ROOT, 'AUDIT-TECHNIQUE.md');
  let existingContent = '';

  if (fs.existsSync(auditPath)) {
    existingContent = fs.readFileSync(auditPath, 'utf-8');
  }

  // Remove existing Crawlabilite section if present
  const sectionRegex = /\n## Crawlabilit[eé][\s\S]*?(?=\n## |\n# |$)/;
  existingContent = existingContent.replace(sectionRegex, '');

  // Build new section
  const lines = [];
  lines.push('');
  lines.push('## Crawlabilite');
  lines.push('');
  lines.push(`> Derniere analyse : ${report.timestamp}`);
  lines.push('');
  lines.push('### Resume');
  lines.push('');
  lines.push(`| Metrique | Valeur |`);
  lines.push(`|---|---|`);
  lines.push(`| Pages totales | ${report.summary.totalPages} |`);
  lines.push(`| Pages orphelines | ${report.summary.orphanCount} |`);
  lines.push(`| Pages non atteignables | ${report.summary.unreachableCount} |`);
  lines.push(`| Pages profondes (niveau > 3) | ${report.summary.deepPagesCount} |`);
  lines.push(`| Pages noindex | ${report.summary.noindexCount} |`);
  lines.push(`| URLs dans sitemap | ${report.summary.sitemapUrlCount} |`);
  lines.push(`| Pages absentes du sitemap | ${report.summary.missingFromSitemapCount} |`);
  lines.push(`| Fantomes sitemap (404) | ${report.summary.sitemapGhostsCount} |`);
  lines.push(`| Problemes priorite sitemap | ${report.summary.priorityIssuesCount} |`);

  // Orphan pages
  if (report.orphanPages.length > 0) {
    lines.push('');
    lines.push('### Pages orphelines (0 liens entrants)');
    lines.push('');
    lines.push('Ces pages ne sont linkees depuis aucune autre page du site. Google ne les trouvera pas via le crawl.');
    lines.push('');
    const importantOrphans = report.orphanPages.filter(u => isImportantPage(u));
    const otherOrphans = report.orphanPages.filter(u => !isImportantPage(u));
    if (importantOrphans.length > 0) {
      lines.push('**Pages importantes orphelines (action prioritaire) :**');
      lines.push('');
      for (const url of importantOrphans) {
        lines.push(`- \`${url}\``);
      }
      lines.push('');
    }
    if (otherOrphans.length > 0) {
      lines.push('<details>');
      lines.push(`<summary>Autres pages orphelines (${otherOrphans.length})</summary>`);
      lines.push('');
      for (const url of otherOrphans) {
        lines.push(`- \`${url}\``);
      }
      lines.push('');
      lines.push('</details>');
    }
  }

  // Crawl depth map
  lines.push('');
  lines.push('### Carte de profondeur du site');
  lines.push('');
  const depthMap = new Map();
  for (const [url, data] of new Map(report.articleScores.map(a => [a.url, a]))) {
    const d = data.depth === 'non atteignable' ? 'non atteignable' : data.depth;
    if (!depthMap.has(d)) depthMap.set(d, []);
    depthMap.get(d).push(data.url);
  }
  const depthKeys = [...depthMap.keys()].sort((a, b) => {
    if (a === 'non atteignable') return 1;
    if (b === 'non atteignable') return -1;
    return a - b;
  });
  for (const depth of depthKeys) {
    const urls = depthMap.get(depth);
    const label = depth === 'non atteignable' ? 'Non atteignable' : `Niveau ${depth}`;
    lines.push(`**${label}** (${urls.length} pages)`);
    lines.push('');
    if (depth === 'non atteignable' || (typeof depth === 'number' && depth > 3)) {
      for (const url of urls.slice(0, 30)) {
        lines.push(`- \`${url}\``);
      }
      if (urls.length > 30) lines.push(`- ... et ${urls.length - 30} autres`);
    } else {
      lines.push(`<details><summary>Voir les ${urls.length} pages</summary>`);
      lines.push('');
      for (const url of urls) {
        lines.push(`- \`${url}\``);
      }
      lines.push('');
      lines.push('</details>');
    }
    lines.push('');
  }

  // Deep pages
  if (report.deepPages.length > 0) {
    lines.push('### Pages profondes (niveau > 3)');
    lines.push('');
    lines.push('Ces pages sont trop eloignees de la homepage. Objectif : aucune page importante au-dela du niveau 3.');
    lines.push('');
    for (const p of report.deepPages) {
      lines.push(`- Niveau ${p.depth} : \`${p.url}\``);
    }
    lines.push('');
  }

  // Noindex
  if (report.noindexPages.length > 0) {
    lines.push('### Pages noindex');
    lines.push('');
    const importantNoindex = report.noindexPages.filter(p => p.important);
    if (importantNoindex.length > 0) {
      lines.push('**ALERTE : Pages importantes avec noindex :**');
      lines.push('');
      for (const p of importantNoindex) {
        lines.push(`- \`${p.url}\``);
      }
      lines.push('');
    }
    const otherNoindex = report.noindexPages.filter(p => !p.important);
    if (otherNoindex.length > 0) {
      lines.push('Pages noindex (normal pour admin/technique) :');
      lines.push('');
      for (const p of otherNoindex) {
        lines.push(`- \`${p.url}\``);
      }
      lines.push('');
    }
  }

  // Sitemap vs reality
  lines.push('### Sitemap vs realite');
  lines.push('');
  if (report.missingFromSitemap.length > 0) {
    lines.push('**Pages importantes absentes du sitemap** (invisibles pour Google) :');
    lines.push('');
    for (const url of report.missingFromSitemap) {
      lines.push(`- \`${url}\``);
    }
    lines.push('');
  } else {
    lines.push('Toutes les pages importantes sont presentes dans le sitemap.');
    lines.push('');
  }
  if (report.sitemapGhosts.length > 0) {
    lines.push('**Pages dans le sitemap mais absentes de dist/** (erreurs 404) :');
    lines.push('');
    for (const url of report.sitemapGhosts) {
      lines.push(`- \`${url}\``);
    }
    lines.push('');
  } else {
    lines.push('Aucun fantome dans le sitemap.');
    lines.push('');
  }

  // Priority issues
  if (report.priorityIssues.length > 0) {
    lines.push('### Priorites sitemap');
    lines.push('');
    lines.push('| Page | Priorite actuelle | Priorite attendue | Type |');
    lines.push('|---|---|---|---|');
    for (const p of report.priorityIssues) {
      lines.push(`| \`${p.url}\` | ${p.current} | ${p.expected} | ${p.reason} |`);
    }
    lines.push('');
  }

  // Internal linking score
  lines.push('### Score de maillage interne par article');
  lines.push('');
  lines.push('| Page | Liens entrants | Liens sortants | Profondeur |');
  lines.push('|---|---|---|---|');
  const importantArticles = report.articleScores.filter(a => isImportantPage(a.url));
  for (const a of importantArticles.slice(0, 50)) {
    const flag = a.incomingCount === 0 ? ' ⚠' : '';
    lines.push(`| \`${a.url}\` | ${a.incomingCount}${flag} | ${a.outgoingCount} | ${a.depth} |`);
  }
  if (importantArticles.length > 50) {
    lines.push(`| ... | ${importantArticles.length - 50} autres pages | | |`);
  }
  lines.push('');

  // Priority actions
  lines.push('### Actions prioritaires (classees par impact SEO)');
  lines.push('');
  const actions = [];

  const importantOrphans = report.orphanPages.filter(u => isImportantPage(u));
  if (importantOrphans.length > 0) {
    actions.push({
      priority: 1,
      impact: 'CRITIQUE',
      action: `Linker ${importantOrphans.length} page(s) importante(s) orpheline(s) depuis d'autres pages du site`,
      details: importantOrphans.slice(0, 5).map(u => `\`${u}\``).join(', ')
    });
  }

  const importantUnreachable = report.unreachablePages.filter(u => isImportantPage(u));
  if (importantUnreachable.length > 0) {
    actions.push({
      priority: 1,
      impact: 'CRITIQUE',
      action: `Rendre ${importantUnreachable.length} page(s) importante(s) accessibles depuis la homepage`,
      details: importantUnreachable.slice(0, 5).map(u => `\`${u}\``).join(', ')
    });
  }

  if (report.missingFromSitemap.length > 0) {
    actions.push({
      priority: 2,
      impact: 'ELEVE',
      action: `Ajouter ${report.missingFromSitemap.length} page(s) manquante(s) au sitemap`,
      details: report.missingFromSitemap.slice(0, 5).map(u => `\`${u}\``).join(', ')
    });
  }

  if (report.sitemapGhosts.length > 0) {
    actions.push({
      priority: 2,
      impact: 'ELEVE',
      action: `Corriger ${report.sitemapGhosts.length} URL(s) fantome(s) dans le sitemap (erreurs 404)`,
      details: report.sitemapGhosts.slice(0, 5).map(u => `\`${u}\``).join(', ')
    });
  }

  if (report.deepPages.length > 0) {
    actions.push({
      priority: 3,
      impact: 'MOYEN',
      action: `Reduire la profondeur de ${report.deepPages.length} page(s) (niveau > 3)`,
      details: report.deepPages.slice(0, 5).map(p => `\`${p.url}\` (niv. ${p.depth})`).join(', ')
    });
  }

  const importantNoindex = report.noindexPages.filter(p => p.important);
  if (importantNoindex.length > 0) {
    actions.push({
      priority: 1,
      impact: 'CRITIQUE',
      action: `Retirer le noindex de ${importantNoindex.length} page(s) importante(s)`,
      details: importantNoindex.slice(0, 5).map(p => `\`${p.url}\``).join(', ')
    });
  }

  if (report.priorityIssues.length > 0) {
    actions.push({
      priority: 4,
      impact: 'FAIBLE',
      action: `Corriger les priorites sitemap de ${report.priorityIssues.length} page(s)`,
      details: report.priorityIssues.slice(0, 3).map(p => `\`${p.url}\``).join(', ')
    });
  }

  const zeroIncoming = report.articleScores.filter(a => isImportantPage(a.url) && a.incomingCount === 0);
  if (zeroIncoming.length > 0) {
    actions.push({
      priority: 2,
      impact: 'ELEVE',
      action: `Creer des liens internes vers ${zeroIncoming.length} article(s) avec 0 liens entrants`,
      details: zeroIncoming.slice(0, 5).map(a => `\`${a.url}\``).join(', ')
    });
  }

  actions.sort((a, b) => a.priority - b.priority);
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    lines.push(`${i + 1}. **[${a.impact}]** ${a.action}`);
    if (a.details) {
      lines.push(`   - ${a.details}`);
    }
  }
  lines.push('');

  // Append or create file
  const newSection = lines.join('\n');

  if (existingContent.trim()) {
    // Append section
    const finalContent = existingContent.trimEnd() + '\n' + newSection;
    fs.writeFileSync(auditPath, finalContent);
  } else {
    // Create new file
    const header = `# Audit Technique — GLP1 France\n\n> Genere automatiquement par les scripts d'analyse.\n`;
    fs.writeFileSync(auditPath, header + newSection);
  }

  console.log(`\nRapport ecrit dans : ${auditPath}`);
}

// Run
analyze().catch(err => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
