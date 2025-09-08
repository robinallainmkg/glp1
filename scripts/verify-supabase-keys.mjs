import { createClient } from '@supabase/supabase-js';

// 🔍 TEST DES DIFFÉRENTES CLÉS SUPABASE TROUVÉES

const credentials = [
  {
    name: "Clés du validate-complete-system.mjs",
    url: "https://htdlypqjtpxhzmiwgwlt.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpUIn0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0ZGx5cHFqdHB4aHptaXdnd2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMwMzk4NjksImV4cCI6MjAzODYxNTg2OX0.U8EtV6Aw12OIY6b3FYF7jb7kkZZhW_lNhZQtAGI8N8s"
  }
];

console.log('🔍 VÉRIFICATION DES CLÉS SUPABASE');
console.log('================================');
console.log('');

async function testCredentials() {
  for (let i = 0; i < credentials.length; i++) {
    const cred = credentials[i];
    console.log(`📊 Test ${i + 1}: ${cred.name}`);
    console.log(`URL: ${cred.url}`);
    console.log(`Key: ${cred.key.substring(0, 30)}...`);
    
    try {
      const supabase = createClient(cred.url, cred.key);
      
      // Test 1: Connexion basique
      console.log('   🔗 Test de connexion...');
      
      const { data, error } = await supabase
        .from('_supabase_health')
        .select('*')
        .limit(1);
      
      // Si erreur "relation does not exist", c'est normal - la connexion fonctionne
      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('   ✅ Connexion OK (table health n\'existe pas, c\'est normal)');
      } else if (error) {
        console.log('   ❌ Erreur connexion:', error.message);
        continue;
      } else {
        console.log('   ✅ Connexion parfaite');
      }
      
      // Test 2: Lister les tables existantes via la metadata
      console.log('   📋 Recherche des tables existantes...');
      
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(50);
      
      if (tablesError) {
        // Alternative: tester directement nos tables
        console.log('   🔍 Test direct des tables de l\'annuaire...');
        
        const { data: cities, error: citiesError } = await supabase
          .from('french_cities')
          .select('count')
          .limit(1);
        
        const { data: profs, error: profsError } = await supabase
          .from('health_professionals')
          .select('count')
          .limit(1);
        
        if (!citiesError) {
          console.log('   ✅ Table french_cities: EXISTE');
        } else {
          console.log('   ❌ Table french_cities: MANQUANTE');
        }
        
        if (!profsError) {
          console.log('   ✅ Table health_professionals: EXISTE');
        } else {
          console.log('   ❌ Table health_professionals: MANQUANTE');
        }
        
        // Test des données existantes
        if (!citiesError || !profsError) {
          console.log('   📊 Comptage des données...');
          
          if (!citiesError) {
            const { count: cityCount } = await supabase
              .from('french_cities')
              .select('*', { count: 'exact', head: true });
            console.log(`   🏙️ Villes dans la base: ${cityCount || 0}`);
          }
          
          if (!profsError) {
            const { count: profCount } = await supabase
              .from('health_professionals')
              .select('*', { count: 'exact', head: true });
            console.log(`   👨‍⚕️ Professionnels dans la base: ${profCount || 0}`);
          }
        }
        
      } else {
        console.log(`   📋 Tables trouvées: ${tables?.length || 0}`);
        if (tables && tables.length > 0) {
          console.log('   📝 Quelques tables:', tables.slice(0, 5).map(t => t.table_name).join(', '));
        }
      }
      
      console.log('   🎉 CES CLÉS FONCTIONNENT !');
      console.log('');
      
      return cred; // Retourner les bonnes clés
      
    } catch (error) {
      console.log('   ❌ Erreur:', error.message);
      console.log('');
      continue;
    }
  }
  
  console.log('❌ AUCUNE CLÉ NE FONCTIONNE');
  console.log('');
  console.log('💡 SOLUTIONS:');
  console.log('1. Vérifiez votre connexion internet');
  console.log('2. Allez sur https://supabase.com/dashboard');
  console.log('3. Vérifiez que votre projet est actif');
  console.log('4. Récupérez les nouvelles clés API');
  
  return null;
}

// Test avec délai pour éviter les timeouts
async function testWithRetry() {
  console.log('⏳ Test en cours (peut prendre quelques secondes)...');
  console.log('');
  
  try {
    const result = await Promise.race([
      testCredentials(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 15000)
      )
    ]);
    
    if (result) {
      console.log('🎯 CLÉS VALIDÉES AVEC SUCCÈS !');
      console.log('=============================');
      console.log(`URL: ${result.url}`);
      console.log(`Key: ${result.key.substring(0, 30)}...`);
      console.log('');
      console.log('🚀 PROCHAINE ÉTAPE:');
      console.log('Ces clés peuvent être utilisées pour l\'enrichissement !');
    }
    
  } catch (error) {
    if (error.message === 'Timeout') {
      console.log('⏰ TIMEOUT: Connexion trop lente');
      console.log('');
      console.log('💡 ESSAYEZ:');
      console.log('1. Vérifiez votre connexion internet');
      console.log('2. Réessayez dans quelques minutes');
      console.log('3. Vérifiez le statut de Supabase: https://status.supabase.com');
    } else {
      console.log('❌ Erreur inattendue:', error.message);
    }
  }
}

// Exécution
testWithRetry();
