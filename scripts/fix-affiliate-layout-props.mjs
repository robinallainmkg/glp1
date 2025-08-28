#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'pages', 'collections');

const CORRECT_TEMPLATE = `<ArticleWithAffiliateSidebar 
  title={entry.data.title}
  description={entry.data.description || entry.data.metaDescription || ""}
  author={entry.data.author || "Équipe GLP-1 France"}
  category={collectionName}
  articleContent={content}
  affiliateProducts={[]}
  affiliateConfig={{
    enableAutoInjection: true,
    mobileStrategy: 'both',
    maxInlineProducts: 3,
    injectionStrategy: 'auto'
  }}
>
  <Content />
</ArticleWithAffiliateSidebar>`;

function fixCollectionPageProps(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si c'est déjà correct
    if (content.includes('articleContent={content}') && content.includes('affiliateConfig={{')) {
      return { status: 'already-correct' };
    }
    
    let newContent = content;
    
    // Remplacer tout le bloc ArticleWithAffiliateSidebar
    const pattern = /<ArticleWithAffiliateSidebar\s[^>]*>[\s\S]*?<\/ArticleWithAffiliateSidebar>/;
    
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, CORRECT_TEMPLATE);
    } else {
      return { status: 'pattern-not-found' };
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

function fixAllCollectionPageProps() {
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
      console.log(`\n🔧 Correction props: ${collection}`);
      
      const result = fixCollectionPageProps(slugFile);
      
      if (result.status === 'fixed') {
        console.log(`  ✅ Props corrigées (articleContent + affiliateConfig)`);
      } else if (result.status === 'already-correct') {
        console.log(`  ✅ Props déjà correctes`);
      } else if (result.status === 'pattern-not-found') {
        console.log(`  ⚠️  Pattern ArticleWithAffiliateSidebar non trouvé`);
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
  console.log('🔧 CORRECTION DES PROPS ARTICLEWITHAFFFILIATESIDEBAR');
  console.log('=' .repeat(60));
  console.log('🎯 Objectif: Corriger les props pour afficher le contenu et la sidebar');
  console.log('📋 Corrections:');
  console.log('  • content → articleContent');
  console.log('  • Ajout de affiliateProducts={[]}');
  console.log('  • Ajout de affiliateConfig avec configuration complète');
  console.log('  • Simplification des props non nécessaires');
  
  const results = fixAllCollectionPageProps();
  
  const fixed = results.filter(r => r.status === 'fixed').length;
  const correct = results.filter(r => r.status === 'already-correct').length;
  const errors = results.filter(r => r.status === 'error').length;
  const notFound = results.filter(r => r.status === 'pattern-not-found').length;
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSULTATS:');
  console.log(`✅ Collections corrigées: ${fixed}`);
  console.log(`✅ Collections déjà correctes: ${correct}`);
  console.log(`⚠️  Pattern non trouvé: ${notFound}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`📄 Total traité: ${results.length}`);
  
  if (fixed > 0) {
    console.log('\n🎉 PROPS CORRIGÉES !');
    console.log('\n📋 Les articles affichent maintenant:');
    console.log('  ✅ Le contenu Markdown complet (slot)');
    console.log('  ✅ La sidebar d\'affiliation fonctionnelle');
    console.log('  ✅ L\'injection automatique de produits');
    console.log('  ✅ Le mode responsive adaptatif');
    
    console.log('\n🔄 Rechargez votre navigateur pour voir les corrections.');
    console.log('\n🔗 Testez sur:');
    console.log('  http://localhost:4321/collections/effets-secondaires-glp1/insulevel-effet-indesirable');
  } else if (correct === results.length) {
    console.log('\n✅ Toutes les props sont déjà correctes !');
  }
}

main().catch(console.error);
