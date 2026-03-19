import fs from 'fs';
import path from 'path';

const distDir = 'C:/Users/robin/glp1/glp1/dist';
const issues = [];

function getHtmlFiles(dir, results = [], max = 10) {
  if (results.length >= max) return results;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (results.length >= max) break;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !item.startsWith('_') && item !== 'admin') {
      getHtmlFiles(full, results, max);
    } else if (item === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(distDir);
console.log('Checking', htmlFiles.length, 'HTML pages...');

for (const f of htmlFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const pagePath = f.replace(distDir, '').replace('index.html', '') || '/';

  const titleMatch = content.match(/<title>([^<]*)<\/title>/);
  if (!titleMatch) {
    issues.push({ file: pagePath, type: 'error', msg: 'Missing <title> tag' });
  } else if (titleMatch[1].trim().length < 5) {
    issues.push({ file: pagePath, type: 'warning', msg: 'Empty or short title: ' + titleMatch[1] });
  }

  const descMatch = content.match(/name=["']description["']/);
  if (!descMatch) {
    issues.push({ file: pagePath, type: 'warning', msg: 'Missing meta description' });
  }

  if (!content.includes('canonical')) {
    issues.push({ file: pagePath, type: 'warning', msg: 'Missing canonical link' });
  }

  if (!content.includes('charset')) {
    issues.push({ file: pagePath, type: 'warning', msg: 'Missing charset declaration' });
  }
}

console.log('HTML issues:', issues.length);
issues.forEach(i => console.log('[' + i.type.toUpperCase() + ']', i.file + ':', i.msg));
if (issues.length === 0) console.log('HTML build checks OK');
