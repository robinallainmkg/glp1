import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename, dirname, extname } from 'path';

const BASE_DIR = 'C:/Users/robin/glp1/glp1/src/content';
const PUBLIC_DIR = 'C:/Users/robin/glp1/glp1/public';

function getAllMdFiles(dir, result = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fullPath = join(dir, e.name);
    if (e.isDirectory()) {
      getAllMdFiles(fullPath, result);
    } else if (e.name.endsWith('.md') || e.name.endsWith('.mdx')) {
      result.push(fullPath);
    }
  }
  return result;
}

const allFiles = getAllMdFiles(BASE_DIR);
const files = allFiles.slice(0, 100);

console.log(`Total MD files: ${allFiles.length}, checking first 100`);

const errors = [];
const warnings = [];
const seoErrors = [];
const seoWarnings = [];

const titlesSeen = {};
const descsSeen = {};
const keywordsSeen = {};

function extractFrontmatter(content) {
  if (!content.startsWith('---')) return { fm: null, body: content };
  const end = content.indexOf('---', 3);
  if (end === -1) return { fm: null, body: content };
  return {
    fm: content.slice(3, end).trim(),
    body: content.slice(end + 3).trim()
  };
}

function parseYaml(fmText) {
  const fields = {};
  const dupKeys = [];
  const seenKeys = [];

  const lines = fmText.split('\n');
  let currentKey = null;
  let currentVal = [];

  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.*)/);
    if (m && !line.startsWith(' ') && !line.startsWith('\t')) {
      if (currentKey) {
        const v = currentVal.join('\n').trim();
        if (seenKeys.includes(currentKey)) dupKeys.push(currentKey);
        seenKeys.push(currentKey);
        if (!(currentKey in fields)) fields[currentKey] = v;
      }
      currentKey = m[1];
      currentVal = [m[2]];
    } else if (currentKey) {
      currentVal.push(line);
    }
  }
  if (currentKey) {
    const v = currentVal.join('\n').trim();
    if (seenKeys.includes(currentKey)) dupKeys.push(currentKey);
    seenKeys.push(currentKey);
    if (!(currentKey in fields)) fields[currentKey] = v;
  }
  return { fields, dupKeys };
}

// Also collect all image refs and link refs
const allImageRefs = new Set();
const allLinkRefs = new Set();

