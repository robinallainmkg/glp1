#!/usr/bin/env node

/**
 * Vérifier les progrès de génération d'images
 */

import fs from 'fs/promises';
import path from 'path';

const thumbnailsDir = 'public/images/thumbnails';

async function checkProgress() {
  try {
    const files = await fs.readdir(thumbnailsDir);
    const jpgFiles = files.filter(f => f.endsWith('.jpg')).length;
    const svgFiles = files.filter(f => f.endsWith('.svg')).length;
    
    console.log('📊 PROGRÈS GÉNÉRATION IMAGES:');
    console.log(`✅ Images JPG: ${jpgFiles}`);
    console.log(`🎨 Images SVG restantes: ${svgFiles}`);
    console.log(`📈 Progression: ${Math.round((jpgFiles/(jpgFiles+svgFiles))*100)}%`);
    
    if (svgFiles === 0) {
      console.log('🎉 TOUTES LES IMAGES GÉNÉRÉES !');
    } else {
      console.log(`⏳ Encore ${svgFiles} images à générer`);
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

checkProgress();
