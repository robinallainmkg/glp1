#!/usr/bin/env node

/**
 * 🚀 DÉPLOIEMENT SSH AUTOMATIQUE - GLP-1 FRANCE
 * Déploie directement vers Hostinger avec mot de passe
 */

import { execSync, spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { createInterface } from 'readline';

// Configuration Hostinger (corrigée)
const CONFIG = {
  host: '147.79.98.140',
  username: 'u403023291',
  port: 65002,
  remotePath: 'domains/glp1-france.fr/public_html',
  password: '_@%p8R*XG.s+/5)'
};

console.log('🚀 DÉPLOIEMENT SSH AUTOMATIQUE - GLP-1 FRANCE');
console.log('===============================================');

// Vérifier la branche production
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

// Nettoyage
console.log('🧹 Nettoyage...');
if (existsSync('dist')) rmSync('dist', { recursive: true, force: true });
if (existsSync('.astro')) rmSync('.astro', { recursive: true, force: true });

// Build seulement si nécessaire
if (!existsSync('dist/index.html')) {
  console.log('🏗️  Build en cours...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build réussi');
  } catch (error) {
    console.error('❌ Erreur de build');
    process.exit(1);
  }
} else {
  console.log('✅ Build déjà présent');
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
    // Test de connexion SSH et exploration du serveur
    console.log('🔍 Test de connexion SSH...');
    const testCmd = `sshpass -p '${CONFIG.password}' ssh -o StrictHostKeyChecking=no -p ${CONFIG.port} ${CONFIG.username}@${CONFIG.host} "pwd && ls -la"`;
    execSync(testCmd, { stdio: 'inherit' });
    
    // Créer le chemin complet vers le site s'il n'existe pas
    console.log('📁 Vérification/création du dossier du site...');
    const mkdirCmd = `sshpass -p '${CONFIG.password}' ssh -o StrictHostKeyChecking=no -p ${CONFIG.port} ${CONFIG.username}@${CONFIG.host} "mkdir -p ${CONFIG.remotePath} && ls -la ${CONFIG.remotePath}"`;
    execSync(mkdirCmd, { stdio: 'inherit' });
    
    // Nettoyer le contenu existant
    console.log('🗑️  Nettoyage du serveur...');
    const cleanCmd = `sshpass -p '${CONFIG.password}' ssh -o StrictHostKeyChecking=no -p ${CONFIG.port} ${CONFIG.username}@${CONFIG.host} "rm -rf ${CONFIG.remotePath}/* ${CONFIG.remotePath}/.*[^.]*"`;
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
  console.log('5. Supprimer tout dans /domains/glp1-france.fr/public_html/');
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
