import 'dotenv/config';
#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';

// Configuration Supabase
const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Configuration du scraper
 */
const SCRAPER_CONFIG = {
  maxPagesPerHour: 100,
  delayBetweenRequests: [2000, 5000], // 2-5 secondes
  maxRetries: 3,
  timeout: 30000,
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]
};

/**
 * Mapping spécialités Doctolib
 */
const DOCTOLIB_SPECIALTIES = {
  'endocrinologue-glp1': 'endocrinologue',
  'diabetologue': 'diabetologue',
  'nutritionniste-obesite': 'nutritionniste',
  'medecin-perte-poids': 'medecin-generaliste',
  'clinique-obesite': 'clinique'
};

/**
 * Ordre de priorité des villes (les plus importantes d'abord)
 */
const PRIORITY_CITIES = [
  // Top 10 villes majeures
  'paris', 'marseille', 'lyon', 'toulouse', 'nice',
  'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille',
  
  // Villes importantes
  'rennes', 'reims', 'le-havre', 'saint-etienne', 'toulon',
  'grenoble', 'dijon', 'angers', 'nimes', 'villeurbanne',
  'clermont-ferrand', 'aix-en-provence', 'brest', 'tours', 'limoges'
];

/**
 * Génère un délai aléatoire entre min et max
 */
