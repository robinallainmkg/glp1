import 'dotenv/config';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, extname, dirname, sep } from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RUN_ID = '939609b1-a96c-4204-95f3-09884b5ab4cb';
const ROOT = 'C:\\Users\\robin\\glp1\\glp1';
const CONTENT_DIR = join(ROOT, 'src', 'content');

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

function parseFrontmatter(rawContent) {
  // Normalize line endings
  const content = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const match = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return { error: 'missing_frontmatter', yaml: null, duplicates: [], fields: {} };

  const yaml = match[1];
  const lines = yaml.split('\n');
  const keys = {};
  const duplicates = [];
  const fields = {};

  for (const line of lines) {
    const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
    if (keyMatch) {
      const key = keyMatch[1];
      let value = keyMatch[2].trim();
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (keys[key]) duplicates.push(key);
      keys[key] = true;
      if (!fields[key]) fields[key] = value;
    }
  }

  return { yaml, duplicates, fields };
}

function countWords(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function getBody(rawContent) {
  const content = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1] : '';
}

// Main validation
const allIssues = [];
const allMeta = [];

console.log('=== VALIDATION FRONTMATTER + SEO + CONTENU ===');
const files = findMarkdownFiles(CONTENT_DIR).slice(0, 100);
console.log(`Analyse de ${files.length} fichiers...`);

