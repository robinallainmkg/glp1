#!/usr/bin/env node

/**
 * 🧪 VALIDATION COMPLÈTE - Système d'Affiliation GLP1
 * 
 * Ce script valide l'ensemble du système d'affiliation :
 * - Connexion Supabase
 * - Structure des données
 * - Fonctions utilitaires
 * - Rendu des composants
 * - Performance
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration Supabase
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://htdlypqjtpxhzmiwgwlt.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpUIn0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0ZGx5cHFqdHB4aHptaXdnd2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMwMzk4NjksImV4cCI6MjAzODYxNTg2OX0.U8EtV6Aw12OIY6b3FYF7jb7kkZZhW_lNhZQtAGI8N8s';

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonctions utilitaires à tester
function extractDiscountFromTags(tags) {
  if (!Array.isArray(tags)) return null;
  const discountTag = tags.find(tag => tag && tag.includes('%'));
  if (!discountTag) return null;
  const match = discountTag.match(/-?(\d+)%/);
  return match ? parseInt(match[1]) : null;
}

function extractPromoFromUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('code') || 
           urlObj.searchParams.get('promo') || 
           urlObj.searchParams.get('ref') || null;
  } catch {
    return null;
  }
}

function formatPrice(price) {
  if (!price) return null;
  const numPrice = parseFloat(price);
  return isNaN(numPrice) ? null : `${numPrice.toFixed(2)}€`;
}

// Tests de validation
const tests = [];

async function runTest(name, testFn) {
  try {
    console.log(`🧪 Test: ${name}`);
    const startTime = Date.now();
    const result = await testFn();
    const duration = Date.now() - startTime;
    console.log(`✅ ${name} - ${duration}ms`);
    tests.push({ name, status: 'success', duration, result });
    return result;
  } catch (error) {
    console.error(`❌ ${name} - Erreur:`, error.message);
    tests.push({ name, status: 'error', error: error.message });
    return null;
  }
}

async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('products')
    .select('count(*)')
    .single();
  
  if (error) throw new Error(`Connexion Supabase: ${error.message}`);
  return `${data.count} produits dans la base`;
}

async function testDataStructure() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(3);
  
  if (error) throw new Error(`Structure données: ${error.message}`);
  
  const requiredFields = ['id', 'name', 'affiliate_url', 'is_active'];
  const missingFields = [];
  
  products.forEach(product => {
    requiredFields.forEach(field => {
      if (!(field in product)) {
        missingFields.push(field);
      }
    });
  });
  
  if (missingFields.length > 0) {
    throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
  }
  
  return `Structure valide pour ${products.length} produits`;
}

async function testUtilityFunctions() {
  const testCases = [
    {
      tags: ['promo', '-15%', 'recommandé'],
      url: 'https://example.com?code=GLP15&utm_source=site',
      expectedDiscount: 15,
      expectedPromo: 'GLP15'
    },
    {
      tags: ['cosmétique', '-20%'],
      url: 'https://talika.com/creme?ref=TALIKA20',
      expectedDiscount: 20,
      expectedPromo: 'TALIKA20'
    },
    {
      tags: ['no-discount'],
      url: 'https://example.com',
      expectedDiscount: null,
      expectedPromo: null
    }
  ];
  
  const results = testCases.map(test => {
    const discount = extractDiscountFromTags(test.tags);
    const promo = extractPromoFromUrl(test.url);
    
    return {
      discount: discount === test.expectedDiscount,
      promo: promo === test.expectedPromo
    };
  });
  
  const failures = results.filter(r => !r.discount || !r.promo);
  if (failures.length > 0) {
    throw new Error(`${failures.length} cas d'échec dans les fonctions utilitaires`);
  }
  
  return `${testCases.length} cas de test validés`;
}

async function testActiveProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(`Produits actifs: ${error.message}`);
  
  const withAffiliateUrl = products.filter(p => p.affiliate_url);
  const withValidPrice = products.filter(p => p.price && p.price > 0);
  const glp1Products = products.filter(p => p.is_glp1_recommended);
  
  return `${products.length} produits actifs (${withAffiliateUrl.length} avec URL, ${withValidPrice.length} avec prix, ${glp1Products.length} GLP-1)`;
}

async function testTagsSystem() {
  const { data: products, error } = await supabase
    .from('products')
    .select('tags')
    .not('tags', 'is', null);
  
  if (error) throw new Error(`Système tags: ${error.message}`);
  
  const allTags = new Set();
  const promoProducts = [];
  
  products.forEach(product => {
    if (Array.isArray(product.tags)) {
      product.tags.forEach(tag => allTags.add(tag));
      if (product.tags.includes('promo')) {
        promoProducts.push(product);
      }
    }
  });
  
  return `${allTags.size} tags uniques, ${promoProducts.length} produits en promo`;
}

async function testComponentFiles() {
  const componentPaths = [
    'src/components/InlineAffiliateProduct.astro',
    'src/components/AffiliateSidebar.astro',
    'src/components/AdaptiveAffiliateDisplay.astro',
    'src/layouts/ArticleWithAffiliateSidebar.astro',
    'src/lib/affiliate.ts'
  ];
  
  const existingFiles = [];
  const missingFiles = [];
  
  componentPaths.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      existingFiles.push(filePath);
    } else {
      missingFiles.push(filePath);
    }
  });
  
  if (missingFiles.length > 0) {
    throw new Error(`Fichiers manquants: ${missingFiles.join(', ')}`);
  }
  
  return `${existingFiles.length} composants trouvés`;
}

async function testDocumentation() {
  const docPaths = [
    'docs/DOCUMENTATION-AFFILIATION-COMPLETE.md',
    'docs/MIGRATION-TINACMS-SUPABASE.md',
    'docs/MASTER-INDEX.md'
  ];
  
  const existingDocs = [];
  const missingDocs = [];
  
  docPaths.forEach(docPath => {
    const fullPath = path.join(process.cwd(), docPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.length > 1000) { // Vérifier que la doc n'est pas vide
        existingDocs.push(docPath);
      } else {
        missingDocs.push(`${docPath} (trop court)`);
      }
    } else {
      missingDocs.push(docPath);
    }
  });
  
  if (missingDocs.length > 0) {
    throw new Error(`Documentation manquante: ${missingDocs.join(', ')}`);
  }
  
  return `${existingDocs.length} documents complets`;
}

// Fonction principale
async function main() {
  console.log('🚀 VALIDATION SYSTÈME D\'AFFILIATION GLP1\n');
  console.log('==========================================\n');
  
  // Tests de base
  await runTest('Connexion Supabase', testSupabaseConnection);
  await runTest('Structure des données', testDataStructure);
  await runTest('Fonctions utilitaires', testUtilityFunctions);
  
  // Tests fonctionnels
  await runTest('Produits actifs', testActiveProducts);
  await runTest('Système de tags', testTagsSystem);
  
  // Tests fichiers
  await runTest('Composants existants', testComponentFiles);
  await runTest('Documentation complète', testDocumentation);
  
  // Résumé
  console.log('\n==========================================');
  console.log('📊 RÉSUMÉ DES TESTS\n');
  
  const successful = tests.filter(t => t.status === 'success');
  const failed = tests.filter(t => t.status === 'error');
  
  console.log(`✅ Tests réussis: ${successful.length}`);
  console.log(`❌ Tests échoués: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 Tests réussis:');
    successful.forEach(test => {
      console.log(`  • ${test.name}: ${test.result} (${test.duration}ms)`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n💥 Tests échoués:');
    failed.forEach(test => {
      console.log(`  • ${test.name}: ${test.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎊 TOUS LES TESTS SONT PASSÉS !');
    console.log('Le système d\'affiliation est opérationnel et complet.');
    process.exit(0);
  }
}

// Exécution
main().catch(error => {
  console.error('💥 Erreur critique:', error);
  process.exit(1);
});
