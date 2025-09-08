// Audit SEO simple et efficace
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content');

console.log('🔍 AUDIT SEO COMPLET - GLP1 FRANCE');
console.log('='.repeat(60));

const results = {
  totalFiles: 0,
  analyzed: 0,
  errors: 0,
  seoIssues: [],
  contentIssues: [],
  goodPages: [],
  stats: {
    avgWordCount: 0,
    totalWords: 0,
    shortPages: 0,
    longPages: 0,
    missingMeta: 0,
    goodMeta: 0
  }
};

// Analyse d'un fichier markdown
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(contentDir, filePath);
    
    // Extraire frontmatter avec une regex plus robuste
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      results.errors++;
      return console.log(`❌ ${relativePath}: Pas de frontmatter`);
    }
    
    // Parser le frontmatter manuellement
    const fm = {};
    frontmatterMatch[1].split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        fm[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    });
    
    // Extraire le contenu principal
    const bodyContent = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
    const wordCount = bodyContent.split(/\s+/).filter(w => w.length > 2).length;
    
    // Analyses SEO
    const issues = [];
    const page = { file: relativePath, title: fm.title || 'Sans titre', wordCount, issues: [] };
    
    // Vérifications métadonnées
    if (!fm.title || fm.title.length < 30) {
      issues.push('🔴 Titre trop court ou manquant');
      results.stats.missingMeta++;
    } else if (fm.title.length > 60) {
      issues.push('🟡 Titre trop long (>60 chars)');
    } else {
      results.stats.goodMeta++;
    }
    
    if (!fm.description || fm.description.length < 120) {
      issues.push('🔴 Description trop courte ou manquante');
      results.stats.missingMeta++;
    } else if (fm.description.length > 160) {
      issues.push('🟡 Description trop longue (>160 chars)');
    } else {
      results.stats.goodMeta++;
    }
    
    // Vérifications contenu
    if (wordCount < 400) {
      issues.push(`🔴 Contenu trop court (${wordCount} mots)`);
      results.stats.shortPages++;
    } else if (wordCount > 2000) {
      results.stats.longPages++;
    }
    
    // Vérifications structure
    const h1Count = (bodyContent.match(/^#\s+/gm) || []).length;
    const h2Count = (bodyContent.match(/^##\s+/gm) || []).length;
    
    if (h1Count === 0) {
      issues.push('🔴 Pas de H1 principal');
    }
    if (h2Count < 2) {
      issues.push('🟡 Peu de sous-titres H2');
    }
    
    // Vérifications liens et images
    const imageCount = (bodyContent.match(/!\[.*?\]\(.*?\)/g) || []).length;
    const linkCount = (bodyContent.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    
    if (imageCount === 0) {
      issues.push('🟡 Aucune image');
    }
    if (linkCount < 2) {
      issues.push('🟡 Peu de liens internes');
    }
    
    // Classification
    page.issues = issues;
    page.score = Math.max(0, 100 - (issues.length * 10));
    
    if (issues.length === 0) {
      results.goodPages.push(page);
    } else if (issues.length > 3) {
      results.seoIssues.push(page);
    } else {
      results.contentIssues.push(page);
    }
    
    // Stats globales
    results.stats.totalWords += wordCount;
    results.analyzed++;
    
  } catch (error) {
    results.errors++;
    console.log(`❌ Erreur ${filePath}: ${error.message}`);
  }
}

// Scanner récursivement
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.md')) {
      results.totalFiles++;
      analyzeFile(fullPath);
    }
  });
}

