import 'dotenv/config';
#!/usr/bin/env node

/**
 * Script pour finaliser les produits Talika et Nutrimuscle
 * - Mettre à jour l'image Eye Therapy Patches
 * - Supprimer le Lip Balm
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function finalizeProducts() {
  console.log('🔄 Finalisation des produits...\n');

  try {
    // 1. Mettre à jour l'image Eye Therapy Patches
    console.log('📸 Mise à jour image Eye Therapy Patches...');
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({
        product_image: '/images/products/talika-eye-therapy-patches.jpg'
      })
      .eq('title', 'Eye Therapy Patches - Talika')
      .select();

    if (updateError) {
      console.error('❌ Erreur mise à jour image:', updateError.message);
    } else {
      console.log('✅ Image Eye Therapy Patches mise à jour');
    }

    // 2. Supprimer le Lip Balm
    console.log('🗑️  Suppression du Lip Balm...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('title', 'Lip Balm - Talika');

    if (deleteError) {
      console.error('❌ Erreur suppression Lip Balm:', deleteError.message);
    } else {
      console.log('✅ Lip Balm supprimé');
    }

    // 3. Vérification finale
    console.log('\n📊 Vérification finale...');
    const { data: allProducts, error: selectError } = await supabase
      .from('products')
      .select('title, brand, product_image')
      .order('priority', { ascending: true });

    if (!selectError) {
      console.log('\n🏆 Produits finaux:');
      allProducts.forEach((product, index) => {
        const hasImage = product.product_image ? '✅' : '❌';
        console.log(`${hasImage} ${index + 1}. ${product.title} - ${product.brand}`);
        if (product.product_image) {
          console.log(`   🖼️  ${product.product_image}`);
        }
        console.log('');
      });
      console.log(`📈 Total: ${allProducts.length} produits`);

      // Répartition par marque
      const talika = allProducts.filter(p => p.brand === 'Talika');
      const nutrimuscle = allProducts.filter(p => p.brand === 'Nutrimuscle');
      console.log(`🏪 Talika: ${talika.length} produits`);
      console.log(`💪 Nutrimuscle: ${nutrimuscle.length} produits`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

finalizeProducts();
