#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pagesDir = join(__dirname, '..', 'src', 'pages');

console.log('🔧 Correction des pages [slug].astro pour ajouter thumbnail...\n');

let fixedFiles = 0;

function processDirectory(dirPath) {
  const items = readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = join(dirPath, item);
    const stat = statSync(itemPath);
    
    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (item === '[slug].astro') {
      fixSlugPage(itemPath);
    }
  });
}

function fixSlugPage(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Vérifier si thumbnail est déjà présent
    if (content.includes('thumbnail={entry.data.thumbnail}')) {
      return; // Déjà corrigé
    }
    
    // Ajouter thumbnail={entry.data.thumbnail} avant la fermeture du composant ArticleLayout
    content = content.replace(
      /(collectionTheme="[^"]*")\s*\n?\s*\/>/g,
      '$1\n  thumbnail={entry.data.thumbnail}\n/>'
    );
    
    // Aussi gérer le cas sans collectionTheme
    if (!content.includes('thumbnail={entry.data.thumbnail}') && content.includes('<ArticleLayout')) {
      content = content.replace(
        /(\s+content=\{content\})\s*\n?\s*\/>/g,
        '$1\n  thumbnail={entry.data.thumbnail}\n/>'
      );
    }
    
    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf-8');
      fixedFiles++;
      
      const relativePath = filePath.replace(pagesDir, '').replace(/\\/g, '/');
      console.log(`✅ Corrigé: ${relativePath}`);
    }
    
  } catch (error) {
    const relativePath = filePath.replace(pagesDir, '').replace(/\\/g, '/');
    console.error(`❌ Erreur avec ${relativePath}:`, error.message);
  }
}

// Process all pages directories
processDirectory(pagesDir);

console.log(`\n🎉 Correction terminée!`);
console.log(`📊 ${fixedFiles} pages [slug].astro corrigées`);
