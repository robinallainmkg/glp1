// 🖼️ GÉNÉRATION D'IMAGES ARTICLES AVEC GROK
// Identifier les articles sans images et créer des prompts pour Grok

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🖼️ GÉNÉRATION D\'IMAGES ARTICLES AVEC GROK\n');

// Fonction pour vérifier si une image existe
function imageExists(imagePath) {
  const fullPath = join(rootDir, 'public', imagePath);
  return fs.existsSync(fullPath);
}

// Fonction pour extraire les informations d'un article
function extractArticleInfo(content, filePath) {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  const frontmatter = frontmatterMatch[1];
  const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
  const thumbnailMatch = frontmatter.match(/thumbnail:\s*["']?([^"'\n]+)["']?/);
  const slugMatch = frontmatter.match(/slug:\s*["']?([^"'\n]+)["']?/);
  const categoryMatch = frontmatter.match(/category:\s*["']?([^"'\n]+)["']?/);
  const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/s);
  
  return {
    file: filePath,
    title: titleMatch ? titleMatch[1].trim() : null,
    thumbnail: thumbnailMatch ? thumbnailMatch[1].trim() : null,
    slug: slugMatch ? slugMatch[1].trim() : null,
    category: categoryMatch ? categoryMatch[1].trim() : null,
    tags: tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim().replace(/["']/g, '')) : [],
    content: content.slice(frontmatterMatch[0].length).trim()
  };
}

// Fonction pour générer un prompt Grok pour une image d'article
function generateGrokPrompt(articleInfo) {
  const { title, category, tags, slug } = articleInfo;
  
  // Extraire les mots-clés principaux
  const keyMedicaments = ['ozempic', 'wegovy', 'mounjaro', 'saxenda', 'semaglutide', 'dulaglutide', 'liraglutide', 'tirzepatide'];
  const foundMedicaments = keyMedicaments.filter(med => 
    title.toLowerCase().includes(med) || slug.toLowerCase().includes(med)
  );
  
  const isAboutSideEffects = title.toLowerCase().includes('effet') || title.toLowerCase().includes('danger');
  const isAboutPrice = title.toLowerCase().includes('prix') || title.toLowerCase().includes('coût');
  const isAboutWeight = title.toLowerCase().includes('perte') || title.toLowerCase().includes('maigrir');
  const isGuide = title.toLowerCase().includes('guide');
  
  let prompt = "Créer une illustration moderne et professionnelle pour un article médical sur ";
  
  // Ajouter le contexte principal
  if (foundMedicaments.length > 0) {
    prompt += `${foundMedicaments[0].toUpperCase()} (médicament GLP-1)`;
  } else {
    prompt += "les médicaments GLP-1";
  }
  
  // Ajouter le type d'article
  if (isAboutSideEffects) {
    prompt += " concernant les effets secondaires et la sécurité";
  } else if (isAboutPrice) {
    prompt += " concernant les prix et le remboursement";
  } else if (isAboutWeight) {
    prompt += " pour la perte de poids et l'amaigrissement";
  } else if (isGuide) {
    prompt += " - guide complet d'information";
  }
  
  prompt += ". Style : ";
  prompt += "illustration vectorielle moderne, couleurs bleu médical et vert santé, ";
  prompt += "éléments visuels : stylo d'injection, molécules, graphiques de perte de poids, ";
  prompt += "design épuré et professionnel, adapté pour un site médical français. ";
  prompt += "Format : 16:9, high quality, pas de texte dans l'image.";
  
  return prompt;
}

// Fonction pour analyser les images manquantes
async function analyzeImages() {
  const collections = ['glp1-perte-de-poids', 'medicaments-glp1', 'effets-secondaires-glp1', 'guide-glp1'];
  const missingImages = [];
  const existingImages = [];
  
  for (const collection of collections) {
    const collectionPath = join(rootDir, 'src', 'content', collection);
    
    if (!fs.existsSync(collectionPath)) continue;
    
    const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.md'));
    
    console.log(`\n📁 Collection: ${collection} (${files.length} articles)`);
    
    for (const file of files) {
      const filePath = join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const articleInfo = extractArticleInfo(content, `${collection}/${file}`);
      
      if (!articleInfo || !articleInfo.thumbnail) continue;
      
      const imageExists = fs.existsSync(join(rootDir, 'public', articleInfo.thumbnail));
      
      if (imageExists) {
        existingImages.push(articleInfo);
        console.log(`✅ ${file} - ${articleInfo.thumbnail}`);
      } else {
        missingImages.push(articleInfo);
        console.log(`❌ ${file} - ${articleInfo.thumbnail} (MANQUANT)`);
      }
    }
  }
  
  return { missingImages, existingImages };
}

// Fonction pour générer les prompts Grok
function generateGrokPrompts(missingImages) {
  console.log('\n🎨 PROMPTS GROK POUR LES IMAGES MANQUANTES:\n');
  
  missingImages.forEach((article, index) => {
    const prompt = generateGrokPrompt(article);
    const fileName = path.basename(article.thumbnail, path.extname(article.thumbnail));
    
    console.log(`${index + 1}. 📄 Article: ${article.title}`);
    console.log(`   📁 Fichier: ${article.file}`);
    console.log(`   🖼️ Image: ${article.thumbnail}`);
    console.log(`   🎨 Prompt Grok: "${prompt}"`);
    console.log(`   💾 Sauvegarder sous: ${fileName}.jpg ou ${fileName}.png`);
    console.log('   ' + '─'.repeat(80));
  });
}

// Fonction pour créer un fichier de prompts
function createPromptsFile(missingImages) {
  const promptsContent = missingImages.map((article, index) => {
    const prompt = generateGrokPrompt(article);
    const fileName = path.basename(article.thumbnail, path.extname(article.thumbnail));
    
    return `${index + 1}. ${article.title}
Fichier: ${article.file}
Image cible: ${article.thumbnail}
Prompt: ${prompt}
Sauvegarder: ${fileName}.jpg

`;
  }).join('\n');
  
  const promptsFilePath = join(rootDir, 'docs', 'GROK_IMAGE_PROMPTS.md');
  fs.writeFileSync(promptsFilePath, `# 🎨 Prompts Grok pour Images d'Articles

${promptsContent}

## Instructions d'utilisation

1. Copier chaque prompt dans Grok
2. Générer l'image
3. Télécharger et renommer selon le nom indiqué
4. Placer dans /public/images/thumbnails/
5. Vérifier que l'article affiche bien l'image

## Extensions recommandées
- .jpg pour les photos/illustrations complexes
- .png pour les graphiques/illustrations simples
- .svg pour les icônes vectorielles

Total d'images à générer: ${missingImages.length}
`);
  
  console.log(`\n📄 Fichier de prompts créé: docs/GROK_IMAGE_PROMPTS.md`);
}

// Exécution principale
async function main() {
  try {
    console.log('🔍 Analyse des images d\'articles...\n');
    
    const { missingImages, existingImages } = await analyzeImages();
    
    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`   ✅ Images existantes: ${existingImages.length}`);
    console.log(`   ❌ Images manquantes: ${missingImages.length}`);
    console.log(`   📈 Couverture: ${Math.round(existingImages.length / (existingImages.length + missingImages.length) * 100)}%`);
    
    if (missingImages.length === 0) {
      console.log('\n🎉 Toutes les images d\'articles sont présentes !');
      return;
    }
    
    generateGrokPrompts(missingImages);
    createPromptsFile(missingImages);
    
    console.log(`\n🚀 Instructions:`);
    console.log(`   1. Ouvrir Grok (X.com)`);
    console.log(`   2. Copier-coller chaque prompt`);
    console.log(`   3. Générer et télécharger les images`);
    console.log(`   4. Placer dans /public/images/thumbnails/`);
    console.log(`   5. Relancer le site pour vérifier`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

main();
