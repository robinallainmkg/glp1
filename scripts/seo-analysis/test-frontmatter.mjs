// 🧪 Test extraction frontmatter
import fs from 'fs';

console.log('🧪 Test extraction frontmatter');

function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n(.*?)\r?\n---/s);
  if (!frontmatterMatch) return {};
  
  try {
    const frontmatter = {};
    const lines = frontmatterMatch[1].split(/\r?\n/);
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        let value = match[2].trim();
        // Enlever les guillemets
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        frontmatter[match[1]] = value;
      }
    }
    
    return frontmatter;
  } catch (error) {
    console.warn('Erreur parsing frontmatter:', error);
    return {};
  }
}

const testFile = 'src/content/alternatives-glp1/peut-on-guerir-du-diabete.md';
const content = fs.readFileSync(testFile, 'utf-8');

console.log('📄 Test du fichier:', testFile);
console.log('📏 Taille:', content.length, 'caractères');

const frontmatter = extractFrontmatter(content);
console.log('📋 Frontmatter extraite:', frontmatter);

console.log('\n✅ Test terminé');
