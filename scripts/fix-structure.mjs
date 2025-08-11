// 🔧 CORRECTEUR AUTOMATIQUE DE STRUCTURE H1/H2
// Usage: node scripts/fix-structure.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../src/content');

// Templates de sections H2 par type de contenu
const H2_TEMPLATES = {
  'medicaments-glp1': [
    '## Qu\'est-ce que {medicament} ?',
    '## Comment fonctionne {medicament} ?',
    '## Indications et prescription',
    '## Posologie et administration',
    '## Effets secondaires possibles',
    '## Précautions et contre-indications',
    '## Prix et remboursement',
    '## Alternatives disponibles'
  ],
  'effets-secondaires-glp1': [
    '## Comprendre {effet}',
    '## Causes et mécanisme',
    '## Symptômes à surveiller',
    '## Solutions et traitements',
    '## Quand consulter un médecin',
    '## Prévention et conseils',
    '## Témoignages et expériences'
  ],
  'alternatives-glp1': [
    '## Qu\'est-ce que {alternative} ?',
    '## Mécanisme d\'action',
    '## Efficacité comparée aux GLP-1',
    '## Mode d\'utilisation',
    '## Avantages et inconvénients',
    '## Qui peut l\'utiliser ?',
    '## Où se procurer {alternative}'
  ],
  'glp1-diabete': [
    '## GLP-1 et diabète : les bases',
    '## Impact sur la glycémie',
    '## Protocole de traitement',
    '## Surveillance et suivi',
    '## Adaptation du mode de vie',
    '## Complications à éviter',
    '## Perspectives d\'évolution'
  ],
  'glp1-perte-de-poids': [
    '## Mécanisme de perte de poids',
    '## Efficacité prouvée',
    '## Candidats idéaux',
    '## Protocole de traitement',
    '## Résultats attendus',
    '## Maintien des résultats',
    '## Témoignages patients'
  ],
  'regime-glp1': [
    '## Principes du régime',
    '## Aliments recommandés',
    '## Aliments à éviter',
    '## Planning type de repas',
    '## Adaptation progressive',
    '## Conseils pratiques',
    '## Résultats attendus'
  ],
  'glp1-cout': [
    '## Tarifs officiels',
    '## Remboursement sécurité sociale',
    '## Prise en charge mutuelle',
    '## Comparaison des prix',
    '## Aides financières possibles',
    '## Alternatives économiques',
    '## Conseils pour économiser'
  ],
  'medecins-glp1-france': [
    '## Spécialistes recommandés',
    '## Critères de choix',
    '## Préparation de la consultation',
    '## Questions à poser',
    '## Suivi médical',
    '## Coordonnées et contact',
    '## Avis patients'
  ],
  'recherche-glp1': [
    '## État actuel de la recherche',
    '## Études cliniques récentes',
    '## Innovations en cours',
    '## Résultats prometteurs',
    '## Perspectives d\'avenir',
    '## Impact médical',
    '## Applications futures'
  ]
};

function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

function extractTitle(frontmatter) {
  const titleMatch = frontmatter.match(/^title:\s*["']([^"']+)["']/m);
  return titleMatch ? titleMatch[1] : '';
}

function countHeadings(content, level) {
  const regex = new RegExp(`^#{${level}}\\s+`, 'gm');
  return (content.match(regex) || []).length;
}

function generateH2Sections(collection, title, keyword) {
  const templates = H2_TEMPLATES[collection] || H2_TEMPLATES['medicaments-glp1'];
  
  // Variables de remplacement
  const replacements = {
    '{medicament}': keyword || title.split(' ')[0],
    '{effet}': keyword || 'cet effet secondaire',
    '{alternative}': keyword || 'cette alternative'
  };

  return templates.map(template => {
    let section = template;
    Object.entries(replacements).forEach(([placeholder, value]) => {
      section = section.replace(placeholder, value);
    });
    
    // Ajout de contenu de base
    return `${section}

*[Contenu à développer sur ce point spécifique...]*

`;
  }).join('');
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

function fixH2Structure(content, collection, title, keyword) {
  const { frontmatter, body } = extractFrontmatter(content);
  
  const h2Count = countHeadings(body, 2);
  
  if (h2Count >= 3) {
    return content; // Structure H2 déjà correcte
  }
  
  // Trouver la position d'insertion (après le H1 et l'introduction)
  const lines = body.split('\n');
  let insertPosition = 0;
  
  // Chercher la fin de l'introduction (après le premier paragraphe)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '' && i > 5) {
      insertPosition = i + 1;
      break;
    }
  }
  
  if (insertPosition === 0) {
    insertPosition = Math.min(10, lines.length); // Position par défaut
  }
  
  // Générer les sections H2
  const h2Sections = generateH2Sections(collection, title, keyword);
  
  // Insérer les sections
  lines.splice(insertPosition, 0, h2Sections);
  
  const newBody = lines.join('\n');
  return `---\n${frontmatter}\n---\n\n${newBody}`;
}

