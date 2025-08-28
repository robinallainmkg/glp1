// Test simple pour vérifier l'import du module affiliate.ts
console.log('=== Test de chargement du module affiliate.ts ===');

try {
  // Import dynamique pour éviter les problèmes Astro
  const affiliateModule = await import('./src/lib/affiliate.ts');
  
  console.log('✅ Module chargé avec succès');
  console.log('Exports disponibles:', Object.keys(affiliateModule));
  
  // Test de la fonction getProductsByBrand
  if (affiliateModule.getProductsByBrand) {
    console.log('✅ getProductsByBrand est disponible');
    console.log('Type:', typeof affiliateModule.getProductsByBrand);
  } else {
    console.log('❌ getProductsByBrand non trouvée');
  }
  
} catch (error) {
  console.error('❌ Erreur lors du chargement du module:', error);
}
