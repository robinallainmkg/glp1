import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionsDir = path.join(__dirname, '../src/pages/collections');

// Lister toutes les collections
const collections = fs.readdirSync(collectionsDir).filter(dir => 
  fs.statSync(path.join(collectionsDir, dir)).isDirectory()
);

console.log(`🔧 Correction des templates de collection pour les produits d'affiliation...`);
console.log(`📂 Collections trouvées: ${collections.join(', ')}`);

let updatedCount = 0;

for (const collection of collections) {
  const templatePath = path.join(collectionsDir, collection, '[slug].astro');
  
  if (fs.existsSync(templatePath)) {
    let content = fs.readFileSync(templatePath, 'utf-8');
    
    // Vérifier si le template a besoin de correction
    if (content.includes('affiliateProducts={[]}')) {
      console.log(`\n🔧 Correction du template: ${collection}/[slug].astro`);
      
      // 1. Ajouter l'import de getRecommendedProducts si absent
      if (!content.includes('getRecommendedProducts')) {
        content = content.replace(
          "import { getCollection } from 'astro:content';",
          "import { getCollection } from 'astro:content';\nimport { getRecommendedProducts } from '../../../lib/affiliate.ts';"
        );
      }
      
      // 2. Ajouter la récupération des produits avant le template
      const collectionName = collection;
      
      // Chercher la ligne "const { entry } = Astro.props;" pour insérer après
      const entryLine = 'const { entry } = Astro.props;';
      if (content.includes(entryLine)) {
        const insertAfterEntry = `const { entry } = Astro.props;
const { Content } = await entry.render();
const content = entry.body;

// Utiliser le nom de la collection au lieu de la catégorie du frontmatter
const collectionName = "${collectionName}";

// Récupérer les produits d'affiliation recommandés
const affiliateProducts = await getRecommendedProducts(content, collectionName, 3);

// Configuration TinaCMS pour cette page
const tinaProps = {
  collection: '${collectionName.replace(/-/g, '_')}',
  document: entry.slug,
  relativePath: \`\${entry.slug}.md\`
};`;

        // Remplacer le bloc existant
        content = content.replace(
          /const { entry } = Astro\.props;[\s\S]*?const tinaProps = \{[\s\S]*?\};/,
          insertAfterEntry
        );
      }
      
      // 3. Remplacer affiliateProducts={[]} par affiliateProducts={affiliateProducts}
      content = content.replace(
        'affiliateProducts={[]}',
        'affiliateProducts={affiliateProducts}'
      );
      
      // 4. S'assurer que category utilise collectionName
      content = content.replace(
        /category=\{[^}]+\}/,
        'category={collectionName}'
      );
      
      // 5. S'assurer que articleContent utilise content
      content = content.replace(
        /articleContent=\{[^}]+\}/,
        'articleContent={content}'
      );
      
      // Écrire le fichier corrigé
      fs.writeFileSync(templatePath, content);
      updatedCount++;
      console.log(`✅ Template corrigé: ${collection}/[slug].astro`);
    } else {
      console.log(`✓ Template déjà correct: ${collection}/[slug].astro`);
    }
  } else {
    console.log(`⚠️ Template non trouvé: ${collection}/[slug].astro`);
  }
}

console.log(`\n🎉 Correction terminée !`);
console.log(`📊 Templates corrigés: ${updatedCount}/${collections.length}`);
console.log(`\n💡 Tous les templates de collection utilisent maintenant getRecommendedProducts`);
console.log(`🔧 La sidebar d'affiliation devrait maintenant s'afficher sur tous les articles`);
