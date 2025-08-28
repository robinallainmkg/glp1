#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des collections et produits d'affiliation par catégorie
const AFFILIATE_CONFIG = {
  'medicaments-glp1': {
    products: [
      {
        productName: "Ozempic (Sémaglutide)",
        brand: "Novo Nordisk", 
        productImage: "/images/products/ozempic.jpg",
        discountPercent: 15,
        promoCode: "GLP15FRANCE",
        externalLink: "https://example.com/ozempic",
        category: "Médicament GLP-1",
        benefitsText: `
          <ul>
            <li><strong>Perte de poids moyenne :</strong> 10-15% en 6 mois</li>
            <li><strong>Réduction de l'appétit :</strong> Jusqu'à 70% dès la 1ère semaine</li>
            <li><strong>Contrôle glycémique :</strong> HbA1c réduite de 1,5 points</li>
            <li><strong>Administration :</strong> 1 injection par semaine seulement</li>
            <li><strong>Sécurité :</strong> Approuvé par l'ANSM et l'EMA</li>
          </ul>
        `,
        featured: true
      },
      {
        productName: "Mounjaro (Tirzépatide)",
        brand: "Eli Lilly",
        productImage: "/images/products/mounjaro.jpg",
        discountPercent: 12,
        promoCode: "MOUNJARO12",
        externalLink: "https://example.com/mounjaro",
        category: "Médicament GLP-1",
        benefitsText: `
          <ul>
            <li><strong>Double mécanisme :</strong> GLP-1 + GIP pour plus d'efficacité</li>
            <li><strong>Perte de poids supérieure :</strong> Jusqu'à 20% en 1 an</li>
            <li><strong>Meilleur contrôle glycémique :</strong> Réduction HbA1c de 2 points</li>
            <li><strong>Moins d'effets secondaires :</strong> Tolérance améliorée</li>
            <li><strong>Innovation 2024 :</strong> Dernière génération GLP-1</li>
          </ul>
        `,
        featured: false
      }
    ],
    layout: 'ArticleWithAffiliateSidebar',
    inlinePositions: [2, 6, 10]
  },
  'glp1-perte-de-poids': {
    products: [
      {
        productName: "Wegovy (Sémaglutide)",
        brand: "Novo Nordisk",
        productImage: "/images/products/wegovy.jpg",
        discountPercent: 18,
        promoCode: "WEGOVY18",
        externalLink: "https://example.com/wegovy",
        category: "Perte de poids",
        benefitsText: `
          <ul>
            <li><strong>Spécialement conçu :</strong> Pour la perte de poids clinique</li>
            <li><strong>Résultats prouvés :</strong> Jusqu'à 15% de perte de poids</li>
            <li><strong>Approuvé obésité :</strong> Indication officielle perte de poids</li>
            <li><strong>Support complet :</strong> Programme d'accompagnement inclus</li>
            <li><strong>Remboursement :</strong> Possible selon conditions</li>
          </ul>
        `,
        featured: true
      },
      {
        productName: "Guide Nutrition GLP-1",
        brand: "Dr. Martin Nutritionniste",
        productImage: "/images/products/guide-nutrition.jpg",
        discountPercent: 30,
        promoCode: "NUTRITION30",
        externalLink: "https://example.com/guide-nutrition",
        category: "Guide Nutritionnel",
        benefitsText: `
          <ul>
            <li><strong>Plan personnalisé :</strong> Alimentation adaptée aux GLP-1</li>
            <li><strong>200+ recettes :</strong> Optimisées pour la perte de poids</li>
            <li><strong>Gestion effets secondaires :</strong> Solutions nutritionnelles</li>
            <li><strong>Suivi 6 mois :</strong> Accompagnement personnalisé</li>
            <li><strong>Garantie résultat :</strong> Ou remboursé</li>
          </ul>
        `,
        featured: false
      }
    ],
    layout: 'ArticleWithAffiliateSidebar',
    inlinePositions: [2, 5, 8]
  },
  'glp1-cout': {
    products: [
      {
        productName: "Comparateur Prix GLP-1",
        brand: "PharmaCompare",
        productImage: "/images/products/comparateur.jpg",
        discountPercent: 0,
        promoCode: "GRATUIT",
        externalLink: "https://example.com/comparateur",
        category: "Outil de comparaison",
        benefitsText: `
          <ul>
            <li><strong>Comparaison temps réel :</strong> Prix de 50+ pharmacies</li>
            <li><strong>Alertes remboursement :</strong> Notifications automatiques</li>
            <li><strong>Aide au remboursement :</strong> Dossier simplifié</li>
            <li><strong>Économies garanties :</strong> Jusqu'à 200€ par an</li>
            <li><strong>Service gratuit :</strong> Sans engagement</li>
          </ul>
        `,
        featured: true
      }
    ],
    layout: 'ArticleWithAffiliateSidebar',
    inlinePositions: [3, 7]
  },
  'effets-secondaires-glp1': {
    products: [
      {
        productName: "Kit Gestion Effets Secondaires",
        brand: "WellnessGLP1",
        productImage: "/images/products/kit-effets.jpg",
        discountPercent: 25,
        promoCode: "WELLNESS25",
        externalLink: "https://example.com/kit-effets",
        category: "Solution bien-être",
        benefitsText: `
          <ul>
            <li><strong>Solutions naturelles :</strong> Gestion nausées et troubles</li>
            <li><strong>Compléments adaptés :</strong> Formulés pour GLP-1</li>
            <li><strong>Guide pratique :</strong> 50 astuces anti-effets secondaires</li>
            <li><strong>Consultation incluse :</strong> 30min avec un expert</li>
            <li><strong>Garantie satisfaction :</strong> 60 jours ou remboursé</li>
          </ul>
        `,
        featured: true
      }
    ],
    layout: 'ArticleWithAffiliateSidebar',
    inlinePositions: [2, 6]
  },
  // Configuration par défaut pour les autres collections
  'default': {
    products: [
      {
        productName: "Guide Complet GLP-1 2024",
        brand: "Experts GLP1 France",
        productImage: "/images/products/guide-complet.jpg",
        discountPercent: 20,
        promoCode: "GUIDE20",
        externalLink: "https://example.com/guide-complet",
        category: "Guide Médical",
        benefitsText: `
          <ul>
            <li><strong>Guide de référence :</strong> 300+ pages d'expertise</li>
            <li><strong>Tous les traitements :</strong> Comparatif complet 2024</li>
            <li><strong>Conseils pratiques :</strong> Du choix au suivi médical</li>
            <li><strong>Témoignages patients :</strong> 100+ retours d'expérience</li>
            <li><strong>Mise à jour gratuite :</strong> Évolutions réglementaires</li>
          </ul>
        `,
        featured: true
      }
    ],
    layout: 'ArticleWithAffiliateSidebar',
    inlinePositions: [3, 8]
  }
};

