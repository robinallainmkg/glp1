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

// Fonction pour calculer le nombre de mots
function calculateWordCount(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Fonction pour calculer le temps de lecture
function calculateReadingTime(text) {
  const wordCount = calculateWordCount(text);
  return Math.max(1, Math.ceil(wordCount / 200)); // 200 mots par minute
}

// Fonction pour analyser le contenu d'un article
function analyzeContent(content) {
  // Nettoie le contenu des balises markdown
  const cleanContent = content
    .replace(/^#+\s+.*/gm, '') // Supprime les titres
    .replace(/\*\*(.*?)\*\*/g, '$1') // Supprime le gras
    .replace(/\*(.*?)\*/g, '$1') // Supprime l'italique
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Supprime les liens
    .replace(/```[\s\S]*?```/g, '') // Supprime les blocs de code
    .replace(/`(.*?)`/g, '$1') // Supprime le code inline
    .trim();
  
  // Divise en paragraphes significatifs
  const paragraphs = cleanContent
    .split(/\n\s*\n/) // Sépare par double saut de ligne
    .map(p => p.replace(/\n/g, ' ').trim()) // Nettoie les sauts de ligne internes
    .filter(p => p.length > 30) // Garde seulement les paragraphes substantiels
    .slice(0, 10); // Limite à 10 paragraphes max
  
  return {
    cleanContent,
    paragraphs,
    wordCount: calculateWordCount(cleanContent),
    characterCount: cleanContent.length,
    readingTime: calculateReadingTime(cleanContent)
  };
}

// Fonction pour créer la structure d'un article
function createArticleStructure(file, categoryName, metadata, content, filePath) {
  const analyzed = analyzeContent(content);
  const slug = file.replace('.md', '');
  
  return {
    // Identifiants uniques (non éditables)
    id: `${categoryName}/${slug}`,
    slug,
    category: categoryName,
    filePath,
    url: `/${categoryName}/${slug}/`,
    
    // Champs éditables via l'interface admin
    editable: {
      title: metadata.title || slug.replace(/-/g, ' '),
      description: metadata.description || `${slug.replace(/-/g, ' ')} — Guide marché français.`,
      author: metadata.author || 'Dr. Émilie Martin',
      keywords: metadata.keyword || metadata.keywords || '',
      intent: metadata.intent || 'Informational',
      paragraphs: analyzed.paragraphs.slice(0, 4).map((p, index) => ({
        id: index + 1,
        content: p || `Résumé : Cet article explique « ${slug.replace(/-/g, ' ')} » pour le marché français : prix en €, cadre ANSM, conseils pratiques.`
      }))
    },
    
    // Champs calculés automatiquement (non éditables directement)
    calculated: {
      wordCount: analyzed.wordCount,
      characterCount: analyzed.characterCount,
      readingTime: analyzed.readingTime.toString(),
      lastModified: fs.statSync(filePath).mtime.toISOString(),
      fileSize: fs.statSync(filePath).size
    },
    
    // Contenu brut pour référence
    rawContent: content,
    
    // Compatibilité avec l'ancien format (sera supprimé plus tard)
    title: metadata.title || slug.replace(/-/g, ' '),
    description: metadata.description || `${slug.replace(/-/g, ' ')} — Guide marché français.`,
    author: metadata.author || 'Dr. Émilie Martin',
    keywords: metadata.keyword || metadata.keywords || '',
    intent: metadata.intent || 'Informational',
    readingTime: analyzed.readingTime.toString(),
    characterCount: analyzed.characterCount,
    paragraph1: analyzed.paragraphs[0] || `Résumé : Cet article explique « ${slug.replace(/-/g, ' ')} » pour le marché français : prix en €, cadre ANSM, conseils pratiques.`,
    paragraph2: analyzed.paragraphs[1] || `Résumé : Cet article explique « ${slug.replace(/-/g, ' ')} » pour le marché français : prix en €, cadre ANSM, conseils pratiques.`,
    paragraph3: analyzed.paragraphs[2] || `Résumé : Cet article explique « ${slug.replace(/-/g, ' ')} » pour le marché français : prix en €, cadre ANSM, conseils pratiques.`,
    paragraph4: analyzed.paragraphs[3] || `Résumé : Cet article explique « ${slug.replace(/-/g, ' ')} » pour le marché français : prix en €, cadre ANSM, conseils pratiques.`
  };
}

// Fonction principale pour analyser tous les articles
async function generateDatabase() {
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
      
      const article = createArticleStructure(file, categoryName, metadata, articleContent, filePath);
      
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
    metadata: {
      totalArticles,
      totalCategories: categories.length,
      generatedAt: new Date().toISOString(),
      version: '2.0'
    },
    categories,
    allArticles
  };
}

// Fonction pour recalculer les métriques d'un article
export function recalculateMetrics(paragraphs) {
  const fullText = paragraphs.map(p => typeof p === 'string' ? p : p.content).join(' ');
  const wordCount = calculateWordCount(fullText);
  const characterCount = fullText.length;
  const readingTime = calculateReadingTime(fullText);
  
  return {
    wordCount,
    characterCount,
    readingTime: readingTime.toString()
  };
}

// Générer la base de données
console.log('🔄 Génération de la base de données des articles...');
const database = await generateDatabase();

// Sauvegarder en JSON
const outputPath = path.resolve(__dirname, '../data/articles-database.json');
fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

console.log(`✅ Base de données générée avec succès !`);
console.log(`📊 ${database.metadata.totalArticles} articles dans ${database.metadata.totalCategories} catégories`);
console.log(`💾 Sauvegardé dans : ${outputPath}`);
