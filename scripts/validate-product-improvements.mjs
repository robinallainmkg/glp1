#!/usr/bin/env node

/**
 * Script de validation des améliorations produits
 * Vérifie les images, les bienfaits et la sidebar
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Validation des améliorations produits...\n');

// 1. Vérifier les images des produits
console.log('📸 Vérification des images produits...');
const productsDir = join(rootDir, 'public/images/products');

try {
  const productImages = await fs.readdir(productsDir);
  console.log(`✅ Images trouvées: ${productImages.length}`);
  productImages.forEach(image => {
    console.log(`   - ${image}`);
  });
} catch (error) {
  console.log('❌ Erreur lors de la lecture des images:', error.message);
}

// 2. Vérifier les fichiers de produits d'affiliation
console.log('\n💰 Vérification des produits d\'affiliation...');
const affiliateDir = join(rootDir, 'src/content/affiliate-products');

try {
  const productFiles = await fs.readdir(affiliateDir);
  console.log(`✅ Produits trouvés: ${productFiles.length}`);
  
  for (const file of productFiles) {
    if (file.endsWith('.md')) {
      const filePath = join(affiliateDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Vérifier la présence des champs requis
      const hasBenefitsText = content.includes('benefitsText:');
      const hasProductImage = content.includes('productImage:');
      const hasWebpImage = content.includes('.webp');
      
      console.log(`   📄 ${file}:`);
      console.log(`      - benefitsText: ${hasBenefitsText ? '✅' : '❌'}`);
      console.log(`      - productImage: ${hasProductImage ? '✅' : '❌'}`);
      console.log(`      - format WebP: ${hasWebpImage ? '✅' : '❌'}`);
    }
  }
} catch (error) {
  console.log('❌ Erreur lors de la lecture des produits:', error.message);
}

// 3. Vérifier les composants de sidebar
console.log('\n🎨 Vérification du composant AffiliateSidebar...');
const sidebarPath = join(rootDir, 'src/components/AffiliateSidebar.astro');

try {
  const sidebarContent = await fs.readFile(sidebarPath, 'utf-8');
  
  const hasBenefitsHighlight = sidebarContent.includes('benefits-highlight');
  const hasFullWidthImages = sidebarContent.includes('width: 100%');
  const hasNoIntro = !sidebarContent.includes('sidebar-intro');
  
  console.log('✅ Composant AffiliateSidebar:');
  console.log(`   - Styles bienfaits: ${hasBenefitsHighlight ? '✅' : '❌'}`);
  console.log(`   - Images pleine largeur: ${hasFullWidthImages ? '✅' : '❌'}`);
  console.log(`   - Introduction supprimée: ${hasNoIntro ? '✅' : '❌'}`);
} catch (error) {
  console.log('❌ Erreur lors de la lecture du composant sidebar:', error.message);
}

// 4. Vérifier le dropdown dans le layout
console.log('\n📋 Vérification du dropdown "Plus"...');
const layoutPath = join(rootDir, 'src/layouts/ArticleWithAffiliateSidebar.astro');

try {
  const layoutContent = await fs.readFile(layoutPath, 'utf-8');
  
  const hasDropdownHTML = layoutContent.includes('dropdown-menu');
  const hasDropdownCSS = layoutContent.includes('.dropdown-menu');
  const hasDropdownJS = layoutContent.includes('dropdown-toggle');
  
  console.log('✅ Dropdown "Plus":');
  console.log(`   - HTML structure: ${hasDropdownHTML ? '✅' : '❌'}`);
  console.log(`   - CSS styles: ${hasDropdownCSS ? '✅' : '❌'}`);
  console.log(`   - JavaScript logic: ${hasDropdownJS ? '✅' : '❌'}`);
} catch (error) {
  console.log('❌ Erreur lors de la lecture du layout:', error.message);
}

console.log('\n🎯 Validation terminée !');
console.log('\nPour tester visuellement:');
console.log('1. npm run dev');
console.log('2. Naviguer vers un article');
console.log('3. Vérifier la sidebar avec produits');
console.log('4. Tester le dropdown "Plus" dans le menu');
console.log('5. Ouvrir TinaCMS pour éditer les produits');
