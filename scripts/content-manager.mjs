#!/usr/bin/env node

/**
 * Script de gestion de contenu pour GLP-1 Site
 * - Gestion des images AI (réparation, optimisation)
 * - Gestion des collections (validation, synchronisation)
 * - Outils d'administration pour Tina CMS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Configuration
const COLLECTIONS_DIR = path.join(projectRoot, 'src', 'content');
const IMAGES_DIR = path.join(projectRoot, 'public', 'images', 'thumbnails');
const TINA_CONFIG = path.join(projectRoot, 'tina', 'config.ts');

/**
 * Utilitaires de couleurs pour la console
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Obtenir toutes les collections Astro
 */
function getAstroCollections() {
  try {
    const configPath = path.join(COLLECTIONS_DIR, 'config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Extraire les noms de collections
    const collectionsMatch = configContent.match(/export const collections = \{([^}]+)\}/s);
    if (!collectionsMatch) return [];
    
    const collectionsText = collectionsMatch[1];
    const collections = [];
    
    const regex = /'([^']+)':/g;
    let match;
    while ((match = regex.exec(collectionsText)) !== null) {
      collections.push(match[1]);
    }
    
    return collections;
  } catch (error) {
    log(`❌ Erreur lors de la lecture des collections Astro: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Obtenir toutes les collections Tina
 */
function getTinaCollections() {
  try {
    const tinaContent = fs.readFileSync(TINA_CONFIG, 'utf8');
    
    const collections = [];
    const regex = /name: "([^"]+)",/g;
    let match;
    while ((match = regex.exec(tinaContent)) !== null) {
      // Filtrer les champs (title, description, etc.)
      if (!['title', 'description', 'slug', 'pubDate', 'thumbnail', 'category', 'featured', 'author', 'body'].includes(match[1])) {
        collections.push(match[1]);
      }
    }
    
    return collections;
  } catch (error) {
    log(`❌ Erreur lors de la lecture des collections Tina: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Vérifier la synchronisation entre Astro et Tina
 */
function checkCollectionsSync() {
  log('\n🔍 Vérification de la synchronisation des collections...', 'blue');
  
  const astroCollections = getAstroCollections();
  const tinaCollections = getTinaCollections();
  
  log(`\n📊 Collections Astro (${astroCollections.length}):`, 'cyan');
  astroCollections.forEach(col => log(`  - ${col}`, 'cyan'));
  
  log(`\n📊 Collections Tina (${tinaCollections.length}):`, 'magenta');
  tinaCollections.forEach(col => log(`  - ${col}`, 'magenta'));
  
  // Vérifier les différences
  const missingInTina = astroCollections.filter(col => !tinaCollections.includes(col));
  const extraInTina = tinaCollections.filter(col => !astroCollections.includes(col));
  
  if (missingInTina.length > 0) {
    log(`\n⚠️  Collections manquantes dans Tina:`, 'yellow');
    missingInTina.forEach(col => log(`  - ${col}`, 'yellow'));
  }
  
  if (extraInTina.length > 0) {
    log(`\n⚠️  Collections en trop dans Tina:`, 'yellow');
    extraInTina.forEach(col => log(`  - ${col}`, 'yellow'));
  }
  
  if (missingInTina.length === 0 && extraInTina.length === 0) {
    log('\n✅ Les collections sont parfaitement synchronisées!', 'green');
  }
  
  return {
    astroCollections,
    tinaCollections,
    missingInTina,
    extraInTina,
    synced: missingInTina.length === 0 && extraInTina.length === 0
  };
}

/**
 * Vérifier l'état des images AI
 */
function checkAIImages() {
  log('\n🖼️  Vérification des images AI...', 'blue');
  
  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      log(`❌ Dossier d'images non trouvé: ${IMAGES_DIR}`, 'red');
      return { total: 0, ai: 0, svg: 0, missing: [] };
    }
    
    const files = fs.readdirSync(IMAGES_DIR);
    const aiImages = files.filter(file => file.endsWith('-illus.jpg'));
    const svgImages = files.filter(file => file.endsWith('.svg'));
    
    log(`\n📊 Images disponibles:`, 'cyan');
    log(`  - Images AI (JPG): ${aiImages.length}`, 'cyan');
    log(`  - Images SVG: ${svgImages.length}`, 'cyan');
    log(`  - Total: ${files.length}`, 'cyan');
    
    // Vérifier les images manquantes
    const missingAI = [];
    svgImages.forEach(svgFile => {
      const baseName = svgFile.replace('.svg', '');
      const aiFile = `${baseName}-illus.jpg`;
      if (!aiImages.includes(aiFile)) {
        missingAI.push(aiFile);
      }
    });
    
    if (missingAI.length > 0) {
      log(`\n⚠️  Images AI manquantes (${missingAI.length}):`, 'yellow');
      missingAI.slice(0, 10).forEach(img => log(`  - ${img}`, 'yellow'));
      if (missingAI.length > 10) {
        log(`  ... et ${missingAI.length - 10} autres`, 'yellow');
      }
    } else {
      log('\n✅ Toutes les images AI sont présentes!', 'green');
    }
    
    return {
      total: files.length,
      ai: aiImages.length,
      svg: svgImages.length,
      missing: missingAI
    };
  } catch (error) {
    log(`❌ Erreur lors de la vérification des images: ${error.message}`, 'red');
    return { total: 0, ai: 0, svg: 0, missing: [] };
  }
}

