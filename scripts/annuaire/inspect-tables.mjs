import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ywekaivgjzsmdocchvum.supabase.co',
  process.env.SUPABASE_ANON_KEY
);

async function inspectTables() {
  console.log('🔍 Inspection des tables Supabase...\n');
  
  const tables = ['health_professionals', 'products', 'french_cities'];
  
  for (const table of tables) {
    console.log(`📋 Table: ${table}`);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ Erreur: ${error.message}`);
      } else {
        console.log(`✅ Accessible - ${data.length} rows`);
        if (data.length > 0) {
          console.log(`   Colonnes: ${Object.keys(data[0]).join(', ')}`);
          console.log(`   Exemple:`, data[0]);
        } else {
          console.log('   Table vide');
        }
      }
    } catch (e) {
      console.log(`❌ Exception: ${e.message}`);
    }
    console.log('');
  }
  
  // Test d'insertion simple sur health_professionals
  console.log('🧪 Test insertion sur health_professionals...');
  try {
    const { data, error } = await supabase
      .from('health_professionals')
      .insert([{}])
      .select();
      
    if (error) {
      console.log(`❌ Erreur insertion: ${error.message}`);
      console.log('💡 Cela nous donne des indices sur les colonnes requises');
    } else {
      console.log('✅ Insertion vide réussie:', data);
      // Supprimer le test
      if (data && data[0] && data[0].id) {
        await supabase
          .from('health_professionals')
          .delete()
          .eq('id', data[0].id);
      }
    }
  } catch (e) {
    console.log(`❌ Exception insertion: ${e.message}`);
  }
}

inspectTables().catch(console.error);
