import 'dotenv/config';
// 🏙️ AJOUT DES VILLES FRANÇAISES AVEC RÉGIONS
import { createClient } from '@supabase/supabase-js';

console.log('🏙️ AJOUT DES VILLES FRANÇAISES AVEC RÉGIONS');

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertCitiesWithRegions() {
  console.log('🏙️ Ajout des villes françaises...');
  
  const cities = [
    { name: 'Paris', slug: 'paris', department: '75', region: 'Île-de-France' },
    { name: 'Lyon', slug: 'lyon', department: '69', region: 'Auvergne-Rhône-Alpes' },
    { name: 'Marseille', slug: 'marseille', department: '13', region: 'Provence-Alpes-Côte d\'Azur' },
    { name: 'Toulouse', slug: 'toulouse', department: '31', region: 'Occitanie' },
    { name: 'Bordeaux', slug: 'bordeaux', department: '33', region: 'Nouvelle-Aquitaine' },
    { name: 'Nice', slug: 'nice', department: '06', region: 'Provence-Alpes-Côte d\'Azur' }
  ];
  
  for (const city of cities) {
    const { error } = await supabase
      .from('french_cities')
      .insert({
        name: city.name,
        slug: city.slug,
        department: city.department,
        region: city.region
      });
      
    if (error) {
      console.error(`❌ ${city.name}: ${error.message}`);
    } else {
      console.log(`✅ ${city.name} (${city.department} - ${city.region})`);
    }
  }
}

insertCitiesWithRegions();
