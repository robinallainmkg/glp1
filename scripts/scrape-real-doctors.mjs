// 🔍 SCRIPT DE SCRAPING - VRAIS PROFESSIONNELS DE SANTÉ

import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import fs from 'fs';

// ⚙️ CONFIGURATION SUPABASE
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

const supabase = createClient(supabaseUrl, supabaseKey);

// 🎯 SOURCES DE DONNÉES MÉDICALES LÉGALES
const SOURCES = {
  // Annuaire officiel des médecins
  conseil_ordre: 'https://www.conseil-national.medecin.fr/annuaire',
  
  // Pages jaunes - section médecins
  pages_jaunes: 'https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui=endocrinologue&ou=',
  
  // Doctolib (API publique)
  doctolib: 'https://www.doctolib.fr/endocrinologue/',
  
  // Ameli - annuaire des professionnels de santé
  ameli: 'https://annuairesante.ameli.fr/'
};

// 🏙️ VILLES PRIORITAIRES POUR LE SCRAPING
const PRIORITY_CITIES = [
  { name: 'Paris', slug: 'paris', postal_codes: ['75001', '75002', '75003', '75004', '75005'] },
  { name: 'Lyon', slug: 'lyon', postal_codes: ['69001', '69002', '69003', '69004', '69005'] },
  { name: 'Marseille', slug: 'marseille', postal_codes: ['13001', '13002', '13003', '13004', '13005'] },
  { name: 'Toulouse', slug: 'toulouse', postal_codes: ['31000', '31100', '31200', '31300', '31400'] },
  { name: 'Bordeaux', slug: 'bordeaux', postal_codes: ['33000', '33100', '33200', '33300', '33400'] }
];

// 🔍 SPÉCIALITÉS À SCRAPER
const SPECIALTIES = [
  'endocrinologue',
  'diabétologue', 
  'nutritionniste',
  'médecin généraliste obésité',
  'médecin nutritionniste'
];

class MedicalDataScraper {
  constructor() {
    this.browser = null;
    this.scrapedData = [];
    this.errors = [];
  }

