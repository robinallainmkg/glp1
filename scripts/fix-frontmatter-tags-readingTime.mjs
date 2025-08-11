import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

function fixFrontmatter(filePath) {
  let changed = false;
  let content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return false;
  let frontmatter = frontmatterMatch[1];

  // Fix readingTime: "5" => readingTime: 5
  frontmatter = frontmatter.replace(/readingTime:\s*"(\d+)"/g, (m, p1) => {
    changed = true;
    return `readingTime: ${p1}`;
  });

  // Fix tags: "[..." => YAML array
  const tagsMatch = frontmatter.match(/tags:\s*"\[(.*?)\]"/);
  if (tagsMatch) {
    changed = true;
    const tagsArr = tagsMatch[1]
      .split(',')
      .map(tag => tag.replace(/"/g, '').trim())
      .filter(tag => tag.length > 0);
    const tagsYaml = 'tags:\n' + tagsArr.map(tag => `  - ${tag}`).join('\n');
    frontmatter = frontmatter.replace(/tags:\s*"\[.*?\]"/, tagsYaml);
  }

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
      if (fixFrontmatter(fullPath)) fixed++;
    }
  });
  return fixed;
}

console.log('🔧 Correction des frontmatters (tags et readingTime)...');
const totalFixed = scanAndFix(CONTENT_DIR);
console.log(`✅ Frontmatter corrigé dans ${totalFixed} fichier(s)`);
