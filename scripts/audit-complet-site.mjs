// Script d'audit complet du site GLP1-France
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');
const contentDir = path.join(srcDir, 'content');

console.log('🔍 AUDIT COMPLET DU SITE GLP1-FRANCE.FR');
console.log('='.repeat(50));

// Métriques d'audit
const auditMetrics = {
  pages: 0,
  articles: 0,
  collections: new Map(),
  seoIssues: [],
  techIssues: [],
  contentIssues: [],
  missingMetadata: [],
  duplicateContent: new Map(),
  shortContent: [],
  missingH1: [],
  missingImages: [],
  brokenLinks: [],
  goodPages: [],
  scores: {
    technical: 0,
    seo: 0,
    content: 0,
    overall: 0
  }
};

// Fonction pour analyser les métadonnées frontmatter
function analyzeMetadata(frontmatter, filePath) {
  const issues = [];
  
  // Vérifications SEO essentielles
  if (!frontmatter.title || frontmatter.title.length < 30) {
    issues.push('🔴 TITRE: Trop court ou manquant (min 30 caractères)');
  }
  if (frontmatter.title && frontmatter.title.length > 60) {
    issues.push('🟡 TITRE: Trop long (max 60 caractères)');
  }
  
  if (!frontmatter.description || frontmatter.description.length < 120) {
    issues.push('🔴 DESCRIPTION: Trop courte ou manquante (min 120 caractères)');
  }
  if (frontmatter.description && frontmatter.description.length > 160) {
    issues.push('🟡 DESCRIPTION: Trop longue (max 160 caractères)');
  }
  
  if (!frontmatter.keywords || frontmatter.keywords.length < 3) {
    issues.push('🔴 KEYWORDS: Insuffisants (min 3)');
  }
  
  if (!frontmatter.featured_image) {
    issues.push('🟡 IMAGE: Image featured manquante');
  }
  
  if (!frontmatter.category) {
    issues.push('🟡 CATEGORIE: Non définie');
  }
  
  if (frontmatter.readingTime && frontmatter.readingTime < 3) {
    issues.push('🟡 LECTURE: Temps trop court (min 3 min)');
  }
  
  return issues;
}

// Fonction pour analyser le contenu
function analyzeContent(content, filePath) {
  const issues = [];
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  
  // Vérifications de contenu
  if (wordCount < 500) {
    issues.push(`🔴 CONTENU: Trop court (${wordCount} mots, min 500)`);
    auditMetrics.shortContent.push({
      file: filePath,
      words: wordCount
    });
  }
  
  // Vérifier la présence de H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (!h1Match) {
    issues.push('🔴 H1: Titre principal manquant');
    auditMetrics.missingH1.push(filePath);
  }
  
  // Vérifier la structure des titres
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;
  
  if (h2Count < 2) {
    issues.push('🟡 STRUCTURE: Peu de sous-titres H2 (min 2 recommandés)');
  }
  
  // Vérifier les images
  const imageCount = (content.match(/!\[.*\]\(.*\)/g) || []).length;
  if (imageCount === 0) {
    issues.push('🟡 IMAGES: Aucune image dans le contenu');
    auditMetrics.missingImages.push(filePath);
  }
  
  // Vérifier les liens internes
  const internalLinkCount = (content.match(/\[.*\]\(\/[^)]*\)/g) || []).length;
  if (internalLinkCount < 3) {
    issues.push('🟡 MAILLAGE: Peu de liens internes (min 3 recommandés)');
  }
  
  // Détecter le contenu dupliqué (phrases répétitives)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const duplicates = new Map();
  sentences.forEach(sentence => {
    const clean = sentence.trim().toLowerCase();
    if (clean.length > 50) {
      if (duplicates.has(clean)) {
        duplicates.set(clean, duplicates.get(clean) + 1);
      } else {
        duplicates.set(clean, 1);
      }
    }
  });
  
  Array.from(duplicates.entries()).forEach(([sentence, count]) => {
    if (count > 1) {
      issues.push(`🟡 DUPLICATION: Phrase répétée ${count} fois`);
    }
  });
  
  return { issues, wordCount, h2Count, h3Count, imageCount, internalLinkCount };
}

// Fonction pour parser le frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const frontmatterText = match[1];
  const frontmatter = {};
  
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      
      // Traitement spécial pour les arrays
      if (key === 'keywords' || key === 'tags') {
        if (value.startsWith('[') && value.endsWith(']')) {
          frontmatter[key] = value.slice(1, -1).split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
        } else {
          frontmatter[key] = [value];
        }
      } else {
        frontmatter[key] = value;
      }
    }
  });
  
  return frontmatter;
}

