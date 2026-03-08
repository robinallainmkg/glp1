import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

// Recursively find all HTML files
function findHtmlFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (item.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(distDir);

const linkRegex = /(?:href|src)=["']([^"'#]*?)(?:#[^"']*)?["']/gi;
const allLinks = new Map();
const allImages = new Map();

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const relPage = '/' + path.relative(distDir, file).split(path.sep).join('/').replace(/index\.html$/, '');
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const link = match[1].trim();
    if (!link || link.startsWith('mailto:') || link.startsWith('javascript:') || link.startsWith('data:') || link.startsWith('tel:')) continue;

    if (link.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)(\?.*)?$/i)) {
      const cleanLink = link.split('?')[0];
      if (!cleanLink.startsWith('http')) {
        if (!allImages.has(cleanLink)) allImages.set(cleanLink, []);
        allImages.get(cleanLink).push(relPage);
      }
    } else if (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('//')) {
      if (!allLinks.has(link)) allLinks.set(link, []);
      allLinks.get(link).push(relPage);
    }
  }
}

// Check internal links
const broken = [];
for (const [link, pages] of allLinks) {
  if (!link.startsWith('/')) continue;
  const cleanLink = link.split('?')[0];
  const checkPath = path.join(distDir, cleanLink);

  const exists = fs.existsSync(checkPath) ||
                 fs.existsSync(checkPath + '.html') ||
                 fs.existsSync(path.join(checkPath, 'index.html')) ||
                 fs.existsSync(checkPath.replace(/\/$/, '') + '/index.html');

  if (!exists) {
    broken.push({ link, pages: pages.slice(0, 3), count: pages.length });
  }
}

// Check images
const brokenImages = [];
for (const [img, pages] of allImages) {
  if (!img.startsWith('/')) continue;
  const checkPath = path.join(distDir, img);
  if (!fs.existsSync(checkPath)) {
    brokenImages.push({ img, pages: pages.slice(0, 3), count: pages.length });
  }
}

// Check for empty/suspicious href
const emptyHrefs = [];
const htmlFilesForEmpty = htmlFiles.slice(0, 200);
for (const file of htmlFilesForEmpty) {
  const content = fs.readFileSync(file, 'utf-8');
  const relPage = '/' + path.relative(distDir, file).split(path.sep).join('/').replace(/index\.html$/, '');

  // href="#" (non-functional links)
  const hashOnly = (content.match(/href=["']#["']/g) || []).length;
  if (hashOnly > 0) {
    emptyHrefs.push({ page: relPage, count: hashOnly });
  }
}

// Output
console.log('=== BROKEN INTERNAL LINKS (' + broken.length + ') ===');
broken.sort((a, b) => b.count - a.count);
for (const b of broken) {
  console.log('  404: ' + b.link + '  (' + b.count + ' pages)');
  console.log('       ex: ' + b.pages.join(', '));
}

console.log('\n=== BROKEN IMAGES (' + brokenImages.length + ') ===');
brokenImages.sort((a, b) => b.count - a.count);
for (const b of brokenImages) {
  console.log('  404: ' + b.img + '  (' + b.count + ' pages)');
  console.log('       ex: ' + b.pages.join(', '));
}

console.log('\n=== HREF="#" LINKS (potentially broken) ===');
emptyHrefs.sort((a, b) => b.count - a.count);
const topEmpty = emptyHrefs.slice(0, 15);
for (const e of topEmpty) {
  console.log('  ' + e.page + ' — ' + e.count + ' href="#" links');
}
if (emptyHrefs.length > 15) console.log('  ... and ' + (emptyHrefs.length - 15) + ' more pages');

console.log('\n=== STATS ===');
console.log('Total HTML files scanned: ' + htmlFiles.length);
console.log('Unique internal links checked: ' + allLinks.size);
console.log('Unique images checked: ' + allImages.size);
console.log('Broken links: ' + broken.length);
console.log('Broken images: ' + brokenImages.length);
console.log('Pages with href="#": ' + emptyHrefs.length);
