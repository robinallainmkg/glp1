import 'dotenv/config';
// Test simple du scraper
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

console.log('🔍 DÉMARRAGE DU TEST SCRAPER...');

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testScrapeDoctolib() {
  console.log('🚀 Lancement de Puppeteer...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    console.log('📄 Page créée');
    
    // Test simple - aller sur Doctolib Paris
    console.log('🔍 Navigation vers Doctolib Paris...');
    await page.goto('https://www.doctolib.fr/endocrinologue/paris', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('✅ Page chargée');
    
    // Rechercher les cartes de docteurs
    const doctors = await page.evaluate(() => {
      const doctorCards = document.querySelectorAll('[data-test-id="search-result-card"], .search-result, .dl-search-result');
      console.log(`Trouvé ${doctorCards.length} cartes de docteurs`);
      
      const results = [];
      doctorCards.forEach((card, index) => {
        if (index < 3) { // Limiter à 3 pour le test
          const nameElement = card.querySelector('.dl-search-result-name, h3, .doctor-name, [data-test-id="doctor-name"]');
          const addressElement = card.querySelector('.dl-search-result-address, .address, [data-test-id="doctor-address"]');
          
          if (nameElement) {
            results.push({
              name: nameElement.textContent?.trim() || 'Nom non trouvé',
              address: addressElement?.textContent?.trim() || 'Adresse non trouvée',
              source: 'doctolib'
            });
          }
        }
      });
      
      return results;
    });
    
    console.log(`📋 Docteurs trouvés: ${doctors.length}`);
    doctors.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.name} - ${doc.address}`);
    });
    
    // Insérer en base de données
    if (doctors.length > 0) {
      console.log('💾 Insertion en base de données...');
      
      for (const doctor of doctors) {
        const { data, error } = await supabase
          .from('health_professionals')
          .insert({
            first_name: doctor.name.split(' ')[0] || 'Prénom',
            last_name: doctor.name.split(' ').slice(1).join(' ') || 'Nom',
            email: `contact@${doctor.name.toLowerCase().replace(/\s+/g, '')}.fr`,
            phone: '01 23 45 67 89',
            specialty: 'Endocrinologue',
            address: doctor.address,
            city: 'Paris',
            postal_code: '75001',
            is_verified: true,
            accepts_new_patients: true,
            languages: ['Français'],
            rating: 4.5,
            consultation_price: 50.0,
            description: `Endocrinologue expérimenté à Paris. ${doctor.address}`,
            website: 'https://www.doctolib.fr',
            source: 'doctolib_scraping'
          });
          
        if (error) {
          console.error('❌ Erreur insertion:', error);
        } else {
          console.log(`✅ ${doctor.name} ajouté en base`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Navigateur fermé');
    }
  }
}

// Exécution
testScrapeDoctolib()
  .then(() => console.log('✨ Test terminé'))
  .catch(console.error);
