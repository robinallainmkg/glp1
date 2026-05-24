// One-off: removes inline Sinocare blocks (callout/card/footer) from all content .md files.
// Blocks are well-delimited (no nested same-tag), so non-greedy regex is safe.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src/content';
const patterns = [
  // compare block has nested <div>s → anchor on its unique terminator, not the first </div>
  /<div\s+data-sinocare-compare[\s\S]*?Sinocare via Awin<\/p>\s*<\/div>\s*/g,
  /<div\s+data-sinocare-callout[\s\S]*?<\/div>\s*/g,
  /<aside\s+data-sinocare-card[\s\S]*?<\/aside>\s*/g,
  /<aside\s+data-sinocare-footer[\s\S]*?<\/aside>\s*/g,
];

function walk(dir) {
  let files = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) files = files.concat(walk(p));
    else if (e.endsWith('.md')) files.push(p);
  }
  return files;
}

let changed = 0, blocks = 0;
for (const f of walk(ROOT)) {
  let txt = readFileSync(f, 'utf8');
  const before = txt;
  for (const re of patterns) {
    txt = txt.replace(re, () => { blocks++; return ''; });
  }
  txt = txt.replace(/\n{3,}/g, '\n\n');
  if (txt !== before) {
    writeFileSync(f, txt, 'utf8');
    changed++;
    console.log('cleaned:', f);
  }
}
console.log(`\nFiles changed: ${changed}, blocks removed: ${blocks}`);
