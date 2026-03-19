const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const distDir = path.join(BASE, 'dist');

function sampleHtmlFiles(dir, max) {
  const results = [];
  function walk(d) {
    if (results.length >= max) return;
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      if (results.length >= max) break;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html') results.push(full);
    }
  }
  walk(dir);
  return results;
}

const htmlFiles = sampleHtmlFiles(distDir, 10);
const issues = [];

for (const file of htmlFiles) {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  const slug = rel.replace('/index.html', '') || 'homepage';

  // Check essential tags
  if (!content.includes('<title>')) issues.push({ slug, severity: 'error', message: 'Missing <title>' });
  if (!content.includes('name="description"') && !content.includes("name='description'")) {
    issues.push({ slug, severity: 'warning', message: 'Missing meta description' });
  }
  if (!content.includes('rel="canonical"') && !content.includes("rel='canonical'")) {
    issues.push({ slug, severity: 'warning', message: 'Missing canonical link' });
  }
  if (!content.includes('lang="fr"') && !content.includes("lang='fr'")) {
    issues.push({ slug, severity: 'warning', message: 'Missing lang=fr on html tag' });
  }

  // Check OG tags
  if (!content.includes('og:title')) issues.push({ slug, severity: 'warning', message: 'Missing og:title' });
  if (!content.includes('og:description')) issues.push({ slug, severity: 'warning', message: 'Missing og:description' });

  // Check body content not empty
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (mainMatch && mainMatch[1].trim().length < 100) {
    issues.push({ slug, severity: 'error', message: 'Main content too short: ' + mainMatch[1].trim().length + ' chars' });
  }
}

console.log('HTML files checked: ' + htmlFiles.length);
console.log('HTML issues: ' + issues.length);
for (const i of issues) console.log('  [' + i.severity + '] ' + i.slug + ': ' + i.message);

fs.writeFileSync(path.join(__dirname, 'validator_html.json'), JSON.stringify(issues, null, 2));
console.log('Saved to scripts/validator_html.json');
