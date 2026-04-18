const fs = require('fs');
const path = require('path');

const distDir = 'C:/Users/robin/glp1/glp1/dist';

function getHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = getHtmlFiles(distDir);
console.log('Total HTML files in dist:', htmlFiles.length);

const sample = htmlFiles.slice(0, 10);
const issues = [];

for (const fpath of sample) {
  const text = fs.readFileSync(fpath, 'utf-8');
  const relPath = fpath.replace(/\/g, '/').split('/dist').pop();

  if (!text.includes('<title>')) issues.push({ slug: relPath, msg: 'Balise title manquante', severity: 'error' });
  if (!text.includes('name="description"')) issues.push({ slug: relPath, msg: 'meta description manquante', severity: 'warning' });
  if (!text.includes('rel="canonical"')) issues.push({ slug: relPath, msg: 'link canonical manquant', severity: 'warning' });
  if (!text.includes('lang="fr"')) issues.push({ slug: relPath, msg: 'html lang=fr manquant', severity: 'warning' });
  if (!text.includes('og:title')) issues.push({ slug: relPath, msg: 'og:title manquant', severity: 'warning' });

  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (mainMatch && mainMatch[1].trim().length < 100) {
    issues.push({ slug: relPath, msg: 'Contenu main trop court', severity: 'error' });
  }
}

console.log('HTML issues:', issues.length);
issues.forEach(function(i) { console.log('[' + i.severity + '] ' + i.slug + ': ' + i.msg); });
