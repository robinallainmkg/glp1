#!/usr/bin/env node
/**
 * Internal Link Audit for dist/ directory
 * Finds broken links, orphan pages, and pages with few incoming links
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const DIST = resolve('dist');
const DOMAIN = 'glp1-france.fr';

// Step 1: Find all HTML pages
console.log('=== Internal Link Audit ===\n');
console.log('--- Step 1: Collecting all content pages in dist/ ---');

const allFiles = execSync(`find "${DIST}" -name "index.html" -o -name "404.html"`, { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);

// Filter out admin, _astro, api, demo, backup pages
const contentPages = allFiles.filter(f => {
  const rel = f.replace(DIST, '');
  return !/\/(admin|admin-dashboard|admin-stats|_astro|api|demo-|index-backup)/.test(rel);
});

console.log(`Found ${contentPages.length} content pages\n`);

// Convert file path to URL path
function fileToUrl(filePath) {
  let rel = filePath.replace(DIST, '');
  rel = rel.replace(/\/index\.html$/, '/');
  rel = rel.replace(/\.html$/, '');
  return rel;
}

// Build set of valid URL paths
const validPaths = new Set();
for (const page of contentPages) {
  const url = fileToUrl(page);
  validPaths.add(url);
  // Also add without trailing slash
  if (url.endsWith('/') && url.length > 1) {
    validPaths.add(url.slice(0, -1));
  }
}

// Step 2: Extract links
console.log('--- Step 2: Extracting internal links ---');

const hrefRegex = /href="([^"]*)"/g;
const skipPatterns = [
  /^$/, /^#/, /^mailto:/, /^tel:/, /^javascript:/,
  /\.xml$/, /\.json$/, /\.svg$/, /\.png$/, /\.jpg$/, /\.jpeg$/, /\.webp$/,
  /\.css$/, /\.js$/, /\.ico$/, /\.woff/, /\/_astro\//, /\/api\//,
  /^\/admin/,
  // JS template artifacts
  /['{}$+]/, /\.collection/, /\.slug/, /\.url/, /article\./, /\.\./
];

const allLinks = [];       // { source, target }
const brokenLinks = [];    // { source, href }
const outgoingCount = {};  // url -> count

for (const page of contentPages) {
  const sourceUrl = fileToUrl(page);
  const html = readFileSync(page, 'utf8');

  let match;
  let count = 0;
  hrefRegex.lastIndex = 0;

  while ((match = hrefRegex.exec(html)) !== null) {
    let href = match[1];

    // Skip based on patterns
    if (skipPatterns.some(p => p.test(href))) continue;

    // Normalize: strip domain
    let normalized = href
      .replace(new RegExp(`https?://www\\.${DOMAIN.replace('.', '\\.')}`, 'g'), '')
      .replace(new RegExp(`https?://${DOMAIN.replace('.', '\\.')}`, 'g'), '');

    // Skip external
    if (/^https?:\/\//.test(normalized)) continue;

    // Skip empty/anchor-only
    if (!normalized || normalized === '#') continue;

    // Strip anchor
    normalized = normalized.split('#')[0];
    if (!normalized) continue;

    // Ensure leading slash
    if (!normalized.startsWith('/')) {
      const sourceDir = sourceUrl.replace(/[^/]*$/, '');
      normalized = sourceDir + normalized;
    }

    // Ensure trailing slash for directory paths
    if (!/\.\w+$/.test(normalized) && !normalized.endsWith('/')) {
      normalized += '/';
    }

    allLinks.push({ source: sourceUrl, target: normalized });
    count++;

    // Check existence
    const noSlash = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
    const withSlash = noSlash + '/';

    const candidates = [
      join(DIST, withSlash, 'index.html'),
      join(DIST, noSlash, 'index.html'),
      join(DIST, noSlash + '.html'),
      join(DIST, normalized),
    ];

    const exists = candidates.some(c => {
      try { return existsSync(c) && statSync(c).isFile(); } catch { return false; }
    });

    if (!exists) {
      brokenLinks.push({ source: sourceUrl, href: href });
    }
  }

  outgoingCount[sourceUrl] = count;
}

console.log(`Found ${allLinks.length} internal links total\n`);

// Step 3: Broken Links
console.log('============================================');
console.log('  BROKEN INTERNAL LINKS');
console.log('============================================');

// Deduplicate
const brokenSet = new Set(brokenLinks.map(b => `${b.source}\t${b.href}`));
const brokenUnique = [...brokenSet].map(s => {
  const [source, href] = s.split('\t');
  return { source, href };
});

// Group by target
const brokenByTarget = {};
for (const b of brokenUnique) {
  if (!brokenByTarget[b.href]) brokenByTarget[b.href] = [];
  brokenByTarget[b.href].push(b.source);
}

const brokenTargets = Object.keys(brokenByTarget).sort();
console.log(`Found ${brokenTargets.length} unique broken link targets:\n`);

for (const target of brokenTargets) {
  const sources = brokenByTarget[target];
  console.log(`  BROKEN: ${target} (${sources.length} pages link here)`);
  for (const src of sources.slice(0, 5)) {
    console.log(`      from: ${src}`);
  }
  if (sources.length > 5) {
    console.log(`      ... and ${sources.length - 5} more`);
  }
}

// Step 4: Incoming link counts
const incomingCount = {};
for (const link of allLinks) {
  // Normalize target for matching
  let t = link.target;
  const noSlash = t.endsWith('/') && t.length > 1 ? t.slice(0, -1) : t;
  const withSlash = noSlash + '/';

  // Use the canonical form (with trailing slash)
  const canonical = withSlash === '//' ? '/' : withSlash;
  incomingCount[canonical] = (incomingCount[canonical] || 0) + 1;
}

// Step 5: Orphan pages
console.log('\n============================================');
console.log('  ORPHAN PAGES (0 incoming internal links)');
console.log('============================================');
console.log('  (excluding test/backup/diagnostic pages)\n');

let orphanReal = 0;
let orphanTest = 0;

for (const page of contentPages) {
  const url = fileToUrl(page);
  if (url === '/') continue;

  const noSlash = url.endsWith('/') ? url.slice(0, -1) : url;
  const withSlash = noSlash + '/';

  const incoming = (incomingCount[withSlash] || 0) + (url === '/' ? 1 : 0);
  // Also check no-slash form
  const incomingAlt = incomingCount[noSlash + '/'] || incomingCount[noSlash] || 0;

  if (incoming === 0 && incomingAlt === 0) {
    const isTest = /(test-|backup|diagnostic|fixed)/.test(url);
    if (isTest) {
      orphanTest++;
    } else {
      orphanReal++;
      console.log(`  ${url}`);
    }
  }
}

console.log(`\nReal orphan pages: ${orphanReal} (+ ${orphanTest} test/backup pages)`);

// Step 6: Pages with few outgoing links (exclude /collections/)
console.log('\n============================================');
console.log('  PAGES WITH VERY FEW OUTGOING LINKS (<=2)');
console.log('  (excluding /collections/ mirror pages)');
console.log('============================================');

const fewOutgoing = Object.entries(outgoingCount)
  .filter(([url, cnt]) => cnt <= 2 && !url.includes('/collections/'))
  .sort((a, b) => a[1] - b[1]);

for (const [url, cnt] of fewOutgoing) {
  console.log(`  ${url.padEnd(70)} ${cnt} outgoing links`);
}

// Step 7: Pages with few incoming (1-2), excluding collections/test
console.log('\n============================================');
console.log('  PAGES WITH FEW INCOMING LINKS (1-2)');
console.log('  (excluding /collections/ and test pages)');
console.log('============================================');

for (const page of contentPages) {
  const url = fileToUrl(page);
  if (url === '/') continue;
  if (/\/(collections|test-|backup|diagnostic|fixed)/.test(url)) continue;

  const noSlash = url.endsWith('/') ? url.slice(0, -1) : url;
  const withSlash = noSlash + '/';
  const count = incomingCount[withSlash] || incomingCount[noSlash] || 0;

  if (count >= 1 && count <= 2) {
    console.log(`  ${url.padEnd(70)} ${count} incoming links`);
  }
}

// Step 8: Top linked pages
console.log('\n============================================');
console.log('  TOP 20 MOST LINKED-TO PAGES');
console.log('============================================');

const topLinked = Object.entries(incomingCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

for (const [url, cnt] of topLinked) {
  console.log(`  ${String(cnt).padStart(5)}  ${url}`);
}

// Step 9: Summary
console.log('\n============================================');
console.log('  SUMMARY');
console.log('============================================');
console.log(`  Total content pages:          ${contentPages.length}`);
console.log(`  Total internal links:         ${allLinks.length}`);
console.log(`  Broken link targets:          ${brokenTargets.length}`);
console.log(`  Broken link instances:        ${brokenUnique.length}`);
console.log(`  Orphan pages (real content):  ${orphanReal}`);
console.log(`  Orphan pages (test/backup):   ${orphanTest}`);

const avgOut = (Object.values(outgoingCount).reduce((a, b) => a + b, 0) / contentPages.length).toFixed(1);
console.log(`  Avg outgoing links/page:      ${avgOut}`);

console.log('\n=== Audit Complete ===');
