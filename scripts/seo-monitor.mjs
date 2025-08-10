#!/usr/bin/env node
/**
 * Script de monitoring SEO automatisé
 * Analyse les performances SEO et génère des rapports
 */

import { getCollection } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';

// === FONCTIONS D'ANALYSE (identiques au dashboard) ===
function countWords(text) {
  if (!text) return 0;
  return text
    .replace(/`{3}[\s\S]*?`{3}/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function countOccurrences(text, keyword) {
  if (!keyword) return 0;
  const escaped = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  return (text.match(regex) || []).length;
}

function countHeadings(md, level) {
  const hashes = '#'.repeat(level);
  const regex = new RegExp(`^${hashes}\\s+.+`, 'gm');
  return (md.match(regex) || []).length;
}

function hasMedicalDisclaimer(md) {
  const disclaimerKeywords = ['avis médical', 'professionnel de santé', 'médecin', 'consultation', 'prescription'];
  return disclaimerKeywords.some(keyword => md.toLowerCase().includes(keyword));
}

function hasInternalLinks(md) {
  const internalLinks = md.match(/\[([^\]]+)\]\(\/[^)]*\)/g) || [];
  return internalLinks.length;
}

// === ANALYSE COMPLÈTE ===
async function analyzeAllContent() {
  const collectionNames = [
    'alternatives-glp1',
    'glp1-perte-de-poids', 
    'effets-secondaires-glp1',
    'glp1-cout',
    'glp1-diabete',
    'medecins-glp1-france',
    'medicaments-glp1',
    'recherche-glp1',
    'regime-glp1'
  ];

  const allEntries = [];
  
  for (const name of collectionNames) {
    try {
      const entries = await getCollection(name);
      allEntries.push(...entries.map(e => ({ ...e, _collection: name })));
    } catch (e) {
      console.warn(`Collection ${name} non trouvée`);
    }
  }

  return allEntries.map(article => {
    const md = article.body || '';
    const text = md.replace(/![^\n]*\n?/g, ' ')
                   .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
                   .replace(/<[^>]+>/g, ' ');

    const wordCount = countWords(text);
    const mainKeyword = article.data.mainKeyword || '';
    
    const mainKeywordCount = countOccurrences(text, mainKeyword);
    const mainKeywordDensity = mainKeyword ? 
      ((mainKeywordCount / Math.max(wordCount, 1)) * 100).toFixed(2) : '0.00';

    // Score SEO simplifié
    let score = 0;
    if (countHeadings(md, 1) === 1) score += 20;
    if (countHeadings(md, 2) >= 3) score += 20;
    if (wordCount >= 1000) score += 20;
    if (parseFloat(mainKeywordDensity) >= 1 && parseFloat(mainKeywordDensity) <= 2) score += 20;
    if (hasMedicalDisclaimer(md)) score += 10;
    if (hasInternalLinks(md) >= 3) score += 10;

    return {
      collection: article._collection,
      slug: article.slug,
      title: article.data.title || 'Sans titre',
      wordCount,
      mainKeyword,
      mainKeywordDensity: parseFloat(mainKeywordDensity),
      h1Count: countHeadings(md, 1),
      h2Count: countHeadings(md, 2),
      hasMedicalDisclaimer: hasMedicalDisclaimer(md),
      internalLinksCount: hasInternalLinks(md),
      seoScore: score,
      isEmpty: wordCount < 200,
      lastAnalyzed: new Date().toISOString()
    };
  });
}

