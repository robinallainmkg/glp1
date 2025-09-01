#!/usr/bin/env node

/**
 * Script pour ajouter des produits d'affiliation Talika et Nutrimuscle
 * Version simplifiée avec clés Supabase intégrées
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Nouveaux produits à ajouter
const newProducts = [
  {
    title: "Eye Therapy Patches - Talika",
    brand: "Talika",
    category: "Soin anti-âge yeux",
    price: 38.5,
    external_link: "https://talika.fr/discount/GLP1?redirect=/products/eye-therapy-patches",
    discount_percent: 15,
    discount_code: "GLP1",
    product_image: "/images/products/eye-therapy-patches.webp",
    description: "Patches anti-poches et anti-cernes pour un regard frais et reposé",
    featured: true,
    priority: 3
  },
  {
    title: "Bio Enzymes Mask Anti-Âge - Talika",
    brand: "Talika",
    category: "Masque anti-âge",
    price: 58.0,
    external_link: "https://talika.fr/discount/GLP1?redirect=/products/bio-enzymes-mask-anti-age",
    discount_percent: 15,
    discount_code: "GLP1",
    product_image: "/images/products/bio-enzymes-mask-anti-age.webp",
    description: "Masque enzymatique anti-âge à la texture gel-crème pour une peau lissée et revitalisée",
    featured: true,
    priority: 2
  },
  {
    title: "Collagen Peptides - Nutrimuscle",
    brand: "Nutrimuscle",
    category: "Complément",
    price: 42.9,
    external_link: "https://www.nutrimuscle.com/NMA_GLP1?redirect=/products/collagen-peptides",
    discount_percent: 5,
    discount_code: "NMA_GLP1",
    product_image: "/images/products/collagen-peptides.webp",
    description: "Peptides de collagène pour la santé des articulations et de la peau",
    featured: false,
    priority: 6
  },
  {
    title: "BCAA 2:1:1 - Nutrimuscle",
    brand: "Nutrimuscle",
    category: "Complément",
    price: 29.9,
    external_link: "https://www.nutrimuscle.com/NMA_GLP1?redirect=/products/bcaa-211",
    discount_percent: 5,
    discount_code: "NMA_GLP1",
    product_image: "/images/products/bcaa.webp",
    description: "Acides aminés branchés pour la récupération musculaire",
    featured: false,
    priority: 7
  },
  {
    title: "Lip Balm - Talika",
    brand: "Talika",
    category: "Soin lèvres",
    price: 12.5,
    external_link: "https://talika.fr/discount/GLP1?redirect=/products/lip-balm",
    discount_percent: 15,
    discount_code: "GLP1",
    product_image: "/images/products/lip-balm.webp",
    description: "Baume à lèvres hydratant et réparateur",
    featured: false,
    priority: 8
  }
];

async function addProducts() {
  console.log('🆕 Ajout de 5 nouveaux produits d\'affiliation...\n');

  for (const product of newProducts) {
    try {
      // Générer les champs automatiques
      const product_id = generateSlug(product.title);
      const slug = product_id;

      // Générer benefits_text selon la marque
      let benefits_text = '';
      if (product.brand.toLowerCase().includes('talika')) {
        benefits_text = `<div class="benefits-highlight">
    <p><strong>🌟 Solution premium ${product.brand} :</strong> ${product.description}</p>
    <ul class="benefits-list">
      <li>✅ <strong>Formule avancée</strong> cliniquement prouvée</li>
      <li>✅ <strong>Résultats visibles</strong> rapidement</li>
      <li>✅ <strong>Compatible GLP-1</strong> pendant la perte de poids</li>
      <li>✅ <strong>Recommandé</strong> par les experts beauté</li>
    </ul>
  </div>`;
      } else if (product.brand.toLowerCase().includes('nutrimuscle')) {
        benefits_text = `<div class="benefits-highlight">
    <p><strong>💪 Complément ${product.brand} :</strong> ${product.description}</p>
    <ul class="benefits-list">
      <li>✅ <strong>Qualité pharmaceutique</strong> garantie</li>
      <li>✅ <strong>Sans additifs</strong> artificiels</li>
      <li>✅ <strong>Compatible GLP-1</strong> pour optimiser les résultats</li>
      <li>✅ <strong>Testé en laboratoire</strong> indépendant</li>
    </ul>
  </div>`;
      }

      const productData = {
        ...product,
        product_id,
        slug,
        benefits_text
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) {
        console.error(`❌ Erreur pour ${product.title}:`, error.message);
      } else {
        console.log(`✅ ${product.title} ajouté avec succès (ID: ${data[0].id})`);
      }

    } catch (error) {
      console.error(`❌ Erreur inattendue pour ${product.title}:`, error.message);
    }
  }

  console.log('\n🎉 Ajout terminé ! Vérifions les produits...');

  // Vérifier le résultat
  const { data: allProducts, error: selectError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!selectError) {
    console.log(`\n📊 Total produits maintenant: ${allProducts.length}`);
    console.log('\n📋 Derniers produits ajoutés:');
    allProducts.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ${product.brand} (${product.price}€)`);
    });
  }
}

addProducts().catch(console.error);
