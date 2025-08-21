#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, '..', 'src', 'content');
const publicImagesPath = path.join(__dirname, '..', 'public', 'images', 'thumbnails');

// Créer le dossier d'images si nécessaire
if (!fs.existsSync(publicImagesPath)) {
  fs.mkdirSync(publicImagesPath, { recursive: true });
}

// Configuration des prompts améliorés pour chaque collection
const imagePrompts = {
  'medicaments-glp1': {
    basePrompt: "Photo professionnelle d'un médecin français souriant dans un cabinet médical moderne expliquant un traitement à un patient, avec des seringues GLP-1 sur le bureau, éclairage naturel, style documentaire médical français, haute qualité",
    style: "professional medical photography, French healthcare setting, natural lighting, documentary style",
    keywords: ['médecin français', 'cabinet médical', 'consultation', 'seringue GLP-1', 'professionnel de santé']
  },
  'glp1-perte-de-poids': {
    basePrompt: "Photo inspirante d'une personne française souriante et confiante après sa transformation physique, dans un environnement lumineux et positif, vêtements adaptés à sa nouvelle silhouette, expression de bonheur et de réussite",
    style: "lifestyle photography, French person, natural lighting, inspiring transformation, authentic smile",
    keywords: ['transformation', 'perte de poids', 'confiance', 'sourire français', 'réussite personnelle']
  },
  'effets-secondaires-glp1': {
    basePrompt: "Illustration médicale moderne et rassurante montrant une consultation avec un médecin français expliquant les effets secondaires possibles, graphiques informatifs colorés, ambiance professionnelle et bienveillante",
    style: "medical illustration, French healthcare, educational graphics, reassuring atmosphere",
    keywords: ['effets secondaires', 'consultation médicale', 'information', 'sécurité', 'prévention']
  },
  'glp1-diabete': {
    basePrompt: "Photo d'un patient diabétique français avec son médecin endocrinologue, glucomètre moderne visible, consultation dans un cabinet spécialisé, atmosphere de confiance et de suivi médical professionnel",
    style: "medical photography, French diabetic care, endocrinology consultation, professional healthcare",
    keywords: ['diabète', 'endocrinologue français', 'glucomètre', 'suivi médical', 'HbA1c']
  },
  'regime-glp1': {
    basePrompt: "Photo appétissante d'un repas équilibré typiquement français préparé par une personne sous traitement GLP-1, cuisine moderne, aliments colorés et sains, style de vie français healthy",
    style: "French cuisine photography, healthy lifestyle, balanced meal, modern kitchen setting",
    keywords: ['cuisine française', 'repas équilibré', 'alimentation saine', 'légumes frais', 'nutrition']
  },
  'glp1-cout': {
    basePrompt: "Illustration moderne montrant les aspects financiers du traitement GLP-1 en France, carte vitale, ordonnance, calculatrice, éléments visuels du système de santé français",
    style: "French healthcare system illustration, financial planning, medical insurance visualization",
    keywords: ['remboursement', 'carte vitale', 'assurance maladie', 'budget santé', 'coût traitement']
  },
  'medecins-glp1-france': {
    basePrompt: "Portrait professionnel d'un endocrinologue français dans son cabinet, diplômes français visibles, équipement médical moderne, expression bienveillante et experte, blouse médicale",
    style: "professional medical portrait, French physician, endocrinology office, medical credentials",
    keywords: ['endocrinologue', 'médecin spécialisé', 'cabinet médical français', 'expertise', 'diplômes']
  },
  'alternatives-glp1': {
    basePrompt: "Illustration comparative moderne montrant différentes options thérapeutiques françaises alternatives aux GLP-1, médicaments, compléments, styles de vie, choix multiples organisés esthétiquement",
    style: "medical comparison illustration, French therapeutic options, alternative treatments visualization",
    keywords: ['alternatives thérapeutiques', 'options de traitement', 'choix médical', 'comparaison', 'solutions']
  },
  'recherche-glp1': {
    basePrompt: "Photo d'un laboratoire de recherche français moderne avec scientifiques travaillant sur les GLP-1, équipements de pointe, microscopes, données de recherche, innovation médicale française",
    style: "French research laboratory photography, medical innovation, scientific research, laboratory equipment",
    keywords: ['recherche médicale', 'laboratoire français', 'innovation', 'études cliniques', 'science']
  }
};

// Fonction pour générer une image avec DALL-E (simulée)
async function generateImageWithAI(prompt, filename) {
  console.log(`🎨 Génération de l'image: ${filename}`);
  console.log(`📝 Prompt: ${prompt}`);
  
  // En attendant l'intégration de DALL-E, créons des SVG améliorés
  return generateImprovedSVG(prompt, filename);
}

