import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

function fixFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return false;
  const frontmatter = frontmatterMatch[1];
  if (/title:/i.test(frontmatter)) return false;

  // Générer un titre par défaut à partir du nom de fichier
  const fileName = path.basename(filePath, '.md');
  const title = fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const newFrontmatter = `title: "${title}"
` + frontmatter;
  const newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${newFrontmatter}\n---`);
  fs.writeFileSync(filePath, newContent);
  return true;
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

console.log('🔧 Correction des frontmatters manquants (title)...');
const totalFixed = scanAndFix(CONTENT_DIR);
console.log(`✅ Frontmatter 'title' ajouté dans ${totalFixed} fichier(s)`);
