import fs from 'fs';
import path from 'path';

// Liste des collections à uniformiser
const collections = [
  'glp1-cout',
  'medicaments-glp1', 
  'glp1-perte-de-poids',
  'effets-secondaires-glp1',
  'glp1-diabete',
  'regime-glp1',
  'alternatives-glp1',
  'medecins-glp1-france',
  'recherche-glp1'
];

// Template uniforme pour [slug].astro
const slugTemplate = (collectionName) => `---
import BaseLayout from '../../layouts/BaseLayout.astro';
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
---

<BaseLayout 
  title={entry.data.title}
  description={entry.data.description}
  keywords={entry.data.keywords}
>

<div class="container">
  <article class="article-content">
    <header class="article-header">
      <h1>{entry.data.title}</h1>
      <div class="article-meta">
        <span class="article-author">{entry.data.author}</span>
        <span class="article-date">{entry.data.date}</span>
        <span class="article-reading-time">{entry.data.readingTime} min de lecture</span>
      </div>
    </header>

    <div class="article-body">
      <Content />
    </div>
  </article>
</div>

</BaseLayout>`;

const pagesDir = './src/pages';

collections.forEach(collection => {
  const slugPath = path.join(pagesDir, collection, '[slug].astro');
  
  if (fs.existsSync(path.dirname(slugPath))) {
    fs.writeFileSync(slugPath, slugTemplate(collection));
    console.log(`✅ Template créé: ${collection}/[slug].astro`);
  } else {
    console.log(`❌ Dossier manquant: ${collection}`);
  }
});

console.log('📄 Uniformisation des templates d\'articles terminée !');
