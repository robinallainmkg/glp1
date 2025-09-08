import fs from 'fs';
import path from 'path';

// Script pour supprimer tous les emoji d'un fichier Markdown
const filePath = 'C:/Users/robin/glp1/glp1-github/src/content/glp1-cout/prix-mounjaro-france.md';

// Lire le contenu du fichier
let content = fs.readFileSync(filePath, 'utf-8');

console.log('🧹 Suppression des emoji...');

// Regex pour supprimer tous les emoji (caractères Unicode emoji)
const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]/gu;

// Supprimer les emoji
const cleanContent = content.replace(emojiRegex, '');

// Nettoyer aussi les espaces multiples créés par la suppression
const finalContent = cleanContent
  .replace(/\s{2,}/g, ' ')
  .replace(/^\s+/gm, '')
  .replace(/\s+$/gm, '');

// Écrire le contenu nettoyé
fs.writeFileSync(filePath, finalContent, 'utf-8');

console.log('✅ Emoji supprimés avec succès !');
console.log('📄 Fichier sauvegardé :', filePath);
