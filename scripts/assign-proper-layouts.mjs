import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, '..', 'src', 'pages');

// Configuration des layouts selon le type de page
const layoutMapping = {
  // Pages statiques → BaseLayout
  'static': {
    layout: 'BaseLayout',
    importPath: '../layouts/BaseLayout.astro',
    showAffiliateSidebar: false
  },
  // Pages collections (index) → CollectionLayout  
  'collection': {
    layout: 'CollectionLayout',
    importPath: '../../layouts/CollectionLayout.astro', // depuis collections/*/index.astro
    showAffiliateSidebar: false
  },
  // Articles ([slug].astro) → ArticleWithAffiliateSidebar
  'article': {
    layout: 'ArticleWithAffiliateSidebar',
    importPath: '../../layouts/ArticleWithAffiliateSidebar.astro', // depuis collections/*/[slug].astro
    showAffiliateSidebar: true
  }
};

function detectPageType(filePath) {
  const relativePath = path.relative(pagesDir, filePath);
  
  // Articles: fichiers [slug].astro dans collections/
  if (relativePath.includes('collections/') && path.basename(filePath) === '[slug].astro') {
    return 'article';
  }
  
  // Collections: fichiers index.astro dans collections/
  if (relativePath.includes('collections/') && path.basename(filePath) === 'index.astro') {
    return 'collection';
  }
  
  // Pages statiques: tout le reste
  return 'static';
}

function getCorrectImportPath(filePath, targetLayout) {
  const relativePath = path.relative(pagesDir, filePath);
  const depth = relativePath.split('/').length - 1;
  
  let layoutPath;
  switch (targetLayout) {
    case 'BaseLayout':
      layoutPath = '../'.repeat(depth) + 'layouts/BaseLayout.astro';
      break;
    case 'CollectionLayout':
      layoutPath = '../'.repeat(depth) + 'layouts/CollectionLayout.astro';
      break;
    case 'ArticleWithAffiliateSidebar':
      layoutPath = '../'.repeat(depth) + 'layouts/ArticleWithAffiliateSidebar.astro';
      break;
    default:
      layoutPath = '../'.repeat(depth) + 'layouts/BaseLayout.astro';
  }
  
  return layoutPath;
}

function updateFileLayout(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const pageType = detectPageType(filePath);
  const config = layoutMapping[pageType];
  const correctImportPath = getCorrectImportPath(filePath, config.layout);
  
  console.log(`\n${filePath}:`);
  console.log(`  Type: ${pageType}`);
  console.log(`  Layout: ${config.layout}`);
  console.log(`  Import: ${correctImportPath}`);
  
  // Remplacer l'import du layout
  let updatedContent = content;
  
  // Patterns d'import possibles
  const importPatterns = [
    /import\s+UnifiedLayout\s+from\s+['"][^'"]+UnifiedLayout\.astro['"];?/g,
    /import\s+BaseLayout\s+from\s+['"][^'"]+BaseLayout\.astro['"];?/g,
    /import\s+CollectionLayout\s+from\s+['"][^'"]+CollectionLayout\.astro['"];?/g,
    /import\s+ArticleLayout\s+from\s+['"][^'"]+ArticleLayout\.astro['"];?/g,
    /import\s+ArticleWithAffiliateSidebar\s+from\s+['"][^'"]+ArticleWithAffiliateSidebar\.astro['"];?/g
  ];
  
  // Trouver l'import existant
  let hasImport = false;
  for (const pattern of importPatterns) {
    if (pattern.test(content)) {
      updatedContent = updatedContent.replace(pattern, `import ${config.layout} from '${correctImportPath}';`);
      hasImport = true;
      break;
    }
  }
  
  // Si pas d'import trouvé, l'ajouter au début du frontmatter
  if (!hasImport && content.includes('---')) {
    const frontmatterStart = content.indexOf('---');
    const frontmatterEnd = content.indexOf('---', frontmatterStart + 3);
    if (frontmatterStart !== -1 && frontmatterEnd !== -1) {
      const beforeFrontmatter = content.slice(0, frontmatterStart + 3);
      const frontmatterContent = content.slice(frontmatterStart + 3, frontmatterEnd);
      const afterFrontmatter = content.slice(frontmatterEnd);
      
      updatedContent = beforeFrontmatter + `\nimport ${config.layout} from '${correctImportPath}';\n` + frontmatterContent + afterFrontmatter;
    }
  }
  
  // Remplacer l'utilisation du composant layout
  const layoutPatterns = [
    /<UnifiedLayout([^>]*)>/g,
    /<BaseLayout([^>]*)>/g,
    /<CollectionLayout([^>]*)>/g,
    /<ArticleLayout([^>]*)>/g,
    /<ArticleWithAffiliateSidebar([^>]*)>/g
  ];
  
  for (const pattern of layoutPatterns) {
    if (pattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(pattern, (match, attributes) => {
        // Pour les articles, ajouter showAffiliateSidebar={true} si pas présent
        if (pageType === 'article' && !attributes.includes('showAffiliateSidebar')) {
          const cleanAttributes = attributes.trim();
          const separator = cleanAttributes ? '\n  ' : '';
          return `<${config.layout}${cleanAttributes}${separator}showAffiliateSidebar={true}>`;
        }
        // Pour les autres, enlever showAffiliateSidebar s'il est présent
        else if (pageType !== 'article' && attributes.includes('showAffiliateSidebar')) {
          const cleanAttributes = attributes.replace(/\s*showAffiliateSidebar=\{[^}]+\}/g, '').trim();
          return `<${config.layout}${cleanAttributes}>`;
        }
        return `<${config.layout}${attributes}>`;
      });
      break;
    }
  }
  
  // Remplacer les fermetures de tags
  const closingPatterns = [
    /<\/UnifiedLayout>/g,
    /<\/BaseLayout>/g,
    /<\/CollectionLayout>/g,
    /<\/ArticleLayout>/g,
    /<\/ArticleWithAffiliateSidebar>/g
  ];
  
  for (const pattern of closingPatterns) {
    updatedContent = updatedContent.replace(pattern, `</${config.layout}>`);
  }
  
  // Sauvegarder si changé
  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`  ✅ Mis à jour`);
    return true;
  } else {
    console.log(`  ⚠️  Aucun changement nécessaire`);
    return false;
  }
}

function findAstroFiles(dir) {
  const files = [];
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Ignorer certains dossiers
        if (!['node_modules', '.git', 'dist', '.astro'].includes(entry.name)) {
          scan(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.astro')) {
        // Ignorer les layouts et composants
        if (!fullPath.includes('/layouts/') && !fullPath.includes('/components/')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scan(dir);
  return files;
}

// Script principal
console.log('🔄 Attribution des layouts appropriés...\n');

const astroFiles = findAstroFiles(pagesDir);
let updatedCount = 0;

console.log(`Trouvé ${astroFiles.length} fichiers .astro à vérifier\n`);

for (const file of astroFiles) {
  if (updateFileLayout(file)) {
    updatedCount++;
  }
}

console.log(`\n✅ Terminé! ${updatedCount} fichiers mis à jour.`);
console.log('\nRésumé des layouts assignés:');
console.log('- Pages statiques → BaseLayout');
console.log('- Collections (index) → CollectionLayout');
console.log('- Articles ([slug]) → ArticleWithAffiliateSidebar + showAffiliateSidebar={true}');
