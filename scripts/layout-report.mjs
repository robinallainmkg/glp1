import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPagesDir = path.join(__dirname, '..', 'src', 'pages');

function analyzeLayoutUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcPagesDir, filePath);
    
    // Détecter le layout utilisé
    const layoutMatch = content.match(/import\s+\w+\s+from\s+['"][^'"]*layouts\/(\w+Layout)\.astro['"];?/);
    
    if (layoutMatch) {
      return {
        path: relativePath,
        layout: layoutMatch[1],
        isArticle: path.basename(filePath) === '[slug].astro',
        isCollectionIndex: path.basename(filePath) === 'index.astro' && relativePath.includes('collections/'),
        isStatic: !path.basename(filePath).includes('[') && !relativePath.includes('collections/')
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let results = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(walkDirectory(filePath));
    } else if (file.endsWith('.astro') && !file.startsWith('_')) {
      const analysis = analyzeLayoutUsage(filePath);
      if (analysis) {
        results.push(analysis);
      }
    }
  }
  
  return results;
}

console.log('📊 RAPPORT DES LAYOUTS');
console.log('='.repeat(50));

const results = walkDirectory(srcPagesDir);

// Grouper par layout
const byLayout = results.reduce((acc, item) => {
  if (!acc[item.layout]) acc[item.layout] = [];
  acc[item.layout].push(item);
  return acc;
}, {});

// Statistiques
console.log('\n📈 STATISTIQUES:');
Object.keys(byLayout).forEach(layout => {
  console.log(`${layout}: ${byLayout[layout].length} fichiers`);
});

// Détail par layout
console.log('\n📄 STATICLAYOUT (Pages statiques):');
(byLayout.StaticLayout || []).forEach(item => {
  console.log(`  ✓ ${item.path}`);
});

console.log('\n📁 COLLECTIONLAYOUT (Index des collections):');
(byLayout.CollectionLayout || []).forEach(item => {
  console.log(`  ✓ ${item.path}`);
});

console.log('\n📝 ARTICLEWITHAFFILIATESIDEBAR (Articles):');
(byLayout.ArticleWithAffiliateSidebar || []).forEach(item => {
  console.log(`  ✓ ${item.path}`);
});

// Vérifications
console.log('\n🔍 VÉRIFICATIONS:');

const errors = [];

// Vérifier que tous les [slug].astro utilisent ArticleWithAffiliateSidebar
results.forEach(item => {
  if (item.isArticle && item.layout !== 'ArticleWithAffiliateSidebar') {
    errors.push(`❌ ${item.path} est un article mais utilise ${item.layout}`);
  }
  
  if (item.isCollectionIndex && item.layout !== 'CollectionLayout') {
    errors.push(`❌ ${item.path} est un index de collection mais utilise ${item.layout}`);
  }
});

if (errors.length === 0) {
  console.log('✅ Tous les layouts sont correctement organisés !');
} else {
  errors.forEach(error => console.log(error));
}

console.log('\n🎯 RÉSUMÉ:');
console.log('• Pages statiques → StaticLayout');
console.log('• Index collections → CollectionLayout');  
console.log('• Articles [slug] → ArticleWithAffiliateSidebar');
console.log('\n✨ Organisation terminée !');