// Exécution principale
function runAudit() {
  console.log('\n📂 Scan des fichiers...');
  scanDir(contentDir);
  
  // Calculs finaux
  results.stats.avgWordCount = Math.round(results.stats.totalWords / results.analyzed);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSULTATS DE L\'AUDIT');
  console.log('='.repeat(60));
  
  console.log(`\n📈 STATISTIQUES GÉNÉRALES:`);
  console.log(`├─ 📄 Fichiers trouvés: ${results.totalFiles}`);
  console.log(`├─ ✅ Fichiers analysés: ${results.analyzed}`);
  console.log(`├─ ❌ Erreurs: ${results.errors}`);
  console.log(`├─ 📝 Mots moyens/page: ${results.stats.avgWordCount}`);
  console.log(`└─ 📊 Total mots: ${results.stats.totalWords.toLocaleString()}`);
  
  console.log(`\n🎯 QUALITÉ SEO:`);
  console.log(`├─ 🏆 Pages excellentes: ${results.goodPages.length}`);
  console.log(`├─ ⚠️  Pages avec problèmes mineurs: ${results.contentIssues.length}`);
  console.log(`├─ 🔴 Pages avec problèmes majeurs: ${results.seoIssues.length}`);
  console.log(`├─ 📏 Pages trop courtes (<400 mots): ${results.stats.shortPages}`);
  console.log(`└─ 📏 Pages très longues (>2000 mots): ${results.stats.longPages}`);
  
  // Score global
  const totalAnalyzed = results.analyzed;
  const criticalIssues = results.seoIssues.length;
  const globalScore = Math.round(((totalAnalyzed - criticalIssues) / totalAnalyzed) * 100);
  
  console.log(`\n🏆 SCORE GLOBAL: ${globalScore}/100`);
  
  if (globalScore >= 90) {
    console.log(`✨ EXCELLENT! Site en très bon état SEO`);
  } else if (globalScore >= 75) {
    console.log(`✅ BON! Quelques optimisations recommandées`);
  } else if (globalScore >= 60) {
    console.log(`⚠️  MOYEN. Améliorations nécessaires`);
  } else {
    console.log(`🔴 CRITIQUE! Optimisations urgentes requises`);
  }
  
  // Top des pages problématiques
  if (results.seoIssues.length > 0) {
    console.log(`\n🔴 PAGES CRITIQUES À CORRIGER (Top 10):`);
    results.seoIssues
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .forEach((page, i) => {
        console.log(`${i + 1}. ${page.file} (Score: ${page.score})`);
        page.issues.slice(0, 2).forEach(issue => console.log(`   ${issue}`));
      });
  }
  
  // Pages courtes
  if (results.stats.shortPages > 0) {
    console.log(`\n📏 CONTENU TROP COURT (${results.stats.shortPages} pages):`);
    const shortPages = [...results.seoIssues, ...results.contentIssues]
      .filter(page => page.wordCount < 400)
      .sort((a, b) => a.wordCount - b.wordCount)
      .slice(0, 10);
    
    shortPages.forEach(page => {
      console.log(`├─ ${page.file}: ${page.wordCount} mots`);
    });
  }
  
  // Pages excellentes
  if (results.goodPages.length > 0) {
    console.log(`\n⭐ PAGES EXCELLENTES (Top 5):`);
    results.goodPages
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 5)
      .forEach(page => {
        console.log(`├─ ${page.file} (${page.wordCount} mots)`);
      });
  }
  
  console.log(`\n💡 RECOMMANDATIONS PRIORITAIRES:`);
  
  if (results.seoIssues.length > 0) {
    console.log(`🔴 1. Corriger ${results.seoIssues.length} pages critiques (métadonnées, contenu)`);
  }
  
  if (results.stats.shortPages > 5) {
    console.log(`📝 2. Enrichir ${results.stats.shortPages} pages trop courtes (min 400 mots)`);
  }
  
  if (results.stats.missingMeta > 10) {
    console.log(`🎯 3. Optimiser les métadonnées (titres, descriptions)`);
  }
  
  console.log(`\n🚀 PROCHAINES ÉTAPES:`);
  console.log(`├─ Corriger les pages critiques identifiées`);
  console.log(`├─ Enrichir le contenu court avec plus de détails`);
  console.log(`├─ Optimiser les métadonnées manquantes`);
  console.log(`└─ Améliorer le maillage interne`);
  
  // Sauvegarder rapport
  const report = {
    timestamp: new Date().toISOString(),
    globalScore,
    stats: results.stats,
    summary: {
      total: results.totalFiles,
      analyzed: results.analyzed,
      excellent: results.goodPages.length,
      critical: results.seoIssues.length,
      minor: results.contentIssues.length
    },
    criticalPages: results.seoIssues.slice(0, 20),
    excellentPages: results.goodPages.slice(0, 10)
  };
  
  const reportPath = path.join(__dirname, '..', 'audit-seo-simple.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Rapport sauvegardé: audit-seo-simple.json`);
  
  console.log('\n' + '='.repeat(60));
}

runAudit();
