import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsDir = path.join(__dirname, '../src/pages/collections');

// Lister toutes les collections
const collections = fs.readdirSync(collectionsDir).filter(dir => 
  fs.statSync(path.join(collectionsDir, dir)).isDirectory()
);

console.log(`🔧 Correction des imports affiliate.ts vers affiliate.js...`);
console.log(`📂 Collections trouvées: ${collections.join(', ')}`);

let updatedCount = 0;

for (const collection of collections) {
  const templatePath = path.join(collectionsDir, collection, '[slug].astro');
  
  if (fs.existsSync(templatePath)) {
    let content = fs.readFileSync(templatePath, 'utf-8');
    
    // Vérifier si le template a besoin de correction
    if (content.includes("from '../../../lib/affiliate.ts';")) {
      console.log(`\n🔧 Correction de l'import: ${collection}/[slug].astro`);
      
      // Remplacer .ts par .js
      content = content.replace(
        "from '../../../lib/affiliate.ts';",
        "from '../../../lib/affiliate.js';"
      );
      
      // Écrire le fichier corrigé
      fs.writeFileSync(templatePath, content);
      updatedCount++;
      console.log(`✅ Import corrigé: ${collection}/[slug].astro`);
    } else {
      console.log(`✓ Import déjà correct: ${collection}/[slug].astro`);
    }
  } else {
    console.log(`⚠️ Template non trouvé: ${collection}/[slug].astro`);
  }
}

console.log(`\n🎉 Correction des imports terminée !`);
console.log(`📊 Templates corrigés: ${updatedCount}/${collections.length}`);
console.log(`\n💡 Tous les templates utilisent maintenant affiliate.js`);
console.log(`🔧 Les erreurs d'import devraient être résolues`);
