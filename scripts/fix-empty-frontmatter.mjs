#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contentDir = join(__dirname, '..', 'src', 'content');

console.log('🔧 Correction finale des frontmatters...\n');

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
    let needsUpdate = false;
    let updatedContent = content;
    
    // Détecter les titres et descriptions vides
    if (content.includes("title: ''") || content.includes('title: ""') || 
        content.includes("description: ''") || content.includes('description: ""')) {
      
      const lines = content.split('\n');
      let inFirstFrontmatter = false;
      let inSecondFrontmatter = false;
      let frontmatterEndCount = 0;
      let newFrontmatter = {};
      let secondFrontmatterData = {};
      let actualContentStart = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '---') {
          frontmatterEndCount++;
          if (frontmatterEndCount === 1) {
            inFirstFrontmatter = true;
          } else if (frontmatterEndCount === 2) {
            inFirstFrontmatter = false;
          } else if (frontmatterEndCount === 3) {
            inSecondFrontmatter = true;
          } else if (frontmatterEndCount === 4) {
            inSecondFrontmatter = false;
            actualContentStart = i + 1;
            break;
          }
          continue;
        }
        
        if (inFirstFrontmatter && line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim().replace(/['"]/g, '');
          if (key && value) {
            newFrontmatter[key.trim()] = value;
          }
        }
        
        if (inSecondFrontmatter && line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim().replace(/['"]/g, '');
          if (key && value) {
            secondFrontmatterData[key.trim()] = value;
          }
        }
      }
      
      // Fusionner les données avec priorité aux données du second frontmatter
      const finalFrontmatter = {
        ...newFrontmatter,
        title: secondFrontmatterData.title || newFrontmatter.title || `Article ${newFrontmatter.slug}`,
        description: secondFrontmatterData.description || secondFrontmatterData.metaDescription || newFrontmatter.description || `Description de l'article ${newFrontmatter.slug}`,
        author: secondFrontmatterData.author || newFrontmatter.author,
        tags: newFrontmatter.tags || []
      };
      
      // S'assurer que les tags sont un array
      if (typeof finalFrontmatter.tags === 'string') {
        finalFrontmatter.tags = [];
      }
      
      // Reconstruire le fichier
      const actualContent = actualContentStart > -1 ? lines.slice(actualContentStart).join('\n') : '';
      
      let newContent = '---\n';
      Object.entries(finalFrontmatter).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          newContent += `${key}: ${JSON.stringify(value)}\n`;
        } else if (typeof value === 'string' && value.includes('"')) {
          newContent += `${key}: "${value.replace(/"/g, '\\"')}"\n`;
        } else {
          newContent += `${key}: ${typeof value === 'string' && value.includes(' ') ? `"${value}"` : value}\n`;
        }
      });
      newContent += '---\n\n';
      newContent += actualContent.trim();
      
      updatedContent = newContent;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      writeFileSync(filePath, updatedContent, 'utf-8');
      fixedFiles++;
      
      const relativePath = filePath.replace(contentDir, '').replace(/\\/g, '/');
      console.log(`✅ Corrigé: ${relativePath}`);
    }
    
  } catch (error) {
    const relativePath = filePath.replace(contentDir, '').replace(/\\/g, '/');
    console.error(`❌ Erreur avec ${relativePath}:`, error.message);
  }
}

// Process all content directories
processDirectory(contentDir);

console.log(`\n🎉 Correction terminée!`);
console.log(`📊 ${fixedFiles} fichiers corrigés sur ${totalFiles} fichiers traités`);
