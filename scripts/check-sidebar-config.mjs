import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPagesDir = path.join(__dirname, '..', 'src', 'pages');

function checkSidebarUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcPagesDir, filePath);
    
    // Check if it's an article file ([slug].astro)
    const isArticleFile = path.basename(filePath) === '[slug].astro';
    const hasUnifiedLayout = content.includes('UnifiedLayout');
    const hasAffiliateSidebar = content.includes('showAffiliateSidebar={true}');
    const hasAffiliateConfig = content.includes('affiliateConfig');
    
    if (!hasUnifiedLayout) {
      console.log(`⚠️  ${relativePath} - Not using UnifiedLayout`);
      return;
    }
    
    if (isArticleFile) {
      if (!hasAffiliateSidebar) {
        console.log(`❌ ${relativePath} - Article missing showAffiliateSidebar={true}`);
      } else if (!hasAffiliateConfig) {
        console.log(`⚠️  ${relativePath} - Article missing affiliateConfig`);
      } else {
        console.log(`✅ ${relativePath} - Article correctly configured`);
      }
    } else {
      if (hasAffiliateSidebar) {
        console.log(`⚠️  ${relativePath} - Static page has affiliate sidebar (may be intended)`);
      } else {
        console.log(`✅ ${relativePath} - Static page correctly configured`);
      }
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
      checkSidebarUsage(filePath);
    }
  }
}

console.log('Checking sidebar configuration across all pages...\n');
walkDirectory(srcPagesDir);
console.log('\nDone! ✅ = Correct, ❌ = Missing sidebar, ⚠️ = Warning');
