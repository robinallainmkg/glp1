// 🧪 Test simple du Keyword Mapper
import fs from 'fs';
import path from 'path';

console.log('🚀 Test Keyword Mapper - GLP1 France');

// Fonction pour scanner récursivement
function scanDirectory(dir, extensions = ['.md', '.astro']) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ Dossier non trouvé: ${dir}`);
    return files;
  }
  
  console.log(`📂 Scan du dossier: ${dir}`);
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Récursion dans les sous-dossiers
      const subFiles = scanDirectory(fullPath, extensions);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      // Vérifier l'extension
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
        console.log(`  📄 Trouvé: ${entry.name}`);
      }
    }
  }
  
  return files;
}

try {
  console.log('\n📍 Recherche des fichiers de contenu...');
  
  // Scanner les fichiers de contenu
  const contentFiles = scanDirectory('src/content', ['.md']);
  const pageFiles = scanDirectory('src/pages', ['.astro']);
  
  console.log(`\n📊 RÉSULTATS:`);
  console.log(`   📄 Fichiers de contenu: ${contentFiles.length}`);
  console.log(`   📄 Pages: ${pageFiles.length}`);
  
  if (contentFiles.length > 0) {
    console.log('\n📝 Premier fichier de contenu:');
    const firstFile = contentFiles[0];
    console.log(`   Fichier: ${firstFile}`);
    
    const content = fs.readFileSync(firstFile, 'utf-8');
    console.log(`   Taille: ${content.length} caractères`);
    
    // Extraire le frontmatter
    const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
    if (frontmatterMatch) {
      console.log(`   ✅ Frontmatter détecté`);
      
      // Essayer d'extraire le title
      const titleMatch = frontmatterMatch[1].match(/title:\s*["']?([^"'\n]+)["']?/);
      if (titleMatch) {
        console.log(`   📝 Titre: "${titleMatch[1]}"`);
      }
    } else {
      console.log(`   ⚠️ Pas de frontmatter`);
    }
  }
  
  console.log('\n✅ Test terminé avec succès !');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
