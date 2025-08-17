// Script simple pour créer les tables d'affiliation dans Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

// Client admin avec permissions complètes
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAffiliateSystem() {
  console.log('🚀 Création du système d\'affiliation...\n');

  try {
    // 1. Créer la table brands
    console.log('📋 Création table brands...');
    const brandsResult = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS brands (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          logo_url TEXT,
          website_url TEXT,
          discount_percentage INTEGER NOT NULL DEFAULT 0,
          commission_percentage INTEGER NOT NULL DEFAULT 0,
          affiliate_code TEXT,
          description TEXT,
          contact_email TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
        CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);
      `
    });

    // 2. Créer la table product_categories
    console.log('📋 Création table product_categories...');
    const categoriesResult = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          glp1_relevant BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_categories_slug ON product_categories(slug);
        CREATE INDEX IF NOT EXISTS idx_categories_glp1 ON product_categories(glp1_relevant);
      `
    });

    // 3. Créer la table products
    console.log('📋 Création table products...');
    const productsResult = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
          category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          price DECIMAL(10,2),
          currency TEXT DEFAULT 'EUR',
          image_url TEXT,
          affiliate_url TEXT,
          glp1_benefit TEXT,
          side_effects_help BOOLEAN DEFAULT false,
          recommended_for TEXT[],
          stock_status TEXT DEFAULT 'in_stock',
          is_featured BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT stock_status_check CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock'))
        );
        
        CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
        CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
        CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
        CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
        CREATE INDEX IF NOT EXISTS idx_products_side_effects ON products(side_effects_help);
      `
    });

    // 4. Créer la table deals
    console.log('📋 Création table deals...');
    const dealsResult = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS deals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          discount_type TEXT DEFAULT 'percentage',
          discount_value DECIMAL(10,2) NOT NULL,
          promo_code TEXT,
          start_date DATE,
          end_date DATE,
          max_uses INTEGER,
          current_uses INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT discount_type_check CHECK (discount_type IN ('percentage', 'fixed', 'code'))
        );
        
        CREATE INDEX IF NOT EXISTS idx_deals_brand ON deals(brand_id);
        CREATE INDEX IF NOT EXISTS idx_deals_product ON deals(product_id);
        CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active);
        CREATE INDEX IF NOT EXISTS idx_deals_dates ON deals(start_date, end_date);
      `
    });

    // 5. Créer la table affiliate_stats
    console.log('📋 Création table affiliate_stats...');
    const statsResult = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS affiliate_stats (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
          deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
          click_count INTEGER DEFAULT 0,
          conversion_count INTEGER DEFAULT 0,
          revenue DECIMAL(10,2) DEFAULT 0,
          date DATE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT unique_stats_per_day UNIQUE(product_id, brand_id, deal_id, date)
        );
        
        CREATE INDEX IF NOT EXISTS idx_stats_date ON affiliate_stats(date);
        CREATE INDEX IF NOT EXISTS idx_stats_brand ON affiliate_stats(brand_id);
        CREATE INDEX IF NOT EXISTS idx_stats_product ON affiliate_stats(product_id);
      `
    });

    console.log('✅ Tables créées avec succès !');

    // Insérer les données initiales
    console.log('\n📊 Insertion des données initiales...');
    
    // Vérifier si les marques existent déjà
    const { data: existingBrands } = await supabase
      .from('brands')
      .select('name');

    if (!existingBrands || existingBrands.length === 0) {
      // Insérer Talika et Nutrimuscle
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .insert([
          {
            name: 'Talika',
            slug: 'talika',
            website_url: 'https://www.talika.com',
            discount_percentage: 10,
            commission_percentage: 15,
            description: 'Cosmétiques et compléments beauté premium',
            is_active: true
          },
          {
            name: 'Nutrimuscle',
            slug: 'nutrimuscle',
            website_url: 'https://www.nutrimuscle.com',
            discount_percentage: 5,
            commission_percentage: 15,
            description: 'Compléments alimentaires et nutrition sportive',
            is_active: true
          }
        ])
        .select();

      if (brandsError) {
        console.error('❌ Erreur insertion marques:', brandsError);
      } else {
        console.log('✅ Marques insérées:', brands?.length || 0);
      }
    } else {
      console.log('ℹ️ Marques déjà présentes:', existingBrands.length);
    }

    // Vérifier si les catégories existent déjà
    const { data: existingCategories } = await supabase
      .from('product_categories')
      .select('name');

    if (!existingCategories || existingCategories.length === 0) {
      // Insérer les catégories
      const { data: categories, error: categoriesError } = await supabase
        .from('product_categories')
        .insert([
          {
            name: 'Compléments Digestifs',
            slug: 'complements-digestifs',
            description: 'Produits pour améliorer la digestion et réduire les troubles',
            glp1_relevant: true
          },
          {
            name: 'Anti-nausées',
            slug: 'anti-nausees',
            description: 'Produits pour lutter contre les nausées',
            glp1_relevant: true
          },
          {
            name: 'Nutrition Générale',
            slug: 'nutrition-generale',
            description: 'Compléments alimentaires généraux',
            glp1_relevant: false
          },
          {
            name: 'Soins de la Peau',
            slug: 'soins-peau',
            description: 'Produits cosmétiques et dermatologiques',
            glp1_relevant: false
          }
        ])
        .select();

      if (categoriesError) {
        console.error('❌ Erreur insertion catégories:', categoriesError);
      } else {
        console.log('✅ Catégories insérées:', categories?.length || 0);
      }
    } else {
      console.log('ℹ️ Catégories déjà présentes:', existingCategories.length);
    }

    console.log('\n🎉 Système d\'affiliation créé avec succès !');
    console.log('🔗 Vous pouvez maintenant accéder au dashboard : /admin-affiliate-dashboard/');

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

// Fonction pour vérifier l'état des tables
async function checkTables() {
  console.log('\n🔍 Vérification des tables...');
  
  try {
    const tables = ['brands', 'product_categories', 'products', 'deals', 'affiliate_stats'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Table ${table}: ERREUR (${error.message})`);
      } else {
        console.log(`✅ Table ${table}: OK (${data?.length || 0} enregistrements)`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
  }
}

// Exécuter le script
async function main() {
  await createAffiliateSystem();
  await checkTables();
}

main().catch(console.error);
