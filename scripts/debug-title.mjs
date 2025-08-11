import fs from 'fs';

// Test sur un fichier spécifique
const filePath = 'src/content/alternatives-glp1/alternatives-naturelles-ozempic.md';
const content = fs.readFileSync(filePath, 'utf-8');

console.log('=== CONTENU BRUT ===');
console.log(content.substring(0, 200));

function extractFrontmatter(content) {
  console.log('=== TEST REGEX ===');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  console.log('frontmatterMatch:', frontmatterMatch ? 'TROUVÉ' : 'PAS TROUVÉ');
  
  // Test avec différents patterns
  const test1 = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  console.log('test1 (avec \\r):', test1 ? 'TROUVÉ' : 'PAS TROUVÉ');
  
  const test2 = content.match(/^---([\s\S]*?)---/);
  console.log('test2 (simple):', test2 ? 'TROUVÉ' : 'PAS TROUVÉ');
  
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  return {
    frontmatter: frontmatterMatch[1],
    body: frontmatterMatch[2]
  };
}

function extractTitle(frontmatter) {
  console.log('=== FRONTMATTER ===');
  console.log(frontmatter);
  
  // Chercher title avec ou sans guillemets, en gérant tous les formats
  let titleMatch = frontmatter.match(/^title:\s*["']([^"']+)["']/m); // "titre" ou 'titre'
  console.log('Match avec guillemets:', titleMatch);
  
  if (!titleMatch) {
    titleMatch = frontmatter.match(/^title:\s*([^"\n]+)/m); // titre sans guillemets
    console.log('Match sans guillemets:', titleMatch);
  }
  
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  return '';
}

const { frontmatter, body } = extractFrontmatter(content);
const title = extractTitle(frontmatter);

console.log('=== RÉSULTAT ===');
console.log('Titre trouvé:', title);
