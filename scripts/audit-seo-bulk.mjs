// 🔍 AUDIT SEO MASSIF - Analyse de tous les articles
// Usage: node scripts/audit-seo-bulk.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONTENT_DIR = path.join(__dirname, '../src/content');
const OUTPUT_FILE = path.join(__dirname, '../audit-seo-results.json');

console.log('🔍 Début de l\'audit SEO massif...');
console.log('Répertoire analysé:', CONTENT_DIR);

// Fonctions d'analyse
function countHeadings(content, level) {
  const regex = new RegExp(`^#{${level}}\\s+`, 'gm');
  return (content.match(regex) || []).length;
}

function extractTitle(content) {
  const titleMatch = content.match(/^title:\s*["']([^"']+)["']/m);
  return titleMatch ? titleMatch[1] : '';
}

function extractMainKeyword(content) {
  const keywordMatch = content.match(/^mainKeyword:\s*["']([^"']+)["']/m);
  return keywordMatch ? keywordMatch[1] : '';
}

function countWords(content) {
  const bodyStart = content.indexOf('---', content.indexOf('---') + 1) + 3;
  if (bodyStart < 3) return 0;
  const body = content.substring(bodyStart);
  return body.split(/\s+/).filter(word => word.length > 0).length;
}

function countInternalLinks(content) {
  const internalLinks = content.match(/\[([^\]]+)\]\(\/[^)]*\)/g) || [];
  return internalLinks.length;
}

function hasArticlesSimilaires(content) {
  return content.includes('## Articles similaires') || content.includes('## Ressources complémentaires');
}

function hasMedicalDisclaimer(content) {
  return content.includes('**Important :**') || 
         content.includes('avis médical') || 
         content.includes('professionnel de santé');
}

function calculateSEOScore(analysis) {
  let score = 0;
  
  // Structure (35 points)
  if (analysis.h1Count === 1) score += 10;
  if (analysis.h2Count >= 3) score += 10;
  if (analysis.h2Count <= 8) score += 5;
  if (analysis.h3Count >= 2) score += 5;
  if (analysis.h1Count === 1 && analysis.h2Count >= 3) score += 5;
  
  // Contenu (35 points)
  if (analysis.wordCount >= 1000) score += 15;
  else if (analysis.wordCount >= 500) score += 10;
  else if (analysis.wordCount >= 200) score += 5;
  
  if (analysis.keywordDensity >= 1 && analysis.keywordDensity <= 2.5) score += 15;
  else if (analysis.keywordDensity > 0) score += 8;
  
  if (analysis.hasMedicalDisclaimer) score += 5;
  
  // Liens internes (20 points)
  if (analysis.internalLinks >= 5 && analysis.internalLinks <= 15) score += 15;
  else if (analysis.internalLinks >= 3) score += 10;
  else if (analysis.internalLinks >= 1) score += 5;
  
  if (analysis.hasArticlesSimilaires) score += 5;
  
  // Bonus qualité (10 points)
  if (analysis.wordCount >= 1500) score += 3;
  if (analysis.title.length >= 40 && analysis.title.length <= 60) score += 2;
  if (analysis.mainKeyword && analysis.title.toLowerCase().includes(analysis.mainKeyword.toLowerCase())) score += 3;
  if (analysis.h2Count >= 5) score += 2;
  
  return Math.min(score, 100);
}

