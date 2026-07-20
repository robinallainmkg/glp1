import 'dotenv/config';
// Script pour insérer les données initiales d'affiliation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertInitialData() {
  console.log('📊 Insertion des données initiales pour l\'affiliation...\n');

  try {
    // 1. Insérer les catégories de produits
    console.log('📋 Insertion des catégories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('product_categories')
      .upsert([
        {
          name: 'Compléments Digestifs',
          slug: 'complements-digestifs',
          description: 'Produits pour améliorer la digestion et réduire les troubles gastro-intestinaux',
          glp1_relevant: true
        },
        {
          name: 'Anti-nausées',
          slug: 'anti-nausees',
          description: 'Produits naturels pour lutter contre les nausées et vomissements',
          glp1_relevant: true
        },
        {
          name: 'Soins de la Peau',
          slug: 'soins-peau',
          description: 'Cosmétiques et produits de beauté',
          glp1_relevant: false
        },
        {
          name: 'Nutrition Sportive',
          slug: 'nutrition-sportive',
          description: 'Compléments alimentaires pour le sport et la performance',
          glp1_relevant: false
        }
      ], { 
        onConflict: 'slug' 
      })
      .select();

    if (categoriesError) {
      console.error('❌ Erreur insertion catégories:', categoriesError);
    } else {
      console.log('✅ Catégories insérées:', categories?.length || 0);
    }

    // 2. Insérer les marques partenaires
    console.log('📋 Insertion des marques...');
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .upsert([
        {
          name: 'Talika',
          slug: 'talika',
          logo_url: null,
          website_url: 'https://www.talika.com',
          discount_percentage: 10,
          commission_percentage: 15,
          affiliate_code: 'GLP1FRANCE',
          description: 'Leader mondial en cosmétique et compléments beauté premium. Spécialisé dans les soins anti-âge et les cils.',
          contact_email: 'partenariat@talika.com',
          is_active: true
        },
        {
          name: 'Nutrimuscle',
          slug: 'nutrimuscle',
          logo_url: null,
          website_url: 'https://www.nutrimuscle.com',
          discount_percentage: 5,
          commission_percentage: 15,
          affiliate_code: 'GLP1FRANCE',
          description: 'Compléments alimentaires de qualité pharmaceutique pour la nutrition sportive et la santé.',
          contact_email: 'partenariat@nutrimuscle.com',
          is_active: true
        }
      ], { 
        onConflict: 'slug' 
      })
      .select();

    if (brandsError) {
      console.error('❌ Erreur insertion marques:', brandsError);
    } else {
      console.log('✅ Marques insérées:', brands?.length || 0);
    }

    // 3. Attendre et récupérer les IDs des marques et catégories
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: talikaData } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', 'talika')
      .single();

    const { data: nutrimuscleData } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', 'nutrimuscle')
      .single();

    const { data: digestifCategory } = await supabase
      .from('product_categories')
      .select('id')
      .eq('slug', 'complements-digestifs')
      .single();

    const { data: antiNauseesCategory } = await supabase
      .from('product_categories')
      .select('id')
      .eq('slug', 'anti-nausees')
      .single();

    const { data: soinsCategory } = await supabase
      .from('product_categories')
      .select('id')
      .eq('slug', 'soins-peau')
      .single();

    const { data: nutritionCategory } = await supabase
      .from('product_categories')
      .select('id')
      .eq('slug', 'nutrition-sportive')
      .single();

    if (talikaData && nutrimuscleData && digestifCategory) {
      // 4. Insérer des produits d'exemple
      console.log('📋 Insertion des produits...');
      const { data: products, error: productsError } = await supabase
        .from('products')
        .upsert([
          // Produits Talika
          {
            brand_id: talikaData.id,
            category_id: soinsCategory?.id,
            name: 'Talika Lash Conditioning Cleanser',
            slug: 'talika-lash-conditioning-cleanser',
            description: 'Démaquillant doux qui fortifie les cils tout en nettoyant. Idéal pendant les traitements GLP-1 pour maintenir une routine beauté simple.',
            price: 24.90,
            currency: 'EUR',
            affiliate_url: 'https://www.talika.com/fr/lash-conditioning-cleanser',
            glp1_benefit: 'Routine beauté simplifiée, évite les irritations oculaires',
            side_effects_help: true,
            recommended_for: ['fatigue', 'yeux-secs'],
            stock_status: 'in_stock',
            is_featured: true,
            is_active: true
          },
          {
            brand_id: talikaData.id,
            category_id: soinsCategory?.id,
            name: 'Talika Bio Enzymes Mask',
            slug: 'talika-bio-enzymes-mask',
            description: 'Masque anti-âge aux bio-enzymes. Parfait pour revitaliser la peau fatiguée pendant les traitements.',
            price: 39.90,
            currency: 'EUR',
            affiliate_url: 'https://www.talika.com/fr/bio-enzymes-mask',
            glp1_benefit: 'Redonne éclat et tonus à la peau fatiguée',
            side_effects_help: true,
            recommended_for: ['fatigue', 'peau-terne'],
            stock_status: 'in_stock',
            is_featured: false,
            is_active: true
          },
          // Produits Nutrimuscle
          {
            brand_id: nutrimuscleData.id,
            category_id: digestifCategory.id,
            name: 'Nutrimuscle Probiotiques',
            slug: 'nutrimuscle-probiotiques',
            description: 'Probiotiques de qualité pharmaceutique pour restaurer la flore intestinale. Spécialement recommandé avec les traitements GLP-1.',
            price: 29.90,
            currency: 'EUR',
            affiliate_url: 'https://www.nutrimuscle.com/probiotiques',
            glp1_benefit: 'Améliore la digestion et réduit les troubles intestinaux',
            side_effects_help: true,
            recommended_for: ['ballonnements', 'diarrhée', 'constipation'],
            stock_status: 'in_stock',
            is_featured: true,
            is_active: true
          },
          {
            brand_id: nutrimuscleData.id,
            category_id: antiNauseesCategory?.id,
            name: 'Nutrimuscle Gingembre Bio',
            slug: 'nutrimuscle-gingembre-bio',
            description: 'Gingembre bio en gélules pour lutter naturellement contre les nausées. Très efficace avec les GLP-1.',
            price: 19.90,
            currency: 'EUR',
            affiliate_url: 'https://www.nutrimuscle.com/gingembre-bio',
            glp1_benefit: 'Réduit significativement les nausées',
            side_effects_help: true,
            recommended_for: ['nausées', 'vomissements'],
            stock_status: 'in_stock',
            is_featured: true,
            is_active: true
          },
          {
            brand_id: nutrimuscleData.id,
            category_id: nutritionCategory?.id,
            name: 'Nutrimuscle Multivitamines',
            slug: 'nutrimuscle-multivitamines',
            description: 'Complexe multivitaminé pour compenser les carences nutritionnelles pendant la perte de poids.',
            price: 24.90,
            currency: 'EUR',
            affiliate_url: 'https://www.nutrimuscle.com/multivitamines',
            glp1_benefit: 'Prévient les carences pendant la perte de poids',
            side_effects_help: true,
            recommended_for: ['fatigue', 'carences'],
            stock_status: 'in_stock',
            is_featured: false,
            is_active: true
          }
        ], { 
          onConflict: 'slug' 
        })
        .select();

      if (productsError) {
        console.error('❌ Erreur insertion produits:', productsError);
      } else {
        console.log('✅ Produits insérés:', products?.length || 0);
      }

      // 5. Créer quelques deals
      console.log('📋 Création des deals...');
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .upsert([
          {
            brand_id: talikaData.id,
            title: 'Talika - 10% de réduction',
            description: 'Profitez de 10% de réduction sur tous les produits Talika avec notre code partenaire',
            discount_type: 'percentage',
            discount_value: 10,
            promo_code: 'GLP1FRANCE10',
            is_active: true
          },
          {
            brand_id: nutrimuscleData.id,
            title: 'Nutrimuscle - 5% de réduction',
            description: 'Économisez 5% sur vos compléments Nutrimuscle avec notre partenariat exclusif',
            discount_type: 'percentage',
            discount_value: 5,
            promo_code: 'GLP1FRANCE5',
            is_active: true
          }
        ])
        .select();

      if (dealsError) {
        console.error('❌ Erreur création deals:', dealsError);
      } else {
        console.log('✅ Deals créés:', deals?.length || 0);
      }
    }

    console.log('\n🎉 Données initiales insérées avec succès !');
    console.log('🛍️ Produits disponibles pour les effets secondaires GLP-1');
    console.log('💰 Deals actifs : Talika (-10%) et Nutrimuscle (-5%)');

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion:', error);
  }
}

// Fonction pour afficher un résumé
async function showSummary() {
  console.log('\n📊 Résumé du système d\'affiliation :');
  
  try {
    const { data: brands } = await supabase.from('brands').select('name, is_active').eq('is_active', true);
    const { data: products } = await supabase.from('products').select('name, is_active').eq('is_active', true);
    const { data: deals } = await supabase.from('deals').select('title, is_active').eq('is_active', true);
    
    console.log(`✅ ${brands?.length || 0} marques actives`);
    console.log(`✅ ${products?.length || 0} produits actifs`);
    console.log(`✅ ${deals?.length || 0} deals actifs`);
    
    if (brands) {
      brands.forEach(brand => console.log(`   - ${brand.name}`));
    }
  } catch (error) {
    console.error('❌ Erreur résumé:', error);
  }
}

async function main() {
  await insertInitialData();
  await showSummary();
}

main().catch(console.error);
