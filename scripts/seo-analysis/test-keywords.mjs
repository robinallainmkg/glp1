// 🔍 Test détection mot-clé
import fs from 'fs';

const testFile = 'src/content/glp1-perte-de-poids/avant-apres-glp1.md';
const content = fs.readFileSync(testFile, 'utf-8');

console.log('🔍 Test détection mot-clé');
console.log('📄 Fichier:', testFile);

// Extraire frontmatter et body
const frontmatterMatch = content.match(/^---\r?\n(.*?)\r?\n---/s);
const bodyMatch = content.match(/^---\r?\n.*?\r?\n---\r?\n(.*)$/s);

const frontmatter = {};
if (frontmatterMatch) {
  const lines = frontmatterMatch[1].split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[match[1]] = value;
    }
  }
}

const body = bodyMatch ? bodyMatch[1] : content;

console.log('📋 Titre:', frontmatter.title);
console.log('📏 Body length:', body.length);

// Test détection
const fullText = ((frontmatter.title || '') + ' ' + (frontmatter.description || '') + ' ' + body).toLowerCase();

const keywords = ['glp1', 'wegovy', 'saxenda', 'ozempic', 'perte de poids'];

console.log('\n🔍 Détection mots-clés:');
keywords.forEach(keyword => {
  const found = fullText.includes(keyword.toLowerCase());
  const count = (fullText.match(new RegExp(keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  console.log(`   ${keyword}: ${found ? '✅' : '❌'} (${count} mentions)`);
});

// Test avec "glp-1" (tiret)
const glp1Variants = ['glp1', 'glp-1', 'glp 1'];
console.log('\n🔍 Variantes GLP1:');
glp1Variants.forEach(variant => {
  const found = fullText.includes(variant.toLowerCase());
  const count = (fullText.match(new RegExp(variant.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  console.log(`   ${variant}: ${found ? '✅' : '❌'} (${count} mentions)`);
});

console.log('\n📝 Aperçu du texte (100 premiers caractères):');
console.log(fullText.substring(0, 100) + '...');
