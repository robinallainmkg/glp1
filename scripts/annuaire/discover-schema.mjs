import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ywekaivgjzsmdocchvum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY'
);

async function discoverSchema() {
  console.log('🔍 Découverte du schéma health_professionals...\n');

  const testData = {
    first_name: 'Jean',
    last_name: 'Dupont',
    title: 'Dr.',
    specialty: 'Endocrinologue',
    address: '123 Rue de la Santé, 75000 Paris',
    postal_code: '75000'
  };

  try {
    const { data, error } = await supabase
      .from('health_professionals')
      .insert([testData])
      .select();
      
    if (error) {
      console.log('❌ Erreur:', error.message);
      console.log('💡 Besoin d\'ajouter plus de colonnes requises');
    } else {
      console.log('✅ SUCCÈS! Structure complète de la table:');
      console.log('==========================================');
      
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        const value = data[0][col];
        const type = typeof value;
        console.log(`  ${col}: ${type} = ${value}`);
      });
      
      console.log('\n📊 Total colonnes:', columns.length);
      console.log('🎯 Colonnes:', columns.join(', '));
      
      // Supprimer le test
      await supabase
        .from('health_professionals')
        .delete()
        .eq('id', data[0].id);
        
      console.log('\n🗑️ Test supprimé');
      console.log('\n✅ Prêt à adapter le script d\'import!');
    }
  } catch(e) {
    console.log('❌ Exception:', e.message);
  }
}

discoverSchema().catch(console.error);
