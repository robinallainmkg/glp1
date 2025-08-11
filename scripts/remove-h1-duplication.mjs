import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

function getAllMarkdownFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(getAllMarkdownFiles(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  });
  return results;
}

function cleanH1Duplication(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---[\s\S]*?---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[0] : '';
  const body = content.replace(frontmatter, '');
  const titleMatch = frontmatter.match(/title:\s*"?([^"]+)"?/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  // Supprimer tous les H1 qui sont identiques au titre du frontmatter
  let newBody = body.replace(/^#\s+"?(.+?)"?$/gm, (match, h1) => {
    if (h1.trim() === title) {
      return '';
    }
    return match;
  });
  // Ajouter le H1 stylisé au début si absent
  if (title && !/^#\s+"?(.+?)"?/m.test(newBody)) {
    newBody = `# ${title}\n` + newBody.trimStart();
  }
  // Nettoyer les espaces
  const cleaned = frontmatter + '\n' + newBody.trim() + '\n';
  fs.writeFileSync(filePath, cleaned, 'utf-8');
  console.log('Nettoyé :', filePath);
}

function main() {
  const files = getAllMarkdownFiles(CONTENT_DIR);
  files.forEach(cleanH1Duplication);
}

main();
