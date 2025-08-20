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

// Fonction pour convertir les tags en format tableau
function formatTags(tagsValue) {
  if (!tagsValue) return [];
  
  // Si c'est déjà un tableau, le retourner
  if (Array.isArray(tagsValue)) return tagsValue;
  
  // Si c'est une chaîne, la parser
  if (typeof tagsValue === 'string') {
    // Essayer de parser comme JSON d'abord
    try {
      const parsed = JSON.parse(tagsValue);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    
    // Sinon, séparer par virgules et nettoyer
    return tagsValue
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }
  
  return [];
}

// Fonction pour extraire et parser le frontmatter YAML
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return { frontmatter: {}, body: content };
  
  const frontmatterText = match[1];
  const body = content.replace(frontmatterRegex, '').trim();
  
  // Parse YAML simple
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let inArray = false;
  let arrayItems = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('- ') && inArray) {
      // Élément de tableau
      arrayItems.push(trimmed.substring(2).trim().replace(/^["']|["']$/g, ''));
    } else if (trimmed.includes(':') && !inArray) {
      // Nouvelle clé
      if (currentKey && inArray) {
        frontmatter[currentKey] = arrayItems;
        arrayItems = [];
        inArray = false;
      }
      
      const colonIndex = trimmed.indexOf(':');
      currentKey = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      
      if (value === '' || value === '[]') {
        inArray = true;
        arrayItems = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Tableau sur une ligne
        try {
          frontmatter[currentKey] = JSON.parse(value);
        } catch {
          frontmatter[currentKey] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      } else {
        frontmatter[currentKey] = value.replace(/^["']|["']$/g, '');
      }
    } else if (trimmed.startsWith('[') && currentKey) {
      // Début de tableau multilignes
      inArray = true;
      const content = trimmed.substring(1);
      if (content.includes('"')) {
        arrayItems.push(...content.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')));
      }
    }
  }
  
  // Finaliser le dernier élément si c'était un tableau
  if (currentKey && inArray) {
    frontmatter[currentKey] = arrayItems;
  }
  
  return { frontmatter, body };
}

// Fonction pour générer le frontmatter YAML propre
function generateCleanFrontmatter(frontmatter) {
  let yaml = '---\n';
  
  // Ordre des champs
  const fieldOrder = [
    'title', 'description', 'slug', 'pubDate', 'updatedDate', 'author',
    'category', 'tags', 'collection', 'thumbnail', 'thumbnailAlt', 'ogImage',
    'featured', 'priority', 'metaTitle', 'canonicalUrl', 'noIndex', 'schema'
  ];
  
  // Ajouter les champs dans l'ordre
  for (const field of fieldOrder) {
    if (frontmatter[field] !== undefined && frontmatter[field] !== null) {
      const value = frontmatter[field];
      
      if (field === 'tags' && Array.isArray(value)) {
        yaml += `tags: [${value.map(tag => `"${tag}"`).join(', ')}]\n`;
      } else if (field === 'featured' || field === 'noIndex') {
        yaml += `${field}: ${value}\n`;
      } else if (field === 'priority') {
        yaml += `${field}: ${value}\n`;
      } else if (typeof value === 'string') {
        yaml += `${field}: "${value}"\n`;
      } else {
        yaml += `${field}: ${value}\n`;
      }
    }
  }
  
  // Ajouter les autres champs non standards
  for (const [key, value] of Object.entries(frontmatter)) {
    if (!fieldOrder.includes(key) && value !== undefined && value !== null) {
      if (typeof value === 'string') {
        yaml += `${key}: "${value}"\n`;
      } else {
        yaml += `${key}: ${value}\n`;
      }
    }
  }
  
  yaml += '---\n';
  return yaml;
}

// Fonction principale
async function cleanAllArticles() {
  console.log('🧹 Nettoyage et standardisation des articles...\n');
  
  let totalCleaned = 0;
  let errors = [];
  
  for (const collectionName of collections) {
    const collectionPath = path.join(collectionsPath, collectionName);
    
    if (!fs.existsSync(collectionPath)) {
      console.log(`⚠️  Collection ${collectionName} non trouvée`);
      continue;
    }
    
    console.log(`📁 Nettoyage de la collection: ${collectionName}`);
    
    const files = fs.readdirSync(collectionPath)
      .filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(collectionPath, file);
      const slug = path.basename(file, '.md');
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);
        
        // Nettoyer et standardiser le frontmatter
        const cleanFrontmatter = {
          title: frontmatter.title || '',
          description: frontmatter.description || frontmatter.metaDescription || '',
          slug: frontmatter.slug || slug,
          pubDate: frontmatter.pubDate || frontmatter.publishedAt || new Date().toISOString(),
          author: frontmatter.author || 'Dr. Sarah Martin',
          category: frontmatter.category || 'Guide médical',
          tags: formatTags(frontmatter.tags || frontmatter.keywords),
          collection: frontmatter.collection || collectionName,
          thumbnail: frontmatter.thumbnail || `/images/thumbnails/${slug}-illus.jpg`,
          thumbnailAlt: frontmatter.thumbnailAlt || frontmatter.imageAlt || `Illustration pour l'article ${frontmatter.title || slug}`,
          featured: frontmatter.featured === 'true' || frontmatter.featured === true || false,
          priority: frontmatter.priority || 5,
          schema: frontmatter.schema || 'Article'
        };
        
        // Ajouter les champs optionnels s'ils existent
        if (frontmatter.updatedDate) cleanFrontmatter.updatedDate = frontmatter.updatedDate;
        if (frontmatter.ogImage) cleanFrontmatter.ogImage = frontmatter.ogImage;
        if (frontmatter.metaTitle) cleanFrontmatter.metaTitle = frontmatter.metaTitle;
        if (frontmatter.canonicalUrl) cleanFrontmatter.canonicalUrl = frontmatter.canonicalUrl;
        if (frontmatter.noIndex) cleanFrontmatter.noIndex = frontmatter.noIndex === 'true' || frontmatter.noIndex === true;
        
        // Préserver les anciens champs pour compatibilité
        if (frontmatter.keyword) cleanFrontmatter.keyword = frontmatter.keyword;
        if (frontmatter.intent) cleanFrontmatter.intent = frontmatter.intent;
        if (frontmatter.readingTime) cleanFrontmatter.readingTime = frontmatter.readingTime;
        if (frontmatter.keywords) cleanFrontmatter.keywords = frontmatter.keywords;
        if (frontmatter.metaDescription) cleanFrontmatter.metaDescription = frontmatter.metaDescription;
        
        // Générer le nouveau contenu
        const newYaml = generateCleanFrontmatter(cleanFrontmatter);
        const newContent = newYaml + '\n' + body;
        
        // Sauvegarder le fichier
        fs.writeFileSync(filePath, newContent, 'utf-8');
        
        console.log(`  ✅ ${file} nettoyé (tags: ${cleanFrontmatter.tags.length})`);
        totalCleaned++;
        
      } catch (error) {
        const errorMsg = `Erreur avec ${file}: ${error.message}`;
        console.log(`  ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    console.log('');
  }
  
  console.log(`🎉 Nettoyage terminé! ${totalCleaned} articles traités.`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} erreurs rencontrées:`);
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\n📋 Standardisations appliquées:');
  console.log('  • tags: Format tableau uniforme');
  console.log('  • thumbnail: Chemin standardisé');
  console.log('  • collection: Assignation automatique');
  console.log('  • champs requis: Valeurs par défaut');
  console.log('  • compatibilité: Anciens champs préservés');
}

// Exécution
cleanAllArticles().catch(console.error);
