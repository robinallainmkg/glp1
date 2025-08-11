#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base de données des articles et leurs mots-clés
let articleDatabase = {};

// Stratégies de liens par catégorie
const LINK_STRATEGIES = {
  'medicaments-glp1': {
    targetCategories: ['glp1-perte-de-poids', 'effets-secondaires-glp1', 'glp1-cout'],
    keywordMatches: ['prix', 'avis', 'effets secondaires', 'perte de poids']
  },
  'glp1-perte-de-poids': {
    targetCategories: ['medicaments-glp1', 'regime-glp1', 'alternatives-glp1'],
    keywordMatches: ['médicament', 'ozempic', 'wegovy', 'régime', 'alternatives']
  },
  'effets-secondaires-glp1': {
    targetCategories: ['medicaments-glp1', 'alternatives-glp1'],
    keywordMatches: ['ozempic', 'wegovy', 'mounjaro', 'alternatives', 'traitement']
  },
  'glp1-cout': {
    targetCategories: ['medicaments-glp1', 'glp1-perte-de-poids'],
    keywordMatches: ['prix', 'remboursement', 'pharmacie', 'acheter']
  },
  'alternatives-glp1': {
    targetCategories: ['medicaments-glp1', 'regime-glp1'],
    keywordMatches: ['naturel', 'plantes', 'alternatives', 'sans médicament']
  }
};

// Patterns de liens contextuels
const CONTEXTUAL_PATTERNS = [
  {
    trigger: /ozempic/gi,
    links: [
      { text: 'prix Ozempic', path: '/glp1-perte-de-poids/ozempic-prix/' },
      { text: 'effets secondaires Ozempic', path: '/effets-secondaires-glp1/ozempic-danger/' },
      { text: 'régime Ozempic', path: '/glp1-perte-de-poids/ozempic-regime/' }
    ]
  },
  {
    trigger: /wegovy/gi,
    links: [
      { text: 'prix Wegovy', path: '/glp1-cout/wegovy-prix/' },
      { text: 'dangers Wegovy', path: '/effets-secondaires-glp1/wegovy-danger/' },
      { text: 'acheter Wegovy', path: '/glp1-cout/acheter-wegovy-en-france/' }
    ]
  },
  {
    trigger: /mounjaro/gi,
    links: [
      { text: 'prix Mounjaro', path: '/medicaments-glp1/mounjaro-prix-france/' },
      { text: 'effets secondaires Mounjaro', path: '/medicaments-glp1/mounjaro-effet-secondaire/' },
      { text: 'injection Mounjaro', path: '/medicaments-glp1/mounjaro-injection-pour-maigrir/' }
    ]
  },
  {
    trigger: /glp-?1/gi,
    links: [
      { text: 'médicaments GLP-1', path: '/medicaments-glp1/' },
      { text: 'GLP-1 perte de poids', path: '/glp1-perte-de-poids/glp1-perte-de-poids/' },
      { text: 'alternatives GLP-1', path: '/alternatives-glp1/' }
    ]
  },
  {
    trigger: /diabète/gi,
    links: [
      { text: 'traitement diabète', path: '/medicaments-glp1/traitement-diabete-type-2/' },
      { text: 'GLP-1 diabète', path: '/glp1-diabete/' },
      { text: 'alternatives naturelles diabète', path: '/alternatives-glp1/plantes-diabete/' }
    ]
  }
];

