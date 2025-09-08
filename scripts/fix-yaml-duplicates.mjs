// Script pour détecter et corriger les doublons YAML dans le frontmatter
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content');

console.log('🔧 DÉTECTION ET CORRECTION DES DOUBLONS YAML');
console.log('='.repeat(50));

let fixedFiles = 0;
let errors = 0;

function fixYamlDuplicates(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(contentDir, filePath);
    
    // Extraire le frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return;
    }
    
    const frontmatter = frontmatterMatch[1];
    const bodyContent = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
    
    // Détecter les doublons
    const lines = frontmatter.split('\n');
    const seenKeys = new Map();
    const cleanedLines = [];
    let hasDuplicates = false;
    
    lines.forEach((line, index) => {
      const match = line.match(/^(\w+):\s*/);
      if (match) {
        const key = match[1];
        if (seenKeys.has(key)) {
          // Doublon détecté
          console.log(`🔴 ${relativePath}: Doublon détecté pour '${key}' ligne ${index + 1}`);
          console.log(`   Première occurrence: ${seenKeys.get(key)}`);
          console.log(`   Doublon ignoré: ${line.trim()}`);
          hasDuplicates = true;
          return; // Skip la ligne en doublon
        }
        seenKeys.set(key, line.trim());
      }
      cleanedLines.push(line);
    });
    
    if (hasDuplicates) {
      const cleanedFrontmatter = cleanedLines.join('\n');
      const newContent = `---\n${cleanedFrontmatter}\n---\n\n${bodyContent}`;
      
      fs.writeFileSync(filePath, newContent, 'utf-8');
      fixedFiles++;
      console.log(`✅ ${relativePath}: Doublons corrigés`);
    }
    
  } catch (error) {
    console.log(`❌ Erreur ${filePath}: ${error.message}`);
    errors++;
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.md')) {
      fixYamlDuplicates(fullPath);
    }
  });
}

console.log('\n📂 Scan des fichiers...');
scanDirectory(contentDir);

console.log('\n' + '='.repeat(50));
console.log('📊 RÉSULTATS');
console.log('='.repeat(50));
console.log(`✅ Fichiers corrigés: ${fixedFiles}`);
console.log(`❌ Erreurs: ${errors}`);

if (fixedFiles > 0) {
  console.log('\n🎯 ÉTAPE SUIVANTE:');
  console.log('├─ Tester le build avec npm run build');
  console.log('└─ Vérifier que tout fonctionne correctement');
} else {
  console.log('\n💡 Aucun doublon détecté - frontmatter propre');
}

console.log('\n' + '='.repeat(50));
