import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPagesDir = path.join(__dirname, '..', 'src', 'pages');

function fixImportPath(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcPagesDir, filePath);
    const pathDepth = relativePath.split(path.sep).length - 1;
    
    let modified = false;
    
    // Détecter le type de layout utilisé
    const layoutMatches = content.match(/import\s+(\w+)\s+from\s+['"][^'"]*layouts\/(\w+Layout)\.astro['"];?/);
    
    if (layoutMatches) {
      const layoutName = layoutMatches[2]; // StaticLayout, CollectionLayout, etc.
      let correctPath;
      
      // Déterminer le bon chemin selon la profondeur
      if (pathDepth === 1) {
        // Fichiers à la racine de src/pages/
        correctPath = `../layouts/${layoutName}.astro`;
      } else if (pathDepth === 2) {
        // Fichiers dans src/pages/folder/
        correctPath = `../../layouts/${layoutName}.astro`;
      } else if (pathDepth === 3) {
        // Fichiers dans src/pages/collections/collection-name/
        correctPath = `../../../layouts/${layoutName}.astro`;
      }
      
      if (correctPath) {
        const newImport = `import ${layoutMatches[1]} from '${correctPath}';`;
        const oldImport = layoutMatches[0];
        
        if (oldImport !== newImport) {
          content = content.replace(oldImport, newImport);
          modified = true;
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed ${relativePath}`);
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
      fixImportPath(filePath);
    }
  }
}

console.log('Fixing import paths...');
walkDirectory(srcPagesDir);
console.log('Done!');
