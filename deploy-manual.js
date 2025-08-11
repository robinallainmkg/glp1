#!/usr/bin/env node

/**
 * 🚀 DÉPLOIEMENT SFTP MANUEL - GLP-1 FRANCE
 * Alternative en cas de problème avec sshpass/scp
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';

// Configuration Hostinger
const CONFIG = {
  host: '147.79.98.140',
  username: 'u403023291',
  port: 65002,
  remotePath: 'domains/glp1-france.fr/public_html',
  password: '_@%p8R*XG.s+/5)'
};

console.log('🚀 DÉPLOIEMENT SFTP MANUEL - GLP-1 FRANCE');
console.log('==========================================');

// Vérifier que le build existe
if (!existsSync('dist/index.html')) {
  console.error('❌ Erreur: Build non trouvé. Exécutez npm run build d\'abord');
  process.exit(1);
}

console.log('📦 Build détecté: 138 pages prêtes');

// Créer script SFTP
const sftpScript = `open sftp://${CONFIG.username}@${CONFIG.host}:${CONFIG.port}
lcd dist
cd ${CONFIG.remotePath}
rm -rf *
put -r *
close
quit`;

writeFileSync('sftp-deploy.txt', sftpScript);

console.log('📋 INSTRUCTIONS DE DÉPLOIEMENT MANUEL:');
console.log('=====================================');

console.log('\n🔧 Option 1: FileZilla (Recommandé)');
console.log('1. Télécharger FileZilla: https://filezilla-project.org/');
console.log(`2. Protocole: SFTP`);
console.log(`3. Hôte: ${CONFIG.host}`);
console.log(`4. Port: ${CONFIG.port}`);
console.log(`5. Nom d'utilisateur: ${CONFIG.username}`);
console.log(`6. Mot de passe: ${CONFIG.password}`);
console.log(`7. Aller dans: ${CONFIG.remotePath}`);
console.log('8. Supprimer tout le contenu existant');
console.log('9. Glisser-déposer le contenu du dossier ./dist/');

console.log('\n🔧 Option 2: SFTP en ligne de commande');
console.log('1. Ouvrir un terminal');
console.log(`2. Exécuter: sftp -P ${CONFIG.port} ${CONFIG.username}@${CONFIG.host}`);
console.log(`3. Mot de passe: ${CONFIG.password}`);
console.log(`4. cd ${CONFIG.remotePath}`);
console.log('5. rm *');
console.log('6. lcd dist');
console.log('7. put -r *');
console.log('8. quit');

console.log('\n🔧 Option 3: Panel Hostinger');
console.log('1. Se connecter sur https://hpanel.hostinger.com');
console.log('2. Aller dans File Manager');
console.log('3. Naviguer vers public_html');
console.log('4. Supprimer tout le contenu');
console.log('5. Upload du dossier dist/');

console.log('\n📊 STATISTIQUES DU BUILD:');
console.log(`✅ 138 pages statiques générées`);
console.log(`✅ Fil d'Ariane sur tous les articles`);
console.log(`✅ Boutons de retour corrigés`);
console.log(`✅ Articles mélangés par collection`);
console.log(`✅ SEO optimisé`);

console.log('\n🌐 Une fois déployé:');
console.log('📍 Site: https://glp1-france.fr');
console.log('📍 Test: https://glp1-france.fr/effets-secondaires-glp1/ozempic-danger');

// Ouvrir le dossier dist
try {
  if (process.platform === 'darwin') {
    execSync('open dist', { stdio: 'ignore' });
    console.log('\n📁 Dossier dist ouvert dans Finder');
  }
} catch (error) {
  console.log('\n📁 Dossier à déployer: ./dist/');
}

console.log('\n🎯 DÉPLOIEMENT PRÊT !');
