#!/usr/bin/env node

import SEOAnalyzer from './seo-analyzer.mjs';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Script d'exécution de l'analyse SEO
 * Usage: node run-seo-analysis.mjs [options]
 */

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function displayHeader() {
  console.log(colorize('\n🔍 ANALYSEUR SEO AUTOMATIQUE - GLP1 FRANCE', 'cyan'));
  console.log(colorize('='.repeat(50), 'blue'));
}

function displaySummary(summary) {
  console.log(colorize('\n📊 RÉSUMÉ GLOBAL', 'yellow'));
  console.log(colorize('-'.repeat(30), 'yellow'));
  console.log(`📄 Total des articles: ${colorize(summary.totalArticles, 'bright')}`);
  console.log(`⭐ Score moyen: ${colorize(summary.averageScore + '/100', 'bright')}`);
  
  console.log('\n📈 Distribution des scores:');
  console.log(`  ${colorize('🟢 Excellent (80+)', 'green')}: ${summary.distribution.excellent} articles`);
  console.log(`  ${colorize('🔵 Bon (60-79)', 'blue')}: ${summary.distribution.good} articles`);
  console.log(`  ${colorize('🟡 Moyen (40-59)', 'yellow')}: ${summary.distribution.average} articles`);
  console.log(`  ${colorize('🔴 Faible (<40)', 'red')}: ${summary.distribution.poor} articles`);
}

function displayGlobalRecommendations(recommendations) {
  if (recommendations.length === 0) {
    console.log(colorize('\n✅ Aucune recommandation globale - Excellent travail!', 'green'));
    return;
  }

  console.log(colorize('\n🎯 RECOMMANDATIONS GLOBALES', 'magenta'));
  console.log(colorize('-'.repeat(30), 'magenta'));
  
  recommendations.forEach((rec, index) => {
    const priorityColor = rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue';
    console.log(`\n${index + 1}. ${colorize(rec.title, 'bright')} ${colorize(`[${rec.priority.toUpperCase()}]`, priorityColor)}`);
    console.log(`   📊 ${rec.count} articles concernés`);
    console.log(`   📝 ${rec.description}`);
    console.log(`   🎯 ${colorize(rec.action, 'cyan')}`);
  });
}

function displayPriorityActions(actions) {
  if (actions.length === 0) return;

  console.log(colorize('\n🚨 ACTIONS PRIORITAIRES', 'red'));
  console.log(colorize('-'.repeat(30), 'red'));
  console.log('Les 10 articles nécessitant le plus d\'attention:\n');
  
  actions.slice(0, 10).forEach(action => {
    const scoreColor = action.score >= 60 ? 'yellow' : 'red';
    console.log(`${colorize(`#${action.rank}`, 'bright')} ${colorize(action.score + '/100', scoreColor)} - ${action.title}`);
    console.log(`    🔗 /${action.slug}`);
    console.log(`    ⚠️  ${action.topIssue}`);
    console.log(`    🎯 ${colorize(action.action, 'cyan')}\n`);
  });
}

function displayDetailedResults(articles, showAll = false) {
  const articlesToShow = showAll ? articles : articles.filter(a => a.seoAnalysis.totalScore < 60);
  
  if (articlesToShow.length === 0) {
    console.log(colorize('\n✅ Tous les articles ont un score SEO satisfaisant!', 'green'));
    return;
  }

  console.log(colorize(`\n📋 DÉTAILS ${showAll ? 'COMPLETS' : 'DES ARTICLES À AMÉLIORER'}`, 'blue'));
  console.log(colorize('-'.repeat(40), 'blue'));
  
  articlesToShow.forEach((article, index) => {
    const analysis = article.seoAnalysis;
    const scoreColor = analysis.totalScore >= 80 ? 'green' : 
                      analysis.totalScore >= 60 ? 'blue' : 
                      analysis.totalScore >= 40 ? 'yellow' : 'red';
    
    console.log(`\n${index + 1}. ${colorize(article.title, 'bright')}`);
    console.log(`   Score global: ${colorize(analysis.totalScore + '/100', scoreColor)}`);
    console.log(`   URL: /${article.slug}`);
    
    // Détail des scores
    console.log('   Détail:');
    Object.entries(analysis.scores).forEach(([category, result]) => {
      const statusIcon = result.status === 'excellent' ? '🟢' : 
                        result.status === 'good' ? '🔵' : 
                        result.status === 'average' ? '🟡' : '🔴';
      console.log(`     ${statusIcon} ${category}: ${result.score}/${result.maxScore} - ${result.message}`);
    });
    
    // Recommandations
    if (analysis.recommendations.length > 0) {
      console.log('   Recommandations:');
      analysis.recommendations.forEach(rec => {
        const priorityIcon = rec.priority === 'high' ? '🚨' : '⚠️';
        console.log(`     ${priorityIcon} ${rec.action}`);
      });
    }
  });
}

async function saveReport(analysis, outputFile) {
  try {
    fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));
    console.log(colorize(`\n💾 Rapport sauvegardé: ${outputFile}`, 'green'));
  } catch (error) {
    console.error(colorize(`❌ Erreur sauvegarde: ${error.message}`, 'red'));
  }
}

async function main() {
  try {
    displayHeader();
    
    // Parse arguments
    const args = process.argv.slice(2);
    const showAll = args.includes('--all') || args.includes('-a');
    const saveToFile = args.includes('--save') || args.includes('-s');
    const quiet = args.includes('--quiet') || args.includes('-q');

    if (!quiet) {
      console.log('🚀 Démarrage de l\'analyse...\n');
    }

    // Initialiser l'analyseur
    const analyzer = new SEOAnalyzer();
    
    // Exécuter l'analyse
    const analysis = await analyzer.analyzeBulk();
    
    if (!quiet) {
      console.log(colorize('✅ Analyse terminée!', 'green'));
      
      // Afficher les résultats
      displaySummary(analysis.summary);
      displayGlobalRecommendations(analysis.globalRecommendations);
      displayPriorityActions(analysis.priorityActions);
      displayDetailedResults(analysis.articles, showAll);
    }

    // Sauvegarder si demandé
    if (saveToFile) {
      const timestamp = new Date().toISOString().split('T')[0];
      const outputFile = `reports/seo-analysis-${timestamp}.json`;
      
      // Créer le dossier reports s'il n'existe pas
      if (!fs.existsSync('reports')) {
        fs.mkdirSync('reports');
      }
      
      await saveReport(analysis, outputFile);
    }

    // Messages de fin
    if (!quiet) {
      console.log(colorize('\n🎯 PROCHAINES ÉTAPES RECOMMANDÉES:', 'cyan'));
      console.log('1. Commencez par les articles avec les scores les plus faibles');
      console.log('2. Concentrez-vous sur les problèmes "high priority"');
      console.log('3. Utilisez le dashboard admin pour éditer les articles');
      console.log('4. Relancez l\'analyse après vos modifications');
      
      console.log(colorize('\n📖 USAGE AVANCÉ:', 'blue'));
      console.log('  --all     Afficher tous les articles (pas seulement ceux à améliorer)');
      console.log('  --save    Sauvegarder le rapport en JSON');
      console.log('  --quiet   Mode silencieux (pour intégration)');
    }

    return analysis;

  } catch (error) {
    console.error(colorize(`❌ Erreur lors de l'analyse: ${error.message}`, 'red'));
    if (error.stack) {
      console.error(colorize(error.stack, 'red'));
    }
    process.exit(1);
  }
}

// Exporter pour utilisation dans d'autres scripts
export { main as runSEOAnalysis };

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
