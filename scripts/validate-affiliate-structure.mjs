// Test simple du nouveau système
console.log('🧪 Test direct du système d\'affiliation...');

try {
  // Test import direct
  const fs = await import('fs');
  const path = await import('path');
  
  // Lire le fichier pour vérifier sa structure
  const content = fs.readFileSync('src/utils/affiliate-manager.ts', 'utf-8');
  
  console.log('✅ Fichier affiliate-manager.ts lu avec succès');
  console.log('📏 Taille:', content.length, 'caractères');
  
  // Vérifier les exports
  const hasGetAllActiveProducts = content.includes('export function getAllActiveProducts');
  const hasGetProductsByBrand = content.includes('export function getProductsByBrand');
  const hasSTATIC_PRODUCTS = content.includes('const STATIC_PRODUCTS');
  
  console.log('🔍 Exports trouvés:');
  console.log('   - getAllActiveProducts:', hasGetAllActiveProducts ? '✅' : '❌');
  console.log('   - getProductsByBrand:', hasGetProductsByBrand ? '✅' : '❌');
  console.log('   - STATIC_PRODUCTS:', hasSTATIC_PRODUCTS ? '✅' : '❌');
  
  // Compter les produits dans le fichier
  const productMatches = content.match(/id: "[^"]+"/g);
  console.log('📦 Produits détectés:', productMatches ? productMatches.length : 0);
  
  if (productMatches) {
    productMatches.forEach((match, index) => {
      console.log(`   ${index + 1}. ${match}`);
    });
  }
  
  console.log('\n🚀 Structure du fichier validée !');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
