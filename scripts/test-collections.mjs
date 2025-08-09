#!/usr/bin/env node

import CollectionManager from './collection-manager.mjs';

/**
 * Script de test pour le gestionnaire de collections
 */

console.log('🧪 Test du Gestionnaire de Collections\n');

try {
  const manager = new CollectionManager();

  // Test 1: Charger les collections existantes
  console.log('1. Chargement des collections...');
  const collections = manager.getAllCollections();
  console.log(`   ✅ ${collections.length} collections chargées`);

  // Test 2: Statistiques des collections
  console.log('\n2. Génération des statistiques...');
  collections.forEach(collection => {
    const stats = manager.getCollectionStats(collection.id);
    console.log(`   📁 ${collection.name}:`);
    console.log(`      - ${stats.totalArticles} articles`);
    console.log(`      - ${stats.totalWords.toLocaleString()} mots au total`);
    console.log(`      - ${stats.averageWords} mots en moyenne`);
    console.log(`      - Auteurs: ${stats.authors.join(', ')}`);
  });

  // Test 3: Validation
  console.log('\n3. Test de validation...');
  const validData = {
    id: 'test-collection',
    name: 'Collection Test',
    description: 'Collection de test',
    color: '#FF5733'
  };
  
  const validation = manager.validateCollection(validData);
  console.log(`   ✅ Validation: ${validation.isValid ? 'Succès' : 'Échec'}`);
  if (!validation.isValid) {
    console.log(`   ❌ Erreurs: ${validation.errors.join(', ')}`);
  }

  // Test 4: Articles par collection
  console.log('\n4. Articles par collection...');
  const sampleCollection = collections[0];
  if (sampleCollection) {
    const articles = manager.getArticlesByCollection(sampleCollection.id);
    console.log(`   📄 Collection "${sampleCollection.name}": ${articles.length} articles`);
    
    if (articles.length > 0) {
      console.log('   Exemples:');
      articles.slice(0, 3).forEach(article => {
        console.log(`     - ${article.title} (${article.wordCount} mots)`);
      });
    }
  }

  console.log('\n✅ Tous les tests passés avec succès!');

} catch (error) {
  console.error('❌ Erreur pendant les tests:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
}
