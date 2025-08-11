import fs from 'fs';
import path from 'path';

console.log('🔧 Génération des pages de collection dynamiques...');

const collectionsPath = 'src/content';
const pagesPath = 'src/pages';

// Configuration des collections
const collectionsConfig = {
  'alternatives-glp1': {
    title: 'Alternatives Naturelles aux GLP-1',
    description: 'Découvrez les alternatives naturelles aux médicaments GLP-1 : plantes, suppléments et approches complémentaires.',
    icon: '🌿',
    color: 'from-green-600 to-emerald-600'
  },
  'medicaments-glp1': {
    title: 'Médicaments GLP-1',
    description: 'Guide complet des traitements GLP-1 disponibles en France : Ozempic, Wegovy, Mounjaro et leurs caractéristiques.',
    icon: '💊',
    color: 'from-blue-600 to-purple-600'
  },
  'glp1-cout': {
    title: 'Prix et Coûts GLP-1',
    description: 'Informations sur les prix, remboursements et coûts des traitements GLP-1 en France.',
    icon: '💰',
    color: 'from-amber-600 to-orange-600'
  },
  'glp1-diabete': {
    title: 'GLP-1 et Diabète',
    description: 'Tout savoir sur l\'utilisation des GLP-1 dans le traitement du diabète de type 2.',
    icon: '🩺',
    color: 'from-red-600 to-pink-600'
  },
  'glp1-perte-de-poids': {
    title: 'GLP-1 pour la Perte de Poids',
    description: 'Guide complet sur l\'utilisation des GLP-1 pour la perte de poids et l\'obésité.',
    icon: '⚖️',
    color: 'from-purple-600 to-pink-600'
  },
  'effets-secondaires-glp1': {
    title: 'Effets Secondaires GLP-1',
    description: 'Informations complètes sur les effets secondaires et la sécurité des traitements GLP-1.',
    icon: '⚠️',
    color: 'from-red-600 to-rose-600'
  },
  'medecins-glp1-france': {
    title: 'Médecins Spécialisés GLP-1',
    description: 'Trouvez des médecins spécialisés dans les traitements GLP-1 partout en France.',
    icon: '👨‍⚕️',
    color: 'from-teal-600 to-cyan-600'
  },
  'regime-glp1': {
    title: 'Régimes et Nutrition GLP-1',
    description: 'Conseils nutritionnels et régimes alimentaires adaptés aux traitements GLP-1.',
    icon: '🥗',
    color: 'from-green-600 to-lime-600'
  },
  'recherche-glp1': {
    title: 'Recherche et Science GLP-1',
    description: 'Dernières recherches scientifiques et avancées dans le domaine des GLP-1.',
    icon: '🔬',
    color: 'from-indigo-600 to-blue-600'
  }
};

function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

