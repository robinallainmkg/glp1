import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

// Patterns à supprimer
const REMOVE_PATTERNS = [
  /!\[[^\]]*\]\([^)]*\)/g, // images
  /\[affiliate-box\]/gi,
  /Texte de conclusion/gi,
  /Résumé ?:/gi,
  /Qu’est-ce que c’est ?/gi,
  /Comment ça fonctionne ?/gi,
  /Indications et utilisation/gi,
  /Précautions importantes/gi,
  /Injection de médicament GLP-1/gi,
  /Articles Connexes/gi,
  /\*\*Résumé :\*\*/gi,
  /\*\*Important :\*\*/gi,
  /\*Dernière mise à jour : [^\n]*\*/gi
];

function cleanContent(content) {
  let cleaned = content;
  REMOVE_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  // Supprimer les titres vides ou sections non rédigées
  cleaned = cleaned.replace(/##+\s*$/gm, '');
  // Supprimer les lignes vides multiples
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

function cleanAllArticles() {
  function scanDir(dir) {
    fs.readdirSync(dir).forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) scanDir(fullPath);
      else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const cleaned = cleanContent(content);
        fs.writeFileSync(fullPath, cleaned, 'utf-8');
        console.log('Nettoyé :', fullPath);
      }
    });
  }
  scanDir(CONTENT_DIR);
}

cleanAllArticles();
