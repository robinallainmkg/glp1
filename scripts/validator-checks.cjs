// Validator checks script — used by agent validator
const fs = require('fs');
const path = require('path');

function walkDir(dir, ext) {
  let files = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory() && !item.startsWith('.')) files = files.concat(walkDir(full, ext));
      else if (!ext || item.endsWith(ext)) files.push(full);
    }
  } catch (e) {}
  return files;
}

const checks = process.argv[2] || 'all';

// === HTML OUTPUT CHECK ===
if (checks === 'html' || checks === 'all') {
  const htmlFiles = walkDir('dist', '.html')
    .filter(f => !f.includes('admin'))
    .slice(0, 15);
  const issues = [];

  for (const f of htmlFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const slug = f
      .replace(/^.*[/\\]dist[/\\]/, '')
      .replace(/[/\\]index\.html$/, '')
      .replace(/\\/g, '/');

    if (!content.includes('<title>')) issues.push({ type: 'MISSING_TITLE_TAG', severity: 'error', slug });
    if (!content.includes('name="description"')) issues.push({ type: 'MISSING_META_DESC', severity: 'error', slug });
    if (!content.includes('rel="canonical"')) issues.push({ type: 'MISSING_CANONICAL', severity: 'warning', slug });
    if (!content.includes('og:title')) issues.push({ type: 'MISSING_OG_TITLE', severity: 'warning', slug });
    if (!content.includes('lang="fr"') && !content.includes("lang='fr'")) {
      issues.push({ type: 'MISSING_LANG_FR', severity: 'warning', slug });
    }
    const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    if (mainMatch && mainMatch[1].trim().length < 100) {
      issues.push({ type: 'EMPTY_MAIN', severity: 'error', slug });
    }
  }

  console.log('=== HTML CHECK ===');
  console.log('HTML CHECKS: ' + htmlFiles.length + ' pages');
  for (const i of issues) console.log('[' + i.severity.toUpperCase() + '] [' + i.type + '] ' + i.slug);
  console.log('HTML ISSUES: ' + issues.length);
}

// === IMAGE CHECK ===
if (checks === 'images' || checks === 'all') {
  const mdFiles = walkDir('src/content', '.md');
  const missing = [];
  const emptyAlt = [];

  for (const filePath of mdFiles) {
    const raw = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
    const slug = path.basename(filePath, '.md');
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let m;
    while ((m = imgRegex.exec(raw)) !== null) {
      const alt = m[1].trim();
      const src = m[2].trim();
      if (!alt || alt === 'image' || alt === 'photo') emptyAlt.push({ slug, src });
      if (!src.startsWith('http') && !src.startsWith('data:')) {
        const imgPath = src.startsWith('/') ? 'public' + src : path.join(path.dirname(filePath), src);
        if (!fs.existsSync(imgPath)) missing.push({ slug, src });
      }
    }
  }

  console.log('=== IMAGE CHECK ===');
  console.log('MISSING IMAGES: ' + missing.length);
  missing.slice(0, 20).forEach(i => console.log('  [' + i.slug + '] ' + i.src));
  console.log('EMPTY ALT: ' + emptyAlt.length);
  emptyAlt.slice(0, 10).forEach(i => console.log('  [' + i.slug + '] ' + i.src));
}

// === CONTENT QUALITY CHECK ===
if (checks === 'quality' || checks === 'all') {
  const mdFiles = walkDir('src/content', '.md');
  const shortContent = [];
  const headingIssues = [];

  for (const filePath of mdFiles) {
    const raw = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
    const slug = path.basename(filePath, '.md');
    // Remove frontmatter
    const body = raw.replace(/^---[\s\S]*?---\n/, '');
    const wordCount = body.trim().split(/\s+/).length;
    if (wordCount < 300) shortContent.push({ slug, wordCount });

    // Check heading hierarchy
    const lines = body.split('\n');
    let hasH2 = false, hasH3 = false;
    for (const line of lines) {
      if (line.startsWith('## ')) hasH2 = true;
      if (line.startsWith('### ')) {
        hasH3 = true;
        if (!hasH2) { headingIssues.push({ slug, issue: 'H3 without H2' }); break; }
      }
      if (line.startsWith('#### ') && !hasH3) { headingIssues.push({ slug, issue: 'H4 without H3' }); break; }
    }
  }

  console.log('=== CONTENT QUALITY ===');
  console.log('SHORT CONTENT (<300 words): ' + shortContent.length);
  shortContent.slice(0, 10).forEach(i => console.log('  [' + i.slug + '] ' + i.wordCount + ' words'));
  console.log('HEADING ISSUES: ' + headingIssues.length);
  headingIssues.slice(0, 10).forEach(i => console.log('  [' + i.slug + '] ' + i.issue));
}
