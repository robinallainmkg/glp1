#!/usr/bin/env node

/**
 * Script pour identifier et traiter tous les articles sans images (SVG)
 * Génère des prompts Grok détaillés pour chaque article
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Analyse des articles sans images (SVG)...\n');

// Collections à analyser
const collections = [
  'glp1-diabete',
  'medicaments-glp1', 
  'effets-secondaires-glp1',
  'glp1-perte-de-poids',
  'glp1-cout',
  'medecins-glp1-france',
  'recherche-glp1',
  'regime-glp1',
  'alternatives-glp1'
];

const articlesWithSVG = [];
const articlesSummary = [];

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};
  
  const frontmatter = {};
  const lines = frontmatterMatch[1].split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      frontmatter[match[1]] = match[2].replace(/['"]/g, '');
    }
  }
  
  return frontmatter;
}

// Fonction pour extraire le contenu principal
function extractMainContent(content) {
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  const lines = withoutFrontmatter.split('\n');
  
  // Prendre les premiers paragraphes significatifs
  const contentLines = [];
  let foundContent = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('#')) {
      continue; // Ignorer les titres
    }
    
    if (trimmed.length > 20 && !trimmed.startsWith('<')) {
      contentLines.push(trimmed);
      foundContent = true;
      
      if (contentLines.length >= 3) break; // Prendre 3 paragraphes max
    }
  }
  
  return contentLines.join(' ').substring(0, 300) + '...';
}

// Fonction pour générer le prompt Grok
function generateGrokPrompt(article) {
  const { title, description, category, slug, content } = article;
  
  return `PROMPT GROK POUR: ${title}

**Contexte:** Site médical français sur les traitements GLP-1 (Ozempic, Wegovy, etc.)

**Article:** ${title}
**Description:** ${description}
**Catégorie:** ${category}
**Contenu:** ${content}

**Instructions pour Grok:**
Créer une image professionnelle et médicale représentant "${title}".

**Style requis:**
- Design médical moderne et professionnel
- Couleurs: bleu médical (#2563eb), vert santé (#16a34a), blanc, gris clair
- Style épuré et rassurant
- Éviter les représentations de personnes
- Focus sur les concepts médicaux/scientifiques

**Éléments à inclure:**
- Symboles médicaux subtils (stéthoscope, croix médicale, molécules)
- Représentation abstraite du traitement GLP-1 si pertinent
- Icônes liées au sujet: ${category.includes('cout') ? 'euro, pharmacie' : category.includes('effet') ? 'attention, liste' : category.includes('perte') ? 'balance, courbe descendante' : category.includes('diabete') ? 'glycémie, monitoring' : 'seringue, médicament'}

**Format:** Image horizontale 1200x630px, optimisée web
**Nom fichier:** ${slug}.jpg

---`;
}

async function analyzeCollection(collectionName) {
  const collectionPath = join(rootDir, 'src/content', collectionName);
  
  try {
    const files = await fs.readdir(collectionPath);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    console.log(`📁 Collection: ${collectionName} (${mdFiles.length} articles)`);
    
    for (const file of mdFiles) {
      const filePath = join(collectionPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      
      // Vérifier si l'image est un SVG
      if (frontmatter.thumbnail && frontmatter.thumbnail.includes('.svg')) {
        const slug = file.replace('.md', '');
        const mainContent = extractMainContent(content);
        
        const articleInfo = {
          collection: collectionName,
          file: file,
          slug: slug,
          title: frontmatter.title || slug,
          description: frontmatter.description || '',
          category: frontmatter.category || collectionName,
          thumbnail: frontmatter.thumbnail,
          content: mainContent
        };
        
        articlesWithSVG.push(articleInfo);
        console.log(`   🎨 SVG trouvé: ${articleInfo.title}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Erreur collection ${collectionName}:`, error.message);
  }
}

// Analyser toutes les collections
console.log('🔍 Analyse en cours...\n');

for (const collection of collections) {
  await analyzeCollection(collection);
}

// Résultats
console.log(`\n📊 RÉSULTATS:`);
console.log(`Total articles avec SVG: ${articlesWithSVG.length}`);

// Grouper par collection
const byCollection = {};
articlesWithSVG.forEach(article => {
  if (!byCollection[article.collection]) {
    byCollection[article.collection] = [];
  }
  byCollection[article.collection].push(article);
});

console.log(`\n📋 RÉPARTITION PAR COLLECTION:`);
Object.entries(byCollection).forEach(([collection, articles]) => {
  console.log(`${collection}: ${articles.length} articles`);
});

// Générer les prompts Grok
console.log(`\n🤖 Génération des prompts Grok...`);

let grokPrompts = `# 🎨 PROMPTS GROK POUR GÉNÉRATION D'IMAGES

*Généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}*

## 📊 Statistiques
- **Total articles à traiter:** ${articlesWithSVG.length}
- **Collections concernées:** ${Object.keys(byCollection).length}

## 🎯 Instructions Générales Grok

**Style uniforme requis:**
- Design médical professionnel
- Couleurs: #2563eb (bleu), #16a34a (vert), blanc, gris
- Format: 1200x630px horizontal
- Pas de personnes, focus sur concepts médicaux
- Style épuré et rassurant

---

`;

// Générer les prompts par collection
Object.entries(byCollection).forEach(([collection, articles]) => {
  grokPrompts += `\n## 📁 Collection: ${collection}\n\n`;
  
  articles.forEach((article, index) => {
    grokPrompts += generateGrokPrompt(article) + '\n';
  });
});

// Sauvegarder les prompts
const promptsFile = join(rootDir, 'scripts/grok-prompts-articles-svg.txt');
await fs.writeFile(promptsFile, grokPrompts, 'utf-8');

console.log(`✅ Prompts générés: ${promptsFile}`);

// Générer un script de traitement
const processScript = `#!/usr/bin/env node

/**
 * Script pour traiter les images générées par Grok
 * Usage: node process-grok-images.mjs
 */

