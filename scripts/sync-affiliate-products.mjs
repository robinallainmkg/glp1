// 🔄 SYNCHRONISATION PRODUITS AFFILIÉS
// Synchroniser les fichiers markdown avec l'affiliate-manager.ts

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔄 SYNCHRONISATION PRODUITS AFFILIÉS\n');

// Fonction pour extraire les données d'un fichier markdown
function extractProductData(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) return null;
  
  const frontmatter = frontmatterMatch[1];
  const lines = frontmatter.split('\n');
  const data = {};
  
  lines.forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      let value = match[2].trim();
      // Nettoyer les guillemets
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      data[match[1]] = value;
    }
  });
  
  return data;
}

// Analyser tous les produits markdown
function analyzeMarkdownProducts() {
  const productsDir = join(rootDir, 'src', 'content', 'affiliate-products');
  const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.md'));
  
  console.log(`📂 Analyse de ${files.length} fichiers produits markdown:\n`);
  
  const products = [];
  
  files.forEach(file => {
    const filePath = join(productsDir, file);
    const data = extractProductData(filePath);
    
    if (data) {
      products.push({
        file,
        ...data
      });
      
      console.log(`✅ ${file}`);
      console.log(`   ID: ${data.productId || 'MANQUANT'}`);
      console.log(`   Titre: ${data.title || 'MANQUANT'}`);
      console.log(`   Marque: ${data.brand || 'MANQUANT'}`);
      console.log(`   Image: ${data.productImage || data.image || 'MANQUANTE'}`);
      console.log('');
    }
  });
  
  return products;
}

// Vérifier quels produits sont dans l'affiliate-manager
async function checkAffiliateManager() {
  console.log('🔍 Vérification affiliate-manager.ts...\n');
  
  try {
    const { getAllActiveProducts } = await import('../src/utils/affiliate-manager.ts');
    const managerProducts = getAllActiveProducts();
    
    console.log(`📊 Produits dans affiliate-manager: ${managerProducts.length}`);
    managerProducts.forEach(product => {
      console.log(`   - ${product.id}: ${product.brand} ${product.name}`);
    });
    
    return managerProducts;
  } catch (error) {
    console.log(`❌ Erreur import affiliate-manager: ${error.message}`);
    return [];
  }
}

// Identifier les images manquantes
function checkMissingImages(products) {
  console.log('\n🖼️ Vérification des images...\n');
  
  const missingImages = [];
  
  products.forEach(product => {
    const imagePath = product.productImage || product.image;
    if (imagePath) {
      const fullPath = join(rootDir, 'public', imagePath);
      if (!fs.existsSync(fullPath)) {
        missingImages.push({
          product: product.title || product.file,
          imagePath,
          fullPath
        });
        console.log(`❌ Image manquante: ${imagePath}`);
      } else {
        console.log(`✅ Image présente: ${imagePath}`);
      }
    } else {
      console.log(`⚠️ Pas d'image définie pour: ${product.file}`);
    }
  });
  
  return missingImages;
}

// Créer l'image par défaut si manquante
function createDefaultImage() {
  const defaultImagePath = join(rootDir, 'public', 'images', 'default-product.jpg');
  
  if (!fs.existsSync(defaultImagePath)) {
    console.log('📷 Création de l\'image par défaut...');
    
    // Copier une image existante comme fallback
    const existingImage = join(rootDir, 'public', 'images', 'products', 'talika-bust-phytoserum.jpg');
    if (fs.existsSync(existingImage)) {
      fs.copyFileSync(existingImage, defaultImagePath);
      console.log('✅ Image par défaut créée');
    } else {
      console.log('❌ Impossible de créer l\'image par défaut');
    }
  } else {
    console.log('✅ Image par défaut déjà présente');
  }
}

// Générer la liste des images à créer avec Grok
function generateGrokImageList(missingImages) {
  console.log('\n🎨 IMAGES À GÉNÉRER AVEC GROK:\n');
  
  if (missingImages.length === 0) {
    console.log('✅ Aucune image manquante !');
    return;
  }
  
  console.log('📋 Liste pour Grok IA:');
  console.log('=====================================');
  
  missingImages.forEach((item, index) => {
    const productName = item.product.replace(/\.md$/, '');
    console.log(`${index + 1}. ${productName}`);
    console.log(`   Fichier: ${item.imagePath}`);
    console.log(`   Style: Produit médical/pharmaceutique, fond neutre`);
    console.log(`   Format: 400x300px, style professionnel`);
    console.log('');
  });
  
  console.log('🎯 Prompt suggéré pour Grok:');
  console.log('"Génère une image de produit médical professionnel pour [PRODUIT],');
  console.log('style pharmaceutique moderne, fond neutre blanc/bleu clair,');
  console.log('format 400x300px, aspect medical et trustworthy"');
}

// Exécution principale
async function main() {
  try {
    // 1. Analyser les produits markdown
    const markdownProducts = analyzeMarkdownProducts();
    
    // 2. Vérifier l'affiliate-manager
    const managerProducts = await checkAffiliateManager();
    
    // 3. Vérifier les images
    const missingImages = checkMissingImages(markdownProducts);
    
    // 4. Créer l'image par défaut
    createDefaultImage();
    
    // 5. Générer la liste pour Grok
    generateGrokImageList(missingImages);
    
    // 6. Résumé
    console.log('\n📊 RÉSUMÉ:');
    console.log(`   📄 Fichiers markdown: ${markdownProducts.length}`);
    console.log(`   🔧 Dans affiliate-manager: ${managerProducts.length}`);
    console.log(`   🖼️ Images manquantes: ${missingImages.length}`);
    console.log(`   🎯 À synchroniser: ${markdownProducts.length - managerProducts.length}`);
    
    if (missingImages.length > 0) {
      console.log('\n🎨 Action requise: Générer les images manquantes avec Grok');
    }
    
    if (markdownProducts.length !== managerProducts.length) {
      console.log('⚠️ Désynchronisation détectée entre markdown et affiliate-manager');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

main();
