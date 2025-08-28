#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'pages', 'collections');

function fixCollectionPageContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si c'est déjà correct
    if (content.includes('<Content />') && content.includes('</ArticleWithAffiliateSidebar>')) {
      return { status: 'already-correct' };
    }
    
    let newContent = content;
    
    // Pattern pour détecter la fermeture incorrecte
    const incorrectPattern = /(<ArticleWithAffiliateSidebar[^>]*affiliateCollection="[^"]*"\s*\/>)\s*<\/ArticleWithAffiliateSidebar>/s;
    
    if (incorrectPattern.test(newContent)) {
      // Remplacer par la structure correcte
      newContent = newContent.replace(
        incorrectPattern,
        (match, openingTag) => {
          // Convertir l'auto-fermeture en ouverture normale
          const correctedOpening = openingTag.replace(/\s*\/>$/, '>');
          return `${correctedOpening}\n  <Content />\n</ArticleWithAffiliateSidebar>`;
        }
      );
    } else {
      // Autre pattern possible
      const pattern2 = /(<ArticleWithAffiliateSidebar[^>]*affiliateCollection="[^"]*"\s*>)\s*<\/ArticleWithAffiliateSidebar>/s;
      if (pattern2.test(newContent)) {
        newContent = newContent.replace(
          pattern2,
          '$1\n  <Content />\n</ArticleWithAffiliateSidebar>'
        );
      }
    }
    
    // Vérifier si des changements ont été faits
    if (newContent === content) {
      return { status: 'no-changes-needed' };
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    return { status: 'fixed' };
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function fixAllCollectionPages() {
  const results = [];
  
  if (!fs.existsSync(collectionsPath)) {
    console.log('❌ Dossier collections non trouvé');
    return results;
  }
  
  const collections = fs.readdirSync(collectionsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`📁 ${collections.length} collections trouvées`);
  
  for (const collection of collections) {
    const collectionDir = path.join(collectionsPath, collection);
    const slugFile = path.join(collectionDir, '[slug].astro');
    
    if (fs.existsSync(slugFile)) {
      console.log(`\n🔧 Correction: ${collection}`);
      
      const result = fixCollectionPageContent(slugFile);
      
      if (result.status === 'fixed') {
        console.log(`  ✅ Contenu et fermeture corrigés`);
      } else if (result.status === 'already-correct') {
        console.log(`  ✅ Déjà correct`);
      } else if (result.status === 'no-changes-needed') {
        console.log(`  ⚠️  Aucun changement détecté`);
      } else if (result.status === 'error') {
        console.log(`  ❌ Erreur: ${result.error}`);
      }
      
      results.push({ collection, ...result });
    } else {
      console.log(`\n⚪ ${collection}: pas de fichier [slug].astro`);
    }
  }
  
  return results;
}

async function main() {
  console.log('🔧 CORRECTION DU CONTENU DES ARTICLES');
  console.log('=' .repeat(50));
  console.log('🎯 Objectif: Restaurer l\'affichage du contenu avec <Content />');
  
  const results = fixAllCollectionPages();
  
  const fixed = results.filter(r => r.status === 'fixed').length;
  const correct = results.filter(r => r.status === 'already-correct').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RÉSULTATS:');
  console.log(`✅ Collections corrigées: ${fixed}`);
  console.log(`✅ Collections déjà correctes: ${correct}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`📄 Total traité: ${results.length}`);
  
  if (fixed > 0) {
    console.log('\n🎉 CONTENU RESTAURÉ !');
    console.log('\n📋 Les articles affichent maintenant:');
    console.log('  ✅ Le menu de navigation');
    console.log('  ✅ Le contenu Markdown complet');
    console.log('  ✅ La sidebar d\'affiliation');
    console.log('  ✅ Les articles similaires');
    
    console.log('\n🔄 Rechargez votre navigateur pour voir les corrections.');
  } else if (correct === results.length) {
    console.log('\n✅ Tous les articles sont déjà corrects !');
  }
}

main().catch(console.error);
