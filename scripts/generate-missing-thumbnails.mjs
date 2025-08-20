#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contentDir = join(__dirname, '..', 'src', 'content');
const thumbnailsDir = join(__dirname, '..', 'public', 'images', 'thumbnails');

console.log('🖼️ Génération des images manquantes...\n');

let missingImages = new Set();
let totalFiles = 0;

function processDirectory(dirPath) {
  const items = readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = join(dirPath, item);
    const stat = statSync(itemPath);
    
    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (item.endsWith('.md')) {
      processMarkdownFile(itemPath);
    }
  });
}

function processMarkdownFile(filePath) {
  totalFiles++;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(content);
    
    // Vérifier si l'image thumbnail existe
    if (frontmatter.thumbnail) {
      const imagePath = frontmatter.thumbnail.replace('/images/thumbnails/', '');
      const fullImagePath = join(thumbnailsDir, imagePath);
      
      if (!existsSync(fullImagePath)) {
        missingImages.add(imagePath);
      }
    }
    
    // Vérifier aussi l'image par défaut basée sur le slug
    const defaultImageName = `${frontmatter.slug}-illus.jpg`;
    const defaultImagePath = join(thumbnailsDir, defaultImageName);
    
    if (!existsSync(defaultImagePath)) {
      missingImages.add(defaultImageName);
    }
    
  } catch (error) {
    console.error(`Erreur avec ${filePath}:`, error.message);
  }
}

function createSVGPlaceholder(imageName) {
  const title = imageName.replace('-illus.jpg', '').replace(/-/g, ' ');
  const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <circle cx="200" cy="100" r="30" fill="white" opacity="0.3"/>
  <text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
    ${title.substring(0, 30)}
  </text>
  <text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.8">
    GLP-1 Article
  </text>
</svg>`;
  
  const svgPath = join(thumbnailsDir, imageName.replace('.jpg', '.svg'));
  writeFileSync(svgPath, svgContent, 'utf-8');
  console.log(`✅ SVG créé: ${imageName.replace('.jpg', '.svg')}`);
}

// Process all content directories
processDirectory(contentDir);

console.log(`\n📊 ${missingImages.size} images manquantes détectées sur ${totalFiles} articles`);

// Créer les images manquantes
let createdCount = 0;
missingImages.forEach(imageName => {
  if (imageName.endsWith('.jpg')) {
    createSVGPlaceholder(imageName);
    createdCount++;
  }
});

console.log(`\n🎉 ${createdCount} images SVG de remplacement créées!`);
console.log('💡 Les images SVG seront utilisées en fallback si les JPG n\'existent pas.');
