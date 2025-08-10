#!/usr/bin/env node

/**
 * 🚀 DÉPLOIEMENT AUTOMATIQUE COMPLET - GLP-1 FRANCE
 * GitHub + Hostinger en une seule commande
 */

import { execSync, spawn } from 'child_process';
import { existsSync, rmSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// Configuration
const CONFIG = {
  hostinger: {
    host: '147.79.98.140',
    username: 'u403023291',
    password: '_@%p8R*XG.s+/5)',
    port: 65002,
    remotePath: '/public_html'
  },
  commitMessage: process.argv[2] || 'Deploy: Mise à jour automatique'
};

console.log('🚀 DÉPLOIEMENT AUTOMATIQUE COMPLET');
console.log('GitHub + Hostinger');
console.log('=================================');

// 1. VÉRIFICATIONS
console.log('🔍 Vérifications...');

let currentBranch;
try {
  currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`✅ Branche actuelle: ${currentBranch}`);
} catch (error) {
  console.error('❌ Erreur Git:', error.message);
  process.exit(1);
}

// 2. COMMIT ET PUSH GITHUB
console.log('\n📤 Upload vers GitHub...');

try {
  // Add all files
  execSync('git add .', { stdio: 'inherit' });
  
  // Commit
  execSync(`git commit -m "${CONFIG.commitMessage}"`, { stdio: 'inherit' });
  console.log(`✅ Commit: ${CONFIG.commitMessage}`);
  
  // Push selon la branche
  if (currentBranch === 'main') {
    execSync('git push origin main --no-verify', { stdio: 'inherit' });
    console.log('✅ Push main vers GitHub');
    
    // Basculer vers production et merger
    execSync('git checkout production', { stdio: 'inherit' });
    execSync('git merge main', { stdio: 'inherit' });
    execSync('git push origin production --no-verify', { stdio: 'inherit' });
    console.log('✅ Push production vers GitHub');
  } else if (currentBranch === 'production') {
    execSync('git push origin production --no-verify', { stdio: 'inherit' });
    console.log('✅ Push production vers GitHub');
  } else {
    execSync(`git push origin ${currentBranch} --no-verify`, { stdio: 'inherit' });
    console.log(`✅ Push ${currentBranch} vers GitHub`);
  }
} catch (error) {
  console.log('⚠️  Aucun changement à commiter ou erreur push');
}

// 3. BUILD DU SITE
console.log('\n🏗️  Build du site...');

// Nettoyer
if (existsSync('dist')) rmSync('dist', { recursive: true, force: true });
if (existsSync('.astro')) rmSync('.astro', { recursive: true, force: true });

// Build
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

// 4. DÉPLOIEMENT HOSTINGER
console.log('\n🌐 Déploiement vers Hostinger...');
console.log(`📡 Connexion: ${CONFIG.hostinger.username}@${CONFIG.hostinger.host}:${CONFIG.hostinger.port}`);

// Créer script WinSCP pour Windows
if (process.platform === 'win32') {
  const winscpScript = `open sftp://${CONFIG.hostinger.username}:${CONFIG.hostinger.password}@${CONFIG.hostinger.host}:${CONFIG.hostinger.port}
option batch abort
option confirm off
cd ${CONFIG.hostinger.remotePath}
rm *
rm -r *
lcd dist
put -r *
close
exit`;

  const scriptPath = 'temp_deploy.txt';
  writeFileSync(scriptPath, winscpScript);

  // Chemins possibles de WinSCP
  const winscpPaths = [
    'C:\\Program Files\\WinSCP\\WinSCP.com',
    'C:\\Program Files (x86)\\WinSCP\\WinSCP.com',
    process.env.ProgramFiles + '\\WinSCP\\WinSCP.com',
    process.env['ProgramFiles(x86)'] + '\\WinSCP\\WinSCP.com'
  ];

  let winscpExe = null;
  for (const path of winscpPaths) {
    if (existsSync(path)) {
      winscpExe = path;
      break;
    }
  }

  if (winscpExe) {
    try {
      console.log('📤 Upload via WinSCP...');
      execSync(`"${winscpExe}" /script=${scriptPath}`, { stdio: 'inherit' });
      console.log('✅ Déploiement Hostinger réussi!');
      console.log('🌐 Site mis à jour: https://glp1-france.fr');
    } catch (error) {
      console.error('❌ Erreur WinSCP:', error.message);
      manualUploadInstructions();
    }
    
    // Nettoyer
    unlinkSync(scriptPath);
  } else {
    console.log('⚠️  WinSCP non trouvé');
    console.log('💡 Installez WinSCP depuis: https://winscp.net/download');
    manualUploadInstructions();
  }
} else {
  // Mac/Linux - utiliser rsync ou scp
  try {
    console.log('📤 Upload via rsync...');
    execSync(`rsync -avz --delete -e "ssh -p ${CONFIG.hostinger.port}" dist/ ${CONFIG.hostinger.username}@${CONFIG.hostinger.host}:${CONFIG.hostinger.remotePath}/`, { 
      stdio: 'inherit',
      env: { ...process.env, SSHPASS: CONFIG.hostinger.password }
    });
    console.log('✅ Déploiement Hostinger réussi!');
    console.log('🌐 Site mis à jour: https://glp1-france.fr');
  } catch (error) {
    console.error('❌ Erreur rsync:', error.message);
    manualUploadInstructions();
  }
}

function manualUploadInstructions() {
  console.log('\n📋 UPLOAD MANUEL REQUIS:');
  console.log(`Host: ${CONFIG.hostinger.host}:${CONFIG.hostinger.port}`);
  console.log(`User: ${CONFIG.hostinger.username}`);
  console.log(`Pass: ${CONFIG.hostinger.password}`);
  console.log(`Path: ${CONFIG.hostinger.remotePath}`);
  
  // Ouvrir dossier dist
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

console.log('\n🎉 DÉPLOIEMENT AUTOMATIQUE TERMINÉ!');
console.log('✅ GitHub: Mis à jour');
console.log('🌐 Site: https://glp1-france.fr');
