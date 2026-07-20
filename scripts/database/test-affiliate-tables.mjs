import 'dotenv/config';
// Test des tables d'affiliation Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🧪 Test des tables d\'affiliation');
console.log('=================================');

async function testAffiliateTables() {
  const tables = ['brands', 'products', 'deals', 'affiliate_stats'];
  
  for (const table of tables) {
    try {
      console.log(`\n🔍 Test table ${table}...`);
      
      const { data, error, count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact' })
        .limit(3);
      
      if (error) {
        console.error(`❌ Erreur ${table}:`, error.code, error.message);
        if (error.code === 'PGRST116') {
          console.log(`📝 La table "${table}" n'existe pas`);
        }
      } else {
        console.log(`✅ Table ${table}: ${count} enregistrements`);
        if (data && data.length > 0) {
          console.log(`📊 Exemple (${table}):`, data[0]);
        }
      }
    } catch (err) {
      console.error(`💥 Erreur ${table}:`, err.message);
    }
  }
}

testAffiliateTables().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
