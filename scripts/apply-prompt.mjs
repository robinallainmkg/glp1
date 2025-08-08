import fs from 'node:fs';

const promptPath = process.argv[2] || 'prompts/next-prompt.txt';
const cfgPath = 'site.config.json';
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const prompt = fs.readFileSync(promptPath, 'utf8');

function setPath(k, v) {
  const parts = k.split('.');
  let ref = cfg;
  for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]] ??= {};
  ref[parts.at(-1)] = v;
}
for (const raw of prompt.split('\n')) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const [cmd, ...rest] = line.split(' ');
  if (cmd === 'set') {
    const key = rest.shift();
    const value = rest.join(' ').replace(/^"/,'').replace(/"$/,'');
    let v = value;
    if (value === 'true') v = true;
    else if (value === 'false') v = false;
    else if (!isNaN(Number(value))) v = Number(value);
    setPath(key, v);
    console.log('Set', key, '→', v);
  } else if (cmd === 'add' && rest[0] === 'author') {
    const m = line.match(/add author\s+"([^"]+)"\s+"([^"]+)"/);
    if (m) cfg.authors.push({ name: m[1], role: m[2] });
  } else if (cmd === 'remove' && rest[0] === 'author') {
    const name = line.match(/"([^"]+)"/)?.[1];
    if (name) cfg.authors = cfg.authors.filter(a => a.name !== name);
  } else if (cmd === 'map' && rest[0] === 'category') {
    const m = line.match(/map category\s+"([^"]+)"\s+"([^"]+)"/);
    if (m) cfg.categories[m[1]] = m[2];
  }
}
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
console.log('✔ Prompt appliqué à site.config.json');