// Articles similaires par collection
const RELATED_ARTICLES = {
  'medicaments-glp1': [
    {
      title: "Ozempic vs Mounjaro : Comparaison 2024",
      slug: "ozempic-vs-mounjaro-comparaison",
      excerpt: "Découvrez les différences entre ces deux traitements de référence...",
      thumbnail: "/images/thumbnails/ozempic-mounjaro-comparaison.jpg"
    },
    {
      title: "Effets secondaires des GLP-1 : Guide complet", 
      slug: "effets-secondaires-glp1-guide",
      excerpt: "Tout savoir sur la gestion des effets secondaires...",
      thumbnail: "/images/thumbnails/effets-secondaires-glp1.jpg"
    }
  ],
  'glp1-perte-de-poids': [
    {
      title: "Alimentation optimale avec les GLP-1",
      slug: "alimentation-glp1-perte-poids",
      excerpt: "Maximisez vos résultats avec une nutrition adaptée...",
      thumbnail: "/images/thumbnails/alimentation-glp1.jpg"
    },
    {
      title: "Témoignages : Perte de poids avec GLP-1",
      slug: "temoignages-perte-poids-glp1",
      excerpt: "Découvrez les expériences de nos patients...",
      thumbnail: "/images/thumbnails/temoignages-glp1.jpg"
    }
  ]
};

