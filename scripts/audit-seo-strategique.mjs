import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';
const KEYWORDS = [
  'GLP-1 France', 'Wegovy remboursement', 'Ozempic prix', 'Perte de poids médicament',
  'Diabète type 2 traitement', 'Mutuelle santé', 'Remboursement médicament',
  'Obésité prise en charge', 'Alternatives naturelles GLP-1', 'Effets secondaires GLP-1'
];

function scoreKeywords(content) {
  const contentLower = content.toLowerCase();
  let score = 0;
  let found = [];
  KEYWORDS.forEach(kw => {
    if (contentLower.includes(kw.toLowerCase())) {
      score += 10;
      found.push(kw);
    }
  });
  return { score, found };
}

function isGenericContent(content) {
  // Détection simple de contenu générique/faible
  const genericPatterns = [
    /ce médicament est utilisé pour/, /il est important de consulter/, /ce traitement peut aider/,
    /demandez conseil à votre médecin/, /en conclusion/, /cet article présente/, /généralités sur/
  ];
  let genericScore = 0;
  genericPatterns.forEach(pattern => {
    if (pattern.test(content.toLowerCase())) genericScore++;
  });
  return genericScore >= 2;
}

function auditArticle(filePath, content) {
  const wordCount = content.replace(/^---[\s\S]*?---/, '').split(/\s+/).length;
  const { score: keywordScore, found: keywordsFound } = scoreKeywords(content);
  const generic = isGenericContent(content);
  let pertinence = 50 + keywordScore - (generic ? 30 : 0);
  if (wordCount < 500) pertinence -= 10;
  if (pertinence < 0) pertinence = 0;
  if (pertinence > 100) pertinence = 100;
  return {
    filePath,
    wordCount,
    keywordScore,
    keywordsFound,
    generic,
    pertinence
  };
}

function auditAllArticles() {
  const results = [];
  function scanDir(dir) {
    fs.readdirSync(dir).forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) scanDir(fullPath);
      else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        results.push(auditArticle(fullPath, content));
      }
    });
  }
  scanDir(CONTENT_DIR);
  return results;
}

function main() {
  console.log('🔍 Audit SEO stratégique en cours...');
  const articles = auditAllArticles();
  let totalScore = 0;
  let genericCount = 0;
  let keywordCoverage = {};
  KEYWORDS.forEach(kw => keywordCoverage[kw] = 0);

  articles.forEach(a => {
    totalScore += a.pertinence;
    if (a.generic) genericCount++;
    a.keywordsFound.forEach(kw => keywordCoverage[kw]++);
  });

  const avgScore = Math.round(totalScore / articles.length);
  console.log(`Articles analysés : ${articles.length}`);
  console.log(`Score moyen de pertinence : ${avgScore}/100`);
  console.log(`Articles à contenu générique/faible : ${genericCount}`);
  console.log('Couverture des mots-clés :');
  Object.entries(keywordCoverage).forEach(([kw, count]) => {
    console.log(`- ${kw} : ${count} articles`);
  });

  // Sauvegarde du rapport
  fs.writeFileSync('./seo-strategique-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    articles,
    avgScore,
    genericCount,
    keywordCoverage
  }, null, 2));
  console.log('✅ Rapport sauvegardé dans seo-strategique-report.json');
}

main();
