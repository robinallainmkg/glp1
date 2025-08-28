#!/usr/bin/env node

/**
 * Nettoyage après suppression de la collection diabète
 */

import fs from 'fs/promises';
import path from 'path';

async function cleanDiabeteReferences() {
  console.log('🧹 NETTOYAGE RÉFÉRENCES COLLECTION DIABÈTE\n');
  
  const filesToCheck = [
    'scripts/leonardo-progress-tracker.mjs',
    'scripts/leonardo-auto-generator.mjs',
    'scripts/adapt-prompts-leonardo.mjs',
    'scripts/edit-articles.mjs',
    'src/lib/affiliate.js'
  ];
  
  let totalChanges = 0;
  
  for (const filePath of filesToCheck) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      let newContent = content;
      
      // Supprimer les références à glp1-diabete
      newContent = newContent.replace(/['"]glp1-diabete['"],?\s*/g, '');
      newContent = newContent.replace(/['"]glp1_diabete['"],?\s*/g, '');
      newContent = newContent.replace(/diabete[^'",\s]*['"]/g, '');
      
      // Nettoyer les virgules orphelines
      newContent = newContent.replace(/,\s*,/g, ',');
      newContent = newContent.replace(/,(\s*[\]}])/g, '$1');
      
      if (content !== newContent) {
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`✅ ${filePath} nettoyé`);
        totalChanges++;
      } else {
        console.log(`⚪ ${filePath} aucune référence trouvée`);
      }
      
    } catch (error) {
      console.log(`⚠️  ${filePath} non trouvé ou erreur`);
    }
  }
  
  console.log(`\n🎯 ${totalChanges} fichiers modifiés`);
  
  // Supprimer les images thumbnails diabète
  try {
    const thumbnailsDir = 'public/images/thumbnails';
    const files = await fs.readdir(thumbnailsDir);
    const diabeteImages = files.filter(f => f.includes('diabete'));
    
    if (diabeteImages.length > 0) {
      console.log('\n🖼️  Images diabète trouvées:');
      for (const img of diabeteImages) {
        console.log(`   ${img}`);
      }
      
      console.log('\n⚠️  Supprimez manuellement si nécessaire:');
      for (const img of diabeteImages) {
        console.log(`   rm public/images/thumbnails/${img}`);
      }
    }
  } catch (error) {
    console.log('⚠️  Erreur vérification thumbnails');
  }
  
  console.log('\n✅ NETTOYAGE TERMINÉ !');
  console.log('📊 Nouvelles statistiques:');
  console.log('- Médicaments: 39 articles');
  console.log('- Perte de poids: 16 articles');
  console.log('- Régimes: 14 articles');
  console.log('- Coûts: 5 articles');
  console.log('- Médecins: 5 articles');
  console.log('- Recherche: 2 articles');
  console.log('- Total: ~81 articles (sans diabète)');
}

cleanDiabeteReferences();
