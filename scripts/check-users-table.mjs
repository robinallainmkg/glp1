import 'dotenv/config';
#!/usr/bin/env node

/**
 * Script pour vérifier la structure de la table users
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Vérification de la structure de la table "users"\n');

async function checkTableStructure() {
  // Récupérer un exemple de ligne pour voir les colonnes
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('📭 Table vide, impossible de détecter les colonnes');
    console.log('\n💡 Colonnes attendues par le formulaire contact.astro:');
    console.log('   - email (text, primary key)');
    console.log('   - nom (text)');
    console.log('   - telephone (text)');
    console.log('   - age (text)');
    console.log('   - subject (text)');
    console.log('   - message (text)');
    console.log('   - treatment (text)');
    console.log('   - newsletter (boolean)');
    console.log('   - concerns (text[] ou jsonb)');
    console.log('   - created_at (timestamp)');
    console.log('   - updated_at (timestamp)');
    return;
  }

  console.log('✅ Table trouvée ! Colonnes détectées:');
  const columns = Object.keys(data[0]);
  columns.forEach(col => {
    console.log(`   - ${col}: ${typeof data[0][col]}`);
  });

  console.log('\n📋 Exemple de données:');
  console.log(JSON.stringify(data[0], null, 2));
}

checkTableStructure().catch(console.error);
