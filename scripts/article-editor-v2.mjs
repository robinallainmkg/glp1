import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour recalculer les métriques
function calculateMetrics(paragraphs) {
  const fullText = paragraphs.map(p => typeof p === 'string' ? p : p.content).join(' ');
  const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = fullText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 mots par minute
  
  return {
    wordCount,
    characterCount,
    readingTime: readingTime.toString()
  };
}

// Fonction pour valider les données d'un article
function validateArticleData(articleData) {
  const errors = [];
  
  if (!articleData.title || articleData.title.trim().length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères');
  }
  
  if (!articleData.description || articleData.description.trim().length < 10) {
    errors.push('La description doit contenir au moins 10 caractères');
  }
  
  if (!articleData.author || articleData.author.trim().length < 2) {
    errors.push('L\'auteur doit contenir au moins 2 caractères');
  }
  
  if (!articleData.keywords || articleData.keywords.trim().length < 3) {
    errors.push('Les mots-clés doivent contenir au moins 3 caractères');
  }
  
  if (!articleData.intent || !['Informational', 'Commercial', 'Transactional'].includes(articleData.intent)) {
    errors.push('L\'intention doit être Informational, Commercial ou Transactional');
  }
  
  if (!articleData.paragraphs || !Array.isArray(articleData.paragraphs) || articleData.paragraphs.length === 0) {
    errors.push('Au moins un paragraphe est requis');
  } else {
    articleData.paragraphs.forEach((p, index) => {
      const content = typeof p === 'string' ? p : p.content;
      if (!content || content.trim().length < 20) {
        errors.push(`Le paragraphe ${index + 1} doit contenir au moins 20 caractères`);
      }
    });
  }
  
  return errors;
}

// Fonction pour sauvegarder un article modifié
export async function saveArticle(articleId, editedData) {
  try {
    // Validation des données
    const validationErrors = validateArticleData(editedData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      };
    }
    
    // Charger la base de données actuelle
    const dbPath = path.resolve(__dirname, '../data/articles-database.json');
    const database = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Trouver l'article à modifier
    let articleFound = false;
    let updatedArticle = null;
    
    for (const category of database.categories) {
      const articleIndex = category.articles.findIndex(article => article.id === articleId);
      if (articleIndex !== -1) {
        const article = category.articles[articleIndex];
        
        // Recalculer les métriques
        const metrics = calculateMetrics(editedData.paragraphs);
        
        // Mettre à jour les champs éditables
        if (article.editable) {
          article.editable.title = editedData.title;
          article.editable.description = editedData.description;
          article.editable.author = editedData.author;
          article.editable.keywords = editedData.keywords;
          article.editable.intent = editedData.intent;
          article.editable.paragraphs = editedData.paragraphs.map((p, index) => ({
            id: index + 1,
            content: typeof p === 'string' ? p : p.content
          }));
          
          // Mettre à jour les métriques calculées
          article.calculated.wordCount = metrics.wordCount;
          article.calculated.characterCount = metrics.characterCount;
          article.calculated.readingTime = metrics.readingTime;
          article.calculated.lastModified = new Date().toISOString();
        }
        
        // Compatibilité avec l'ancien format
        article.title = editedData.title;
        article.description = editedData.description;
        article.author = editedData.author;
        article.keywords = editedData.keywords;
        article.intent = editedData.intent;
        article.readingTime = metrics.readingTime;
        article.characterCount = metrics.characterCount;
        article.paragraph1 = editedData.paragraphs[0]?.content || editedData.paragraphs[0] || '';
        article.paragraph2 = editedData.paragraphs[1]?.content || editedData.paragraphs[1] || '';
        article.paragraph3 = editedData.paragraphs[2]?.content || editedData.paragraphs[2] || '';
        article.paragraph4 = editedData.paragraphs[3]?.content || editedData.paragraphs[3] || '';
        
        updatedArticle = article;
        articleFound = true;
        break;
      }
    }
    
    if (!articleFound) {
      return {
        success: false,
        errors: ['Article non trouvé']
      };
    }
    
    // Mettre à jour les métadonnées de la base de données
    if (!database.metadata) {
      database.metadata = {};
    }
    database.metadata.lastUpdated = new Date().toISOString();
    
    // Sauvegarder la base de données mise à jour
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
    
    return {
      success: true,
      article: updatedArticle,
      metrics: {
        wordCount: updatedArticle.calculated?.wordCount || updatedArticle.wordCount,
        characterCount: updatedArticle.calculated?.characterCount || updatedArticle.characterCount,
        readingTime: updatedArticle.calculated?.readingTime || updatedArticle.readingTime
      }
    };
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return {
      success: false,
      errors: ['Erreur interne du serveur']
    };
  }
}

// Fonction pour obtenir un article par ID
export function getArticleById(articleId) {
  try {
    const dbPath = path.resolve(__dirname, '../data/articles-database.json');
    const database = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    for (const category of database.categories) {
      const article = category.articles.find(article => article.id === articleId);
      if (article) {
        return article;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    return null;
  }
}

// Interface pour simuler les appels API côté client
export const ArticleAPI = {
  async save(articleId, editedData) {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return saveArticle(articleId, editedData);
  },
  
  async get(articleId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return getArticleById(articleId);
  },
  
  calculateMetrics(paragraphs) {
    return calculateMetrics(paragraphs);
  }
};
