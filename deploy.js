#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE DÉPLOIEMENT GLP-1 FRANCE
 * Déploie automatiquement vers Hostinger via SCP
 * Compatible Windows + Mac
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';

// Configuration Hostinger
const HOSTINGER_CONFIG = {
  host: '147.79.98.140',
  username: 'u403023291',
  remotePath: '/public_html',
  port: 65002
};

console.log('🚀 DÉPLOIEMENT GLP-1 FRANCE');
console.log('================================');

// Vérifier qu'on est sur la branche production
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  if (currentBranch !== 'production') {
    console.error('❌ Erreur: Vous devez être sur la branche "production"');
    console.log('💡 Exécutez: git checkout production');
    process.exit(1);
  }
  console.log('✅ Branche production confirmée');
} catch (error) {
  console.error('❌ Erreur Git:', error.message);
  process.exit(1);
}

// Nettoyer l'ancien build
console.log('🧹 Nettoyage...');
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true });
}
if (existsSync('.astro')) {
  rmSync('.astro', { recursive: true, force: true });
}

// Build du site
console.log('🏗️  Build en cours...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build réussi');
} catch (error) {
  console.error('❌ Erreur de build:', error.message);
  process.exit(1);
}

// Vérifier que le build existe
if (!existsSync('dist')) {
  console.error('❌ Erreur: Dossier dist non trouvé après le build');
  process.exit(1);
}

// Vérifier que index.html existe
if (!existsSync('dist/index.html')) {
  console.error('❌ Erreur: index.html non trouvé dans dist/');
  process.exit(1);
}

console.log('📦 Build prêt pour déploiement');

// Instructions de déploiement manuel
console.log('\n📋 ÉTAPES DE DÉPLOIEMENT:');
console.log('1. Connectez-vous à votre panel Hostinger');
console.log('2. Ouvrez le File Manager');
console.log('3. Supprimez tout le contenu de public_html/');
console.log('4. Uploadez tout le contenu du dossier dist/ vers public_html/');
console.log('\n🌐 Votre site sera disponible sur: https://glp1-france.fr');

// Optionnel: déploiement automatique via SCP si configuré
if (HOSTINGER_CONFIG.username) {
  console.log('\n🔄 Déploiement automatique...');
  try {
    // Déploiement via rsync (plus fiable que scp)
    const rsyncCmd = `rsync -avz --delete dist/ ${HOSTINGER_CONFIG.username}@${HOSTINGER_CONFIG.host}:${HOSTINGER_CONFIG.remotePath}/`;
    console.log('📤 Upload en cours...');
    execSync(rsyncCmd, { stdio: 'inherit' });
    console.log('✅ Déploiement réussi!');
    console.log('🌐 Site mis à jour: https://glp1-france.fr');
  } catch (error) {
    console.error('❌ Erreur de déploiement automatique:', error.message);
    console.log('💡 Utilisez le déploiement manuel ci-dessus');
  }
} else {
  console.log('\n💡 Pour activer le déploiement automatique:');
  console.log('1. Éditez deploy.js et remplissez HOSTINGER_CONFIG.username');
  console.log('2. Configurez votre clé SSH avec Hostinger');
}

console.log('\n🎉 Déploiement terminé!');