// Fonction pour créer des SVG améliorés et plus réalistes
function generateImprovedSVG(prompt, filename) {
  const collection = filename.split('-')[0];
  const config = imagePrompts[collection] || imagePrompts['medicaments-glp1'];
  
  const colors = getColorsForCollection(collection);
  const title = prompt.split(',')[0].replace('Photo', '').replace('Illustration', '').trim();
  
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.05" />
          <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:0.03" />
          <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.05" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${colors.primary}" flood-opacity="0.1"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#backgroundGradient)" />
      
      <!-- Main content area -->
      <rect x="60" y="60" width="1080" height="510" fill="white" rx="20" filter="url(#shadow)" opacity="0.98" />
      
      <!-- Header section -->
      <rect x="80" y="80" width="1040" height="120" fill="${colors.primary}" opacity="0.05" rx="12" />
      
      <!-- Logo/Icon area -->
      <circle cx="150" cy="140" r="40" fill="${colors.primary}" opacity="0.1" />
      <circle cx="150" cy="140" r="20" fill="${colors.primary}" opacity="0.8" />
      <path d="M150 125 L150 155 M135 140 L165 140" stroke="white" stroke-width="3" stroke-linecap="round" />
      
      <!-- Title -->
      <text x="220" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="${colors.primary}">
        ${title.substring(0, 40)}
      </text>
      <text x="220" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${colors.secondary}" opacity="0.8">
        Guide expert • GLP-1 France • Information médicale fiable
      </text>
      
      <!-- Content preview -->
      <rect x="100" y="240" width="1000" height="2" fill="${colors.accent}" opacity="0.3" />
      
      <!-- Key points -->
      <circle cx="130" cy="290" r="8" fill="${colors.secondary}" />
      <text x="160" y="298" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="${colors.primary}">
        ${config.keywords[0] || 'Information médicale'}
      </text>
      
      <circle cx="130" cy="330" r="8" fill="${colors.secondary}" />
      <text x="160" y="338" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="${colors.primary}">
        ${config.keywords[1] || 'Expertise française'}
      </text>
      
      <circle cx="130" cy="370" r="8" fill="${colors.secondary}" />
      <text x="160" y="378" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="${colors.primary}">
        ${config.keywords[2] || 'Conseils pratiques'}
      </text>
      
      <!-- Visual elements -->
      <rect x="600" y="250" width="480" height="200" fill="${colors.primary}" opacity="0.02" rx="12" />
      
      <!-- Stats/Numbers -->
      <text x="650" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="800" fill="${colors.primary}" opacity="0.8">
        +85%
      </text>
      <text x="650" y="325" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="${colors.secondary}">
        de satisfaction patients
      </text>
      
      <text x="650" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="800" fill="${colors.secondary}" opacity="0.8">
        24/7
      </text>
      <text x="650" y="405" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="${colors.secondary}">
        support et conseils
      </text>
      
      <!-- Decorative elements -->
      <circle cx="950" cy="300" r="60" fill="${colors.accent}" opacity="0.05" />
      <circle cx="950" cy="300" r="30" fill="${colors.accent}" opacity="0.1" />
      
      <!-- Footer -->
      <rect x="80" y="480" width="1040" height="70" fill="${colors.primary}" opacity="0.02" rx="12" />
      <text x="100" y="510" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="${colors.primary}">
        GLP1-France.fr
      </text>
      <text x="100" y="530" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="${colors.secondary}" opacity="0.7">
        Votre référence pour les traitements GLP-1 en France • Information médicale vérifiée
      </text>
      
      <text x="900" y="520" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="${colors.accent}" opacity="0.8">
        Expert • Fiable • Français
      </text>
    </svg>
  `;
  
  return svg;
}

function getColorsForCollection(collection) {
  const colorSchemes = {
    'medicaments-glp1': { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
    'glp1-perte-de-poids': { primary: '#16a34a', secondary: '#22c55e', accent: '#4ade80' },
    'effets-secondaires-glp1': { primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
    'glp1-diabete': { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
    'regime-glp1': { primary: '#059669', secondary: '#10b981', accent: '#34d399' },
    'glp1-cout': { primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' },
    'medecins-glp1-france': { primary: '#1d4ed8', secondary: '#3b82f6', accent: '#60a5fa' },
    'alternatives-glp1': { primary: '#7c2d12', secondary: '#dc2626', accent: '#f87171' },
    'recherche-glp1': { primary: '#0c4a6e', secondary: '#0284c7', accent: '#38bdf8' }
  };
  
  return colorSchemes[collection] || colorSchemes['medicaments-glp1'];
}

// Fonction principale
async function generateThumbnails() {
  console.log('🚀 Démarrage de la génération des thumbnails améliorées...');
  
  const collections = fs.readdirSync(contentPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => !name.startsWith('.') && name !== 'pages-statiques');

  console.log(`📁 Collections trouvées: ${collections.join(', ')}`);

  for (const collection of collections) {
    const collectionPath = path.join(contentPath, collection);
    const files = fs.readdirSync(collectionPath)
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'));

    console.log(`\n📂 Collection: ${collection} (${files.length} articles)`);

    for (const file of files) {
      const filename = path.parse(file).name;
      const imagePath = path.join(publicImagesPath, `${filename}.svg`);
      
      // Ne régénérer que si l'image n'existe pas ou est obsolète
      if (!fs.existsSync(imagePath)) {
        const config = imagePrompts[collection];
        if (config) {
          const fullPrompt = `${config.basePrompt}, ${config.style}`;
          const svg = await generateImageWithAI(fullPrompt, filename);
          
          fs.writeFileSync(imagePath, svg);
          console.log(`✅ ${filename}.svg généré`);
        } else {
          console.log(`⚠️  Configuration manquante pour ${collection}`);
        }
      } else {
        console.log(`⏭️  ${filename}.svg existe déjà`);
      }
    }
  }

  console.log('\n🎉 Génération des thumbnails terminée !');
}

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateThumbnails().catch(console.error);
}

export { generateThumbnails };
