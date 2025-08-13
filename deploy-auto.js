#!/usr/bin/env node

/**
 * 🚀 DÉPLOIEMENT SSH AUTOMATIQUE - GLP-1 FRANCE
 * Déploie directement vers Hostinger avec mot de passe
 */

import { execSync, spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { createInterface } from 'readline';

// Configuration Hostinger
const CONFIG = {
  host: '147.79.98.140',
  username: 'u403023291',
  port: 65002,
  remotePath: '/public_html',
  password: '_@%p8R*XG.s+/5)'
};

console.log('🚀 DÉPLOIEMENT SSH AUTOMATIQUE - GLP-1 FRANCE');
console.log('===============================================');

// Vérifier la branche main
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  if (currentBranch !== 'main') {
    console.error('❌ Erreur: Vous devez être sur la branche "main"');
    console.log('💡 Exécutez: git checkout main');
    process.exit(1);
  }
  console.log('✅ Branche main confirmée');
} catch (error) {
  console.error('❌ Erreur Git:', error.message);
  process.exit(1);
}

// Nettoyage
console.log('🧹 Nettoyage...');
if (existsSync('dist')) rmSync('dist', { recursive: true, force: true });
if (existsSync('.astro')) rmSync('.astro', { recursive: true, force: true });

// Build
console.log('🏗️  Build en cours...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build réussi');
} catch (error) {
  console.error('❌ Erreur de build');
  process.exit(1);
}

// Vérifications
if (!existsSync('dist/index.html')) {
  console.error('❌ Erreur: index.html non trouvé dans dist/');
  process.exit(1);
}

console.log('📦 Build prêt pour déploiement');

// Déploiement SSH avec mot de passe automatique
console.log('\n🔄 Déploiement SSH automatique...');
console.log(`📡 Connexion: ${CONFIG.username}@${CONFIG.host}:${CONFIG.port}`);

function deployWithSshpass() {
  try {
    // Nettoyer le serveur distant
    console.log('🗑️  Nettoyage du serveur...');
    const cleanCmd = `sshpass -p '${CONFIG.password}' ssh -o StrictHostKeyChecking=no -p ${CONFIG.port} ${CONFIG.username}@${CONFIG.host} "rm -rf ${CONFIG.remotePath}/*"`;
    execSync(cleanCmd, { stdio: 'inherit' });
    
    // Upload des fichiers
    console.log('📤 Upload des fichiers...');
    const uploadCmd = `sshpass -p '${CONFIG.password}' scp -o StrictHostKeyChecking=no -P ${CONFIG.port} -r dist/* ${CONFIG.username}@${CONFIG.host}:${CONFIG.remotePath}/`;
    execSync(uploadCmd, { stdio: 'inherit' });
    
    console.log('✅ Déploiement réussi!');
    console.log('🌐 Site mis à jour: https://glp1-france.fr');
    
  } catch (error) {
    console.error('❌ Erreur déploiement automatique:', error.message);
    console.log('\n💡 Solutions:');
    console.log('1. Installer sshpass: brew install sshpass (Mac) ou apt install sshpass (Linux)');
    console.log('2. Utiliser le déploiement manuel avec FileZilla');
    console.log('3. Utiliser le File Manager Hostinger');
    manualDeployInstructions();
  }
}

function manualDeployInstructions() {
  console.log('\n📋 DÉPLOIEMENT MANUEL:');
  console.log('1. Ouvrir FileZilla ou WinSCP');
  console.log(`2. Connexion SSH: ${CONFIG.host}:${CONFIG.port}`);
  console.log(`3. Username: ${CONFIG.username}`);
  console.log(`4. Password: ${CONFIG.password}`);
  console.log('5. Supprimer tout dans /public_html/');
  console.log('6. Upload contenu du dossier dist/');
  
  // Ouvrir le dossier dist
  try {
    if (process.platform === 'win32') {
      execSync('start dist', { stdio: 'ignore' });
    } else if (process.platform === 'darwin') {
      execSync('open dist', { stdio: 'ignore' });
    }
    console.log('📁 Dossier dist ouvert');
  } catch (error) {
    console.log('📁 Dossier dist: ./dist/');
  }
}

// Détecter si sshpass est disponible
try {
  execSync('which sshpass', { stdio: 'ignore' });
  deployWithSshpass();
} catch (error) {
  console.log('⚠️  sshpass non installé - Déploiement manuel');
  manualDeployInstructions();
}

console.log('\n🎉 Déploiement terminé!');
