import fs from 'fs';
import path from 'path';

// Mapping des collections vers leurs classes CSS
const collectionThemes = {
  'glp1-cout': 'price',
  'medicaments-glp1': 'medication', 
  'glp1-perte-de-poids': 'weight-loss',
  'effets-secondaires-glp1': 'effects',
  'glp1-diabete': 'diabetes',
  'regime-glp1': 'nutrition',
  'alternatives-glp1': 'alternatives',
  'medecins-glp1-france': 'doctors',
  'recherche-glp1': 'research'
};

const pagesDir = './src/pages';

Object.entries(collectionThemes).forEach(([collection, theme]) => {
  const filePath = path.join(pagesDir, collection, 'index.astro');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Remplacer toutes les classes medical par la bonne classe
    content = content.replace(/article-hero medical/g, `article-hero ${theme}`);
    content = content.replace(/article-hero medication/g, `article-hero ${theme}`);
    content = content.replace(/article-hero price/g, `article-hero ${theme}`);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corrigé: ${collection} -> ${theme}`);
  } else {
    console.log(`❌ Fichier manquant: ${filePath}`);
  }
});

console.log('🎨 Correction des thèmes de collections terminée !');
