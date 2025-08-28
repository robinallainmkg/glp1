#!/usr/bin/env node

/**
 * Script pour ajouter un nouveau produit d'affiliation à Supabase
 * Usage: node scripts/add-product.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import readline from 'readline';

// Charger les variables d'environnement
config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function addNewProduct() {
  console.log('🆕 Ajout d\'un nouveau produit d\'affiliation\n');
  
  try {
    // Collecter les informations
    const title = await prompt('📝 Nom du produit (ex: "Sérum Anti-Rides - Talika"): ');
    const brand = await prompt('🏷️  Marque (ex: "Talika"): ');
    const category = await prompt('📂 Catégorie (ex: "Soin anti-âge"): ');
    const price = parseFloat(await prompt('💰 Prix en euros (ex: "45.90"): '));
    const external_link = await prompt('🔗 Lien d\'affiliation (ex: "https://talika.fr/GLP1"): ');
    
    // Optionnel
    const discount_percent = await prompt('🏷️  Pourcentage de remise (ex: "15" ou laissez vide): ');
    const discount_code = await prompt('🎫 Code promo (ex: "GLP1" ou laissez vide): ');
    const product_image = await prompt('🖼️  URL de l\'image (ex: "/images/products/produit.jpg"): ');
    const description = await prompt('📄 Description courte: ');
    const featured = await prompt('⭐ Produit vedette ? (y/N): ');
    const priority = await prompt('🔢 Priorité (1-999, par défaut 999): ');
    
    // Générer les champs automatiques
    const product_id = generateSlug(title);
    const slug = product_id;
    
    // Préparer les données
    const productData = {
      title: title.trim(),
      product_id,
      brand: brand.trim(),
      category: category.trim(),
      price,
      external_link: external_link.trim(),
      slug,
      discount_percent: discount_percent ? parseInt(discount_percent) : null,
      discount_code: discount_code?.trim() || null,
      product_image: product_image?.trim() || null,
      description: description?.trim() || null,
      featured: featured.toLowerCase() === 'y',
      priority: priority ? parseInt(priority) : 999
    };
    
    // Générer benefits_text par défaut
    if (brand.toLowerCase().includes('talika')) {
      productData.benefits_text = `<div class="benefits-highlight">
    <p><strong>🌟 Solution premium ${brand} :</strong> ${description || 'Produit de qualité supérieure'}</p>
    <ul class="benefits-list">
      <li>✅ <strong>Formule avancée</strong> cliniquement prouvée</li>
      <li>✅ <strong>Résultats visibles</strong> rapidement</li>
      <li>✅ <strong>Compatible GLP-1</strong> pendant la perte de poids</li>
      <li>✅ <strong>Recommandé</strong> par les experts</li>
    </ul>
  </div>`;
    } else if (brand.toLowerCase().includes('nutrimuscle')) {
      productData.benefits_text = `<div class="benefits-highlight">
    <p><strong>💪 Complément ${brand} :</strong> ${description || 'Nutrition sportive de qualité'}</p>
    <ul class="benefits-list">
      <li>✅ <strong>Qualité pharmaceutique</strong> garantie</li>
      <li>✅ <strong>Sans additifs</strong> artificiels</li>
      <li>✅ <strong>Optimisé GLP-1</strong> pour la transformation</li>
      <li>✅ <strong>Efficacité prouvée</strong> scientifiquement</li>
    </ul>
  </div>`;
    } else {
      productData.benefits_text = `<div class="benefits-highlight">
    <p><strong>✨ ${title} :</strong> ${description || 'Solution de qualité pour votre bien-être'}</p>
    <ul class="benefits-list">
      <li>✅ <strong>Qualité premium</strong></li>
      <li>✅ <strong>Résultats garantis</strong></li>
      <li>✅ <strong>Compatible transformation</strong></li>
      <li>✅ <strong>Recommandé experts</strong></li>
    </ul>
  </div>`;
    }
    
    console.log('\n📋 Résumé du produit:');
    console.log('━'.repeat(50));
    console.log(`Nom: ${productData.title}`);
    console.log(`ID: ${productData.product_id}`);
    console.log(`Marque: ${productData.brand}`);
    console.log(`Prix: ${productData.price}€${productData.discount_percent ? ` (-${productData.discount_percent}% = ${(productData.price * (1 - productData.discount_percent / 100)).toFixed(2)}€)` : ''}`);
    console.log(`Vedette: ${productData.featured ? 'Oui' : 'Non'}`);
    console.log(`Priorité: ${productData.priority}`);
    
    const confirm = await prompt('\n✅ Confirmer l\'ajout ? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Ajout annulé');
      rl.close();
      return;
    }
    
    // Insérer dans Supabase
    console.log('\n💾 Insertion dans Supabase...');
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      rl.close();
      return;
    }
    
    console.log('✅ Produit ajouté avec succès!');
    console.log(`🆔 ID: ${data[0].id}`);
    
    // Test de récupération
    console.log('\n🧪 Test de récupération...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', product_id)
      .single();
    
    if (testError) {
      console.error('⚠️  Erreur lors du test:', testError);
    } else {
      console.log('✅ Produit récupéré avec succès!');
      console.log(`📦 ${testData.title} - ${testData.brand}`);
    }
    
    console.log('\n🔧 Prochaines étapes:');
    console.log('1. Testez avec: node scripts/test-supabase-migration.mjs');
    console.log('2. Vérifiez l\'affichage sur le site');
    console.log('3. Ajustez l\'image et les bénéfices si nécessaire');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    rl.close();
  }
}

addNewProduct();
