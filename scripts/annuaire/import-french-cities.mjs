#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration Supabase
const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Génère un slug SEO-friendly à partir d'un nom de ville
 */
function generateSlug(name, postalCode = '') {
  let slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Ajouter le code postal pour les grandes villes avec arrondissements
  if (postalCode && ['paris', 'marseille', 'lyon'].includes(slug)) {
    slug += `-${postalCode}`;
  }
  
  return slug;
}

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Détermine si une ville est considérée comme majeure
 */
function isMajorCity(population, name) {
  const majorCities = [
    'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 
    'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes',
    'reims', 'le-havre', 'saint-etienne', 'toulon', 'grenoble',
    'dijon', 'angers', 'nimes', 'villeurbanne'
  ];
  
  const slug = generateSlug(name);
  return population > 100000 || majorCities.includes(slug);
}

/**
 * Calcule la priorité SEO d'une ville
 */
function calculateSEOPriority(population, isMajor) {
  if (isMajor) return 10;
  if (population > 50000) return 8;
  if (population > 20000) return 6;
  if (population > 10000) return 4;
  if (population > 5000) return 2;
  return 1;
}

/**
 * Import des communes françaises depuis l'API officielle
 */
async function importFrenchCities() {
  console.log('🚀 Début de l\'import des villes françaises...');
  
  try {
    // 1. Récupération des communes depuis l'API officielle
    console.log('📡 Récupération des communes depuis geo.api.gouv.fr...');
    const response = await fetch('https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,codeDepartement,codeRegion,centre,population&format=json&geometry=centre');
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const communes = await response.json();
    console.log(`✅ ${communes.length} communes récupérées`);
    
    // 2. Filtrage des villes > 5000 habitants
    const filteredCities = communes.filter(commune => 
      commune.population && commune.population >= 5000
    );
    
    console.log(`🔍 ${filteredCities.length} villes avec population >= 5000 habitants`);
    
    // 3. Récupération des départements et régions
    console.log('📡 Récupération des départements...');
    const deptsResponse = await fetch('https://geo.api.gouv.fr/departements?fields=nom,code');
    const departements = await deptsResponse.json();
    const deptsMap = Object.fromEntries(departements.map(d => [d.code, d.nom]));
    
    console.log('📡 Récupération des régions...');
    const regionsResponse = await fetch('https://geo.api.gouv.fr/regions?fields=nom,code');
    const regions = await regionsResponse.json();
    const regionsMap = Object.fromEntries(regions.map(r => [r.code, r.nom]));
    
    // 4. Transformation et enrichissement des données
    const enrichedCities = filteredCities.map(commune => {
      const slug = generateSlug(commune.nom, commune.codesPostaux?.[0]);
      const isMajor = isMajorCity(commune.population, commune.nom);
      
      return {
        name: commune.nom,
        slug: slug,
        insee_code: commune.code,
        department_code: commune.codeDepartement,
        department_name: deptsMap[commune.codeDepartement] || commune.codeDepartement,
        region_code: commune.codeRegion,
        region_name: regionsMap[commune.codeRegion] || commune.codeRegion,
        postal_codes: commune.codesPostaux || [],
        population: commune.population,
        latitude: commune.centre?.coordinates?.[1],
        longitude: commune.centre?.coordinates?.[0],
        is_major_city: isMajor,
        seo_priority: calculateSEOPriority(commune.population, isMajor),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    // 5. Tri par priorité et population
    enrichedCities.sort((a, b) => {
      if (a.seo_priority !== b.seo_priority) {
        return b.seo_priority - a.seo_priority;
      }
      return b.population - a.population;
    });
    
    console.log(`⚡ ${enrichedCities.length} villes enrichies et triées`);
    
    // 6. Insert en batch dans Supabase (par lots de 100)
    const batchSize = 100;
    let inserted = 0;
    let errors = 0;
    
    for (let i = 0; i < enrichedCities.length; i += batchSize) {
      const batch = enrichedCities.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('french_cities')
          .upsert(batch, { 
            onConflict: 'slug',
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.error(`❌ Erreur batch ${Math.floor(i/batchSize) + 1}:`, error);
          errors += batch.length;
        } else {
          inserted += batch.length;
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(enrichedCities.length/batchSize)} : ${batch.length} villes insérées`);
        }
      } catch (err) {
        console.error(`❌ Erreur technique batch ${Math.floor(i/batchSize) + 1}:`, err);
        errors += batch.length;
      }
      
      // Pause entre les batches pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // 7. Rapport final
    console.log('\n📊 RAPPORT FINAL');
    console.log(`✅ Villes insérées avec succès: ${inserted}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📈 Taux de succès: ${((inserted / (inserted + errors)) * 100).toFixed(2)}%`);
    
    // 8. Affichage des top villes
    console.log('\n🏆 TOP 20 VILLES IMPORTÉES:');
    const topCities = enrichedCities.slice(0, 20);
    topCities.forEach((city, index) => {
      console.log(`${index + 1}. ${city.name} (${city.slug}) - ${city.population.toLocaleString()} hab. - Priorité: ${city.seo_priority}`);
    });
    
    return { success: true, inserted, errors };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calcul des villes proches (Phase bonus)
 */
async function calculateNearbyCities() {
  console.log('\n🧭 Calcul des villes proches...');
  
  try {
    // Récupération de toutes les villes
    const { data: cities, error } = await supabase
      .from('french_cities')
      .select('id, slug, name, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    if (error) {
      throw error;
    }
    
    console.log(`📍 ${cities.length} villes avec coordonnées GPS`);
    
    // Pour chaque ville, calculer les 10 plus proches dans un rayon de 50km
    const updates = [];
    
    for (const city of cities) {
      const nearby = cities
        .filter(other => other.id !== city.id)
        .map(other => ({
          ...other,
          distance: calculateDistance(
            city.latitude, city.longitude,
            other.latitude, other.longitude
          )
        }))
        .filter(other => other.distance <= 50) // Rayon de 50km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10) // Top 10
        .map(other => ({
          slug: other.slug,
          name: other.name,
          distance: Math.round(other.distance)
        }));
      
      updates.push({
        id: city.id,
        nearby_cities: nearby
      });
    }
    
    // Update en batch
    const batchSize = 50;
    let updated = 0;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const update of batch) {
        const { error } = await supabase
          .from('french_cities')
          .update({ nearby_cities: update.nearby_cities })
          .eq('id', update.id);
        
        if (!error) {
          updated++;
        }
      }
      
      console.log(`🔄 Calcul villes proches: ${Math.min(i + batchSize, updates.length)}/${updates.length}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ ${updated} villes mises à jour avec villes proches`);
    
  } catch (error) {
    console.error('❌ Erreur calcul villes proches:', error);
  }
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🇫🇷 IMPORT DES VILLES FRANÇAISES - PHASE 1\n');
  
  const result = await importFrenchCities();
  
  if (result.success) {
    // Optionnel: calcul des villes proches si l'import principal réussit
    if (process.argv.includes('--with-nearby')) {
      await calculateNearbyCities();
    }
    
    console.log('\n🎉 Import terminé avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('   • npm run import:specialties (Phase 1.2)');
    console.log('   • npm run scrape:doctolib (Phase 2.1)');
    
  } else {
    console.log('\n💥 L\'import a échoué. Vérifiez les logs ci-dessus.');
    process.exit(1);
  }
}

export { importFrenchCities, calculateNearbyCities };