// === GÉNÉRATION DE RAPPORT ===
async function generateReport() {
  console.log('🔍 Analyse SEO en cours...');
  
  const articles = await analyzeAllContent();
  const timestamp = new Date().toISOString();
  
  const report = {
    meta: {
      generatedAt: timestamp,
      totalArticles: articles.length,
      version: '2.0'
    },
    summary: {
      totalArticles: articles.length,
      emptyArticles: articles.filter(a => a.isEmpty).length,
      articlesWithGoodScore: articles.filter(a => a.seoScore >= 70).length,
      averageWordCount: Math.round(articles.reduce((sum, a) => sum + a.wordCount, 0) / articles.length),
      averageSEOScore: Math.round(articles.reduce((sum, a) => sum + a.seoScore, 0) / articles.length),
      articlesWithDisclaimer: articles.filter(a => a.hasMedicalDisclaimer).length
    },
    byCollection: {},
    articles: articles,
    keywords: analyzeKeywords(articles),
    priorities: getPriorityActions(articles)
  };

  // Statistiques par collection
  const collections = [...new Set(articles.map(a => a.collection))];
  collections.forEach(collection => {
    const collectionArticles = articles.filter(a => a.collection === collection);
    report.byCollection[collection] = {
      count: collectionArticles.length,
      emptyCount: collectionArticles.filter(a => a.isEmpty).length,
      avgScore: Math.round(collectionArticles.reduce((sum, a) => sum + a.seoScore, 0) / collectionArticles.length),
      avgWords: Math.round(collectionArticles.reduce((sum, a) => sum + a.wordCount, 0) / collectionArticles.length)
    };
  });

  return report;
}

// === ANALYSE DES MOTS-CLÉS ===
function analyzeKeywords(articles) {
  const keywordMap = new Map();
  
  articles.forEach(article => {
    if (article.mainKeyword) {
      const key = article.mainKeyword.toLowerCase();
      if (!keywordMap.has(key)) {
        keywordMap.set(key, {
          keyword: article.mainKeyword,
          articles: [],
          avgDensity: 0,
          totalUsage: 0
        });
      }
      
      const data = keywordMap.get(key);
      data.articles.push({
        title: article.title,
        slug: article.slug,
        collection: article.collection,
        density: article.mainKeywordDensity,
        score: article.seoScore
      });
    }
  });

  return Array.from(keywordMap.values()).map(data => {
    data.avgDensity = data.articles.reduce((sum, a) => sum + a.density, 0) / data.articles.length;
    data.avgScore = Math.round(data.articles.reduce((sum, a) => sum + a.score, 0) / data.articles.length);
    data.totalUsage = data.articles.length;
    
    // Score d'opportunité
    let opportunity = 50;
    if (data.totalUsage === 1) opportunity += 20;
    if (data.avgDensity >= 1 && data.avgDensity <= 2) opportunity += 20;
    if (data.keyword.split(' ').length >= 3) opportunity += 10;
    
    data.opportunity = Math.min(100, opportunity);
    
    return data;
  }).sort((a, b) => b.opportunity - a.opportunity);
}

// === ACTIONS PRIORITAIRES ===
function getPriorityActions(articles) {
  const actions = [];
  
  // Articles vides
  const emptyArticles = articles.filter(a => a.isEmpty);
  if (emptyArticles.length > 0) {
    actions.push({
      priority: 'CRITICAL',
      action: 'Compléter les articles vides',
      count: emptyArticles.length,
      articles: emptyArticles.slice(0, 5).map(a => `${a.collection}/${a.slug}`)
    });
  }

  // Articles sans disclaimer
  const noDisclaimer = articles.filter(a => !a.hasMedicalDisclaimer && a.wordCount > 200);
  if (noDisclaimer.length > 0) {
    actions.push({
      priority: 'HIGH',
      action: 'Ajouter disclaimers médicaux',
      count: noDisclaimer.length,
      articles: noDisclaimer.slice(0, 5).map(a => `${a.collection}/${a.slug}`)
    });
  }

  // Articles avec mauvais score
  const lowScore = articles.filter(a => a.seoScore < 50 && a.wordCount > 200);
  if (lowScore.length > 0) {
    actions.push({
      priority: 'MEDIUM',
      action: 'Optimiser SEO (score < 50%)',
      count: lowScore.length,
      articles: lowScore.slice(0, 5).map(a => `${a.collection}/${a.slug}`)
    });
  }

  return actions.sort((a, b) => {
    const priorities = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1 };
    return priorities[b.priority] - priorities[a.priority];
  });
}