import fs from 'fs/promises';
import path from 'path';

const articlesToUpdate = ${JSON.stringify(articlesWithSVG, null, 2)};

console.log('📝 Script de traitement des nouvelles images Grok');
console.log(\`Articles à mettre à jour: \${articlesToUpdate.length}\`);

// Instructions pour l'utilisateur
console.log(\`
🎯 ÉTAPES À SUIVRE:

1. **Générer les images avec Grok:**
   - Utiliser les prompts dans: scripts/grok-prompts-articles-svg.txt
   - Télécharger chaque image générée
   - Nommer les fichiers selon les noms indiqués

2. **Placer les images:**
   - Dossier: /public/images/thumbnails/
   - Format: .jpg ou .webp
   - Exemples:
${articlesWithSVG.slice(0, 3).map(a => `     - ${a.slug}.jpg`).join('\n')}

3. **Mettre à jour les frontmatters:**
   - Remplacer .svg par .jpg dans le thumbnail
   - Vérifier que les images se chargent

4. **Validation:**
   - Lancer: npm run dev
   - Vérifier l'affichage des nouvelles images

📊 ARTICLES À TRAITER:
\`);

articlesToUpdate.forEach(article => {
  console.log(\`- \${article.collection}/\${article.file} → \${article.slug}.jpg\`);
});

export { articlesToUpdate };
`;

const processScriptFile = join(rootDir, 'scripts/process-grok-images.mjs');
await fs.writeFile(processScriptFile, processScript, 'utf-8');

console.log(`✅ Script de traitement créé: ${processScriptFile}`);

// Résumé final
console.log(`\n🎯 RÉSUMÉ FINAL:`);
console.log(`1. Articles SVG identifiés: ${articlesWithSVG.length}`);
console.log(`2. Prompts Grok générés: scripts/grok-prompts-articles-svg.txt`);
console.log(`3. Script de traitement: scripts/process-grok-images.mjs`);
console.log(`\n📋 PROCHAINES ÉTAPES:`);
console.log(`1. Ouvrir: scripts/grok-prompts-articles-svg.txt`);
console.log(`2. Copier chaque prompt dans Grok`);
console.log(`3. Télécharger les images générées`);
console.log(`4. Exécuter: node scripts/process-grok-images.mjs`);

// Créer un script de mise à jour automatique des frontmatters
const updateScript = `#!/usr/bin/env node

/**
 * Script pour mettre à jour automatiquement les frontmatters
 * Remplace les .svg par .jpg après génération Grok
 */

import fs from 'fs/promises';
import path from 'path';

const articlesToUpdate = ${JSON.stringify(articlesWithSVG, null, 2)};

console.log('🔄 Mise à jour automatique des frontmatters...');

let updatedCount = 0;

for (const article of articlesToUpdate) {
  const filePath = path.join('src/content', article.collection, article.file);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const newImagePath = \`/images/thumbnails/\${article.slug}.jpg\`;
    
    // Vérifier si l'image existe
    const imagePath = path.join('public', 'images', 'thumbnails', \`\${article.slug}.jpg\`);
    
    try {
      await fs.access(imagePath);
      
      // L'image existe, mettre à jour le frontmatter
      const updatedContent = content.replace(
        /thumbnail: "?\\/images\\/thumbnails\\/[^"\\s]+\\.svg"?/,
        \`thumbnail: "\${newImagePath}"\`
      );
      
      if (updatedContent !== content) {
        await fs.writeFile(filePath, updatedContent, 'utf-8');
        console.log(\`✅ Mis à jour: \${article.collection}/\${article.file}\`);
        updatedCount++;
      }
      
    } catch {
      console.log(\`⏳ En attente: \${article.slug}.jpg (image non trouvée)\`);
    }
    
  } catch (error) {
    console.log(\`❌ Erreur \${article.file}: \${error.message}\`);
  }
}

console.log(\`\n🎯 Mise à jour terminée: \${updatedCount}/\${articlesToUpdate.length} articles\`);
`;

const updateScriptFile = join(rootDir, 'scripts/update-frontmatters-after-grok.mjs');
await fs.writeFile(updateScriptFile, updateScript, 'utf-8');

console.log(`✅ Script de mise à jour créé: ${updateScriptFile}`);
console.log(`\n🚀 UTILISATION:`);
console.log(`1. Générer images avec Grok`);
console.log(`2. Placer dans /public/images/thumbnails/`); 
console.log(`3. Exécuter: node scripts/update-frontmatters-after-grok.mjs`);
