const fs = require('fs');
const path = require('path');

const contentDir = 'C:/Users/robin/glp1/glp1/src/content';
const pagesDir = 'C:/Users/robin/glp1/glp1/src/pages';
const publicDir = 'C:/Users/robin/glp1/glp1/public';
const distDir = 'C:/Users/robin/glp1/glp1/dist';

function getFilesRecursive(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursive(fullPath, ext));
    } else if (!ext || entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

const mdFiles = getFilesRecursive(contentDir, '.md');
const issues = [];

function extractFrontmatter(text) {
  if (!text.startsWith('---')) return { fm: '', body: text };
  const end = text.indexOf('---', 3);
  if (end === -1) return { fm: '', body: text };
  return { fm: text.slice(3, end).trim(), body: text.slice(end + 3).trim() };
}

// Build public images set
const publicImages = new Set();
for (const f of getFilesRecursive(publicDir)) {
  const rel = f.replace(/\\/g, '/');
  const idx = rel.indexOf('/public');
  if (idx !== -1) {
    publicImages.add(rel.slice(idx + 7)); // /public -> remove prefix
  }
}

let internalLinkIssues = 0;
let missingImages = 0;

for (const fpath of mdFiles) {
  const slug = path.basename(fpath, '.md');
  const text = fs.readFileSync(fpath, 'utf-8');
  const { body } = extractFrontmatter(text);

  // Check internal links
  const internalLinks = [];
  for (const m of body.matchAll(/\[([^\]]*)\]\((\/[^)\s#]+)/g)) internalLinks.push(m[2]);
  for (const m of body.matchAll(/href="(\/[^"#\s]+)/g)) internalLinks.push(m[1]);

  for (const link of internalLinks) {
    if (link.startsWith('//')) continue;
    const cleanLink = link.replace(/\/$/, '');
    if (!cleanLink) continue;
    const distPath = path.join(distDir, cleanLink, 'index.html');
    const distDirect = path.join(distDir, cleanLink.slice(1) + '.html');
    if (!fs.existsSync(distPath) && !fs.existsSync(distDirect)) {
      issues.push({ slug, type: 'internal_link', msg: 'Lien interne casse: ' + link, severity: 'error' });
      internalLinkIssues++;
    }
  }

  // Check images
  const imgMatches = [...body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)];
  for (const m of imgMatches) {
    const alt = m[1];
    const src = m[2];
    if (src.startsWith('http') || src.startsWith('//')) continue;
    if (src.startsWith('/')) {
      if (!publicImages.has(src)) {
        issues.push({ slug, type: 'image', msg: 'Image manquante: ' + src, severity: 'error' });
        missingImages++;
      }
    }
    if (!alt || alt.trim() === '' || ['image','photo','img'].includes(alt.toLowerCase())) {
      issues.push({ slug, type: 'image', msg: 'Alt non descriptif: ' + src, severity: 'warning' });
    }
  }
}

// Large images
for (const imgPath of getFilesRecursive(publicDir)) {
  const ext = path.extname(imgPath).toLowerCase();
  if (['.jpg','.jpeg','.png','.gif','.webp'].includes(ext)) {
    const stat = fs.statSync(imgPath);
    if (stat.size > 500 * 1024) {
      const rel = imgPath.replace(/\\/g, '/');
      const idx = rel.indexOf('/public');
      const relPath = idx !== -1 ? rel.slice(idx + 7) : imgPath;
      issues.push({ slug: '_images', type: 'image', msg: 'Image > 500Ko: ' + relPath + ' (' + Math.round(stat.size/1024) + 'Ko)', severity: 'warning' });
    }
  }
}

// Encoding check on .astro files
const astroFiles = getFilesRecursive(pagesDir, '.astro');
for (const fpath of astroFiles) {
  const text = fs.readFileSync(fpath, 'utf-8');
  if (text.includes('\uFFFD')) {
    const slug = path.basename(fpath, '.astro');
    issues.push({ slug, type: 'encoding', msg: 'Caracteres corrompus (U+FFFD) dans ' + fpath.replace(/.*src/, 'src'), severity: 'error' });
  }
}

const errors = issues.filter(i => i.severity === 'error');
const warnings = issues.filter(i => i.severity === 'warning');

console.log('Liens internes casses: ' + internalLinkIssues);
console.log('Images manquantes: ' + missingImages);
console.log('Total issues: ' + issues.length + ' (errors: ' + errors.length + ', warnings: ' + warnings.length + ')');
console.log('');
console.log('ERRORS (' + errors.length + '):');
errors.slice(0, 30).forEach(i => console.log('[' + i.type + '] ' + i.slug + ': ' + i.msg));
if (errors.length > 30) console.log('... et ' + (errors.length - 30) + ' autres');
console.log('');
console.log('WARNINGS (' + warnings.length + '):');
warnings.slice(0, 15).forEach(i => console.log('[' + i.type + '] ' + i.slug + ': ' + i.msg));
if (warnings.length > 15) console.log('... et ' + (warnings.length - 15) + ' autres warnings');

fs.writeFileSync('/tmp/validator_links_images.json', JSON.stringify(issues, null, 2));
