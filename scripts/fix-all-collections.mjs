import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsDir = path.join(__dirname, '..', 'src', 'pages', 'collections');

// Configuration des collections
const collectionsConfig = {
  'alternatives-glp1': {
    name: 'Alternatives aux GLP-1',
    description: 'Découvrez les alternatives naturelles et médicamenteuses aux traitements GLP-1 pour la perte de poids',
    icon: '🌿',
    color: '#059669', // green-600
    seoTitle: 'Alternatives aux GLP-1 - Solutions naturelles et médicamenteuses',
    keywords: ['alternatives glp1', 'substituts ozempic', 'alternatives naturelles', 'perte de poids sans médicament']
  },
  'avant-apres-glp1': {
    name: 'Avant/Après GLP-1',
    description: 'Témoignages et transformations réels avec les traitements GLP-1 : photos avant/après et retours d\'expérience',
    icon: '📸',
    color: '#7c3aed', // violet-600
    seoTitle: 'Avant/Après GLP-1 - Témoignages et transformations',
    keywords: ['avant après glp1', 'témoignages ozempic', 'transformations wegovy', 'résultats glp1']
  },
  'effets-secondaires-glp1': {
    name: 'Effets secondaires GLP-1',
    description: 'Guide complet des effets secondaires des médicaments GLP-1 : symptômes, durée, gestion et conseils',
    icon: '⚠️',
    color: '#dc2626', // red-600
    seoTitle: 'Effets secondaires GLP-1 - Guide complet et conseils',
    keywords: ['effets secondaires glp1', 'nausées ozempic', 'effets indésirables wegovy', 'gestion effets secondaires']
  },
  'glp1-cout': {
    name: 'Prix et coût GLP-1',
    description: 'Prix, remboursement et coût des traitements GLP-1 en France : Ozempic, Wegovy, Saxenda',
    icon: '💰',
    color: '#ea580c', // orange-600
    seoTitle: 'Prix GLP-1 - Coût et remboursement des traitements',
    keywords: ['prix glp1', 'coût ozempic', 'remboursement wegovy', 'prix saxenda']
  },
  'glp1-diabete': {
    name: 'GLP-1 et diabète',
    description: 'Utilisation des médicaments GLP-1 dans le traitement du diabète de type 2',
    icon: '🩺',
    color: '#2563eb', // blue-600
    seoTitle: 'GLP-1 et diabète - Traitement du diabète de type 2',
    keywords: ['glp1 diabète', 'ozempic diabète', 'traitement diabète type 2', 'glycémie']
  },
  'glp1-perte-de-poids': {
    name: 'GLP-1 perte de poids',
    description: 'Efficacité des GLP-1 pour la perte de poids : mécanismes, résultats et conseils',
    icon: '⚖️',
    color: '#16a34a', // green-600
    seoTitle: 'GLP-1 perte de poids - Efficacité et résultats',
    keywords: ['glp1 perte de poids', 'maigrir ozempic', 'wegovy amaigrissement', 'perte de poids médicament']
  },
  'medecins-glp1-france': {
    name: 'Médecins GLP-1 France',
    description: 'Trouvez un médecin prescripteur de GLP-1 près de chez vous en France',
    icon: '👨‍⚕️',
    color: '#0891b2', // cyan-600
    seoTitle: 'Médecins GLP-1 France - Trouvez un prescripteur',
    keywords: ['médecin glp1', 'prescripteur ozempic', 'endocrinologue glp1', 'médecin wegovy']
  },
  'medicaments-glp1': {
    name: 'Médicaments GLP-1',
    description: 'Guide complet sur les médicaments GLP-1 : Ozempic, Wegovy, Saxenda, Trulicity et autres agonistes du récepteur GLP-1',
    icon: '💊',
    color: '#10b981', // green-500
    seoTitle: 'Médicaments GLP-1 - Guide complet des traitements',
    keywords: ['médicaments glp1', 'ozempic', 'wegovy', 'saxenda', 'trulicity', 'agonistes glp1']
  },
  'recherche-glp1': {
    name: 'Recherche GLP-1',
    description: 'Dernières recherches et études scientifiques sur les médicaments GLP-1',
    icon: '🔬',
    color: '#7c2d12', // amber-800
    seoTitle: 'Recherche GLP-1 - Études et avancées scientifiques',
    keywords: ['recherche glp1', 'études ozempic', 'recherche wegovy', 'science glp1']
  },
  'regime-glp1': {
    name: 'Régime avec GLP-1',
    description: 'Conseils alimentaires et régimes adaptés lors d\'un traitement GLP-1',
    icon: '🥗',
    color: '#65a30d', // lime-600
    seoTitle: 'Régime GLP-1 - Alimentation et conseils nutritionnels',
    keywords: ['régime glp1', 'alimentation ozempic', 'nutrition wegovy', 'conseils alimentaires']
  }
};

function updateCollectionIndexPage(collectionSlug) {
  const indexPath = path.join(collectionsDir, collectionSlug, 'index.astro');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`⚠️  ${collectionSlug}/index.astro not found`);
    return;
  }
  
  const config = collectionsConfig[collectionSlug];
  if (!config) {
    console.log(`⚠️  No config found for ${collectionSlug}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Générer le nouveau contenu
    const newContent = `---
import CollectionLayout from '../../../layouts/CollectionLayout.astro';
import { getCollection } from 'astro:content';

// Récupérer tous les articles de cette collection
const articles = await getCollection('${collectionSlug}');

// Créer l'objet collection attendu par le layout
const collection = {
  id: '${collectionSlug}',
  name: '${config.name}',
  slug: '${collectionSlug}',
  description: '${config.description}',
  icon: '${config.icon}',
  color: '${config.color}',
  seoTitle: '${config.seoTitle}',
  seoDescription: '${config.description}',
  keywords: ${JSON.stringify(config.keywords)},
  image: '/images/thumbnails/${collectionSlug}.svg'
};

// Formater les articles pour le layout
const formattedArticles = articles.map(article => ({
  slug: article.slug,
  title: article.data.title,
  description: article.data.description || article.data.metaDescription || '',
  author: article.data.author || 'Équipe GLP-1 France',
  url: \`/collections/${collectionSlug}/\${article.slug}\`,
  wordCount: article.body.split(' ').length,
  readingTime: Math.ceil(article.body.split(' ').length / 200),
  lastModified: article.data.lastModified || article.data.pubDate || new Date().toISOString(),
  thumbnail: article.data.thumbnail || article.data.image || \`/images/thumbnails/\${article.slug}-illus.jpg\`
}));
---

<CollectionLayout 
  collection={collection}
  articles={formattedArticles}
>
</CollectionLayout>`;

    fs.writeFileSync(indexPath, newContent);
    console.log(`✅ Updated ${collectionSlug}/index.astro`);
    
  } catch (error) {
    console.error(`❌ Error updating ${collectionSlug}:`, error.message);
  }
}

console.log('🔧 Fixing all collection index pages...\n');

// Lister tous les dossiers de collections
const collections = fs.readdirSync(collectionsDir).filter(item => {
  const itemPath = path.join(collectionsDir, item);
  return fs.statSync(itemPath).isDirectory();
});

collections.forEach(collection => {
  updateCollectionIndexPage(collection);
});

console.log('\n✅ All collection index pages fixed!');
