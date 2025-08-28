#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'content');

const REQUIRED_FIELDS = [
  'title',
  'description', 
  'slug',
  'pubDate',
  'author',
  'category',
  'tags',
  'collection',
  'thumbnail',
  'thumbnailAlt',
  'featured',
  'priority',
  'schema'
];

function validateFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraire le frontmatter
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) {
      return { status: 'error', error: 'No frontmatter found' };
    }
    
    const frontmatter = frontmatterMatch[1];
    const missingFields = [];
    const invalidFields = [];
    
    // Vérifier chaque champ requis
    for (const field of REQUIRED_FIELDS) {
      const fieldRegex = new RegExp(`${field}:\\s*(.+)`, 'i');
      const match = frontmatter.match(fieldRegex);
      
      if (!match) {
        missingFields.push(field);
      } else {
        const value = match[1].trim();
        
        // Vérifications spécifiques
        if (field === 'title' || field === 'description') {
          // Doit être entre guillemets et non vide
          if (!value.match(/^"[^"]+"/)) {
            invalidFields.push(`${field}: doit être entre guillemets et non vide`);
          }
        } else if (field === 'tags') {
          // Doit être un array
          if (!value.match(/^\[.*\]/)) {
            invalidFields.push(`${field}: doit être un array`);
          }
        }
      }
    }
    
    // Vérifier la configuration d'affiliation
    const hasAffiliateConfig = frontmatter.includes('enableAffiliation: true') &&
                              frontmatter.includes('affiliateLayout: "ArticleWithAffiliateSidebar"') &&
                              frontmatter.includes('affiliateConfig:');
    
    if (!hasAffiliateConfig) {
      invalidFields.push('Configuration d\'affiliation incomplète');
    }
    
    if (missingFields.length === 0 && invalidFields.length === 0) {
      return { status: 'valid' };
    } else {
      return {
        status: 'invalid',
        missingFields,
        invalidFields
      };
    }
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function validateCollection(collection) {
  const collectionPath = path.join(collectionsPath, collection);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`⚠️  Collection non trouvée: ${collection}`);
    return;
  }
  
  console.log(`\n📁 Validation collection: ${collection}`);
  
  const files = fs.readdirSync(collectionPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(collectionPath, file));
  
  console.log(`  📄 ${files.length} articles à valider`);
  
  const results = [];
  for (const file of files) {
    const result = validateFrontmatter(file);
    const fileName = path.basename(file);
    
    if (result.status === 'valid') {
      console.log(`  ✅ ${fileName} - valide`);
    } else if (result.status === 'invalid') {
      console.log(`  ⚠️  ${fileName} - problèmes:`);
      if (result.missingFields.length > 0) {
        console.log(`    - Champs manquants: ${result.missingFields.join(', ')}`);
      }
      if (result.invalidFields.length > 0) {
        console.log(`    - Champs invalides: ${result.invalidFields.join(', ')}`);
      }
    } else {
      console.error(`  ❌ ${fileName}: ${result.error}`);
    }
    results.push(result);
  }
  
  const valid = results.filter(r => r.status === 'valid').length;
  const invalid = results.filter(r => r.status === 'invalid').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`  📊 ${valid} valides, ${invalid} invalides, ${errors} erreurs`);
  
  return results;
}

async function main() {
  console.log('🔍 VALIDATION FINALE DES SCHÉMAS FRONTMATTER');
  console.log('=' .repeat(55));
  
  const collections = [
    'medicaments-glp1',
    'glp1-perte-de-poids', 
    'glp1-cout',
    'effets-secondaires-glp1',
    'glp1-diabete',
    'regime-glp1',
    'medecins-glp1-france',
    'recherche-glp1',
    'alternatives-glp1'
  ];
  
  const allResults = [];
  
  for (const collection of collections) {
    const results = validateCollection(collection);
    if (results) allResults.push(...results);
  }
  
  const totalValid = allResults.filter(r => r.status === 'valid').length;
  const totalInvalid = allResults.filter(r => r.status === 'invalid').length;
  const totalErrors = allResults.filter(r => r.status === 'error').length;
  
  console.log('\n' + '=' .repeat(55));
  console.log('📊 RÉSULTATS GLOBAUX:');
  console.log(`✅ Articles valides: ${totalValid}`);
  console.log(`⚠️  Articles invalides: ${totalInvalid}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📄 Total: ${allResults.length}`);
  
  const validationRate = (totalValid / allResults.length * 100).toFixed(1);
  console.log(`\n🎯 Taux de validation: ${validationRate}%`);
  
  if (totalValid === allResults.length) {
    console.log('\n🎉 TOUS LES ARTICLES RESPECTENT LE SCHÉMA !');
    console.log('\n✅ Prêt pour Astro:');
    console.log('  • Frontmatter valide pour tous les articles');
    console.log('  • Configuration d\'affiliation complète');
    console.log('  • Champs requis présents');
    console.log('  • Format YAML correct');
  } else {
    console.log('\n⚡ Quelques corrections nécessaires avant validation finale.');
  }
}

main().catch(console.error);
