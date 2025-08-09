import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script pour migrer la structure des articles vers le nouveau système de collections
 * Ajoute le support des collections multiples dans le frontmatter
 */

// Fonction pour lire les collections existantes
function loadCollections() {
  const collectionsPath = path.resolve(process.cwd(), 'data/collections.json');
  try {
    const rawData = fs.readFileSync(collectionsPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Erreur lecture collections:', error);
    return { collections: [] };
  }
}

// Fonction pour analyser et mettre à jour le frontmatter d'un article
function updateArticleFrontmatter(filePath, currentCategory) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Analyser le frontmatter existant
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      console.log(`Pas de frontmatter trouvé dans ${filePath}`);
      return false;
    }

    const [, frontmatterText, bodyContent] = frontmatterMatch;
    const metadata = {};
    
    // Parser le frontmatter existant
    frontmatterText.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        metadata[key.trim()] = value.replace(/['"]/g, '').trim();
      }
    });

    // Ajouter les nouveaux champs pour le système de collections
    const updatedMetadata = {
      ...metadata,
      // Garder la catégorie principale pour compatibilité
      category: currentCategory,
      // Nouveau: collections multiples (commence avec la catégorie actuelle)
      collections: [currentCategory],
      // Nouveau: template (par défaut "base")
      template: metadata.template || 'base',
      // Nouveau: status pour le workflow editorial
      status: metadata.status || 'published',
      // Nouveau: SEO amélioré
      seoTitle: metadata.seoTitle || metadata.title,
      seoDescription: metadata.seoDescription || metadata.description,
      // Nouveau: métriques SEO
      targetWordCount: metadata.targetWordCount || 500,
      // Timestamps
      created: metadata.created || new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // Reconstruire le frontmatter
    let newFrontmatter = '---\n';
    Object.entries(updatedMetadata).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        newFrontmatter += `${key}:\n`;
        value.forEach(item => {
          newFrontmatter += `  - "${item}"\n`;
        });
      } else {
        newFrontmatter += `${key}: "${value}"\n`;
      }
    });
    newFrontmatter += '---\n\n';

    // Reconstruire le contenu complet
    const newContent = newFrontmatter + bodyContent;

    // Sauvegarder le fichier mis à jour
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    console.log(`✅ Mis à jour: ${path.basename(filePath)}`);
    return true;

  } catch (error) {
    console.error(`❌ Erreur mise à jour ${filePath}:`, error);
    return false;
  }
}

// Fonction principale de migration
async function migrateArticleStructure() {
  console.log('🚀 Début de la migration vers le nouveau système de collections...\n');

  const collections = loadCollections();
  const contentDir = path.resolve(process.cwd(), 'src/content');
  
  let totalProcessed = 0;
  let totalUpdated = 0;

  // Parcourir chaque collection existante
  for (const collection of collections.collections) {
    const collectionDir = path.join(contentDir, collection.id);
    
    if (!fs.existsSync(collectionDir)) {
      console.log(`⚠️  Dossier non trouvé: ${collectionDir}`);
      continue;
    }

    console.log(`📁 Traitement de la collection: ${collection.name}`);
    
    const files = fs.readdirSync(collectionDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    for (const file of markdownFiles) {
      const filePath = path.join(collectionDir, file);
      totalProcessed++;
      
      const success = updateArticleFrontmatter(filePath, collection.id);
      if (success) {
        totalUpdated++;
      }
    }
    
    console.log(`   → ${markdownFiles.length} articles traités\n`);
  }

  console.log('📊 Résumé de la migration:');
  console.log(`   • Articles traités: ${totalProcessed}`);
  console.log(`   • Articles mis à jour: ${totalUpdated}`);
  console.log(`   • Erreurs: ${totalProcessed - totalUpdated}`);
  
  if (totalUpdated > 0) {
    console.log('\n✅ Migration terminée avec succès!');
    console.log('🔄 N\'oubliez pas de regénérer la base de données:');
    console.log('   node scripts/generate-database-v2.mjs');
  }
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateArticleStructure().catch(console.error);
}

export { migrateArticleStructure, updateArticleFrontmatter };
