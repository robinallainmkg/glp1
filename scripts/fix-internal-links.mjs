#!/usr/bin/env node

/**
 * Script pour corriger les liens internes cassés dans les articles
 * Remplace /collections/category/article/ par /category/article/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPath = path.join(__dirname, '..', 'src', 'content');

// Pattern à rechercher et corriger
const patterns = [
  {
    // /collections/category/article/ → /category/article/
    find: /\]\(\/collections\/([\w-]+)\/([\w-]+)\/\)/g,
    replace: '](/$1/$2/)',
    description: 'Supprimer /collections/ dans liens'
  },
  {
    // /collections/category/ seul → /category/
    find: /\]\(\/collections\/([\w-]+)\/\)/g,
    replace: '](/$1/)',
    description: 'Supprimer /collections/ pour catégories'
  }
];

async function fixLinksInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let changes = [];

  patterns.forEach(({ find, replace, description }) => {
    const matches = [...content.matchAll(find)];
    if (matches.length > 0) {
      content = content.replace(find, replace);
      modified = true;
      changes.push(`${matches.length} ${description}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { file: filePath, changes };
  }
  
  return null;
}

async function main() {
  console.log('🔍 Recherche de liens cassés dans les articles...\n');

  // Trouver tous les fichiers markdown
  const files = await glob('**/*.md', {
    cwd: srcPath,
    absolute: true
  });

  console.log(`📝 ${files.length} fichiers à analyser\n`);

  const results = [];
  
  for (const file of files) {
    const result = await fixLinksInFile(file);
    if (result) {
      results.push(result);
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      console.log(`✅ ${relativePath}`);
      result.changes.forEach(change => console.log(`   - ${change}`));
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`  - Fichiers analysés: ${files.length}`);
  console.log(`  - Fichiers modifiés: ${results.length}`);
  
  if (results.length > 0) {
    const totalChanges = results.reduce((sum, r) => {
      const count = r.changes.reduce((s, c) => {
        const match = c.match(/^(\d+)/);
        return s + (match ? parseInt(match[1]) : 0);
      }, 0);
      return sum + count;
    }, 0);
    console.log(`  - Total de liens corrigés: ${totalChanges}\n`);
    
    console.log('✨ Liens corrigés avec succès!');
    console.log('\n💡 Prochaine étape: git add + commit + push');
  } else {
    console.log('\n✅ Aucun lien cassé trouvé!');
  }
}

main().catch(console.error);