function buildArticleDatabase() {
  const contentDir = path.join(__dirname, '../src/content');
  const files = fs.readdirSync(contentDir, { recursive: true });
  
  for (const file of files) {
    if (path.extname(file) === '.md') {
      const fullPath = path.join(contentDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const title = frontmatter.match(/title:\s*["'](.+?)["']/)?.[1] || '';
        const category = frontmatter.match(/category:\s*["']?(.+?)["']?$/m)?.[1] || '';
        const keywords = frontmatter.match(/keyword:\s*["'](.+?)["']/)?.[1] || '';
        
        // Générer le slug à partir du chemin de fichier
        const relativePath = file.replace('.md', '');
        const slug = '/' + relativePath.replace(/\\/g, '/') + '/';
        
        articleDatabase[file] = {
          title,
          category,
          keywords: keywords.toLowerCase(),
          slug,
          path: fullPath,
          content
        };
      }
    }
  }
  
  console.log(`📚 Base de données créée: ${Object.keys(articleDatabase).length} articles`);
}

function findRelevantLinks(currentFile, currentContent, maxLinks = 6) {
  const currentArticle = articleDatabase[path.basename(currentFile)];
  if (!currentArticle) return [];
  
  const relevantLinks = [];
  const contentLower = currentContent.toLowerCase();
  
  // 1. Liens contextuels basés sur les mots-clés présents
  for (const pattern of CONTEXTUAL_PATTERNS) {
    if (pattern.trigger.test(currentContent)) {
      for (const link of pattern.links) {
        // Vérifier que le lien n'est pas déjà présent
        if (!currentContent.includes(link.path) && !currentContent.includes(link.text)) {
          relevantLinks.push(link);
        }
      }
    }
  }
  
  // 2. Liens stratégiques basés sur la catégorie
  const strategy = LINK_STRATEGIES[currentArticle.category];
  if (strategy) {
    for (const [fileName, article] of Object.entries(articleDatabase)) {
      if (fileName === path.basename(currentFile)) continue;
      
      // Liens vers catégories ciblées
      if (strategy.targetCategories.includes(article.category)) {
        // Vérifier correspondance de mots-clés
        const hasKeywordMatch = strategy.keywordMatches.some(keyword => 
          contentLower.includes(keyword.toLowerCase()) || 
          article.keywords.includes(keyword.toLowerCase())
        );
        
        if (hasKeywordMatch && !currentContent.includes(article.slug)) {
          relevantLinks.push({
            text: article.title,
            path: article.slug,
            relevance: calculateRelevance(currentArticle, article)
          });
        }
      }
    }
  }
  
  // 3. Liens vers articles similaires (même sujet principal)
  const currentMainKeyword = currentArticle.keywords.split(',')[0].trim();
  for (const [fileName, article] of Object.entries(articleDatabase)) {
    if (fileName === path.basename(currentFile)) continue;
    
    if (article.keywords.includes(currentMainKeyword) && 
        !currentContent.includes(article.slug)) {
      relevantLinks.push({
        text: article.title,
        path: article.slug,
        relevance: calculateRelevance(currentArticle, article)
      });
    }
  }
  
  // Trier par pertinence et limiter
  return relevantLinks
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, maxLinks)
    .filter((link, index, arr) => 
      arr.findIndex(l => l.path === link.path) === index
    );
}

function calculateRelevance(article1, article2) {
  let score = 0;
  
  // Même catégorie = plus pertinent
  if (article1.category === article2.category) score += 3;
  
  // Mots-clés communs
  const keywords1 = article1.keywords.split(',').map(k => k.trim().toLowerCase());
  const keywords2 = article2.keywords.split(',').map(k => k.trim().toLowerCase());
  const commonKeywords = keywords1.filter(k => keywords2.includes(k));
  score += commonKeywords.length * 2;
  
  // Articles "featured" sont plus pertinents
  if (article2.content.includes('featured: true')) score += 1;
  
  return score;
}

function insertLinksInContent(content, links) {
  if (links.length === 0) return content;
  
  // Rechercher des emplacements appropriés pour insérer les liens
  const paragraphs = content.split('\n\n');
  let modifiedContent = content;
  let linksAdded = 0;
  
  // 1. Ajouter des liens contextuels dans le texte existant
  for (const link of links.slice(0, 3)) {
    // Chercher des occasions d'ajouter le lien naturellement
    const linkKeywords = link.text.toLowerCase().split(' ');
    const mainKeyword = linkKeywords[0];
    
    // Pattern pour trouver des endroits où insérer le lien
    const contextPatterns = [
      new RegExp(`\\b${mainKeyword}\\b(?!.*\\[)`, 'i'),
      new RegExp(`(traitement|médicament|solution).*${mainKeyword}`, 'i')
    ];
    
    for (const pattern of contextPatterns) {
      if (pattern.test(modifiedContent) && !modifiedContent.includes(link.path)) {
        modifiedContent = modifiedContent.replace(pattern, (match) => {
          linksAdded++;
          return `${match}. Consultez notre guide sur [${link.text}](${link.path})`;
        });
        break;
      }
    }
  }
  
  // 2. Ajouter une section "Articles connexes" si pas assez de liens contextuels
  if (linksAdded < 3 && links.length > 0) {
    const remainingLinks = links.slice(linksAdded, linksAdded + 4);
    const relatedSection = `\n\n## Articles Connexes\n\n${remainingLinks.map(link => 
      `- [${link.text}](${link.path})`
    ).join('\n')}\n`;
    
    // Insérer avant la FAQ ou à la fin
    if (modifiedContent.includes('## FAQ')) {
      modifiedContent = modifiedContent.replace('## FAQ', relatedSection + '\n## FAQ');
    } else if (modifiedContent.includes('## Conclusion')) {
      modifiedContent = modifiedContent.replace('## Conclusion', relatedSection + '\n## Conclusion');
    } else {
      modifiedContent += relatedSection;
    }
    
    linksAdded += remainingLinks.length;
  }
  
  return modifiedContent;
}

function addInternalLinks(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      return false;
    }
    
    const [, frontmatter, bodyContent] = frontmatterMatch;
    
    // Compter les liens existants
    const existingLinks = (bodyContent.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    
    // Si déjà beaucoup de liens, passer
    if (existingLinks >= 8) {
      console.log(`ℹ️  Déjà ${existingLinks} liens: ${path.basename(filePath)}`);
      return false;
    }
    
    // Trouver des liens pertinents
    const relevantLinks = findRelevantLinks(filePath, bodyContent);
    
    if (relevantLinks.length === 0) {
      console.log(`❌ Aucun lien pertinent trouvé: ${path.basename(filePath)}`);
      return false;
    }
    
    // Insérer les liens
    const updatedContent = insertLinksInContent(bodyContent, relevantLinks);
    
    if (updatedContent !== bodyContent) {
      const newFileContent = `---\n${frontmatter}\n---\n${updatedContent}`;
      fs.writeFileSync(filePath, newFileContent, 'utf8');
      
      const newLinks = (updatedContent.match(/\[.*?\]\(\/.*?\)/g) || []).length;
      console.log(`✅ ${newLinks - existingLinks} liens ajoutés (total: ${newLinks}): ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

function processAllFiles() {
  const contentDir = path.join(__dirname, '../src/content');
  const files = fs.readdirSync(contentDir, { recursive: true });
  
  let processed = 0;
  let modified = 0;
  let totalLinksAdded = 0;
  
  console.log('\n🔗 AJOUT MASSIF DE LIENS INTERNES\n');
  
  for (const file of files) {
    if (path.extname(file) === '.md') {
      const fullPath = path.join(contentDir, file);
      processed++;
      
      console.log(`📄 Traitement: ${file}`);
      
      // Compter les liens avant
      const contentBefore = fs.readFileSync(fullPath, 'utf8');
      const linksBefore = (contentBefore.match(/\[.*?\]\(\/.*?\)/g) || []).length;
      
      if (addInternalLinks(fullPath)) {
        modified++;
        
        // Compter les liens après
        const contentAfter = fs.readFileSync(fullPath, 'utf8');
        const linksAfter = (contentAfter.match(/\[.*?\]\(\/.*?\)/g) || []).length;
        const linksAdded = linksAfter - linksBefore;
        totalLinksAdded += linksAdded;
        
        console.log(`✅ Modifié: ${file} (+${linksAdded} liens)\n`);
      } else {
        console.log(`ℹ️  Aucune modification: ${file}\n`);
      }
    }
  }
  
  console.log(`\n📊 RÉSULTATS LIENS INTERNES:`);
  console.log(`   • Fichiers traités: ${processed}`);
  console.log(`   • Fichiers modifiés: ${modified}`);
  console.log(`   • Total liens ajoutés: ${totalLinksAdded}`);
  console.log(`   • Moyenne liens/article: ${(totalLinksAdded/processed).toFixed(1)}`);
  
  if (totalLinksAdded >= 500) {
    console.log(`\n🎯 OBJECTIF ATTEINT : ${totalLinksAdded} liens ajoutés (objectif: 500+)`);
  } else {
    console.log(`\n⚠️  Objectif partiel : ${totalLinksAdded}/500 liens ajoutés`);
  }
}

// Exécution
console.log('🚀 GÉNÉRATION MASSIVE DE LIENS INTERNES\n');
buildArticleDatabase();
processAllFiles();