function extractTitle(frontmatter) {
  let titleMatch = frontmatter.match(/^title:\s*["']([^"']+)["']/m);
  if (!titleMatch) {
    titleMatch = frontmatter.match(/^title:\s*([^"\n]+)/m);
  }
  return titleMatch ? titleMatch[1].trim() : '';
}

function extractDescription(frontmatter) {
  let descMatch = frontmatter.match(/^description:\s*["']([^"']+)["']/m);
  if (!descMatch) {
    descMatch = frontmatter.match(/^description:\s*([^"\n]+)/m);
  }
  return descMatch ? descMatch[1].trim() : '';
}

function extractAuthor(frontmatter) {
  let authorMatch = frontmatter.match(/^author:\s*["']([^"']+)["']/m);
  if (!authorMatch) {
    authorMatch = frontmatter.match(/^author:\s*([^"\n]+)/m);
  }
  return authorMatch ? authorMatch[1].trim() : 'Équipe Médicale';
}

function extractReadingTime(frontmatter) {
  let timeMatch = frontmatter.match(/^readingTime:\s*(\d+)/m);
  return timeMatch ? timeMatch[1] : '5';
}

function generateCollectionPage(collectionName, config) {
  const collectionPath = path.join(collectionsPath, collectionName);
  
  if (!fs.existsSync(collectionPath)) {
    console.log(`  ❌ Collection ${collectionName}: Dossier non trouvé`);
    return;
  }

  const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.md'));
  
  if (files.length === 0) {
    console.log(`  ⚪ Collection ${collectionName}: Aucun article`);
    return;
  }

  // Charger les métadonnées des articles
  const articles = files.map(file => {
    const filePath = path.join(collectionPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter } = extractFrontmatter(content);
    
    const slug = file.replace('.md', '');
    const title = extractTitle(frontmatter) || slug;
    const description = extractDescription(frontmatter) || 'Guide complet et informations pratiques.';
    const author = extractAuthor(frontmatter);
    const readingTime = extractReadingTime(frontmatter);
    
    return {
      slug,
      title,
      description,
      author,
      readingTime,
      url: `/${collectionName}/${slug}/`
    };
  });

  // Générer le contenu de la page
  const pageContent = `---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout 
  title="${config.title} - Guide Complet"
  description="${config.description}"
  keywords="${collectionName}, GLP-1, guide, France"
>

<div class="container">
  <div class="max-w-6xl mx-auto">
    
    <!-- Hero Section -->
    <div class="bg-gradient-to-r ${config.color} text-white rounded-2xl p-8 mb-8">
      <div class="flex items-center gap-4 mb-4">
        <div class="text-4xl">${config.icon}</div>
        <h1 class="text-4xl font-bold">${config.title}</h1>
      </div>
      <p class="text-xl opacity-90 mb-4">
        ${config.description}
      </p>
      <div class="bg-white/20 rounded-lg p-4 inline-block">
        <span class="font-semibold">${articles.length} article${articles.length > 1 ? 's' : ''} disponible${articles.length > 1 ? 's' : ''}</span>
      </div>
    </div>

    <!-- Grille des articles -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${articles.map(article => `
      <article class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center text-white text-xl">
              ${config.icon}
            </div>
            <div class="flex-1">
              <span class="text-sm text-gray-500 font-medium">${collectionName.toUpperCase()}</span>
            </div>
          </div>
          
          <h2 class="text-xl font-bold text-gray-900 mb-3 leading-tight">
            <a href="${article.url}" class="hover:text-blue-600 transition-colors">
              ${article.title}
            </a>
          </h2>
          
          <p class="text-gray-600 mb-4 text-sm leading-relaxed">
            ${article.description}
          </p>
          
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <span class="text-sm text-gray-500">
              ${article.author}
            </span>
            <span class="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              ${article.readingTime} min
            </span>
          </div>
        </div>
      </article>`).join('\n      ')}
    </div>

    <!-- Navigation connexe -->
    <div class="mt-12 p-6 bg-gray-50 rounded-xl">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Explorez d'autres sections</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="/medicaments-glp1/" class="text-center p-3 bg-white rounded-lg hover:shadow-md transition-all">
          <div class="text-2xl mb-2">💊</div>
          <div class="text-sm font-medium">Médicaments</div>
        </a>
        <a href="/alternatives-glp1/" class="text-center p-3 bg-white rounded-lg hover:shadow-md transition-all">
          <div class="text-2xl mb-2">🌿</div>
          <div class="text-sm font-medium">Alternatives</div>
        </a>
        <a href="/glp1-cout/" class="text-center p-3 bg-white rounded-lg hover:shadow-md transition-all">
          <div class="text-2xl mb-2">💰</div>
          <div class="text-sm font-medium">Prix</div>
        </a>
        <a href="/medecins-glp1-france/" class="text-center p-3 bg-white rounded-lg hover:shadow-md transition-all">
          <div class="text-2xl mb-2">👨‍⚕️</div>
          <div class="text-sm font-medium">Médecins</div>
        </a>
      </div>
    </div>

  </div>
</div>

</BaseLayout>`;

  // Sauvegarder la page
  const outputPath = path.join(pagesPath, collectionName, 'index.astro');
  fs.writeFileSync(outputPath, pageContent, 'utf-8');
  
  console.log(`  ✅ ${collectionName}: ${articles.length} articles générés`);
}

// Générer toutes les pages de collection
let totalGenerated = 0;

for (const [collectionName, config] of Object.entries(collectionsConfig)) {
  generateCollectionPage(collectionName, config);
  totalGenerated++;
}

console.log(`\n🎯 GÉNÉRATION TERMINÉE`);
console.log(`====================`);
console.log(`✅ ${totalGenerated} pages de collection générées`);
console.log(`📄 Toutes les collections affichent maintenant leurs articles complets`);
console.log(`🚀 Rebuilder le site pour voir les changements !`);
