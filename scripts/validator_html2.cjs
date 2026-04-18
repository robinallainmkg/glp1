const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const distDir = path.join(BASE, 'dist');

// Sample specific public pages
const pagesToCheck = [
  'index.html',
  'collections/traitements-glp1/guide-complet-ozempic/index.html',
  'collections/effets-secondaires-glp1/effets-secondaires-wegovy/index.html',
  'collections/glp1-cout/prix-ozempic-france/index.html',
  'collections/regime-glp1/regime-cetogene-glp1/index.html',
  'collections/alternatives-glp1/berberine-glp1/index.html',
  'collections/temoignages/temoignage-marie-transformation-glp1/index.html',
  'collections/recherche-glp1/glp1-alzheimer-cerveau-essais-evoke/index.html',
  'guides/faq-glp1/index.html',
  'legal/mentions-legales/index.html',
];

const issues = [];

for (const relPath of pagesToCheck) {
  const file = path.join(distDir, relPath);
  if (!fs.existsSync(file)) {
    issues.push({ slug: relPath, severity: 'error', message: 'Page non generee dans dist/' });
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  const slug = relPath.replace('/index.html', '').replace('.html', '') || 'homepage';

  if (!content.includes('<title>')) issues.push({ slug, severity: 'error', message: 'Missing <title>' });
  if (!content.includes('name="description"') && !content.includes("name='description'")) {
    issues.push({ slug, severity: 'warning', message: 'Missing meta description' });
  }
  if (!content.includes('rel="canonical"') && !content.includes("rel='canonical'")) {
    issues.push({ slug, severity: 'warning', message: 'Missing canonical link' });
  }
  if (!content.includes('lang="fr"') && !content.includes("lang='fr'")) {
    issues.push({ slug, severity: 'warning', message: 'Missing lang=fr' });
  }
  if (!content.includes('og:title')) issues.push({ slug, severity: 'warning', message: 'Missing og:title' });

  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (mainMatch && mainMatch[1].trim().length < 100) {
    issues.push({ slug, severity: 'error', message: 'Main content too short: ' + mainMatch[1].trim().length + ' chars' });
  }
  if (!mainMatch) {
    issues.push({ slug, severity: 'warning', message: 'No <main> tag found' });
  }
}

console.log('Public pages checked: ' + pagesToCheck.length);
console.log('Issues: ' + issues.length);
for (const i of issues) console.log('  [' + i.severity + '] ' + i.slug + ': ' + i.message);

if (issues.length === 0) console.log('All public pages: OK');
