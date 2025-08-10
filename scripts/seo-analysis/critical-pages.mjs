// 📊 Extraction des pages critiques de l'analyse SEO
import fs from 'fs';

const reportPath = 'seo-analysis/seo-analysis-report.json';

if (!fs.existsSync(reportPath)) {
  console.log('❌ Rapport SEO non trouvé. Lancez d\'abord l\'analyse.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

console.log('🚨 === PAGES CRITIQUES (Score ≤ 30) ===\n');

const criticalPages = report.pages
  .filter(page => page.overallScore <= 30)
  .sort((a, b) => a.overallScore - b.overallScore);

console.log(`📊 Total pages critiques : ${criticalPages.length}/50\n`);

criticalPages.forEach((page, index) => {
  console.log(`${index + 1}. 📄 ${page.title}`);
  console.log(`   Score : ${page.overallScore}/100`);
  console.log(`   URL : ${page.url}`);
  console.log(`   Problèmes : ${page.content.issues.join(', ')}`);
  console.log(`   Mots : ${page.content.wordCount}`);
  console.log('');
});

console.log('🎯 === ACTIONS PRIORITAIRES ===\n');

const issueCount = {};
criticalPages.forEach(page => {
  page.content.issues.forEach(issue => {
    issueCount[issue] = (issueCount[issue] || 0) + 1;
  });
});

console.log('Problèmes les plus fréquents :');
Object.entries(issueCount)
  .sort(([,a], [,b]) => b - a)
  .forEach(([issue, count]) => {
    console.log(`  • ${issue} : ${count} pages`);
  });

console.log('\n⚡ Quick wins : Pages avec "Titre trop court" ou "Meta description" - Faciles à corriger !');
