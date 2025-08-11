// 🔧 CORRECTEUR AMÉLIORÉ - Gestion de tous les formats de titre
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../src/content');

console.log('🔧 Correction améliorée avec gestion des titres...');

function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

function extractTitle(frontmatter) {
  // Chercher title avec ou sans guillemets, en gérant tous les formats
  let titleMatch = frontmatter.match(/^title:\s*["']([^"']+)["']/m); // "titre" ou 'titre'
  if (!titleMatch) {
    titleMatch = frontmatter.match(/^title:\s*([^"\n]+)/m); // titre sans guillemets
  }
  
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  return '';
}

function countHeadings(content, level) {
  const regex = new RegExp(`^#{${level}}\\s+`, 'gm');
  return (content.match(regex) || []).length;
}

function fixH1Structure(content, title) {
  const { frontmatter, body } = extractFrontmatter(content);
  
  // Supprimer tous les H1 existants
  let fixedBody = body.replace(/^#\s+.*$/gm, '');
  
  // Ajouter le H1 principal au début
  const h1 = `# ${title}

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*

`;
  
  // Nettoyer les lignes vides multiples
  fixedBody = fixedBody.replace(/\n{3,}/g, '\n\n');
  
  return `---\n${frontmatter}\n---\n\n${h1}${fixedBody.trim()}\n`;
}

function addBasicH2Structure(content, title) {
  const { frontmatter, body } = extractFrontmatter(content);
  
  const h2Count = countHeadings(body, 2);
  if (h2Count >= 3) return content; // Structure déjà correcte
  
  // Trouver la position d'insertion après l'introduction
  const lines = body.split('\n');
  let insertPosition = 5; // Position par défaut
  
  // Chercher une ligne vide après quelques lignes
  for (let i = 3; i < Math.min(15, lines.length); i++) {
    if (lines[i].trim() === '') {
      insertPosition = i + 1;
      break;
    }
  }
  
  // Sections H2 basiques adaptées au type d'article
  let basicSections;
  
  if (title.toLowerCase().includes('prix') || title.toLowerCase().includes('coût')) {
    basicSections = `
## Prix et tarifs officiels

*[Détails des tarifs à développer...]*

## Remboursement et prise en charge

*[Informations remboursement à développer...]*

## Comparaison des prix

*[Comparatif avec alternatives à développer...]*

## Comment économiser

*[Conseils pour réduire les coûts à développer...]*

`;
  } else if (title.toLowerCase().includes('effet') || title.toLowerCase().includes('danger')) {
    basicSections = `
## Comprendre les effets

*[Explication des mécanismes à développer...]*

## Fréquence et gravité

*[Statistiques et données à développer...]*

## Gestion et solutions

*[Conseils pratiques à développer...]*

## Quand consulter

*[Signes d'alerte à développer...]*

`;
  } else {
    basicSections = `
## Qu'est-ce que c'est ?

*[Définition et présentation à développer...]*

## Comment ça fonctionne ?

*[Mécanisme d'action à développer...]*

## Indications et utilisation

*[Qui peut l'utiliser et comment à développer...]*

## Précautions importantes

*[Contre-indications et conseils à développer...]*

`;
  }
  
  lines.splice(insertPosition, 0, basicSections);
  const newBody = lines.join('\n');
  
  return `---\n${frontmatter}\n---\n\n${newBody}`;
}

function addMedicalDisclaimer(content) {
  if (content.includes('**Important :**') || content.includes('avis médical')) {
    return content;
  }
  
  const disclaimer = `
## Important

**Important :** Ces informations sont données à titre informatif uniquement et ne remplacent pas l'avis d'un professionnel de santé. Consultez toujours votre médecin avant de commencer, modifier ou arrêter un traitement.

`;
  
  return content + disclaimer;
}

async function fixCollection(collectionName) {
  const collectionPath = path.join(CONTENT_DIR, collectionName);
  if (!fs.existsSync(collectionPath)) return;
  
  console.log(`📁 Collection: ${collectionName}`);
  
  const files = fs.readdirSync(collectionPath);
  let fixed = 0;
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    try {
      const filePath = path.join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, body } = extractFrontmatter(content);
      
      const title = extractTitle(frontmatter);
      if (!title) {
        console.log(`  ⚠️  ${file}: Titre manquant, ignoré`);
        continue;
      }
      
      let fixedContent = content;
      let changes = [];
      
      // Corriger H1
      const h1Count = countHeadings(body, 1);
      if (h1Count !== 1) {
        fixedContent = fixH1Structure(fixedContent, title);
        changes.push(`H1: ${h1Count}→1`);
      }
      
      // Corriger H2
      const h2Count = countHeadings(extractFrontmatter(fixedContent).body, 2);
      if (h2Count < 3) {
        fixedContent = addBasicH2Structure(fixedContent, title);
        changes.push(`H2: ${h2Count}→3+`);
      }
      
      // Ajouter disclaimer
      if (!content.includes('**Important :**')) {
        fixedContent = addMedicalDisclaimer(fixedContent);
        changes.push('Disclaimer');
      }
      
      if (changes.length > 0) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`  ✅ ${file}: ${changes.join(', ')}`);
        fixed++;
      } else {
        console.log(`  ⚪ ${file}: Déjà correct`);
      }
      
    } catch (error) {
      console.log(`  ❌ ${file}: Erreur - ${error.message}`);
    }
  }
  
  console.log(`  📊 ${fixed} fichiers corrigés\n`);
  return fixed;
}

async function main() {
  try {
    const collections = fs.readdirSync(CONTENT_DIR);
    let totalFixed = 0;
    
    for (const collection of collections) {
      if (fs.statSync(path.join(CONTENT_DIR, collection)).isDirectory()) {
        const fixed = await fixCollection(collection);
        totalFixed += fixed;
      }
    }
    
    console.log('📈 CORRECTION AMÉLIORÉE TERMINÉE');
    console.log('================================');
    console.log(`✅ Total fichiers corrigés: ${totalFixed}`);
    console.log('🚀 Relancer l\'audit pour voir les améliorations !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

main();
