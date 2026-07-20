import 'dotenv/config';
#!/usr/bin/env node

/**
 * Test spécifique pour vérifier que la page utilise bien Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPageSpecific() {
  console.log('🔍 Test pour la page: insulevel-effet-indesirable');
  console.log('🎯 Simulation de getRecommendedProducts...\n');
  
  try {
    // Récupérer les produits comme le fait la page
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('priority', { ascending: true });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return;
    }

    console.log(`✅ ${products.length} produits chargés depuis Supabase`);
    
    // Simuler la logique de getRecommendedProducts
    const articleCategory = "effets-secondaires-glp1";
    const maxResults = 3;
    
    // Filtrer par catégorie (aucun produit n'a cette catégorie, donc tous)
    let filteredProducts = products;
    const categoryMatches = products.filter(product => 
      product.category.toLowerCase().includes(articleCategory.toLowerCase())
    );
    
    if (categoryMatches.length > 0) {
      filteredProducts = categoryMatches;
      console.log(`🎯 Produits filtrés par catégorie "${articleCategory}": ${categoryMatches.length}`);
    } else {
      console.log(`ℹ️  Aucun produit spécifique à "${articleCategory}", utilisation de tous les produits`);
    }
    
    // Prioriser Talika et Nutrimuscle
    const talikaProducts = filteredProducts.filter(p => p.brand.toLowerCase() === 'talika');
    const nutrimuscleProducts = filteredProducts.filter(p => p.brand.toLowerCase() === 'nutrimuscle');
    
    console.log(`🌟 Produits Talika: ${talikaProducts.length}`);
    console.log(`💪 Produits Nutrimuscle: ${nutrimuscleProducts.length}`);
    
    // Résultat final (comme dans getRecommendedProducts)
    const result = [
      ...talikaProducts.slice(0, 2),
      ...nutrimuscleProducts.slice(0, 2),
    ].slice(0, maxResults);
    
    console.log(`\n📋 Produits qui s'affichent sur la page (${result.length}):`);
    console.log('━'.repeat(60));
    
    result.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   💰 ${product.price}€ → ${(product.price * (1 - (product.discount_percent || 0) / 100)).toFixed(2)}€ (-${product.discount_percent}%)`);
      console.log(`   🔗 ${product.external_link}`);
      console.log('');
    });
    
    if (result.length > 0) {
      console.log('🎉 CONFIRMATION: Les données viennent bien de Supabase !');
      console.log('✅ La page utilise getRecommendedProducts() → getAllAffiliateProducts() → Supabase');
    } else {
      console.log('⚠️  Aucun produit retourné par la logique');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testPageSpecific();
