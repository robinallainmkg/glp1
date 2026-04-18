import fs from 'fs';
import path from 'path';

const pagesDir = 'C:/Users/robin/glp1/glp1/src/pages';
const issues = [];

function getFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) files.push(...getFiles(full));
    else if (item.endsWith('.astro')) files.push(full);
  }
  return files;
}

const files = getFiles(pagesDir);
console.log('Checking', files.length, 'Astro pages for UTF-8...');

for (const f of files) {
  try {
    const buf = fs.readFileSync(f);
    const basename = path.basename(f);

    // Check for BOM
    if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
      issues.push({ file: basename, type: 'warning', msg: 'File has UTF-8 BOM' });
    }

    // Try reading as UTF-8
    const content = buf.toString('utf8');

    // Check for Windows-1252 chars that look wrong
    for (let i = 0; i < content.length; i++) {
      const cc = content.charCodeAt(i);
      if (cc >= 0x80 && cc <= 0x9F) {
        issues.push({ file: basename, type: 'warning', msg: 'Possible encoding issue at position ' + i });
        break;
      }
    }
  } catch (e) {
    issues.push({ file: path.basename(f), type: 'error', msg: 'Cannot read file: ' + e.message });
  }
}

console.log('UTF-8 issues:', issues.length);
issues.slice(0, 10).forEach(i => console.log('[' + i.type.toUpperCase() + ']', i.file + ':', i.msg));
if (issues.length === 0) console.log('All Astro pages are valid UTF-8');
