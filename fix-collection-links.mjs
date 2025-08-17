// Script pour corriger tous les liens cassés dans les collections
import fs from 'fs';
import path from 'path';

const collectionsDir = 'src/pages/collections';
const collections = [
  'glp1-cout',
  'glp1-perte-de-poids',
  'medicaments-glp1', 
  'effets-secondaires-glp1',
  'recherche-glp1',
  'alternatives-glp1',
  'glp1-diabete',
  'medecins-glp1-france',
  'regime-glp1'
];

function fixLinksInFile(filePath, collectionName) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remplacer les liens cassés par les bons chemins
  const regex = new RegExp(`href="/(?!collections/)${collectionName}/([^"]+)"`, 'g');
  content = content.replace(regex, `href="/collections/${collectionName}/$1"`);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Liens corrigés dans ${filePath}`);
}

// Parcourir toutes les collections
collections.forEach(collectionName => {
  const indexPath = path.join(collectionsDir, collectionName, 'index.astro');
  
  if (fs.existsSync(indexPath)) {
    fixLinksInFile(indexPath, collectionName);
  } else {
    console.log(`❌ Fichier non trouvé: ${indexPath}`);
  }
});

console.log('🎯 Correction des liens terminée !');
