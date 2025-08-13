#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration d'analyse SEO
const SEO_CRITERIA = {
  title: {
    minLength: 30,
    maxLength: 60,
    shouldContain: ['France', '2025', 'GLP-1', 'Ozempic', 'Wegovy', 'Mounjaro']
  },
  metaDescription: {
    minLength: 120,
    maxLength: 160
  },
  h1: {
    shouldMatch: true // H1 doit correspondre au title
  },
  keywords: {
    shouldContainLocal: ['france', 'français', '2025'],
    shouldAvoidGeneric: ['guide', 'complet', 'marché français']
  }
};

function analyzeArticleSEO(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      return { error: 'Pas de frontmatter' };
    }
    
    const [, frontmatter, bodyContent] = frontmatterMatch;
    
    // Extraire les métadonnées
    const title = frontmatter.match(/title:\s*["'](.+?)["']/)?.[1] || '';
    const metaTitle = frontmatter.match(/metaTitle:\s*["'](.+?)["']/)?.[1] || '';
    const description = frontmatter.match(/description:\s*["'](.+?)["']/)?.[1] || '';
    const metaDescription = frontmatter.match(/metaDescription:\s*["'](.+?)["']/)?.[1] || '';
    const keywords = frontmatter.match(/keyword:\s*["']?(.+?)["']?$/m)?.[1] || '';
    
    // Extraire H1
    const h1Match = bodyContent.match(/^# (.+)$/m);
    const h1 = h1Match?.[1] || '';
    
    // Calculer le score SEO
    let score = 0;
    let feedback = [];
    
    // Analyse du titre
    if (title.length >= SEO_CRITERIA.title.minLength && title.length <= SEO_CRITERIA.title.maxLength) {
      score += 15;
    } else {
      feedback.push(`❌ Titre longueur: ${title.length} caractères (recommandé: 30-60)`);
    }
    
    if (SEO_CRITERIA.title.shouldContain.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase()))) {
      score += 10;
    } else {
      feedback.push('❌ Titre manque mots-clés géolocalisés (France, 2025, etc.)');
    }
    
    // Analyse metaTitle
    if (metaTitle) {
      score += 10;
      if (metaTitle.length <= 60) score += 5;
    } else {
      feedback.push('❌ MetaTitle manquant');
    }
    
    // Analyse description
    if (metaDescription) {
      if (metaDescription.length >= SEO_CRITERIA.metaDescription.minLength && 
          metaDescription.length <= SEO_CRITERIA.metaDescription.maxLength) {
        score += 15;
      } else {
        feedback.push(`❌ MetaDescription longueur: ${metaDescription.length} (recommandé: 120-160)`);
      }
    } else {
      feedback.push('❌ MetaDescription manquante');
    }
    
    // Analyse H1
    if (h1) {
      score += 10;
      if (h1.toLowerCase().includes(title.toLowerCase().split(':')[0])) {
        score += 10;
      } else {
        feedback.push('❌ H1 ne correspond pas au titre');
      }
    } else {
      feedback.push('❌ H1 manquant');
    }
    
    // Analyse mots-clés
    if (keywords) {
      score += 5;
      if (SEO_CRITERIA.keywords.shouldContainLocal.some(local => 
        keywords.toLowerCase().includes(local))) {
        score += 10;
      } else {
        feedback.push('❌ Mots-clés manquent ciblage géographique');
      }
    } else {
      feedback.push('❌ Mots-clés manquants');
    }
    
    // Analyse du contenu
    const wordCount = bodyContent.split(/\s+/).length;
    if (wordCount >= 500) {
      score += 15;
    } else {
      feedback.push(`❌ Contenu trop court: ${wordCount} mots (min 500 recommandé)`);
    }
    
    // Liens internes
    const internalLinks = (bodyContent.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    if (internalLinks >= 3) {
      score += 10;
    } else {
      feedback.push(`❌ Peu de liens internes: ${internalLinks} (min 3 recommandé)`);
    }
    
    return {
      fileName: path.basename(filePath),
      title,
      metaTitle,
      description,
      metaDescription,
      keywords,
      h1,
      wordCount,
      internalLinks,
      score,
      feedback,
      category: frontmatter.match(/category:\s*(.+)/)?.[1] || 'Non définie'
    };
    
  } catch (error) {
    return { error: error.message, fileName: path.basename(filePath) };
  }
}

function generateSEOReport(directory) {
  const files = fs.readdirSync(directory, { recursive: true });
  const results = [];
  let totalScore = 0;
  let fileCount = 0;
  
  console.log('🔍 ANALYSE SEO COMPLÈTE DU SITE\n');
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    
    if (path.extname(fullPath) === '.md') {
      const analysis = analyzeArticleSEO(fullPath);
      if (!analysis.error) {
        results.push(analysis);
        totalScore += analysis.score;
        fileCount++;
      }
    }
  }
  
  // Trier par score
  results.sort((a, b) => b.score - a.score);
  
  const averageScore = fileCount > 0 ? (totalScore / fileCount).toFixed(1) : 0;
  
  console.log(`📊 RÉSULTATS GLOBAUX:`);
  console.log(`   • Articles analysés: ${fileCount}`);
  console.log(`   • Score SEO moyen: ${averageScore}/100`);
  console.log(`   • Articles excellents (>80): ${results.filter(r => r.score > 80).length}`);
  console.log(`   • Articles bons (60-80): ${results.filter(r => r.score >= 60 && r.score <= 80).length}`);
  console.log(`   • Articles à améliorer (<60): ${results.filter(r => r.score < 60).length}\n`);
  
  // TOP 10 des meilleurs articles
  console.log('🏆 TOP 10 ARTICLES SEO:');
  results.slice(0, 10).forEach((article, index) => {
    console.log(`   ${index + 1}. ${article.fileName} - Score: ${article.score}/100`);
  });
  
  // Articles nécessitant le plus d'améliorations
  console.log('\n⚠️  ARTICLES À AMÉLIORER EN PRIORITÉ:');
  results.filter(r => r.score < 60).slice(0, 10).forEach((article, index) => {
    console.log(`   ${index + 1}. ${article.fileName} - Score: ${article.score}/100`);
    article.feedback.slice(0, 3).forEach(fb => console.log(`      ${fb}`));
  });
  
  // Analyse par catégorie
  const byCategory = results.reduce((acc, article) => {
    if (!acc[article.category]) acc[article.category] = [];
    acc[article.category].push(article.score);
    return acc;
  }, {});
  
  console.log('\n📈 PERFORMANCE PAR CATÉGORIE:');
  Object.entries(byCategory).forEach(([category, scores]) => {
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    console.log(`   • ${category}: ${avg}/100 (${scores.length} articles)`);
  });
  
  // Génération du rapport JSON
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalArticles: fileCount,
      averageScore: parseFloat(averageScore),
      excellent: results.filter(r => r.score > 80).length,
      good: results.filter(r => r.score >= 60 && r.score <= 80).length,
      needsImprovement: results.filter(r => r.score < 60).length
    },
    topPerformers: results.slice(0, 10),
    needsImprovement: results.filter(r => r.score < 60),
    categoryPerformance: Object.entries(byCategory).map(([category, scores]) => ({
      category,
      averageScore: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
      articleCount: scores.length
    }))
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'seo-analysis-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n💾 Rapport détaillé sauvegardé: seo-analysis-report.json');
  
  return report;
}

// Recommandations basées sur l'analyse
function generateRecommendations(report) {
  console.log('\n🎯 RECOMMANDATIONS STRATÉGIQUES:\n');
  
  if (report.summary.averageScore < 70) {
    console.log('📌 PRIORITÉ HAUTE - Optimisation technique:');
    console.log('   1. Ajouter metaTitle/metaDescription manquants');
    console.log('   2. Optimiser longueur des titres (30-60 caractères)');
    console.log('   3. Enrichir contenu articles courts (<500 mots)');
    console.log('   4. Ajouter liens internes contextuels\n');
  }
  
  const worstCategory = report.categoryPerformance
    .sort((a, b) => a.averageScore - b.averageScore)[0];
  
  if (worstCategory && worstCategory.averageScore < 60) {
    console.log(`📌 CATÉGORIE À PRIORISER: ${worstCategory.category}`);
    console.log(`   Score moyen: ${worstCategory.averageScore}/100`);
    console.log('   Action: Audit approfondi et refonte éditoriale\n');
  }
  
  console.log('📌 MOTS-CLÉS STRATÉGIQUES À INTÉGRER:');
  console.log('   • "France 2025" dans tous les titres');
  console.log('   • Noms des médicaments spécifiques');
  console.log('   • Termes géolocalisés ("en France", "français")');
  console.log('   • Intentions transactionnelles ("prix", "acheter", "avis")\n');
  
  console.log('📌 PROCHAINES ÉTAPES:');
  console.log('   1. Corriger les articles score <60 en priorité');
  console.log('   2. Implémenter monitoring régulier des positions');
  console.log('   3. Tester impact changements sur trafic organique');
  console.log('   4. Adapter stratégie selon résultats');
}

// Exécution
const contentDir = path.join(__dirname, '../src/content');
const report = generateSEOReport(contentDir);
generateRecommendations(report);

console.log('\n✅ ANALYSE SEO TERMINÉE');
