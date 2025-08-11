import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

const GENERIC_PATTERNS = [
  /à développer/i,
  /texte de conclusion/i,
  /résumé :/i,
  /prix médicament glp-1/i,
  /image/i,
  /\[affiliate-box\]/i,
  /lorem ipsum/i,
  /ce guide/i,
  /cet article/i,
  /pour en savoir plus/i,
  /voir aussi/i,
  /important :/i,
  /questions fréquentes/i,
  /articles connexes/i
];

function scoreSEO(content, frontmatter) {
  let score = 0;
  let details = [];
  // Mot-clé principal
  const keyword = frontmatter.keyword || frontmatter.mainKeyword || '';
  if (keyword && content.includes(keyword)) {
    score += 25;
    details.push('Mot-clé principal présent');
  } else {
    details.push('Mot-clé principal absent');
  }
  // Densité du mot-clé
  const wordCount = content.replace(/^---[\s\S]*?---/, '').split(/\s+/).length;
  const keywordCount = keyword ? (content.match(new RegExp(keyword, 'gi')) || []).length : 0;
  const density = keyword && wordCount ? (keywordCount / wordCount) * 100 : 0;
  if (density >= 1 && density <= 3) {
    score += 10;
    details.push('Densité du mot-clé optimale');
  } else if (density > 0) {
    score += 5;
    details.push('Densité du mot-clé à ajuster');
  } else {
    details.push('Densité du mot-clé absente');
  }
  // Nombre de mots
  if (wordCount >= 1000) {
    score += 15;
    details.push('Article long (1000+ mots)');
  } else if (wordCount >= 500) {
    score += 10;
    details.push('Article moyen (500+ mots)');
  } else {
    details.push('Article court (<500 mots)');
  }
  // H1 unique
  const h1Count = (content.match(/^# /gm) || []).length;
  if (h1Count === 1) {
    score += 10;
    details.push('H1 unique');
  } else {
    details.push('Problème H1');
  }
  // H2/H3
  const h2Count = (content.match(/^## /gm) || []).length;
  const h3Count = (content.match(/^### /gm) || []).length;
  if (h2Count + h3Count >= 3) {
    score += 10;
    details.push('Structure H2/H3 suffisante');
  } else {
    details.push('Structure H2/H3 insuffisante');
  }
  // Métadonnées
  if (frontmatter.title && frontmatter.description && frontmatter.tags) {
    score += 15;
    details.push('Métadonnées complètes');
  } else {
    details.push('Métadonnées incomplètes');
  }
  // Liens internes/externes
  const internalLinks = (content.match(/\[([^\]]+)\]\(\/[^)]+\)/g) || []).length;
  const externalLinks = (content.match(/\[([^\]]+)\]\((http|https):\/\//g) || []).length;
  if (internalLinks + externalLinks >= 3) {
    score += 10;
    details.push('Liens internes/externes présents');
  } else {
    details.push('Liens internes/externes insuffisants');
  }
  // Balises importantes
  const altImages = (content.match(/!\[[^\]]*\]\([^)]*\)/g) || []).filter(img => /alt=/i.test(img)).length;
  if (altImages >= 1) {
    score += 5;
    details.push('Balises alt présentes');
  } else {
    details.push('Balises alt absentes');
  }
  if (score > 100) score = 100;
  return { score, details };
}

function scorePertinence(content) {
  let score = 100;
  let details = [];
  // Clarté et qualité des phrases
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length;
  if (avgSentenceLength > 30) {
    score -= 10;
    details.push('Phrases trop longues');
  }
  // Structure logique et agréable
  const h2Count = (content.match(/^## /gm) || []).length;
  if (h2Count < 2) {
    score -= 10;
    details.push('Structure peu développée');
  }
  // Données/faits importants
  if (!/\d{4}/.test(content) && !/\b(euro|€|mg|kg|%|patients|étude|source)\b/i.test(content)) {
    score -= 10;
    details.push('Peu de données/faits importants');
  }
  // Pertinence pour le lecteur
  if (!/\b(pourquoi|comment|quand|qui|où|combien|avantage|risque|bénéfice|solution|conseil|recommandation)\b/i.test(content)) {
    score -= 10;
    details.push('Pertinence faible pour le lecteur');
  }
  // Absence de contenu inutile/répétitif
  // On ne pénalise plus les patterns génériques ici, pour éviter le recoupement avec le SEO
  // Sections trop courtes
  const sections = content.split(/## /).slice(1);
  sections.forEach(section => {
    if (section.trim().length < 100) {
      score -= 5;
      details.push('Section trop courte ou non rédigée');
    }
  });
  // FAQ, résumé, "À retenir"
  if (/FAQ|Questions fréquentes|À retenir|Résumé/i.test(content)) {
    score += 5;
    details.push('Section FAQ/résumé présente');
  }
  // Vérification de la densité d'information
  const wordCount = content.replace(/^---[\s\S]*?---/, '').split(/\s+/).length;
  if (wordCount < 300) {
    score -= 10;
    details.push('Article trop court (<300 mots)');
  }
  if (score > 100) score = 100;
  if (score < 0) score = 0;
  return { score, details };
}

function parseFrontmatter(content) {
  const match = content.match(/^---([\s\S]*?)---/);
  if (!match) return {};
  const lines = match[1].split('\n');
  const frontmatter = {};
  lines.forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) frontmatter[key.trim()] = rest.join(':').trim();
  });
  return frontmatter;
}

function auditArticle(filePath, content) {
  const frontmatter = parseFrontmatter(content);
  const seo = scoreSEO(content, frontmatter);
  const pertinence = scorePertinence(content);
  return {
    filePath,
    seoScore: seo.score,
    seoDetails: seo.details,
    pertinenceScore: pertinence.score,
    pertinenceDetails: pertinence.details
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

function showDetailForArticle(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = parseFrontmatter(content);
  const seo = scoreSEO(content, frontmatter);
  const pertinence = scorePertinence(content);
  console.log('--- Détail scoring pour', filePath, '---');
  console.log('Score SEO:', seo.score);
  console.log('Détails SEO:', seo.details);
  console.log('Score Pertinence:', pertinence.score);
  console.log('Détails Pertinence:', pertinence.details);
}

function main() {
  console.log('🔍 Audit SEO & pertinence du contenu en cours...');
  const articles = auditAllArticles();
  let totalSEO = 0;
  let totalPertinence = 0;
  let lowPertinenceCount = 0;
  let lowSEOCount = 0;
  articles.forEach(a => {
    totalSEO += a.seoScore;
    totalPertinence += a.pertinenceScore;
    if (a.pertinenceScore < 60) lowPertinenceCount++;
    if (a.seoScore < 60) lowSEOCount++;
  });
  const avgSEO = Math.round(totalSEO / articles.length);
  const avgPertinence = Math.round(totalPertinence / articles.length);
  console.log(`Articles analysés : ${articles.length}`);
  console.log(`Score moyen SEO : ${avgSEO}/100`);
  console.log(`Score moyen de pertinence : ${avgPertinence}/100`);
  console.log(`Articles à faible pertinence (<60) : ${lowPertinenceCount}`);
  console.log(`Articles à faible SEO (<60) : ${lowSEOCount}`);
  // Top 5 à améliorer
  const worstPertinence = articles.sort((a, b) => a.pertinenceScore - b.pertinenceScore).slice(0, 5);
  const worstSEO = articles.sort((a, b) => a.seoScore - b.seoScore).slice(0, 5);
  console.log('Articles à améliorer en priorité (pertinence) :');
  worstPertinence.forEach(a => {
    console.log(`- ${a.filePath} : ${a.pertinenceScore}/100`);
    if (a.pertinenceDetails.length) console.log(`  Issues : ${a.pertinenceDetails.join('; ')}`);
  });
  console.log('Articles à améliorer en priorité (SEO) :');
  worstSEO.forEach(a => {
    console.log(`- ${a.filePath} : ${a.seoScore}/100`);
    if (a.seoDetails.length) console.log(`  Issues : ${a.seoDetails.join('; ')}`);
  });
  // Sauvegarde du rapport
  fs.writeFileSync('./pertinence-content-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    articles,
    avgSEO,
    avgPertinence,
    lowPertinenceCount,
    lowSEOCount
  }, null, 2));
  console.log('✅ Rapport sauvegardé dans pertinence-content-report.json');
  showDetailForArticle('src/content/glp1-perte-de-poids/medicament-pour-maigrir-tres-puissant-en-pharmacie.md');
}

main();
