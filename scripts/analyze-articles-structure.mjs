#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'content');
const collections = [
  'medicaments-glp1',
  'glp1-perte-de-poids', 
  'glp1-cout',
  'glp1-diabete',
  'effets-secondaires-glp1',
  'medecins-glp1-france',
  'recherche-glp1',
  'regime-glp1',
  'alternatives-glp1'
];

// Champs requis pour un article standard
const REQUIRED_FIELDS = [
  'title', 'description', 'slug', 'pubDate', 'author', 'category', 
  'tags', 'collection', 'thumbnail', 'schema'
];

// Champs d'affiliation optionnels mais recommandés
const AFFILIATE_FIELDS = [
  'enableAffiliation', 'affiliateLayout', 'affiliateCollection', 'affiliateConfig'
];

function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

function parseFrontmatter(yamlText) {
  const frontmatter = {};
  const lines = yamlText.split('\n');
  let currentKey = null;
  let arrayItems = [];
  let inArray = false;
  let inObject = false;
  let objectDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Gestion des objets imbriqués
    if (trimmed.endsWith(':') && !trimmed.includes('[')) {
      if (inObject) objectDepth++;
      else if (line.match(/^\w/)) {
        inObject = true;
        objectDepth = 0;
      }
      currentKey = trimmed.replace(':', '').trim();
      continue;
    }

    if (inObject && line.match(/^\s{2,}\w/)) {
      // Propriété d'objet
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const subKey = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
        
        if (!frontmatter[currentKey]) frontmatter[currentKey] = {};
        frontmatter[currentKey][subKey] = value;
      }
      continue;
    }

    if (trimmed === ']' && inArray) {
      frontmatter[currentKey] = arrayItems;
      arrayItems = [];
      inArray = false;
      continue;
    }

    if (inArray) {
      const item = trimmed.replace(/^-\s*/, '').replace(/^["']|["']$/g, '');
      if (item) arrayItems.push(item);
      continue;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      currentKey = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      
      if (value === '' || value === '[]') {
        inArray = true;
        arrayItems = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          frontmatter[currentKey] = JSON.parse(value);
        } catch {
          frontmatter[currentKey] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      } else {
        frontmatter[currentKey] = value.replace(/^["']|["']$/g, '');
      }
      
      inObject = false;
    }
  }

  if (currentKey && inArray) {
    frontmatter[currentKey] = arrayItems;
  }

  return frontmatter;
}

function analyzeArticle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { frontmatter: yamlText, body } = extractFrontmatter(content);
    const frontmatter = parseFrontmatter(yamlText);
    
    const analysis = {
      file: path.basename(filePath),
      path: filePath,
      hasValidFrontmatter: !!yamlText,
      frontmatter,
      issues: [],
      warnings: [],
      hasAffiliation: false,
      layout: 'default'
    };

    // Vérifier les champs requis
    const missingFields = REQUIRED_FIELDS.filter(field => !frontmatter[field]);
    if (missingFields.length > 0) {
      analysis.issues.push(`Champs manquants: ${missingFields.join(', ')}`);
    }

    // Vérifier l'affiliation
    if (frontmatter.enableAffiliation) {
      analysis.hasAffiliation = true;
      analysis.layout = frontmatter.affiliateLayout || 'ArticleWithAffiliateSidebar';
      
      // Vérifier la config d'affiliation
      if (!frontmatter.affiliateConfig) {
        analysis.warnings.push('Configuration d\'affiliation manquante');
      } else {
        const config = frontmatter.affiliateConfig;
        if (!config.inlinePositions) {
          analysis.warnings.push('Positions d\'injection inline non définies');
        }
        if (!config.mobileStrategy) {
          analysis.warnings.push('Stratégie mobile non définie');
        }
      }
    } else {
      analysis.warnings.push('Affiliation non activée');
    }

    // Analyser le contenu
    const wordCount = body.split(/\s+/).length;
    const headingCount = (body.match(/^#{1,6}\s/gm) || []).length;
    const linkCount = (body.match(/\[.*?\]\(.*?\)/g) || []).length;
    
    analysis.content = {
      wordCount,
      headingCount,
      linkCount,
      hasAffiliatePlaceholders: body.includes('[affiliate-box]') || body.includes('<!-- affiliate'),
      estimatedReadingTime: Math.ceil(wordCount / 200)
    };

    // Vérifications de qualité
    if (wordCount < 300) {
      analysis.issues.push('Article trop court (moins de 300 mots)');
    }
    if (headingCount < 3) {
      analysis.warnings.push('Peu de sections (moins de 3 titres)');
    }
    if (!frontmatter.thumbnail || !fs.existsSync(path.join(__dirname, '..', 'public', frontmatter.thumbnail))) {
      analysis.warnings.push('Image thumbnail manquante');
    }

    return analysis;

  } catch (error) {
    return {
      file: path.basename(filePath),
      path: filePath,
      issues: [`Erreur de lecture: ${error.message}`],
      warnings: [],
      hasValidFrontmatter: false,
      hasAffiliation: false
    };
  }
}

function analyzeCollection(collection) {
  const collectionPath = path.join(collectionsPath, collection);
  
  if (!fs.existsSync(collectionPath)) {
    return { collection, error: 'Collection non trouvée', articles: [] };
  }
  
  const files = fs.readdirSync(collectionPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(collectionPath, file));
  
  const articles = files.map(analyzeArticle);
  
  // Statistiques de la collection
  const stats = {
    total: articles.length,
    withAffiliation: articles.filter(a => a.hasAffiliation).length,
    withIssues: articles.filter(a => a.issues && a.issues.length > 0).length,
    withWarnings: articles.filter(a => a.warnings && a.warnings.length > 0).length,
    layouts: [...new Set(articles.map(a => a.layout))],
    avgWordCount: articles.reduce((sum, a) => sum + (a.content?.wordCount || 0), 0) / articles.length
  };
  
  return { collection, articles, stats };
}

function generateReport(results) {
  console.log('📊 RAPPORT D\'ANALYSE DES ARTICLES');
  console.log('=' .repeat(60));
  
  let totalArticles = 0;
  let totalWithAffiliation = 0;
  let totalIssues = 0;
  
  for (const result of results) {
    if (result.error) {
      console.log(`\n❌ ${result.collection}: ${result.error}`);
      continue;
    }
    
    const { collection, articles, stats } = result;
    totalArticles += stats.total;
    totalWithAffiliation += stats.withAffiliation;
    totalIssues += stats.withIssues;
    
    console.log(`\n📁 Collection: ${collection}`);
    console.log(`   📄 Articles: ${stats.total}`);
    console.log(`   🎯 Avec affiliation: ${stats.withAffiliation}/${stats.total} (${Math.round(stats.withAffiliation/stats.total*100)}%)`);
    console.log(`   ⚠️  Avec problèmes: ${stats.withIssues}`);
    console.log(`   📝 Mots moyen: ${Math.round(stats.avgWordCount)}`);
    console.log(`   🎨 Layouts: ${stats.layouts.join(', ')}`);
    
    // Articles problématiques
    const problemArticles = articles.filter(a => a.issues && a.issues.length > 0);
    if (problemArticles.length > 0) {
      console.log('\n   ❌ Articles avec problèmes:');
      problemArticles.forEach(article => {
        console.log(`      • ${article.file}: ${article.issues.join('; ')}`);
      });
    }
    
    // Articles sans affiliation
    const noAffiliationArticles = articles.filter(a => !a.hasAffiliation);
    if (noAffiliationArticles.length > 0) {
      console.log('\n   🔄 Articles sans affiliation:');
      noAffiliationArticles.slice(0, 5).forEach(article => {
        console.log(`      • ${article.file}`);
      });
      if (noAffiliationArticles.length > 5) {
        console.log(`      ... et ${noAffiliationArticles.length - 5} autres`);
      }
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📈 RÉSUMÉ GLOBAL:');
  console.log(`📄 Total articles: ${totalArticles}`);
  console.log(`🎯 Avec affiliation: ${totalWithAffiliation}/${totalArticles} (${Math.round(totalWithAffiliation/totalArticles*100)}%)`);
  console.log(`❌ Avec problèmes: ${totalIssues}`);
  console.log(`✅ Taux de qualité: ${Math.round((totalArticles - totalIssues)/totalArticles*100)}%`);
  
  const affiliationCoverage = totalWithAffiliation / totalArticles * 100;
  if (affiliationCoverage < 50) {
    console.log('\n🚨 RECOMMANDATION: Exécuter le script de déploiement d\'affiliation');
    console.log('   node scripts/deploy-affiliate-system.mjs');
  } else if (affiliationCoverage < 90) {
    console.log('\n⚠️  RECOMMANDATION: Finaliser la migration d\'affiliation sur les articles restants');
  } else {
    console.log('\n🎉 EXCELLENT: La plupart des articles ont l\'affiliation activée!');
  }
}

async function main() {
  console.log('🔍 ANALYSE DE LA STRUCTURE DES ARTICLES\n');
  
  const results = [];
  
  for (const collection of collections) {
    console.log(`Analyse de ${collection}...`);
    const result = analyzeCollection(collection);
    results.push(result);
  }
  
  console.log('\n');
  generateReport(results);
  
  // Export optionnel des résultats
  if (process.argv.includes('--export')) {
    const exportPath = path.join(__dirname, '..', 'docs', 'article-analysis.json');
    fs.writeFileSync(exportPath, JSON.stringify(results, null, 2));
    console.log(`\n📁 Résultats exportés: ${exportPath}`);
  }
}

main().catch(console.error);
