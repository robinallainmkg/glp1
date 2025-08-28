#!/usr/bin/env node

/**
 * Éditeur d'articles simplifié
 * Alternative à TinaCMS qui marche toujours
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

const collections = {
  '1': { name: 'medicaments-glp1', label: '💊 Médicaments GLP1' },
  '2': { name: 'glp1-perte-de-poids', label: '⚖️ Perte de Poids' },
  '3': { name: label: '🩺 Diabète' },
  '4': { name: 'regime-glp1', label: '🥗 Régimes' },
  '5': { name: 'glp1-cout', label: '💰 Coûts' },
  '6': { name: 'medecins-glp1-france', label: '👨‍⚕️ Médecins' },
  '7': { name: 'recherche-glp1', label: '🔬 Recherche' }
};

async function listArticles(collectionName) {
  const dirPath = `src/content/${collectionName}`;
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(f => f.endsWith('.md')).map((f, i) => ({
      index: i + 1,
      filename: f,
      title: f.replace('.md', '').replace(/-/g, ' ')
    }));
  } catch (error) {
    return [];
  }
}

async function readArticle(collectionName, filename) {
  const filePath = `src/content/${collectionName}/${filename}`;
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const [, frontmatter, body] = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    return { frontmatter, body, filePath };
  } catch (error) {
    console.log(`❌ Erreur lecture: ${error.message}`);
    return null;
  }
}

async function writeArticle(filePath, frontmatter, body) {
  const content = `---\n${frontmatter}\n---\n${body}`;
  await fs.writeFile(filePath, content, 'utf-8');
}

async function addImageToArticle() {
  console.log('🖼️  AJOUT D\'IMAGE À UN ARTICLE\n');
  
  // 1. Choisir la collection
  console.log('📁 Choisissez une collection:');
  Object.entries(collections).forEach(([key, col]) => {
    console.log(`${key}. ${col.label}`);
  });
  
  const collectionChoice = await question('\nCollection (1-7): ');
  const collection = collections[collectionChoice];
  
  if (!collection) {
    console.log('❌ Collection invalide');
    return;
  }
  
  // 2. Lister les articles
  console.log(`\n📄 Articles dans ${collection.label}:`);
  const articles = await listArticles(collection.name);
  
  if (articles.length === 0) {
    console.log('❌ Aucun article trouvé');
    return;
  }
  
  articles.forEach(article => {
    console.log(`${article.index}. ${article.title}`);
  });
  
  const articleChoice = await question('\nArticle (numéro): ');
  const selectedArticle = articles[parseInt(articleChoice) - 1];
  
  if (!selectedArticle) {
    console.log('❌ Article invalide');
    return;
  }
  
  // 3. Lire l'article
  const articleData = await readArticle(collection.name, selectedArticle.filename);
  if (!articleData) return;
  
  console.log(`\n📖 Article sélectionné: ${selectedArticle.title}`);
  
  // 4. Demander le nom de l'image
  const imageName = await question('\n🖼️  Nom de l\'image (ex: diabete-complications.jpg): ');
  const imageAlt = await question('📝 Description de l\'image: ');
  
  // 5. Modifier le frontmatter
  let frontmatter = articleData.frontmatter;
  
  // Remplacer ou ajouter thumbnail
  if (frontmatter.includes('thumbnail:')) {
    frontmatter = frontmatter.replace(/thumbnail:.*/, `thumbnail: "/images/thumbnails/${imageName}"`);
  } else {
    frontmatter += `\nthumbnail: "/images/thumbnails/${imageName}"`;
  }
  
  // Remplacer ou ajouter thumbnailAlt
  if (frontmatter.includes('thumbnailAlt:')) {
    frontmatter = frontmatter.replace(/thumbnailAlt:.*/, `thumbnailAlt: "${imageAlt}"`);
  } else {
    frontmatter += `\nthumbnailAlt: "${imageAlt}"`;
  }
  
  // 6. Sauvegarder
  try {
    await writeArticle(articleData.filePath, frontmatter, articleData.body);
    console.log('\n✅ Article mis à jour avec succès !');
    console.log(`📁 Fichier: ${articleData.filePath}`);
    console.log(`🖼️  Image: /images/thumbnails/${imageName}`);
    console.log(`📝 Alt: ${imageAlt}`);
    
    // Vérifier si l'image existe
    try {
      await fs.access(`public/images/thumbnails/${imageName}`);
      console.log('✅ Image trouvée dans le dossier');
    } catch {
      console.log('⚠️  Image non trouvée - pensez à la placer dans public/images/thumbnails/');
    }
    
  } catch (error) {
    console.log(`❌ Erreur sauvegarde: ${error.message}`);
  }
}

async function updateMultipleImages() {
  console.log('🔄 MISE À JOUR EN LOT\n');
  
  const imagesToUpdate = await question('Images à ajouter (format: collection/article.md=image.jpg, séparées par des virgules): ');
  const updates = imagesToUpdate.split(',').map(u => u.trim());
  
  for (const update of updates) {
    const [articlePath, imageName] = update.split('=');
    const [collectionName, filename] = articlePath.split('/');
    
    console.log(`\n🔄 Traitement: ${filename} → ${imageName}`);
    
    const articleData = await readArticle(collectionName, filename);
    if (!articleData) continue;
    
    let frontmatter = articleData.frontmatter;
    
    if (frontmatter.includes('thumbnail:')) {
      frontmatter = frontmatter.replace(/thumbnail:.*/, `thumbnail: "/images/thumbnails/${imageName}"`);
    } else {
      frontmatter += `\nthumbnail: "/images/thumbnails/${imageName}"`;
    }
    
    try {
      await writeArticle(articleData.filePath, frontmatter, articleData.body);
      console.log(`✅ ${filename} mis à jour`);
    } catch (error) {
      console.log(`❌ Erreur ${filename}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🎯 ÉDITEUR D\'ARTICLES - ALTERNATIVE TINACMS\n');
  console.log('Que voulez-vous faire ?');
  console.log('1. Ajouter une image à un article');
  console.log('2. Mise à jour en lot');
  console.log('3. Quitter');
  
  const choice = await question('\nChoix (1-3): ');
  
  switch (choice) {
    case '1':
      await addImageToArticle();
      break;
    case '2':
      await updateMultipleImages();
      break;
    case '3':
      console.log('👋 Au revoir !');
      break;
    default:
      console.log('❌ Choix invalide');
  }
  
  rl.close();
}

main().catch(console.error);
