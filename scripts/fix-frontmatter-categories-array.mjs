import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

function fixCategories(filePath) {
  let changed = false;
  let content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return false;
  let frontmatter = frontmatterMatch[1];

  // categories: "[..." => YAML array
  const categoriesMatch = frontmatter.match(/categories:\s*"\[(.*?)\]"/);
  if (categoriesMatch) {
    changed = true;
    const categoriesArr = categoriesMatch[1]
      .split(',')
      .map(cat => cat.replace(/"/g, '').trim())
      .filter(cat => cat.length > 0);
    const categoriesYaml = 'categories:\n' + categoriesArr.map(cat => `  - ${cat}`).join('\n');
    frontmatter = frontmatter.replace(/categories:\s*"\[.*?\]"/, categoriesYaml);
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
      if (fixCategories(fullPath)) fixed++;
    }
  });
  return fixed;
}

console.log('🔧 Correction des champs categories (array)...');
const totalFixed = scanAndFix(CONTENT_DIR);
console.log(`✅ Champs 'categories' corrigés dans ${totalFixed} fichier(s)`);
