import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPagesDir = path.join(__dirname, '..', 'src', 'pages');

// Configuration des layouts selon le type de fichier
const LAYOUT_CONFIG = {
  // Articles [slug].astro -> ArticleWithAffiliateSidebar
  ARTICLE: {
    layout: 'ArticleWithAffiliateSidebar',
    import: "import ArticleWithAffiliateSidebar from '../../../layouts/ArticleWithAffiliateSidebar.astro';",
    pattern: /\[slug\]\.astro$/
  },
  
  // Collections index.astro -> CollectionLayout
  COLLECTION: {
    layout: 'CollectionLayout',
    import: "import CollectionLayout from '../../../layouts/CollectionLayout.astro';",
    pattern: /collections\/[^\/]+\/index\.astro$/
  },
  
  // Pages statiques -> StaticLayout
  STATIC: {
    layout: 'StaticLayout',
    import: "import StaticLayout from '../layouts/StaticLayout.astro';",
    pattern: /.*/ // Par défaut pour tout le reste
  }
};

function determineLayoutType(filePath) {
  const relativePath = path.relative(srcPagesDir, filePath);
  
  if (LAYOUT_CONFIG.ARTICLE.pattern.test(relativePath)) {
    return 'ARTICLE';
  }
  
  if (LAYOUT_CONFIG.COLLECTION.pattern.test(relativePath)) {
    return 'COLLECTION';
  }
  
  return 'STATIC';
}

function getCorrectImportPath(filePath, layoutType) {
  const relativePath = path.relative(srcPagesDir, filePath);
  const pathDepth = relativePath.split(path.sep).length - 1;
  
  let importPath;
  
  switch (layoutType) {
    case 'ARTICLE':
      // Articles sont dans collections/collection-name/[slug].astro
      importPath = "import ArticleWithAffiliateSidebar from '../../../layouts/ArticleWithAffiliateSidebar.astro';";
      break;
      
    case 'COLLECTION':
      // Collections index sont dans collections/collection-name/index.astro
      importPath = "import CollectionLayout from '../../../layouts/CollectionLayout.astro';";
      break;
      
    case 'STATIC':
      // Pages statiques peuvent être à différents niveaux
      if (pathDepth === 1) {
        importPath = "import StaticLayout from '../layouts/StaticLayout.astro';";
      } else if (pathDepth === 2) {
        importPath = "import StaticLayout from '../../layouts/StaticLayout.astro';";
      } else {
        importPath = "import StaticLayout from '../../../layouts/StaticLayout.astro';";
      }
      break;
  }
  
  return importPath;
}

function updateFileLayout(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcPagesDir, filePath);
    const layoutType = determineLayoutType(filePath);
    const correctImport = getCorrectImportPath(filePath, layoutType);
    const layoutName = LAYOUT_CONFIG[layoutType].layout;
    
    // Remplacer l'import UnifiedLayout par le bon layout
    const importPattern = /import\s+\w+\s+from\s+['"][^'"]*layouts\/\w+Layout\.astro['"];?/;
    
    if (importPattern.test(content)) {
      content = content.replace(importPattern, correctImport);
      
      // Remplacer l'utilisation du layout dans le template
      const layoutUsagePattern = /<(\w+Layout)(\s[^>]*)>/;
      content = content.replace(layoutUsagePattern, `<${layoutName}$2>`);
      
      // Remplacer la fermeture du layout
      const layoutClosePattern = /<\/\w+Layout>/;
      content = content.replace(layoutClosePattern, `</${layoutName}>`);
      
      fs.writeFileSync(filePath, content);
      console.log(`✓ ${relativePath} -> ${layoutName}`);
    } else {
      console.log(`⚠️  ${relativePath} - No layout import found`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.astro') && !file.startsWith('_')) {
      updateFileLayout(filePath);
    }
  }
}

console.log('Organizing layouts...\n');
console.log('📄 StaticLayout - Pages statiques');
console.log('📁 CollectionLayout - Pages index des collections');  
console.log('📝 ArticleWithAffiliateSidebar - Articles avec sidebar\n');

walkDirectory(srcPagesDir);
console.log('\nDone!');
