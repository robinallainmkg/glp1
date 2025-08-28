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

function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

function fixFrontmatter(yamlText) {
  const lines = yamlText.split('\n');
  const fixed = [];
  let inTags = false;
  let tagsContent = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Gestion spéciale pour les tags mal formatés
    if (trimmed.startsWith('tags: [') && trimmed.includes('"collection:')) {
      // Extraire les vrais tags de cette ligne cassée
      const match = trimmed.match(/tags: \[([^\]]+)\]/);
      if (match) {
        const content = match[1];
        // Extraire les champs réels de cette ligne
        const parts = content.split('", "');
        for (const part of parts) {
          const clean = part.replace(/^["']|["']$/g, '');
          if (clean.includes(': ')) {
            const [key, value] = clean.split(': ', 2);
            if (key === 'collection') {
              fixed.push(`collection: "${value}"`);
            } else if (key === 'thumbnail') {
              fixed.push(`thumbnail: "${value}"`);
            } else if (key === 'thumbnailAlt') {
              fixed.push(`thumbnailAlt: "${value}"`);
            } else if (key === 'featured') {
              fixed.push(`featured: ${value}`);
            } else if (key === 'priority') {
              fixed.push(`priority: ${value}`);
            } else if (key === 'schema') {
              fixed.push(`schema: "${value}"`);
            } else if (key === 'title') {
              fixed.push(`title: "${value}"`);
            } else if (key === 'description') {
              fixed.push(`description: "${value}"`);
            }
          }
        }
      }
      // Ajouter tags vide pour l'instant
      fixed.push('tags: []');
      continue;
    }
    
    // Si c'est une ligne normale, l'ajouter
    if (!trimmed.includes('"collection:') && !trimmed.includes('"thumbnail:')) {
      fixed.push(line);
    }
  }
  
  return fixed.join('\n');
}

function fixArticle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { frontmatter: yamlText, body } = extractFrontmatter(content);
    
    if (!yamlText) {
      console.log(`  ⚠️  Pas de frontmatter: ${path.basename(filePath)}`);
      return { status: 'no_frontmatter', file: filePath };
    }
    
    // Fixer le frontmatter
    const fixedYaml = fixFrontmatter(yamlText);
    const newContent = `---\n${fixedYaml}\n---\n${body}`;
    
    // Sauvegarder
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  ✅ Fixé: ${path.basename(filePath)}`);
    
    return { status: 'fixed', file: filePath };
    
  } catch (error) {
    console.error(`  ❌ Erreur: ${path.basename(filePath)}:`, error.message);
    return { status: 'error', file: filePath, error: error.message };
  }
}

function fixCollection(collection) {
  const collectionPath = path.join(collectionsPath, collection);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`⚠️  Collection non trouvée: ${collection}`);
    return;
  }
  
  console.log(`\n📁 Correction collection: ${collection}`);
  
  const files = fs.readdirSync(collectionPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(collectionPath, file));
  
  console.log(`  📄 ${files.length} articles trouvés`);
  
  const results = [];
  for (const file of files) {
    const result = fixArticle(file);
    results.push(result);
  }
  
  // Statistiques
  const fixed = results.filter(r => r.status === 'fixed').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`  📊 Résultats: ${fixed} fixés, ${errors} erreurs`);
  
  return results;
}

async function main() {
  console.log('🔧 CORRECTION DU FRONTMATTER DES ARTICLES');
  console.log('=' .repeat(50));
  
  const allResults = [];
  
  for (const collection of collections) {
    const results = fixCollection(collection);
    if (results) allResults.push(...results);
  }
  
  // Statistiques globales
  const totalFixed = allResults.filter(r => r.status === 'fixed').length;
  const totalErrors = allResults.filter(r => r.status === 'error').length;
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RÉSULTATS GLOBAUX:');
  console.log(`✅ Articles corrigés: ${totalFixed}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📄 Total traité: ${allResults.length}`);
  
  if (totalErrors > 0) {
    console.log('\n❌ ERREURS:');
    allResults
      .filter(r => r.status === 'error')
      .forEach(r => console.log(`  ${r.file}: ${r.error}`));
  }
  
  console.log('\n🎉 Correction terminée !');
}

main().catch(console.error);
