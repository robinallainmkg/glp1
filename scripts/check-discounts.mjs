import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zvwmztqebfnykdkgdgwj.supabase.co',
  process.env.SUPABASE_ANON_KEY
);

async function checkDiscounts() {
  console.log('🔍 Vérification des réductions appliquées...');
  
  const { data: products, error } = await supabase
    .from('affiliate_products')
    .select('productName, brand, discountPercent')
    .order('brand', { ascending: true });
  
  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }
  
  console.log(`📦 Total des produits: ${products.length}\n`);
  
  // Grouper par marque et afficher les réductions
  const byBrand = {};
  products.forEach(product => {
    if (!byBrand[product.brand]) {
      byBrand[product.brand] = [];
    }
    byBrand[product.brand].push(product);
  });
  
  Object.entries(byBrand).forEach(([brand, brandProducts]) => {
    console.log(`🏷️ ${brand} (${brandProducts.length} produits):`);
    
    const withDiscounts = brandProducts.filter(p => p.discountPercent && p.discountPercent > 0);
    const withoutDiscounts = brandProducts.filter(p => !p.discountPercent || p.discountPercent === 0);
    
    if (withDiscounts.length > 0) {
      withDiscounts.forEach(p => {
        console.log(`   ✅ ${p.productName}: -${p.discountPercent}%`);
      });
    }
    
    if (withoutDiscounts.length > 0) {
      withoutDiscounts.forEach(p => {
        console.log(`   ⚪ ${p.productName}: Pas de réduction`);
      });
    }
    
    console.log('');
  });
  
  // Résumé
  const talikaWithDiscount = products.filter(p => p.brand === 'Talika' && p.discountPercent === 15);
  const nutrimuscleWithDiscount = products.filter(p => p.brand === 'Nutrimuscle' && p.discountPercent === 5);
  
  console.log('📊 RÉSUMÉ:');
  console.log(`   Talika avec -15%: ${talikaWithDiscount.length} produits`);
  console.log(`   Nutrimuscle avec -5%: ${nutrimuscleWithDiscount.length} produits`);
  
  if (talikaWithDiscount.length > 0 || nutrimuscleWithDiscount.length > 0) {
    console.log('\n🎉 Les réductions sont bien appliquées !');
  } else {
    console.log('\n⚠️ Les réductions ne sont pas encore appliquées');
  }
}

checkDiscounts().catch(console.error);
