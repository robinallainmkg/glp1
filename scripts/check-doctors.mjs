import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ywekaivgjzsmdocchvum.supabase.co', 
  process.env.SUPABASE_ANON_KEY
);

async function checkDoctors() {
  console.log('🔍 Vérification des médecins dans la base...');
  
  const { data, error } = await supabase
    .from('health_professionals')
    .select('first_name, last_name, specialty, hospital_clinic, email, phone')
    .limit(10);
  
  if (error) {
    console.error('Erreur:', error);
    return;
  }
  
  console.log(`\n📊 ${data.length} médecins trouvés:\n`);
  
  data.forEach((doc, index) => {
    console.log(`${index + 1}. Dr. ${doc.first_name} ${doc.last_name}`);
    console.log(`   Spécialité: ${doc.specialty}`);
    console.log(`   Établissement: ${doc.hospital_clinic}`);
    console.log(`   Email: ${doc.email || 'Non renseigné'}`);
    console.log(`   Téléphone: ${doc.phone || 'Non renseigné'}`);
    console.log('');
  });
  
  // Analyser s'ils semblent réels ou fictifs
  console.log('🤔 ANALYSE DE LA RÉALITÉ DES DONNÉES:');
  console.log('=====================================');
  
  const fictiveEmails = data.filter(doc => 
    doc.email && (doc.email.includes('example.com') || doc.email.includes('test.'))
  ).length;
  
  const fictiveNames = data.filter(doc => 
    ['Dupont', 'Martin', 'Bernard', 'Durand', 'Rousseau'].includes(doc.last_name)
  ).length;
  
  console.log(`❌ Emails fictifs détectés: ${fictiveEmails}/${data.length}`);
  console.log(`❌ Noms trop génériques: ${fictiveNames}/${data.length}`);
  
  if (fictiveEmails > 0 || fictiveNames > 2) {
    console.log('\n🚨 CES DONNÉES SEMBLENT FICTIVES !');
    console.log('Il faut scraper de vrais médecins depuis des sources officielles.');
  } else {
    console.log('\n✅ Ces données semblent authentiques.');
  }
}

checkDoctors();
