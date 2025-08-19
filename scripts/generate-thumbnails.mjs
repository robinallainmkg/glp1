#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, '..', 'src', 'content');
const publicImagesPath = path.join(__dirname, '..', 'public', 'images', 'thumbnails');

// Créer le dossier d'images si nécessaire
if (!fs.existsSync(publicImagesPath)) {
  fs.mkdirSync(publicImagesPath, { recursive: true });
}

// Configuration des styles d'images par collection
const imageStyles = {
  'medicaments-glp1': {
    type: 'photo',
    subject: 'médical',
    description: 'Photo réaliste d\'une consultation médicale avec un professionnel de santé expliquant des médicaments GLP-1 à un patient dans un cabinet médical moderne',
    colors: ['#2563eb', '#3b82f6', '#ffffff'],
    keywords: ['médecin', 'patient', 'consultation', 'médicaments', 'seringue', 'cabinet médical']
  },
  'glp1-perte-de-poids': {
    type: 'photo',
    subject: 'transformation',
    description: 'Photo réaliste d\'une personne souriante montrant sa transformation physique, avant/après perte de poids, dans un environnement lumineux et positif',
    colors: ['#16a34a', '#22c55e', '#ffffff'],
    keywords: ['transformation', 'perte de poids', 'sourire', 'confiance', 'avant après', 'succès']
  },
  'effets-secondaires-glp1': {
    type: 'illustration',
    subject: 'médical-éducatif',
    description: 'Illustration moderne et rassurante montrant les effets secondaires des GLP-1 de manière éducative avec des icônes médicales colorées',
    colors: ['#dc2626', '#ef4444', '#f87171'],
    keywords: ['effets secondaires', 'information', 'prévention', 'santé', 'éducation médicale']
  },
  'glp1-diabete': {
    type: 'photo',
    subject: 'suivi-médical',
    description: 'Photo réaliste d\'un patient diabétique avec un glucomètre et un professionnel de santé dans un cadre médical rassurant',
    colors: ['#7c3aed', '#8b5cf6', '#ffffff'],
    keywords: ['diabète', 'glucomètre', 'glycémie', 'suivi médical', 'contrôle', 'HbA1c']
  },
  'regime-glp1': {
    type: 'photo',
    subject: 'nutrition',
    description: 'Photo réaliste d\'aliments sains et équilibrés disposés esthétiquement avec une personne préparant un repas nutritif',
    colors: ['#059669', '#10b981', '#ffffff'],
    keywords: ['nutrition', 'aliments sains', 'équilibré', 'cuisine', 'légumes', 'protéines']
  },
  'glp1-cout': {
    type: 'illustration',
    subject: 'finance-santé',
    description: 'Illustration moderne montrant le coût des traitements GLP-1 avec des éléments visuels de budget, carte vitale et médicaments',
    colors: ['#ea580c', '#f97316', '#ffffff'],
    keywords: ['coût', 'prix', 'remboursement', 'assurance maladie', 'budget santé', 'économies']
  },
  'medecins-glp1-france': {
    type: 'photo',
    subject: 'professionnel',
    description: 'Photo réaliste d\'un médecin spécialisé en endocrinologie dans son cabinet avec des diplômes et équipements médicaux modernes',
    colors: ['#1d4ed8', '#3b82f6', '#ffffff'],
    keywords: ['médecin', 'endocrinologue', 'spécialiste', 'cabinet', 'diplômes', 'expertise']
  },
  'alternatives-glp1': {
    type: 'illustration',
    subject: 'comparaison',
    description: 'Illustration moderne montrant différentes alternatives aux GLP-1 avec des symboles de traitement et de choix thérapeutiques',
    colors: ['#7c2d12', '#dc2626', '#ffffff'],
    keywords: ['alternatives', 'options', 'traitement', 'choix', 'comparaison', 'thérapies']
  },
  'recherche-glp1': {
    type: 'illustration',
    subject: 'scientifique',
    description: 'Illustration moderne d\'un laboratoire de recherche avec des scientifiques étudiant les GLP-1, microscopes et données',
    colors: ['#0c4a6e', '#0284c7', '#ffffff'],
    keywords: ['recherche', 'science', 'laboratoire', 'études', 'innovation', 'découvertes']
  }
};