/**
 * Obtenir les statistiques des articles par collection
 */
function getCollectionStats() {
  log('\n📚 Statistiques des collections...', 'blue');
  
  const stats = {};
  
  try {
    const collections = fs.readdirSync(COLLECTIONS_DIR).filter(item => {
      const itemPath = path.join(COLLECTIONS_DIR, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    collections.forEach(collection => {
      const collectionPath = path.join(COLLECTIONS_DIR, collection);
      const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.md'));
      stats[collection] = files.length;
    });
    
    log(`\n📊 Articles par collection:`, 'cyan');
    Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([collection, count]) => {
        log(`  - ${collection}: ${count} articles`, 'cyan');
      });
    
    const totalArticles = Object.values(stats).reduce((sum, count) => sum + count, 0);
    log(`\n📖 Total: ${totalArticles} articles`, 'green');
    
  } catch (error) {
    log(`❌ Erreur lors du calcul des statistiques: ${error.message}`, 'red');
  }
  
  return stats;
}

/**
 * Fonction principale
 */
function main() {
  log('🚀 GLP-1 Content Manager', 'green');
  log('==============================', 'green');
  
  // Vérifications
  const syncResult = checkCollectionsSync();
  const imageStats = checkAIImages();
  const collectionStats = getCollectionStats();
  
  // Résumé final
  log('\n📋 RÉSUMÉ FINAL', 'green');
  log('================', 'green');
  
  if (syncResult.synced) {
    log('✅ Collections synchronisées entre Astro et Tina', 'green');
  } else {
    log('⚠️  Collections non synchronisées', 'yellow');
  }
  
  log(`📊 ${imageStats.ai} images AI générées`, imageStats.ai > 0 ? 'green' : 'yellow');
  log(`📚 ${Object.values(collectionStats).reduce((a, b) => a + b, 0)} articles au total`, 'green');
  
  if (imageStats.missing.length > 0) {
    log(`⚠️  ${imageStats.missing.length} images AI manquantes`, 'yellow');
  }
  
  log('\n🎯 Prochaines étapes recommandées:', 'blue');
  if (!syncResult.synced) {
    log('  1. Synchroniser les collections Astro/Tina', 'blue');
  }
  if (imageStats.missing.length > 0) {
    log('  2. Générer les images AI manquantes', 'blue');
  }
  log('  3. Tester le CMS Tina sur http://localhost:4321/admin', 'blue');
  
  log('\n✨ Site prêt pour la gestion de contenu!', 'green');
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkCollectionsSync, checkAIImages, getCollectionStats };
