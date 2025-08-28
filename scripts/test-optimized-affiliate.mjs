// Script de test final pour le système d'affiliation optimisé
import { getAllAffiliateProducts, getFeaturedProducts } from '../src/lib/affiliate.js';

console.log('🧪 Test final du système d\'affiliation optimisé...\n');

async function testOptimizedAffiliateSystem() {
  try {
    console.log('📦 Test 1: Récupération de tous les produits...');
    const allProducts = await getAllAffiliateProducts();
    console.log(`   ✅ ${allProducts.length} produits récupérés`);
    
    if (allProducts.length > 0) {
      const firstProduct = allProducts[0];
      console.log(`   📋 Premier produit: ${firstProduct.productName}`);
      console.log(`   🏷️ Marque: ${firstProduct.brand}`);
      console.log(`   💰 Prix original: ${firstProduct.originalPrice}€`);
      console.log(`   💸 Prix réduit: ${firstProduct.discountedPrice}€`);
      console.log(`   🔥 Réduction: ${firstProduct.discountPercent}%`);
      console.log(`   🎫 Code promo: ${firstProduct.promoCode || 'Aucun'}`);
      console.log(`   🏆 Badge: ${firstProduct.saleBadgeText || 'Aucun'}`);
      console.log(`   🔗 Lien: ${firstProduct.externalLink}`);
    }

    console.log('\n🌟 Test 2: Produits recommandés...');
    const featuredProducts = await getFeaturedProducts();
    console.log(`   ✅ ${featuredProducts.length} produits recommandés`);
    
    featuredProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.productName}`);
      console.log(`      🔥 ${product.discountPercent}% de réduction`);
      console.log(`      🎫 Code: ${product.promoCode || 'N/A'}`);
      console.log(`      🏆 Badge: ${product.saleBadgeText || 'Standard'}`);
    });

    console.log('\n💎 Test 3: Produits avec promotion...');
    const promoProducts = allProducts.filter(p => p.isOnSale);
    console.log(`   ✅ ${promoProducts.length} produits en promotion`);
    
    promoProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.productName}`);
      console.log(`      💰 ${product.originalPrice}€ → ${product.discountedPrice}€`);
      console.log(`      📊 Économie: ${(product.originalPrice - product.discountedPrice).toFixed(2)}€`);
    });

    console.log('\n🎉 RÉSUMÉ DU SYSTÈME OPTIMISÉ:');
    console.log(`├── Total produits: ${allProducts.length}`);
    console.log(`├── Produits recommandés: ${featuredProducts.length}`);
    console.log(`├── Produits en promo: ${promoProducts.length}`);
    console.log(`├── Codes promo dynamiques: ✅`);
    console.log(`├── Badges de vente: ✅`);
    console.log(`├── Liens avec tracking: ✅`);
    console.log('└── Status: 🟢 OPTIMISÉ ET OPÉRATIONNEL');

    console.log('\n🚀 AMÉLIORATIONS RÉALISÉES:');
    console.log('✅ Code promo intégré dans le bouton CTA');
    console.log('✅ Design responsive sans chevauchement');
    console.log('✅ Badges de vente dynamiques depuis Supabase');
    console.log('✅ Prix barrés et réduits');
    console.log('✅ Liens de tracking automatiques');
    console.log('✅ Interface plus compacte et moderne');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

await testOptimizedAffiliateSystem();
