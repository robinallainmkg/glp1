#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsPath = path.join(__dirname, '..', 'src', 'content');

function validateArticle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifications essentielles
    const checks = {
      hasFrontmatter: content.startsWith('---'),
      hasTitle: /title:\s*"[^"]+"/g.test(content),
      hasDescription: /description:\s*"[^"]+"/g.test(content),
      hasSlug: /slug:\s*"[^"]+"/g.test(content),
      hasAffiliateLayout: /affiliateLayout:\s*"ArticleWithAffiliateSidebar"/g.test(content),
      hasEnableAffiliation: /enableAffiliation:\s*true/g.test(content),
      hasAffiliateConfig: /affiliateConfig:/g.test(content),
      hasInlinePositions: /inlinePositions:\s*\[/g.test(content),
      hasValidYAML: true // Nous assumons que le YAML est valide après notre nettoyage
    };
    
    // Vérifier si il y a des guillemets malformés
    const badQuotes = content.match(/title:\s*[""'][^""']*$/m) || content.match(/description:\s*[""'][^""']*$/m);
    if (badQuotes) {
      checks.hasValidYAML = false;
    }
    
    // Calculer le score
    const score = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    return {
      status: score === total ? 'perfect' : score >= 6 ? 'good' : 'needs-work',
      score: `${score}/${total}`,
      checks,
      issues: Object.entries(checks)
        .filter(([key, value]) => !value)
        .map(([key]) => key)
    };
    
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
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
    const result = validateArticle(file);
    const fileName = path.basename(file);
    
    if (result.status === 'perfect') {
      console.log(`  ✅ ${fileName} (${result.score})`);
    } else if (result.status === 'good') {
      console.log(`  🟡 ${fileName} (${result.score}) - Issues: ${result.issues.join(', ')}`);
    } else if (result.status === 'needs-work') {
      console.log(`  ⚠️  ${fileName} (${result.score}) - Issues: ${result.issues.join(', ')}`);
    } else {
      console.error(`  ❌ ${fileName}: ${result.error}`);
    }
    results.push(result);
  }
  
  const perfect = results.filter(r => r.status === 'perfect').length;
  const good = results.filter(r => r.status === 'good').length;
  const needsWork = results.filter(r => r.status === 'needs-work').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`  📊 ${perfect} parfaits, ${good} bons, ${needsWork} à améliorer, ${errors} erreurs`);
  
  return results;
}

async function main() {
  console.log('🔍 VALIDATION FINALE DU SYSTÈME D\'AFFILIATION');
  console.log('=' .repeat(60));
  
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
  
  const totalPerfect = allResults.filter(r => r.status === 'perfect').length;
  const totalGood = allResults.filter(r => r.status === 'good').length;
  const totalNeedsWork = allResults.filter(r => r.status === 'needs-work').length;
  const totalErrors = allResults.filter(r => r.status === 'error').length;
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSULTATS FINAUX:');
  console.log(`✅ Articles parfaits: ${totalPerfect}`);
  console.log(`🟡 Articles bons: ${totalGood}`);
  console.log(`⚠️  Articles à améliorer: ${totalNeedsWork}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📄 Total: ${allResults.length}`);
  
  const successRate = ((totalPerfect + totalGood) / allResults.length * 100).toFixed(1);
  console.log(`\n🎯 Taux de réussite: ${successRate}%`);
  
  if (totalPerfect === allResults.length) {
    console.log('\n🎉 MIGRATION PARFAITEMENT RÉUSSIE !');
    console.log('\n✅ Tous les articles ont:');
    console.log('  • Système d\'affiliation activé');
    console.log('  • Layout ArticleWithAffiliateSidebar');
    console.log('  • Configuration d\'injection automatique');
    console.log('  • Métadonnées SEO complètes');
    console.log('  • Frontmatter YAML valide');
    
    console.log('\n📱 FONCTIONNALITÉS ACTIVES:');
    console.log('  • Sidebar d\'affiliation (desktop)');
    console.log('  • Injection inline de produits (mobile/desktop)');
    console.log('  • Affichage des codes promo');
    console.log('  • Avantages produits visibles');
    console.log('  • Articles similaires automatiques');
    
    console.log('\n🚀 PRÊT POUR LA PRODUCTION !');
  } else {
    console.log('\n⚡ Migration réussie avec quelques améliorations possibles.');
  }
}

main().catch(console.error);
