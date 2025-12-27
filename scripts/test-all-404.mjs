#!/usr/bin/env node

/**
 * Test COMPLET de toutes les 238 URLs en 404
 * Vérifie si elles redirigent correctement ou retournent toujours 404
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire le CSV
const csvPath = path.join(__dirname, '..', 'Table.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parser
const lines = csvContent.split('\n').slice(1);
const urls = lines
  .filter(line => line.trim())
  .map(line => {
    const [url] = line.split(',');
    return url.trim();
  })
  .filter(url => url.startsWith('https://'));

console.log(`🧪 Test de ${urls.length} URLs en 404\n`);

// Fonction pour tester une URL
function testUrl(url) {
  return new Promise((resolve) => {
    const options = {
      method: 'HEAD',
      timeout: 5000,
      // NE PAS suivre les redirections automatiquement
      // pour voir les codes 301/302
      agent: false
    };

    const req = https.request(url, options, (res) => {
      resolve({
        url,
        status: res.statusCode,
        location: res.headers.location || null
      });
    });

    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        location: null,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        location: null
      });
    });

    req.end();
  });
}

// Tester toutes les URLs par batch de 10 (pour ne pas surcharger)
async function testAll() {
  const results = {
    success: [],      // 301/302 avec redirection
    stillBroken: [],  // 404
    errors: []        // Timeout, erreur réseau
  };

  const batchSize = 10;
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(testUrl));
    
    batchResults.forEach(result => {
      if (result.status === 301 || result.status === 302 || result.status === 308) {
        results.success.push(result);
        console.log(`✅ ${result.url.replace('https://glp1-france.fr', '')}`);
        console.log(`   → ${result.location}`);
      } else if (result.status === 404) {
        results.stillBroken.push(result);
        console.log(`❌ ${result.url.replace('https://glp1-france.fr', '')} → 404`);
      } else if (result.status === 200) {
        // 200 = page existe (pas une 404 donc OK)
        results.success.push(result);
        console.log(`✅ ${result.url.replace('https://glp1-france.fr', '')} → 200 OK`);
      } else {
        results.errors.push(result);
        console.log(`⚠️  ${result.url.replace('https://glp1-france.fr', '')} → ${result.status}`);
      }
    });
    
    // Progress
    console.log(`\n📊 Progression: ${Math.min(i + batchSize, urls.length)}/${urls.length}\n`);
    
    // Pause entre batches pour ne pas surcharger
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Rapport final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT FINAL\n');
  console.log(`✅ URLs corrigées: ${results.success.length}/${urls.length} (${Math.round(results.success.length/urls.length*100)}%)`);
  console.log(`❌ URLs toujours en 404: ${results.stillBroken.length}/${urls.length} (${Math.round(results.stillBroken.length/urls.length*100)}%)`);
  console.log(`⚠️  Erreurs/Timeouts: ${results.errors.length}/${urls.length}`);
  
  if (results.stillBroken.length > 0) {
    console.log('\n🔴 URLs TOUJOURS EN 404:\n');
    results.stillBroken.slice(0, 20).forEach(r => {
      console.log(`  - ${r.url.replace('https://glp1-france.fr', '')}`);
    });
    if (results.stillBroken.length > 20) {
      console.log(`  ... et ${results.stillBroken.length - 20} autres`);
    }
  }
  
  // Sauvegarder rapport
  const rapport = {
    date: new Date().toISOString(),
    total: urls.length,
    success: results.success.length,
    stillBroken: results.stillBroken.length,
    errors: results.errors.length,
    details: {
      success: results.success.map(r => ({ url: r.url, status: r.status, location: r.location })),
      stillBroken: results.stillBroken.map(r => ({ url: r.url })),
      errors: results.errors.map(r => ({ url: r.url, status: r.status, error: r.error }))
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'RAPPORT-TEST-404.json'),
    JSON.stringify(rapport, null, 2)
  );
  
  console.log('\n💾 Rapport sauvegardé: RAPPORT-TEST-404.json');
}

testAll().catch(console.error);
