#!/usr/bin/env node

/**
 * Adapter les prompts Grok pour Leonardo.AI
 * Optimise le format et le style pour Leonardo
 */

import fs from 'fs/promises';
import path from 'path';

const inputFile = 'scripts/grok-prompts-articles-svg.txt';
const outputFile = 'scripts/leonardo-prompts-optimized.txt';

// Styles Leonardo recommandés par type
const leonardoStyles = {
  'medicaments-glp1': {
    model: 'Leonardo Phoenix',
    style: 'Medical Photography, Clean, Professional',
    negativePrompt: 'cartoon, anime, low quality, blurry, text, watermark, people, faces'
  },
  'glp1-perte-de-poids': {
    model: 'Leonardo Diffusion XL', 
    style: 'Health Infographic, Modern, Clean Design',
    negativePrompt: 'cartoon, anime, low quality, blurry, text, watermark, people, faces'
  },
  : {
    model: 'Leonardo Phoenix',
    style: 'Medical Illustration, Scientific, Professional',
    negativePrompt: 'cartoon, anime, low quality, blurry, text, watermark, people, faces'
  },
  'regime-glp1': {
    model: 'Leonardo Diffusion XL',
    style: 'Food Photography, Healthy, Clean, Modern',
    negativePrompt: 'cartoon, anime, low quality, blurry, text, watermark, people, faces'
  },
  'glp1-cout': {
    model: 'Leonardo Phoenix',
    style: 'Financial Infographic, Professional, Clean',
    negativePrompt: 'cartoon, anime, low quality, blurry, text, watermark, people, faces'
  }
};

function adaptPromptForLeonardo(originalPrompt, collection, title) {
  const style = leonardoStyles[collection] || leonardoStyles['medicaments-glp1'];
  
  // Nettoyer et optimiser le prompt original
  let prompt = originalPrompt
    .replace(/Créer une image /i, '')
    .replace(/représentant /i, '')
    .replace(/Format.*horizontal/i, '')
    .replace(/Éviter les personnes,?/i, '')
    .replace(/Style:/i, '')
    .replace(/"/g, '')
    .trim();

  // Construire le prompt Leonardo optimisé
  const leonardoPrompt = `🎨 LEONARDO.AI SETTINGS:
Model: ${style.model}
Style: ${style.style}
Aspect Ratio: 16:9 (1024x576px)
Quality: High
Negative Prompt: ${style.negativePrompt}

📝 PROMPT OPTIMISÉ POUR LEONARDO:
"Professional medical illustration about ${title}, ${prompt}, ultra-high quality, photorealistic, medical grade, clean composition, ${style.style.toLowerCase()}, no text, no people, medical professional style"`;

  return leonardoPrompt;
}

async function convertPrompts() {
  try {
    console.log('🔄 Lecture du fichier Grok...');
    const content = await fs.readFile(inputFile, 'utf-8');
    const lines = content.split('\n');
    
    let convertedContent = `# PROMPTS LEONARDO.AI OPTIMISÉS
# Générés automatiquement le ${new Date().toISOString()}
# Total: 96 articles à traiter

## 🎯 GUIDE RAPIDE LEONARDO.AI

1. **S'inscrire sur leonardo.ai** (150 crédits gratuits/jour)
2. **Choisir "Image Generation"**
3. **Copier le prompt optimisé** ci-dessous
4. **Paramètres recommandés:**
   - Aspect Ratio: 16:9
   - Dimensions: 1024x576
   - Guidance Scale: 7-10
   - Quality: High

## 📋 PROMPTS PAR PRIORITÉ

`;

    let currentCollection = '';
    let articleCount = 0;
    let collectionCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Détecter les collections
      if (line.startsWith('## 📁 Collection:')) {
        currentCollection = line.split(':')[1].trim();
        collectionCount++;
        
        convertedContent += `\n### 📁 COLLECTION ${collectionCount}: ${currentCollection.toUpperCase()}\n`;
        convertedContent += `Model recommandé: ${leonardoStyles[currentCollection]?.model || 'Leonardo Phoenix'}\n\n`;
        continue;
      }
      
      // Détecter les prompts pour articles
      if (line.startsWith('PROMPT GROK POUR:')) {
        articleCount++;
        const title = line.replace('PROMPT GROK POUR:', '').trim();
        
        // Trouver la ligne "Créer une image" dans les 15 lignes suivantes
        let promptLine = '';
        for (let j = i + 1; j < lines.length && j < i + 15; j++) {
          if (lines[j].trim().startsWith('Créer une image')) {
            promptLine = lines[j].trim();
            break;
          }
        }
        
        if (promptLine) {
          const adaptedPrompt = adaptPromptForLeonardo(promptLine, currentCollection, title);
          
          convertedContent += `---
**${articleCount}. ${title}**
Collection: ${currentCollection}
Fichier: ${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg

${adaptedPrompt}

`;
        }
      }
    }
    
    convertedContent += `
## 🚀 WORKFLOW RECOMMANDÉ

### BATCH 1 - MÉDICAMENTS (39 images) - PRIORITÉ MAX
- Utiliser "Leonardo Phoenix" 
- Style: Medical Photography
- Traiter en premier

### BATCH 2 - PERTE DE POIDS (16 images)
- Utiliser "Leonardo Diffusion XL"
- Style: Health Infographic

### BATCH 3 - DIABÈTE (15 images)  
- Utiliser "Leonardo Phoenix"
- Style: Medical Illustration

### BATCH 4 - RÉGIMES (14 images)
- Utiliser "Leonardo Diffusion XL" 
- Style: Food Photography

### BATCH 5 - AUTRES (12 images)
- Modèle au choix selon le contenu

## 📊 PROGRESSION
- Total articles: ${articleCount}
- Crédits Leonardo nécessaires: ~${Math.ceil(articleCount * 1.5)} (avec variations)
- Temps estimé: 3-4 jours (150 crédits/jour)

## 💡 CONSEILS LEONARDO.AI
- Utilisez le negative prompt pour éviter les éléments indésirables
- Variez légèrement les prompts pour éviter la répétition
- Sauvegardez vos images en haute qualité
- Nommez vos téléchargements selon le nom d'article

---
Généré par adapt-prompts-leonardo.mjs
`;

    await fs.writeFile(outputFile, convertedContent);
    
    console.log(`✅ Conversion terminée !`);
    console.log(`📄 Articles traités: ${articleCount}`);
    console.log(`📁 Collections: ${collectionCount}`);
    console.log(`💾 Fichier créé: ${outputFile}`);
    console.log(`\n🚀 Prochaines étapes:`);
    console.log(`1. Ouvrir ${outputFile}`);
    console.log(`2. S'inscrire sur leonardo.ai`);
    console.log(`3. Commencer par les médicaments (priorité 1)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

convertPrompts();
