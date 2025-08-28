// Test de l'affichage des produits dans les articles
import fs from 'fs';
import path from 'path';

console.log('=== Test de l\'affichage des produits d\'affiliation ===\n');

// 1. Vérifier les composants existants
const componentsToCheck = [
  '/Users/mac/Projet/glp1/src/components/AffiliateSidebar.astro',
  '/Users/mac/Projet/glp1/src/layouts/ArticleWithAffiliateSidebar.astro',
  '/Users/mac/Projet/glp1/src/lib/affiliate.ts'
];

console.log('📋 Vérification des composants clés :\n');

componentsToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${path.basename(filePath)} - Présent`);
  } else {
    console.log(`❌ ${path.basename(filePath)} - Manquant`);
  }
});

// 2. Vérifier quelques articles qui utilisent le système
const articlesToCheck = [
  '/Users/mac/Projet/glp1/src/pages/collections/glp1-perte-de-poids',
  '/Users/mac/Projet/glp1/src/content/glp1-perte-de-poids'
];

console.log('\n📄 Vérification des articles :\n');

try {
  // Rechercher des fichiers utilisant ArticleWithAffiliateSidebar
  const pagesDir = '/Users/mac/Projet/glp1/src/pages/collections';
  if (fs.existsSync(pagesDir)) {
    const collections = fs.readdirSync(pagesDir);
    
    collections.forEach(collection => {
      const collectionPath = path.join(pagesDir, collection);
      if (fs.statSync(collectionPath).isDirectory()) {
        const slugFile = path.join(collectionPath, '[slug].astro');
        if (fs.existsSync(slugFile)) {
          const content = fs.readFileSync(slugFile, 'utf-8');
          if (content.includes('ArticleWithAffiliateSidebar')) {
            console.log(`✅ ${collection} - Utilise ArticleWithAffiliateSidebar`);
          } else {
            console.log(`⚠️  ${collection} - N'utilise pas ArticleWithAffiliateSidebar`);
          }
        }
      }
    });
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification des articles:', error.message);
}

// 3. Vérifier les imports dans affiliate.ts
console.log('\n🔍 Vérification des imports affiliate.ts :\n');

try {
  const affiliateContent = fs.readFileSync('/Users/mac/Projet/glp1/src/lib/affiliate.ts', 'utf-8');
  
  if (affiliateContent.includes('getCollection(\'affiliate_products\')')) {
    console.log('✅ Utilise bien la collection TinaCMS affiliate_products');
  } else {
    console.log('❌ N\'utilise pas la collection TinaCMS');
  }
  
  if (affiliateContent.includes('export async function getAllAffiliateProducts')) {
    console.log('✅ Fonction getAllAffiliateProducts exportée');
  }
  
  if (affiliateContent.includes('export async function getRecommendedProducts')) {
    console.log('✅ Fonction getRecommendedProducts exportée');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture de affiliate.ts:', error.message);
}

// 4. Suggérer un test simple
console.log('\n🧪 Test recommandé :\n');
console.log('1. Lancer le serveur Astro : npm run dev');
console.log('2. Aller sur un article, par exemple : /collections/glp1-perte-de-poids/[any-article]');
console.log('3. Vérifier que la sidebar affiche les 4 produits');
console.log('4. Vérifier que les codes promo s\'affichent');

console.log('\n💡 Si les produits ne s\'affichent pas :');
console.log('- Vérifier que les collections Astro sont bien configurées');
console.log('- Vérifier que TinaCMS est initialisé');
console.log('- Vérifier les erreurs dans la console navigateur');

console.log('\n=== Fin du test ===');