// Templates SVG pour les différents types d'images
const svgTemplates = {
  medical: (title, colors, keywords) => `
    <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:0.05" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg)" />
      <rect x="20" y="20" width="360" height="210" fill="${colors[2]}" rx="12" opacity="0.95" />
      
      <!-- Icône médicale -->
      <circle cx="80" cy="80" r="25" fill="${colors[0]}" opacity="0.2" />
      <path d="M80 65 L80 95 M65 80 L95 80" stroke="${colors[0]}" stroke-width="3" stroke-linecap="round" />
      
      <!-- Titre -->
      <text x="120" y="70" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${colors[0]}">
        ${title.substring(0, 30)}${title.length > 30 ? '...' : ''}
      </text>
      <text x="120" y="90" font-family="Arial, sans-serif" font-size="12" fill="${colors[0]}" opacity="0.7">
        Guide complet et informations pratiques
      </text>
      
      <!-- Éléments décoratifs -->
      <circle cx="350" cy="60" r="15" fill="${colors[1]}" opacity="0.3" />
      <circle cx="340" cy="200" r="20" fill="${colors[0]}" opacity="0.2" />
      
      <!-- Ligne de séparation -->
      <line x1="40" y1="130" x2="360" y2="130" stroke="${colors[1]}" stroke-width="2" opacity="0.3" />
      
      <!-- Tags -->
      <rect x="40" y="150" width="60" height="20" fill="${colors[0]}" opacity="0.1" rx="10" />
      <text x="70" y="163" font-family="Arial, sans-serif" font-size="10" fill="${colors[0]}" text-anchor="middle">
        ${keywords[0] || 'GLP-1'}
      </text>
      
      <rect x="110" y="150" width="70" height="20" fill="${colors[1]}" opacity="0.1" rx="10" />
      <text x="145" y="163" font-family="Arial, sans-serif" font-size="10" fill="${colors[1]}" text-anchor="middle">
        ${keywords[1] || 'Santé'}
      </text>
      
      <!-- Logo/watermark -->
      <text x="300" y="230" font-family="Arial, sans-serif" font-size="10" fill="${colors[0]}" opacity="0.5">
        GLP1-France.fr
      </text>
    </svg>
  `,
  
  transformation: (title, colors, keywords) => `
    <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:0.05" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg)" />
      <rect x="20" y="20" width="360" height="210" fill="${colors[2]}" rx="12" opacity="0.95" />
      
      <!-- Graphique de progression -->
      <polyline points="50,180 100,150 150,120 200,100 250,80 300,60" 
                stroke="${colors[0]}" stroke-width="4" fill="none" stroke-linecap="round" />
      
      <!-- Points de progression -->
      <circle cx="50" cy="180" r="6" fill="${colors[0]}" />
      <circle cx="150" cy="120" r="6" fill="${colors[0]}" />
      <circle cx="250" cy="80" r="6" fill="${colors[0]}" />
      <circle cx="300" cy="60" r="8" fill="${colors[1]}" />
      
      <!-- Titre -->
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${colors[0]}">
        ${title.substring(0, 25)}${title.length > 25 ? '...' : ''}
      </text>
      
      <!-- Icône succès -->
      <circle cx="320" cy="40" r="15" fill="${colors[1]}" opacity="0.2" />
      <path d="M315 40 L318 43 L325 36" stroke="${colors[1]}" stroke-width="2" fill="none" stroke-linecap="round" />
      
      <!-- Statistique -->
      <text x="320" y="200" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${colors[0]}" text-anchor="middle">
        -15kg
      </text>
      <text x="320" y="220" font-family="Arial, sans-serif" font-size="12" fill="${colors[0]}" text-anchor="middle" opacity="0.7">
        Résultat moyen
      </text>
      
      <!-- Tags -->
      <rect x="50" y="200" width="80" height="18" fill="${colors[0]}" opacity="0.1" rx="9" />
      <text x="90" y="212" font-family="Arial, sans-serif" font-size="10" fill="${colors[0]}" text-anchor="middle">
        ${keywords[0] || 'Perte de poids'}
      </text>
    </svg>
  `,
  
  educational: (title, colors, keywords) => `
    <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:0.05" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg)" />
      <rect x="20" y="20" width="360" height="210" fill="${colors[2]}" rx="12" opacity="0.95" />
      
      <!-- Icône livre/éducation -->
      <rect x="60" y="60" width="40" height="50" fill="${colors[0]}" opacity="0.1" rx="3" />
      <line x1="65" y1="70" x2="95" y2="70" stroke="${colors[0]}" stroke-width="2" opacity="0.3" />
      <line x1="65" y1="80" x2="90" y2="80" stroke="${colors[0]}" stroke-width="2" opacity="0.3" />
      <line x1="65" y1="90" x2="95" y2="90" stroke="${colors[0]}" stroke-width="2" opacity="0.3" />
      
      <!-- Titre -->
      <text x="120" y="70" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${colors[0]}">
        ${title.substring(0, 30)}${title.length > 30 ? '...' : ''}
      </text>
      <text x="120" y="90" font-family="Arial, sans-serif" font-size="12" fill="${colors[0]}" opacity="0.7">
        Information médicale fiable
      </text>
      
      <!-- Éléments informatifs -->
      <circle cx="320" cy="80" r="3" fill="${colors[1]}" />
      <circle cx="330" cy="90" r="3" fill="${colors[1]}" />
      <circle cx="340" cy="100" r="3" fill="${colors[1]}" />
      
      <!-- Section points clés -->
      <rect x="50" y="140" width="300" height="80" fill="${colors[0]}" opacity="0.05" rx="8" />
      <text x="60" y="160" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${colors[0]}">
        Points clés à retenir :
      </text>
      
      <circle cx="70" cy="180" r="2" fill="${colors[1]}" />
      <text x="80" y="185" font-family="Arial, sans-serif" font-size="11" fill="${colors[0]}">
        Informations validées médicalement
      </text>
      
      <circle cx="70" cy="200" r="2" fill="${colors[1]}" />
      <text x="80" y="205" font-family="Arial, sans-serif" font-size="11" fill="${colors[0]}">
        Guide pratique et accessible
      </text>
    </svg>
  `
};

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

