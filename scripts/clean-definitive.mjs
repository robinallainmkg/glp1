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

function cleanArticleDefinitive(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let hasChanged = false;

  // Extraire frontmatter et contenu
  const frontmatterMatch = content.match(/^---[\s\S]*?---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[0] : '';
  let body = content.replace(frontmatter, '').trim();

  // 1. SUPPRIMER TOUS LES H1 (le layout s'en charge)
  const originalBody = body;
  body = body.replace(/^# .+$/gm, '').trim();
  if (body !== originalBody) hasChanged = true;

  // 2. Nettoyer les sections vides/génériques
  const cleanPatterns = [
    /^## \?\s*$/gm,                    // ## ?
    /^\*{4,}.*$/gm,                    // ****
    /^## Qu'est-ce que c'est \?\s*$/gm, // Section vide
    /^\s*$\n\s*$\n\s*$/gm,            // Lignes vides multiples
  ];

  cleanPatterns.forEach(pattern => {
    const beforeClean = body;
    body = body.replace(pattern, '');
    if (body !== beforeClean) hasChanged = true;
  });

  // 3. Nettoyer espaces multiples
  body = body.replace(/\n{3,}/g, '\n\n').trim();

  // Reconstruire le fichier
  const cleanedContent = frontmatter + '\n\n' + body + '\n';
  
  if (hasChanged) {
    fs.writeFileSync(filePath, cleanedContent, 'utf-8');
    console.log('✅ Nettoyé :', filePath.replace('./src/content/', ''));
  } else {
    console.log('✨ Déjà propre :', filePath.replace('./src/content/', ''));
  }
}

function main() {
  console.log('🧹 Nettoyage définitif des articles...\n');
  
  const files = getAllMarkdownFiles(CONTENT_DIR);
  let cleanedCount = 0;
  
  files.forEach(filePath => {
    try {
      cleanArticleDefinitive(filePath);
      cleanedCount++;
    } catch (error) {
      console.error('❌ Erreur:', filePath, error.message);
    }
  });
  
  console.log(`\n✅ Nettoyage terminé : ${cleanedCount}/${files.length} fichiers traités`);
  console.log('🎯 Tous les H1 markdown supprimés (le layout gère l\'affichage)');
  console.log('🧹 Sections vides et génériques supprimées');
}

main();
