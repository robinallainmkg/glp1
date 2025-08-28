#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'content');
const thumbnailsPath = path.join(__dirname, '..', 'public', 'images', 'thumbnails');

function getAvailableImages() {
  if (!fs.existsSync(thumbnailsPath)) {
    return [];
  }
  
  return fs.readdirSync(thumbnailsPath)
    .filter(file => file.match(/\.(jpg|jpeg|png|svg|webp)$/i))
    .sort();
}

function findBestThumbnail(slug) {
  const availableImages = getAvailableImages();
  
  // Priorité 1: Image .jpg avec le nom exact du slug (uploadée via Tina)
  const jpgWithSlug = availableImages.find(img => 
    img === `${slug}-illus.jpg` || img === `${slug}.jpg`
  );
  if (jpgWithSlug) {
    return { path: `/images/thumbnails/${jpgWithSlug}`, type: 'custom-jpg', priority: 1 };
  }
  
  // Priorité 2: Image .jpg avec nom similaire (variation uploadée via Tina)
  const jpgSimilar = availableImages.find(img => 
    img.includes(slug) && img.match(/\.(jpg|jpeg|png|webp)$/i)
  );
  if (jpgSimilar) {
    return { path: `/images/thumbnails/${jpgSimilar}`, type: 'custom-similar', priority: 2 };
  }
  
  // Priorité 3: Image SVG avec le nom exact (générique)
  const svgWithSlug = availableImages.find(img => 
    img === `${slug}.svg` || img === `${slug}-illus.svg`
  );
  if (svgWithSlug) {
    return { path: `/images/thumbnails/${svgWithSlug}`, type: 'generic-svg', priority: 3 };
  }
  
  // Priorité 4: Défaut générique
  return { 
    path: `/images/thumbnails/${slug}-illus.jpg`, 
    type: 'generic-fallback', 
    priority: 4 
  };
}

