#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Variable d'environnement
const MAX_IMAGES = 10; // Limite pour les tests

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY non définie dans les variables d\'environnement');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const contentPath = path.join(__dirname, '..', 'src', 'content');
const publicImagesPath = path.join(__dirname, '..', 'public', 'images', 'thumbnails');

// Créer le dossier d'images si nécessaire
if (!fs.existsSync(publicImagesPath)) {
  fs.mkdirSync(publicImagesPath, { recursive: true });
}

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n/s);
  if (!frontmatterMatch) return null;
  
  const frontmatter = {};
  const lines = frontmatterMatch[1].split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Nettoyer les guillemets
      frontmatter[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  
  return frontmatter;
}

// Fonction pour générer un prompt spécifique selon le contenu
function generatePrompt(title, description, collection, slug) {
  const baseStyle = "Professional medical illustration, modern healthcare style, clean and trustworthy, high quality";
  
  // Prompts spécifiques par collection
  const collectionPrompts = {
    'medicaments-glp1': `Medical pharmacy setting with ${title.replace(/['"]/g, '')} medication, ${baseStyle}, pharmaceutical theme`,
    'glp1-perte-de-poids': `Person successfully managing weight with medical supervision, healthy lifestyle, ${baseStyle}, transformation theme`,
    'glp1-diabete': `Healthcare professional explaining diabetes management, modern clinic setting, ${baseStyle}, diabetes care theme`,
    'effets-secondaires-glp1': `Medical consultation about medication safety, doctor explaining side effects, ${baseStyle}, safety theme`,
    'glp1-cout': `Healthcare cost consultation, modern medical office, financial planning for health, ${baseStyle}`,
    'alternatives-glp1': `Natural health alternatives, holistic medicine approach, ${baseStyle}, alternative medicine theme`,
    'medecins-glp1-france': `French medical professional in modern clinic, healthcare consultation, ${baseStyle}, professional medical setting`,
    'recherche-glp1': `Medical research laboratory, scientists studying diabetes treatments, ${baseStyle}, research theme`,
    'regime-glp1': `Healthy nutrition consultation, dietitian with patient, balanced meal planning, ${baseStyle}, nutrition theme`
  };
  
  // Prompts spécifiques par mots-clés dans le slug
  if (slug.includes('ozempic')) {
    return `Medical professional explaining Ozempic treatment, modern pharmacy setting, ${baseStyle}, diabetes medication consultation`;
  }
  if (slug.includes('wegovy')) {
    return `Healthcare provider discussing Wegovy for weight management, professional medical consultation, ${baseStyle}`;
  }
  if (slug.includes('saxenda')) {
    return `Diabetes specialist explaining Saxenda injection, medical office setting, ${baseStyle}`;
  }
  if (slug.includes('trulicity')) {
    return `Medical consultation about Trulicity diabetes treatment, healthcare professional, ${baseStyle}`;
  }
  if (slug.includes('mounjaro')) {
    return `Modern medical consultation about Mounjaro treatment, professional healthcare setting, ${baseStyle}`;
  }
  if (slug.includes('prix') || slug.includes('cout')) {
    return `Healthcare cost consultation, medical billing discussion, modern medical office, ${baseStyle}`;
  }
  if (slug.includes('diabete')) {
    return `Diabetes care consultation, medical professional with patient, modern clinic, ${baseStyle}`;
  }
  if (slug.includes('regime') || slug.includes('nutrition')) {
    return `Nutritionist consultation, healthy meal planning, medical nutrition therapy, ${baseStyle}`;
  }
  if (slug.includes('sport') || slug.includes('exercice')) {
    return `Medical fitness consultation, healthcare provider discussing exercise for diabetes, ${baseStyle}`;
  }
  if (slug.includes('danger') || slug.includes('effet')) {
    return `Medical safety consultation, doctor explaining medication precautions, ${baseStyle}`;
  }
  
  // Utiliser le prompt de collection par défaut
  return collectionPrompts[collection] || `Healthcare consultation about ${title.replace(/['"]/g, '')}, modern medical setting, ${baseStyle}`;
}

// Fonction pour télécharger et sauvegarder l'image
async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch (error) {
    console.error(`❌ Erreur téléchargement:`, error.message);
    return false;
  }
}

// Fonction pour générer une image AI
async function generateAIImage(title, description, collection, slug, outputPath) {
  try {
    const prompt = generatePrompt(title, description, collection, slug);
    
    console.log(`🎨 Génération AI pour: ${title}`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });
    
    const imageUrl = response.data[0].url;
    console.log(`🔗 URL générée: ${imageUrl.substring(0, 50)}...`);
    
    // Télécharger et sauvegarder
    const success = await downloadImage(imageUrl, outputPath);
    if (success) {
      console.log(`✅ Image sauvegardée: ${path.basename(outputPath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur génération AI:`, error.message);
    return false;
  }
}

// Fonction principale
async function generateAIThumbnails() {
  console.log('🤖 Génération d\'images AI avec DALL-E...\n');
  console.log(`📊 Limite: ${MAX_IMAGES} images pour ce test\n`);
  
  const collections = fs.readdirSync(contentPath).filter(dir => 
    fs.statSync(path.join(contentPath, dir)).isDirectory()
  );
  
  let totalGenerated = 0;
  let totalProcessed = 0;
  
  for (const collection of collections) {
    if (totalGenerated >= MAX_IMAGES) break;
    
    console.log(`📂 Collection: ${collection}`);
    const collectionPath = path.join(contentPath, collection);
    
    const files = fs.readdirSync(collectionPath).filter(file => 
      file.endsWith('.md') || file.endsWith('.mdx')
    );
    
    for (const file of files) {
      if (totalGenerated >= MAX_IMAGES) break;
      
      const filePath = path.join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      
      if (!frontmatter) {
        console.log(`  ⚠️ Pas de frontmatter: ${file}`);
        continue;
      }
      
      const title = frontmatter.title || 'Article médical';
      const description = frontmatter.description || frontmatter.metaDescription || '';
      const slug = path.basename(file, path.extname(file));
      
      // Nom avec suffixe "illus"
      const outputPath = path.join(publicImagesPath, `${slug}-illus.jpg`);
      
      // Vérifier si l'image existe déjà
      if (fs.existsSync(outputPath)) {
        console.log(`  ⏭️ Image existe déjà: ${slug}-illus.jpg`);
        continue;
      }
      
      console.log(`\n  🎯 Article: ${title}`);
      
      const success = await generateAIImage(title, description, collection, slug, outputPath);
      if (success) {
        totalGenerated++;
      }
      
      totalProcessed++;
      
      // Délai pour éviter les limites de taux
      if (totalGenerated < MAX_IMAGES) {
        console.log(`⏱️ Pause de 2 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log(`\n📊 Résumé:`);
  console.log(`   Générées: ${totalGenerated}/${MAX_IMAGES} images`);
  console.log(`   Traitées: ${totalProcessed} articles`);
  console.log(`   Coût estimé: ~$${(totalGenerated * 0.04).toFixed(2)}`);
  console.log(`✅ Terminé !`);
}

// Gestion des erreurs globales
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Exécution
generateAIThumbnails().catch(console.error);