for (const filepath of files) {
  let content;
  try {
    content = readFileSync(filepath, 'utf-8');
  } catch (e) {
    errors.push(`ERROR: ${filepath}: Cannot read: ${e.message}`);
    continue;
  }

  const slug = basename(filepath).replace(/\.mdx?$/, '');
  const dir = basename(dirname(filepath));

  const { fm, body } = extractFrontmatter(content);
  if (!fm) {
    errors.push(`ERROR: ${slug} (${dir}): No frontmatter`);
    continue;
  }

  const { fields, dupKeys } = parseYaml(fm);

  if (dupKeys.length > 0) {
    errors.push(`ERROR: ${slug} (${dir}): Duplicate YAML keys: ${dupKeys.join(', ')}`);
  }

  const title = (fields.title || '').replace(/^["']|["']$/g, '').trim();
  const description = (fields.description || '').replace(/^["']|["']$/g, '').trim();
  const mainKeyword = (fields.mainKeyword || fields.main_keyword || '').replace(/^["']|["']$/g, '').trim();
  const dateVal = (fields.date || '').replace(/^["']|["']$/g, '').trim();

  if (!title) errors.push(`ERROR: ${slug} (${dir}): Missing title`);

  if (!description) {
    errors.push(`ERROR: ${slug} (${dir}): Missing description`);
  } else if (description.length < 50) {
    warnings.push(`WARNING: ${slug} (${dir}): Description too short (${description.length} chars, min 50)`);
  } else if (description.length > 160) {
    warnings.push(`WARNING: ${slug} (${dir}): Description too long (${description.length} chars, max 160)`);
  }

  if (!mainKeyword) warnings.push(`WARNING: ${slug} (${dir}): Missing mainKeyword`);

  if (!dateVal) {
    warnings.push(`WARNING: ${slug} (${dir}): Missing date`);
  } else if (!/^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
    warnings.push(`WARNING: ${slug} (${dir}): Invalid date format: ${dateVal}`);
  }

  for (const [k, v] of Object.entries(fields)) {
    if (v === 'null' || v === 'NULL' || v === '~' || v === '') {
      warnings.push(`WARNING: ${slug} (${dir}): Empty/null field '${k}'`);
    }
  }

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  if (wordCount < 300) {
    warnings.push(`WARNING: ${slug} (${dir}): Content too short (${wordCount} words, min 300)`);
  }

  // SEO checks
  if (title) {
    if (title.length < 30) seoWarnings.push(`SEO_WARN: ${slug}: Title too short (${title.length} chars)`);
    else if (title.length > 65) seoWarnings.push(`SEO_WARN: ${slug}: Title too long (${title.length} chars)`);
  }
  if (description) {
    if (description.length < 120) seoWarnings.push(`SEO_WARN: ${slug}: Description too short for SEO (${description.length} chars, min 120)`);
  }
  const mkLower = mainKeyword.toLowerCase();
  if (mkLower && title && !title.toLowerCase().includes(mkLower)) {
    seoWarnings.push(`SEO_WARN: ${slug}: mainKeyword not in title`);
  }
  if (mkLower && description && !description.toLowerCase().includes(mkLower)) {
    seoWarnings.push(`SEO_WARN: ${slug}: mainKeyword not in description`);
  }

  // Duplicates
  if (title) {
    if (titlesSeen[title]) seoErrors.push(`DUPLICATE_ERROR: Title shared by "${slug}" and "${titlesSeen[title]}"`);
    else titlesSeen[title] = slug;
  }
  if (description) {
    if (descsSeen[description]) seoWarnings.push(`DUPLICATE_WARN: Description shared by "${slug}" and "${descsSeen[description]}"`);
    else descsSeen[description] = slug;
  }
  if (mkLower) {
    if (keywordsSeen[mkLower]) seoWarnings.push(`DUPLICATE_WARN: mainKeyword "${mkLower}" shared by "${slug}" and "${keywordsSeen[mkLower]}"`);
    else keywordsSeen[mkLower] = slug;
  }

  // Collect image refs from body
  const imgMatches = body.matchAll(/!\[.*?\]\(([^)]+)\)/g);
  for (const m of imgMatches) {
    allImageRefs.add(m[1]);
  }
  // Also from frontmatter (image field)
  if (fields.image) allImageRefs.add(fields.image.replace(/^["']|["']$/g, '').trim());
  if (fields.thumbnail) allImageRefs.add(fields.thumbnail.replace(/^["']|["']$/g, '').trim());

  // Collect internal link refs
  const linkMatches = body.matchAll(/\[.*?\]\((\/[^)#?]+)\)/g);
  for (const m of linkMatches) {
    allLinkRefs.add(m[1]);
  }
}

console.log('\n=== FRONTMATTER ERRORS ===');
for (const e of errors) console.log(e);
console.log(`Total errors: ${errors.length}`);

console.log('\n=== FRONTMATTER WARNINGS (first 30) ===');
for (const w of warnings.slice(0, 30)) console.log(w);
if (warnings.length > 30) console.log(`... and ${warnings.length - 30} more`);
console.log(`Total warnings: ${warnings.length}`);

console.log('\n=== SEO ERRORS ===');
for (const e of seoErrors) console.log(e);
console.log(`Total SEO errors: ${seoErrors.length}`);

console.log('\n=== SEO WARNINGS (first 20) ===');
for (const w of seoWarnings.slice(0, 20)) console.log(w);
if (seoWarnings.length > 20) console.log(`... and ${seoWarnings.length - 20} more`);
console.log(`Total SEO warnings: ${seoWarnings.length}`);

// Image verification
console.log('\n=== IMAGE VERIFICATION ===');
let missingImages = 0;
for (const imgRef of allImageRefs) {
  if (imgRef.startsWith('/') || imgRef.startsWith('./') || imgRef.startsWith('../')) {
    const cleanRef = imgRef.startsWith('/') ? imgRef : imgRef;
    const fullPath = join(PUBLIC_DIR, cleanRef);
    if (!existsSync(fullPath)) {
      console.log(`MISSING_IMAGE: ${imgRef} -> ${fullPath}`);
      missingImages++;
    }
  }
}
console.log(`Missing images: ${missingImages} / ${allImageRefs.size} refs checked`);

// Internal links verification
console.log('\n=== INTERNAL LINKS VERIFICATION (sample) ===');
const DIST_DIR = 'C:/Users/robin/glp1/glp1/dist';
let brokenLinks = 0;
let checkedLinks = 0;
const linkIssues = [];
for (const linkRef of allLinkRefs) {
  checkedLinks++;
  // Check if there's a built HTML file
  const htmlPath = join(DIST_DIR, linkRef.endsWith('/') ? linkRef : linkRef + '/', 'index.html');
  const htmlPathNoSlash = join(DIST_DIR, linkRef, 'index.html');
  if (!existsSync(htmlPath) && !existsSync(htmlPathNoSlash)) {
    // Also check as direct file
    const directPath = join(DIST_DIR, linkRef);
    if (!existsSync(directPath)) {
      linkIssues.push(`BROKEN_LINK: ${linkRef}`);
      brokenLinks++;
    }
  }
}
for (const issue of linkIssues.slice(0, 20)) console.log(issue);
if (linkIssues.length > 20) console.log(`... and ${linkIssues.length - 20} more`);
console.log(`Broken links: ${brokenLinks} / ${checkedLinks} checked`);

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Files checked: ${Math.min(allFiles.length, 100)}`);
console.log(`Frontmatter errors: ${errors.length}`);
console.log(`Frontmatter warnings: ${warnings.length}`);
console.log(`SEO errors: ${seoErrors.length}`);
console.log(`SEO warnings: ${seoWarnings.length}`);
console.log(`Missing images: ${missingImages}`);
console.log(`Broken links: ${brokenLinks}`);
