#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liens stratégiques fixes à ajouter selon les mots-clés
const STRATEGIC_LINKS = {
  'ozempic': [
    '[prix Ozempic France](../glp1-perte-de-poids/ozempic-prix/)',
    '[régime Ozempic](../glp1-perte-de-poids/ozempic-regime/)',
    '[effets secondaires Ozempic](../effets-secondaires-glp1/ozempic-danger/)',
    '[où trouver Ozempic](../glp1-perte-de-poids/ou-trouver-ozempic/)'
  ],
  'wegovy': [
    '[prix Wegovy](../glp1-cout/wegovy-prix/)',
    '[acheter Wegovy France](../glp1-cout/acheter-wegovy-en-france/)',
    '[dangers Wegovy](../effets-secondaires-glp1/wegovy-danger/)',
    '[remboursement Wegovy](../glp1-cout/wegovy-remboursement-mutuelle/)'
  ],
  'mounjaro': [
    '[prix Mounjaro France](../medicaments-glp1/mounjaro-prix-france/)',
    '[injection Mounjaro](../medicaments-glp1/mounjaro-injection-pour-maigrir/)',
    '[effets secondaires Mounjaro](../medicaments-glp1/mounjaro-effet-secondaire/)',
    '[avis Tirzepatide](../medicaments-glp1/tirzepatide-avis/)'
  ],
  'glp1': [
    '[médicaments GLP-1](../medicaments-glp1/nouveau-medicament/)',
    '[GLP-1 perte de poids](../glp1-perte-de-poids/glp1-perte-de-poids/)',
    '[traitement diabète GLP-1](../medicaments-glp1/traitement-diabete-type-2/)',
    '[alternatives naturelles GLP-1](../alternatives-glp1/alternatives-naturelles-ozempic/)'
  ],
  'perte de poids': [
    '[médicament maigrir puissant](../glp1-perte-de-poids/medicament-pour-maigrir-tres-puissant/)',
    '[injection pour maigrir](../glp1-perte-de-poids/medicament-pour-maigrir-tres-puissant-en-pharmacie/)',
    '[obésité sévère traitement](../glp1-perte-de-poids/obesite-severe-prise-en-charge/)',
    '[avant après GLP-1](../glp1-perte-de-poids/avant-apres-glp1/)'
  ],
  'diabète': [
    '[nouveau traitement diabète](../medicaments-glp1/nouveau-traitement-diabete-type-2-injection/)',
    '[traitement diabète type 2](../medicaments-glp1/traitement-diabete-type-2/)',
    '[plantes anti-diabète](../alternatives-glp1/plantes-diabete/)',
    '[guérir du diabète](../alternatives-glp1/peut-on-guerir-du-diabete/)'
  ],
  'prix': [
    '[prix Saxenda](../medicaments-glp1/saxenda-prix/)',
    '[opération pour maigrir prix](../glp1-cout/operation-pour-maigrir-prix/)',
    '[injection Ozempic prix](../medicaments-glp1/ozempic-injection-prix/)',
    '[comparatif prix GLP-1](../glp1-cout/wegovy-prix-pharmacie/)'
  ]
};

// Templates de sections à ajouter
const LINK_TEMPLATES = {
  relatedSection: `
## Articles Connexes

{links}

Ces ressources complémentaires vous aideront à approfondir vos connaissances sur les traitements GLP-1 en France.`,
  
  inTextLink: '. Pour plus d\'informations, consultez {link}',
  
  seeAlso: `
> **Voir aussi :** {links}
`
};

function findBestLinks(content, fileName, maxLinks = 5) {
  const contentLower = content.toLowerCase();
  const selectedLinks = [];
  
  // Chercher les mots-clés dans le contenu
  for (const [keyword, links] of Object.entries(STRATEGIC_LINKS)) {
    if (contentLower.includes(keyword.toLowerCase())) {
      // Ajouter des liens de cette catégorie
      for (const link of links) {
        if (selectedLinks.length >= maxLinks) break;
        
        // Vérifier que le lien n'est pas déjà présent
        if (!content.includes(link) && !content.includes(link.split('](')[1]?.split(')')[0])) {
          selectedLinks.push(link);
        }
      }
    }
  }
  
  // Ajouter des liens génériques si pas assez
  if (selectedLinks.length < 3) {
    const genericLinks = [
      '[Guide complet GLP-1](../medicaments-glp1/nouveau-medicament/)',
      '[Comparaison traitements](../medicaments-glp1/medicament-americain-pour-maigrir/)',
      '[Alternatives naturelles](../alternatives-glp1/semaglutide-naturel/)'
    ];
    
    for (const link of genericLinks) {
      if (selectedLinks.length >= maxLinks) break;
      if (!content.includes(link) && !selectedLinks.includes(link)) {
        selectedLinks.push(link);
      }
    }
  }
  
  return selectedLinks;
}

