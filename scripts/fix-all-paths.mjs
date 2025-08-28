import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPagesDir = path.join(__dirname, '..', 'src', 'pages');

function fixAllImportPaths(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcPagesDir, filePath);
    const pathSegments = relativePath.split(path.sep);
    const depth = pathSegments.length - 1; // -1 car on ne compte pas le fichier lui-même
    
    let modified = false;
    
    // Pattern pour détecter les imports de layouts
    const layoutImportPattern = /import\s+(\w+)\s+from\s+['"]([^'"]*layouts\/\w+Layout\.astro)['"];?/g;
    
    content = content.replace(layoutImportPattern, (match, layoutVar, importPath) => {
      // Extraire le nom du layout
      const layoutName = importPath.match(/(\w+Layout)\.astro$/)[1];
      
      // Calculer le bon chemin selon la profondeur
      let correctPath;
      if (depth === 0) {
        // Fichiers à la racine (src/pages/)
        correctPath = `../layouts/${layoutName}.astro`;
      } else if (depth === 1) {
        // Fichiers dans un dossier (src/pages/folder/)
        correctPath = `../../layouts/${layoutName}.astro`;
      } else if (depth === 2) {
        // Fichiers dans un sous-dossier (src/pages/collections/collection-name/)
        correctPath = `../../../layouts/${layoutName}.astro`;
      } else {
        // Plus profond
        const levels = '../'.repeat(depth + 1);
        correctPath = `${levels}layouts/${layoutName}.astro`;
      }
      
      const newImport = `import ${layoutVar} from '${correctPath}';`;
      
      if (match !== newImport) {
        modified = true;
        return newImport;
      }
      
      return match;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed ${relativePath} (depth: ${depth})`);
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
      fixAllImportPaths(filePath);
    }
  }
}

console.log('🔧 Fixing ALL layout import paths...');
walkDirectory(srcPagesDir);
console.log('✅ All paths fixed!');
