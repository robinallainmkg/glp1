import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vérifier quels articles n'ont pas encore d'images AI
function checkMissingAIImages() {
  console.log('🔍 Vérification des images AI manquantes...');
  
  const thumbnailsDir = path.join(__dirname, '..', 'public', 'images', 'thumbnails');
  const existingFiles = fs.readdirSync(thumbnailsDir);
  
  // Trouver tous les fichiers SVG (articles existants)
  const svgFiles = existingFiles.filter(file => file.endsWith('.svg'));
  const aiFiles = existingFiles.filter(file => file.endsWith('-illus.jpg'));
  
  console.log(`📊 Statistiques:`);
  console.log(`   - Articles avec SVG: ${svgFiles.length}`);
  console.log(`   - Articles avec images AI: ${aiFiles.length}`);
  
  // Trouver les articles sans images AI
  const missingAI = [];
  svgFiles.forEach(svgFile => {
    const baseName = svgFile.replace('.svg', '');
    const aiImageName = `${baseName}-illus.jpg`;
    
    if (!aiFiles.includes(aiImageName)) {
      missingAI.push(baseName);
    }
  });
  
  console.log(`📸 Articles sans images AI: ${missingAI.length}`);
  
  if (missingAI.length > 0) {
    console.log('\n🎯 Articles prioritaires pour la génération AI:');
    missingAI.slice(0, 20).forEach((articleName, index) => {
      console.log(`   ${index + 1}. ${articleName}`);
    });
    
    console.log('\n💡 Pour générer des images AI pour ces articles :');
    console.log('   node scripts/generate-ai-thumbnails.mjs');
  }
  
  // Afficher quelques exemples d'articles avec images AI
  console.log('\n✅ Exemples d\'articles avec images AI:');
  aiFiles.slice(0, 10).forEach((aiFile, index) => {
    const articleName = aiFile.replace('-illus.jpg', '');
    console.log(`   ${index + 1}. ${articleName}`);
  });
  
  return { total: svgFiles.length, withAI: aiFiles.length, missing: missingAI };
}

// Générer une liste d'articles recommandés pour les images AI
function generateRecommendedArticles() {
  const stats = checkMissingAIImages();
  
  if (stats.missing.length === 0) {
    console.log('\n🎉 Tous les articles ont des images AI !');
    return;
  }
  
  // Articles prioritaires (mots-clés importants)
  const priorityKeywords = [
    'ozempic', 'wegovy', 'mounjaro', 'diabete', 'perte-de-poids', 
    'prix', 'effet', 'naturel', 'alternative', 'traitement'
  ];
  
  const highPriority = stats.missing.filter(article => 
    priorityKeywords.some(keyword => article.toLowerCase().includes(keyword))
  );
  
  console.log(`\n🔥 Articles prioritaires (${highPriority.length}):`, highPriority.slice(0, 15));
  
  return stats;
}

// Exécuter la vérification
generateRecommendedArticles();
