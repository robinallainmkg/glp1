#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Liste des fichiers à migrer
const filesToMigrate = [
  'src/pages/guides/qu-est-ce-que-glp1.astro',
  'src/pages/guides/guide-beaute-perte-de-poids-glp1.astro',
  'src/pages/guides/nouveaux-medicaments-perdre-poids.astro',
  'src/pages/temoignages/temoignage-laurent-transformation-glp1.astro',
  'src/pages/temoignages/sophie.astro',
  'src/pages/temoignages/marie.astro',
  'src/pages/temoignages/temoignage-marie-transformation-glp1.astro',
  'src/pages/temoignages/temoignage-sophie-transformation-glp1.astro',
  'src/pages/temoignages/laurent.astro',
  'src/pages/collections/medecins-glp1-france/[slug].astro',
  'src/pages/collections/regime-glp1/[slug].astro',
  'src/pages/collections/glp1-perte-de-poids/[slug].astro',
  'src/pages/collections/glp1-cout/wegovy-prix.astro',
  'src/pages/collections/glp1-cout/[slug].astro',
  'src/pages/collections/glp1-cout/saxenda-prix-pharmacie.astro',
  'src/pages/collections/glp1-cout/operation-pour-maigrir-prix.astro',
  'src/pages/collections/glp1-cout/acheter-wegovy-en-france.astro',
  'src/pages/collections/medicaments-glp1/[slug].astro',
  'src/pages/collections/alternatives-glp1/[slug].astro',
  'src/pages/collections/effets-secondaires-glp1/[slug].astro',
  'src/pages/collections/recherche-glp1/[slug].astro',
  'src/pages/collections/glp1-diabete/[slug].astro'
];

// Pages qui devraient utiliser la sidebar d'affiliation
const pagesWithSidebar = [
  '[slug].astro', // Toutes les pages d'articles
  'temoignage-', // Pages de témoignages individuels
  'wegovy-prix.astro',
  'saxenda-prix-pharmacie.astro',
  'operation-pour-maigrir-prix.astro',
  'acheter-wegovy-en-france.astro'
];

function shouldUseSidebar(filePath) {
  const fileName = path.basename(filePath);
  return pagesWithSidebar.some(pattern => fileName.includes(pattern));
}

function migrateFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Fichier introuvable: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier si déjà migré
    if (content.includes('UnifiedLayout')) {
      console.log(`✓ Déjà migré: ${filePath}`);
      return;
    }

    const useSidebar = shouldUseSidebar(filePath);
    
    // Remplacer les imports
    content = content.replace(
      /import\s+(\w+Layout)\s+from\s+['"]([^'"]*Layout\.astro)['"];?\n/g,
      "import UnifiedLayout from '$2'.replace(/\\/[^/]*Layout\\.astro$/, '/UnifiedLayout.astro');\n"
    );
    
    // Corriger le chemin d'import en fonction de la profondeur
    const depth = filePath.split('/').length - 2; // Enlever 'src' et le fichier
    const relativePath = '../'.repeat(depth) + 'layouts/UnifiedLayout.astro';
    
    content = content.replace(
      /import\s+UnifiedLayout\s+from\s+['"][^'"]*['"];?\n/g,
      `import UnifiedLayout from "${relativePath}";\n`
    );
    
    // Remplacer les usages de layout
    content = content.replace(
      /<(\w+Layout)(\s+[^>]*)?>/g,
      useSidebar ? '<UnifiedLayout showAffiliateSidebar={true}$2>' : '<UnifiedLayout$2>'
    );
    
    content = content.replace(
      /<\/\w+Layout>/g,
      '</UnifiedLayout>'
    );

    // Écrire le fichier modifié
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Migré${useSidebar ? ' (avec sidebar)' : ''}: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

// Migration
console.log('🚀 Migration vers UnifiedLayout - Batch 2\n');

for (const file of filesToMigrate) {
  migrateFile(file);
}

console.log('\n✨ Migration terminée!');
