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
export function saveArticle(articleData) {
  try {
    const { filePath, title, description, author, keywords, intent, paragraphs } = articleData;
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier non trouvé: ${filePath}`);
    }
    
    // Lire le fichier existant pour préserver la structure
    const existingContent = fs.readFileSync(filePath, 'utf-8');
    
    // Extraire le frontmatter existant
    const frontmatterMatch = existingContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    let frontmatter = '';
    
    if (frontmatterMatch) {
      // Mettre à jour le frontmatter avec les nouvelles données
      frontmatter = `---
title: "${title}"
description: "${description}"
author: "${author}"
keywords: "${keywords}"
intent: "${intent}"
lastModified: "${new Date().toISOString()}"
---

`;
    } else {
      // Créer un nouveau frontmatter
      frontmatter = `---
title: "${title}"
description: "${description}"
author: "${author}"
keywords: "${keywords}"
intent: "${intent}"
created: "${new Date().toISOString()}"
---

`;
    }
    
    // Reconstruire le contenu avec les nouveaux paragraphes
    const newContent = frontmatter + paragraphs.join('\n\n');
    
    // Sauvegarder le fichier
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    // Recalculer les métriques
    const metrics = recalculateArticleMetrics(paragraphs.join(' '));
    
    return {
      success: true,
      message: 'Article sauvegardé avec succès',
      metrics: metrics
    };
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return {
      success: false,
      message: `Erreur: ${error.message}`
    };
  }
}

// Fonction pour valider les données d'article
export function validateArticleData(data) {
  const errors = [];
  
  if (!data.title || data.title.trim().length < 5) {
    errors.push('Le titre doit contenir au moins 5 caractères');
  }
  
  if (!data.description || data.description.trim().length < 20) {
    errors.push('La description doit contenir au moins 20 caractères');
  }
  
  if (!data.author || data.author.trim().length < 2) {
    errors.push('L\'auteur doit être spécifié');
  }
  
  if (!data.paragraphs || data.paragraphs.length === 0) {
    errors.push('L\'article doit contenir au moins un paragraphe');
  }
  
  if (data.paragraphs) {
    data.paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim().length < 10) {
        errors.push(`Le paragraphe ${index + 1} doit contenir au moins 10 caractères`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
