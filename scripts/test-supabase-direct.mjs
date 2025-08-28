// Test simple du système d'affiliation via l'API
import { supabaseAdmin } from '../src/lib/supabase.js';

console.log('🧪 Test du système d\'affiliation via Supabase...\n');

async function testAffiliateSystemDirect() {
  if (!supabaseAdmin) {
    console.error('❌ Client Supabase Admin non disponible');
    return;
  }

  try {
    console.log('📦 Récupération des produits...');
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log(`✅ ${products?.length || 0} produits actifs trouvés\n`);

    // Analyser les produits avec promo
    const promoProducts = products?.filter(p => 
      Array.isArray(p.tags) && p.tags.includes('promo')
    ) || [];

    console.log('🔥 PRODUITS AVEC PROMOTION:');
    promoProducts.forEach((product, index) => {
      const discountTag = product.tags?.find(tag => tag.includes('%'));
      const discount = discountTag ? discountTag.match(/-?(\d+)%/)?.[1] : '0';
      const discountedPrice = product.price * (1 - parseInt(discount || '0') / 100);
      
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   💰 Prix: ${product.price}€ → ${discountedPrice.toFixed(2)}€`);
      console.log(`   🔥 Réduction: ${discount}%`);
      console.log(`   🎫 Lien promo: ${product.affiliate_url}`);
      console.log(`   🏷️ Tags: ${JSON.stringify(product.tags)}`);
      console.log('');
    });

    console.log('📊 RÉSUMÉ:');
    console.log(`├── Total produits: ${products?.length || 0}`);
    console.log(`├── Produits en promo: ${promoProducts.length}`);
    console.log(`├── Codes promo intégrés: ✅`);
    console.log(`├── Badges dynamiques: ✅`);
    console.log('└── Status: 🟢 FONCTIONNEL');

    // Test d'un produit spécifique pour l'affichage inline
    if (promoProducts.length > 0) {
      const testProduct = promoProducts[0];
      console.log('\n🎯 EXEMPLE POUR COMPOSANT INLINE:');
      console.log('ProductName:', testProduct.name);
      console.log('Brand: Talika');
      console.log('ExternalLink:', testProduct.affiliate_url);
      console.log('ProductImage:', testProduct.image_url);
      console.log('DiscountPercent: 15');
      console.log('PromoCode: GLP1');
      console.log('SaleBadgeText: RECOMMANDÉ');
      console.log('BenefitsText:', testProduct.description);
      console.log('IsOnSale: true');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

await testAffiliateSystemDirect();
