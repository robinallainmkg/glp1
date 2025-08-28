// 🧪 TEST SYSTÈME D'AFFILIATION UNIFIÉ
// Tester que les produits Talika apparaissent dans la sidebar

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 TEST SYSTÈME D\'AFFILIATION UNIFIÉ\n');

try {
  // Test 1: Affiliate Manager
  console.log('📊 Test 1: Affiliate Manager');
  const { getAllActiveProducts, getProductsByBrand } = await import('../src/utils/affiliate-manager.ts');
  
  const allProducts = getAllActiveProducts();
  const talikaProducts = getProductsByBrand('Talika');
  
  console.log(`✅ ${allProducts.length} produits actifs`);
  console.log(`✅ ${talikaProducts.length} produits Talika`);
  
  talikaProducts.forEach(product => {
    console.log(`   - ${product.name} (priorité: ${product.priority})`);
  });
  
  // Test 2: Lib Affiliate
  console.log('\n📚 Test 2: Lib Affiliate');
  const { getAllAffiliateProducts, getRecommendedProducts } = await import('../src/lib/affiliate.ts');
  
  const libProducts = await getAllAffiliateProducts();
  const recommended = await getRecommendedProducts('', 'glp1-perte-de-poids', 3);
  
  console.log(`✅ ${libProducts.length} produits via lib`);
  console.log(`✅ ${recommended.length} produits recommandés`);
  
  recommended.forEach(product => {
    console.log(`   - ${product.productName} par ${product.brand} (priorité: ${product.priority})`);
  });
  
  console.log('\n🎯 RÉSULTAT:');
  if (talikaProducts.length >= 2 && recommended.length >= 2) {
    console.log('✅ SUCCÈS : Les produits Talika devraient apparaître dans la sidebar !');
  } else {
    console.log('❌ PROBLÈME : Les produits ne sont pas correctement récupérés');
  }
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
