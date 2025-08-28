#!/usr/bin/env node

/**
 * Guide pratique pour traiter les 96 articles SVG avec Grok
 * Script de suivi et organisation par priorité
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('📋 GUIDE PRATIQUE - GÉNÉRATION IMAGES GROK\n');

// Priorités par collection
const collectionPriorities = {
  'medicaments-glp1': { priority: 1, desc: 'Médicaments (39 articles) - Priorité MAX' },
  'glp1-perte-de-poids': { priority: 2, desc: 'Perte de poids (16 articles) - Très important' },
  'glp1-diabete': { priority: 3, desc: 'Diabète (15 articles) - Important' },
  'regime-glp1': { priority: 4, desc: 'Régimes (14 articles) - Moyen' },
  'glp1-cout': { priority: 5, desc: 'Coûts (5 articles) - Moyen' },
  'medecins-glp1-france': { priority: 6, desc: 'Médecins (5 articles) - Faible' },
  'recherche-glp1': { priority: 7, desc: 'Recherche (2 articles) - Faible' }
};

// Suggestions de prompt optimisé pour chaque type
const promptTemplates = {
  'medicaments-glp1': {
    base: "Image médicale professionnelle d'un médicament GLP-1",
    elements: "seringue moderne, flacon médical, molécule scientifique",
    style: "couleurs bleu médical et blanc, design pharmaCeutique épuré"
  },
  'glp1-perte-de-poids': {
    base: "Visualisation médicale de la perte de poids",
    elements: "courbe descendante, balance médicale, graphique progression",
    style: "couleurs vert santé et bleu, design motivant et professionnel"
  },
  'glp1-diabete': {
    base: "Illustration médicale du diabète et GLP-1",
    elements: "glucose meter, glycémie, monitoring médical",
    style: "couleurs bleu médical et rouge subtil, design rassurant"
  },
  'regime-glp1': {
    base: "Concept alimentaire et nutrition médicale",
    elements: "assiette équilibrée, nutrition, pyramide alimentaire",
    style: "couleurs vert naturel et bleu, design healthy et clean"
  },
  'glp1-cout': {
    base: "Concept médico-économique",
    elements: "calculatrice médicale, euro, remboursement santé",
    style: "couleurs bleu professionnel et vert, design financier médical"
  }
};

console.log('🎯 STRATÉGIE RECOMMANDÉE:\n');

console.log('1. **TRAITER PAR LOTS DE PRIORITÉ**');
Object.entries(collectionPriorities)
  .sort((a, b) => a[1].priority - b[1].priority)
  .forEach(([collection, info]) => {
    console.log(`   ${info.priority}. ${info.desc}`);
  });

console.log('\n2. **PROMPTS OPTIMISÉS PAR TYPE**\n');
Object.entries(promptTemplates).forEach(([type, template]) => {
  console.log(`📁 ${type.toUpperCase()}:`);
  console.log(`   Base: ${template.base}`);
  console.log(`   Éléments: ${template.elements}`);
  console.log(`   Style: ${template.style}\n`);
});

// Générer des prompts courts et efficaces
console.log('3. **PROMPTS COURTS POUR GROK** (Copier-coller direct)\n');

const shortPrompts = `
🔹 MÉDICAMENTS GLP-1:
"Créer une image médicale professionnelle représentant un médicament GLP-1. Style: design pharmaceutique moderne, couleurs bleu médical (#2563eb) et blanc, seringue élégante, flacon médical, molécules subtiles. Format 1200x630px horizontal. Éviter les personnes, style épuré et rassurant."

🔹 PERTE DE POIDS:
"Créer une visualisation médicale de la perte de poids avec GLP-1. Style: couleurs vert santé (#16a34a) et bleu, courbe descendante élégante, balance médicale moderne, graphique de progression. Format 1200x630px horizontal. Design motivant et professionnel."

🔹 DIABÈTE:
"Créer une illustration médicale du diabète et traitements GLP-1. Style: couleurs bleu médical et touches rouge subtiles, glucose meter moderne, monitoring glycémique, graphiques médicaux. Format 1200x630px horizontal. Design rassurant et informatif."

🔹 RÉGIMES ALIMENTAIRES:
"Créer un concept nutrition et régime avec GLP-1. Style: couleurs vert naturel et bleu, assiette équilibrée stylisée, pyramide alimentaire moderne, symboles nutrition. Format 1200x630px horizontal. Design healthy et clean."

🔹 COÛTS/PRIX:
"Créer un concept médico-économique pour prix GLP-1. Style: couleurs bleu professionnel et vert, calculatrice médicale, symbole euro élégant, concept remboursement. Format 1200x630px horizontal. Design financier médical propre."
`;

console.log(shortPrompts);

console.log('\n4. **WORKFLOW RECOMMANDÉ**\n');
console.log('👉 ÉTAPE 1 - PRIORITÉ 1 (Médicaments - 39 images)');
console.log('   - Utiliser le prompt "MÉDICAMENTS GLP-1"');
console.log('   - Adapter le titre de chaque article');
console.log('   - Exemple: "...représentant Ozempic (semaglutide)"');

console.log('\n👉 ÉTAPE 2 - PRIORITÉ 2 (Perte de poids - 16 images)');
console.log('   - Utiliser le prompt "PERTE DE POIDS"');
console.log('   - Varier les éléments visuels');

console.log('\n👉 ÉTAPE 3 - Etc. selon priorités\n');

// Créer un fichier de suivi
const trackingData = {
  totalArticles: 96,
  collections: collectionPriorities,
  completed: 0,
  remaining: 96,
  lastUpdate: new Date().toISOString()
};

const trackingFile = join(rootDir, 'scripts/grok-progress-tracking.json');
await fs.writeFile(trackingFile, JSON.stringify(trackingData, null, 2));

console.log('📊 SUIVI DES PROGRÈS');
console.log(`   Total: ${trackingData.totalArticles} articles`);
console.log(`   Complétés: ${trackingData.completed}`);
console.log(`   Restants: ${trackingData.remaining}`);
console.log(`   Tracking: scripts/grok-progress-tracking.json\n`);

console.log('🚀 COMMENCER MAINTENANT:');
console.log('1. Ouvrir Grok dans un nouvel onglet');
console.log('2. Copier le prompt "MÉDICAMENTS GLP-1" ci-dessus');
console.log('3. Modifier pour le premier article de medicaments-glp1');
console.log('4. Générer et télécharger l\'image');
console.log('5. Répéter pour tous les médicaments');
console.log('6. Passer à la priorité suivante\n');

// Script de vérification des progrès
const progressScript = `#!/usr/bin/env node

/**
 * Vérifier les progrès de génération d'images
 */

