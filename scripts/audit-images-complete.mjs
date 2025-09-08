#!/usr/bin/env node

/**
 * Script d'audit complet des images et thumbnails
 * Vérifie tous les liens d'images, thumbnails manquants, et images cassées
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const contentDir = join(__dirname, '..', 'src', 'content');
const publicDir = join(__dirname, '..', 'public');
const results = {
  missingThumbnails: [],
  brokenImageLinks: [],
  missingImageFiles: [],
  emptyImages: [],
  totalFiles: 0,
  totalImages: 0,
  errors: []
};

// Fonction pour extraire les métadonnées du frontmatter
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return null;
  
  const [, frontmatter, body] = match;
  const metadata = {};
  
  // Parser YAML amélioré
  const lines = frontmatter.split(/\r?\n/);
  let currentKey = null;
  let currentValue = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Ignorer les lignes vides et les commentaires
    if (!line || line.startsWith('#')) continue;
    
    // Détecter une nouvelle clé
    if (line.includes(':') && !line.startsWith(' ') && !line.startsWith('-')) {
      // Sauvegarder la clé précédente si elle existe
      if (currentKey && currentValue) {
        metadata[currentKey] = currentValue.trim().replace(/^["']|["']$/g, '');
      }
      
      const colonIndex = line.indexOf(':');
      currentKey = line.substring(0, colonIndex).trim();
      currentValue = line.substring(colonIndex + 1).trim();
    } else if (currentKey && line.startsWith(' ')) {
      // Continuer la valeur sur plusieurs lignes
      currentValue += ' ' + line.trim();
    }
  }
  
  // Sauvegarder la dernière clé
  if (currentKey && currentValue) {
    metadata[currentKey] = currentValue.trim().replace(/^["']|["']$/g, '');
  }
  
  return { metadata, body };
}

// Fonction pour extraire toutes les images du contenu
function extractImagesFromContent(content) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  const images = [];
  
  let match;
  
  // Images Markdown
  while ((match = imageRegex.exec(content)) !== null) {
    images.push({
      type: 'markdown',
      alt: match[1],
      src: match[2],
      full: match[0]
    });
  }
  
  // Images HTML
  while ((match = htmlImageRegex.exec(content)) !== null) {
    images.push({
      type: 'html',
      src: match[1],
      full: match[0]
    });
  }
  
  return images;
}

// Fonction pour vérifier si un fichier image existe
function checkImageExists(imagePath) {
  // Nettoyer le chemin
  let cleanPath = imagePath.replace(/^\/+/, '');
  
  // Chemins possibles à vérifier
  const possiblePaths = [
    join(publicDir, cleanPath),
    join(publicDir, 'images', cleanPath),
    join(publicDir, 'images', 'thumbnails', cleanPath)
  ];
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      // Vérifier la taille du fichier
      const stats = statSync(path);
      const isEmpty = stats.size === 0;
      const isTooSmall = stats.size < 100; // Moins de 100 bytes = probablement vide
      
      return { 
        exists: true, 
        path,
        size: stats.size,
        isEmpty: isEmpty,
        isTooSmall: isTooSmall
      };
    }
  }
  
  return { exists: false, path: cleanPath, size: 0, isEmpty: true };
}

// Fonction pour scanner récursivement les fichiers
function scanDirectory(dir, baseDir = '') {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const relativePath = join(baseDir, item);
    
    if (statSync(fullPath).isDirectory()) {
      scanDirectory(fullPath, relativePath);
    } else if (item.endsWith('.md')) {
      processMarkdownFile(fullPath, relativePath);
    }
  }
}

// Fonction pour traiter un fichier Markdown
function processMarkdownFile(filePath, relativePath) {
  try {
    results.totalFiles++;
    
    const content = readFileSync(filePath, 'utf-8');
    const parsed = extractFrontmatter(content);
    
    if (!parsed) {
      results.errors.push(`${relativePath}: Pas de frontmatter trouvé`);
      return;
    }
    
    const { metadata, body } = parsed;
    
    // Debug pour les premiers fichiers
    if (results.totalFiles <= 3) {
      console.log(`🔍 Debug ${relativePath}:`);
      console.log(`   └─ Thumbnail: "${metadata.thumbnail || 'MANQUANT'}"`);
      console.log(`   └─ Clés trouvées: ${Object.keys(metadata).join(', ')}`);
    }
    
    // Vérifier le thumbnail (ou image)
    const thumbnailField = metadata.thumbnail || metadata.image;
    if (!thumbnailField || thumbnailField === '' || thumbnailField === 'undefined') {
      results.missingThumbnails.push({
        file: relativePath,
        title: metadata.title || 'Sans titre',
        collection: metadata.collection || 'Non définie'
      });
    } else {
      // Vérifier que le thumbnail existe
      const thumbnailCheck = checkImageExists(thumbnailField);
      if (!thumbnailCheck.exists) {
        results.missingImageFiles.push({
          file: relativePath,
          image: thumbnailField,
          type: 'thumbnail',
          expectedPath: thumbnailCheck.path
        });
      } else if (thumbnailCheck.isEmpty || thumbnailCheck.isTooSmall) {
        results.emptyImages.push({
          file: relativePath,
          image: thumbnailField,
          type: 'thumbnail',
          size: thumbnailCheck.size,
          path: thumbnailCheck.path
        });
      }
    }
    
    // Extraire et vérifier toutes les images du contenu
    const images = extractImagesFromContent(body);
    results.totalImages += images.length;
    
    for (const image of images) {
      const imageCheck = checkImageExists(image.src);
      if (!imageCheck.exists) {
        results.brokenImageLinks.push({
          file: relativePath,
          image: image.src,
          type: image.type,
          context: image.full.substring(0, 100),
          expectedPath: imageCheck.path
        });
      } else if (imageCheck.isEmpty || imageCheck.isTooSmall) {
        results.emptyImages.push({
          file: relativePath,
          image: image.src,
          type: image.type,
          size: imageCheck.size,
          path: imageCheck.path,
          context: image.full.substring(0, 100)
        });
      }
    }
    
  } catch (error) {
    results.errors.push(`${relativePath}: ${error.message}`);
  }
}

// Fonction pour générer un thumbnail par défaut basé sur le contenu
function generateDefaultThumbnail(metadata) {
  const collection = metadata.collection || 'default';
  const category = metadata.category || 'article';
  
  // Mapping des collections vers des thumbnails par défaut
  const defaultThumbnails = {
    'traitements-glp1': '/images/thumbnails/traitement-glp1-default.svg',
    'regime-glp1': '/images/thumbnails/regime-glp1-default.svg',
    'effets-secondaires-glp1': '/images/thumbnails/effets-secondaires-default.svg',
    'glp1-cout': '/images/thumbnails/cout-glp1-default.svg',
    'temoignages': '/images/thumbnails/temoignage-default.svg',
    'alternatives-glp1': '/images/thumbnails/alternatives-default.svg',
    'medecins-glp1-france': '/images/thumbnails/medecin-default.svg',
    'recherche-glp1': '/images/thumbnails/recherche-default.svg',
    'pages-statiques': '/images/thumbnails/page-statique-default.svg'
  };
  
  return defaultThumbnails[collection] || '/images/thumbnails/article-default.svg';
}

// Fonction pour corriger automatiquement les thumbnails manquants
function fixMissingThumbnails() {
  console.log('\n🔧 CORRECTION AUTOMATIQUE DES THUMBNAILS');
  console.log('=========================================');
  
  let fixedCount = 0;
  
  for (const item of results.missingThumbnails) {
    try {
      const filePath = join(contentDir, item.file);
      const content = readFileSync(filePath, 'utf-8');
      const parsed = extractFrontmatter(content);
      
      if (parsed) {
        const defaultThumbnail = generateDefaultThumbnail(parsed.metadata);
        
        // Ajouter le thumbnail au frontmatter
        let newContent = content;
        if (parsed.metadata.thumbnail === undefined) {
          // Ajouter thumbnail après title si possible
          newContent = content.replace(
            /^(---\n[\s\S]*?title:\s*["'][^"']*["'][^\n]*\n)/,
            `$1thumbnail: "${defaultThumbnail}"\nthumbnailAlt: "Illustration pour l'article ${parsed.metadata.title || item.file}"\n`
          );
        } else {
          // Remplacer thumbnail vide
          newContent = content.replace(
            /thumbnail:\s*["']?["']?\s*\n/,
            `thumbnail: "${defaultThumbnail}"\n`
          );
        }
        
        if (newContent !== content) {
          writeFileSync(filePath, newContent, 'utf-8');
          console.log(`✅ ${item.file} - Thumbnail ajouté: ${defaultThumbnail}`);
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Erreur ${item.file}: ${error.message}`);
    }
  }
  
  return fixedCount;
}

// Fonction principale
async function auditImages() {
  console.log('🔍 AUDIT COMPLET DES IMAGES - GLP1 FRANCE');
  console.log('==========================================\n');
  
  console.log('📂 Scan des fichiers markdown...');
  scanDirectory(contentDir);
  
  console.log('\n📊 RÉSULTATS DE L\'AUDIT');
  console.log('========================');
  
  console.log(`\n📈 STATISTIQUES:`);
  console.log(`├─ 📄 Fichiers analysés: ${results.totalFiles}`);
  console.log(`├─ 🖼️  Images trouvées: ${results.totalImages}`);
  console.log(`├─ ❌ Erreurs: ${results.errors.length}`);
  console.log(`└─ 🔍 Scan terminé`);
  
  // Thumbnails manquants
  if (results.missingThumbnails.length > 0) {
    console.log(`\n🚨 THUMBNAILS MANQUANTS (${results.missingThumbnails.length}):`);
    for (const item of results.missingThumbnails.slice(0, 10)) {
      console.log(`├─ ${item.file}`);
      console.log(`│  └─ Collection: ${item.collection}`);
    }
    if (results.missingThumbnails.length > 10) {
      console.log(`└─ ... et ${results.missingThumbnails.length - 10} autres`);
    }
  }
  
  // Images manquantes
  if (results.missingImageFiles.length > 0) {
    console.log(`\n🖼️ IMAGES MANQUANTES (${results.missingImageFiles.length}):`);
    for (const item of results.missingImageFiles.slice(0, 10)) {
      console.log(`├─ ${item.file}`);
      console.log(`│  └─ Image: ${item.image} (${item.type})`);
    }
    if (results.missingImageFiles.length > 10) {
      console.log(`└─ ... et ${results.missingImageFiles.length - 10} autres`);
    }
  }
  
  // Images vides ou trop petites
  if (results.emptyImages.length > 0) {
    console.log(`\n🚫 IMAGES VIDES/CORROMPUES (${results.emptyImages.length}):`);
    for (const item of results.emptyImages.slice(0, 10)) {
      console.log(`├─ ${item.file}`);
      console.log(`│  └─ Image: ${item.image} (${item.size} bytes) - ${item.type}`);
    }
    if (results.emptyImages.length > 10) {
      console.log(`└─ ... et ${results.emptyImages.length - 10} autres`);
    }
  }
  
  // Liens cassés
  if (results.brokenImageLinks.length > 0) {
    console.log(`\n🔗 LIENS D'IMAGES CASSÉS (${results.brokenImageLinks.length}):`);
    for (const item of results.brokenImageLinks.slice(0, 10)) {
      console.log(`├─ ${item.file}`);
      console.log(`│  └─ ${item.image} (${item.type})`);
    }
    if (results.brokenImageLinks.length > 10) {
      console.log(`└─ ... et ${results.brokenImageLinks.length - 10} autres`);
    }
  }
  
  // Erreurs
  if (results.errors.length > 0) {
    console.log(`\n❌ ERREURS (${results.errors.length}):`);
    for (const error of results.errors.slice(0, 5)) {
      console.log(`├─ ${error}`);
    }
    if (results.errors.length > 5) {
      console.log(`└─ ... et ${results.errors.length - 5} autres`);
    }
  }
  
  // Proposition de correction automatique
  if (results.missingThumbnails.length > 0) {
    console.log(`\n🔧 CORRECTION AUTOMATIQUE DISPONIBLE`);
    console.log(`Voulez-vous corriger automatiquement les ${results.missingThumbnails.length} thumbnails manquants ?`);
    
    // Auto-correction pour cette démo
    const fixedCount = fixMissingThumbnails();
    
    console.log(`\n✅ CORRECTION TERMINÉE: ${fixedCount} thumbnails ajoutés`);
  }
  
  // Sauvegarder le rapport détaillé
  const reportPath = join(__dirname, '..', 'audit-images-report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
  
  console.log(`\n💾 Rapport détaillé sauvegardé: audit-images-report.json`);
  console.log(`\n🏆 SCORE IMAGES: ${Math.round((1 - (results.missingThumbnails.length + results.missingImageFiles.length + results.brokenImageLinks.length + results.emptyImages.length) / Math.max(results.totalFiles, 1)) * 100)}/100`);
  
  return results;
}

// Exécution
auditImages().catch(console.error);
