import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPagesDir = path.join(__dirname, '..', 'src', 'pages');

// Map of incorrect imports to correct imports
const importReplacements = {
  "from '../layouts/UnifiedLayout.astro'": "from '../../layouts/UnifiedLayout.astro'",
  'from "../layouts/UnifiedLayout.astro"': 'from "../../layouts/UnifiedLayout.astro"',
  "from '../../layouts/UnifiedLayout.astro'": "from '../../../layouts/UnifiedLayout.astro'"
};

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Determine the correct import path based on file location
    const relativePath = path.relative(srcPagesDir, filePath);
    const pathDepth = relativePath.split(path.sep).length - 1;
    
    let correctImport;
    if (pathDepth === 1) {
      // Files in root of src/pages/
      correctImport = "from '../layouts/UnifiedLayout.astro'";
    } else if (pathDepth === 2) {
      // Files in src/pages/collections/collection-name/
      correctImport = "from '../../layouts/UnifiedLayout.astro'";
    } else if (pathDepth === 3) {
      // Files in src/pages/collections/collection-name/[slug].astro
      correctImport = "from '../../../layouts/UnifiedLayout.astro'";
    } else {
      console.log(`Skipping ${filePath} - unexpected depth: ${pathDepth}`);
      return;
    }
    
    // Replace any existing UnifiedLayout import with the correct one
    const importPattern = /from\s+['"]\.\.\/.*layouts\/UnifiedLayout\.astro['"]/g;
    if (importPattern.test(content)) {
      content = content.replace(importPattern, correctImport);
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed imports in ${relativePath}`);
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
    } else if (file.endsWith('.astro')) {
      fixImportsInFile(filePath);
    }
  }
}

console.log('Fixing UnifiedLayout import paths...');
walkDirectory(srcPagesDir);
console.log('Done!');
