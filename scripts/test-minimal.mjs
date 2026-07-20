import 'dotenv/config';
// 🏥 AJOUT MINIMAL DE VRAIS DOCTEURS
import { createClient } from '@supabase/supabase-js';

console.log('🏥 AJOUT MINIMAL DE DOCTEURS RÉELS');

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

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
