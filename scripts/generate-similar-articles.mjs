#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, '..', 'src', 'content');

// Configuration des relations entre collections
const collectionRelations = {
  'medicaments-glp1': {
    primary: ['effets-secondaires-glp1', 'glp1-diabete', 'glp1-perte-de-poids'],
    secondary: ['glp1-cout', 'medecins-glp1-france'],
    keywords: ['médicament', 'traitement', 'posologie', 'prescription']
  },
  'glp1-perte-de-poids': {
    primary: ['regime-glp1', 'medicaments-glp1', 'effets-secondaires-glp1'],
    secondary: ['glp1-cout', 'medecins-glp1-france'],
    keywords: ['perte de poids', 'obésité', 'amaigrissement', 'régime']
  },
  'effets-secondaires-glp1': {
    primary: ['medicaments-glp1', 'glp1-perte-de-poids', 'glp1-diabete'],
    secondary: ['medecins-glp1-france', 'alternatives-glp1'],
    keywords: ['effets secondaires', 'nausées', 'troubles digestifs', 'tolérance']
  },
  'glp1-diabete': {
    primary: ['medicaments-glp1', 'effets-secondaires-glp1', 'regime-glp1'],
    secondary: ['recherche-glp1', 'medecins-glp1-france'],
    keywords: ['diabète', 'glycémie', 'HbA1c', 'insuline']
  },
  'regime-glp1': {
    primary: ['glp1-perte-de-poids', 'glp1-diabete', 'medicaments-glp1'],
    secondary: ['effets-secondaires-glp1', 'alternatives-glp1'],
    keywords: ['nutrition', 'alimentation', 'régime', 'équilibré']
  },
  'glp1-cout': {
    primary: ['medicaments-glp1', 'medecins-glp1-france', 'alternatives-glp1'],
    secondary: ['glp1-perte-de-poids', 'glp1-diabete'],
    keywords: ['prix', 'coût', 'remboursement', 'assurance maladie']
  },
  'medecins-glp1-france': {
    primary: ['medicaments-glp1', 'glp1-diabete', 'glp1-perte-de-poids'],
    secondary: ['effets-secondaires-glp1', 'glp1-cout'],
    keywords: ['médecin', 'endocrinologue', 'prescription', 'consultation']
  },
  'alternatives-glp1': {
    primary: ['medicaments-glp1', 'regime-glp1', 'glp1-cout'],
    secondary: ['recherche-glp1', 'effets-secondaires-glp1'],
    keywords: ['alternative', 'autre traitement', 'option', 'choix']
  },
  'recherche-glp1': {
    primary: ['medicaments-glp1', 'effets-secondaires-glp1', 'alternatives-glp1'],
    secondary: ['glp1-diabete', 'glp1-perte-de-poids'],
    keywords: ['recherche', 'étude', 'science', 'innovation']
  }
};

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

// Fonction pour extraire une propriété du frontmatter
function extractProperty(frontmatter, property) {
  let match = frontmatter.match(new RegExp(`^${property}:\\s*["']([^"']+)["']`, 'm'));
  if (!match) {
    match = frontmatter.match(new RegExp(`^${property}:\\s*([^"\\n]+)`, 'm'));
  }
  return match ? match[1].trim() : '';
}

// Fonction pour calculer la similarité entre deux articles
function calculateSimilarity(article1, article2, collection1, collection2) {
  let score = 0;
  
  // Score basé sur la collection (relation)
  const relations = collectionRelations[collection1];
  if (relations) {
    if (relations.primary.includes(collection2)) {
      score += 50;
    } else if (relations.secondary.includes(collection2)) {
      score += 25;
    }
  }
  
  // Score basé sur les mots-clés communs
  const keywords1 = (article1.keywords || '').toLowerCase().split(',').map(k => k.trim());
  const keywords2 = (article2.keywords || '').toLowerCase().split(',').map(k => k.trim());
  const title1 = (article1.title || '').toLowerCase();
  const title2 = (article2.title || '').toLowerCase();
  
  // Mots-clés en commun
  const commonKeywords = keywords1.filter(k => keywords2.includes(k) && k.length > 2);
  score += commonKeywords.length * 10;
  
  // Mots du titre en commun
  const words1 = title1.split(' ').filter(w => w.length > 3);
  const words2 = title2.split(' ').filter(w => w.length > 3);
  const commonWords = words1.filter(w => words2.includes(w));
  score += commonWords.length * 15;
  
  // Bonus si même auteur
  if (article1.author && article2.author && article1.author === article2.author) {
    score += 5;
  }
  
  return score;
}

// Fonction pour charger tous les articles
function loadAllArticles() {
  const allArticles = [];
  
  const collections = fs.readdirSync(contentPath).filter(dir => 
    fs.statSync(path.join(contentPath, dir)).isDirectory() && dir !== 'config.ts'
  );
  
  collections.forEach(collection => {
    const collectionPath = path.join(contentPath, collection);
    const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.md'));
    
    files.forEach(file => {
      const filePath = path.join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter } = extractFrontmatter(content);
      
      const article = {
        collection,
        slug: file.replace('.md', ''),
        title: extractProperty(frontmatter, 'title'),
        description: extractProperty(frontmatter, 'description'),
        author: extractProperty(frontmatter, 'author'),
        keywords: extractProperty(frontmatter, 'keywords'),
        filePath
      };
      
      if (article.title) {
        allArticles.push(article);
      }
    });
  });
  
  return allArticles;
}

