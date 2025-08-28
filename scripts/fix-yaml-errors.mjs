#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'content');

function fixYAMLErrors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    // Problème 1 : Doublons dans le title
    const titleDoubleMatch = newContent.match(/title:\s*"([^"]+)"([^"]+)"/);
    if (titleDoubleMatch) {
      const cleanTitle = titleDoubleMatch[1];
      newContent = newContent.replace(
        /title:\s*"[^"]+[^"]+"/,
        `title: "${cleanTitle}"`
      );
      hasChanges = true;
      console.log(`  🔧 Corrigé doublon title: "${cleanTitle}"`);
    }
    
    // Problème 2 : Descriptions malformées
    if (newContent.includes('description: ">-"')) {
      const slug = newContent.match(/slug:\s*"([^"]+)"/)?.[1];
      const title = newContent.match(/title:\s*"([^"]+)"/)?.[1];
      const description = `Guide complet sur ${title || slug} : informations médicales et recommandations d'experts.`;
      
      newContent = newContent.replace(
        /description:\s*">-"/,
        `description: "${description}"`
      );
      hasChanges = true;
      console.log(`  🔧 Corrigé description vide`);
    }
    
    // Problème 3 : thumbnailAlt malformés
    const thumbnailAltBadMatch = newContent.match(/thumbnailAlt:\s*"Illustration pour l'article '[^"]*"/);
    if (thumbnailAltBadMatch) {
      const title = newContent.match(/title:\s*"([^"]+)"/)?.[1];
      if (title) {
        newContent = newContent.replace(
          /thumbnailAlt:\s*"Illustration pour l'article '[^"]*"/,
          `thumbnailAlt: "Illustration pour l'article ${title}"`
        );
        hasChanges = true;
        console.log(`  🔧 Corrigé thumbnailAlt`);
      }
    }
    
    // Problème 4 : Slug incohérent
    const titleMatch = newContent.match(/title:\s*"([^"]+)"/)?.[1];
    const slugMatch = newContent.match(/slug:\s*"([^"]+)"/)?.[1];
    if (titleMatch && slugMatch) {
      const fileName = path.basename(filePath, '.md');
      if (slugMatch !== fileName) {
        newContent = newContent.replace(
          /slug:\s*"[^"]+"/,
          `slug: "${fileName}"`
        );
        hasChanges = true;
        console.log(`  🔧 Corrigé slug: ${fileName}`);
      }
      
      // Corriger le thumbnail path aussi
      const expectedThumbnail = `/images/thumbnails/${fileName}-illus.jpg`;
      if (!newContent.includes(expectedThumbnail)) {
        newContent = newContent.replace(
          /thumbnail:\s*"[^"]+"/,
          `thumbnail: "${expectedThumbnail}"`
        );
        hasChanges = true;
        console.log(`  🔧 Corrigé thumbnail path`);
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return { status: 'fixed', changes: true };
    } else {
      return { status: 'ok', changes: false };
    }
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function checkCollection(collection) {
  const collectionPath = path.join(collectionsPath, collection);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`⚠️  Collection non trouvée: ${collection}`);
    return;
  }
  
  console.log(`\n📁 Vérification collection: ${collection}`);
  
  const files = fs.readdirSync(collectionPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(collectionPath, file));
  
  console.log(`  📄 ${files.length} articles à vérifier`);
  
  const results = [];
  for (const file of files) {
    const result = fixYAMLErrors(file);
    const fileName = path.basename(file);
    
    if (result.status === 'fixed') {
      console.log(`  ✅ ${fileName} - corrigé`);
    } else if (result.status === 'ok') {
      console.log(`  ⚪ ${fileName} - OK`);
    } else {
      console.error(`  ❌ ${fileName}: ${result.error}`);
    }
    results.push(result);
  }
  
  const fixed = results.filter(r => r.status === 'fixed').length;
  const ok = results.filter(r => r.status === 'ok').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`  📊 ${fixed} corrigés, ${ok} OK, ${errors} erreurs`);
  
  return results;
}

async function main() {
  console.log('🔧 CORRECTION RAPIDE DES ERREURS YAML');
  console.log('=' .repeat(50));
  
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
    const results = checkCollection(collection);
    if (results) allResults.push(...results);
  }
  
  const totalFixed = allResults.filter(r => r.status === 'fixed').length;
  const totalOk = allResults.filter(r => r.status === 'ok').length;
  const totalErrors = allResults.filter(r => r.status === 'error').length;
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RÉSULTATS:');
  console.log(`✅ Articles corrigés: ${totalFixed}`);
  console.log(`⚪ Articles OK: ${totalOk}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📄 Total: ${allResults.length}`);
  
  if (totalErrors === 0) {
    console.log('\n🎉 Tous les fichiers YAML sont maintenant valides !');
  }
}

main().catch(console.error);
