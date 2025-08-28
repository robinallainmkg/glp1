#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template de frontmatter avec affiliation intégrée
const AFFILIATE_FRONTMATTER_TEMPLATE = {
  basic: {
    title: '',
    description: '',
    slug: '',
    pubDate: new Date().toISOString().split('T')[0],
    author: 'Dr. Sarah Martin',
    category: 'Guide médical',
    tags: [],
    collection: '',
    thumbnail: '',
    thumbnailAlt: '',
    featured: false,
    priority: 5,
    schema: 'Article'
  },
  affiliation: {
    enableAffiliation: true,
    affiliateLayout: 'ArticleWithAffiliateSidebar',
    affiliateCollection: '',
    affiliateConfig: {
      enableAutoInjection: true,
      mobileStrategy: 'both',
      desktopStrategy: 'sidebar',
      inlinePositions: [2, 6, 10]
    }
  }
};

// Template de contenu d'article avec structure optimisée
const ARTICLE_CONTENT_TEMPLATE = `<!-- 
ARTICLE GLP-1 AVEC SYSTÈME D'AFFILIATION AUTOMATIQUE
- Sidebar d'affiliation responsive
- Injection automatique de produits dans le contenu 
- Optimisé mobile et desktop
- Codes promo et bienfaits détaillés inclus
-->

## Introduction

[Écrivez votre introduction ici. Ce premier paragraphe sera suivi automatiquement d'un produit d'affiliation sur mobile.]

## Première section principale

[Développez votre premier point important ici.]

[À cette position (paragraphe 2), un produit sera automatiquement injecté sur mobile]

## Deuxième section

[Continuez le développement de votre article...]

## Section centrale 

[Cette section sera enrichie automatiquement]

[Position 6 : Un autre produit peut être injecté ici selon la configuration]

## Informations complémentaires

[Ajoutez vos informations spécialisées...]

## Section avancée

[Détails techniques ou conseils approfondis...]

[Position 10 : Dernier point d'injection automatique possible]

## Conclusion

[Terminez par une conclusion claire et des conseils pratiques]

### Points clés à retenir

- Point important 1
- Point important 2  
- Point important 3

### Prochaines étapes recommandées

1. Étape 1
2. Étape 2
3. Étape 3

---

*Article rédigé par un professionnel de santé. Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*`;