function updateArticleThumbnail(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraire le slug
    const slugMatch = content.match(/slug:\s*[""']([^""']+)[""']/);
    if (!slugMatch) {
      return { status: 'error', error: 'No slug found' };
    }
    
    const slug = slugMatch[1];
    const bestThumbnail = findBestThumbnail(slug);
    
    // Vérifier si l'image actuelle est différente
    const currentThumbnailMatch = content.match(/thumbnail:\s*[""']([^""']+)[""']/);
    const currentThumbnail = currentThumbnailMatch ? currentThumbnailMatch[1] : '';
    
    if (currentThumbnail === bestThumbnail.path) {
      return { 
        status: 'unchanged', 
        thumbnail: bestThumbnail.path,
        type: bestThumbnail.type 
      };
    }
    
    // Mettre à jour le thumbnail
    const newContent = content.replace(
      /thumbnail:\s*[""'][^""']*[""']/,
      `thumbnail: "${bestThumbnail.path}"`
    );
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    return {
      status: 'updated',
      oldThumbnail: currentThumbnail,
      newThumbnail: bestThumbnail.path,
      type: bestThumbnail.type,
      priority: bestThumbnail.priority
    };
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function optimizeCollection(collection) {
  const collectionPath = path.join(collectionsPath, collection);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`⚠️  Collection non trouvée: ${collection}`);
    return;
  }
  
  console.log(`\n📁 Optimisation images: ${collection}`);
  
  const files = fs.readdirSync(collectionPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(collectionPath, file));
  
  console.log(`  📄 ${files.length} articles à optimiser`);
  
  const results = [];
  for (const file of files) {
    const result = updateArticleThumbnail(file);
    const fileName = path.basename(file, '.md');
    
    if (result.status === 'updated') {
      const typeEmoji = {
        'custom-jpg': '🖼️',
        'custom-similar': '🎨',
        'generic-svg': '📄',
        'generic-fallback': '⚪'
      };
      
      console.log(`  ${typeEmoji[result.type]} ${fileName}`);
      console.log(`    ${result.oldThumbnail} → ${result.newThumbnail}`);
    } else if (result.status === 'unchanged') {
      const typeEmoji = {
        'custom-jpg': '✅',
        'custom-similar': '✅',
        'generic-svg': '⚪',
        'generic-fallback': '⚪'
      };
      console.log(`  ${typeEmoji[result.type]} ${fileName} (optimal)`);
    } else {
      console.error(`  ❌ ${fileName}: ${result.error}`);
    }
    results.push(result);
  }
  
  const updated = results.filter(r => r.status === 'updated').length;
  const unchanged = results.filter(r => r.status === 'unchanged').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  // Statistiques par type
  const customJpg = results.filter(r => r.type === 'custom-jpg').length;
  const customSimilar = results.filter(r => r.type === 'custom-similar').length;
  const genericSvg = results.filter(r => r.type === 'generic-svg').length;
  const genericFallback = results.filter(r => r.type === 'generic-fallback').length;
  
  console.log(`  📊 ${updated} mis à jour, ${unchanged} inchangés, ${errors} erreurs`);
  console.log(`  🖼️  ${customJpg} images personnalisées JPG`);
  console.log(`  🎨 ${customSimilar} images similaires`);
  console.log(`  📄 ${genericSvg} images SVG génériques`);
  console.log(`  ⚪ ${genericFallback} fallbacks`);
  
  return results;
}

async function main() {
  console.log('🖼️  OPTIMISATION INTELLIGENTE DES IMAGES');
  console.log('=' .repeat(50));
  console.log('📋 Stratégie:');
  console.log('  1️⃣  Images JPG personnalisées (TinaCMS) = priorité max');
  console.log('  2️⃣  Images similaires existantes = bonne priorité');
  console.log('  3️⃣  Images SVG génériques = fallback');
  console.log('  4️⃣  Chemins génériques = si rien d\'autre');
  
  const availableImages = getAvailableImages();
  console.log(`\n📁 ${availableImages.length} images disponibles dans /thumbnails/`);
  
  const jpgImages = availableImages.filter(img => img.match(/\.(jpg|jpeg|png|webp)$/i)).length;
  const svgImages = availableImages.filter(img => img.endsWith('.svg')).length;
  
  console.log(`  🖼️  ${jpgImages} images personnalisées (JPG/PNG/WebP)`);
  console.log(`  📄 ${svgImages} images génériques (SVG)`);
  
  const collections = [
    'medicaments-glp1',
    'glp1-perte-de-poids', 
    'glp1-cout',
    'effets-secondaires-glp1',
    'glp1-diabete',
    'regime-glp1',
    'medecins-glp1-france',
    'recherche-glp1',
    'alternatives-glp1'
  ];
  
  const allResults = [];
  
  for (const collection of collections) {
    const results = optimizeCollection(collection);
    if (results) allResults.push(...results);
  }
  
  const totalUpdated = allResults.filter(r => r.status === 'updated').length;
  const totalUnchanged = allResults.filter(r => r.status === 'unchanged').length;
  const totalErrors = allResults.filter(r => r.status === 'error').length;
  
  // Stats globales par type
  const globalCustomJpg = allResults.filter(r => r.type === 'custom-jpg').length;
  const globalCustomSimilar = allResults.filter(r => r.type === 'custom-similar').length;
  const globalGenericSvg = allResults.filter(r => r.type === 'generic-svg').length;
  const globalGenericFallback = allResults.filter(r => r.type === 'generic-fallback').length;
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RÉSULTATS GLOBAUX:');
  console.log(`🔄 Articles mis à jour: ${totalUpdated}`);
  console.log(`✅ Articles inchangés: ${totalUnchanged}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📄 Total: ${allResults.length}`);
  
  console.log('\n🎯 RÉPARTITION DES IMAGES:');
  console.log(`🖼️  Images personnalisées (TinaCMS): ${globalCustomJpg}`);
  console.log(`🎨 Images similaires: ${globalCustomSimilar}`);
  console.log(`📄 Images SVG génériques: ${globalGenericSvg}`);
  console.log(`⚪ Fallbacks génériques: ${globalGenericFallback}`);
  
  const customRate = ((globalCustomJpg + globalCustomSimilar) / allResults.length * 100).toFixed(1);
  console.log(`\n📈 Taux d'images personnalisées: ${customRate}%`);
  
  console.log('\n✅ COMPATIBILITÉ TINA PRÉSERVÉE:');
  console.log('  • Les images JPG uploadées via TinaCMS sont prioritaires');
  console.log('  • Les nouveaux uploads remplaceront automatiquement les génériques');
  console.log('  • Le système détecte et utilise les meilleures images disponibles');
}

main().catch(console.error);
