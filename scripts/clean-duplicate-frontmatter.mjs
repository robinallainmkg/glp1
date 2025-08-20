#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contentDir = join(__dirname, '..', 'src', 'content');

console.log('🔧 Nettoyage des articles avec double frontmatter...\n');

let totalFiles = 0;
let fixedFiles = 0;

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
    
    // Détecter les articles avec double frontmatter
    const frontmatterCount = (content.match(/^---$/gm) || []).length;
    
    if (frontmatterCount >= 4) { // Plus de 2 frontmatter sections
      // Parse avec matter pour extraire le premier frontmatter
      const { data: firstFrontmatter, content: remainingContent } = matter(content);
      
      // Trouver le deuxième frontmatter dans le contenu restant
      const secondFrontmatterMatch = remainingContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      
      if (secondFrontmatterMatch) {
        const [, secondFrontmatterContent, actualContent] = secondFrontmatterMatch;
        
        // Parser le second frontmatter
        const secondFrontmatter = {};
        secondFrontmatterContent.split('\n').forEach(line => {
          const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
          if (match) {
            const [, key, value] = match;
            if (value.trim()) {
              secondFrontmatter[key] = value.trim().replace(/^"|"$/g, '');
            }
          }
        });
        
        // Fusionner les frontmatters avec priorité au second (plus complet)
        const mergedFrontmatter = {
          ...firstFrontmatter,
          ...secondFrontmatter
        };
        
        // S'assurer que les champs obligatoires sont remplis
        if (!mergedFrontmatter.title && secondFrontmatter.title) {
          mergedFrontmatter.title = secondFrontmatter.title;
        }
        if (!mergedFrontmatter.description && secondFrontmatter.description) {
          mergedFrontmatter.description = secondFrontmatter.description;
        }
        
        // Ensure tags is array
        if (!mergedFrontmatter.tags || !Array.isArray(mergedFrontmatter.tags)) {
          mergedFrontmatter.tags = [];
        }
        
        // S'assurer que les champs de base ont des valeurs par défaut
        if (!mergedFrontmatter.title) {
          mergedFrontmatter.title = secondFrontmatter.metaTitle || `Article ${firstFrontmatter.slug}`;
        }
        if (!mergedFrontmatter.description) {
          mergedFrontmatter.description = secondFrontmatter.metaDescription || `Description de l'article ${firstFrontmatter.slug}`;
        }
        
        // Reconstruire le fichier avec un seul frontmatter
        const newContent = matter.stringify(actualContent.trim(), mergedFrontmatter);
        
        writeFileSync(filePath, newContent, 'utf-8');
        fixedFiles++;
        
        const relativePath = filePath.replace(contentDir, '').replace(/\\/g, '/');
        console.log(`✅ Nettoyé: ${relativePath}`);
        console.log(`   Title: ${mergedFrontmatter.title.substring(0, 50)}...`);
      }
    }
    
  } catch (error) {
    const relativePath = filePath.replace(contentDir, '').replace(/\\/g, '/');
    console.error(`❌ Erreur avec ${relativePath}:`, error.message);
  }
}

// Process all content directories
processDirectory(contentDir);

console.log(`\n🎉 Nettoyage terminé!`);
console.log(`📊 ${fixedFiles} fichiers nettoyés sur ${totalFiles} fichiers traités`);