// Fonction pour extraire le titre
function extractTitle(frontmatter) {
  let titleMatch = frontmatter.match(/^title:\s*["']([^"']+)["']/m);
  if (!titleMatch) {
    titleMatch = frontmatter.match(/^title:\s*([^"\n]+)/m);
  }
  return titleMatch ? titleMatch[1].trim() : '';
}

// Fonction pour générer une image SVG
function generateThumbnail(collection, title, slug) {
  const style = imageStyles[collection] || imageStyles['medicaments-glp1'];
  const templateKey = style.subject.includes('transformation') ? 'transformation' : 
                     style.subject.includes('éducatif') ? 'educational' : 'medical';
  
  const svgContent = svgTemplates[templateKey](title, style.colors, style.keywords);
  
  const filename = `${collection}-${slug}.svg`;
  const filepath = path.join(publicImagesPath, filename);
  
  fs.writeFileSync(filepath, svgContent);
  
  return `/images/thumbnails/${filename}`;
}

// Fonction pour mettre à jour le frontmatter avec l'image
function updateArticleWithThumbnail(filePath, imagePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = extractFrontmatter(content);
  
  // Vérifier si l'image existe déjà
  if (frontmatter.includes('image:') || frontmatter.includes('thumbnail:')) {
    return false; // Ne pas écraser l'image existante
  }
  
  // Ajouter le champ image au frontmatter
  const updatedFrontmatter = frontmatter + `\nimage: "${imagePath}"`;
  const updatedContent = `---\n${updatedFrontmatter}\n---\n${body}`;
  
  fs.writeFileSync(filePath, updatedContent);
  return true;
}

// Fonction principale
function generateAllThumbnails() {
  console.log('🎨 Génération des thumbnails pour les articles...\n');
  
  const collections = fs.readdirSync(contentPath).filter(dir => 
    fs.statSync(path.join(contentPath, dir)).isDirectory() && dir !== 'config.ts'
  );
  
  let totalGenerated = 0;
  let totalSkipped = 0;
  
  collections.forEach(collection => {
    const collectionPath = path.join(contentPath, collection);
    const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.md'));
    
    if (files.length === 0) {
      console.log(`  ⚪ ${collection}: Aucun article`);
      return;
    }
    
    console.log(`📁 ${collection}:`);
    
    files.forEach(file => {
      const filePath = path.join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter } = extractFrontmatter(content);
      const title = extractTitle(frontmatter);
      const slug = file.replace('.md', '');
      
      if (!title) {
        console.log(`  ❌ ${file}: Titre manquant`);
        return;
      }
      
      // Générer l'image
      const imagePath = generateThumbnail(collection, title, slug);
      
      // Mettre à jour l'article
      const updated = updateArticleWithThumbnail(filePath, imagePath);
      
      if (updated) {
        console.log(`  ✅ ${file}: Thumbnail généré → ${imagePath}`);
        totalGenerated++;
      } else {
        console.log(`  ⏭️  ${file}: Image déjà existante`);
        totalSkipped++;
      }
    });
    
    console.log('');
  });
  
  console.log(`\n📊 Résumé :`);
  console.log(`  • ${totalGenerated} thumbnails générés`);
  console.log(`  • ${totalSkipped} articles déjà avec image`);
  console.log(`  • Images sauvegardées dans: /public/images/thumbnails/`);
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllThumbnails();
}

export { generateAllThumbnails, generateThumbnail };
