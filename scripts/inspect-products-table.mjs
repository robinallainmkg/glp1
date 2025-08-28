// Script pour voir la structure de la table products
import { supabaseAdmin } from '../src/lib/supabase.js';

console.log('🔍 Inspection de la table products...');

async function inspectProductsTable() {
  if (!supabaseAdmin) {
    console.error('❌ Client Supabase Admin non disponible');
    return;
  }

  try {
    // Récupérer un échantillon de données pour voir la structure
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .limit(3);

    if (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      return;
    }

    if (products && products.length > 0) {
      console.log('📋 Structure de la table products:');
      console.log('Colonnes trouvées:', Object.keys(products[0]));
      
      console.log('\n📦 Échantillon de données:');
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name || product.product_name || 'Produit sans nom'}`);
        Object.entries(product).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      });
    } else {
      console.log('📭 Aucun produit trouvé dans la table');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

await inspectProductsTable();
