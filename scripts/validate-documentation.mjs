// Validation de la cohérence de la documentation
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('📚 Validation de la cohérence de la documentation...\n');

// Liste des fichiers de documentation critiques
const criticalDocs = [
  'README.md',
  'NOUVEAU-DEVELOPPEUR-LIRE-EN-PREMIER.md',
  'docs/QUICK-START-SESSION.md',
  'docs/MASTER-INDEX.md',
  'docs/SYSTEME-AFFILIATION-COMPLET.md'
];

// Vérification de l'existence des fichiers
console.log('📁 Vérification des fichiers de documentation...');
const missingFiles = [];
const existingFiles = [];

criticalDocs.forEach(file => {
  const fullPath = join(projectRoot, file);
  if (existsSync(fullPath)) {
    existingFiles.push(file);
    console.log(`✅ ${file}`);
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file} - MANQUANT`);
  }
});

// Vérification du contenu des liens
console.log('\n🔗 Vérification des liens internes...');
let brokenLinks = 0;

existingFiles.forEach(file => {
  const fullPath = join(projectRoot, file);
  const content = readFileSync(fullPath, 'utf-8');
  
  // Recherche des liens markdown vers d'autres docs
  const markdownLinks = content.match(/\[.*?\]\(([^)]+\.md[^)]*)\)/g) || [];
  
  markdownLinks.forEach(link => {
    const linkPath = link.match(/\(([^)]+)\)/)?.[1];
    if (linkPath && !linkPath.startsWith('http')) {
      const resolvedPath = linkPath.startsWith('docs/') 
        ? join(projectRoot, linkPath)
        : join(projectRoot, 'docs', linkPath);
      
      if (!existsSync(resolvedPath)) {
        console.log(`❌ Lien cassé dans ${file}: ${linkPath}`);
        brokenLinks++;
      }
    }
  });
});

if (brokenLinks === 0) {
  console.log('✅ Tous les liens internes sont valides');
}

// Vérification des mots-clés critiques
console.log('\n🔍 Vérification du contenu critique...');
const quickStartPath = join(projectRoot, 'docs/QUICK-START-SESSION.md');

if (existsSync(quickStartPath)) {
  const quickStartContent = readFileSync(quickStartPath, 'utf-8');
  
  const criticalKeywords = [
    'Supabase',
    'InlineAffiliateProduct',
    'AffiliateSidebar',
    'affiliate.ts',
    'npm run dev',
    'products table'
  ];
  
  const missingKeywords = criticalKeywords.filter(keyword => 
    !quickStartContent.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (missingKeywords.length === 0) {
    console.log('✅ Guide de démarrage contient tous les éléments critiques');
  } else {
    console.log('❌ Éléments manquants dans le guide de démarrage:');
    missingKeywords.forEach(keyword => console.log(`   - ${keyword}`));
  }
} else {
  console.log('❌ Guide de démarrage rapide manquant !');
}

// Résumé final
console.log('\n📊 RÉSUMÉ:');
console.log(`├── Fichiers documentation: ${existingFiles.length}/${criticalDocs.length}`);
console.log(`├── Liens cassés: ${brokenLinks}`);
console.log(`├── Fichiers manquants: ${missingFiles.length}`);

if (missingFiles.length === 0 && brokenLinks === 0) {
  console.log('└── Status: 🟢 DOCUMENTATION COHÉRENTE');
  console.log('\n✨ Prêt pour les nouvelles sessions !');
  console.log('👉 Nouveau développeur ? Lisez: docs/QUICK-START-SESSION.md');
} else {
  console.log('└── Status: 🟡 DOCUMENTATION INCOMPLÈTE');
  console.log('\n⚠️ Corrigez les problèmes avant la prochaine session');
}

console.log('\n🎯 FLUX DE DÉMARRAGE POUR NOUVELLE SESSION:');
console.log('1. Lire README.md (30 secondes)');
console.log('2. Lire docs/QUICK-START-SESSION.md (5 minutes)');
console.log('3. Exécuter: node scripts/test-supabase-direct.mjs');
console.log('4. Exécuter: npm run dev');
console.log('5. ✅ Prêt à travailler efficacement !');
