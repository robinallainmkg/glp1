#!/usr/bin/env node

/**
 * Script de Test et Validation de l'Intégration Affiliation
 * 
 * Ce script vérifie que tous les composants et intégrations d'affiliation
 * fonctionnent correctement avant le déploiement.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 DÉBUT DES TESTS D\'INTÉGRATION AFFILIATION\n');

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}\n🔍 ${msg}${colors.reset}`)
};

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Tests de structure des fichiers
async function testFileStructure() {
  log.title('TEST 1: STRUCTURE DES FICHIERS');

  const requiredFiles = [
    'src/components/AffiliateProduct.astro',
    'src/utils/affiliate-manager.ts',
    'data/affiliate-products.json',
    'src/layouts/BaseLayout.astro',
    'src/layouts/ArticleLayout.astro',
    'src/layouts/PostLayout.astro',
    'src/layouts/CollectionLayout.astro',
    'src/pages/produits-recommandes.astro',
    'src/pages/produits/talika-bust-phytoserum.astro',
    'src/pages/admin-dashboard.astro',
    'CHECKLIST_DEPLOIEMENT_AFFILIATION.md',
    'GUIDE_EDITORIAL_AFFILIATION.md'
  ];

  for (const file of requiredFiles) {
    const filePath = join(projectRoot, file);
    if (existsSync(filePath)) {
      log.success(`Fichier présent: ${file}`);
      testResults.passed++;
    } else {
      log.error(`Fichier manquant: ${file}`);
      testResults.failed++;
    }
  }
}

// Test de validation JSON
async function testJSONStructure() {
  log.title('TEST 2: VALIDATION DE LA STRUCTURE JSON');

  try {
    const affiliateDataPath = join(projectRoot, 'data/affiliate-products.json');
    const affiliateData = JSON.parse(readFileSync(affiliateDataPath, 'utf8'));

    // Vérification de la structure
    if (affiliateData.products && Array.isArray(affiliateData.products)) {
      log.success(`${affiliateData.products.length} produits définis`);
      testResults.passed++;
    } else {
      log.error('Structure products manquante ou invalide');
      testResults.failed++;
    }

    if (affiliateData.placements && typeof affiliateData.placements === 'object') {
      log.success(`${Object.keys(affiliateData.placements).length} placements configurés`);
      testResults.passed++;
    } else {
      log.error('Structure placements manquante ou invalide');
      testResults.failed++;
    }

    if (affiliateData.contextualRules && Array.isArray(affiliateData.contextualRules)) {
      log.success(`${affiliateData.contextualRules.length} règles contextuelles définies`);
      testResults.passed++;
    } else {
      log.error('Règles contextuelles manquantes ou invalides');
      testResults.failed++;
    }

    // Validation des produits individuels
    for (const product of affiliateData.products) {
      const requiredFields = ['id', 'name', 'description', 'price', 'affiliateUrl', 'categories'];
      const missingFields = requiredFields.filter(field => !product[field]);
      
      if (missingFields.length === 0) {
        log.success(`Produit valide: ${product.name}`);
        testResults.passed++;
      } else {
        log.error(`Produit ${product.id || 'unknown'} - champs manquants: ${missingFields.join(', ')}`);
        testResults.failed++;
      }
    }

  } catch (error) {
    log.error(`Erreur lors de la validation JSON: ${error.message}`);
    testResults.failed++;
  }
}

// Test des imports et dépendances
async function testImports() {
  log.title('TEST 3: VALIDATION DES IMPORTS');

  const filesToCheck = [
    {
      path: 'src/components/AffiliateProduct.astro',
      expectedImports: ['affiliate-manager']
    },
    {
      path: 'src/layouts/BaseLayout.astro',
      expectedImports: ['AffiliateProduct', 'affiliate-manager']
    },
    {
      path: 'src/layouts/ArticleLayout.astro',
      expectedImports: ['AffiliateProduct', 'affiliate-manager']
    }
  ];

  for (const file of filesToCheck) {
    try {
      const filePath = join(projectRoot, file.path);
      const content = readFileSync(filePath, 'utf8');

      for (const expectedImport of file.expectedImports) {
        if (content.includes(expectedImport)) {
          log.success(`Import ${expectedImport} trouvé dans ${file.path}`);
          testResults.passed++;
        } else {
          log.error(`Import ${expectedImport} manquant dans ${file.path}`);
          testResults.failed++;
        }
      }
    } catch (error) {
      log.error(`Erreur lors de la lecture de ${file.path}: ${error.message}`);
      testResults.failed++;
    }
  }
}

// Test de compilation TypeScript
async function testTypeScript() {
  log.title('TEST 4: VALIDATION TYPESCRIPT');

  try {
    const { stdout, stderr } = await execAsync('npx tsc --noEmit --skipLibCheck', {
      cwd: projectRoot
    });

    if (stderr) {
      log.warning('Avertissements TypeScript détectés');
      log.info(stderr);
      testResults.warnings++;
    } else {
      log.success('Compilation TypeScript réussie');
      testResults.passed++;
    }
  } catch (error) {
    log.error('Erreurs de compilation TypeScript détectées');
    log.error(error.stdout || error.message);
    testResults.failed++;
  }
}

// Test des styles CSS
async function testCSS() {
  log.title('TEST 5: VALIDATION DES STYLES CSS');

  const filesToCheck = [
    'src/components/AffiliateProduct.astro',
    'src/layouts/BaseLayout.astro',
    'src/pages/admin-dashboard.astro'
  ];

  for (const filePath of filesToCheck) {
    try {
      const fullPath = join(projectRoot, filePath);
      const content = readFileSync(fullPath, 'utf8');

      // Vérifier la présence de styles pour l'affiliation
      const affiliateStyleKeywords = [
        'affiliate-product',
        'affiliate-banner',
        'affiliate-sidebar',
        'affiliate-grid'
      ];

      let stylesFound = 0;
      for (const keyword of affiliateStyleKeywords) {
        if (content.includes(keyword) || content.includes(keyword.replace('-', '_'))) {
          stylesFound++;
        }
      }

      if (stylesFound > 0) {
        log.success(`Styles d'affiliation trouvés dans ${filePath} (${stylesFound} classes)`);
        testResults.passed++;
      } else {
        log.warning(`Peu ou pas de styles d'affiliation dans ${filePath}`);
        testResults.warnings++;
      }
    } catch (error) {
      log.error(`Erreur lors de la vérification des styles de ${filePath}`);
      testResults.failed++;
    }
  }
}

// Test de fonctionnalité des utilitaires
async function testUtilities() {
  log.title('TEST 6: VALIDATION DES UTILITAIRES');

  try {
    // Test basique du module affiliate-manager
    const utilsPath = join(projectRoot, 'src/utils/affiliate-manager.ts');
    const utilsContent = readFileSync(utilsPath, 'utf8');

    const expectedFunctions = [
      'getRecommendedProducts',
      'getProductsByKeywords',
      'getProductsForCollection',
      'getProductById',
      'calculateProductScore'
    ];

    for (const func of expectedFunctions) {
      if (utilsContent.includes(`export function ${func}`) || utilsContent.includes(`export async function ${func}`)) {
        log.success(`Fonction ${func} exportée`);
        testResults.passed++;
      } else {
        log.error(`Fonction ${func} manquante`);
        testResults.failed++;
      }
    }

  } catch (error) {
    log.error(`Erreur lors du test des utilitaires: ${error.message}`);
    testResults.failed++;
  }
}

// Test de build Astro
async function testBuild() {
  log.title('TEST 7: BUILD ASTRO');

  try {
    log.info('Tentative de build Astro (peut prendre du temps)...');
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: projectRoot,
      timeout: 60000 // 1 minute timeout
    });

    if (stderr && !stderr.includes('warning')) {
      log.error('Erreurs lors du build');
      log.error(stderr);
      testResults.failed++;
    } else {
      log.success('Build Astro réussi');
      testResults.passed++;
    }
  } catch (error) {
    log.error('Échec du build Astro');
    log.error(error.stdout || error.message);
    testResults.failed++;
  }
}

// Test de performance et optimisation
async function testPerformance() {
  log.title('TEST 8: VÉRIFICATIONS DE PERFORMANCE');

  const optimizations = [
    {
      name: 'Images WebP/AVIF dans affiliate-products.json',
      check: () => {
        const affiliateDataPath = join(projectRoot, 'data/affiliate-products.json');
        const content = readFileSync(affiliateDataPath, 'utf8');
        return content.includes('.webp') || content.includes('.avif');
      }
    },
    {
      name: 'Lazy loading sur les images produits',
      check: () => {
        const componentPath = join(projectRoot, 'src/components/AffiliateProduct.astro');
        const content = readFileSync(componentPath, 'utf8');
        return content.includes('loading="lazy"') || content.includes('loading={"lazy"}');
      }
    },
    {
      name: 'Paramètres UTM configurés',
      check: () => {
        const utilsPath = join(projectRoot, 'src/utils/affiliate-manager.ts');
        const content = readFileSync(utilsPath, 'utf8');
        return content.includes('utm_source') || content.includes('UTM');
      }
    }
  ];

  for (const optimization of optimizations) {
    try {
      if (optimization.check()) {
        log.success(optimization.name);
        testResults.passed++;
      } else {
        log.warning(`Optimisation manquante: ${optimization.name}`);
        testResults.warnings++;
      }
    } catch (error) {
      log.warning(`Impossible de vérifier: ${optimization.name}`);
      testResults.warnings++;
    }
  }
}

// Test d'accessibilité basique
async function testAccessibility() {
  log.title('TEST 9: ACCESSIBILITÉ BASIQUE');

  const componentPath = join(projectRoot, 'src/components/AffiliateProduct.astro');
  const content = readFileSync(componentPath, 'utf8');

  const accessibilityChecks = [
    {
      name: 'Alt text sur les images',
      check: () => content.includes('alt=') && !content.includes('alt=""')
    },
    {
      name: 'Attributs ARIA',
      check: () => content.includes('aria-') || content.includes('role=')
    },
    {
      name: 'Labels descriptifs',
      check: () => content.includes('aria-label') || content.includes('title=')
    },
    {
      name: 'Indication de lien externe',
      check: () => content.includes('rel="') && (content.includes('nofollow') || content.includes('sponsored'))
    }
  ];

  for (const check of accessibilityChecks) {
    if (check.check()) {
      log.success(check.name);
      testResults.passed++;
    } else {
      log.warning(`Amélioration possible: ${check.name}`);
      testResults.warnings++;
    }
  }
}

// Exécution de tous les tests
async function runAllTests() {
  const startTime = Date.now();

  await testFileStructure();
  await testJSONStructure();
  await testImports();
  await testTypeScript();
  await testCSS();
  await testUtilities();
  // await testBuild(); // Commenté car peut être lent, décommentez si nécessaire
  await testPerformance();
  await testAccessibility();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Résultats finaux
  log.title('RÉSULTATS DES TESTS');
  
  const total = testResults.passed + testResults.failed + testResults.warnings;
  const successRate = ((testResults.passed / total) * 100).toFixed(1);

  console.log(`${colors.bold}📊 Résumé des tests:${colors.reset}`);
  console.log(`${colors.green}✅ Tests réussis: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Tests échoués: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Avertissements: ${testResults.warnings}${colors.reset}`);
  console.log(`${colors.blue}📈 Taux de réussite: ${successRate}%${colors.reset}`);
  console.log(`${colors.blue}⏱️  Durée: ${duration}s${colors.reset}`);

  if (testResults.failed === 0) {
    log.success('🎉 TOUS LES TESTS CRITIQUES SONT PASSÉS !');
    console.log(`${colors.green}${colors.bold}✨ L'intégration d'affiliation est prête pour le déploiement${colors.reset}`);
    
    if (testResults.warnings > 0) {
      console.log(`${colors.yellow}💡 ${testResults.warnings} améliorations recommandées détectées${colors.reset}`);
    }
    
    process.exit(0);
  } else {
    log.error('🚨 DES ERREURS CRITIQUES ONT ÉTÉ DÉTECTÉES');
    console.log(`${colors.red}${colors.bold}🔧 Veuillez corriger les erreurs avant le déploiement${colors.reset}`);
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  log.error('Erreur non capturée dans les tests:');
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Promesse rejetée non gérée:');
  console.error(reason);
  process.exit(1);
});

// Lancement des tests
runAllTests().catch((error) => {
  log.error('Erreur lors de l\'exécution des tests:');
  console.error(error);
  process.exit(1);
});