function randomDelay(min = 2000, max = 5000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sélectionne un User-Agent aléatoire
 */
function getRandomUserAgent() {
  return SCRAPER_CONFIG.userAgents[Math.floor(Math.random() * SCRAPER_CONFIG.userAgents.length)];
}

/**
 * Valide les données d'un professionnel
 */
function validateProfessional(professional) {
  const errors = [];
  
  if (!professional.name || professional.name.length < 2) {
    errors.push('Nom manquant ou trop court');
  }
  
  if (!professional.address || professional.address.length < 10) {
    errors.push('Adresse manquante ou trop courte');
  }
  
  if (professional.phone && !/^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(professional.phone.replace(/\s/g, ''))) {
    errors.push('Numéro de téléphone invalide');
  }
  
  if (professional.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(professional.email)) {
    errors.push('Email invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Extrait les informations d'un professionnel depuis une page Doctolib
 */
async function extractProfessionalData(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: SCRAPER_CONFIG.timeout });
    
    const professional = await page.evaluate(() => {
      // Extraction des données depuis la page
      const nameElement = document.querySelector('[data-test-id="practitioner-name"], .js-react-on-rails-component h1, h1');
      const addressElement = document.querySelector('[data-test-id="practice-address"], .address, .full-address');
      const phoneElement = document.querySelector('[data-test-id="practice-phone"], .phone, [href^="tel:"]');
      const priceElement = document.querySelector('[data-test-id="consultation-price"], .price, .tarif');
      const bioElement = document.querySelector('[data-test-id="practitioner-bio"], .bio, .description');
      const photoElement = document.querySelector('[data-test-id="practitioner-photo"], .avatar img, .photo img');
      const languagesElement = document.querySelector('[data-test-id="languages"], .languages');
      
      // Extraction du nom
      let name = nameElement ? nameElement.textContent.trim() : '';
      const nameParts = name.match(/^(Dr\.?|Pr\.?|Docteur|Professeur)?\s*(.+)$/i);
      const title = nameParts ? (nameParts[1] || 'Dr.') : 'Dr.';
      const fullName = nameParts ? nameParts[2] : name;
      
      // Extraction du prix
      let price = null;
      if (priceElement) {
        const priceText = priceElement.textContent;
        const priceMatch = priceText.match(/(\d+)\s*€/);
        price = priceMatch ? parseInt(priceMatch[1]) : null;
      }
      
      // Extraction des langues
      let languages = ['Français'];
      if (languagesElement) {
        const langText = languagesElement.textContent;
        const langs = langText.split(',').map(l => l.trim()).filter(l => l);
        if (langs.length > 0) languages = langs;
      }
      
      // Détection GLP-1 dans la bio
      const bioText = bioElement ? bioElement.textContent.toLowerCase() : '';
      const glp1Keywords = ['ozempic', 'wegovy', 'mounjaro', 'glp-1', 'glp1', 'semaglutide', 'liraglutide', 'diabète', 'obésité'];
      const acceptsGlp1 = glp1Keywords.some(keyword => bioText.includes(keyword));
      
      return {
        name: fullName,
        title: title,
        address: addressElement ? addressElement.textContent.trim() : '',
        phone: phoneElement ? phoneElement.textContent.trim().replace(/\s/g, '') : '',
        consultation_price: price,
        bio: bioElement ? bioElement.textContent.trim() : '',
        photo_url: photoElement ? photoElement.src : '',
        languages: languages,
        accepts_glp1: acceptsGlp1,
        doctolib_url: window.location.href
      };
    });
    
    return professional;
    
  } catch (error) {
    console.error(`❌ Erreur extraction données ${url}:`, error.message);
    return null;
  }
}

/**
 * Scrape les professionnels d'une spécialité dans une ville
 */
async function scrapeCitySpecialty(browser, citySlug, specialty, limit = 50) {
  console.log(`🔍 Scraping ${specialty} à ${citySlug}...`);
  
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());
  
  try {
    // Construction de l'URL Doctolib
    const doctolibSpecialty = DOCTOLIB_SPECIALTIES[specialty] || specialty;
    const baseUrl = `https://www.doctolib.fr/${doctolibSpecialty}/${citySlug}`;
    
    console.log(`📡 Accès à ${baseUrl}`);
    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: SCRAPER_CONFIG.timeout });
    
    // Attendre le chargement des résultats
    await page.waitForSelector('[data-test-id="search-result"], .search-result, .practitioner-card', { timeout: 10000 });
    
    // Extraction des liens vers les profils
    const professionalLinks = await page.evaluate((maxLinks) => {
      const links = Array.from(document.querySelectorAll('[data-test-id="search-result"] a, .search-result a, .practitioner-card a'))
        .map(link => link.href)
        .filter(href => href && href.includes('/cabinet/'))
        .slice(0, maxLinks);
      
      return [...new Set(links)]; // Déduplication
    }, limit);
    
    console.log(`📋 ${professionalLinks.length} profils trouvés`);
    
    const professionals = [];
    
    // Scraping de chaque profil
    for (let i = 0; i < professionalLinks.length; i++) {
      const link = professionalLinks[i];
      
      try {
        console.log(`   📊 ${i + 1}/${professionalLinks.length}: ${link}`);
        
        const professional = await extractProfessionalData(page, link);
        
        if (professional) {
          // Validation des données
          const validation = validateProfessional(professional);
          
          if (validation.isValid) {
            // Ajout des métadonnées
            professional.external_id = link.split('/').pop(); // ID Doctolib
            professional.city_slug = citySlug;
            professional.specialty_slug = specialty;
            professional.scraped_at = new Date().toISOString();
            professional.is_verified = false;
            
            professionals.push(professional);
            console.log(`     ✅ ${professional.name} - ${professional.title}`);
          } else {
            console.log(`     ❌ Données invalides: ${validation.errors.join(', ')}`);
          }
        }
        
        // Délai anti-détection
        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        
      } catch (error) {
        console.error(`     ❌ Erreur profil ${link}:`, error.message);
      }
    }
    
    return professionals;
    
  } catch (error) {
    console.error(`❌ Erreur scraping ${citySlug}/${specialty}:`, error.message);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Géocode une adresse pour obtenir les coordonnées GPS
 */
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodedAddress}&limit=1`);
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].geometry.coordinates;
      return { latitude, longitude };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erreur géocodage:', error);
    return null;
  }
}

/**
 * Sauvegarde les professionnels dans Supabase
 */
async function saveProfessionals(professionals, cityId, specialtyId) {
  if (professionals.length === 0) return { saved: 0, errors: 0 };
  
  let saved = 0;
  let errors = 0;
  
  for (const professional of professionals) {
    try {
      // Géocodage de l'adresse
      const coordinates = await geocodeAddress(professional.address);
      
      const professionalData = {
        ...professional,
        city_id: cityId,
        specialty_id: specialtyId,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Upsert basé sur external_id
      const { error } = await supabase
        .from('health_professionals')
        .upsert(professionalData, { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Erreur sauvegarde ${professional.name}:`, error);
        errors++;
      } else {
        saved++;
      }
      
    } catch (error) {
      console.error(`❌ Erreur traitement ${professional.name}:`, error);
      errors++;
    }
  }
  
  return { saved, errors };
}

/**
 * Script principal de scraping Doctolib
 */
