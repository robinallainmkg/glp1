#!/usr/bin/env node

/**
 * Script de sauvegarde direct - Remplace TinaCMS
 * Usage: node scripts/quick-save.mjs [collection] [article] [image]
 */

import fs from 'fs/promises';
import path from 'path';

const collections = {
  'medicaments': 'medicaments-glp1',
  'poids': 'glp1-perte-de-poids', 
  'regime': 'regime-glp1',
  'cout': 'glp1-cout',
  'medecins': 'medecins-glp1-france',
  'recherche': 'recherche-glp1'
};

async function quickSave(collectionKey, articleName, imageName) {
  try {
    const collectionName = collections[collectionKey];
    if (!collectionName) {
      console.log('❌ Collection invalide. Utilisez: medicaments, poids, regime, cout, medecins, recherche');
      return;
    }
    
    // Trouver l'article
    const dirPath = `src/content/${collectionName}`;
    const files = await fs.readdir(dirPath);
    const articleFile = files.find(f => f.includes(articleName) && f.endsWith('.md'));
    
    if (!articleFile) {
      console.log(`❌ Article "${articleName}" non trouvé dans ${collectionName}`);
      console.log('Articles disponibles:');
      files.filter(f => f.endsWith('.md')).forEach(f => console.log(`  - ${f}`));
      return;
    }
    
    const articlePath = path.join(dirPath, articleFile);
    
    // Lire l'article
    const content = await fs.readFile(articlePath, 'utf-8');
    const [, frontmatter, body] = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    // Modifier le frontmatter
    let newFrontmatter = frontmatter;
    
    // Ajouter/remplacer thumbnail
    const thumbnailPath = `/images/thumbnails/${imageName}`;
    if (newFrontmatter.includes('thumbnail:')) {
      newFrontmatter = newFrontmatter.replace(/thumbnail:.*/, `thumbnail: "${thumbnailPath}"`);
    } else {
      newFrontmatter += `\nthumbnail: "${thumbnailPath}"`;
    }
    
    // Ajouter/remplacer thumbnailAlt si pas présent
    if (!newFrontmatter.includes('thumbnailAlt:')) {
      const altText = `Image illustrant ${articleFile.replace('.md', '').replace(/-/g, ' ')}`;
      newFrontmatter += `\nthumbnailAlt: "${altText}"`;
    }
    
    // Sauvegarder
    const newContent = `---\n${newFrontmatter}\n---\n${body}`;
    await fs.writeFile(articlePath, newContent, 'utf-8');
    
    console.log('✅ SAUVEGARDE RÉUSSIE !');
    console.log(`📁 Fichier: ${articlePath}`);
    console.log(`🖼️  Image: ${thumbnailPath}`);
    
    // Vérifier l'image
    try {
      await fs.access(`public${thumbnailPath}`);
      console.log('✅ Image trouvée');
    } catch {
      console.log('⚠️  Pensez à placer l\'image dans public/images/thumbnails/');
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

async function showUsage() {
  console.log('🚀 QUICK SAVE - Remplace TinaCMS');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/quick-save.mjs [collection] [article] [image]');
  console.log('');
  console.log('Collections:');
  Object.entries(collections).forEach(([key, value]) => {
    console.log(`  ${key} → ${value}`);
  });
  console.log('');
  console.log('Exemples:');
  console.log('  node scripts/quick-save.mjs medicaments ozempic ozempic-semaglutide.jpg');
  console.log('  node scripts/quick-save.mjs poids wegovy wegovy-perte-poids.jpg');
}

// Exécution
const [,, collection, article, image] = process.argv;

if (!collection || !article || !image) {
  await showUsage();
} else {
  await quickSave(collection, article, image);
}
