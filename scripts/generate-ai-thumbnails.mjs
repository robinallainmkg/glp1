#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Variable d'environnement
const MAX_IMAGES = 50; // Générer 50 images de qualité
const FORCE_REGENERATE = true; // Forcer la régénération pour tester la qualité

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
  // Style de base ultra-professionnel français
  const baseStyle = "Photo ultra-réaliste professionnelle de haute qualité, style documentaire médical français, éclairage studio parfait, résolution 8K, composition parfaite, netteté cristalline, couleurs naturelles et chaleureuses, style photojournalisme médical français";
  
  // Spécifications ethniques et culturelles claires
  const ethnicitySpec = "personnes d'origine européenne française, traits européens, sans voile ni hijab, apparence typiquement française";
  
  // Nettoyer le titre et la description
  const cleanTitle = title.replace(/['"]/g, '').toLowerCase();
  const cleanDescription = description.replace(/['"]/g, '').toLowerCase();
  
  // Analyse sémantique avancée du contenu
  let contextualPrompt = "";
  
  // Détection précise du type de contenu avec prompts ultra-spécifiques
  if (cleanTitle.includes('ozempic') || cleanDescription.includes('ozempic')) {
    contextualPrompt = `Portrait professionnel d'un endocrinologue français (homme, 45-55 ans, ${ethnicitySpec}, cheveux poivre et sel, expression bienveillante) dans son cabinet parisien moderne, tenant délicatement un stylo Ozempic, patient français (femme, 40-50 ans, ${ethnicitySpec}, souriante et confiante) en consultation, éclairage naturel parfait, décor médical français haut de gamme, diplômes universitaires français encadrés au mur`;
  }
  else if (cleanTitle.includes('wegovy') || cleanDescription.includes('wegovy')) {
    contextualPrompt = `Scène de consultation médicale française premium : médecin spécialiste obésité (femme, 45 ans, ${ethnicitySpec}, blouse blanche impeccable, stéthoscope) expliquant Wegovy à une patiente (femme, 35 ans, ${ethnicitySpec}, expression d'espoir et de détermination), cabinet médical parisien luxueux, lumière douce et professionnelle, technologies médicales modernes en arrière-plan`;
  }
  else if (cleanTitle.includes('mounjaro') || cleanDescription.includes('mounjaro')) {
    contextualPrompt = `Diabétologue français expert (homme, 50 ans, ${ethnicitySpec}, lunettes élégantes, sourire rassurant) dans un CHU français moderne présentant Mounjaro à un patient diabétique (homme, 45 ans, ${ethnicitySpec}, attentif et confiant), écrans médicaux high-tech, environnement médical français de pointe, éclairage cinématographique professionnel`;
  }
  else if (cleanTitle.includes('saxenda') || cleanDescription.includes('saxenda')) {
    contextualPrompt = `Consultation d'excellence française : endocrinologue (femme, 40 ans, ${ethnicitySpec}, coiffure moderne, expression experte) démontrant l'injection Saxenda à une patiente (femme, 45 ans, ${ethnicitySpec}, rassurée et souriante), clinique privée française luxueuse, matériel médical haut de gamme, ambiance chaleureuse et professionnelle`;
  }
  else if (cleanTitle.includes('trulicity') || cleanDescription.includes('trulicity')) {
    contextualPrompt = `Spécialiste diabète français renommé (homme, 55 ans, ${ethnicitySpec}, barbe soignée, blouse médicale premium) expliquant Trulicity dans son bureau d'hôpital parisien, patient diabétique (homme, 50 ans, ${ethnicitySpec}, expression confiante), équipements médicaux dernier cri, certificats médicaux français prestigieux au mur`;
  }
  else if (cleanTitle.includes('prix') || cleanTitle.includes('coût') || cleanTitle.includes('remboursement') || 
           cleanDescription.includes('prix') || cleanDescription.includes('coût') || cleanDescription.includes('remboursement')) {
    contextualPrompt = `Consultation médicale française sur les aspects financiers : médecin conseil (femme, 45 ans, ${ethnicitySpec}, expression pédagogue) expliquant les remboursements CPAM à un couple français (homme et femme, 40-50 ans, ${ethnicitySpec}, attentifs), carte Vitale, ordonnances, calculatrice médicale sur bureau en bois noble, cabinet médical français élégant`;
  }
  else if (cleanTitle.includes('perte de poids') || cleanTitle.includes('maigrir') || 
           cleanDescription.includes('perte de poids') || cleanDescription.includes('maigrir')) {
    contextualPrompt = `Transformation inspirante : femme française (35 ans, ${ethnicitySpec}, sourire radieux, confiance retrouvée) montrant fièrement sa perte de poids grâce aux GLP-1, dans un cadre français élégant (jardin parisien ou appartement haussmannien), lumière dorée naturelle, style de vie français raffiné, expression de joie authentique`;
  }
  else if (cleanTitle.includes('diabète') || cleanDescription.includes('diabète')) {
    contextualPrompt = `Suivi diabétique français exemplaire : diabétologue expert (homme, 48 ans, ${ethnicitySpec}, expression rassurante) avec patient diabétique (homme, 55 ans, ${ethnicitySpec}, déterminé) utilisant glucomètre dernière génération, carnet de glycémie français, cabinet médical parisien moderne, relation médecin-patient de confiance`;
  }
  else if (cleanTitle.includes('effets secondaires') || cleanTitle.includes('danger') || 
           cleanDescription.includes('effets secondaires') || cleanDescription.includes('danger')) {
    contextualPrompt = `Consultation de transparence médicale : médecin français expérimenté (femme, 50 ans, ${ethnicitySpec}, expression bienveillante et honnête) expliquant avec pédagogie les effets secondaires à un patient (homme, 45 ans, ${ethnicitySpec}, attentif), brochures médicales françaises, infographies claires, atmosphère de confiance totale`;
  }
  else if (cleanTitle.includes('médecin') || cleanTitle.includes('docteur') || cleanTitle.includes('endocrinologue') || 
           cleanDescription.includes('médecin') || cleanDescription.includes('endocrinologue')) {
    contextualPrompt = `Portrait corporate d'exception d'un endocrinologue français prestigieux (homme ou femme, 45-55 ans, ${ethnicitySpec}, élégance française naturelle), dans son cabinet médical parisien de luxe, diplômes de facultés françaises renommées encadrés, blouse médicale impeccable, expression d'expertise et de bienveillance, éclairage portrait professionnel`;
  }
  else if (cleanTitle.includes('régime') || cleanTitle.includes('nutrition') || cleanTitle.includes('alimentaire') || 
           cleanDescription.includes('régime') || cleanDescription.includes('nutrition')) {
    contextualPrompt = `Nutritionniste française experte (femme, 40 ans, ${ethnicitySpec}, sourire professionnel chaleureux) créant un plan alimentaire GLP-1 dans sa cuisine-laboratoire moderne française, produits frais du marché français, légumes colorés, art culinaire français sain, lumière naturelle parfaite, style gastronomie française healthy`;
  }
  else if (cleanTitle.includes('recherche') || cleanTitle.includes('étude') || cleanTitle.includes('clinique') || 
           cleanDescription.includes('recherche') || cleanDescription.includes('étude')) {
    contextualPrompt = `Laboratoire de recherche français d'excellence : équipe de chercheurs français (hommes et femmes, 35-50 ans, ${ethnicitySpec}, blouses de laboratoire immaculées) travaillant sur les GLP-1, équipements scientifiques dernier cri, Institut Pasteur ou INSERM, microscopes électroniques, données sur écrans 4K, innovation médicale française`;
  }
  else if (cleanTitle.includes('alternative') || cleanTitle.includes('naturel') || 
           cleanDescription.includes('alternative') || cleanDescription.includes('naturel')) {
    contextualPrompt = `Médecin français spécialisé en médecine intégrative (femme, 45 ans, ${ethnicitySpec}, approche holistique bienveillante) dans son cabinet zen français, présentant alternatives naturelles aux GLP-1, plantes médicinales françaises, herboristerie moderne, consultation personnalisée, décor épuré et apaisant`;
  }
  else {
    // Prompt générique ultra-professionnel basé sur le titre
    contextualPrompt = `Consultation médicale française d'excellence concernant "${cleanTitle}" : médecin expert français (${ethnicitySpec}, 40-55 ans, expression professionnelle et rassurante) expliquant le traitement à un patient français (${ethnicitySpec}, attentif et confiant), cabinet médical parisien moderne et chaleureux, relation de confiance médicale française authentique`;
  }
  
  // Contexte collection ultra-spécifique
  const collectionContext = {
    'medicaments-glp1': 'avec mise en valeur des médicaments et protocoles thérapeutiques français',
    'glp1-perte-de-poids': 'avec focus sur la transformation physique et le bien-être à la française',
    'glp1-diabete': 'dans un contexte de diabétologie française d\'excellence',
    'effets-secondaires-glp1': 'avec emphasis sur la transparence médicale et la sécurité française',
    'glp1-cout': 'avec intégration du système de santé français et remboursements CPAM',
    'alternatives-glp1': 'avec approche thérapeutique française innovante et personnalisée',
    'medecins-glp1-france': 'dans l\'environnement médical français le plus prestigieux',
    'recherche-glp1': 'dans le contexte de la recherche médicale française de pointe',
    'regime-glp1': 'avec l\'art de vivre et la gastronomie thérapeutique française'
  };
  
  // Spécifications techniques ultra-qualité
  const technicalSpecs = "Photographie ultra-haute définition, bokeh professionnel, balance des blancs parfaite, aucun grain, netteté maximale, composition règle des tiers, profondeur de champ maîtrisée, couleurs naturelles françaises, lumière douce et flatteuse";
  
  const finalPrompt = `${contextualPrompt} ${collectionContext[collection] || ''}, ${baseStyle}, ${technicalSpecs}. IMPORTANT: éviter absolument tout texte, écriture, ou caractères visibles dans l'image finale.`;
  
  return finalPrompt;
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
      size: "1792x1024", // Format 16:9 optimisé pour les thumbnails web
      quality: "hd", // Qualité maximale HD
      style: "natural", // Style naturel pour photos réalistes
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
      if (fs.existsSync(outputPath) && !FORCE_REGENERATE) {
        console.log(`  ⏭️ Image existe déjà: ${slug}-illus.jpg (utiliser FORCE_REGENERATE=true pour forcer)`);
        continue;
      }
      
      console.log(`\n  🎯 Article: ${title}`);
      console.log(`  📝 Description: ${description.substring(0, 100)}...`);
      console.log(`  🎨 Prompt personnalisé généré`);
      
      const success = await generateAIImage(title, description, collection, slug, outputPath);
      if (success) {
        totalGenerated++;
        console.log(`  ✅ Succès! (${totalGenerated}/${MAX_IMAGES})`);
      } else {
        console.log(`  ❌ Échec de génération`);
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