// Configuration des collections avec leurs spécificités
const COLLECTION_CONFIGS = {
  'medicaments-glp1': {
    defaultAuthor: 'Dr. Émilie Martin',
    category: 'Guide médical',
    tags: ['glp1', 'medicaments', 'semaglutide', 'ozempic'],
    inlinePositions: [2, 6, 10]
  },
  'glp1-perte-de-poids': {
    defaultAuthor: 'Dr. Sarah Martin',
    category: 'Perte de poids',
    tags: ['glp1', 'perte-de-poids', 'minceur'],
    inlinePositions: [2, 5, 8]
  },
  'glp1-cout': {
    defaultAuthor: 'Julien Lefèvre',
    category: 'Économie santé',
    tags: ['glp1', 'prix', 'remboursement', 'cout'],
    inlinePositions: [3, 7]
  },
  'effets-secondaires-glp1': {
    defaultAuthor: 'Dr. Marc Dubois',
    category: 'Effets secondaires',
    tags: ['glp1', 'effets-secondaires', 'tolerance'],
    inlinePositions: [2, 6]
  },
  'glp1-diabete': {
    defaultAuthor: 'Dr. Émilie Martin',
    category: 'Diabète',
    tags: ['glp1', 'diabete', 'glycemie', 'hba1c'],
    inlinePositions: [3, 7, 11]
  },
  'regime-glp1': {
    defaultAuthor: 'Claire Fontaine',
    category: 'Nutrition',
    tags: ['glp1', 'regime', 'nutrition', 'alimentation'],
    inlinePositions: [2, 5, 9]
  },
  'medecins-glp1-france': {
    defaultAuthor: 'Dr. Marc Dubois',
    category: 'Médecins spécialisés',
    tags: ['glp1', 'medecins', 'specialistes', 'prescription'],
    inlinePositions: [3, 8]
  },
  'recherche-glp1': {
    defaultAuthor: 'Karim Benali',
    category: 'Recherche médicale',
    tags: ['glp1', 'recherche', 'etudes', 'innovation'],
    inlinePositions: [4, 9]
  },
  'alternatives-glp1': {
    defaultAuthor: 'Dr. Sarah Martin',
    category: 'Alternatives thérapeutiques',
    tags: ['glp1', 'alternatives', 'traitements', 'options'],
    inlinePositions: [2, 6, 10]
  }
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function generateFrontmatter(data) {
  let yaml = '---\n';
  
  // Métadonnées de base
  yaml += `title: "${data.title}"\n`;
  yaml += `description: "${data.description}"\n`;
  yaml += `slug: "${data.slug}"\n`;
  yaml += `pubDate: ${data.pubDate}\n`;
  if (data.updatedDate) yaml += `updatedDate: ${data.updatedDate}\n`;
  yaml += `author: "${data.author}"\n`;
  yaml += `category: "${data.category}"\n`;
  yaml += `tags: [${data.tags.map(tag => `"${tag}"`).join(', ')}]\n`;
  yaml += `collection: "${data.collection}"\n`;
  yaml += `thumbnail: "${data.thumbnail}"\n`;
  yaml += `thumbnailAlt: "${data.thumbnailAlt}"\n`;
  if (data.ogImage) yaml += `ogImage: "${data.ogImage}"\n`;
  yaml += `featured: ${data.featured}\n`;
  yaml += `priority: ${data.priority}\n`;
  if (data.metaTitle) yaml += `metaTitle: "${data.metaTitle}"\n`;
  if (data.canonicalUrl) yaml += `canonicalUrl: "${data.canonicalUrl}"\n`;
  yaml += `noIndex: ${data.noIndex || false}\n`;
  yaml += `schema: "${data.schema}"\n`;
  
  // Configuration d'affiliation
  yaml += '\n# Configuration Affiliation\n';
  yaml += `enableAffiliation: ${data.enableAffiliation}\n`;
  yaml += `affiliateLayout: "${data.affiliateLayout}"\n`;
  yaml += `affiliateCollection: "${data.affiliateCollection}"\n`;
  yaml += 'affiliateConfig:\n';
  yaml += `  enableAutoInjection: ${data.affiliateConfig.enableAutoInjection}\n`;
  yaml += `  mobileStrategy: "${data.affiliateConfig.mobileStrategy}"\n`;
  yaml += `  desktopStrategy: "${data.affiliateConfig.desktopStrategy}"\n`;
  yaml += `  inlinePositions: [${data.affiliateConfig.inlinePositions.join(', ')}]\n`;
  
  yaml += '---\n';
  return yaml;
}

async function createArticleWithAffiliation(options) {
  const {
    title,
    description,
    collection,
    author,
    category,
    tags = [],
    featured = false,
    outputPath
  } = options;
  
  if (!title || !collection) {
    throw new Error('Titre et collection sont obligatoires');
  }
  
  // Configuration de la collection
  const collectionConfig = COLLECTION_CONFIGS[collection];
  if (!collectionConfig) {
    throw new Error(`Collection '${collection}' non supportée`);
  }
  
  // Générer les données de l'article
  const slug = generateSlug(title);
  const articleData = {
    // Données de base
    title,
    description: description || `Guide complet : ${title}`,
    slug,
    pubDate: new Date().toISOString().split('T')[0],
    author: author || collectionConfig.defaultAuthor,
    category: category || collectionConfig.category,
    tags: [...new Set([...collectionConfig.tags, ...tags])],
    collection,
    thumbnail: `/images/thumbnails/${slug}-illus.jpg`,
    thumbnailAlt: `Illustration pour l'article ${title}`,
    featured,
    priority: featured ? 1 : 5,
    schema: 'Article',
    
    // Configuration d'affiliation
    enableAffiliation: true,
    affiliateLayout: 'ArticleWithAffiliateSidebar',
    affiliateCollection: collection,
    affiliateConfig: {
      enableAutoInjection: true,
      mobileStrategy: 'both',
      desktopStrategy: 'sidebar',
      inlinePositions: collectionConfig.inlinePositions
    }
  };
  
  // Générer le contenu complet
  const frontmatter = generateFrontmatter(articleData);
  const content = ARTICLE_CONTENT_TEMPLATE;
  const fullContent = frontmatter + content;
  
  // Déterminer le chemin de fichier
  const filePath = outputPath || path.join(
    __dirname, '..', 'src', 'content', collection, `${slug}.md`
  );
  
  // Vérifier si le fichier existe déjà
  if (fs.existsSync(filePath)) {
    throw new Error(`L'article existe déjà : ${filePath}`);
  }
  
  // Créer le répertoire si nécessaire
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Écrire le fichier
  fs.writeFileSync(filePath, fullContent, 'utf8');
  
  return {
    success: true,
    filePath,
    slug,
    collection,
    title,
    affiliateEnabled: true
  };
}

// Interface en ligne de commande
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 CRÉATEUR D'ARTICLES AVEC AFFILIATION AUTOMATIQUE

Usage: node create-article-with-affiliation.mjs [options]

Options:
  --title "Titre de l'article"          Titre de l'article (obligatoire)
  --description "Description"           Description SEO
  --collection nom-collection           Collection cible (obligatoire)
  --author "Nom Auteur"                Auteur (optionnel)
  --category "Catégorie"               Catégorie (optionnel)
  --tags "tag1,tag2,tag3"              Tags additionnels (optionnel)
  --featured                           Marquer comme article vedette
  --output /path/to/file.md            Chemin de sortie personnalisé

Collections disponibles:
${Object.keys(COLLECTION_CONFIGS).map(c => `  - ${c}`).join('\n')}

Exemple:
  node create-article-with-affiliation.mjs \\
    --title "Ozempic prix 2024 : guide complet" \\
    --description "Prix Ozempic 2024, remboursement et alternatives" \\
    --collection medicaments-glp1 \\
    --tags "prix,2024" \\
    --featured

`);
    return;
  }
  
  // Parser les arguments
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--title':
        options.title = args[++i];
        break;
      case '--description':
        options.description = args[++i];
        break;
      case '--collection':
        options.collection = args[++i];
        break;
      case '--author':
        options.author = args[++i];
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--tags':
        options.tags = args[++i].split(',').map(t => t.trim());
        break;
      case '--featured':
        options.featured = true;
        break;
      case '--output':
        options.outputPath = args[++i];
        break;
    }
  }
  
  try {
    console.log('📝 Création d\'un nouvel article avec affiliation...\n');
    
    const result = await createArticleWithAffiliation(options);
    
    console.log('✅ Article créé avec succès !');
    console.log(`📄 Fichier: ${result.filePath}`);
    console.log(`🏷️  Slug: ${result.slug}`);
    console.log(`📁 Collection: ${result.collection}`);
    console.log(`🎯 Affiliation: ${result.affiliateEnabled ? 'Activée' : 'Désactivée'}`);
    console.log('\n🔧 Fonctionnalités automatiques:');
    console.log('  ✅ Sidebar d\'affiliation responsive');
    console.log('  ✅ Injection automatique de produits inline');
    console.log('  ✅ Codes promo et bienfaits détaillés');
    console.log('  ✅ Configuration adaptative mobile/desktop');
    console.log('\n📋 Prochaines étapes:');
    console.log(`  1. Éditer le contenu: ${result.filePath}`);
    console.log('  2. Ajouter l\'image thumbnail si nécessaire');
    console.log('  3. Tester l\'affichage en dev: npm run dev');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
    process.exit(1);
  }
}

// Export pour utilisation programmatique
export { createArticleWithAffiliation, COLLECTION_CONFIGS };

// Exécution CLI si appelé directement
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
