// 🖼️ GÉNÉRATION D'IMAGES PRODUITS D'AFFILIATION AVEC GROK
// Identifier les produits sans images et créer des prompts pour Grok

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🛍️ GÉNÉRATION D\'IMAGES PRODUITS D\'AFFILIATION AVEC GROK\n');

// Fonction pour vérifier si une image existe
function imageExists(imagePath) {
  const fullPath = join(rootDir, 'public', imagePath);
  return fs.existsSync(fullPath);
}

// Fonction pour extraire les informations d'un produit
function extractProductInfo(content, filePath) {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  const frontmatter = frontmatterMatch[1];
  const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
  const productImageMatch = frontmatter.match(/productImage:\s*["']?([^"'\n]+)["']?/);
  const brandMatch = frontmatter.match(/brand:\s*["']?([^"'\n]+)["']?/);
  const categoryMatch = frontmatter.match(/category:\s*["']?([^"'\n]+)["']?/);
  
  if (!titleMatch) return null;
  
  return {
    title: titleMatch[1],
    productImage: productImageMatch?.[1] || '',
    brand: brandMatch?.[1] || '',
    category: categoryMatch?.[1] || '',
    fileName: path.basename(filePath, '.md')
  };
}

// Collections de produits
const productCollections = ['affiliate-products'];

let totalProducts = 0;
let missingImages = 0;
let existingImages = 0;
const missingImagesList = [];

console.log('🔍 Analyse des images de produits d\'affiliation...\n');

// Parcourir chaque collection de produits
for (const collection of productCollections) {
  const collectionPath = join(rootDir, 'src', 'content', collection);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`⚠️ Collection non trouvée: ${collection}`);
    continue;
  }
  
  const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.md'));
  totalProducts += files.length;
  
  console.log(`📁 Collection: ${collection} (${files.length} produits)`);
  
  for (const file of files) {
    const filePath = join(collectionPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const productInfo = extractProductInfo(content, filePath);
    
    if (!productInfo) {
      console.log(`⚠️ ${file} - Impossible d'extraire les informations`);
      continue;
    }
    
    if (productInfo.productImage) {
      // Vérifier si l'image existe
      if (imageExists(productInfo.productImage)) {
        console.log(`✅ ${file} - ${productInfo.productImage}`);
        existingImages++;
      } else {
        console.log(`❌ ${file} - Image manquante: ${productInfo.productImage}`);
        missingImages++;
        missingImagesList.push({
          file,
          ...productInfo
        });
      }
    } else {
      console.log(`❌ ${file} - Pas d'image définie`);
      missingImages++;
      missingImagesList.push({
        file,
        ...productInfo,
        productImage: `/images/products/${productInfo.fileName}.jpg`
      });
    }
  }
  console.log('');
}

// Résumé
console.log('📊 RÉSUMÉ:');
console.log(`   ✅ Images existantes: ${existingImages}`);
console.log(`   ❌ Images manquantes: ${missingImages}`);
console.log(`   📈 Couverture: ${Math.round((existingImages / totalProducts) * 100)}%\n`);

// Générer les prompts Grok pour les images manquantes
if (missingImagesList.length > 0) {
  console.log('🤖 PROMPTS GROK POUR LES IMAGES MANQUANTES:\n');
  console.log('=' * 80);
  
  missingImagesList.forEach((product, index) => {
    console.log(`\n📸 IMAGE ${index + 1}/${missingImagesList.length}: ${product.title}`);
    console.log(`📁 Fichier: ${product.file}`);
    console.log(`🏷️ Marque: ${product.brand}`);
    console.log(`📂 Catégorie: ${product.category}`);
    console.log(`💾 Chemin de destination: ${product.productImage}`);
    console.log('\n🎨 PROMPT GROK:');
    console.log('-'.repeat(50));
    
    // Créer un prompt spécialisé selon la marque et le produit
    let grokPrompt = '';
    
    if (product.brand.toLowerCase() === 'talika') {
      if (product.title.toLowerCase().includes('bust')) {
        grokPrompt = `Créer une image professionnelle du produit cosmétique Talika "${product.title}". 
Montrer un tube élégant de sérum anti-âge premium, design luxueux blanc et doré.
Fond minimaliste blanc avec éclairage doux. Style photo produit haut de gamme.
Format carré 400x400px, qualité commerciale.`;
      } else if (product.title.toLowerCase().includes('time control')) {
        grokPrompt = `Créer une image professionnelle du produit cosmétique Talika "${product.title}".
Montrer un pot de crème anti-âge premium, design luxueux avec éléments dorés.
Fond minimaliste blanc avec éclairage professionnel. Style photo produit cosmétique haut de gamme.
Format carré 400x400px, qualité commerciale.`;
      } else {
        grokPrompt = `Créer une image professionnelle du produit cosmétique Talika "${product.title}".
Design élégant et luxueux, emballage premium blanc et doré.
Fond minimaliste avec éclairage doux. Style photo produit cosmétique haut de gamme.
Format carré 400x400px, qualité commerciale.`;
      }
    } else if (product.brand.toLowerCase() === 'nutrimuscle') {
      if (product.title.toLowerCase().includes('whey')) {
        grokPrompt = `Créer une image professionnelle du complément alimentaire Nutrimuscle "${product.title}".
Montrer un pot de whey protéine premium, design sportif moderne blanc et bleu.
Fond minimaliste blanc. Style photo produit nutrition sportive professionnelle.
Format carré 400x400px, qualité commerciale.`;
      } else if (product.title.toLowerCase().includes('glutamine')) {
        grokPrompt = `Créer une image professionnelle du complément alimentaire Nutrimuscle "${product.title}".
Montrer un pot de glutamine premium, design sportif moderne blanc et bleu.
Fond minimaliste blanc. Style photo produit nutrition sportive professionnelle.
Format carré 400x400px, qualité commerciale.`;
      } else {
        grokPrompt = `Créer une image professionnelle du complément alimentaire Nutrimuscle "${product.title}".
Design sportif moderne, emballage blanc et bleu premium.
Fond minimaliste. Style photo produit nutrition sportive.
Format carré 400x400px, qualité commerciale.`;
      }
    } else {
      grokPrompt = `Créer une image professionnelle du produit "${product.title}" de la marque ${product.brand}.
Catégorie: ${product.category}. Design moderne et premium.
Fond minimaliste blanc avec éclairage professionnel.
Style photo produit commercial haute qualité.
Format carré 400x400px.`;
    }
    
    console.log(grokPrompt);
    console.log('-'.repeat(50));
  });
  
  console.log('\n📝 INSTRUCTIONS POUR GROK:');
  console.log('1. Copiez chaque prompt Grok ci-dessus');
  console.log('2. Générez l\'image correspondante avec Grok');
  console.log('3. Téléchargez l\'image générée');
  console.log('4. Renommez le fichier selon le chemin indiqué');
  console.log('5. Placez le fichier dans /public/images/products/');
  console.log('\n🎯 Objectif: Images professionnelles 400x400px pour les produits d\'affiliation');
  
} else {
  console.log('🎉 Toutes les images de produits sont présentes !');
}

console.log('\n✨ Génération de prompts terminée !');
