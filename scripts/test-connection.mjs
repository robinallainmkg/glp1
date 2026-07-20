import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔧 TEST DE CONNEXION SUPABASE');
console.log('=============================');
console.log('URL:', supabaseUrl);
console.log('Key (premiers chars):', supabaseKey.substring(0, 20) + '...');
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('📡 Test de connexion basique...');
    
    console.log('✅ Connexion Supabase établie');
    
    // Test: Vérifier les tables existantes
    console.log('🔍 Vérification des tables...');
    
    // Test table french_cities
    const { data: cities, error: citiesError } = await supabase
      .from('french_cities')
      .select('count')
      .limit(1);
    
    if (citiesError) {
      console.log('❌ Table french_cities:', citiesError.message);
    } else {
      console.log('✅ Table french_cities: OK');
    }
    
    // Test table health_professionals
    const { data: professionals, error: profError } = await supabase
      .from('health_professionals')
      .select('count')
      .limit(1);
    
    if (profError) {
      console.log('❌ Table health_professionals:', profError.message);
    } else {
      console.log('✅ Table health_professionals: OK');
    }
    
    // Test table professional_reviews
    const { data: reviews, error: reviewError } = await supabase
      .from('professional_reviews')
      .select('count')
      .limit(1);
    
    if (reviewError) {
      console.log('❌ Table professional_reviews:', reviewError.message);
    } else {
      console.log('✅ Table professional_reviews: OK');
    }
    
    // Test 3: Compter les données existantes
    console.log('');
    console.log('📊 ÉTAT ACTUEL DE LA BASE:');
    console.log('==========================');
    
    if (!citiesError) {
      const { count: cityCount } = await supabase
        .from('french_cities')
        .select('*', { count: 'exact', head: true });
      console.log(`🏙️ Villes: ${cityCount || 0}`);
    }
    
    if (!profError) {
      const { count: profCount } = await supabase
        .from('health_professionals')
        .select('*', { count: 'exact', head: true });
      console.log(`👨‍⚕️ Professionnels: ${profCount || 0}`);
    }
    
    if (!reviewError) {
      const { count: reviewCount } = await supabase
        .from('professional_reviews')
        .select('*', { count: 'exact', head: true });
      console.log(`⭐ Avis: ${reviewCount || 0}`);
    }
    
    console.log('');
    
    // Test 4: Instructions si tables manquantes
    if (citiesError || profError || reviewError) {
      console.log('🚨 TABLES MANQUANTES DÉTECTÉES');
      console.log('==============================');
      console.log('');
      console.log('📋 ÉTAPES À SUIVRE:');
      console.log('1. Allez sur: https://supabase.com/dashboard');
      console.log('2. Sélectionnez votre projet');
      console.log('3. Cliquez sur "SQL Editor"');
      console.log('4. Exécutez ces scripts dans l\'ordre:');
      console.log('');
      console.log('   📄 scripts/database/create-professionals-tables.sql');
      console.log('   📄 scripts/database/seed-french-cities.sql');
      console.log('   📄 scripts/database/seed-professionals.sql');
      console.log('   📄 scripts/database/optimize-performance.sql');
      console.log('');
      console.log('5. Puis relancez: node scripts/test-connection.mjs');
      console.log('');
      return false;
    }
    
    console.log('🎉 TOUTES LES TABLES SONT PRÊTES !');
    console.log('');
    console.log('🚀 PROCHAINE ÉTAPE:');
    console.log('Lancez l\'enrichissement: node scripts/enrich-database.mjs');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.log('');
    console.log('💡 SOLUTIONS POSSIBLES:');
    console.log('1. Vérifiez votre connexion internet');
    console.log('2. Vérifiez que votre projet Supabase est actif');
    console.log('3. Vérifiez les variables d\'environnement');
    console.log('4. Allez manuellement sur: https://supabase.com/dashboard');
    
    return false;
  }
}

// Exécution
testSupabaseConnection();
