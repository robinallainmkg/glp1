#!/usr/bin/env node

/**
 * 🖼️ OPTIMISEUR D'IMAGES - GLP-1 France
 * 
 * Script pour compresser et optimiser automatiquement les images PNG/JPG
 * - Compression intelligente selon le type de contenu
 * - Conversion automatique PNG → WebP pour le web
 * - Génération de versions responsive (mobile, tablet, desktop)
 * - Backup des originaux
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  inputDir: path.join(__dirname, '..', 'public', 'images', 'uploads'),
  outputDir: path.join(__dirname, '..', 'public', 'images', 'optimized'),
  backupDir: path.join(__dirname, '..', 'public', 'images', 'originals'),
  
  // Qualité de compression par type
  quality: {
    hero: 85,      // Images hero (qualité élevée)
    article: 80,   // Images d'articles (qualité normale)
    product: 90,   // Images produits (qualité maximale)
    thumbnail: 75  // Miniatures (qualité réduite)
  },
  
  // Tailles responsive
  sizes: {
    mobile: 480,
    tablet: 768,
    desktop: 1200,
    hero: 1920
  },
  
  // Extensions supportées
  supportedFormats: ['.png', '.jpg', '.jpeg', '.webp']
};

/**
 * Vérifie si ImageMagick est installé
 */
