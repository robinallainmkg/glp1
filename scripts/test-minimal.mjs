// 🏥 AJOUT MINIMAL DE VRAIS DOCTEURS
import { createClient } from '@supabase/supabase-js';

console.log('🏥 AJOUT MINIMAL DE DOCTEURS RÉELS');

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMinimalDoctor() {
  console.log('🧪 Test avec données minimales...');
  
  try {
    const { data, error } = await supabase
      .from('health_professionals')
      .insert({
        title: "Dr. Marie Dupont - Endocrinologue Paris",
        first_name: "Marie",
        last_name: "Dupont"
      })
      .select();
      
    if (error) {
      console.error('❌ Erreur:', error.message);
      console.error('Détails:', error.details);
    } else {
      console.log('✅ Succès:', data);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

addMinimalDoctor();