import fs from 'fs/promises';
import path from 'path';

const thumbnailsDir = 'public/images/thumbnails';

async function checkProgress() {
  try {
    const files = await fs.readdir(thumbnailsDir);
    const jpgFiles = files.filter(f => f.endsWith('.jpg')).length;
    const svgFiles = files.filter(f => f.endsWith('.svg')).length;
    
    console.log('📊 PROGRÈS GÉNÉRATION IMAGES:');
    console.log(\`✅ Images JPG: \${jpgFiles}\`);
    console.log(\`🎨 Images SVG restantes: \${svgFiles}\`);
    console.log(\`📈 Progression: \${Math.round((jpgFiles/(jpgFiles+svgFiles))*100)}%\`);
    
    if (svgFiles === 0) {
      console.log('🎉 TOUTES LES IMAGES GÉNÉRÉES !');
    } else {
      console.log(\`⏳ Encore \${svgFiles} images à générer\`);
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

checkProgress();
`;

const progressScriptFile = join(rootDir, 'scripts/check-image-progress.mjs');
await fs.writeFile(progressScriptFile, progressScript);

console.log('✅ Script de suivi créé: scripts/check-image-progress.mjs');
console.log('   Usage: node scripts/check-image-progress.mjs\n');

console.log('📁 FICHIERS CRÉÉS:');
console.log('   📋 scripts/grok-prompts-articles-svg.txt (2700+ lignes)');
console.log('   🚀 scripts/process-grok-images.mjs');
console.log('   🔄 scripts/update-frontmatters-after-grok.mjs');
console.log('   📊 scripts/check-image-progress.mjs');
console.log('   📈 scripts/grok-progress-tracking.json');
