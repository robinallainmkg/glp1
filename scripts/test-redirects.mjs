#!/usr/bin/env node

/**
 * Script de test des redirections après déploiement
 * Vérifie que les 404 redirigent correctement
 */

const urls = [
  // Collections incorrectes
  'https://glp1-france.fr/collections/medicaments-glp1/wegovy-avis/',
  'https://glp1-france.fr/collections/glp1-cout/wegovy-prix-pharmacie/',
  
  // Pages backup
  'https://glp1-france.fr/test-affiliation/',
  'https://glp1-france.fr/index-backup-original/',
  
  // Guides déplacés
  'https://glp1-france.fr/guides/guide-complet-mounjaro/',
  
  // Annuaire
  'https://glp1-france.fr/annuaire/endocrinologue-glp1',
  
  // Trailing slash manquant
  'https://glp1-france.fr/glp1-cout/wegovy-prix',
  'https://glp1-france.fr/glp1-cout/acheter-wegovy-en-france'
];

async function testRedirect(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual'
    });

    if (response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      console.log(`✅ ${url}`);
      console.log(`   → ${location} (${response.status})\n`);
      return true;
    } else if (response.status === 200) {
      console.log(`⚠️  ${url}`);
      console.log(`   → 200 OK (pas de redirect - possible si page existe)\n`);
      return true;
    } else {
      console.log(`❌ ${url}`);
      console.log(`   → ${response.status} ${response.statusText}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${url}`);
    console.log(`   → ERREUR: ${error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('🧪 Test des redirections en production\n');
  console.log(`📋 ${urls.length} URLs à tester\n`);

  const results = [];
  for (const url of urls) {
    const success = await testRedirect(url);
    results.push({ url, success });
  }

  const successCount = results.filter(r => r.success).length;
  console.log('📊 Résumé:');
  console.log(`  ✅ Succès: ${successCount}/${urls.length}`);
  console.log(`  ❌ Échecs: ${urls.length - successCount}/${urls.length}`);

  if (successCount === urls.length) {
    console.log('\n🎉 Toutes les redirections fonctionnent!');
  } else {
    console.log('\n⚠️  Certaines redirections ne fonctionnent pas encore.');
    console.log('   Attendre que le déploiement Vercel soit terminé (2-5 min).');
  }
}

main().catch(console.error);
