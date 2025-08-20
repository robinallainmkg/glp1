#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contentDir = join(__dirname, '..', 'src', 'content');

console.log('🔧 Correction des dates pubDate...\n');

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
    const { data: frontmatter, content: markdownContent } = matter(content);
    
    let needsUpdate = false;
    
    // Fix pubDate if it's a string (either with timestamp or quoted date)
    if (frontmatter.pubDate && typeof frontmatter.pubDate === 'string') {
      if (frontmatter.pubDate.includes('T') && frontmatter.pubDate.includes('Z')) {
        // Convert timestamp to simple date
        const date = new Date(frontmatter.pubDate);
        frontmatter.pubDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        needsUpdate = true;
        console.log(`📅 Date timestamp fixée: ${frontmatter.pubDate}`);
      } else if (frontmatter.pubDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Convert quoted date string to unquoted
        frontmatter.pubDate = frontmatter.pubDate; // Keep the same date but ensure it's processed as date
        needsUpdate = true;
        console.log(`📅 Date string fixée: ${frontmatter.pubDate}`);
      }
    }
    
    // Also ensure tags is always an array
    if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      if (typeof frontmatter.tags === 'string') {
        frontmatter.tags = frontmatter.tags.split(',').map(tag => tag.trim());
      } else {
        frontmatter.tags = [];
      }
      needsUpdate = true;
      console.log(`🏷️ Tags convertis en array`);
    }
    
    // Ensure tags is present and is array
    if (!frontmatter.tags) {
      frontmatter.tags = [];
      needsUpdate = true;
      console.log(`🏷️ Tags ajoutés (array vide)`);
    }
    
    if (needsUpdate) {
      // Convert pubDate to proper format for matter.stringify
      if (frontmatter.pubDate && typeof frontmatter.pubDate === 'string' && frontmatter.pubDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        frontmatter.pubDate = new Date(frontmatter.pubDate + 'T00:00:00.000Z');
      }
      
      const newContent = matter.stringify(markdownContent, frontmatter);
      
      // Fix the output to ensure pubDate is unquoted
      const fixedContent = newContent.replace(/pubDate: (['"])\d{4}-\d{2}-\d{2}T.*?\1/g, (match) => {
        const dateMatch = match.match(/(\d{4}-\d{2}-\d{2})/);
        return dateMatch ? `pubDate: ${dateMatch[1]}` : match;
      });
      
      writeFileSync(filePath, fixedContent, 'utf-8');
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