for (const file of files) {
  let rawContent;
  try {
    rawContent = readFileSync(file, 'utf8');
  } catch (e) {
    console.error(`Impossible de lire: ${file}`);
    continue;
  }
  const slug = basename(file, extname(file));
  const collection = dirname(file).split(sep).pop();

  const { error, yaml, duplicates, fields } = parseFrontmatter(rawContent);

  if (error === 'missing_frontmatter') {
    allIssues.push({ slug, collection, type: 'frontmatter', severity: 'error', msg: 'Frontmatter YAML manquant' });
    continue;
  }

  // Duplicate keys
  if (duplicates.length > 0) {
    allIssues.push({ slug, collection, type: 'frontmatter', severity: 'error', msg: `Cles YAML dupliquees: ${duplicates.join(', ')}` });
  }

  const title = fields.title || null;
  const description = fields.description || null;
  const mainKeyword = fields.mainKeyword || null;
  const date = fields.date || fields.pubDate || null;

  // Frontmatter required fields
  if (!title || title === '') {
    allIssues.push({ slug, collection, type: 'frontmatter', severity: 'error', msg: 'title manquant ou vide' });
  }
  if (!description || description === '') {
    allIssues.push({ slug, collection, type: 'frontmatter', severity: 'error', msg: 'description manquante ou vide' });
  } else if (description.length < 50) {
    allIssues.push({ slug, collection, type: 'frontmatter', severity: 'warning', msg: `description trop courte: ${description.length} chars (min 50)` });
  }
  if (!mainKeyword) {
    allIssues.push({ slug, collection, type: 'frontmatter', severity: 'warning', msg: 'mainKeyword manquant' });
  }
  if (!date) {
    allIssues.push({ slug, collection, type: 'frontmatter', severity: 'warning', msg: 'date manquante' });
  }

  // SEO meta checks
  if (title) {
    if (title.length < 30 || title.length > 65) {
      allIssues.push({ slug, collection, type: 'seo_meta', severity: 'warning', msg: `title longueur: ${title.length} chars (attendu 30-65)` });
    }
    if (mainKeyword && !title.toLowerCase().includes(mainKeyword.toLowerCase())) {
      allIssues.push({ slug, collection, type: 'seo_meta', severity: 'warning', msg: `mainKeyword "${mainKeyword}" absent du title` });
    }
  }
  if (description) {
    if (description.length < 120 || description.length > 160) {
      allIssues.push({ slug, collection, type: 'seo_meta', severity: 'warning', msg: `description longueur: ${description.length} chars (attendu 120-160)` });
    }
    if (mainKeyword && !description.toLowerCase().includes(mainKeyword.toLowerCase())) {
      allIssues.push({ slug, collection, type: 'seo_meta', severity: 'warning', msg: `mainKeyword absent de la description` });
    }
  }

  // Content quality
  const body = getBody(rawContent);
  const wordCount = countWords(body);
  if (wordCount < 300) {
    allIssues.push({ slug, collection, type: 'content_quality', severity: 'warning', msg: `Contenu trop court: ${wordCount} mots (min 300)` });
  }

  // Heading hierarchy: check for H3 without H2
  const headings = (body.match(/^(#{1,4})\s+.+$/gm) || []);
  let hasH2 = false;
  let headingIssue = false;
  for (const h of headings) {
    const level = h.match(/^(#+)/)[1].length;
    if (level === 2) hasH2 = true;
    if (level === 3 && !hasH2) { headingIssue = true; break; }
  }
  if (headingIssue) {
    allIssues.push({ slug, collection, type: 'heading_hierarchy', severity: 'warning', msg: 'H3 sans H2 parent detecte' });
  }

  allMeta.push({ slug, collection, title, description, mainKeyword, wordCount });
}

// Detect duplicates
console.log('\n=== DETECTION DOUBLONS ===');
const titleMap = {};
const descMap = {};
const kwMap = {};
let dupCount = 0;

for (const m of allMeta) {
  if (m.title) {
    if (titleMap[m.title]) {
      allIssues.push({ slug: m.slug, collection: m.collection, type: 'duplicate', severity: 'error', msg: `Title duplique avec ${titleMap[m.title]}` });
      dupCount++;
    } else titleMap[m.title] = m.slug;
  }
  if (m.description && typeof m.description === 'string' && m.description.length > 10) {
    const key = m.description.substring(0, 100);
    if (descMap[key]) {
      allIssues.push({ slug: m.slug, collection: m.collection, type: 'duplicate', severity: 'warning', msg: `Description similaire a ${descMap[key]}` });
      dupCount++;
    } else descMap[key] = m.slug;
  }
  if (m.mainKeyword) {
    const kwLower = m.mainKeyword.toLowerCase();
    if (kwMap[kwLower]) {
      allIssues.push({ slug: m.slug, collection: m.collection, type: 'duplicate', severity: 'warning', msg: `mainKeyword duplique avec ${kwMap[kwLower]}` });
      dupCount++;
    } else kwMap[kwLower] = m.slug;
  }
}
console.log(`${dupCount} doublons detectes`);

// Encoding check
console.log('\n=== VERIFICATION ENCODAGE ===');
const astroPages = join(ROOT, 'src', 'pages');
function findAstroFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findAstroFiles(fullPath));
      } else if (entry.name.endsWith('.astro')) {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

const astroFiles = findAstroFiles(astroPages);
let encodingIssues = 0;
for (const file of astroFiles) {
  try {
    const content = readFileSync(file, 'utf8');
    if (content.includes('\uFFFD')) {
      const slug = basename(file, '.astro');
      allIssues.push({ slug, collection: 'pages', type: 'encoding', severity: 'error', msg: `Caractere de remplacement Unicode (U+FFFD) detecte dans ${basename(file)}` });
      encodingIssues++;
    }
  } catch (e) {}
}
console.log(`${encodingIssues} fichiers Astro avec problemes d'encodage`);

// Summary
const errors = allIssues.filter(i => i.severity === 'error');
const warnings = allIssues.filter(i => i.severity === 'warning');
const frontmatterErrors = allIssues.filter(i => i.type === 'frontmatter' && i.severity === 'error');
const seoWarnings = allIssues.filter(i => i.type === 'seo_meta');
const contentWarnings = allIssues.filter(i => i.type === 'content_quality');
const duplicateIssues = allIssues.filter(i => i.type === 'duplicate');
const encodingErrors = allIssues.filter(i => i.type === 'encoding');

console.log('\n=== RESUME ===');
console.log(`Fichiers analyses: ${files.length}`);
console.log(`Total issues: ${allIssues.length}`);
console.log(`  Errors: ${errors.length}`);
console.log(`  Warnings: ${warnings.length}`);
console.log(`  Frontmatter errors: ${frontmatterErrors.length}`);
console.log(`  SEO warnings: ${seoWarnings.length}`);
console.log(`  Contenu trop court: ${contentWarnings.length}`);
console.log(`  Doublons: ${duplicateIssues.length}`);
console.log(`  Encodage: ${encodingErrors.length}`);

console.log('\nERRORS (frontmatter + duplicates + encoding):');
errors.forEach(e => console.log(`  [ERROR] ${e.collection}/${e.slug} | ${e.type}: ${e.msg}`));

console.log('\nSEO WARNINGS (premiers 20):');
seoWarnings.slice(0, 20).forEach(w => console.log(`  [WARN SEO] ${w.collection}/${w.slug}: ${w.msg}`));

// Write to Supabase — only new results (clear previous from this run first)
console.log('\n=== ECRITURE SUPABASE ===');
// Delete previous results from this run (errors from the wrong parse)
const { error: delErr } = await supabase.from('validation_results')
  .delete()
  .eq('agent_run_id', RUN_ID)
  .neq('check_type', 'build');
if (delErr) console.error('Delete error:', delErr.message);
else console.log('Anciens resultats supprimes');

const results = allIssues.map(i => ({
  agent_run_id: RUN_ID,
  article_slug: i.slug,
  check_type: i.type,
  severity: i.severity,
  message: i.msg,
  details: { collection: i.collection }
}));

async function insertBatch(items) {
  for (let i = 0; i < items.length; i += 50) {
    const batch = items.slice(i, i + 50);
    const { error } = await supabase.from('validation_results').insert(batch);
    if (error) console.error(`Insert error (batch ${Math.floor(i/50)+1}):`, error.message);
    else process.stdout.write('.');
  }
  console.log('\ndone');
}

await insertBatch(results);

// Export for ticket creation
console.log('\nSTATS:' + JSON.stringify({
  files: files.length,
  errors: errors.length,
  warnings: warnings.length,
  frontmatterErrors: frontmatterErrors.length,
  seoWarnings: seoWarnings.length,
  contentWarnings: contentWarnings.length,
  duplicates: duplicateIssues.length,
  encodingIssues: encodingErrors.length,
  issues: allIssues
}));
