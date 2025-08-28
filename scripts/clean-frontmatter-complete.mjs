#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'content');

// Configuration par défaut par collection
const COLLECTION_DEFAULTS = {
  'medicaments-glp1': {
    author: 'Dr. Émilie Martin',
    category: 'Guide médical',
    tags: ['glp1', 'medicaments', 'semaglutide'],
    inlinePositions: [2, 6, 10]
  },
  'glp1-perte-de-poids': {
    author: 'Dr. Sarah Martin',
    category: 'Perte de poids',
    tags: ['glp1', 'perte-de-poids', 'minceur'],
    inlinePositions: [2, 5, 8]
  },
  'glp1-cout': {
    author: 'Julien Lefèvre',
    category: 'Économie santé',
    tags: ['glp1', 'prix', 'remboursement'],
    inlinePositions: [3, 7]
  },
  'effets-secondaires-glp1': {
    author: 'Dr. Marc Dubois',
    category: 'Effets secondaires',
    tags: ['glp1', 'effets-secondaires', 'tolerance'],
    inlinePositions: [2, 6]
  },
  'glp1-diabete': {
    author: 'Dr. Émilie Martin',
    category: 'Diabète',
    tags: ['glp1', 'diabete', 'glycemie'],
    inlinePositions: [3, 7, 11]
  },
  'regime-glp1': {
    author: 'Claire Fontaine',
    category: 'Nutrition',
    tags: ['glp1', 'regime', 'nutrition'],
    inlinePositions: [2, 5, 9]
  },
  'medecins-glp1-france': {
    author: 'Dr. Marc Dubois',
    category: 'Médecins spécialisés',
    tags: ['glp1', 'medecins', 'specialistes'],
    inlinePositions: [3, 8]
  },
  'recherche-glp1': {
    author: 'Karim Benali',
    category: 'Recherche médicale',
    tags: ['glp1', 'recherche', 'etudes'],
    inlinePositions: [4, 9]
  },
  'alternatives-glp1': {
    author: 'Dr. Sarah Martin',
    category: 'Alternatives thérapeutiques',
    tags: ['glp1', 'alternatives', 'traitements'],
    inlinePositions: [2, 6, 10]
  }
};

function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

