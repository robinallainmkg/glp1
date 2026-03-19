#!/usr/bin/env node
// Validator checks: internal links, images, UTF-8 encoding
const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) results = results.concat(getFiles(full));
    else if (e.name.endsWith('.md')) results.push(full);
  }
  return results;
}

const files = getFiles('src/content').slice(0, 100);
const issues = [];

// Build slug index
const validSlugs = new Set();
for (const f of getFiles('src/content')) {
  validSlugs.add('/' + path.basename(f, '.md') + '/');
}

for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  const content = raw.split('\r\n').join('\n');
  const slug = path.basename(f, '.md');
  const match = content.match(/^---\n[\s\S]*?\n---/);
  const body = match ? content.slice(match[0].length) : content;

  // Internal links
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = linkRe.exec(body)) !== null) {
    const href = m[2];
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) continue;
    let target = href.split('#')[0];
    if (!target.endsWith('/')) target += '/';
    if (!target.startsWith('/')) continue;
    if (!validSlugs.has(target)) {
      issues.push({ slug, check: 'internal_link', msg: 'Lien interne casse: ' + href, severity: 'error' });
    }
  }

  // Images
  const imgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((m = imgRe.exec(body)) !== null) {
    const alt = m[1];
    const src = m[2];
    if (!alt || alt.trim() === '' || alt.toLowerCase() === 'image' || alt.toLowerCase() === 'photo') {
      issues.push({ slug, check: 'image', msg: 'Alt text manquant: ' + src, severity: 'warning' });
    }
    if (src && !src.startsWith('http')) {
      const imgPath = path.join('public', src.startsWith('/') ? src.slice(1) : src);
      if (!fs.existsSync(imgPath)) {
        issues.push({ slug, check: 'image', msg: 'Image manquante: ' + src, severity: 'error' });
      }
    }
  }
}

// UTF-8 encoding check in .astro pages
function getAstroFiles(dir) {
  let r = [];
  if (!fs.existsSync(dir)) return r;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) r = r.concat(getAstroFiles(full));
    else if (e.name.endsWith('.astro')) r.push(full);
  }
  return r;
}

const astroFiles = getAstroFiles('src/pages');
for (const f of astroFiles) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('\uFFFD')) {
    issues.push({ slug: path.basename(f, '.astro'), check: 'encoding', msg: 'Caracteres corrompus (U+FFFD) dans ' + f, severity: 'error' });
  }
}

const errors = issues.filter(i => i.severity === 'error');
const warnings = issues.filter(i => i.severity === 'warning');
console.log('LINK ERRORS:', errors.filter(i => i.check === 'internal_link').length);
console.log('IMAGE ERRORS:', errors.filter(i => i.check === 'image').length);
console.log('IMAGE WARNINGS:', warnings.filter(i => i.check === 'image').length);
console.log('ENCODING ERRORS:', errors.filter(i => i.check === 'encoding').length);
errors.slice(0, 30).forEach(i => console.log('[ERR][' + i.check + '] ' + i.slug + ': ' + i.msg));
warnings.slice(0, 10).forEach(i => console.log('[WARN][' + i.check + '] ' + i.slug + ': ' + i.msg));
