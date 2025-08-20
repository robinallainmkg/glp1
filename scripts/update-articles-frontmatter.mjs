#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des collections
const collectionsPath = path.join(__dirname, '..', 'src', 'content');
const collections = [
  'medicaments-glp1',
  'glp1-perte-de-poids',
  'glp1-cout',
  'glp1-diabete',
  'effets-secondaires-glp1',
  'medecins-glp1-france',
  'recherche-glp1',
  'regime-glp1',
  'alternatives-glp1'
];

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return { frontmatter: {}, body: content };
  
  const frontmatterText = match[1];
  const body = content.replace(frontmatterRegex, '').trim();
  
  // Parse simple du YAML (pour les cas basiques)
  const frontmatter = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  });
  
  return { frontmatter, body };
}

// Fonction pour créer le nouveau frontmatter standardisé
function createStandardFrontmatter(oldFrontmatter, slug, collectionName) {
  const pubDate = oldFrontmatter.pubDate || oldFrontmatter.publishedAt || new Date().toISOString();
  
  return {
    title: oldFrontmatter.title || '',
    description: oldFrontmatter.description || oldFrontmatter.metaDescription || '',
    slug: slug,
    pubDate: pubDate,
    updatedDate: oldFrontmatter.updatedDate || '',
    author: oldFrontmatter.author || 'Dr. Sarah Martin',
    category: oldFrontmatter.category || 'Guide médical',
    tags: oldFrontmatter.tags || oldFrontmatter.keywords || '',
    collection: collectionName,
    thumbnail: oldFrontmatter.thumbnail || `/images/thumbnails/${slug}-illus.jpg`,
    thumbnailAlt: oldFrontmatter.thumbnailAlt || `Illustration pour l'article ${oldFrontmatter.title || slug}`,
    ogImage: oldFrontmatter.ogImage || '',
    featured: oldFrontmatter.featured === 'true' || oldFrontmatter.featured === true || false,
    priority: oldFrontmatter.priority || 5,
    metaTitle: oldFrontmatter.metaTitle || '',
    canonicalUrl: oldFrontmatter.canonicalUrl || '',
    noIndex: oldFrontmatter.noIndex === 'true' || oldFrontmatter.noIndex === true || false,
    schema: oldFrontmatter.schema || 'Article',
    readingTime: oldFrontmatter.readingTime ? {
      minutes: parseInt(oldFrontmatter.readingTime) || 5,
      text: `${parseInt(oldFrontmatter.readingTime) || 5} min de lecture`
    } : {
      minutes: 5,
      text: '5 min de lecture'
    }
  };
}

// Fonction pour générer le nouveau frontmatter YAML
function generateFrontmatter(frontmatter) {
  let yaml = '---\n';
  
  // Champs de base
  yaml += `title: "${frontmatter.title}"\n`;
  yaml += `description: "${frontmatter.description}"\n`;
  yaml += `slug: "${frontmatter.slug}"\n`;
  yaml += `pubDate: ${frontmatter.pubDate}\n`;
  
  if (frontmatter.updatedDate) {
    yaml += `updatedDate: ${frontmatter.updatedDate}\n`;
  }
  
  yaml += `author: "${frontmatter.author}"\n`;
  yaml += `category: "${frontmatter.category}"\n`;
  yaml += `tags: "${frontmatter.tags}"\n`;
  yaml += `collection: "${frontmatter.collection}"\n`;
  
  // Images
  yaml += `thumbnail: "${frontmatter.thumbnail}"\n`;
  yaml += `thumbnailAlt: "${frontmatter.thumbnailAlt}"\n`;
  
  if (frontmatter.ogImage) {
    yaml += `ogImage: "${frontmatter.ogImage}"\n`;
  }
  
  // SEO
  yaml += `featured: ${frontmatter.featured}\n`;
  yaml += `priority: ${frontmatter.priority}\n`;
  
  if (frontmatter.metaTitle) {
    yaml += `metaTitle: "${frontmatter.metaTitle}"\n`;
  }
  
  if (frontmatter.canonicalUrl) {
    yaml += `canonicalUrl: "${frontmatter.canonicalUrl}"\n`;
  }
  
  yaml += `noIndex: ${frontmatter.noIndex}\n`;
  yaml += `schema: "${frontmatter.schema}"\n`;
  
  // Temps de lecture
  yaml += `readingTime:\n`;
  yaml += `  minutes: ${frontmatter.readingTime.minutes}\n`;
  yaml += `  text: "${frontmatter.readingTime.text}"\n`;
  
  yaml += '---\n';
  
  return yaml;
}

// Fonction principale
async function updateArticles() {
  console.log('🚀 Mise à jour des articles avec les champs standardisés...\n');
  
  let totalUpdated = 0;
  
  for (const collectionName of collections) {
    const collectionPath = path.join(collectionsPath, collectionName);
    
    if (!fs.existsSync(collectionPath)) {
      console.log(`⚠️  Collection ${collectionName} non trouvée`);
      continue;
    }
    
    console.log(`📁 Traitement de la collection: ${collectionName}`);
    
    const files = fs.readdirSync(collectionPath)
      .filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(collectionPath, file);
      const slug = path.basename(file, '.md');
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter: oldFrontmatter, body } = extractFrontmatter(content);
        
        // Créer le nouveau frontmatter standardisé
        const newFrontmatter = createStandardFrontmatter(oldFrontmatter, slug, collectionName);
        
        // Générer le nouveau contenu
        const newYaml = generateFrontmatter(newFrontmatter);
        const newContent = newYaml + '\n' + body;
        
        // Sauvegarder le fichier
        fs.writeFileSync(filePath, newContent, 'utf-8');
        
        console.log(`  ✅ ${file} mis à jour`);
        totalUpdated++;
        
      } catch (error) {
        console.log(`  ❌ Erreur avec ${file}:`, error.message);
      }
    }
    
    console.log('');
  }
  
  console.log(`🎉 Mise à jour terminée! ${totalUpdated} articles mis à jour.`);
  console.log('\n📋 Résumé des champs ajoutés:');
  console.log('  • thumbnail: Image principale');
  console.log('  • thumbnailAlt: Texte alternatif'); 
  console.log('  • collection: Collection d\'appartenance');
  console.log('  • category: Catégorie principale');
  console.log('  • tags: Mots-clés SEO');
  console.log('  • priority: Priorité d\'affichage');
  console.log('  • schema: Type Schema.org');
  console.log('  • readingTime: Temps de lecture');
  console.log('  • featured: Article en vedette');
  console.log('  • noIndex: Exclusion moteurs de recherche');
}

// Exécution
updateArticles().catch(console.error);
