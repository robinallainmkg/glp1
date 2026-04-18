const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const contentDir = path.join(BASE, 'src', 'content');

function getAllMdFiles(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) results.push(...getAllMdFiles(full));
      else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) results.push(full);
    }
  } catch(e) {}
  return results;
}

const files = getAllMdFiles(contentDir).slice(0, 50);
const brokenLinks = [];
const imgIssues = [];

for (const file of files) {
  const slug = path.basename(file, '.md');
  const content = fs.readFileSync(file, 'utf8');
  const body = content.replace(/^---[\s\S]*?---\r?\n/, '');

  // Check internal links
  const linkMatches = [...body.matchAll(/\[([^\]]*)\]\((\/[^)]+)\)/g)];
  for (const m of linkMatches) {
    const href = m[2];
    if (href.startsWith('http') || href.startsWith('#')) continue;
    const cleanHref = href.split('#')[0].replace(/\/$/, '');
    const possiblePaths = [
      path.join(BASE, 'src', 'pages') + cleanHref + '.astro',
      path.join(BASE, 'src', 'pages') + cleanHref + '/index.astro',
      path.join(BASE, 'src', 'content') + cleanHref + '.md',
    ];
    const exists = possiblePaths.some(p => fs.existsSync(p));
    if (!exists && cleanHref.length > 1) {
      brokenLinks.push({ slug, link: href });
    }
  }

  // Check images
  const imgMatches = [...body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  for (const m of imgMatches) {
    const src = m[2].trim();
    if (src.startsWith('http')) continue;
    const publicPath = path.join(BASE, 'public') + src;
    const assetPath = path.join(BASE, 'src', 'assets') + src;
    if (!fs.existsSync(publicPath) && !fs.existsSync(assetPath)) {
      imgIssues.push({ slug, src });
    }
  }
}

console.log('Broken links found: ' + brokenLinks.length);
for (const b of brokenLinks.slice(0, 20)) console.log('  ' + b.slug + ' -> ' + b.link);
console.log('Missing images: ' + imgIssues.length);
for (const i of imgIssues.slice(0, 10)) console.log('  ' + i.slug + ' -> ' + i.src);

fs.writeFileSync(path.join(__dirname, 'validator_links.json'), JSON.stringify({ brokenLinks, imgIssues }, null, 2));
console.log('Saved to scripts/validator_links.json');
