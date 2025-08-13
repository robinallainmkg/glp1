#!/usr/bin/env node
// Script de test simple pour valider les imports

import { getTalikaProduct, getProductsByKeywords, getAllProducts } from './src/utils/affiliate-manager.ts';

console.log('🧪 Test des imports du gestionnaire d\'affiliation...');

try {
  console.log('✅ Import de getTalikaProduct : OK');
  console.log('✅ Import de getProductsByKeywords : OK');
  console.log('✅ Import de getAllProducts : OK');
  
  console.log('\n🔍 Test d\'exécution...');
  
  const talikaProduct = await getTalikaProduct();
  console.log('✅ getTalikaProduct():', talikaProduct ? talikaProduct.name : 'null');
  
  const allProducts = await getAllProducts();
  console.log('✅ getAllProducts() - Nombre de produits:', allProducts.length);
  
  const contextualProducts = await getProductsByKeywords(['glp1', 'soin'], 'perte-de-poids', 3);
  console.log('✅ getProductsByKeywords() - Nombre de résultats:', contextualProducts.length);
  
  console.log('\n🎉 Tous les tests sont passés avec succès !');
  console.log('   Les corrections des imports ont fonctionné.');
  
} catch (error) {
  console.error('❌ Erreur dans les tests:', error.message);
  process.exit(1);
}