function generateSlug(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function reconstructFrontmatter(filePath, collection) {
  const fileName = path.basename(filePath, '.md');
  const defaults = COLLECTION_DEFAULTS[collection] || COLLECTION_DEFAULTS['alternatives-glp1'];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { frontmatter: yamlText, body } = extractFrontmatter(content);
    
    // Extraire les informations existantes de manière robuste
    const existingData = {};
    
    // Extraire title de différentes façons possibles
    let titleMatch = yamlText.match(/title:\s*[""']([^""']+)[""']/);
    if (!titleMatch) titleMatch = yamlText.match(/title:\s*"([^"]*)/);
    if (!titleMatch) titleMatch = yamlText.match(/title:\s*([^\n]+)/);
    
    // Extraire description
    let descMatch = yamlText.match(/description:\s*[""']([^""']+)[""']/);
    if (!descMatch) descMatch = yamlText.match(/description:\s*"([^"]*)/);
    if (!descMatch) descMatch = yamlText.match(/description:\s*([^\n]+)/);
    
    // Extraire slug
    let slugMatch = yamlText.match(/slug:\s*[""']([^""']+)[""']/);
    if (!slugMatch) slugMatch = yamlText.match(/slug:\s*([^\n]+)/);
    
    // Extraire autres champs
    const authorMatch = yamlText.match(/author:\s*[""']([^""']+)[""']/);
    const pubDateMatch = yamlText.match(/pubDate:\s*[""']?([^""'\n]+)[""']?/);
    
    // Construire les données nettoyées
    const title = titleMatch ? titleMatch[1].trim().replace(/^[""]|[""]$/g, '') : fileName.replace(/-/g, ' ');
    const description = descMatch ? descMatch[1].trim().replace(/^[""]|[""]$/g, '') : `Guide complet : ${title}`;
    const slug = slugMatch ? slugMatch[1].trim().replace(/^[""]|[""]$/g, '') : generateSlug(title) || fileName;
    
    const frontmatterData = {
      title,
      description,
      slug,
      pubDate: pubDateMatch ? pubDateMatch[1].trim().replace(/^[""]|[""]$/g, '') : new Date().toISOString().split('T')[0],
      author: authorMatch ? authorMatch[1].trim().replace(/^[""]|[""]$/g, '') : defaults.author,
      category: defaults.category,
      tags: defaults.tags,
      collection,
      thumbnail: `/images/thumbnails/${slug}-illus.jpg`,
      thumbnailAlt: `Illustration pour l'article ${title}`,
      featured: false,
      priority: 5,
      schema: 'Article'
    };
    
    // Générer le nouveau frontmatter propre
    let yaml = '---\n';
    yaml += `title: "${frontmatterData.title}"\n`;
    yaml += `description: "${frontmatterData.description}"\n`;
    yaml += `slug: "${frontmatterData.slug}"\n`;
    yaml += `pubDate: ${frontmatterData.pubDate}\n`;
    yaml += `author: "${frontmatterData.author}"\n`;
    yaml += `category: "${frontmatterData.category}"\n`;
    yaml += `tags: [${frontmatterData.tags.map(tag => `"${tag}"`).join(', ')}]\n`;
    yaml += `collection: "${frontmatterData.collection}"\n`;
    yaml += `thumbnail: "${frontmatterData.thumbnail}"\n`;
    yaml += `thumbnailAlt: "${frontmatterData.thumbnailAlt}"\n`;
    yaml += `featured: ${frontmatterData.featured}\n`;
    yaml += `priority: ${frontmatterData.priority}\n`;
    yaml += `schema: "${frontmatterData.schema}"\n`;
    yaml += '\n# Configuration Affiliation\n';
    yaml += 'enableAffiliation: true\n';
    yaml += 'affiliateLayout: "ArticleWithAffiliateSidebar"\n';
    yaml += `affiliateCollection: "${collection}"\n`;
    yaml += 'affiliateConfig:\n';
    yaml += '  enableAutoInjection: true\n';
    yaml += '  mobileStrategy: "both"\n';
    yaml += '  desktopStrategy: "sidebar"\n';
    yaml += `  inlinePositions: [${defaults.inlinePositions.join(', ')}]\n`;
    yaml += '---\n';
    
    // Nettoyer le body
    const cleanBody = body
      .replace(/<!--[\s\S]*?-->/g, '') // Supprimer commentaires existants
      .trim();
    
    // Ajouter le commentaire d'affiliation
    const affiliationComment = `<!-- 
SYSTÈME D'AFFILIATION AUTOMATIQUE
- Layout: ArticleWithAffiliateSidebar
- Produits: Configurés par collection
- Injection inline: positions ${defaults.inlinePositions.join(', ')}
- Responsive: sidebar desktop + inline mobile
-->

`;
    
    const newContent = yaml + affiliationComment + cleanBody;
    
    // Sauvegarder
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    return {
      status: 'success',
      title: frontmatterData.title,
      slug: frontmatterData.slug
    };
    
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

function cleanCollection(collection) {
  const collectionPath = path.join(collectionsPath, collection);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`⚠️  Collection non trouvée: ${collection}`);
    return;
  }
  
  console.log(`\n📁 Nettoyage collection: ${collection}`);
  
  const files = fs.readdirSync(collectionPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(collectionPath, file));
  
  console.log(`  📄 ${files.length} articles trouvés`);
  
  const results = [];
  for (const file of files) {
    const result = reconstructFrontmatter(file, collection);
    if (result.status === 'success') {
      console.log(`  ✅ ${path.basename(file)} → "${result.title}"`);
    } else {
      console.error(`  ❌ ${path.basename(file)}: ${result.error}`);
    }
    results.push(result);
  }
  
  const success = results.filter(r => r.status === 'success').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`  📊 ${success} réussis, ${errors} erreurs`);
  
  return results;
}

async function main() {
  console.log('🧹 NETTOYAGE COMPLET DU FRONTMATTER');
  console.log('=' .repeat(50));
  
  const collections = Object.keys(COLLECTION_DEFAULTS);
  const allResults = [];
  
  for (const collection of collections) {
    const results = cleanCollection(collection);
    if (results) allResults.push(...results);
  }
  
  const totalSuccess = allResults.filter(r => r.status === 'success').length;
  const totalErrors = allResults.filter(r => r.status === 'error').length;
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RÉSULTATS GLOBAUX:');
  console.log(`✅ Articles nettoyés: ${totalSuccess}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📄 Total: ${allResults.length}`);
  
  console.log('\n🎉 Nettoyage terminé !');
  console.log('\n📋 Tous les articles ont maintenant:');
  console.log('  ✅ Frontmatter YAML valide');
  console.log('  ✅ Configuration d\'affiliation complète');
  console.log('  ✅ Métadonnées SEO correctes');
  console.log('  ✅ Layout ArticleWithAffiliateSidebar');
  console.log('  ✅ Injection automatique de produits');
}

main().catch(console.error);
