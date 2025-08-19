#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, '..', 'src', 'content');
const publicImagesPath = path.join(__dirname, '..', 'public', 'images', 'thumbnails');

console.log('🎨 Début de génération des thumbnails...');
console.log('📁 Chemin du contenu:', contentPath);
console.log('📁 Chemin des images:', publicImagesPath);

// Créer le dossier d'images si nécessaire
if (!fs.existsSync(publicImagesPath)) {
  console.log('📁 Création du dossier thumbnails...');
  fs.mkdirSync(publicImagesPath, { recursive: true });
}

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n/s);
  if (!frontmatterMatch) {
    console.log('    ❌ Regex frontmatter ne match pas');
    // Affichons les 200 premiers caractères pour déboguer
    console.log('    Début du fichier:', content.substring(0, 200));
    return null;
  }
  
  const frontmatter = {};
  const lines = frontmatterMatch[1].split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Nettoyer les guillemets doubles et simples
      frontmatter[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  
  return frontmatter;
}

// Générer une thumbnail simple pour test
function generateSimpleThumbnail(title, outputPath) {
  const svg = `
<svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5" />
      <stop offset="100%" style="stop-color:#7c3aed" />
    </linearGradient>
  </defs>
  <rect width="400" height="200" fill="url(#bg)" />
  <text x="200" y="100" text-anchor="middle" dominant-baseline="middle" 
        fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
    <tspan x="200" dy="0">${title.substring(0, 30)}</tspan>
    ${title.length > 30 ? `<tspan x="200" dy="25">${title.substring(30, 60)}</tspan>` : ''}
  </text>
</svg>`.trim();

  fs.writeFileSync(outputPath, svg);
  console.log('✅ Thumbnail générée:', path.basename(outputPath));
}

try {
  console.log('\n📋 Traitement des collections...');
  
  const collections = fs.readdirSync(contentPath).filter(dir => 
    fs.statSync(path.join(contentPath, dir)).isDirectory()
  );
  
  console.log('Collections trouvées:', collections);
  
  let totalGenerated = 0;
  
  collections.forEach(collection => {
    console.log(`\n📂 Collection: ${collection}`);
    const collectionPath = path.join(contentPath, collection);
    
    const files = fs.readdirSync(collectionPath).filter(file => 
      file.endsWith('.md') || file.endsWith('.mdx')
    );
    
    console.log(`  Fichiers trouvés: ${files.length}`);
    
    files.forEach(file => {
      const filePath = path.join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      
      if (!frontmatter) {
        console.log(`  ⚠️ Pas de frontmatter: ${file}`);
        return;
      }
      
      if (frontmatter.image && frontmatter.image.includes('/thumbnails/')) {
        console.log(`  ⏭️ Déjà une thumbnail: ${file}`);
        return;
      }
      
      const title = frontmatter.title || 'Article sans titre';
      const slug = path.basename(file, path.extname(file));
      const outputPath = path.join(publicImagesPath, `${slug}.svg`);
      
      console.log(`  🎨 Génération pour: ${title}`);
      generateSimpleThumbnail(title, outputPath);
      totalGenerated++;
    });
  });
  
  console.log(`\n📊 Résumé: ${totalGenerated} thumbnails générées !`);
  console.log('✅ Terminé avec succès');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.error(error.stack);
  process.exit(1);
}
