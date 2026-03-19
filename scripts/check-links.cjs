#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function getValidPaths(dir, base) {
  const valid = new Set();
  if (!fs.existsSync(dir)) return valid;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      const subPath = base + e.name + '/';
      valid.add(subPath);
      const sub = getValidPaths(path.join(dir, e.name), subPath);
      sub.forEach(p => valid.add(p));
    }
  }
  return valid;
}
const validPaths = getValidPaths('dist', '/');

function getFiles(dir) {
  let r = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) r = r.concat(getFiles(full));
    else if (e.name.endsWith('.md')) r.push(full);
  }
  return r;
}
const files = getFiles('src/content').slice(0, 100);
const brokenLinks = [];

for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  const content = raw.split('\r\n').join('\n');
  const slug = path.basename(f, '.md');
  const match = content.match(/^---\n[\s\S]*?\n---/);
  const body = match ? content.slice(match[0].length) : content;
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = linkRe.exec(body)) !== null) {
    const href = m[2];
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) continue;
    let target = href.split('#')[0];
    if (!target.endsWith('/')) target += '/';
    if (!target.startsWith('/')) continue;
    if (!validPaths.has(target)) {
      brokenLinks.push({ slug, href });
    }
  }
}
console.log('BROKEN LINKS:', brokenLinks.length);
brokenLinks.slice(0, 20).forEach(b => console.log(b.slug + ': ' + b.href));
