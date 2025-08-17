// Test de connexion Supabase pour les utilisateurs
import { supabaseAdmin } from '../src/lib/supabase.ts';

console.log('🧪 Test de connexion Supabase - Table users');
console.log('================================================');

async function testSupabaseUsers() {
  try {
    console.log('1️⃣ Test de connexion Supabase...');
    
    // Test de connexion basique
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('users')
      .select('count(*)', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Erreur de connexion:', connectionError);
      return;
    }
    
    console.log('✅ Connexion Supabase OK');
    console.log('📊 Nombre total d\'utilisateurs:', connectionTest);
    
    console.log('\n2️⃣ Test de récupération des utilisateurs...');
    
    // Test de récupération des utilisateurs (limite 5)
    const { data: users, error: usersError, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      console.error('Détails:', {
        code: usersError.code,
        message: usersError.message,
        details: usersError.details,
        hint: usersError.hint
      });
      return;
    }
    
    console.log('✅ Récupération réussie');
    console.log('📊 Nombre total d\'utilisateurs (count):', count);
    console.log('📋 Utilisateurs récupérés:', users?.length || 0);
    
    if (users && users.length > 0) {
      console.log('\n👥 Exemples d\'utilisateurs:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id} | Email: ${user.email || 'N/A'} | Créé: ${user.created_at || 'N/A'}`);
      });
    } else {
      console.log('📝 Aucun utilisateur trouvé dans la base de données');
    }
    
    console.log('\n3️⃣ Test de structure de la table...');
    
    // Récupérer la structure de la table
    const { data: schema, error: schemaError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Erreur lors de la récupération du schéma:', schemaError);
    } else {
      console.log('✅ Structure de la table:');
      if (schema && schema.length > 0) {
        console.log('🔑 Colonnes disponibles:', Object.keys(schema[0]));
      } else {
        console.log('📝 Table vide - impossible de déterminer la structure');
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

// Exécuter le test
testSupabaseUsers().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
