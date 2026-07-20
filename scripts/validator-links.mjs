import 'dotenv/config';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename, extname, dirname, sep } from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RUN_ID = '939609b1-a96c-4204-95f3-09884b5ab4cb';
const ROOT = 'C:\\Users\\robin\\glp1\\glp1';
const CONTENT_DIR = join(ROOT, 'src', 'content');
const PUBLIC_DIR = join(ROOT, 'public');
const DIST_DIR = join(ROOT, 'dist');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function findMarkdownFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findMarkdownFiles(fullPath));
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

function checkLinkExists(href) {
  // Remove anchor
  const path = href.split('#')[0];
  if (!path || path === '/') return true;

  // Try dist/path/index.html
  const withSlash = path.endsWith('/') ? path : path + '/';
  const candidate1 = join(DIST_DIR, withSlash, 'index.html');
  if (existsSync(candidate1)) return true;

  // Try dist/path.html
  const candidate2 = join(DIST_DIR, path + '.html');
  if (existsSync(candidate2)) return true;

  return false;
}

function checkImageExists(src) {
  if (!src.startsWith('/')) return true; // Relative paths skip
  const candidate = join(PUBLIC_DIR, src);
  return existsSync(candidate);
}

const allIssues = [];
const files = findMarkdownFiles(CONTENT_DIR).slice(0, 100);

console.log(`=== VERIFICATION LIENS INTERNES (${files.length} fichiers) ===`);
let brokenCount = 0;

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch (e) {
    continue;
  }
  const slug = basename(file, extname(file));
  const collection = dirname(file).split(sep).pop();

  // Extract internal links (markdown format)
  const linkRegex = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[2];
    if (!checkLinkExists(href)) {
      allIssues.push({
        slug, collection,
        type: 'internal_link', severity: 'error',
        msg: `Lien interne casse: ${href}`
      });
      brokenCount++;
    }
  }

  // Extract href attributes
  const hrefRegex = /href="(\/[^"]+)"/g;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (!checkLinkExists(href)) {
      allIssues.push({
        slug, collection,
        type: 'internal_link', severity: 'error',
        msg: `Lien href casse: ${href}`
      });
      brokenCount++;
    }
  }
}

console.log(`Liens internes casses: ${brokenCount}`);

console.log('\n=== VERIFICATION IMAGES ===');
let imgMissing = 0;
let altMissing = 0;

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch (e) {
    continue;
  }
  const slug = basename(file, extname(file));
  const collection = dirname(file).split(sep).pop();

  // Markdown images
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const alt = match[1];
    const src = match[2].split(' ')[0]; // Remove optional title

    if (!alt || alt === '' || alt.toLowerCase() === 'image' || alt.toLowerCase() === 'photo') {
      allIssues.push({
        slug, collection,
        type: 'image', severity: 'warning',
        msg: `Alt text vide ou generique pour: ${src}`
      });
      altMissing++;
    }

    if (src.startsWith('/') && !checkImageExists(src)) {
      allIssues.push({
        slug, collection,
        type: 'image', severity: 'warning',
        msg: `Image manquante: ${src}`
      });
      imgMissing++;
    }
  }
}

console.log(`Images manquantes: ${imgMissing}`);
console.log(`Alt text vides/generiques: ${altMissing}`);

// Summary
const errors = allIssues.filter(i => i.severity === 'error');
const warnings = allIssues.filter(i => i.severity === 'warning');

console.log('\n=== RESUME ===');
console.log(`Total issues: ${allIssues.length} (${errors.length} errors, ${warnings.length} warnings)`);

if (errors.length > 0) {
  console.log('\nERRORS (liens casses):');
  errors.slice(0, 20).forEach(e => console.log(`  [ERROR] ${e.collection}/${e.slug}: ${e.msg}`));
}

// Write to Supabase
console.log('\n=== ECRITURE SUPABASE ===');
const results = allIssues.map(i => ({
  agent_run_id: RUN_ID,
  article_slug: i.slug,
  check_type: i.type,
  severity: i.severity,
  message: i.msg,
  details: { collection: i.collection }
}));

for (let i = 0; i < results.length; i += 50) {
  const batch = results.slice(i, i + 50);
  const { error } = await supabase.from('validation_results').insert(batch);
  if (error) console.error(`Insert error:`, error.message);
  else process.stdout.write('.');
}
console.log('\ndone');

console.log('EXPORT:' + JSON.stringify({ issues: allIssues, totals: { brokenLinks: brokenCount, imgMissing, altMissing } }));
