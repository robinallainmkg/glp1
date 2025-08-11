import fs from 'fs';
import path from 'path';

console.log('🔍 Diagnostic de l\'audit SEO...');

// Recréer la fonction d'audit pour un fichier spécifique
function auditSingleFile(filePath) {
  console.log(`\n📄 Analyse: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = extractFrontmatter(content);
  
  console.log('📝 Longueur du contenu:', body.length, 'caractères');
  console.log('📋 Frontmatter présent:', frontmatter.length > 0 ? 'OUI' : 'NON');
  
  // Compter les éléments SEO
  const h1Count = (body.match(/^# /gm) || []).length;
  const h2Count = (body.match(/^## /gm) || []).length;
  const h3Count = (body.match(/^### /gm) || []).length;
  
  console.log('🏷️ Titres H1:', h1Count);
  console.log('🏷️ Titres H2:', h2Count);
  console.log('🏷️ Titres H3:', h3Count);
  
  // Vérifier keywords
  const hasKeywords = frontmatter.includes('keywords:');
  console.log('🔑 Mots-clés:', hasKeywords ? 'PRÉSENTS' : 'ABSENTS');
  
  // Vérifier contenu optimisé
  const hasExpertise = body.includes('Expertise médicale française');
  const hasTOC = body.includes('## Sommaire');
  const hasInternalLinks = body.includes('Articles connexes');
  const hasFAQ = body.includes('Questions fréquentes');
  
  console.log('🎯 Sections optimisées:');
  console.log('  - Expertise médicale:', hasExpertise ? 'OUI' : 'NON');
  console.log('  - Table des matières:', hasTOC ? 'OUI' : 'NON'); 
  console.log('  - Liens internes:', hasInternalLinks ? 'OUI' : 'NON');
  console.log('  - FAQ:', hasFAQ ? 'OUI' : 'NON');
  
  // Calculer score approximatif
  let score = 0;
  
  // Structure (30 points)
  if (h1Count >= 1) score += 10;
  if (h2Count >= 3) score += 10;
  if (h3Count >= 2) score += 10;
  
  // Contenu (40 points)
  if (body.length > 1000) score += 15;
  if (body.length > 2000) score += 10;
  if (hasExpertise) score += 15;
  
  // Optimisation (30 points)
  if (hasKeywords) score += 10;
  if (hasInternalLinks) score += 10;
  if (hasFAQ) score += 10;
  
  console.log('📊 Score estimé:', score, '/100');
  
  return score;
}

function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

// Tester quelques fichiers problématiques
const testFiles = [
  'src/content/effets-secondaires-glp1/wegovy-danger.md',
  'src/content/glp1-perte-de-poids/chirurgie-bariatrique.md',
  'src/content/medicaments-glp1/ado-medicament.md'
];

console.log('🧪 Test de diagnostic sur 3 fichiers...\n');

for (const file of testFiles) {
  if (fs.existsSync(file)) {
    auditSingleFile(file);
  } else {
    console.log(`❌ Fichier non trouvé: ${file}`);
  }
}

console.log('\n🎯 Recherche des fichiers avec contenu le plus complet...');

// Analyser quelques fichiers pour trouver le mieux optimisé
const sampleFiles = [
  'src/content/medicaments-glp1/medicament-anti-obesite-novo-nordisk.md',
  'src/content/alternatives-glp1/berberine-glp1.md',
  'src/content/glp1-diabete/diabete-pied-glp1.md'
];

let bestScore = 0;
let bestFile = '';

for (const file of sampleFiles) {
  if (fs.existsSync(file)) {
    console.log(`\n🔍 ${file}:`);
    const score = auditSingleFile(file);
    if (score > bestScore) {
      bestScore = score;
      bestFile = file;
    }
  }
}

console.log(`\n🏆 Meilleur fichier trouvé: ${bestFile} (${bestScore}/100)`);
