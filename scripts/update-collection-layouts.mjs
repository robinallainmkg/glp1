import fs from 'fs';
import path from 'path';

const PAGES_DIR = './src/pages';

const collections = [
  { name: 'alternatives-glp1', theme: 'alternatives' },
  { name: 'effets-secondaires-glp1', theme: 'side-effects' },
  { name: 'glp1-cout', theme: 'cost' },
  { name: 'glp1-diabete', theme: 'diabetes' },
  { name: 'medecins-glp1-france', theme: 'experts' },
  { name: 'medicaments-glp1', theme: 'medical' },
  { name: 'recherche-glp1', theme: 'research' },
  { name: 'regime-glp1', theme: 'nutrition' }
];

function generateSlugPage(collectionName, theme) {
  return `---
import ArticleLayout from '../../layouts/ArticleLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('${collectionName}');
  return entries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const content = entry.body;

// Utiliser le nom de la collection au lieu de la catégorie du frontmatter
const collectionName = "${collectionName}";
---

<ArticleLayout 
  title={entry.data.title}
  description={entry.data.description || entry.data.metaDescription || ""}
  author={entry.data.author || "Équipe GLP-1 France"}
  category={collectionName}
  keywords={entry.data.keywords || ""}
  readingTime={entry.data.readingTime || 5}
  lastModified={entry.data.pubDate}
  content={content}
  collectionTheme="${theme}"
/>
</ArticleLayout>
`;
}

function updateCollectionLayouts() {
  console.log('🔄 Mise à jour des layouts de collections...\n');
  
  collections.forEach(({ name, theme }) => {
    const slugFilePath = path.join(PAGES_DIR, name, '[slug].astro');
    
    if (fs.existsSync(slugFilePath)) {
      const newContent = generateSlugPage(name, theme);
      fs.writeFileSync(slugFilePath, newContent, 'utf-8');
      console.log(`✅ Mis à jour: ${name}/[slug].astro -> thème: ${theme}`);
    } else {
      console.log(`⚠️  Fichier non trouvé: ${slugFilePath}`);
    }
  });
  
  console.log('\n🎯 Toutes les collections utilisent maintenant ArticleLayout avec fil d\'Ariane !');
}

updateCollectionLayouts();