// Fonction pour analyser un fichier markdown
function analyzeMarkdownFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    if (!frontmatter) {
      auditMetrics.techIssues.push(`🔴 ${filePath}: Frontmatter manquant`);
      return;
    }
    
    // Analyser les métadonnées
    const metadataIssues = analyzeMetadata(frontmatter, filePath);
    
    // Analyser le contenu
    const contentAnalysis = analyzeContent(bodyContent, filePath);
    
    // Collecter les statistiques
    const relativePath = path.relative(contentDir, filePath);
    const collection = path.dirname(relativePath);
    
    if (!auditMetrics.collections.has(collection)) {
      auditMetrics.collections.set(collection, {
        count: 0,
        issues: 0,
        avgWords: 0,
        totalWords: 0
      });
    }
    
    const collectionData = auditMetrics.collections.get(collection);
    collectionData.count++;
    collectionData.totalWords += contentAnalysis.wordCount;
    collectionData.avgWords = Math.round(collectionData.totalWords / collectionData.count);
    
    const totalIssues = metadataIssues.length + contentAnalysis.issues.length;
    collectionData.issues += totalIssues;
    
    // Page analysis summary
    const pageAnalysis = {
      file: relativePath,
      title: frontmatter.title || 'Sans titre',
      collection,
      wordCount: contentAnalysis.wordCount,
      metadataIssues,
      contentIssues: contentAnalysis.issues,
      totalIssues,
      score: Math.max(0, 100 - (totalIssues * 5))
    };
    
    if (totalIssues === 0) {
      auditMetrics.goodPages.push(pageAnalysis);
    } else if (totalIssues > 5) {
      auditMetrics.seoIssues.push(pageAnalysis);
    }
    
    auditMetrics.articles++;
    
  } catch (error) {
    auditMetrics.techIssues.push(`🔴 ERREUR: ${filePath} - ${error.message}`);
  }
}

// Fonction pour scanner récursivement les fichiers
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.md')) {
      analyzeMarkdownFile(filePath);
    }
  }
}

// Fonction pour calculer les scores
function calculateScores() {
  const totalPages = auditMetrics.articles;
  const criticalIssues = auditMetrics.seoIssues.length;
  const minorIssues = auditMetrics.techIssues.length;
  
  // Score technique (build, liens, structure)
  auditMetrics.scores.technical = Math.max(0, 100 - (minorIssues * 2));
  
  // Score SEO (métadonnées, mots-clés, structure)
  auditMetrics.scores.seo = Math.max(0, 100 - (criticalIssues * 5));
  
  // Score contenu (longueur, qualité, maillage)
  const shortContentPenalty = auditMetrics.shortContent.length * 3;
  const missingH1Penalty = auditMetrics.missingH1.length * 5;
  auditMetrics.scores.content = Math.max(0, 100 - shortContentPenalty - missingH1Penalty);
  
  // Score global
  auditMetrics.scores.overall = Math.round(
    (auditMetrics.scores.technical + auditMetrics.scores.seo + auditMetrics.scores.content) / 3
  );
}

