// 🔍 INSPECTION DU SCHÉMA DE BASE DE DONNÉES
import { createClient } from '@supabase/supabase-js';

console.log('🔍 INSPECTION DU SCHÉMA SUPABASE');

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  try {
    console.log('📋 Inspection des tables...');
    
    // Tester avec une insertion simple pour voir les erreurs de colonnes
    console.log('\n🔍 Test health_professionals...');
    const { data: profTest, error: profError } = await supabase
      .from('health_professionals')
      .select('*')
      .limit(1);
      
    console.log('Données actuelles:', profTest);
    if (profError) console.log('Erreur:', profError);
    
    console.log('\n🔍 Test french_cities...');
    const { data: cityTest, error: cityError } = await supabase
      .from('french_cities')
      .select('*')
      .limit(1);
      
    console.log('Données actuelles:', cityTest);
    if (cityError) console.log('Erreur:', cityError);
    
    // Essayer d'insérer une donnée minimale pour identifier la structure
    console.log('\n🧪 Test insertion minimale...');
    const { data: insertTest, error: insertError } = await supabase
      .from('health_professionals')
      .insert({
        first_name: 'Test',
        last_name: 'Doctor'
      })
      .select();
      
    if (insertError) {
      console.log('❌ Erreur insertion:', insertError.message);
      console.log('Détails:', insertError.details);
      console.log('Hint:', insertError.hint);
    } else {
      console.log('✅ Insertion réussie:', insertTest);
      
      // Supprimer le test
      await supabase
        .from('health_professionals')
        .delete()
        .eq('first_name', 'Test');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

inspectSchema();
