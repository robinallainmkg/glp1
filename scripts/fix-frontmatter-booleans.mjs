import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

function fixBooleans(filePath) {
  let changed = false;
  let content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return false;
  let frontmatter = frontmatterMatch[1];

  // published: "true"/"false" => published: true/false
  frontmatter = frontmatter.replace(/published:\s*"(true|false)"/gi, (m, p1) => {
    changed = true;
    return `published: ${p1.toLowerCase()}`;
  });

  // featured: "true"/"false" => featured: true/false
  frontmatter = frontmatter.replace(/featured:\s*"(true|false)"/gi, (m, p1) => {
    changed = true;
    return `featured: ${p1.toLowerCase()}`;
  });

  if (changed) {
    const newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontmatter}\n---`);
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  return false;
}

function scanAndFix(dir) {
  let fixed = 0;
  fs.readdirSync(dir).forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) fixed += scanAndFix(fullPath);
    else if (item.endsWith('.md')) {
      if (fixBooleans(fullPath)) fixed++;
    }
  });
  return fixed;
}

console.log('🔧 Correction des champs booleans (published, featured)...');
const totalFixed = scanAndFix(CONTENT_DIR);
console.log(`✅ Champs corrigés dans ${totalFixed} fichier(s)`);
