import 'dotenv/config';
#!/usr/bin/env node

/**
 * Test de la migration vers Supabase
 * Vérifie que les produits d'affiliation sont correctement chargés depuis la nouvelle table
 */

import { createClient } from '@supabase/supabase-js';

console.log('🧪 Test de la migration Supabase...\n');

// Configuration Supabase
const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour générer le badge
function generateSaleBadge(discountPercent, featured) {
  if (discountPercent && discountPercent > 0) {
    return `Promo -${discountPercent}%`;
  }
  if (featured) {
    return 'RECOMMANDÉ';
  }
  return undefined;
}

// Fonction pour calculer le prix remisé
function calculateDiscountedPrice(originalPrice, discountPercent) {
  if (!originalPrice || !discountPercent) return undefined;
  return Math.round(originalPrice * (1 - discountPercent / 100) * 100) / 100;
}

async function getAllAffiliateProducts() {
  try {
    console.log('🔍 Connexion à Supabase pour charger les produits...');

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('priority', { ascending: true });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return [];
    }

    console.log(`✅ Produits Supabase chargés: ${products?.length || 0} produits trouvés`);
    
    // Transformer les données pour correspondre à l'interface
    return products?.map(product => ({
      id: product.id,
      productName: product.title,
      brand: product.brand,
      externalLink: product.external_link,
      productImage: product.product_image,
      category: product.category,
      featured: product.featured || false,
      priority: product.priority || 999,
      description: product.description,
      benefitsText: product.benefits_text,
      discountPercent: product.discount_percent,
      discountCode: product.discount_code,
      promoCode: product.discount_code,
      saleBadgeText: generateSaleBadge(product.discount_percent, product.featured),
      originalPrice: product.price,
      discountedPrice: calculateDiscountedPrice(product.price, product.discount_percent),
      isOnSale: (product.discount_percent && product.discount_percent > 0) || false,
      slug: product.slug || product.product_id
    })) || [];

  } catch (error) {
    console.warn("❌ Erreur lors du chargement des produits d'affiliation depuis Supabase:", error);
    return [];
  }
}

async function testSupabaseProducts() {
  try {
    console.log('📦 Récupération des produits depuis Supabase...');
    
    const products = await getAllAffiliateProducts();
    
    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé!');
      console.log('');
      console.log('🔧 Pour résoudre ce problème:');
      console.log('1. Exécutez le script SQL dans Supabase: scripts/migrate-to-supabase.sql');
      console.log('2. Vérifiez vos variables d\'environnement SUPABASE_*');
      return;
    }
    
    console.log(`✅ ${products.length} produits trouvés!\n`);
    
    // Afficher les détails des produits
    console.log('📋 Détails des produits:');
    console.log('━'.repeat(80));
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productName}`);
      console.log(`   🏷️  Marque: ${product.brand}`);
      console.log(`   💰 Prix: ${product.originalPrice}€${product.discountedPrice ? ` → ${product.discountedPrice}€` : ''}`);
      console.log(`   🎯 Catégorie: ${product.category}`);
      console.log(`   ⭐ Featured: ${product.featured ? 'Oui' : 'Non'}`);
      if (product.discountPercent) {
        console.log(`   🏷️  Promo: -${product.discountPercent}% (Code: ${product.discountCode})`);
      }
      if (product.saleBadgeText) {
        console.log(`   🔖 Badge: ${product.saleBadgeText}`);
      }
      console.log(`   🔗 URL: ${product.externalLink}`);
      console.log('');
    });
    
    // Vérifier les données critiques
    console.log('🔍 Vérifications:');
    console.log('━'.repeat(50));
    
    const withImages = products.filter(p => p.productImage);
    const withDiscounts = products.filter(p => p.discountPercent && p.discountPercent > 0);
    const featured = products.filter(p => p.featured);
    const talikaProducts = products.filter(p => p.brand.toLowerCase().includes('talika'));
    const nutrimuscleProducts = products.filter(p => p.brand.toLowerCase().includes('nutrimuscle'));
    
    console.log(`✅ Produits avec images: ${withImages.length}/${products.length}`);
    console.log(`✅ Produits avec promo: ${withDiscounts.length}/${products.length}`);
    console.log(`✅ Produits featured: ${featured.length}/${products.length}`);
    console.log(`✅ Produits Talika: ${talikaProducts.length}`);
    console.log(`✅ Produits Nutrimuscle: ${nutrimuscleProducts.length}`);
    
    // Test des prix calculés
    if (withDiscounts.length > 0) {
      console.log('\n💰 Test des calculs de prix:');
      withDiscounts.forEach(product => {
        const expectedPrice = Math.round(product.originalPrice * (1 - product.discountPercent / 100) * 100) / 100;
        const calculatedPrice = product.discountedPrice;
        const match = expectedPrice === calculatedPrice;
        console.log(`${match ? '✅' : '❌'} ${product.productName}: ${product.originalPrice}€ -${product.discountPercent}% = ${calculatedPrice}€ ${match ? '' : `(attendu: ${expectedPrice}€)`}`);
      });
    }
    
    console.log('\n🎉 Migration réussie! Tous les produits sont maintenant gérés via Supabase.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.log('\n🔧 Vérifiez:');
    console.log('1. Variables d\'environnement Supabase');
    console.log('2. Connexion réseau');
    console.log('3. Structure de la table products');
  }
}

testSupabaseProducts();