function addMedicalDisclaimer(content) {
  if (content.includes('**Important :**') || content.includes('avis médical')) {
    return content; // Disclaimer déjà présent
  }
  
  const disclaimer = `
## À retenir

**Important :** Les informations contenues dans cet article sont données à titre informatif uniquement et ne remplacent en aucun cas l'avis d'un professionnel de santé. Consultez toujours votre médecin avant de commencer, modifier ou arrêter un traitement.

`;
  
  // Ajouter avant la section "Articles similaires" ou à la fin
  if (content.includes('## Articles similaires')) {
    return content.replace('## Articles similaires', disclaimer + '## Articles similaires');
  } else {
    return content + disclaimer;
  }
}

async function fixStructureForFile(filePath, collection) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = extractFrontmatter(content);
    
    const title = extractTitle(frontmatter);
    const keywordMatch = frontmatter.match(/^mainKeyword:\s*["']([^"']+)["']/m);
    const keyword = keywordMatch ? keywordMatch[1] : '';
    
    if (!title) {
      console.log(`⚠️  Titre manquant: ${filePath}`);
      return false;
    }
    
    let fixedContent = content;
    let changes = [];
    
    // Vérifier et corriger la structure H1
    const h1Count = countHeadings(body, 1);
    if (h1Count !== 1) {
      fixedContent = fixH1Structure(fixedContent, title);
      changes.push(`H1: ${h1Count} → 1`);
    }
    
    // Vérifier et corriger la structure H2
    const h2Count = countHeadings(extractFrontmatter(fixedContent).body, 2);
    if (h2Count < 3) {
      fixedContent = fixH2Structure(fixedContent, collection, title, keyword);
      changes.push(`H2: ${h2Count} → 3+`);
    }
    
    // Ajouter disclaimer médical si manquant
    if (!content.includes('**Important :**')) {
      fixedContent = addMedicalDisclaimer(fixedContent);
      changes.push('Disclaimer ajouté');
    }
    
    // Sauvegarder si des changements ont été apportés
    if (changes.length > 0) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ ${path.basename(filePath)}: ${changes.join(', ')}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

async function fixAllStructures() {
  console.log('🔧 Début de la correction automatique des structures...\n');
  
  const collections = fs.readdirSync(CONTENT_DIR);
  let totalFixed = 0;
  let totalProcessed = 0;
  
  for (const collection of collections) {
    const collectionPath = path.join(CONTENT_DIR, collection);
    if (!fs.statSync(collectionPath).isDirectory()) continue;
    
    console.log(`📁 Collection: ${collection}`);
    
    const files = fs.readdirSync(collectionPath);
    let collectionFixed = 0;
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(collectionPath, file);
      totalProcessed++;
      
      const wasFixed = await fixStructureForFile(filePath, collection);
      if (wasFixed) {
        collectionFixed++;
        totalFixed++;
      }
    }
    
    console.log(`  📊 ${collectionFixed}/${files.filter(f => f.endsWith('.md')).length} fichiers corrigés\n`);
  }
  
  console.log('📈 RÉSULTATS DE LA CORRECTION');
  console.log('===============================');
  console.log(`📚 Total fichiers traités: ${totalProcessed}`);
  console.log(`✅ Total fichiers corrigés: ${totalFixed}`);
  console.log(`📊 Taux de correction: ${((totalFixed / totalProcessed) * 100).toFixed(1)}%`);
  
  return { totalProcessed, totalFixed };
}

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAllStructures().catch(console.error);
}

export { fixAllStructures, fixStructureForFile };