function checkImageMagick() {
  try {
    execSync('convert -version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Installe ImageMagick si nécessaire
 */
function installImageMagick() {
  console.log('🔧 Installation d\'ImageMagick...');
  try {
    if (process.platform === 'darwin') {
      execSync('brew install imagemagick', { stdio: 'inherit' });
    } else if (process.platform === 'linux') {
      execSync('sudo apt-get install imagemagick', { stdio: 'inherit' });
    } else {
      console.log('❌ Plateforme non supportée. Installez ImageMagick manuellement.');
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'installation d\'ImageMagick:', error.message);
    return false;
  }
}

/**
 * Crée les dossiers nécessaires
 */
function createDirectories() {
  const dirs = [CONFIG.inputDir, CONFIG.outputDir, CONFIG.backupDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Dossier créé: ${path.relative(process.cwd(), dir)}`);
    }
  });
}

/**
 * Détermine le type d'image selon le nom du fichier
 */
function getImageType(filename) {
  const name = filename.toLowerCase();
  
  if (name.includes('hero') || name.includes('banner')) return 'hero';
  if (name.includes('product') || name.includes('produit')) return 'product';
  if (name.includes('thumb') || name.includes('miniature')) return 'thumbnail';
  
  return 'article';
}

/**
 * Compresse une image avec ImageMagick
 */
function compressImage(inputPath, outputPath, quality, width = null) {
  try {
    let command = `convert "${inputPath}"`;
    
    // Redimensionnement si spécifié
    if (width) {
      command += ` -resize ${width}x -strip`;
    } else {
      command += ' -strip';
    }
    
    // Compression
    command += ` -quality ${quality}`;
    
    // Optimisation spécifique selon l'extension
    const ext = path.extname(outputPath).toLowerCase();
    if (ext === '.webp') {
      command += ' -define webp:method=6';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      command += ' -sampling-factor 4:2:0 -interlace Plane';
    }
    
    command += ` "${outputPath}"`;
    
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`❌ Erreur compression: ${error.message}`);
    return false;
  }
}

/**
 * Génère les versions responsive d'une image
 */
function generateResponsiveVersions(inputPath, outputDir, basename, type) {
  const quality = CONFIG.quality[type];
  const results = [];
  
  // Version WebP originale
  const webpPath = path.join(outputDir, `${basename}.webp`);
  if (compressImage(inputPath, webpPath, quality)) {
    results.push({ format: 'webp', size: 'original', path: webpPath });
  }
  
  // Versions responsive
  Object.entries(CONFIG.sizes).forEach(([sizeName, width]) => {
    // WebP responsive
    const webpResponsivePath = path.join(outputDir, `${basename}-${sizeName}.webp`);
    if (compressImage(inputPath, webpResponsivePath, quality, width)) {
      results.push({ format: 'webp', size: sizeName, path: webpResponsivePath });
    }
    
    // JPG responsive (fallback)
    const jpgResponsivePath = path.join(outputDir, `${basename}-${sizeName}.jpg`);
    if (compressImage(inputPath, jpgResponsivePath, quality, width)) {
      results.push({ format: 'jpg', size: sizeName, path: jpgResponsivePath });
    }
  });
  
  return results;
}

/**
 * Optimise une image
 */
function optimizeImage(filePath) {
  const filename = path.basename(filePath);
  const basename = path.parse(filename).name;
  const ext = path.extname(filename).toLowerCase();
  
  if (!CONFIG.supportedFormats.includes(ext)) {
    console.log(`⚠️  Format non supporté: ${filename}`);
    return;
  }
  
  console.log(`🔄 Traitement: ${filename}`);
  
  // Déterminer le type d'image
  const imageType = getImageType(filename);
  console.log(`   Type détecté: ${imageType}`);
  
  // Backup de l'original
  const backupPath = path.join(CONFIG.backupDir, filename);
  fs.copyFileSync(filePath, backupPath);
  console.log(`   💾 Backup: ${path.relative(process.cwd(), backupPath)}`);
  
  // Génération des versions optimisées
  const results = generateResponsiveVersions(filePath, CONFIG.outputDir, basename, imageType);
  
  if (results.length > 0) {
    console.log(`   ✅ ${results.length} versions générées:`);
    results.forEach(result => {
      const fileSize = (fs.statSync(result.path).size / 1024).toFixed(1);
      console.log(`      - ${result.format} ${result.size}: ${fileSize}KB`);
    });
    
    // Génération du code HTML pour l'intégration
    generateImageCode(basename, imageType, results);
  }
}

/**
 * Génère le code HTML pour l'intégration responsive
 */
function generateImageCode(basename, type, results) {
  const codeFile = path.join(CONFIG.outputDir, `${basename}-code.html`);
  
  // Grouper par format
  const webpSources = results.filter(r => r.format === 'webp');
  const jpgSources = results.filter(r => r.format === 'jpg');
  
  let html = `<!-- Code d'intégration pour ${basename} (type: ${type}) -->\n`;
  html += `<picture class="responsive-image ${type}-image">\n`;
  
  // Sources WebP
  if (webpSources.length > 0) {
    webpSources.forEach(source => {
      const mediaQuery = CONFIG.sizes[source.size] ? `(max-width: ${CONFIG.sizes[source.size]}px)` : '';
      const srcset = `/images/optimized/${path.basename(source.path)}`;
      
      if (mediaQuery) {
        html += `  <source media="${mediaQuery}" srcset="${srcset}" type="image/webp">\n`;
      }
    });
  }
  
  // Fallback JPG
  const defaultJpg = jpgSources.find(s => s.size === 'desktop') || jpgSources[0];
  if (defaultJpg) {
    html += `  <img src="/images/optimized/${path.basename(defaultJpg.path)}" \n`;
    html += `       alt="${basename.replace(/-/g, ' ')}" \n`;
    html += `       loading="lazy" \n`;
    html += `       class="w-full h-auto">\n`;
  }
  
  html += `</picture>\n\n`;
  
  // CSS suggéré
  html += `<!-- CSS suggéré -->\n`;
  html += `<style>\n`;
  html += `.${type}-image {\n`;
  html += `  display: block;\n`;
  html += `  max-width: 100%;\n`;
  html += `  height: auto;\n`;
  
  if (type === 'hero') {
    html += `  aspect-ratio: 16/9;\n`;
    html += `  object-fit: cover;\n`;
  } else if (type === 'product') {
    html += `  aspect-ratio: 1/1;\n`;
    html += `  object-fit: contain;\n`;
  }
  
  html += `}\n`;
  html += `</style>\n`;
  
  fs.writeFileSync(codeFile, html);
  console.log(`   📄 Code généré: ${path.relative(process.cwd(), codeFile)}`);
}

/**
 * Traite tous les fichiers du dossier d'upload
 */
function processAllImages() {
  if (!fs.existsSync(CONFIG.inputDir)) {
    console.log('📁 Dossier d\'upload créé. Placez vos images dans:');
    console.log(`   ${path.relative(process.cwd(), CONFIG.inputDir)}`);
    return;
  }
  
  const files = fs.readdirSync(CONFIG.inputDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return CONFIG.supportedFormats.includes(ext);
  });
  
  if (files.length === 0) {
    console.log('📂 Aucune image à traiter dans le dossier d\'upload.');
    return;
  }
  
  console.log(`🎯 ${files.length} image(s) à optimiser...\n`);
  
  files.forEach(file => {
    const filePath = path.join(CONFIG.inputDir, file);
    optimizeImage(filePath);
    console.log(); // Ligne vide entre les fichiers
  });
  
  console.log('🎉 Optimisation terminée !');
  console.log('\n📋 Résumé:');
  console.log(`   - Originaux sauvés: ${CONFIG.backupDir}`);
  console.log(`   - Images optimisées: ${CONFIG.outputDir}`);
  console.log(`   - Code d'intégration: fichiers *-code.html`);
}

/**
 * Affiche les statistiques
 */
function showStats() {
  const dirs = [CONFIG.inputDir, CONFIG.outputDir, CONFIG.backupDir];
  
  console.log('\n📊 Statistiques:');
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const totalSize = files.reduce((size, file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isFile()) {
          return size + fs.statSync(filePath).size;
        }
        return size;
      }, 0);
      
      console.log(`   ${path.basename(dir)}: ${files.length} fichiers (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    }
  });
}

// Script principal
async function main() {
  console.log('🖼️  OPTIMISEUR D\'IMAGES - GLP-1 France\n');
  
  // Vérifications préalables
  if (!checkImageMagick()) {
    console.log('⚠️  ImageMagick non trouvé. Installation...');
    if (!installImageMagick()) {
      process.exit(1);
    }
  }
  
  // Création des dossiers
  createDirectories();
  
  // Traitement des images
  processAllImages();
  
  // Statistiques finales
  showStats();
  
  console.log('\n✨ Optimisation terminée ! Vous pouvez maintenant utiliser les images optimisées sur votre site.');
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { optimizeImage, CONFIG };