function addLinksToArticle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      return false;
    }
    
    const [, frontmatter, bodyContent] = frontmatterMatch;
    
    // Compter les liens existants
    const existingLinks = (bodyContent.match(/\[.*?\]\(.*?\)/g) || []).length;
    
    // Si déjà beaucoup de liens, passer
    if (existingLinks >= 6) {
      console.log(`ℹ️  Déjà ${existingLinks} liens: ${path.basename(filePath)}`);
      return false;
    }
    
    // Trouver les meilleurs liens
    const bestLinks = findBestLinks(bodyContent, path.basename(filePath));
    
    if (bestLinks.length === 0) {
      console.log(`❌ Aucun lien pertinent: ${path.basename(filePath)}`);
      return false;
    }
    
    let modifiedContent = bodyContent;
    
    // Stratégie 1: Ajouter des liens contextuels dans le texte
    let linksAdded = 0;
    
    // Chercher des endroits pour ajouter des liens naturellement
    const sentences = modifiedContent.split('. ');
    for (let i = 0; i < sentences.length && linksAdded < 2; i++) {
      const sentence = sentences[i];
      
      // Si la phrase contient des mots-clés, ajouter un lien
      for (const link of bestLinks.slice(0, 2)) {
        const linkText = link.match(/\\[(.*?)\\]/)?.[1];
        if (linkText && sentence.toLowerCase().includes(linkText.split(' ')[0].toLowerCase())) {
          sentences[i] += `. Découvrez ${link}`;
          linksAdded++;
          break;
        }
      }
    }
    
    if (linksAdded > 0) {
      modifiedContent = sentences.join('. ');
    }
    
    // Stratégie 2: Ajouter une section "Articles Connexes"
    const remainingLinks = bestLinks.slice(linksAdded);
    if (remainingLinks.length > 0) {
      const linksList = remainingLinks.map(link => `- ${link}`).join('\n');
      const relatedSection = LINK_TEMPLATES.relatedSection.replace('{links}', linksList);
      
      // Insérer avant FAQ, Conclusion ou à la fin
      if (modifiedContent.includes('## FAQ')) {
        modifiedContent = modifiedContent.replace('## FAQ', relatedSection + '\n\n## FAQ');
      } else if (modifiedContent.includes('## Conclusion')) {
        modifiedContent = modifiedContent.replace('## Conclusion', relatedSection + '\n\n## Conclusion');
      } else {
        modifiedContent += relatedSection;
      }
      
      linksAdded += remainingLinks.length;
    }
    
    // Vérifier si du contenu a été modifié
    if (modifiedContent !== bodyContent) {
      const newContent = `---\n${frontmatter}\n---\n${modifiedContent}`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      const totalLinks = (modifiedContent.match(/\[.*?\]\(.*?\)/g) || []).length;
      console.log(`✅ ${linksAdded} nouveaux liens ajoutés (total: ${totalLinks}): ${path.basename(filePath)}`);
      return linksAdded;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Erreur ${path.basename(filePath)}:`, error.message);
    return 0;
  }
}

function processAllArticles() {
  const contentDir = path.join(__dirname, '../src/content');
  const files = fs.readdirSync(contentDir, { recursive: true });
  
  let processed = 0;
  let modified = 0;
  let totalLinksAdded = 0;
  
  console.log('🔗 AJOUT STRATÉGIQUE DE LIENS INTERNES\n');
  
  // Traiter les fichiers par ordre de priorité
  const priorityFiles = files.filter(file => 
    path.extname(file) === '.md' && 
    (file.includes('ozempic') || file.includes('wegovy') || file.includes('mounjaro'))
  );
  
  const otherFiles = files.filter(file => 
    path.extname(file) === '.md' && 
    !priorityFiles.includes(file)
  );
  
  const allFiles = [...priorityFiles, ...otherFiles];
  
  for (const file of allFiles) {
    const fullPath = path.join(contentDir, file);
    processed++;
    
    console.log(`📄 Traitement (${processed}/119): ${file}`);
    
    const linksAdded = addLinksToArticle(fullPath);
    if (linksAdded > 0) {
      modified++;
      totalLinksAdded += linksAdded;
      console.log(`✅ Succès: +${linksAdded} liens\n`);
    } else {
      console.log(`ℹ️  Aucun lien ajouté\n`);
    }
    
    // Pause courte pour éviter la surcharge
    if (processed % 20 === 0) {
      console.log(`⏳ Progression: ${processed}/119 articles traités...\n`);
    }
  }
  
  console.log(`\n📊 RÉSULTATS FINAUX:`);
  console.log(`   • Articles traités: ${processed}`);
  console.log(`   • Articles modifiés: ${modified}`);
  console.log(`   • Total liens ajoutés: ${totalLinksAdded}`);
  console.log(`   • Moyenne liens/article modifié: ${modified > 0 ? (totalLinksAdded/modified).toFixed(1) : 0}`);
  
  if (totalLinksAdded >= 500) {
    console.log(`\n🎯 OBJECTIF ATTEINT ! ${totalLinksAdded} liens créés`);
  } else if (totalLinksAdded >= 300) {
    console.log(`\n✅ EXCELLENT RÉSULTAT : ${totalLinksAdded} liens créés`);
  } else if (totalLinksAdded >= 100) {
    console.log(`\n👍 BON RÉSULTAT : ${totalLinksAdded} liens créés`);
  } else {
    console.log(`\n⚠️  RÉSULTAT PARTIEL : ${totalLinksAdded} liens créés`);
  }
  
  return { processed, modified, totalLinksAdded };
}

// Exécution
console.log('🚀 GÉNÉRATION STRATÉGIQUE DE LIENS INTERNES');
console.log('📋 Stratégie:');
console.log('   • Liens contextuels basés sur mots-clés');
console.log('   • Section "Articles Connexes" automatique');
console.log('   • Priorité aux articles populaires\n');

const results = processAllArticles();

console.log('\n🎯 IMPACT SEO ATTENDU:');
console.log('   • Amélioration du maillage interne');
console.log('   • Réduction du taux de rebond');
console.log('   • Augmentation du temps sur site');
console.log('   • Meilleur crawl des pages par Google');