  async init() {
    console.log('🚀 Initialisation du scraper médical...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Mode visible pour debug
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    console.log('✅ Navigateur lancé');
  }

  // 🔍 SCRAPER DOCTOLIB (Source principale)
  async scrapeDoctolib(city, specialty) {
    console.log(`🔍 Scraping Doctolib: ${specialty} à ${city.name}...`);
    
    const page = await this.browser.newPage();
    
    try {
      // Construire l'URL de recherche
      const searchUrl = `https://www.doctolib.fr/${specialty}/${city.slug}`;
      
      console.log(`📍 URL: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Attendre que les résultats se chargent
      await page.waitForSelector('.SearchResult-content', { timeout: 10000 });
      
      // Extraire les données des médecins
      const doctors = await page.evaluate(() => {
        const results = [];
        const doctorCards = document.querySelectorAll('.SearchResult-item');
        
        doctorCards.forEach(card => {
          try {
            const nameElement = card.querySelector('.SearchResult-name');
            const addressElement = card.querySelector('.SearchResult-address');
            const specialtyElement = card.querySelector('.SearchResult-specialty');
            const linkElement = card.querySelector('a[href]');
            
            if (nameElement && addressElement) {
              const fullName = nameElement.textContent.trim();
              const nameParts = fullName.split(' ');
              
              results.push({
                full_name: fullName,
                first_name: nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '',
                last_name: nameParts[nameParts.length - 1] || '',
                title: fullName.includes('Dr') ? 'Dr.' : 'M.',
                specialty: specialtyElement ? specialtyElement.textContent.trim() : specialty,
                address: addressElement.textContent.trim(),
                profile_url: linkElement ? linkElement.href : null,
                source: 'doctolib'
              });
            }
          } catch (e) {
            console.warn('Erreur extraction médecin:', e);
          }
        });
        
        return results;
      });
      
      console.log(`✅ ${doctors.length} médecins trouvés sur Doctolib`);
      
      // Enrichir avec plus de détails pour chaque médecin
      for (const doctor of doctors.slice(0, 5)) { // Limiter à 5 pour éviter la surcharge
        if (doctor.profile_url) {
          try {
            await this.enrichDoctorProfile(page, doctor);
          } catch (e) {
            console.warn(`⚠️ Impossible d'enrichir le profil de ${doctor.full_name}`);
          }
        }
      }
      
      return doctors;
      
    } catch (error) {
      console.error(`❌ Erreur Doctolib ${city.name}:`, error.message);
      this.errors.push({ source: 'doctolib', city: city.name, error: error.message });
      return [];
    } finally {
      await page.close();
    }
  }

  // 📋 ENRICHIR LE PROFIL D'UN MÉDECIN
  async enrichDoctorProfile(page, doctor) {
    console.log(`🔍 Enrichissement profil: ${doctor.full_name}...`);
    
    try {
      await page.goto(doctor.profile_url, { waitUntil: 'networkidle2', timeout: 15000 });
      
      // Extraire des détails supplémentaires
      const details = await page.evaluate(() => {
        const result = {};
        
        // Téléphone
        const phoneElement = document.querySelector('[data-test-id="phone-number"]');
        if (phoneElement) {
          result.phone = phoneElement.textContent.trim();
        }
        
        // Adresse complète
        const addressElement = document.querySelector('.dl-address');
        if (addressElement) {
          result.full_address = addressElement.textContent.trim();
        }
        
        // Informations pratiques
        const infoElements = document.querySelectorAll('.dl-profile-text');
        const infos = [];
        infoElements.forEach(el => {
          infos.push(el.textContent.trim());
        });
        result.additional_info = infos.join(' | ');
        
        return result;
      });
      
      // Fusionner les détails
      Object.assign(doctor, details);
      
      console.log(`✅ Profil enrichi: ${doctor.full_name}`);
      
    } catch (error) {
      console.warn(`⚠️ Enrichissement échoué pour ${doctor.full_name}:`, error.message);
    }
  }

  // 🔍 SCRAPER PAGES JAUNES
  async scrapePagesJaunes(city, specialty) {
    console.log(`🔍 Scraping Pages Jaunes: ${specialty} à ${city.name}...`);
    
    const page = await this.browser.newPage();
    
    try {
      const searchUrl = `https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui=${encodeURIComponent(specialty)}&ou=${encodeURIComponent(city.name)}`;
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Attendre les résultats
      await page.waitForSelector('.bi-list-item', { timeout: 10000 });
      
      const doctors = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll('.bi-list-item');
        
        items.forEach(item => {
          try {
            const nameElement = item.querySelector('.denomination-links');
            const addressElement = item.querySelector('.adresse');
            const phoneElement = item.querySelector('.numero');
            
            if (nameElement) {
              const fullName = nameElement.textContent.trim();
              
              results.push({
                full_name: fullName,
                first_name: fullName.includes('Dr') ? fullName.replace('Dr ', '').split(' ')[0] : '',
                last_name: fullName.includes('Dr') ? fullName.replace('Dr ', '').split(' ').slice(1).join(' ') : fullName,
                title: fullName.includes('Dr') ? 'Dr.' : 'M.',
                address: addressElement ? addressElement.textContent.trim() : '',
                phone: phoneElement ? phoneElement.textContent.trim() : '',
                source: 'pages_jaunes'
              });
            }
          } catch (e) {
            console.warn('Erreur extraction PJ:', e);
          }
        });
        
        return results;
      });
      
      console.log(`✅ ${doctors.length} médecins trouvés sur Pages Jaunes`);
      return doctors;
      
    } catch (error) {
      console.error(`❌ Erreur Pages Jaunes ${city.name}:`, error.message);
      this.errors.push({ source: 'pages_jaunes', city: city.name, error: error.message });
      return [];
    } finally {
      await page.close();
    }
  }

  // 💾 SAUVEGARDER LES DONNÉES SCRAPÉES
  async saveScrapedData() {
    console.log('💾 Sauvegarde des données scrapées...');
    
    // Sauvegarder en JSON pour backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scraped-doctors-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(this.scrapedData, null, 2));
    console.log(`✅ Backup sauvé: ${filename}`);
    
    // Insérer dans Supabase
    if (this.scrapedData.length > 0) {
      console.log(`📊 Insertion de ${this.scrapedData.length} médecins dans Supabase...`);
      
      // Récupérer les IDs des villes
      const { data: cities } = await supabase
        .from('french_cities')
        .select('id, name, slug');
      
      const cityMap = {};
      cities?.forEach(city => {
        cityMap[city.slug] = city.id;
      });
      
      // Préparer les données pour insertion
      const professionalData = this.scrapedData.map(doctor => ({
        first_name: doctor.first_name || 'Non renseigné',
        last_name: doctor.last_name || doctor.full_name,
        title: doctor.title || 'Dr.',
        specialty: this.normalizeSpecialty(doctor.specialty),
        address: doctor.address || '',
        city_id: cityMap[doctor.city_slug] || null,
        postal_code: this.extractPostalCode(doctor.address),
        phone: this.cleanPhone(doctor.phone),
        accepts_glp1: true, // Par défaut, à vérifier manuellement
        accepts_new_patients: true,
        verified: false, // Nécessite vérification manuelle
        featured: false
      }));
      
      // Filtrer les données valides
      const validData = professionalData.filter(p => p.last_name && p.city_id);
      
      if (validData.length > 0) {
        const { data, error } = await supabase
          .from('health_professionals')
          .insert(validData);
        
        if (error) {
          console.error('❌ Erreur insertion Supabase:', error);
        } else {
          console.log(`✅ ${validData.length} médecins ajoutés à Supabase`);
        }
      }
    }
  }

  // 🧹 NORMALISER LES SPÉCIALITÉS
  normalizeSpecialty(specialty) {
    if (!specialty) return 'Médecine générale';
    
    const lower = specialty.toLowerCase();
    if (lower.includes('endocrinolog')) return 'Endocrinologie';
    if (lower.includes('diabétolog') || lower.includes('diabetolog')) return 'Diabétologie';
    if (lower.includes('nutrition')) return 'Nutrition';
    if (lower.includes('généraliste') || lower.includes('generaliste')) return 'Médecine générale';
    
    return specialty;
  }

  // 📞 NETTOYER NUMÉROS DE TÉLÉPHONE
  cleanPhone(phone) {
    if (!phone) return null;
    return phone.replace(/[^\d\s]/g, '').trim() || null;
  }

  // 📮 EXTRAIRE CODE POSTAL
  extractPostalCode(address) {
    if (!address) return null;
    const match = address.match(/\b(\d{5})\b/);
    return match ? match[1] : null;
  }

  // 🚀 LANCER LE SCRAPING COMPLET
  async scrapeAll() {
    console.log('🎯 DÉMARRAGE DU SCRAPING MÉDICAL COMPLET');
    console.log('=====================================');
    
    await this.init();
    
    for (const city of PRIORITY_CITIES) {
      console.log(`\n🏙️ Scraping ville: ${city.name}`);
      
      for (const specialty of SPECIALTIES) {
        console.log(`\n📋 Spécialité: ${specialty}`);
        
        try {
          // Scraper Doctolib (source principale)
          const doctolibDoctors = await this.scrapeDoctolib(city, specialty);
          doctolibDoctors.forEach(doc => {
            doc.city_slug = city.slug;
            this.scrapedData.push(doc);
          });
          
          // Attendre entre les requêtes
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Scraper Pages Jaunes (source secondaire)
          const pjDoctors = await this.scrapePagesJaunes(city, specialty);
          pjDoctors.forEach(doc => {
            doc.city_slug = city.slug;
            doc.specialty = specialty;
            this.scrapedData.push(doc);
          });
          
          // Attendre entre les requêtes
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } catch (error) {
          console.error(`❌ Erreur scraping ${specialty} à ${city.name}:`, error);
        }
      }
    }
    
    // Dédupliquer les données
    this.scrapedData = this.removeDuplicates(this.scrapedData);
    
    console.log(`\n📊 RÉSULTATS FINAUX:`);
    console.log(`✅ Total médecins scrapés: ${this.scrapedData.length}`);
    console.log(`❌ Erreurs rencontrées: ${this.errors.length}`);
    
    // Sauvegarder
    await this.saveScrapedData();
    
    // Fermer le navigateur
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('\n🎉 SCRAPING TERMINÉ !');
  }

  // 🔄 SUPPRIMER LES DOUBLONS
  removeDuplicates(data) {
    const seen = new Set();
    return data.filter(doctor => {
      const key = `${doctor.last_name}-${doctor.address}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// 🚀 EXÉCUTION
if (import.meta.url === `file://${process.argv[1]}`) {
  const scraper = new MedicalDataScraper();
  scraper.scrapeAll().catch(console.error);
}

export default MedicalDataScraper;
