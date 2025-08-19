#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, '..', 'src', 'content');
const publicImagesPath = path.join(__dirname, '..', 'public', 'images', 'thumbnails');

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n/s);
  if (!frontmatterMatch) return { frontmatter: null, content };
  
  const frontmatterText = frontmatterMatch[1];
  const remainingContent = content.slice(frontmatterMatch[0].length);
  
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      frontmatter[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  
  return { frontmatter, content: remainingContent, originalFrontmatter: frontmatterText };
}

// Fonction pour mettre à jour le frontmatter
function updateFrontmatter(filePath, newImagePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, content: bodyContent, originalFrontmatter } = extractFrontmatter(content);
    
    if (!frontmatter) return false;
    
    // Mettre à jour seulement le champ image, garder tous les autres champs
    frontmatter.image = newImagePath;
    
    // Reconstruire le frontmatter en préservant l'ordre et le format original
    const lines = originalFrontmatter.split('\n');
    let updatedLines = [];
    let imageFieldUpdated = false;
    
    for (const line of lines) {
      if (line.match(/^image:/)) {
        updatedLines.push(`image: "${newImagePath}"`);
        imageFieldUpdated = true;
      } else {
        updatedLines.push(line);
      }
    }
    
    // Si pas de champ image existant, l'ajouter à la fin
    if (!imageFieldUpdated) {
      updatedLines.push(`image: "${newImagePath}"`);
    }
    
    const updatedFrontmatter = updatedLines.join('\n');
    const newContent = `---\n${updatedFrontmatter}\n---\n${bodyContent}`;
    
    fs.writeFileSync(filePath, newContent);
    return true;
  } catch (error) {
    console.error(`❌ Erreur mise à jour ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour switch entre SVG et AI
function switchImageType(articleSlug, useAI = true) {
  console.log(`🔄 Switch ${articleSlug} vers ${useAI ? 'AI (JPG)' : 'SVG'}...`);
  
  const aiImagePath = path.join(publicImagesPath, `${articleSlug}-illus.jpg`);
  const svgImagePath = path.join(publicImagesPath, `${articleSlug}.svg`);
  
  // Vérifier que les images existent
  const targetImagePath = useAI ? aiImagePath : svgImagePath;
  if (!fs.existsSync(targetImagePath)) {
    console.log(`❌ Image introuvable: ${path.basename(targetImagePath)}`);
    return false;
  }
  
  // Trouver le fichier markdown correspondant
  const collections = fs.readdirSync(contentPath).filter(dir => 
    fs.statSync(path.join(contentPath, dir)).isDirectory()
  );
  
  let articleFound = false;
  
  for (const collection of collections) {
    const collectionPath = path.join(contentPath, collection);
    const articlePath = path.join(collectionPath, `${articleSlug}.md`);
    
    if (fs.existsSync(articlePath)) {
      const newImageUrl = useAI 
        ? `/images/thumbnails/${articleSlug}-illus.jpg`
        : `/images/thumbnails/${articleSlug}.svg`;
      
      const success = updateFrontmatter(articlePath, newImageUrl);
      if (success) {
        console.log(`✅ Article mis à jour: ${collection}/${articleSlug}.md`);
        console.log(`📸 Nouvelle image: ${newImageUrl}`);
        articleFound = true;
      }
      break;
    }
  }
  
  if (!articleFound) {
    console.log(`❌ Article non trouvé: ${articleSlug}.md`);
  }
  
  return articleFound;
}

// Fonction pour lister les options disponibles
function listAvailableImages() {
  console.log('📋 Images disponibles:\n');
  
  const files = fs.readdirSync(publicImagesPath);
  const aiImages = files.filter(f => f.endsWith('-illus.jpg'));
  const svgImages = files.filter(f => f.endsWith('.svg') && !f.includes('-illus'));
  
  // Grouper par slug
  const slugs = new Set();
  aiImages.forEach(img => slugs.add(img.replace('-illus.jpg', '')));
  svgImages.forEach(img => slugs.add(img.replace('.svg', '')));
  
  Array.from(slugs).sort().forEach(slug => {
    const hasAI = aiImages.includes(`${slug}-illus.jpg`);
    const hasSVG = svgImages.includes(`${slug}.svg`);
    
    console.log(`📄 ${slug}`);
    console.log(`   ${hasAI ? '✅' : '❌'} AI (JPG): ${slug}-illus.jpg`);
    console.log(`   ${hasSVG ? '✅' : '❌'} SVG: ${slug}.svg`);
    console.log('');
  });
}

// Interface en ligne de commande
const args = process.argv.slice(2);
const command = args[0];
const articleSlug = args[1];
const imageType = args[2];

if (command === 'list') {
  listAvailableImages();
} else if (command === 'switch' && articleSlug) {
  const useAI = imageType === 'ai' || imageType === 'jpg';
  switchImageType(articleSlug, useAI);
} else {
  console.log(`
🖼️  Gestionnaire d'images pour les articles

Usage:
  node scripts/image-switcher.mjs list                    # Lister toutes les images
  node scripts/image-switcher.mjs switch <slug> ai       # Utiliser l'image AI
  node scripts/image-switcher.mjs switch <slug> svg      # Utiliser l'image SVG

Exemples:
  node scripts/image-switcher.mjs switch ozempic-danger ai
  node scripts/image-switcher.mjs switch acupuncture-glp1 svg
  `);
}
