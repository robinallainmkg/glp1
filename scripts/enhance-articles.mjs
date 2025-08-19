#!/usr/bin/env node

import { generateAllThumbnails } from './generate-thumbnails.mjs';
import { generateSimilarArticles } from './generate-similar-articles.mjs';

console.log('🚀 Amélioration des articles avec images et recommandations...\n');

async function enhanceArticles() {
  try {
    // Étape 1: Générer les thumbnails
    console.log('🎨 Génération des images...');
    generateAllThumbnails();
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Étape 2: Générer les articles similaires
    console.log('🔗 Génération des recommandations...');
    generateSimilarArticles();
    
    console.log('\n✅ Amélioration terminée !');
    console.log('\n📋 Prochaines étapes :');
    console.log('  1. Vérifiez les images générées dans /public/images/thumbnails/');
    console.log('  2. Relancez le serveur de développement : npm run dev');
    console.log('  3. Testez quelques articles pour voir les nouvelles fonctionnalités');
    console.log('  4. Déployez avec : npm run deploy');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'amélioration :', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  enhanceArticles();
}

export { enhanceArticles };
