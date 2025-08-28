import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zvwmztqebfnykdkgdgwj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2d216dHFlYmZueWtka2dkZ3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NDcyOTYsImV4cCI6MjA0OTUyMzI5Nn0.LQy-pQOGOQ1SL8D6z_sJQcUVoM_KH29aaJ7rGU_FKSE'
);

async function fixNutrimuscleDiscounts() {
  console.log('🔧 Correction des réductions Nutrimuscle...');
  
  // Récupérer les produits Nutrimuscle
  const { data: nutrimuscleProducts, error: fetchError } = await supabase
    .from('affiliate_products')
    .select('id, productName, discountPercent')
    .eq('brand', 'Nutrimuscle');
  
  if (fetchError) {
    console.error('❌ Erreur:', fetchError);
    return;
  }
  
  console.log(`📦 Produits Nutrimuscle trouvés: ${nutrimuscleProducts.length}`);
  
  // Afficher les réductions actuelles
  nutrimuscleProducts.forEach(p => {
    console.log(`- ${p.productName}: ${p.discountPercent ? `-${p.discountPercent}%` : 'Aucune réduction'}`);
  });
  
  // Corriger à -5%
  const { error: updateError } = await supabase
    .from('affiliate_products')
    .update({ discountPercent: 5 })
    .eq('brand', 'Nutrimuscle');
  
  if (updateError) {
    console.error('❌ Erreur lors de la mise à jour:', updateError);
  } else {
    console.log('✅ Tous les produits Nutrimuscle mis à jour à -5%');
  }
  
  // Vérification finale
  const { data: updatedProducts } = await supabase
    .from('affiliate_products')
    .select('productName, discountPercent')
    .eq('brand', 'Nutrimuscle');
  
  console.log('\n🔍 Vérification finale:');
  updatedProducts.forEach(p => {
    console.log(`- ${p.productName}: -${p.discountPercent}%`);
  });
}

fixNutrimuscleDiscounts().catch(console.error);
