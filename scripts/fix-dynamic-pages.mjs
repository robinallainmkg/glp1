#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const collections = [
  'effets-secondaires-glp1',
  'glp1-cout', 
  'glp1-diabete',
  'glp1-perte-de-poids',
  'medecins-glp1-france',
  'medicaments-glp1',
  'recherche-glp1',
  'regime-glp1'
];

const template = (category) => `---
import ArticleLayout from '../../layouts/ArticleLayout.astro';
import fs from 'fs';
import path from 'path';

export async function getStaticPaths() {
  const category = '${category}';
  
  // Lire le fichier JSON directement
  const databasePath = path.join(process.cwd(), 'data', 'articles-database.json');
  const articlesDatabase = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  
  const categoryData = articlesDatabase.categories.find(cat => cat.name === category);
  
  if (!categoryData) {
    return [];
  }

  return categoryData.articles.map(article => ({
    params: { 
      slug: article.slug 
    },
    props: { 
      article,
      category: categoryData
    }
  }));
}

const { article, category } = Astro.props;

const getCollectionTheme = (categoryName: string) => {
  const themeMap = {
    'alternatives-glp1': 'alternatives',
    'effets-secondaires-glp1': 'side-effects',
    'glp1-cout': 'cost',
    'glp1-diabete': 'diabetes',
    'glp1-perte-de-poids': 'weight-loss',
    'medecins-glp1-france': 'experts',
    'medicaments-glp1': 'medical',
    'recherche-glp1': 'research',
    'regime-glp1': 'nutrition'
  };
  return themeMap[categoryName] || 'weight-loss';
};

const collectionTheme = getCollectionTheme(article.category);
---

<ArticleLayout
  title={article.title}
  description={article.description}
  author={article.author}
  category={article.category}
  keywords={article.keywords}
  readingTime={article.readingTime}
  lastModified={article.lastModified}
  content={article.rawContent}
  collectionTheme={collectionTheme}
/>`;

// Corriger tous les fichiers
for (const collection of collections) {
  const filePath = path.join(process.cwd(), 'src', 'pages', collection, '[slug].astro');
  console.log(`Mise à jour de ${filePath}`);
  fs.writeFileSync(filePath, template(collection));
}

console.log('✅ Tous les fichiers de pages dynamiques ont été corrigés !');
