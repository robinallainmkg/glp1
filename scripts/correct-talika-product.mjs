import 'dotenv/config';
#!/usr/bin/env node

/**
 * Script pour corriger le produit Talika (remplacer le faux par le vrai)
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

async function correctTalikaProduct() {
  console.log('🔄 Correction du produit Talika...\n');

  try {
    // Supprimer l'ancien produit inventé
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('title', 'Pure Retinol Serum - Talika');

    if (deleteError) {
      console.error('❌ Erreur suppression:', deleteError.message);
    } else {
      console.log('✅ Ancien produit "Pure Retinol Serum" supprimé');
    }

    // Ajouter le vrai produit Talika
    const newProduct = {
      title: 'Bio Enzymes Mask Anti-Âge - Talika',
      product_id: 'bio-enzymes-mask-anti-age-talika',
      brand: 'Talika',
      category: 'Masque anti-âge',
      price: 58.0,
      external_link: 'https://talika.fr/discount/GLP1?redirect=/products/bio-enzymes-mask-anti-age',
      discount_percent: 15,
      discount_code: 'GLP1',
      product_image: '/images/products/bio-enzymes-mask-anti-age.webp',
      description: 'Masque enzymatique anti-âge à la texture gel-crème pour une peau lissée et revitalisée',
      featured: true,
      priority: 2,
      slug: 'bio-enzymes-mask-anti-age-talika',
      benefits_text: `<div class="benefits-highlight">
    <p><strong>🌟 Solution premium Talika :</strong> Masque enzymatique anti-âge à la texture gel-crème pour une peau lissée et revitalisée</p>
    <ul class="benefits-list">
      <li>✅ <strong>Formule avancée</strong> cliniquement prouvée</li>
      <li>✅ <strong>Résultats visibles</strong> rapidement</li>
      <li>✅ <strong>Compatible GLP-1</strong> pendant la perte de poids</li>
      <li>✅ <strong>Recommandé</strong> par les experts beauté</li>
    </ul>
  </div>`
    };

    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([newProduct])
      .select();

    if (insertError) {
      console.error('❌ Erreur ajout:', insertError.message);
    } else {
      console.log('✅ Nouveau produit ajouté:', insertData[0].title);
    }

    // Vérifier le résultat
    const { data: allProducts, error: selectError } = await supabase
      .from('products')
      .select('*')
      .order('priority', { ascending: true });

    if (!selectError) {
      console.log('\n📊 Produits Talika maintenant:');
      const talikaProducts = allProducts.filter(p => p.brand === 'Talika');
      talikaProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - ${product.price}€ (${product.discount_percent}% off)`);
      });

      console.log(`\n📈 Total: ${talikaProducts.length} produits Talika`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

correctTalikaProduct();
