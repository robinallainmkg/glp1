#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Pages qui nécessitent la sidebar d'affiliation
const affiliatePages = [
  'src/pages/collections/*/[slug].astro',
  'src/pages/glp1-perte-de-poids/[slug].astro',
  'src/pages/temoignages/avant-apres-glp1.astro',
  'src/pages/guides/quel-traitement-glp1-choisir.astro'
];

// Pages statiques normales
const staticPages = [
  'src/pages/collections/*/index.astro',
  'src/pages/guides/experts.astro',
  'src/pages/contact.astro',
  'src/pages/index.astro',
  'src/pages/legal/*.astro',
  'src/pages/glp1-perte-de-poids/index.astro'
];

function getAllAstroFiles(dir) {
  let files = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory() && item.name !== 'admin') {
      files = files.concat(getAllAstroFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.astro') && !item.name.startsWith('_')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function shouldUseAffiliateSidebar(filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  
  // Articles individuels (slug pages)
  if (relativePath.includes('[slug].astro')) return true;
  
  // Pages spécifiques avec affiliation
  if (relativePath.includes('temoignages/avant-apres-glp1.astro')) return true;
  if (relativePath.includes('guides/quel-traitement-glp1-choisir.astro')) return true;
  
  return false;
}

function updateLayoutImport(content, useAffiliate = false) {
  // Remplacer les imports de layout existants
  content = content.replace(
    /import\s+\w+Layout\s+from\s+['"](\.\.\/)*layouts\/\w+Layout\.astro['"];?\n/g,
    `import UnifiedLayout from '$1layouts/UnifiedLayout.astro';\n`
  );
  
  // Remplacer les usages de layout
  if (useAffiliate) {
    content = content.replace(
      /<(\w+Layout)\s+([^>]*?)>/g,
      '<UnifiedLayout showAffiliateSidebar={true} $2>'
    );
    content = content.replace(
      /<\/\w+Layout>/g,
      '</UnifiedLayout>'
    );
  } else {
    content = content.replace(
      /<(\w+Layout)\s+([^>]*?)>/g,
      '<UnifiedLayout $2>'
    );
    content = content.replace(
      /<\/\w+Layout>/g,
      '</UnifiedLayout>'
    );
  }
  
  return content;
}

function migrateLayout(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier utilise déjà UnifiedLayout
    if (content.includes('UnifiedLayout')) {
      console.log(`✓ Déjà migré: ${path.relative(projectRoot, filePath)}`);
      return;
    }
    
    // Vérifier si le fichier utilise un layout
    if (!content.includes('Layout') || content.includes('AdminLayout')) {
      console.log(`- Ignoré (pas de layout ou admin): ${path.relative(projectRoot, filePath)}`);
      return;
    }
    
    const useAffiliate = shouldUseAffiliateSidebar(filePath);
    const updatedContent = updateLayoutImport(content, useAffiliate);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Migré ${useAffiliate ? '(avec sidebar)' : '(sans sidebar)'}: ${path.relative(projectRoot, filePath)}`);
    } else {
      console.log(`- Pas de changement: ${path.relative(projectRoot, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

// Migration automatique
function main() {
  console.log('🚀 Migration vers UnifiedLayout\n');
  
  const pagesDir = path.join(projectRoot, 'src', 'pages');
  const allFiles = getAllAstroFiles(pagesDir);
  
  for (const file of allFiles) {
    migrateLayout(file);
  }
  
  console.log('\n✨ Migration terminée!');
}

main();
