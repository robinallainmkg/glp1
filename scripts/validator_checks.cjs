const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
const RUN_ID = '9e776063-c794-4b3e-b523-9fc0c28c00ad';

function getAllMdFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getAllMdFiles(full));
    else if (entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return match[1];
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function extractYamlFields(yamlStr) {
  const fields = {};
  // Normalize CRLF to LF
  const lines = yamlStr.replace(/\r/g, '').split('\n');
  for (const line of lines) {
    // Skip comment lines (YAML comments like "# Configuration Affiliation")
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^(\w[\w]*)\s*:\s*(.*)$/);
    if (m) {
      const k = m[1].trim();
      const v = m[2].trim().replace(/^["']|["']$/g, '');
      if (fields[k] === undefined) fields[k] = v;
    }
  }
  return fields;
}

function findDuplicateKeys(yamlStr) {
  const keys = [];
  const dups = [];
  // Normalize CRLF to LF
  for (const line of yamlStr.replace(/\r/g, '').split('\n')) {
    // Skip comment lines
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^(\w[\w]*)\s*:/);
    if (m) {
      const k = m[1];
      if (keys.includes(k)) { if (!dups.includes(k)) dups.push(k); }
      else keys.push(k);
    }
  }
  return dups;
}

const contentDir = path.join(__dirname, '..', 'src', 'content');
const files = getAllMdFiles(contentDir).slice(0, 50);

const issues = [];
const articleData = [];

for (const file of files) {
  const rel = path.relative(contentDir, file).replace(/\\/g, '/');
  const slug = path.basename(file, '.md');
  const collection = rel.split('/')[0];
  const content = fs.readFileSync(file, 'utf8');
  const fmStr = parseFrontmatter(content);

  if (!fmStr) {
    issues.push({ slug, file: rel, check_type: 'frontmatter', severity: 'error', message: 'Frontmatter manquant' });
    continue;
  }

  const fields = extractYamlFields(fmStr);
  const dupKeys = findDuplicateKeys(fmStr);

  for (const dk of dupKeys) {
    issues.push({ slug, file: rel, check_type: 'frontmatter', severity: 'error', message: 'Cle YAML dupliquee: ' + dk, ticket_type: 'frontmatter_duplicate_key', urgence: 'urgent' });
  }

  if (!fields.title || fields.title === '') {
    issues.push({ slug, file: rel, check_type: 'frontmatter', severity: 'error', message: 'title manquant ou vide' });
  }

  if (!fields.description || fields.description === '') {
    issues.push({ slug, file: rel, check_type: 'frontmatter', severity: 'error', message: 'description manquante', ticket_type: 'missing_description', urgence: 'urgent' });
  } else {
    const descLen = fields.description.length;
    if (descLen < 50) {
      issues.push({ slug, file: rel, check_type: 'seo_meta', severity: 'warning', message: 'description trop courte: ' + descLen + ' chars (min 50)' });
    } else if (descLen > 160) {
      issues.push({ slug, file: rel, check_type: 'seo_meta', severity: 'warning', message: 'description trop longue: ' + descLen + ' chars (max 160)' });
    }
  }

  if (!fields.mainKeyword || fields.mainKeyword === '') {
    issues.push({ slug, file: rel, check_type: 'frontmatter', severity: 'warning', message: 'mainKeyword manquant' });
  }

  if (fields.title) {
    const tlen = fields.title.length;
    if (tlen < 30) {
      issues.push({ slug, file: rel, check_type: 'seo_meta', severity: 'warning', message: 'title trop court: ' + tlen + ' chars (min 30)' });
    } else if (tlen > 65) {
      issues.push({ slug, file: rel, check_type: 'seo_meta', severity: 'warning', message: 'title trop long: ' + tlen + ' chars (max 65)' });
    }
    if (fields.mainKeyword && !fields.title.toLowerCase().includes(fields.mainKeyword.toLowerCase())) {
      issues.push({ slug, file: rel, check_type: 'seo_meta', severity: 'warning', message: 'mainKeyword absent du title: ' + fields.mainKeyword });
    }
  }

  const body = content.replace(/^---[\s\S]*?---\r?\n/, '');
  const wordCount = countWords(body);
  if (wordCount < 300) {
    issues.push({ slug, file: rel, check_type: 'content_quality', severity: 'warning', message: 'Contenu trop court: ' + wordCount + ' mots (min 300)' });
  }

  const headings = [];
  const hMatches = body.matchAll(/^(#{1,6})\s+/gm);
  for (const m of hMatches) headings.push(m[1].length);
  let h3WithoutH2 = false;
  let lastH2 = false;
  for (const level of headings) {
    if (level === 2) lastH2 = true;
    if (level === 3 && !lastH2) { h3WithoutH2 = true; break; }
  }
  if (h3WithoutH2) {
    issues.push({ slug, file: rel, check_type: 'heading_hierarchy', severity: 'warning', message: 'H3 sans H2 parent' });
  }

  const imgMatches = [...body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  for (const m of imgMatches) {
    const alt = m[1].trim();
    const src = m[2].trim();
    if (!alt || alt.toLowerCase() === 'image' || alt.toLowerCase() === 'photo') {
      issues.push({ slug, file: rel, check_type: 'image', severity: 'warning', message: 'Alt text manquant ou generique pour: ' + src });
    }
  }

  articleData.push({ slug, collection, title: fields.title || '', description: fields.description || '', mainKeyword: fields.mainKeyword || '' });
}

// Duplicate detection
const titles = {};
const descs = {};
const kws = {};
for (const a of articleData) {
  if (a.title) {
    if (titles[a.title]) {
      issues.push({ slug: a.slug, file: '', check_type: 'duplicate', severity: 'error', message: 'Title duplique avec ' + titles[a.title] + ': "' + a.title + '"', ticket_type: 'duplicate_content', urgence: 'warning' });
    } else titles[a.title] = a.slug;
  }
  if (a.description) {
    if (descs[a.description]) {
      issues.push({ slug: a.slug, file: '', check_type: 'duplicate', severity: 'warning', message: 'Description dupliquee avec ' + descs[a.description], ticket_type: 'duplicate_content', urgence: 'warning' });
    } else descs[a.description] = a.slug;
  }
  if (a.mainKeyword) {
    if (kws[a.mainKeyword]) {
      issues.push({ slug: a.slug, file: '', check_type: 'duplicate', severity: 'warning', message: 'mainKeyword duplique "' + a.mainKeyword + '" avec ' + kws[a.mainKeyword], ticket_type: 'duplicate_content', urgence: 'warning' });
    } else kws[a.mainKeyword] = a.slug;
  }
}

const errors = issues.filter(i => i.severity === 'error');
const warnings = issues.filter(i => i.severity === 'warning');
console.log('TOTAL files: ' + files.length);
console.log('ERRORS: ' + errors.length);
console.log('WARNINGS: ' + warnings.length);
console.log('\n=== ERRORS ===');
for (const e of errors) console.log('[' + e.check_type + '] ' + e.slug + ': ' + e.message);
console.log('\n=== WARNINGS (first 30) ===');
for (const w of warnings.slice(0, 30)) console.log('[' + w.check_type + '] ' + w.slug + ': ' + w.message);

fs.writeFileSync('C:/Users/robin/glp1/glp1/scripts/validator_issues.json', JSON.stringify({ issues, articleData }, null, 2));
console.log('\nIssues saved to scripts/validator_issues.json');
