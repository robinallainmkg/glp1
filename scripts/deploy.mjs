#!/usr/bin/env node

/**
 * Script de déploiement automatisé pour GLP-1 France
 * Usage: npm run deploy [staging|production]
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const args = process.argv.slice(2);
const environment = args[0] || 'staging';

console.log(`🚀 Déploiement vers ${environment}...`);

try {
  // Vérifier que nous sommes sur la bonne branche
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  
  if (environment === 'production' && currentBranch !== 'main') {
    console.log('⚠️  Pour déployer en production, vous devez être sur la branche main');
    console.log('🔄 Basculement vers main...');
    execSync('git checkout main');
    execSync('git pull origin main');
  } else if (environment === 'staging' && currentBranch !== 'staging') {
    console.log('⚠️  Pour déployer en staging, vous devez être sur la branche staging');
    console.log('🔄 Basculement vers staging...');
    execSync('git checkout staging');
    execSync('git pull origin staging');
  }

  // Vérifier l'état du repository
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (status.trim()) {
    console.log('❌ Il y a des modifications non commitées. Veuillez les commiter avant de déployer.');
    process.exit(1);
  }

  // Régénérer la base de données
  console.log('📊 Régénération de la base de données...');
  execSync('npm run generate-database', { stdio: 'inherit' });

  // Build du projet
  console.log('🔨 Build du projet...');
  execSync('npm run build', { stdio: 'inherit' });

  // Afficher les statistiques
  const dbPath = './data/articles-database.json';
  try {
    const db = JSON.parse(readFileSync(dbPath, 'utf-8'));
    const stats = db.metadata;
    console.log('\n📈 Statistiques du site :');
    console.log(`   📄 ${stats.totalArticles} articles`);
    console.log(`   📁 ${stats.totalCollections} collections`);
    console.log(`   📝 ${stats.totalWords} mots au total`);
    console.log(`   ⏱️  Temps de lecture moyen : ${Math.round(stats.averageReadTime)} min`);
  } catch (err) {
    console.log('⚠️  Impossible de lire les statistiques');
  }

  if (environment === 'production') {
    console.log('\n🎉 Build terminé avec succès !');
    console.log('📦 Le dossier dist/ est prêt pour le déploiement');
    console.log('🌐 Vous pouvez maintenant déployer sur votre plateforme (Vercel/Netlify)');
    console.log('\n💡 Commandes suggérées :');
    console.log('   vercel --prod');
    console.log('   ou');
    console.log('   netlify deploy --prod --dir=dist');
  } else {
    console.log('\n🎉 Build de staging terminé avec succès !');
    console.log('📦 Le dossier dist/ est prêt pour le test');
  }

} catch (error) {
  console.error('❌ Erreur lors du déploiement :', error.message);
  process.exit(1);
}
