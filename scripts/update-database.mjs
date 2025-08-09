import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const contentDir = path.join(projectRoot, 'src', 'content');
const dataDir = path.join(projectRoot, 'data');
const databaseFile = path.join(dataDir, 'articles-database.json');

/**
 * Mettre à jour la base de données des articles
 */
export async function updateDatabase() {
  try {
    console.log('🔄 Mise à jour de la base de données des articles...');
    
    // Lire le dossier content pour obtenir toutes les collections
    const collections = await fs.readdir(contentDir);
    const categories = [];
    let totalArticles = 0;

    for (const collectionName of collections) {
      const collectionPath = path.join(contentDir, collectionName);
      const stat = await fs.stat(collectionPath);
      
      if (!stat.isDirectory()) continue;

      console.log(`📁 Traitement de la collection: ${collectionName}`);
      
      const articles = [];
      const files = await fs.readdir(collectionPath);
      
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        
        const filePath = path.join(collectionPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const slug = file.replace('.md', '');
        
        // Extraire les métadonnées du frontmatter
        const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        let frontmatter = {};
        
        if (frontmatterMatch) {
          const frontmatterText = frontmatterMatch[1];
          frontmatterText.split('\n').forEach(line => {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
              const [, key, value] = match;
              frontmatter[key] = value.replace(/['"]/g, '');
            }
          });
        }
        
        // Extraire le contenu sans frontmatter
        const rawContent = content.replace(/^---\s*\n[\s\S]*?\n---\n?/, '');
        
        // Calculer les statistiques
        const wordCount = rawContent.split(/\s+/).length;
        const characterCount = rawContent.length;
        const readingTime = Math.ceil(wordCount / 200); // 200 mots par minute
        
        // Extraire les paragraphes
        const paragraphs = rawContent.split('\n\n').filter(p => p.trim()).slice(0, 4);
        
        const article = {
          slug,
          filePath,
          category: collectionName,
          url: `/${collectionName}/${slug}/`,
          title: frontmatter.title || slug.replace(/-/g, ' '),
          description: frontmatter.description || `Guide complet sur ${slug.replace(/-/g, ' ')}`,
          author: frontmatter.author || 'Dr. Émilie Martin',
          keywords: frontmatter.keywords || slug.replace(/-/g, ' '),
          intent: frontmatter.intent || 'Informational',
          paragraphs,
          rawContent,
          wordCount,
          characterCount,
          readingTime,
          lastModified: new Date().toISOString(),
          fileSize: Buffer.byteLength(content, 'utf8'),
          paragraph1: paragraphs[0] || '',
          paragraph2: paragraphs[1] || '',
          paragraph3: paragraphs[2] || '',
          paragraph4: paragraphs[3] || ''
        };
        
        articles.push(article);
        totalArticles++;
      }
      
      if (articles.length > 0) {
        categories.push({
          name: collectionName,
          displayName: collectionName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          articleCount: articles.length,
          articles
        });
      }
    }
    
    const database = {
      totalArticles,
      totalCategories: categories.length,
      categories,
      lastUpdated: new Date().toISOString(),
      version: '2.0'
    };
    
    // Sauvegarder la base de données
    await fs.writeFile(databaseFile, JSON.stringify(database, null, 2), 'utf-8');
    
    console.log(`✅ Base de données mise à jour avec succès !`);
    console.log(`📊 ${totalArticles} articles dans ${categories.length} collections`);
    
    return database;
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la base de données:', error);
    throw error;
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  updateDatabase();
}
