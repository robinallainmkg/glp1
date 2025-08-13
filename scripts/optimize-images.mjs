#!/usr/bin/env node

/**
 * Script d'optimisation d'images pour GLP-1 France
 * Compresse automatiquement les images PNG/JPG et génère des versions WebP
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CONFIG = {
  // Dossiers
  INPUT_DIR: 'public/images/uploads',
  OUTPUT_DIR: 'public/images/optimized',
  BACKUP_DIR: 'public/images/originals',
  
  // Qualité de compression
  JPEG_QUALITY: 85,
  WEBP_QUALITY: 80,
  PNG_COMPRESSION: 6,
  
  // Tailles max
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 800,
  
  // Extensions supportées
  SUPPORTED_FORMATS: ['.png', '.jpg', '.jpeg'],
  
  // Préfixes pour différents usages
  PREFIXES: {
    article: 'art-',
    product: 'prod-',
    hero: 'hero-',
    thumbnail: 'thumb-'
  }
};

class ImageOptimizer {
  constructor() {
    this.ensureDirectories();
    this.checkDependencies();
  }

  ensureDirectories() {
    const dirs = [CONFIG.INPUT_DIR, CONFIG.OUTPUT_DIR, CONFIG.BACKUP_DIR];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Créé le dossier: ${dir}`);
      }
    });
  }

  checkDependencies() {
    const requiredCommands = ['convert', 'cwebp'];
    const missing = [];

    requiredCommands.forEach(cmd => {
      try {
        execSync(`which ${cmd}`, { stdio: 'ignore' });
      } catch {
        missing.push(cmd);
      }
    });

    if (missing.length > 0) {
      console.log('⚠️  Dépendances manquantes. Installation automatique...');
      this.installDependencies(missing);
    }
  }

  installDependencies(missing) {
    try {
      if (missing.includes('convert')) {
        console.log('📦 Installation d\'ImageMagick...');
        execSync('brew install imagemagick', { stdio: 'inherit' });
      }
      
      if (missing.includes('cwebp')) {
        console.log('📦 Installation de WebP tools...');
        execSync('brew install webp', { stdio: 'inherit' });
      }
      
      console.log('✅ Dépendances installées avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'installation des dépendances:');
      console.error('Installez manuellement: brew install imagemagick webp');
      process.exit(1);
    }
  }

  async optimizeImage(inputPath, options = {}) {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const ext = path.extname(inputPath).toLowerCase();
    
    if (!CONFIG.SUPPORTED_FORMATS.includes(ext)) {
      console.log(`⚠️  Format non supporté: ${inputPath}`);
      return null;
    }

    // Backup de l'original
    const backupPath = path.join(CONFIG.BACKUP_DIR, path.basename(inputPath));
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
      console.log(`💾 Backup créé: ${backupPath}`);
    }

    const results = {
      original: inputPath,
      optimized: [],
      sizes: {}
    };

    try {
      // Image optimisée standard
      const optimizedPath = path.join(CONFIG.OUTPUT_DIR, `${filename}-optimized${ext}`);
      await this.compressImage(inputPath, optimizedPath, ext);
      results.optimized.push(optimizedPath);

      // Version WebP
      const webpPath = path.join(CONFIG.OUTPUT_DIR, `${filename}.webp`);
      await this.convertToWebP(inputPath, webpPath);
      results.optimized.push(webpPath);

      // Versions responsives si demandé
      if (options.responsive) {
        const sizes = [400, 800, 1200];
        for (const size of sizes) {
          const responsivePath = path.join(CONFIG.OUTPUT_DIR, `${filename}-${size}w${ext}`);
          await this.resizeImage(inputPath, responsivePath, size, ext);
          results.optimized.push(responsivePath);
          
          // Version WebP responsive
          const webpResponsivePath = path.join(CONFIG.OUTPUT_DIR, `${filename}-${size}w.webp`);
          await this.resizeAndConvertToWebP(inputPath, webpResponsivePath, size);
          results.optimized.push(webpResponsivePath);
        }
      }

      // Calculer les tailles
      results.sizes.original = this.getFileSize(inputPath);
      results.optimized.forEach(file => {
        results.sizes[path.basename(file)] = this.getFileSize(file);
      });

      return results;

    } catch (error) {
      console.error(`❌ Erreur lors de l'optimisation de ${inputPath}:`, error.message);
      return null;
    }
  }

  async compressImage(inputPath, outputPath, ext) {
    let command;
    
    if (ext === '.png') {
      command = `convert "${inputPath}" -quality ${CONFIG.PNG_COMPRESSION * 10} -resize ${CONFIG.MAX_WIDTH}x${CONFIG.MAX_HEIGHT}> "${outputPath}"`;
    } else {
      command = `convert "${inputPath}" -quality ${CONFIG.JPEG_QUALITY} -resize ${CONFIG.MAX_WIDTH}x${CONFIG.MAX_HEIGHT}> "${outputPath}"`;
    }

    execSync(command);
    console.log(`✅ Compressé: ${path.basename(outputPath)}`);
  }

  async convertToWebP(inputPath, outputPath) {
    const command = `cwebp -q ${CONFIG.WEBP_QUALITY} "${inputPath}" -o "${outputPath}"`;
    execSync(command);
    console.log(`✅ WebP créé: ${path.basename(outputPath)}`);
  }

  async resizeImage(inputPath, outputPath, width, ext) {
    let command = `convert "${inputPath}" -resize ${width}x -quality ${ext === '.png' ? CONFIG.PNG_COMPRESSION * 10 : CONFIG.JPEG_QUALITY} "${outputPath}"`;
    execSync(command);
    console.log(`✅ Redimensionné (${width}px): ${path.basename(outputPath)}`);
  }

  async resizeAndConvertToWebP(inputPath, outputPath, width) {
    const tempPath = `/tmp/temp-resize-${Date.now()}.png`;
    execSync(`convert "${inputPath}" -resize ${width}x "${tempPath}"`);
    execSync(`cwebp -q ${CONFIG.WEBP_QUALITY} "${tempPath}" -o "${outputPath}"`);
    fs.unlinkSync(tempPath);
    console.log(`✅ WebP redimensionné (${width}px): ${path.basename(outputPath)}`);
  }

  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024); // KB
  }

  async processAllImages(options = {}) {
    if (!fs.existsSync(CONFIG.INPUT_DIR)) {
      console.log(`📁 Créez le dossier ${CONFIG.INPUT_DIR} et placez-y vos images`);
      return;
    }

    const files = fs.readdirSync(CONFIG.INPUT_DIR);
    const imageFiles = files.filter(file => 
      CONFIG.SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())
    );

    if (imageFiles.length === 0) {
      console.log(`📁 Aucune image trouvée dans ${CONFIG.INPUT_DIR}`);
      return;
    }

    console.log(`🚀 Traitement de ${imageFiles.length} image(s)...\n`);

    const results = [];
    for (const file of imageFiles) {
      const inputPath = path.join(CONFIG.INPUT_DIR, file);
      console.log(`\n📸 Traitement: ${file}`);
      
      const result = await this.optimizeImage(inputPath, options);
      if (result) {
        results.push(result);
        this.showCompressionStats(result);
      }
    }

    this.showSummary(results);
    this.generateUsageExamples(results);
  }

  showCompressionStats(result) {
    const originalSize = result.sizes.original;
    const optimizedFiles = Object.entries(result.sizes).filter(([key]) => key !== 'original');
    
    optimizedFiles.forEach(([filename, size]) => {
      const compression = Math.round((1 - size / originalSize) * 100);
      console.log(`   ${filename}: ${size} KB (${compression}% de compression)`);
    });
  }

  showSummary(results) {
    const totalOriginal = results.reduce((sum, r) => sum + r.sizes.original, 0);
    const totalOptimized = results.reduce((sum, r) => {
      const optimizedSizes = Object.entries(r.sizes)
        .filter(([key]) => key !== 'original')
        .reduce((s, [, size]) => s + size, 0);
      return sum + optimizedSizes;
    }, 0);

    const totalCompression = Math.round((1 - totalOptimized / totalOriginal) * 100);

    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`   Taille originale: ${totalOriginal} KB`);
    console.log(`   Taille optimisée: ${totalOptimized} KB`);
    console.log(`   Compression totale: ${totalCompression}%`);
    console.log(`   Images créées: ${results.length * 2} (optimisée + WebP)`);
  }

  generateUsageExamples(results) {
    console.log(`\n💡 EXEMPLES D'UTILISATION DANS VOS ARTICLES:`);
    
    results.forEach(result => {
      const filename = path.basename(result.original, path.extname(result.original));
      console.log(`\n📝 Pour ${filename}:`);
      console.log(`   HTML: <img src="/images/optimized/${filename}-optimized.jpg" alt="Description" loading="lazy">`);
      console.log(`   Markdown: ![Description](/images/optimized/${filename}-optimized.jpg)`);
      console.log(`   WebP moderne: <picture>
                     <source srcset="/images/optimized/${filename}.webp" type="image/webp">
                     <img src="/images/optimized/${filename}-optimized.jpg" alt="Description">
                   </picture>`);
    });

    console.log(`\n📋 GUIDE D'UTILISATION:`);
    console.log(`   1. Placez vos images dans: public/images/uploads/`);
    console.log(`   2. Lancez: npm run optimize-images`);
    console.log(`   3. Utilisez les images optimisées depuis: /images/optimized/`);
    console.log(`   4. Les originaux sont sauvés dans: public/images/originals/`);
  }
}

// CLI Interface
const args = process.argv.slice(2);
const optimizer = new ImageOptimizer();

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🖼️  OPTIMISEUR D'IMAGES GLP-1 FRANCE

UTILISATION:
  npm run optimize-images              # Optimise toutes les images
  npm run optimize-images --responsive # Avec versions responsives
  npm run optimize-images --help       # Affiche cette aide

WORKFLOW:
  1. Placez vos images PNG/JPG dans: public/images/uploads/
  2. Lancez la commande d'optimisation
  3. Récupérez les images optimisées dans: public/images/optimized/
  4. Utilisez-les dans vos articles avec /images/optimized/nom-fichier

FORMATS GÉNÉRÉS:
  - Image optimisée (même format, compressée)
  - Version WebP (format moderne)
  - Versions responsives (optionnel): 400px, 800px, 1200px

EXEMPLE:
  Input:  public/images/uploads/mon-image.png (500 KB)
  Output: public/images/optimized/mon-image-optimized.png (150 KB)
          public/images/optimized/mon-image.webp (120 KB)
  `);
  process.exit(0);
}

const options = {
  responsive: args.includes('--responsive')
};

optimizer.processAllImages(options);
