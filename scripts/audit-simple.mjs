// 🔍 AUDIT SEO SIMPLIFIÉ - Test rapide
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../src/content');

console.log('🔍 Début de l\'audit SEO...');
console.log('Répertoire de contenu:', CONTENT_DIR);

try {
  const collections = fs.readdirSync(CONTENT_DIR);
  console.log('Collections trouvées:', collections.length);

  let totalArticles = 0;
  
  for (const collection of collections) {
    const collectionPath = path.join(CONTENT_DIR, collection);
    
    if (!fs.statSync(collectionPath).isDirectory()) continue;
    
    const files = fs.readdirSync(collectionPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    console.log(`📁 ${collection}: ${mdFiles.length} articles`);
    totalArticles += mdFiles.length;
  }
  
  console.log(`\n📊 TOTAL: ${totalArticles} articles trouvés`);
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
