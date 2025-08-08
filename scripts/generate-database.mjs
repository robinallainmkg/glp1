import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour extraire les métadonnées frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, content: content };
  }
  
  const frontmatterLines = match[1].split('\n');
  const metadata = {};
  
  for (const line of frontmatterLines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      metadata[key.trim()] = value;
    }
  }
  
  return { metadata, content: match[2] };
}

// Fonction pour extraire les paragraphes
function extractParagraphs(content) {
  // Nettoie le contenu des balises markdown
  const cleanContent = content
    .replace(/^#+\s+.*/gm, '') // Supprime les titres
    .replace(/\*\*(.*?)\*\*/g, '$1') // Supprime le gras
    .replace(/\*(.*?)\*/g, '$1') // Supprime l'italique
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Supprime les liens
    .replace(/```[\s\S]*?```/g, '') // Supprime les blocs de code
    .replace(/`(.*?)`/g, '$1') // Supprime le code inline
    .trim();
  
  // Divise en paragraphes
  const paragraphs = cleanContent
    .split('\n\n')
    .filter(p => p.trim().length > 50) // Garde seulement les paragraphes substantiels
    .slice(0, 4); // Limite à 4 paragraphes
  
  return paragraphs;
}

// Fonction pour calculer les métriques d'un article
function calculateMetrics(content, paragraphs = []) {
  const fullText = paragraphs.length ? paragraphs.join(' ') : content;
  const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = fullText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 mots par minute
  
  return {
    wordCount,
    characterCount,
    readingTime: readingTime.toString()
  };
}

// Fonction pour calculer le temps de lecture
function calculateReadingTime(content) {
  const wordsPerMinute = 200; // Moyenne de lecture en français
  const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute)); // Au minimum 1 minute
}

// Fonction pour calculer le nombre de mots
function calculateWordCount(content) {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Fonction pour nettoyer et structurer le contenu
function processArticleContent(content) {
  // Nettoie le contenu des balises markdown
  const cleanContent = content
    .replace(/^#+\s+.*/gm, '') // Supprime les titres
    .replace(/\*\*(.*?)\*\*/g, '$1') // Supprime le gras
    .replace(/\*(.*?)\*/g, '$1') // Supprime l'italique
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Supprime les liens
    .replace(/```[\s\S]*?```/g, '') // Supprime les blocs de code
    .replace(/`(.*?)`/g, '$1') // Supprime le code inline
    .replace(/---[\s\S]*?---/g, '') // Supprime le frontmatter
    .trim();
  
  // Divise en paragraphes significatifs
  const paragraphs = cleanContent
    .split(/\n\s*\n/) // Sépare par double saut de ligne
    .map(p => p.replace(/\n/g, ' ').trim()) // Nettoie les sauts de ligne internes
    .filter(p => p.length > 30) // Garde seulement les paragraphes substantiels
    .slice(0, 10); // Limite à 10 paragraphes max
  
  return {
    fullContent: cleanContent,
    paragraphs: paragraphs,
    wordCount: calculateWordCount(cleanContent),
    characterCount: cleanContent.length,
    readingTime: calculateReadingTime(cleanContent)
  };
}

// Fonction principale pour analyser tous les articles
async function analyzeArticles() {
  const contentPath = path.resolve(__dirname, '../src/content');
  const categories = [];
  let totalArticles = 0;
  const allArticles = [];

  // Lire tous les dossiers de catégories
  const categoryDirs = fs.readdirSync(contentPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const categoryName of categoryDirs) {
    const categoryPath = path.join(contentPath, categoryName);
    const files = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.md'));
    
    const categoryArticles = [];

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { metadata, content: articleContent } = parseFrontmatter(content);
      
      const processedContent = processArticleContent(articleContent);
      
      const article = {
        // Identifiants
        slug: file.replace('.md', ''),
        filePath: filePath,
        category: categoryName,
        url: `/${categoryName}/${file.replace('.md', '')}/`,
        
        // Métadonnées éditables
        title: metadata.title || file.replace('.md', '').replace(/-/g, ' '),
        description: metadata.description || '',
        author: metadata.author || 'Dr. Émilie Martin',
        keywords: metadata.keyword || metadata.keywords || '',
        intent: metadata.intent || '',
        
        // Contenu éditable
        paragraphs: processedContent.paragraphs,
        rawContent: articleContent,
        
        // Données calculées automatiquement
        wordCount: processedContent.wordCount,
        characterCount: processedContent.characterCount,
        readingTime: processedContent.readingTime,
        
        // Métadonnées système
        lastModified: fs.statSync(filePath).mtime.toISOString(),
        fileSize: fs.statSync(filePath).size,
        
        // Compatibilité avec l'ancien format
        paragraph1: processedContent.paragraphs[0] || '',
        paragraph2: processedContent.paragraphs[1] || '',
        paragraph3: processedContent.paragraphs[2] || '',
        paragraph4: processedContent.paragraphs[3] || ''
      };
      
      categoryArticles.push(article);
      allArticles.push(article);
      totalArticles++;
    }

    categories.push({
      name: categoryName,
      displayName: categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      articleCount: files.length,
      articles: categoryArticles
    });
  }

  return {
    totalArticles,
    totalCategories: categories.length,
    categories,
    allArticles,
    generatedAt: new Date().toISOString()
  };
}

// Générer la base de données
const database = await analyzeArticles();

// Sauvegarder en JSON
const outputPath = path.resolve(__dirname, '../data/articles-database.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

console.log('📊 Base de données générée !');
console.log(`📁 Total catégories: ${database.totalCategories}`);
console.log(`📝 Total articles: ${database.totalArticles}`);
console.log(`💾 Sauvegardé dans: ${outputPath}`);

// Afficher un aperçu par catégorie
console.log('\n📈 Aperçu par catégorie:');
database.categories.forEach(cat => {
  console.log(`  ${cat.displayName}: ${cat.articleCount} articles`);
});
