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

function cleanH1InFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Récupérer le frontmatter
  const frontmatterMatch = content.match(/^---[\s\S]*?---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[0] : '';
  const body = content.replace(frontmatter, '');
  // Récupérer le titre du frontmatter
  const titleMatch = frontmatter.match(/title:\s*"?([^"]+)"?/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  // Nettoyer tous les H1 sauf le premier, et supprimer le H1 si il est identique au titre
  let newBody = body;
  let h1Found = false;
  newBody = newBody.replace(/^# (.*)$/gm, (match, h1) => {
    if (!h1Found) {
      h1Found = true;
      // Si le H1 est identique au titre, on le garde, sinon on le remplace par le titre du frontmatter
      if (title && h1.trim() !== title) {
        return `# ${title}`;
      }
      return match;
    }
    // Supprimer tous les autres H1
    return '';
  });
  // Supprimer les H1 en début de fichier si déjà présent dans le frontmatter
  if (title) {
    newBody = newBody.replace(new RegExp(`^# ${title}\s*`, 'm'), '');
    newBody = `# ${title}\n` + newBody.trimStart();
  }
  // Reconstruire le fichier
  const cleaned = frontmatter + '\n' + newBody.trim() + '\n';
  fs.writeFileSync(filePath, cleaned, 'utf-8');
  console.log('Nettoyé :', filePath);
}

function main() {
  const files = getAllMarkdownFiles(CONTENT_DIR);
  files.forEach(cleanH1InFile);
}

main();
