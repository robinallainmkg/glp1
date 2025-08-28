#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Trouver tous les fichiers [slug].astro
function findAllSlugFiles() {
  const slugFiles = [
    'src/pages/collections/alternatives-glp1/[slug].astro',
    'src/pages/collections/effets-secondaires-glp1/[slug].astro',
    'src/pages/collections/glp1-cout/[slug].astro',
    'src/pages/collections/glp1-diabete/[slug].astro',
    'src/pages/collections/glp1-perte-de-poids/[slug].astro',
    'src/pages/collections/medecins-glp1-france/[slug].astro',
    'src/pages/collections/recherche-glp1/[slug].astro',
    'src/pages/collections/regime-glp1/[slug].astro'
  ];
  
  return slugFiles.map(f => path.join(projectRoot, f)).filter(f => fs.existsSync(f));
}

function migrateSlugFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si déjà migré
    if (content.includes('UnifiedLayout')) {
      console.log(`✓ Déjà migré: ${path.relative(projectRoot, filePath)}`);
      return;
    }
    
    // 1. Remplacer l'import
    content = content.replace(
      /import ArticleWithAffiliateSidebar from ['"][^'"]+['"];?/,
      "import UnifiedLayout from '../../../layouts/UnifiedLayout.astro';"
    );
    
    // 2. Remplacer l'utilisation du composant
    content = content.replace(
      /<ArticleWithAffiliateSidebar /g,
      '<UnifiedLayout showAffiliateSidebar={true} '
    );
    
    content = content.replace(
      /<\/ArticleWithAffiliateSidebar>/g,
      '</UnifiedLayout>'
    );
    
    // Écrire le fichier modifié
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migré: ${path.relative(projectRoot, filePath)}`);
    
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Migration de tous les articles [slug].astro vers UnifiedLayout\n');
  
  const slugFiles = findAllSlugFiles();
  
  if (slugFiles.length === 0) {
    console.log('Aucun fichier [slug].astro trouvé.');
    return;
  }
  
  console.log(`Fichiers trouvés: ${slugFiles.length}\n`);
  
  slugFiles.forEach(migrateSlugFile);
  
  console.log('\n✨ Migration terminée! Tous les articles utilisent maintenant UnifiedLayout avec sidebar.');
}

main();