// Fonction pour trouver les articles similaires
function findSimilarArticles(targetArticle, allArticles, limit = 10) {
  const similarities = [];
  
  allArticles.forEach(article => {
    if (article.slug !== targetArticle.slug || article.collection !== targetArticle.collection) {
      const score = calculateSimilarity(targetArticle, article, targetArticle.collection, article.collection);
      if (score > 0) {
        similarities.push({
          ...article,
          similarityScore: score
        });
      }
    }
  });
  
  // Trier par score de similarité
  similarities.sort((a, b) => b.similarityScore - a.similarityScore);
  
  // Retourner les meilleurs résultats
  return similarities.slice(0, limit);
}

// Fonction pour générer le HTML des articles similaires
function generateSimilarArticlesHTML(similarArticles) {
  if (similarArticles.length === 0) {
    return '<p>Aucun article similaire trouvé.</p>';
  }
  
  let html = '<div class="similar-articles-grid">\n';
  
  similarArticles.forEach(article => {
    const url = `/collections/${article.collection}/${article.slug}/`;
    const imageUrl = `/images/thumbnails/${article.collection}-${article.slug}.svg`;
    
    html += `
      <article class="similar-article-card">
        <div class="similar-article-image">
          <img src="${imageUrl}" alt="${article.title}" loading="lazy" />
        </div>
        <div class="similar-article-content">
          <h4 class="similar-article-title">
            <a href="${url}">${article.title}</a>
          </h4>
          <p class="similar-article-description">${article.description || 'Guide complet et informations pratiques.'}</p>
          <div class="similar-article-meta">
            <span class="similar-article-collection">${article.collection.replace(/-/g, ' ')}</span>
            ${article.author ? `<span class="similar-article-author">Par ${article.author}</span>` : ''}
          </div>
        </div>
      </article>
    `;
  });
  
  html += '</div>\n';
  
  return html;
}

// Fonction pour mettre à jour un article avec ses articles similaires
function updateArticleWithSimilarArticles(article, allArticles) {
  const content = fs.readFileSync(article.filePath, 'utf-8');
  const { frontmatter, body } = extractFrontmatter(content);
  
  // Vérifier si les articles similaires existent déjà
  if (body.includes('<!-- ARTICLES SIMILAIRES -->')) {
    return false; // Déjà présent
  }
  
  const similarArticles = findSimilarArticles(article, allArticles);
  const similarArticlesHTML = generateSimilarArticlesHTML(similarArticles);
  
  // Ajouter la section des articles similaires à la fin du contenu
  const updatedBody = body + `\n\n<!-- ARTICLES SIMILAIRES -->
## 📚 Articles Similaires

Découvrez d'autres articles qui pourraient vous intéresser :

${similarArticlesHTML}

<style>
.similar-articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.similar-article-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e5e7eb;
}

.similar-article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.similar-article-image {
  aspect-ratio: 16/10;
  overflow: hidden;
}

.similar-article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.similar-article-content {
  padding: 1.5rem;
}

.similar-article-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
}

.similar-article-title a {
  color: #1f2937;
  text-decoration: none;
}

.similar-article-title a:hover {
  color: #3b82f6;
}

.similar-article-description {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.similar-article-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

.similar-article-collection {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: capitalize;
}
</style>`;
  
  const updatedContent = `---\n${frontmatter}\n---\n${updatedBody}`;
  
  fs.writeFileSync(article.filePath, updatedContent);
  return true;
}

// Fonction principale
function generateSimilarArticles() {
  console.log('🔗 Génération des articles similaires...\n');
  
  const allArticles = loadAllArticles();
  console.log(`📊 ${allArticles.length} articles chargés\n`);
  
  let totalUpdated = 0;
  let totalSkipped = 0;
  
  const collections = [...new Set(allArticles.map(a => a.collection))];
  
  collections.forEach(collection => {
    const articlesInCollection = allArticles.filter(a => a.collection === collection);
    console.log(`📁 ${collection}: ${articlesInCollection.length} articles`);
    
    articlesInCollection.forEach(article => {
      const updated = updateArticleWithSimilarArticles(article, allArticles);
      
      if (updated) {
        console.log(`  ✅ ${article.slug}: Articles similaires ajoutés`);
        totalUpdated++;
      } else {
        console.log(`  ⏭️  ${article.slug}: Articles similaires déjà présents`);
        totalSkipped++;
      }
    });
    
    console.log('');
  });
  
  console.log(`\n📊 Résumé :`);
  console.log(`  • ${totalUpdated} articles mis à jour`);
  console.log(`  • ${totalSkipped} articles déjà à jour`);
  console.log(`  • Système de recommandation activé`);
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSimilarArticles();
}

export { generateSimilarArticles, findSimilarArticles, loadAllArticles };
