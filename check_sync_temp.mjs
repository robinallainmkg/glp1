import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';

const BASE_DIR = 'C:/Users/robin/glp1/glp1/src/content';
const DIST_DIR = 'C:/Users/robin/glp1/glp1/dist';

// Get all MD files on disk
function getAllMdFiles(dir, result = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fullPath = join(dir, e.name);
    if (e.isDirectory()) {
      getAllMdFiles(fullPath, result);
    } else if (e.name.endsWith('.md') || e.name.endsWith('.mdx')) {
      result.push({
        slug: e.name.replace(/\.mdx?$/, ''),
        collection: basename(dirname(fullPath)),
        path: fullPath
      });
    }
  }
  return result;
}

const diskFiles = getAllMdFiles(BASE_DIR);
const diskSlugs = new Set(diskFiles.map(f => f.slug));

// Load Supabase data
const supabaseData = JSON.parse(readFileSync('C:/Users/robin/glp1/glp1/supabase_slugs_temp.json', 'utf-8'));
const supabaseSlugs = new Set(supabaseData.map(a => a.slug));

console.log(`\n=== SUPABASE/FILES COHERENCE ===`);
console.log(`Supabase active articles: ${supabaseData.length}`);
console.log(`Disk files: ${diskFiles.length}`);

// In Supabase but not on disk
const syncIssues = [];
for (const article of supabaseData) {
  if (!diskSlugs.has(article.slug)) {
    syncIssues.push(`SYNC_ISSUE: Supabase slug "${article.slug}" (${article.collection}) not found on disk`);
  }
}

// On disk but not in Supabase (informational)
const onDiskNotInSupa = [];
for (const f of diskFiles) {
  if (!supabaseSlugs.has(f.slug) && f.slug !== '_category_') {
    onDiskNotInSupa.push(`INFO: Disk file "${f.slug}" not in Supabase active articles`);
  }
}

for (const issue of syncIssues) console.log(issue);
if (syncIssues.length === 0) console.log('All Supabase active articles found on disk');

console.log(`\nSync issues: ${syncIssues.length}`);
console.log(`Files on disk not in Supabase: ${onDiskNotInSupa.length}`);
for (const info of onDiskNotInSupa.slice(0, 10)) console.log(info);
if (onDiskNotInSupa.length > 10) console.log(`... and ${onDiskNotInSupa.length - 10} more`);

// Sitemap verification
console.log('\n=== SITEMAP VERIFICATION ===');
let sitemapOk = false;
let sitemapCount = 0;
const sitemapPath = 'C:/Users/robin/glp1/glp1/dist/sitemap-0.xml';
const sitemapIndexPath = 'C:/Users/robin/glp1/glp1/dist/sitemap-index.xml';

if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf-8');
  const urlMatches = sitemap.match(/<loc>/g);
  sitemapCount = urlMatches ? urlMatches.length : 0;
  console.log(`sitemap-0.xml found with ${sitemapCount} URLs`);
  sitemapOk = true;
} else if (existsSync(sitemapIndexPath)) {
  const sitemapIndex = readFileSync(sitemapIndexPath, 'utf-8');
  console.log(`sitemap-index.xml found`);
  // Count sitemap files
  const sitemaps = sitemapIndex.match(/<loc>/g);
  console.log(`Contains ${sitemaps ? sitemaps.length : 0} sitemap references`);
  sitemapOk = true;
} else {
  console.log('ERROR: No sitemap found in dist/');
}

// HTML build verification (10 pages)
console.log('\n=== HTML BUILD VERIFICATION (10 pages) ===');
const htmlIssues = [];
const testPages = [
  'C:/Users/robin/glp1/glp1/dist/index.html',
  'C:/Users/robin/glp1/glp1/dist/alternatives-glp1/acupuncture-glp1/index.html',
  'C:/Users/robin/glp1/glp1/dist/effets-secondaires-glp1/ozempic-danger/index.html',
  'C:/Users/robin/glp1/glp1/dist/glp1-cout/prix-ozempic-france/index.html',
  'C:/Users/robin/glp1/glp1/dist/glp1-perte-de-poids/glp1-perte-de-poids/index.html',
  'C:/Users/robin/glp1/glp1/dist/traitements-glp1/guide-ozempic/index.html',
];

for (const pagePath of testPages) {
  if (!existsSync(pagePath)) {
    // Try to find a similar page
    htmlIssues.push(`WARN: Page not found: ${pagePath}`);
    continue;
  }
  const html = readFileSync(pagePath, 'utf-8');

  const checks = {
    title: /<title>[^<]+<\/title>/.test(html),
    metaDesc: /<meta\s+name="description"/.test(html) || /<meta\s+content="[^"]{10,}"\s+name="description"/.test(html),
    canonical: /<link\s+rel="canonical"/.test(html),
    htmlLang: /<html[^>]+lang="/.test(html),
    ogTitle: /<meta\s+property="og:title"/.test(html),
    ogDesc: /<meta\s+property="og:description"/.test(html),
  };

  const failedChecks = Object.entries(checks).filter(([k,v]) => !v).map(([k]) => k);
  const page = pagePath.replace('C:/Users/robin/glp1/glp1/dist/', '').replace('/index.html', '') || 'homepage';

  if (failedChecks.length > 0) {
    htmlIssues.push(`HTML_ISSUE: ${page}: Missing ${failedChecks.join(', ')}`);
  } else {
    console.log(`HTML_OK: ${page}: All checks passed`);
  }
}
for (const issue of htmlIssues) console.log(issue);

// UTF-8 encoding check
console.log('\n=== UTF-8 ENCODING CHECK ===');
const PAGES_DIR = 'C:/Users/robin/glp1/glp1/src/pages';
function getAllAstroFiles(dir, result = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const fullPath = join(dir, e.name);
      if (e.isDirectory()) {
        getAllAstroFiles(fullPath, result);
      } else if (e.name.endsWith('.astro')) {
        result.push(fullPath);
      }
    }
  } catch {}
  return result;
}

const astroFiles = getAllAstroFiles(PAGES_DIR);
let encodingIssues = 0;
for (const f of astroFiles) {
  try {
    const content = readFileSync(f, 'utf-8');
    if (content.includes('\uFFFD')) {
      console.log(`ENCODING_ISSUE: ${f.replace('C:/Users/robin/glp1/glp1/', '')}: Contains U+FFFD replacement character`);
      encodingIssues++;
    }
  } catch {}
}
if (encodingIssues === 0) console.log(`Encoding OK: No U+FFFD found in ${astroFiles.length} .astro files`);
else console.log(`Encoding issues found: ${encodingIssues}`);

console.log('\n=== FINAL SUMMARY ===');
console.log(`Supabase sync issues: ${syncIssues.length}`);
console.log(`Sitemap OK: ${sitemapOk}, URLs: ${sitemapCount}`);
console.log(`HTML build issues: ${htmlIssues.length}`);
console.log(`Encoding issues: ${encodingIssues}`);
