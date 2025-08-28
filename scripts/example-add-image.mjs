#!/usr/bin/env node

/**
 * Exemple pratique : Ajouter une image à un article spécifique
 */

import fs from 'fs/promises';

async function addImageExample() {
  console.log('📋 EXEMPLE : AJOUT D\'IMAGE À UN ARTICLE\n');
  
  // Exemple : Ajouter une image à "Diabète Complications GLP-1"
  const articlePath = 'src/content/glp1-diabete/diabete-complications-glp1.md';
  
  try {
    // 1. Lire l'article
    const content = await fs.readFile(articlePath, 'utf-8');
    const [, frontmatter, body] = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    console.log('📖 Article trouvé:', articlePath);
    
    // 2. Modifier le frontmatter
    let newFrontmatter = frontmatter;
    
    // Ajouter/remplacer thumbnail
    if (newFrontmatter.includes('thumbnail:')) {
      newFrontmatter = newFrontmatter.replace(
        /thumbnail:.*/,
        'thumbnail: "/images/thumbnails/diabete-complications-glp1.jpg"'
      );
    } else {
      newFrontmatter += '\nthumbnail: "/images/thumbnails/diabete-complications-glp1.jpg"';
    }
    
    // Ajouter/remplacer thumbnailAlt
    if (newFrontmatter.includes('thumbnailAlt:')) {
      newFrontmatter = newFrontmatter.replace(
        /thumbnailAlt:.*/,
        'thumbnailAlt: "Illustration médicale des complications du diabète avec traitement GLP-1"'
      );
    } else {
      newFrontmatter += '\nthumbnailAlt: "Illustration médicale des complications du diabète avec traitement GLP-1"';
    }
    
    // 3. Sauvegarder
    const newContent = `---\n${newFrontmatter}\n---\n${body}`;
    await fs.writeFile(articlePath, newContent, 'utf-8');
    
    console.log('✅ Article mis à jour avec succès !');
    console.log('🖼️  Image: /images/thumbnails/diabete-complications-glp1.jpg');
    console.log('📝 Alt: Illustration médicale des complications du diabète avec traitement GLP-1');
    
    // 4. Vérifier si l'image existe
    try {
      await fs.access('public/images/thumbnails/diabete-complications-glp1.jpg');
      console.log('✅ Image trouvée dans le dossier public/images/thumbnails/');
    } catch {
      console.log('⚠️  Image pas encore présente - ajoutez diabete-complications-glp1.jpg dans public/images/thumbnails/');
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

addImageExample();