// Fonction principale d'audit
async function auditAllArticles() {
  try {
    const collections = fs.readdirSync(CONTENT_DIR);
    const results = {
      totalArticles: 0,
      auditDate: new Date().toISOString(),
      summary: {
        avgScore: 0,
        criticalIssues: 0,
        needsOptimization: 0,
        wellOptimized: 0
      },
      articles: [],
      collections: {}
    };

    for (const collection of collections) {
      const collectionPath = path.join(CONTENT_DIR, collection);
      if (!fs.statSync(collectionPath).isDirectory()) continue;

      console.log(`📁 Analyse de la collection: ${collection}`);
      
      const collectionStats = {
        total: 0,
        avgScore: 0,
        scores: []
      };

      const files = fs.readdirSync(collectionPath);
      
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        
        const filePath = path.join(collectionPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const slug = file.replace('.md', '');
        
        console.log(`  📄 ${slug}`);
        
        // Extraction des données de base
        const title = extractTitle(content);
        const mainKeyword = extractMainKeyword(content);
        const wordCount = countWords(content);
        const h1Count = countHeadings(content, 1);
        const h2Count = countHeadings(content, 2);
        const h3Count = countHeadings(content, 3);
        const internalLinks = countInternalLinks(content);
        const hasArticlesSim = hasArticlesSimilaires(content);
        const hasMedDisc = hasMedicalDisclaimer(content);
        const isEmpty = wordCount < 100;
        
        // Calcul densité mot-clé
        let keywordDensity = 0;
        if (mainKeyword && wordCount > 0) {
          const text = content.toLowerCase();
          const keywordLower = mainKeyword.toLowerCase();
          const occurrences = (text.match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          keywordDensity = ((occurrences / wordCount) * 100);
        }
        
        // Analyse complète
        const analysis = {
          collection,
          slug,
          title,
          mainKeyword,
          wordCount,
          keywordDensity: parseFloat(keywordDensity.toFixed(2)),
          h1Count,
          h2Count,
          h3Count,
          internalLinks,
          hasArticlesSimilaires: hasArticlesSim,
          hasMedicalDisclaimer: hasMedDisc,
          isEmpty
        };
        
        analysis.seoScore = calculateSEOScore(analysis);
        analysis.priority = isEmpty ? 'CRITIQUE' : 
                           analysis.seoScore < 40 ? 'HAUTE' :
                           analysis.seoScore < 70 ? 'MOYENNE' : 'FAIBLE';
        
        results.articles.push(analysis);
        collectionStats.total++;
        collectionStats.scores.push(analysis.seoScore);
        results.totalArticles++;
      }
      
      collectionStats.avgScore = collectionStats.scores.length > 0 ? 
        (collectionStats.scores.reduce((a, b) => a + b, 0) / collectionStats.scores.length).toFixed(1) : 0;
      
      results.collections[collection] = collectionStats;
      console.log(`  ✅ ${collectionStats.total} articles - Score moyen: ${collectionStats.avgScore}/100\n`);
    }

    // Calcul des statistiques globales
    const allScores = results.articles.map(a => a.seoScore);
    results.summary.avgScore = (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1);
    results.summary.criticalIssues = results.articles.filter(a => a.priority === 'CRITIQUE').length;
    results.summary.needsOptimization = results.articles.filter(a => a.seoScore < 70).length;
    results.summary.wellOptimized = results.articles.filter(a => a.seoScore >= 70).length;

    // Tri par priorité et score
    results.articles.sort((a, b) => {
      const priorityOrder = { 'CRITIQUE': 0, 'HAUTE': 1, 'MOYENNE': 2, 'FAIBLE': 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.seoScore - b.seoScore;
    });

    // Sauvegarde des résultats
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    
    console.log('📊 RÉSULTATS DE L\'AUDIT SEO MASSIF');
    console.log('=====================================');
    console.log(`📚 Total articles analysés: ${results.totalArticles}`);
    console.log(`📈 Score SEO moyen: ${results.summary.avgScore}/100`);
    console.log(`🔴 Articles critiques: ${results.summary.criticalIssues}`);
    console.log(`🟡 Articles à optimiser: ${results.summary.needsOptimization}`);
    console.log(`🟢 Articles bien optimisés: ${results.summary.wellOptimized}`);
    console.log(`\n💾 Résultats sauvegardés: ${OUTPUT_FILE}`);
    
    // Top articles les plus problématiques
    console.log('\n🔥 TOP 10 ARTICLES LES PLUS PROBLÉMATIQUES:');
    results.articles
      .slice(0, 10)
      .forEach((article, index) => {
        console.log(`${index + 1}. ${article.collection}/${article.slug} - Score: ${article.seoScore}/100 (${article.priority})`);
      });

    return results;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Exécution
auditAllArticles().catch(console.error);
