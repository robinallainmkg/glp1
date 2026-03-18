import fs from 'fs';
import path from 'path';

const contentDir = 'C:/Users/robin/glp1/glp1/src/content';
const pagesDir = 'C:/Users/robin/glp1/glp1/src/pages';
const publicDir = 'C:/Users/robin/glp1/glp1/public';

// Build slug index
const contentSlugs = new Set();
function walkDir(dir) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) walkDir(fullPath);
      else if (item.endsWith('.md') || item.endsWith('.astro')) {
        const slug = path.basename(item, path.extname(item));
        contentSlugs.add(slug);
      }
    }
  } catch(e) {}
}
walkDir(contentDir);
walkDir(pagesDir);

// Get all content files
const allFiles = [];
function walkContent(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) walkContent(fullPath);
    else if (item.endsWith('.md')) allFiles.push(fullPath);
  }
}
walkContent(contentDir);
allFiles.sort();

const filesToCheck = allFiles.slice(0, 50);
const brokenLinks = [];
const missingImages = [];
const badAltImages = [];
let validLinkCount = 0;

// Build public files index
const publicFiles = new Set();
function walkPublic(dir, base) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) walkPublic(fullPath, base);
      else {
        const rel = '/' + path.relative(base, fullPath).replace(/\\/g, '/');
        publicFiles.add(rel);
      }
    }
  } catch(e) {}
}
walkPublic(publicDir, publicDir);

for (const filepath of filesToCheck) {
  const slug = path.basename(filepath, '.md');
  let content = fs.readFileSync(filepath).toString('utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const fmMatch = content.match(/^---\n[\s\S]*?\n---/);
  const body = fmMatch ? content.slice(fmMatch[0].length) : content;

  // Check internal links
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = linkPattern.exec(body)) !== null) {
    const fullHref = m[2];
    const href = fullHref.split('#')[0].split(' ')[0].trim();
    if (href.startsWith('/') || href.startsWith('../')) {
      const parts = href.replace(/^\//, '').replace(/\/$/, '').split('/').filter(Boolean);
      const targetSlug = parts[parts.length - 1];
      if (targetSlug && !contentSlugs.has(targetSlug)) {
        brokenLinks.push({ fromSlug: slug, href, targetSlug });
      } else {
        validLinkCount++;
      }
    }
  }

  // Check images
  const imgPattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((m = imgPattern.exec(body)) !== null) {
    const alt = m[1];
    const src = m[2].split(' ')[0].trim();

    if (!alt || alt === '' || alt === 'image' || alt === 'photo') {
      badAltImages.push({ fromSlug: slug, src, alt: alt || '(empty)' });
    }

    if (src.startsWith('/') && !src.startsWith('http')) {
      if (!publicFiles.has(src)) {
        missingImages.push({ fromSlug: slug, src });
      }
    }
  }
}

console.log('=== BROKEN LINKS ===');
console.log(JSON.stringify(brokenLinks.slice(0, 20), null, 2));
console.log('Total broken:', brokenLinks.length, '/ Valid:', validLinkCount);

console.log('\n=== MISSING IMAGES ===');
console.log(JSON.stringify(missingImages.slice(0, 10), null, 2));

console.log('\n=== BAD ALT TEXT ===');
console.log(JSON.stringify(badAltImages.slice(0, 10), null, 2));
