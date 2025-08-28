// Script pour créer des données dynamiques d'affiliation avec badges de vente
import { supabaseAdmin } from '../src/lib/supabase.js';

console.log('🚀 Mise à jour des produits existants avec des badges dynamiques...');

async function updateExistingProducts() {
  if (!supabaseAdmin) {
    console.error('❌ Client Supabase Admin non disponible');
    return;
  }

  try {
    // Récupérer tous les produits existants
    const { data: existingProducts, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError);
      return;
    }

    console.log(`📦 ${existingProducts?.length || 0} produits existants trouvés`);

    // Mettre à jour les produits Talika avec des données de promo
    const talikaUpdates = existingProducts
      ?.filter(product => product.name?.toLowerCase().includes('talika'))
      .map(product => {
        // Gérer les tags comme un array
        const existingTags = Array.isArray(product.tags) ? product.tags : (product.tags ? product.tags.split(',') : []);
        const newTags = [...existingTags, 'promo', '-15%', 'recommandé'];
        
        return {
          id: product.id,
          name: product.name,
          brand_id: product.brand_id,
          category_id: product.category_id,
          description: product.description,
          price: product.price,
          affiliate_url: product.affiliate_url + '&promo=GLP1',
          image_url: product.image_url,
          is_glp1_recommended: true,
          stock_status: product.stock_status,
          tags: newTags,
          rating: product.rating,
          review_count: product.review_count,
          is_active: product.is_active
        };
      }) || [];

    console.log(`🏷️ Mise à jour de ${talikaUpdates.length} produits Talika avec promo -15%...`);

    for (const update of talikaUpdates) {
      const { error } = await supabaseAdmin
        .from('products')
        .update(update)
        .eq('id', update.id);

      if (error) {
        console.error(`❌ Erreur mise à jour ${update.name}:`, error);
      } else {
        console.log(`✅ Mis à jour: ${update.name}`);
        console.log(`   � Lien avec promo: ${update.affiliate_url}`);
      }
    }

    // Afficher les produits avec des liens de promo mis à jour
    console.log('\n🔍 Vérification des produits avec promo...');
    const { data: updatedProducts, error: verifyError } = await supabaseAdmin
      .from('products')
      .select('name, affiliate_url, tags')
      .contains('tags', ['promo']);

    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
    } else {
      console.log(`✅ ${updatedProducts?.length || 0} produits avec promo trouvés`);
      
      updatedProducts?.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   🔗 ${product.affiliate_url}`);
        console.log(`   🏷️ Tags: ${JSON.stringify(product.tags)}`);
      });
    }

    console.log('\n🎉 Mise à jour des produits d\'affiliation terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  }
}

await updateExistingProducts();