// === SAUVEGARDE DU RAPPORT ===
async function saveReport(report) {
  const reportsDir = 'reports';
  await fs.mkdir(reportsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `seo-report-${timestamp}.json`;
  const filepath = path.join(reportsDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(report, null, 2), 'utf8');
  
  // Sauvegarde du dernier rapport
  await fs.writeFile(path.join(reportsDir, 'latest-report.json'), JSON.stringify(report, null, 2), 'utf8');
  
  return filepath;
}

// === GÉNÉRATION DE RAPPORT HUMAIN ===
async function generateHumanReport(report) {
  const timestamp = new Date().toLocaleString('fr-FR');
  
  let humanReport = `
# 📊 Rapport SEO - GLP-1 France
**Généré le :** ${timestamp}

## 🎯 Résumé Exécutif
- **Total articles :** ${report.summary.totalArticles}
- **Articles vides :** ${report.summary.emptyArticles} (${((report.summary.emptyArticles / report.summary.totalArticles) * 100).toFixed(1)}%)
- **Score SEO moyen :** ${report.summary.averageSEOScore}%
- **Articles optimisés (≥70%) :** ${report.summary.articlesWithGoodScore}
- **Mots moyens par article :** ${report.summary.averageWordCount}
- **Disclaimers médicaux :** ${report.summary.articlesWithDisclaimer}/${report.summary.totalArticles}

## 📈 Performance par Collection
`;

  Object.entries(report.byCollection).forEach(([collection, stats]) => {
    const status = stats.emptyCount === 0 && stats.avgScore >= 70 ? '✅' : '⚠️';
    humanReport += `- **${collection}** ${status} : ${stats.count} articles, score ${stats.avgScore}%, ${stats.emptyCount} vides\n`;
  });

  humanReport += `\n## 🚨 Actions Prioritaires\n`;
  
  report.priorities.forEach((action, index) => {
    const emoji = action.priority === 'CRITICAL' ? '🚨' : action.priority === 'HIGH' ? '⚠️' : '📋';
    humanReport += `\n### ${emoji} ${action.action}\n`;
    humanReport += `**Priorité :** ${action.priority} | **Articles concernés :** ${action.count}\n`;
    humanReport += `**Exemples :**\n`;
    action.articles.forEach(article => {
      humanReport += `- ${article}\n`;
    });
  });

  humanReport += `\n## 🎯 Top 10 Mots-clés Opportunités\n`;
  
  report.keywords.slice(0, 10).forEach((keyword, index) => {
    humanReport += `${index + 1}. **${keyword.keyword}** - Opportunité: ${keyword.opportunity}% (${keyword.totalUsage} articles, densité moy: ${keyword.avgDensity.toFixed(2)}%)\n`;
  });

  const reportsDir = 'reports';
  const timestamp2 = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `seo-report-${timestamp2}.md`;
  const filepath = path.join(reportsDir, filename);
  
  await fs.writeFile(filepath, humanReport, 'utf8');
  await fs.writeFile(path.join(reportsDir, 'latest-report.md'), humanReport, 'utf8');
  
  return filepath;
}

// === EXECUTION PRINCIPALE ===
async function main() {
  try {
    console.log('🏥 Démarrage du monitoring SEO GLP-1 France');
    
    const report = await generateReport();
    const jsonPath = await saveReport(report);
    const mdPath = await generateHumanReport(report);
    
    console.log('\n📊 RÉSULTATS DU MONITORING');
    console.log('==========================');
    console.log(`📝 Total articles: ${report.summary.totalArticles}`);
    console.log(`🚨 Articles vides: ${report.summary.emptyArticles}`);
    console.log(`📈 Score SEO moyen: ${report.summary.averageSEOScore}%`);
    console.log(`✅ Articles optimisés: ${report.summary.articlesWithGoodScore}/${report.summary.totalArticles}`);
    console.log(`💬 Mots moyens: ${report.summary.averageWordCount}`);
    
    console.log('\n🎯 ACTIONS PRIORITAIRES:');
    report.priorities.forEach(action => {
      console.log(`- ${action.priority}: ${action.action} (${action.count} articles)`);
    });
    
    console.log('\n💾 RAPPORTS GÉNÉRÉS:');
    console.log(`- JSON: ${jsonPath}`);
    console.log(`- Markdown: ${mdPath}`);
    
    // Alertes critiques
    if (report.summary.emptyArticles > 10) {
      console.log('\n🚨 ALERTE: Plus de 10 articles vides détectés!');
    }
    
    if (report.summary.averageSEOScore < 60) {
      console.log('\n⚠️ ATTENTION: Score SEO moyen inférieur à 60%');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du monitoring:', error.message);
    process.exit(1);
  }
}

// Lancement si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeAllContent, generateReport };
