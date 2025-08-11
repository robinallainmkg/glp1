import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';
const PLACEHOLDER_PATTERNS = [
  /\*\[Définition et présentation à développer\.\.\.\]\*/i,
  /\*\[Mécanisme d'action à développer\.\.\.\]\*/i,
  /\*\[Qui peut l'utiliser et comment à développer\.\.\.\]\*/i,
  /\*\[Contre-indications et conseils à développer\.\.\.\]\*/i,
  /\[Définition et présentation à développer\.\.\.\]/i,
  /\[Mécanisme d'action à développer\.\.\.\]/i,
  /\[Qui peut l'utiliser et comment à développer\.\.\.\]/i,
  /\[Contre-indications et conseils à développer\.\.\.\]/i
];

function cleanContent(filePath) {
  let changed = false;
  let content = fs.readFileSync(filePath, 'utf-8');
  PLACEHOLDER_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function scanAndClean(dir) {
  let cleaned = 0;
  fs.readdirSync(dir).forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) cleaned += scanAndClean(fullPath);
    else if (item.endsWith('.md')) {
      if (cleanContent(fullPath)) cleaned++;
    }
  });
  return cleaned;
}

console.log('🔧 Suppression des contenus non rédigés (placeholders)...');
const totalCleaned = scanAndClean(CONTENT_DIR);
console.log(`✅ Placeholders supprimés dans ${totalCleaned} fichier(s)`);
