import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des collections avec leurs couleurs et icônes originales
const collectionsConfig = {
  'alternatives-glp1': {
    icon: '🌿',
    gradient: 'from-green-600 to-emerald-600',
    title: 'Alternatives Naturelles aux GLP-1',
    description: 'Découvrez les alternatives naturelles aux médicaments GLP-1 : plantes, suppléments et approches complémentaires.',
    label: 'ALTERNATIVES-GLP1'
  },
  'medicaments-glp1': {
    icon: '💊',
    gradient: 'from-blue-600 to-purple-600',
    title: 'Médicaments GLP-1',
    description: 'Guide complet des traitements GLP-1 disponibles en France : Ozempic, Wegovy, Mounjaro et leurs caractéristiques.',
    label: 'MEDICAMENTS-GLP1'
  },
  'glp1-cout': {
    icon: '💰',
    gradient: 'from-yellow-500 to-orange-500',
    title: 'Coût des Traitements GLP-1',
    description: 'Prix, remboursement et coût réel des traitements GLP-1 en France : guide économique complet.',
    label: 'GLP1-COUT'
  },
  'glp1-diabete': {
    icon: '🩺',
    gradient: 'from-red-500 to-pink-500',
    title: 'GLP-1 et Diabète',
    description: 'Rôle des agonistes GLP-1 dans le traitement du diabète de type 2 : efficacité, sécurité et recommandations.',
    label: 'GLP1-DIABETE'
  },
  'glp1-perte-de-poids': {
    icon: '⚖️',
    gradient: 'from-purple-500 to-indigo-500',
    title: 'GLP-1 et Perte de Poids',
    description: 'Mécanismes et efficacité des GLP-1 pour la perte de poids : guide médical et nutritionnel.',
    label: 'GLP1-PERTE-DE-POIDS'
  },
  'effets-secondaires-glp1': {
    icon: '⚠️',
    gradient: 'from-orange-500 to-red-500',
    title: 'Effets Secondaires des GLP-1',
    description: 'Effets indésirables, contre-indications et surveillance des traitements GLP-1 : guide sécuritaire.',
    label: 'EFFETS-SECONDAIRES-GLP1'
  },
  'medecins-glp1-france': {
    icon: '👨‍⚕️',
    gradient: 'from-teal-500 to-cyan-500',
    title: 'Médecins GLP-1 en France',
    description: 'Trouver un spécialiste GLP-1 : endocrinologues, diabétologues et centres spécialisés en France.',
    label: 'MEDECINS-GLP1-FRANCE'
  },
  'regime-glp1': {
    icon: '🥗',
    gradient: 'from-lime-500 to-green-500',
    title: 'Régime et Nutrition GLP-1',
    description: 'Conseils nutritionnels et régimes adaptés aux traitements GLP-1 : optimiser l\'efficacité thérapeutique.',
    label: 'REGIME-GLP1'
  },
  'recherche-glp1': {
    icon: '🔬',
    gradient: 'from-indigo-500 to-blue-500',
    title: 'Recherche et Innovation GLP-1',
    description: 'Dernières avancées scientifiques et innovations dans le domaine des agonistes GLP-1.',
    label: 'RECHERCHE-GLP1'
  }
};

// Fonction pour lire le frontmatter d'un fichier markdown
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  });
  
  return frontmatter;
}

// Fonction pour obtenir les métadonnées d'un article
function getArticleMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);
    
    if (!frontmatter) return null;
    
    return {
      title: frontmatter.title || 'Sans titre',
      description: frontmatter.description || 'Description non disponible',
      author: frontmatter.author || 'Équipe éditoriale',
      readingTime: frontmatter.readingTime || frontmatter.reading_time || '5 min'
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour générer une page de collection avec le design original
function generateCollectionPage(collectionName, config) {
  const contentDir = path.join(__dirname, '..', 'src', 'content', collectionName);
  const outputPath = path.join(__dirname, '..', 'src', 'pages', collectionName, 'index.astro');
  
  if (!fs.existsSync(contentDir)) {
    console.error(`Le dossier de contenu ${contentDir} n'existe pas.`);
    return;
  }
  
  // Lire tous les fichiers markdown
  const articles = [];
  const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
  
  files.forEach(file => {
    const filePath = path.join(contentDir, file);
    const metadata = getArticleMetadata(filePath);
    
    if (metadata) {
      const slug = file.replace('.md', '');
      articles.push({
        slug,
        title: metadata.title,
        description: metadata.description,
        author: metadata.author,
        readingTime: metadata.readingTime,
        url: `/${collectionName}/${slug}/`
      });
    }
  });
  
  console.log(`Collection ${collectionName}: ${articles.length} articles trouvés`);
  
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
    <div class="bg-gradient-to-r ${config.gradient} text-white rounded-2xl p-8 mb-8">
      <div class="flex items-center gap-4 mb-4">
        <div class="text-4xl">${config.icon}</div>
        <h1 class="text-4xl font-bold">${config.title}</h1>
      </div>
      <p class="text-xl opacity-90 mb-4">
        ${config.description}
      </p>
      <div class="bg-white/20 rounded-lg p-4 inline-block">
        <span class="font-semibold">${articles.length} articles disponibles</span>
      </div>
    </div>

    <!-- Grille des articles -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${articles.map(article => `
      <article class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center text-white text-xl">
              ${config.icon}
            </div>
            <div class="flex-1">
              <span class="text-sm text-gray-500 font-medium">${config.label}</span>
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
              ${article.readingTime}
            </span>
          </div>
        </div>
      </article>`).join('\n      ')}
    </div>
    
  </div>
</div>

</BaseLayout>`;

  // Créer le dossier de destination s'il n'existe pas
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Écrire le fichier
  fs.writeFileSync(outputPath, pageContent, 'utf-8');
  console.log(`✅ Page générée: ${outputPath}`);
}

// Générer toutes les pages de collection
console.log('🎨 Restauration du design original des collections...\n');

Object.entries(collectionsConfig).forEach(([collectionName, config]) => {
  generateCollectionPage(collectionName, config);
});

console.log('\n✅ Restauration terminée ! Toutes les collections ont retrouvé leur design original.');