// Chemins des collections
const collectionsPath = path.join(__dirname, '..', 'src', 'content');
const collections = [
  'medicaments-glp1',
  'glp1-perte-de-poids', 
  'glp1-cout',
  'glp1-diabete',
  'effets-secondaires-glp1',
  'medecins-glp1-france',
  'recherche-glp1',
  'regime-glp1',
  'alternatives-glp1'
];

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

// Fonction pour parser le frontmatter YAML simple
function parseFrontmatter(yamlText) {
  const frontmatter = {};
  const lines = yamlText.split('\n');
  let currentKey = null;
  let arrayItems = [];
  let inArray = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed === ']' && inArray) {
      frontmatter[currentKey] = arrayItems;
      arrayItems = [];
      inArray = false;
      continue;
    }

    if (inArray) {
      const item = trimmed.replace(/^-\s*/, '').replace(/^["']|["']$/g, '');
      if (item) arrayItems.push(item);
      continue;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      currentKey = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      
      if (value === '' || value === '[]') {
        inArray = true;
        arrayItems = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          frontmatter[currentKey] = JSON.parse(value);
        } catch {
          frontmatter[currentKey] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      } else {
        frontmatter[currentKey] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  if (currentKey && inArray) {
    frontmatter[currentKey] = arrayItems;
  }

  return frontmatter;
}

// Fonction pour générer le nouveau frontmatter avec support d'affiliation
function generateFrontmatterWithAffiliation(frontmatter, collection, hasAffiliation = true) {
  let yaml = '---\n';
  
  // Champs de base (ordre important)
  const baseFields = [
    'title', 'description', 'slug', 'pubDate', 'updatedDate', 'author',
    'category', 'tags', 'collection', 'thumbnail', 'thumbnailAlt', 'ogImage',
    'featured', 'priority', 'metaTitle', 'canonicalUrl', 'noIndex', 'schema'
  ];
  
  // Ajouter les champs de base
  for (const field of baseFields) {
    if (frontmatter[field] !== undefined && frontmatter[field] !== null) {
      const value = frontmatter[field];
      
      if (field === 'tags' && Array.isArray(value)) {
        yaml += `tags: [${value.map(tag => `"${tag}"`).join(', ')}]\n`;
      } else if (typeof value === 'boolean') {
        yaml += `${field}: ${value}\n`;
      } else if (typeof value === 'number') {
        yaml += `${field}: ${value}\n`;
      } else {
        yaml += `${field}: "${value}"\n`;
      }
    }
  }
  
  // Ajouter la configuration d'affiliation si nécessaire
  if (hasAffiliation) {
    yaml += '\n# Configuration Affiliation\n';
    yaml += 'enableAffiliation: true\n';
    yaml += 'affiliateLayout: "ArticleWithAffiliateSidebar"\n';
    yaml += `affiliateCollection: "${collection}"\n`;
    yaml += 'affiliateConfig:\n';
    yaml += '  enableAutoInjection: true\n';
    yaml += '  mobileStrategy: "both"\n';
    yaml += '  desktopStrategy: "sidebar"\n';
    
    const config = AFFILIATE_CONFIG[collection] || AFFILIATE_CONFIG['default'];
    yaml += `  inlinePositions: [${config.inlinePositions.join(', ')}]\n`;
  }
  
  yaml += '---\n';
  return yaml;
}

// Fonction pour ajouter les imports d'affiliation dans le contenu
function addAffiliationContent(body, collection) {
  const config = AFFILIATE_CONFIG[collection] || AFFILIATE_CONFIG['default'];
  
  // Ajouter un commentaire explicatif au début
  const affiliationComment = `<!-- 
SYSTÈME D'AFFILIATION AUTOMATIQUE
- Layout: ${config.layout}
- Produits: ${config.products.length} configurés
- Injection inline: positions ${config.inlinePositions.join(', ')}
- Responsive: sidebar desktop + inline mobile
-->

`;

  return affiliationComment + body;
}

// Fonction principale pour migrer un article
async function migrateArticle(filePath, collection) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { frontmatter: yamlText, body } = extractFrontmatter(content);
    const frontmatter = parseFrontmatter(yamlText);
    
    // Vérifier si l'article a déjà l'affiliation
    if (frontmatter.enableAffiliation) {
      console.log(`  ⚠️  Déjà migré: ${path.basename(filePath)}`);
      return { status: 'already_migrated', file: filePath };
    }
    
    // Générer le nouveau frontmatter avec affiliation
    const newFrontmatter = generateFrontmatterWithAffiliation(frontmatter, collection, true);
    const newBody = addAffiliationContent(body, collection);
    const newContent = newFrontmatter + newBody;
    
    // Sauvegarder
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  ✅ Migré: ${path.basename(filePath)}`);
    
    return { status: 'migrated', file: filePath };
    
  } catch (error) {
    console.error(`  ❌ Erreur migration ${filePath}:`, error.message);
    return { status: 'error', file: filePath, error: error.message };
  }
}

// Fonction pour migrer une collection complète
async function migrateCollection(collection) {
  const collectionPath = path.join(collectionsPath, collection);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`⚠️  Collection non trouvée: ${collection}`);
    return;
  }
  
  console.log(`\n📁 Migration collection: ${collection}`);
  
  const files = fs.readdirSync(collectionPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(collectionPath, file));
  
  console.log(`  📄 ${files.length} articles trouvés`);
  
  const results = [];
  for (const file of files) {
    const result = await migrateArticle(file, collection);
    results.push(result);
  }
  
  // Statistiques
  const migrated = results.filter(r => r.status === 'migrated').length;
  const alreadyMigrated = results.filter(r => r.status === 'already_migrated').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`  📊 Résultats: ${migrated} migrés, ${alreadyMigrated} déjà fait, ${errors} erreurs`);
  
  return results;
}

// Fonction principale
async function main() {
  console.log('🚀 DÉPLOIEMENT SYSTÈME D\'AFFILIATION SUR TOUS LES ARTICLES');
  console.log('=' * 60);
  
  const allResults = [];
  
  for (const collection of collections) {
    const results = await migrateCollection(collection);
    if (results) allResults.push(...results);
  }
  
  // Statistiques globales
  const totalMigrated = allResults.filter(r => r.status === 'migrated').length;
  const totalAlreadyMigrated = allResults.filter(r => r.status === 'already_migrated').length;
  const totalErrors = allResults.filter(r => r.status === 'error').length;
  
  console.log('\n' + '=' * 60);
  console.log('📊 RÉSULTATS GLOBAUX:');
  console.log(`✅ Articles migrés: ${totalMigrated}`);
  console.log(`⚠️  Déjà migrés: ${totalAlreadyMigrated}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📄 Total traité: ${allResults.length}`);
  
  if (totalErrors > 0) {
    console.log('\n❌ ERREURS DÉTAILLÉES:');
    allResults
      .filter(r => r.status === 'error')
      .forEach(r => console.log(`  ${r.file}: ${r.error}`));
  }
  
  console.log('\n🎉 Migration terminée !');
  console.log('\n📋 PROCHAINES ÉTAPES:');
  console.log('1. Tester les pages migrées');
  console.log('2. Vérifier l\'affichage des sidebars');
  console.log('3. Valider l\'injection inline sur mobile');
  console.log('4. Mettre à jour les images de produits manquantes');
}

// Exécution du script
main().catch(console.error);
