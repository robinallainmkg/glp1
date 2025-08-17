// Test Supabase simple sans TypeScript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🧪 Test Supabase Users - Version Simple');
console.log('==========================================');

async function testUsers() {
  try {
    console.log('1️⃣ Test de la table users...');
    
    const { data, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .limit(5);
    
    console.log('📊 Résultats:');
    console.log('- Error:', error);
    console.log('- Count:', count);
    console.log('- Data length:', data?.length);
    console.log('- Data:', data);
    
    if (error) {
      console.error('❌ Erreur Supabase:', error);
      
      if (error.code === 'PGRST116') {
        console.log('📝 La table "users" n\'existe pas. Vérifions les tables disponibles...');
        
        // Liste des tables disponibles (ne fonctionne que si on a les permissions)
        const { data: tables, error: tablesError } = await supabaseAdmin
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (tablesError) {
          console.log('⚠️ Impossible de lister les tables:', tablesError.message);
        } else {
          console.log('📋 Tables disponibles:', tables?.map(t => t.table_name));
        }
      }
    } else {
      console.log('✅ Succès!');
      if (data && data.length > 0) {
        console.log('👥 Premiers utilisateurs:');
        data.forEach((user, i) => {
          console.log(`${i+1}. ${user.id} - ${user.email || 'No email'}`);
        });
      } else {
        console.log('📝 Table users existe mais est vide');
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

testUsers().then(() => {
  console.log('🏁 Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
