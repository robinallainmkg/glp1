#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contentDir = join(__dirname, '..', 'src', 'content');

console.log('🔧 Correction des dates pubDate quotées...\n');

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
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Fix quoted pubDate values: pubDate: '2025-08-20' -> pubDate: 2025-08-20
    content = content.replace(/pubDate:\s*['"](\d{4}-\d{2}-\d{2})['"]/, 'pubDate: $1');
    
    // Fix timestamp pubDate values: pubDate: "2025-08-20T11:49:24.828Z" -> pubDate: 2025-08-20
    content = content.replace(/pubDate:\s*['"](\d{4}-\d{2}-\d{2})T[^'"]*['"]/, 'pubDate: $1');
    
    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf-8');
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
