import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zvwmztqebfnykdkgdgwj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2d216dHFlYmZueWtka2dkZ3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NDcyOTYsImV4cCI6MjA0OTUyMzI5Nn0.LQy-pQOGOQ1SL8D6z_sJQcUVoM_KH29aaJ7rGU_FKSE'
);

async function updateDiscounts() {
  console.log('🔍 Récupération des produits actuels...');
  
  // Récupérer tous les produits
  const { data: products, error: fetchError } = await supabase
    .from('affiliate_products')
    .select('id, productName, brand, discountPercent');
  
  if (fetchError) {
    console.error('❌ Erreur lors de la récupération:', fetchError);
    return;
  }
  
  console.log(`📦 Produits trouvés: ${products.length}`);
  
  // Analyser par marque
  const brandCounts = {};
  products.forEach(product => {
    brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
  });
  
  console.log('\n📋 Répartition par marque:');
  Object.entries(brandCounts).forEach(([brand, count]) => {
    console.log(`- ${brand}: ${count} produits`);
  });
  
  // Afficher les réductions actuelles
  console.log('\n🏷️ Réductions actuelles:');
  const withDiscounts = products.filter(p => p.discountPercent && p.discountPercent > 0);
  if (withDiscounts.length > 0) {
    withDiscounts.forEach(p => {
      console.log(`- ${p.productName} (${p.brand}): -${p.discountPercent}%`);
    });
  } else {
    console.log('Aucune réduction trouvée');
  }
  
  // Mise à jour des réductions
  console.log('\n🔄 Mise à jour des réductions...');
  
  // Talika: -15%
  const talikaProducts = products.filter(p => p.brand === 'Talika');
  if (talikaProducts.length > 0) {
    console.log(`\n📝 Mise à jour Talika (${talikaProducts.length} produits) -> -15%`);
    
    for (const product of talikaProducts) {
      const { error: updateError } = await supabase
        .from('affiliate_products')
        .update({ discountPercent: 15 })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`❌ Erreur pour ${product.productName}:`, updateError);
      } else {
        console.log(`✅ ${product.productName}: -15%`);
      }
    }
  } else {
    console.log('⚠️ Aucun produit Talika trouvé');
  }
  
  // Nutrimuscle: -5%
  const nutrimuscleProducts = products.filter(p => p.brand === 'Nutrimuscle');
  if (nutrimuscleProducts.length > 0) {
    console.log(`\n📝 Mise à jour Nutrimuscle (${nutrimuscleProducts.length} produits) -> -5%`);
    
    for (const product of nutrimuscleProducts) {
      const { error: updateError } = await supabase
        .from('affiliate_products')
        .update({ discountPercent: 5 })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`❌ Erreur pour ${product.productName}:`, updateError);
      } else {
        console.log(`✅ ${product.productName}: -5%`);
      }
    }
  } else {
    console.log('⚠️ Aucun produit Nutrimuscle trouvé');
  }
  
  console.log('\n🎉 Mise à jour terminée !');
  
  // Vérification finale
  console.log('\n🔍 Vérification finale...');
  const { data: updatedProducts, error: finalError } = await supabase
    .from('affiliate_products')
    .select('id, productName, brand, discountPercent')
    .or('brand.eq.Talika,brand.eq.Nutrimuscle');
  
  if (finalError) {
    console.error('❌ Erreur lors de la vérification:', finalError);
  } else {
    console.log('\n📊 Réductions mises à jour:');
    updatedProducts.forEach(p => {
      console.log(`- ${p.productName} (${p.brand}): ${p.discountPercent ? `-${p.discountPercent}%` : 'Aucune réduction'}`);
    });
  }
}

// Exécuter le script
updateDiscounts().catch(console.error);
