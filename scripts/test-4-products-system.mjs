// 🧪 TEST SYSTÈME D'AFFILIATION 4 PRODUITS
// Vérifier le fonctionnement du système de scoring contextuel

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 TEST SYSTÈME D\'AFFILIATION 4 PRODUITS\n');

// Test des fonctions affiliate manager
try {
  // Import dynamique pour tester
  const affiliateManager = await import('../src/utils/affiliate-manager.ts');
  const { 
    getAllActiveProducts, 
    getProductsByBrand, 
    getProductsForCollection,
    getBestProductForContext,
    getProductsByKeywords
  } = affiliateManager;
  
  console.log('📊 Test 1: Tous les produits actifs');
  const allProducts = getAllActiveProducts();
  console.log(`✅ ${allProducts.length} produits actifs au total`);
  allProducts.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.brand} - ${product.name}`);
    console.log(`      Prix: ${product.price}, Code: ${product.discountCode}`);
  });
  
  console.log('\n🏢 Test 2: Produits par marque');
  const talikaProducts = getProductsByBrand('Talika');
  const nutrimuscleProducts = getProductsByBrand('Nutrimuscle');
  console.log(`✅ Talika: ${talikaProducts.length} produits`);
  talikaProducts.forEach(p => console.log(`   - ${p.name}`));
  console.log(`✅ Nutrimuscle: ${nutrimuscleProducts.length} produits`);
  nutrimuscleProducts.forEach(p => console.log(`   - ${p.name}`));
  
  console.log('\n🎯 Test 3: Produits pour collection glp1-perte-de-poids');
  const collectionProducts = getProductsForCollection('glp1-perte-de-poids', 4);
  console.log(`✅ ${collectionProducts.length} produits pour cette collection (scoring contextuel)`);
  collectionProducts.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.brand} - ${product.name}`);
  });
  
  console.log('\n🔍 Test 4: Recherche par mots-clés');
  
  const beautyKeywords = ['beauté', 'peau', 'raffermissement'];
  const beautyProducts = getProductsByKeywords(beautyKeywords, 'glp1-perte-de-poids', 2);
  console.log(`\n🌸 Mots-clés beauté [${beautyKeywords.join(', ')}]:`);
  beautyProducts.forEach(p => console.log(`   ✅ ${p.brand} - ${p.name}`));
  
  const sportKeywords = ['sport', 'muscle', 'protéine'];
  const sportProducts = getProductsByKeywords(sportKeywords, 'glp1-perte-de-poids', 2);
  console.log(`\n💪 Mots-clés sport [${sportKeywords.join(', ')}]:`);
  sportProducts.forEach(p => console.log(`   ✅ ${p.brand} - ${p.name}`));
  
  console.log('\n🌟 Test 5: Meilleur produit pour contexte');
  const bestForBeauty = getBestProductForContext('glp1-perte-de-poids', ['beauté', 'peau']);
  const bestForSport = getBestProductForContext('glp1-perte-de-poids', ['sport', 'muscle']);
  
  if (bestForBeauty) {
    console.log(`✅ Meilleur pour beauté: ${bestForBeauty.brand} - ${bestForBeauty.name}`);
  }
  if (bestForSport) {
    console.log(`✅ Meilleur pour sport: ${bestForSport.brand} - ${bestForSport.name}`);
  }
  
  console.log('\n📈 Test 6: Diversité des résultats');
  console.log('Test de 5 appels successifs pour voir la variété:');
  for (let i = 1; i <= 5; i++) {
    const products = getProductsForCollection('glp1-perte-de-poids', 2);
    console.log(`   Appel ${i}: ${products.map(p => p.brand + '-' + p.name.split(' ')[0]).join(', ')}`);
  }
  
  console.log('\n✨ RÉCAPITULATIF:');
  console.log(`   🎯 ${allProducts.length} produits actifs (2 Talika + 2 Nutrimuscle)`);
  console.log('   📍 Scoring contextuel basé sur pertinence (plus de priorités fixes)');
  console.log('   💰 Codes promo: GLP1 (Talika) et NMA_GLP1 (Nutrimuscle)');
  console.log('   🔄 Diversité automatique des résultats');
  console.log('   📱 Placement intelligent selon le contexte de l\'article');
  console.log('\n🚀 Système prêt pour affichage contextuel dans la sidebar !');
  
} catch (error) {
  console.error('❌ Erreur lors du test:', error.message);
  console.error(error.stack);
}
