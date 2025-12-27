#!/usr/bin/env node

/**
 * Script pour tester l'insertion dans la table users (formulaire contact)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

// Utiliser la clé ANON comme le fait le formulaire
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Test INSERT formulaire contact avec clé ANON\n');

// Simuler une soumission de formulaire
const testData = {
  email: 'test-' + Date.now() + '@example.com',
  nom: 'Test User',
  telephone: '0612345678',
  age: '35',
  subject: 'Test depuis script',
  message: 'Message de test pour vérifier l\'insertion',
  treatment: 'ozempic',
  newsletter: true,
  concerns: ['perte-poids', 'diabete'],
  created_at: new Date().toISOString()
};

console.log('📝 Données de test:');
console.log(JSON.stringify(testData, null, 2));
console.log('\n🔄 Tentative d\'insertion dans table CONTACTS...\n');

async function testInsert() {
  const { data, error } = await supabase
    .from('contacts')
    .insert(testData)
    .select();

  if (error) {
    console.error('❌ ERREUR lors de l\'insertion:', error);
    console.log('\n🔍 Détails de l\'erreur:');
    console.log('   Code:', error.code);
    console.log('   Message:', error.message);
    console.log('   Details:', error.details);
    console.log('   Hint:', error.hint);
    
    if (error.code === '42501') {
      console.log('\n⚠️  PROBLÈME: Permission refusée (RLS)');
      console.log('   La table "contacts" a probablement Row Level Security activé');
      console.log('   et aucune policy ne permet les inserts anonymes.\n');
      console.log('📝 SOLUTION: Exécute ce SQL dans Supabase Dashboard:\n');
      console.log('-- Désactiver RLS temporairement pour tester');
      console.log('ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;\n');
      console.log('-- OU créer une policy permissive');
      console.log('CREATE POLICY "Allow anonymous contact inserts" ON contacts');
      console.log('  FOR INSERT');
      console.log('  TO anon');
      console.log('  WITH CHECK (true);\n');
    }
    
    if (error.code === '42P01' || error.code === 'PGRST204' || error.code === 'PGRST205') {
      console.log('\n⚠️  PROBLÈME: La table "contacts" n\'existe pas');
      console.log('📝 SOLUTION: Exécute le fichier SQL:');
      console.log('   1. Va sur https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum/editor');
      console.log('   2. Clique sur "SQL Editor"');
      console.log('   3. Copie le contenu de: supabase/create-contacts-table.sql');
      console.log('   4. Colle et clique sur "RUN"\n');
    }
    
    return;
  }

  console.log('✅ SUCCÈS ! Données insérées:', data);
  console.log('\n🎉 Le formulaire devrait fonctionner en production !');
  console.log('   Vérifie dans Supabase → Table Editor → contacts\n');
}

testInsert().catch(console.error);