// Fonction principale d'audit
async function runCompleteAudit() {
  console.log('\n📂 Analyse du contenu...');
  
  // Scanner tous les fichiers de contenu
  scanDirectory(contentDir);
  
  // Calculer les scores
  calculateScores();
  
  // Générer le rapport
  console.log('\n' + '='.repeat(50));
  console.log('📊 RAPPORT D\'AUDIT COMPLET');
  console.log('='.repeat(50));
  
  console.log(`\n📈 MÉTRIQUES GÉNÉRALES:`);
  console.log(`├─ 📄 Total des pages: ${auditMetrics.articles}`);
  console.log(`├─ 📁 Collections: ${auditMetrics.collections.size}`);
  console.log(`├─ ✅ Pages parfaites: ${auditMetrics.goodPages.length}`);
  console.log(`├─ ⚠️  Pages avec problèmes: ${auditMetrics.seoIssues.length}`);
  console.log(`└─ 🔧 Erreurs techniques: ${auditMetrics.techIssues.length}`);
  
  console.log(`\n🎯 SCORES DE QUALITÉ:`);
  console.log(`├─ 🔧 Score Technique: ${auditMetrics.scores.technical}/100`);
  console.log(`├─ 🎯 Score SEO: ${auditMetrics.scores.seo}/100`);
  console.log(`├─ 📝 Score Contenu: ${auditMetrics.scores.content}/100`);
  console.log(`└─ 🏆 Score Global: ${auditMetrics.scores.overall}/100`);
  
  // Détails par collection
  console.log(`\n📁 ANALYSE PAR COLLECTION:`);
  Array.from(auditMetrics.collections.entries())
    .sort((a, b) => b[1].issues - a[1].issues)
    .forEach(([collection, data]) => {
      const avgIssues = Math.round(data.issues / data.count);
      console.log(`├─ ${collection}: ${data.count} pages, ${data.avgWords} mots/page, ${avgIssues} problèmes/page`);
    });
  
  // Top des problèmes
  if (auditMetrics.seoIssues.length > 0) {
    console.log(`\n🔴 TOP DES PAGES PROBLÉMATIQUES:`);
    auditMetrics.seoIssues
      .sort((a, b) => b.totalIssues - a.totalIssues)
      .slice(0, 10)
      .forEach((page, index) => {
        console.log(`${index + 1}. ${page.file} (${page.totalIssues} problèmes, Score: ${page.score})`);
        page.metadataIssues.concat(page.contentIssues).slice(0, 3).forEach(issue => {
          console.log(`   ${issue}`);
        });
      });
  }
  
  // Contenu court
  if (auditMetrics.shortContent.length > 0) {
    console.log(`\n📏 CONTENU TROP COURT (< 500 mots):`);
    auditMetrics.shortContent
      .sort((a, b) => a.words - b.words)
      .slice(0, 10)
      .forEach(item => {
        const relativePath = path.relative(contentDir, item.file);
        console.log(`├─ ${relativePath}: ${item.words} mots`);
      });
  }
  
  // Recommandations stratégiques
  console.log(`\n💡 RECOMMANDATIONS PRIORITAIRES:`);
  
  if (auditMetrics.scores.technical < 80) {
    console.log(`🔧 TECHNIQUE: Corriger ${auditMetrics.techIssues.length} erreurs techniques`);
  }
  
  if (auditMetrics.scores.seo < 80) {
    console.log(`🎯 SEO: Optimiser les métadonnées de ${auditMetrics.seoIssues.length} pages`);
  }
  
  if (auditMetrics.scores.content < 80) {
    console.log(`📝 CONTENU: Enrichir ${auditMetrics.shortContent.length} pages trop courtes`);
  }
  
  // Pages excellentes à promouvoir
  if (auditMetrics.goodPages.length > 0) {
    console.log(`\n⭐ PAGES EXCELLENTES À PROMOUVOIR:`);
    auditMetrics.goodPages
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 5)
      .forEach(page => {
        console.log(`├─ ${page.file} (${page.wordCount} mots)`);
      });
  }
  
  // Sauvegarder le rapport
  const reportPath = path.join(__dirname, '..', 'audit-complet-rapport.json');
  const detailedReport = {
    timestamp: new Date().toISOString(),
    scores: auditMetrics.scores,
    metrics: {
      totalPages: auditMetrics.articles,
      collections: Array.from(auditMetrics.collections.entries()),
      goodPages: auditMetrics.goodPages.length,
      problematicPages: auditMetrics.seoIssues.length,
      technicalIssues: auditMetrics.techIssues.length
    },
    issues: {
      seoIssues: auditMetrics.seoIssues,
      shortContent: auditMetrics.shortContent,
      missingH1: auditMetrics.missingH1,
      missingImages: auditMetrics.missingImages,
      technicalIssues: auditMetrics.techIssues
    },
    recommendations: generateRecommendations()
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`\n💾 Rapport détaillé sauvegardé: ${reportPath}`);
  
  // Score final
  console.log(`\n${'='.repeat(50)}`);
  if (auditMetrics.scores.overall >= 90) {
    console.log(`🏆 EXCELLENT! Site en très bon état (${auditMetrics.scores.overall}/100)`);
  } else if (auditMetrics.scores.overall >= 75) {
    console.log(`✅ BON! Quelques optimisations recommandées (${auditMetrics.scores.overall}/100)`);
  } else if (auditMetrics.scores.overall >= 60) {
    console.log(`⚠️  MOYEN. Améliorations nécessaires (${auditMetrics.scores.overall}/100)`);
  } else {
    console.log(`🔴 CRITIQUE! Optimisations urgentes requises (${auditMetrics.scores.overall}/100)`);
  }
}

function generateRecommendations() {
  const recommendations = [];
  
  if (auditMetrics.shortContent.length > 10) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Content',
      action: `Enrichir ${auditMetrics.shortContent.length} pages trop courtes`,
      impact: 'SEO et engagement utilisateur'
    });
  }
  
  if (auditMetrics.missingH1.length > 5) {
    recommendations.push({
      priority: 'HIGH',
      category: 'SEO',
      action: `Ajouter des H1 à ${auditMetrics.missingH1.length} pages`,
      impact: 'Structure SEO fondamentale'
    });
  }
  
  if (auditMetrics.seoIssues.length > 20) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'SEO',
      action: `Optimiser les métadonnées de ${auditMetrics.seoIssues.length} pages`,
      impact: 'Visibilité dans les moteurs de recherche'
    });
  }
  
  return recommendations;
}

// Exécution
runCompleteAudit().catch(console.error);
