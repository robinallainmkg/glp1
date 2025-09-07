#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🖼️ Analyse des images du site GLP-1 France...');

const siteRoot = path.join(__dirname, '..');
const publicImagesPath = path.join(siteRoot, 'public', 'images');
const srcPath = path.join(siteRoot, 'src');

// Fonction pour extraire tous les liens d'images d'un fichier
function extractImageLinksFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Regex pour trouver tous les liens d'images
    const imageRegex = /(?:src|image|thumbnail|thumbnailImage)=['"](\/images\/[^'"]*)['"]/gi;
    const markdownImageRegex = /!\[[^\]]*\]\((\/images\/[^)]*)\)/gi;
    const backgroundImageRegex = /background-image:\s*url\(['"]?(\/images\/[^'")?]*)/gi;
    
    const images = [];
    let match;
    
    // Images HTML
    while ((match = imageRegex.exec(content)) !== null) {
      images.push(match[1]);
    }
    
    // Images Markdown
    while ((match = markdownImageRegex.exec(content)) !== null) {
      images.push(match[1]);
    }
    
    // Images CSS background
    while ((match = backgroundImageRegex.exec(content)) !== null) {
      images.push(match[1]);
    }
    
    return images;
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture de ${filePath}:`, error.message);
    return [];
  }
}

// Fonction pour récupérer tous les fichiers d'un type donné
function getAllFiles(dir, extensions) {
  const files = [];
  
  function scanDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('node_modules')) {
            scanDir(fullPath);
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        } catch (statError) {
          console.error(`⚠️ Erreur stat pour ${fullPath}:`, statError.message);
        }
      }
    } catch (dirError) {
      console.error(`⚠️ Erreur lecture dossier ${currentDir}:`, dirError.message);
    }
  }
  
  scanDir(dir);
  return files;
}

// Fonction pour vérifier si une image existe et n'est pas vide
function checkImageFile(imagePath) {
  const fullPath = path.join(siteRoot, 'public', imagePath);
  
  if (!fs.existsSync(fullPath)) {
    return { exists: false, isEmpty: false, size: 0 };
  }
  
  try {
    const stats = fs.statSync(fullPath);
    const isEmpty = stats.size === 0;
    
    return { 
      exists: true, 
      isEmpty: isEmpty, 
      size: stats.size,
      fullPath: fullPath
    };
  } catch (error) {
    return { exists: false, isEmpty: false, size: 0, error: error.message };
  }
}

// Fonction pour lister toutes les images physiques
function getAllPhysicalImages(imagesDir) {
  const images = [];
  
  function scanImages(currentDir, relativePath = '') {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const itemRelativePath = path.join(relativePath, item).replace(/\\\\/g, '/');
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanImages(fullPath, itemRelativePath);
          } else if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(item)) {
            const webPath = '/images/' + itemRelativePath;
            images.push({
              physicalPath: fullPath,
              webPath: webPath,
              size: stat.size,
              isEmpty: stat.size === 0
            });
          }
        } catch (statError) {
          console.error(`⚠️ Erreur stat image ${fullPath}:`, statError.message);
        }
      }
    } catch (dirError) {
      console.error(`⚠️ Erreur lecture images ${currentDir}:`, dirError.message);
    }
  }
  
  if (fs.existsSync(imagesDir)) {
    scanImages(imagesDir);
  }
  
  return images;
}

// Fonction principale
function analyzeImages() {
  console.log('📁 Scan des fichiers source...');
  
  // Récupérer tous les fichiers source
  const sourceFiles = getAllFiles(srcPath, ['.astro', '.md', '.ts', '.js', '.css']);
  console.log(`✅ ${sourceFiles.length} fichiers source trouvés.`);
  
  // Extraire toutes les références d'images
  const allImageReferences = new Set();
  const imageSourceMap = new Map(); // Pour traquer d'où viennent les références
  
  console.log('🔍 Extraction des références d\'images...');
  for (const file of sourceFiles) {
    const images = extractImageLinksFromFile(file);
    const relativePath = path.relative(siteRoot, file);
    
    for (const image of images) {
      allImageReferences.add(image);
      
      if (!imageSourceMap.has(image)) {
        imageSourceMap.set(image, []);
      }
      imageSourceMap.get(image).push(relativePath);
    }
  }
  
  console.log(`🔗 ${allImageReferences.size} références d'images uniques trouvées.`);
  
  // Récupérer toutes les images physiques
  console.log('📂 Scan des images physiques...');
  const physicalImages = getAllPhysicalImages(publicImagesPath);
  console.log(`📸 ${physicalImages.length} images physiques trouvées.`);
  
  // Analyser les problèmes
  const missingImages = [];
  const emptyImages = [];
  const unusedImages = [];
  const validImages = [];
  
  // Vérifier les références
  console.log('🔍 Vérification des références...');
  for (const imageRef of allImageReferences) {
    const check = checkImageFile(imageRef);
    
    if (!check.exists) {
      missingImages.push({
        path: imageRef,
        sources: imageSourceMap.get(imageRef),
        error: check.error
      });
    } else if (check.isEmpty) {
      emptyImages.push({
        path: imageRef,
        sources: imageSourceMap.get(imageRef),
        size: check.size
      });
    } else {
      validImages.push({
        path: imageRef,
        sources: imageSourceMap.get(imageRef),
        size: check.size
      });
    }
  }
  
  // Trouver les images inutilisées
  const referencedPaths = Array.from(allImageReferences);
  for (const physicalImage of physicalImages) {
    if (!referencedPaths.includes(physicalImage.webPath)) {
      unusedImages.push(physicalImage);
    }
  }
  
  // Afficher les résultats
  console.log('\\n' + '='.repeat(80));
  console.log('📊 RAPPORT D\'ANALYSE DES IMAGES');
  console.log('='.repeat(80));
  console.log(`📸 Images physiques totales: ${physicalImages.length}`);
  console.log(`🔗 Références d'images totales: ${allImageReferences.size}`);
  console.log(`✅ Images valides: ${validImages.length}`);
  console.log(`❌ Images manquantes (404): ${missingImages.length}`);
  console.log(`⚠️ Images vides (0 bytes): ${emptyImages.length}`);
  console.log(`🗑️ Images inutilisées: ${unusedImages.length}`);
  
  // Détail des problèmes
  if (missingImages.length > 0) {
    console.log('\\n🔴 IMAGES MANQUANTES (404):');
    console.log('-'.repeat(50));
    for (const missing of missingImages) {
      console.log(`\\n❌ ${missing.path}`);
      console.log(`📄 Trouvé dans:`);
      for (const source of missing.sources.slice(0, 3)) {
        console.log(`   - ${source}`);
      }
      if (missing.sources.length > 3) {
        console.log(`   ... et ${missing.sources.length - 3} autres fichiers`);
      }
      if (missing.error) {
        console.log(`💥 Erreur: ${missing.error}`);
      }
    }
  }
  
  if (emptyImages.length > 0) {
    console.log('\\n⚠️ IMAGES VIDES (0 BYTES):');
    console.log('-'.repeat(50));
    for (const empty of emptyImages) {
      console.log(`\\n🗂️ ${empty.path}`);
      console.log(`📄 Trouvé dans:`);
      for (const source of empty.sources.slice(0, 3)) {
        console.log(`   - ${source}`);
      }
      if (empty.sources.length > 3) {
        console.log(`   ... et ${empty.sources.length - 3} autres fichiers`);
      }
    }
  }
  
  if (unusedImages.length > 0) {
    console.log('\\n🗑️ IMAGES INUTILISÉES:');
    console.log('-'.repeat(50));
    for (const unused of unusedImages.slice(0, 20)) { // Limiter à 20 pour éviter le spam
      const sizeMB = (unused.size / 1024 / 1024).toFixed(2);
      console.log(`📁 ${unused.webPath} (${sizeMB} MB)`);
    }
    if (unusedImages.length > 20) {
      console.log(`   ... et ${unusedImages.length - 20} autres images`);
    }
  }
  
  // Sauvegarder le rapport détaillé
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPhysicalImages: physicalImages.length,
      totalReferences: allImageReferences.size,
      validImages: validImages.length,
      missingImages: missingImages.length,
      emptyImages: emptyImages.length,
      unusedImages: unusedImages.length
    },
    missingImages: missingImages,
    emptyImages: emptyImages,
    unusedImages: unusedImages,
    validImages: validImages
  };
  
  const reportPath = path.join(siteRoot, 'images-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\\n📋 Rapport détaillé sauvegardé dans: ${reportPath}`);
  
  // Score de santé
  const totalProblems = missingImages.length + emptyImages.length;
  const healthScore = Math.max(0, Math.round((1 - totalProblems / allImageReferences.size) * 100));
  console.log(`\\n💯 Score de santé des images: ${healthScore}%`);
}

// Exécuter l'analyse
analyzeImages();
