#!/usr/bin/env node

/**
 * Configuration automatique de l'API Leonardo.AI
 * Guide pour obtenir et configurer la clé API
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';

async function setupLeonardoAPI() {
  console.log('🔑 CONFIGURATION API LEONARDO.AI\n');
  
  // Vérifier si la clé existe déjà
  const existingKey = process.env.LEONARDO_API_KEY;
  if (existingKey) {
    console.log('✅ Clé API Leonardo déjà configurée !');
    console.log(`🔑 Clé: ${existingKey.substring(0, 10)}...`);
    console.log('\n🚀 Vous pouvez lancer la génération:');
    console.log('   node scripts/leonardo-auto-generator.mjs');
    return;
  }
  
  console.log('📋 ÉTAPES POUR OBTENIR VOTRE CLÉ API:\n');
  
  console.log('1. 🌐 ALLER SUR LEONARDO.AI');
  console.log('   👉 https://leonardo.ai');
  console.log('   ✅ Se connecter à votre compte\n');
  
  console.log('2. ⚙️  ACCÉDER AUX PARAMÈTRES API');
  console.log('   👉 Cliquer sur votre profil (coin supérieur droit)');
  console.log('   👉 Sélectionner "User Settings"');
  console.log('   👉 Onglet "API Access"\n');
  
  console.log('3. 🔑 GÉNÉRER UNE CLÉ API');
  console.log('   👉 Cliquer sur "Generate API Key"');
  console.log('   👉 Copier la clé générée\n');
  
  console.log('4. 💾 CONFIGURER LA CLÉ');
  console.log('   👉 Méthode 1 (Temporaire):');
  console.log('       export LEONARDO_API_KEY="votre-cle-ici"');
  console.log('       node scripts/leonardo-auto-generator.mjs\n');
  
  console.log('   👉 Méthode 2 (Permanent):');
  console.log('       echo \'export LEONARDO_API_KEY="votre-cle-ici"\' >> ~/.zshrc');
  console.log('       source ~/.zshrc\n');
  
  console.log('💡 EXEMPLE DE CLÉ:');
  console.log('   export LEONARDO_API_KEY="sk-12345abcdef67890..."');
  console.log('   (Remplacez par votre vraie clé)\n');
  
  console.log('🎯 APRÈS CONFIGURATION:');
  console.log('   node scripts/leonardo-auto-generator.mjs\n');
  
  // Créer un fichier .env.example
  const envExample = `# Configuration Leonardo.AI
# Obtenez votre clé sur: https://leonardo.ai/settings/api
LEONARDO_API_KEY=sk-votre-cle-leonardo-ici

# Utilisation:
# 1. Copier ce fichier vers .env
# 2. Remplacer par votre vraie clé API
# 3. Lancer: node scripts/leonardo-auto-generator.mjs
`;

  await fs.writeFile('.env.example', envExample);
  console.log('📄 Fichier .env.example créé avec les instructions\n');
  
  // Vérifier si un fichier .env existe
  try {
    await fs.access('.env');
    console.log('📄 Fichier .env détecté ! Chargement...');
    
    // Lire le fichier .env
    const envContent = await fs.readFile('.env', 'utf-8');
    const keyMatch = envContent.match(/LEONARDO_API_KEY=(.+)/);
    
    if (keyMatch && keyMatch[1] && keyMatch[1] !== 'sk-votre-cle-leonardo-ici') {
      const key = keyMatch[1].trim().replace(/["']/g, '');
      console.log(`✅ Clé trouvée dans .env: ${key.substring(0, 10)}...`);
      console.log('\n🚀 Lancement de la génération automatique...\n');
      
      // Définir la variable d'environnement et lancer le générateur
      process.env.LEONARDO_API_KEY = key;
      
      // Importer et lancer le générateur
      const { default: generator } = await import('./leonardo-auto-generator.mjs');
      return;
    }
  } catch {
    console.log('📄 Aucun fichier .env trouvé');
  }
  
  console.log('⚠️  CLÉ API NON TROUVÉE');
  console.log('   Suivez les étapes ci-dessus pour configurer votre clé\n');
  
  // Tester la connectivité
  console.log('🌐 Test de connectivité vers Leonardo.AI...');
  try {
    const https = require('https');
    const req = https.request('https://cloud.leonardo.ai/api/rest/v1/me', { method: 'GET' }, (res) => {
      if (res.statusCode === 401) {
        console.log('🔒 API accessible (authentification requise) ✅');
      } else {
        console.log(`📡 Réponse API: ${res.statusCode}`);
      }
    });
    req.on('error', () => {
      console.log('❌ Impossible de contacter Leonardo.AI');
    });
    req.end();
  } catch (error) {
    console.log('❌ Erreur de connectivité');
  }
}

setupLeonardoAPI();