async function scrapeDoctolib(options = {}) {
  const {
    limit = 100,
    cities = [],
    specialties = [],
    skipExisting = true
  } = options;
  
  console.log('🚀 SCRAPER DOCTOLIB - PHASE 2.1\n');
  console.log(`📊 Configuration:`);
  console.log(`   • Limite: ${limit} pages`);
  console.log(`   • Délai: ${SCRAPER_CONFIG.delayBetweenRequests[0]}-${SCRAPER_CONFIG.delayBetweenRequests[1]}ms`);
  console.log(`   • Villes: ${cities.length > 0 ? cities.join(', ') : 'Toutes prioritaires'}`);
  console.log(`   • Spécialités: ${specialties.length > 0 ? specialties.join(', ') : 'Toutes'}\n`);
  
  // Récupération des villes depuis Supabase
  const targetCities = cities.length > 0 ? cities : PRIORITY_CITIES.slice(0, 10);
  
  const { data: dbCities, error: citiesError } = await supabase
    .from('french_cities')
    .select('id, slug, name, seo_priority')
    .in('slug', targetCities)
    .order('seo_priority', { ascending: false });
  
  if (citiesError) {
    console.error('❌ Erreur récupération villes:', citiesError);
    return;
  }
  
  // Récupération des spécialités
  const { data: dbSpecialties, error: specialtiesError } = await supabase
    .from('specialties')
    .select('id, slug, name, is_primary')
    .eq('is_primary', true)
    .order('seo_priority', { ascending: false });
  
  if (specialtiesError) {
    console.error('❌ Erreur récupération spécialités:', specialtiesError);
    return;
  }
  
  console.log(`🎯 ${dbCities.length} villes et ${dbSpecialties.length} spécialités à scraper\n`);
  
  // Lancement du navigateur
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  let totalProfessionals = 0;
  let totalErrors = 0;
  let pagesScraped = 0;
  
  try {
    // Scraping par ville et spécialité
    for (const city of dbCities) {
      for (const specialty of dbSpecialties) {
        if (pagesScraped >= limit) {
          console.log(`⚠️  Limite de ${limit} pages atteinte`);
          break;
        }
        
        console.log(`\n🏥 ${city.name} - ${specialty.name}`);
        
        const professionals = await scrapeCitySpecialty(
          browser, 
          city.slug, 
          specialty.slug, 
          Math.min(20, limit - pagesScraped)
        );
        
        if (professionals.length > 0) {
          const result = await saveProfessionals(professionals, city.id, specialty.id);
          totalProfessionals += result.saved;
          totalErrors += result.errors;
          
          console.log(`   ✅ ${result.saved} professionnels sauvegardés, ${result.errors} erreurs`);
        } else {
          console.log(`   ⚪ Aucun professionnel trouvé`);
        }
        
        pagesScraped++;
        
        // Pause entre les villes/spécialités
        await new Promise(resolve => setTimeout(resolve, randomDelay(3000, 7000)));
      }
      
      if (pagesScraped >= limit) break;
    }
    
    // Rapport final
    console.log('\n📊 RAPPORT FINAL DE SCRAPING');
    console.log(`✅ Professionnels ajoutés: ${totalProfessionals}`);
    console.log(`❌ Erreurs: ${totalErrors}`);
    console.log(`📄 Pages scrapées: ${pagesScraped}`);
    console.log(`🎯 Taux de succès: ${((totalProfessionals / (totalProfessionals + totalErrors)) * 100).toFixed(2)}%`);
    
    return {
      success: true,
      professionals: totalProfessionals,
      errors: totalErrors,
      pages: pagesScraped
    };
    
  } catch (error) {
    console.error('❌ Erreur scraping:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 100;
  const city = args.includes('--city') ? args[args.indexOf('--city') + 1] : null;
  
  const options = {
    limit,
    cities: city ? [city] : [],
    specialties: [],
    skipExisting: true
  };
  
  console.log('🕷️  DÉMARRAGE DU SCRAPER DOCTOLIB\n');
  
  const result = await scrapeDoctolib(options);
  
  if (result.success) {
    console.log('\n🎉 Scraping terminé avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('   • npm run clean:professionals (nettoyage)');
    console.log('   • npm run generate:landing-pages (Phase 3)');
  } else {
    console.log('\n💥 Le scraping a échoué. Vérifiez les logs ci-dessus.');
    process.exit(1);
  }
}

export { scrapeDoctolib, validateProfessional, geocodeAddress };
