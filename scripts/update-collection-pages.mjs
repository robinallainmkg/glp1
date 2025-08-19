import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des collections avec leurs couleurs et emojis
const collectionsConfig = {
  'alternatives-glp1': { 
    name: 'Alternatives Naturelles', 
    colors: 'green', 
    emoji: '🌿',
    description: 'Solutions naturelles et alternatives aux médicaments GLP-1'
  },
  'medicaments-glp1': { 
    name: 'Médicaments GLP-1', 
    colors: 'indigo', 
    emoji: '💊',
    description: 'Guide complet des médicaments GLP-1 : Ozempic, Wegovy, Mounjaro'
  },
  'glp1-diabete': { 
    name: 'Diabète & GLP-1', 
    colors: 'blue', 
    emoji: '🔬',
    description: 'Traitement du diabète type 2 avec les agonistes GLP-1'
  },
  'effets-secondaires-glp1': { 
    name: 'Effets Secondaires', 
    colors: 'red', 
    emoji: '⚠️',
    description: 'Effets secondaires et précautions des traitements GLP-1'
  },
  'glp1-cout': { 
    name: 'Prix & Coût', 
    colors: 'amber', 
    emoji: '💰',
    description: 'Prix, remboursement et coût des médicaments GLP-1 en France'
  },
  'glp1-perte-de-poids': { 
    name: 'Perte de Poids', 
    colors: 'emerald', 
    emoji: '⚖️',
    description: 'Utilisation des GLP-1 pour la perte de poids et l\'obésité'
  },
  'avant-apres-glp1': { 
    name: 'Témoignages', 
    colors: 'pink', 
    emoji: '📸',
    description: 'Témoignages et transformations avec les GLP-1'
  },
  'regime-glp1': { 
    name: 'Régime & Nutrition', 
    colors: 'orange', 
    emoji: '🥗',
    description: 'Régimes alimentaires adaptés aux traitements GLP-1'
  },
  'recherche-glp1': { 
    name: 'Recherche Scientifique', 
    colors: 'teal', 
    emoji: '🔬',
    description: 'Dernières recherches et études sur les GLP-1'
  },
  'medecins-glp1-france': { 
    name: 'Médecins en France', 
    colors: 'slate', 
    emoji: '👨‍⚕️',
    description: 'Trouver un médecin spécialisé en GLP-1 en France'
  }
};

// Générer le template d'une page de collection avec images
function generateCollectionPageTemplate(collectionSlug, config) {
  return `---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import ArticleCard from '../../../components/ArticleCard.astro';
import { getCollection } from 'astro:content';

// Récupérer tous les articles de cette collection
const articles = await getCollection('${collectionSlug}');

// Configuration des couleurs
const colors = {
  bg: '${config.colors}',
  text: '${config.colors}-800',
  badge: '${config.colors}-100'
};
---

<BaseLayout 
  title="${config.name} - Guide complet des GLP-1"
  description="${config.description}"
  keywords="${collectionSlug.replace('-', ' ')}, glp1, ${config.name.toLowerCase()}"
>

<div class="container">
  <div class="max-w-6xl mx-auto">
    
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-${config.colors}-600 to-${config.colors}-700 text-white rounded-2xl p-8 mb-8">
      <div class="flex items-center gap-4 mb-4">
        <div class="text-4xl">${config.emoji}</div>
        <h1 class="text-4xl font-bold">${config.name}</h1>
      </div>
      <p class="text-xl opacity-90 mb-4">
        ${config.description}
      </p>
      <div class="bg-white/20 rounded-lg p-4 inline-block">
        <span class="font-semibold">{articles.length} articles disponibles</span>
      </div>
    </div>

    <!-- Articles Section -->
    <section class="collection-articles">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">${config.name}</h2>
        <p class="text-lg text-gray-600">
          ${config.description}
        </p>
      </div>
      
      <!-- Grille des articles avec images -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard 
            article={article}
            collection="${collectionSlug}"
            categoryName="${config.name}"
            colors={colors}
          />
        ))}
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-12 bg-gradient-to-r from-${config.colors}-50 to-${config.colors}-100 rounded-2xl mt-12">
      <div class="text-center px-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Besoin d'informations personnalisées ?
        </h2>
        <p class="text-lg text-gray-700 mb-8">
          Consultez notre guide complet et téléchargez nos ressources gratuites.
        </p>
        <a 
          href="/guide-beaute-perte-de-poids-glp1/" 
          class="inline-flex items-center px-8 py-4 bg-${config.colors}-600 text-white font-bold rounded-xl hover:bg-${config.colors}-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
        >
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Télécharger le guide gratuit
        </a>
      </div>
    </section>
  </div>
</div>

</BaseLayout>`;
}

// Mettre à jour toutes les pages de collections
async function updateCollectionPages() {
  console.log('🚀 Mise à jour des pages de collections avec images...');
  
  // Vérifier d'abord quelles collections existent
  const contentDir = path.join(__dirname, '..', 'src', 'content');
  const existingCollections = fs.readdirSync(contentDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name !== 'config.ts');
  
  console.log('📁 Collections trouvées:', existingCollections);
  
  for (const [collectionSlug, config] of Object.entries(collectionsConfig)) {
    // Vérifier si la collection existe
    if (!existingCollections.includes(collectionSlug)) {
      console.log(`⚠️  Collection ignorée (n'existe pas): ${collectionSlug}`);
      continue;
    }
    
    const collectionDir = path.join(__dirname, '..', 'src', 'pages', 'collections', collectionSlug);
    const indexPath = path.join(collectionDir, 'index.astro');
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(collectionDir)) {
      fs.mkdirSync(collectionDir, { recursive: true });
    }
    
    // Générer et écrire le template
    const template = generateCollectionPageTemplate(collectionSlug, config);
    fs.writeFileSync(indexPath, template, 'utf8');
    
    console.log(`✅ Page mise à jour: /collections/${collectionSlug}/`);
  }
  
  console.log('🎉 Toutes les pages de collections ont été mises à jour !');
  console.log('📸 Les images AI (-illus.jpg) et SVG sont maintenant affichées avec fallback automatique');
}

// Exécuter la mise à jour
updateCollectionPages().catch(console.error);
