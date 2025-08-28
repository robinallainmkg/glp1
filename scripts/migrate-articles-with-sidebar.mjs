#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

function getAllSlugFiles(dir) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory() && item.name !== 'admin') {
        files = files.concat(getAllSlugFiles(fullPath));
      } else if (item.isFile() && item.name === '[slug].astro') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore les erreurs de lecture de dossier
  }
  
  return files;
}

function migrateSlugFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier utilise déjà UnifiedLayout
    if (content.includes('UnifiedLayout')) {
      console.log(`✓ Déjà migré: ${path.relative(projectRoot, filePath)}`);
      return;
    }
    
    let updatedContent = content;
    
    // Remplacer les imports de layout
    updatedContent = updatedContent.replace(
      /import\s+\w+Layout\s+from\s+['"](\.\.\/)*layouts\/\w+Layout\.astro['"];?\n/g,
      `import UnifiedLayout from '$1layouts/UnifiedLayout.astro';\n`
    );
    
    // Remplacer l'usage du layout avec sidebar d'affiliation
    updatedContent = updatedContent.replace(
      /<(\w+Layout)\s+([^>]*?)>/g,
      '<UnifiedLayout showAffiliateSidebar={true} $2>'
    );
    
    updatedContent = updatedContent.replace(
      /<\/\w+Layout>/g,
      '</UnifiedLayout>'
    );
    
    // S'assurer que articleContent est défini correctement
    if (!updatedContent.includes('articleContent=')) {
      // Ajouter articleContent si pas présent
      updatedContent = updatedContent.replace(
        /<UnifiedLayout\s+showAffiliateSidebar=\{true\}\s+([^>]*?)>/,
        '<UnifiedLayout showAffiliateSidebar={true} articleContent={entry.body} $1>'
      );
    }
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Migré (avec sidebar): ${path.relative(projectRoot, filePath)}`);
    } else {
      console.log(`- Pas de changement: ${path.relative(projectRoot, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

// Pages spécifiques qui nécessitent la sidebar
function migrateSpecificPages() {
  const specificPages = [
    'src/pages/temoignages/avant-apres-glp1.astro',
    'src/pages/guides/quel-traitement-glp1-choisir.astro'
  ];
  
  for (const page of specificPages) {
    const fullPath = path.join(projectRoot, page);
    if (fs.existsSync(fullPath)) {
      migrateSlugFile(fullPath);
    }
  }
}

// Migration automatique
function main() {
  console.log('🚀 Migration des articles vers UnifiedLayout avec sidebar\n');
  
  // Migrer tous les fichiers [slug].astro
  const pagesDir = path.join(projectRoot, 'src', 'pages');
  const slugFiles = getAllSlugFiles(pagesDir);
  
  for (const file of slugFiles) {
    migrateSlugFile(file);
  }
  
  // Migrer les pages spécifiques
  console.log('\n📄 Migration des pages spécifiques...');
  migrateSpecificPages();
  
  console.log('\n✨ Migration terminée! Tous les articles ont maintenant la sidebar d\'affiliation.');
}

main();
