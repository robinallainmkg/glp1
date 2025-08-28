import { getCollection } from 'astro:content';

console.log('🔍 Diagnostic de la sidebar d\'affiliation...\n');

// Test 1: Vérification des collections disponibles
try {
  console.log('📁 Test des collections disponibles:');
  
  // Test avec tiret
  const withDash = await getCollection('affiliate-products');
  console.log(`✅ affiliate-products (tiret): ${withDash.length} produits trouvés`);
  
  withDash.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.data.title} (${product.data.brand})`);
  });
  
} catch (error) {
  console.log(`❌ Erreur avec affiliate-products:`, error.message);
}

try {
  // Test avec underscore
  const withUnderscore = await getCollection('affiliate_products');
  console.log(`✅ affiliate_products (underscore): ${withUnderscore.length} produits trouvés`);
} catch (error) {
  console.log(`❌ Erreur avec affiliate_products:`, error.message);
}

// Test 2: Import de la fonction affiliate
try {
  console.log('\n🔧 Test de l\'import des fonctions affiliate:');
  const { getAllAffiliateProducts, getRecommendedProducts } = await import('./src/lib/affiliate.js');
  
  console.log('✅ Import des fonctions réussi');
  
  // Test 3: Appel des fonctions
  const allProducts = await getAllAffiliateProducts();
  console.log(`✅ getAllAffiliateProducts(): ${allProducts.length} produits`);
  
  const recommended = await getRecommendedProducts('diabète glp1 traitement', 'effets-secondaires-glp1', 3);
  console.log(`✅ getRecommendedProducts(): ${recommended.length} produits recommandés`);
  
  recommended.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.productName} (${product.brand})`);
  });
  
} catch (error) {
  console.log(`❌ Erreur avec les fonctions affiliate:`, error.message);
  console.log(error.stack);
}

console.log('\n🎯 Fin du diagnostic');
