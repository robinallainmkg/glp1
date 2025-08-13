import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';
const MIN_WORD_COUNT = 500;

// Fonction pour compter les mots dans le contenu (sans frontmatter)
function countWords(content) {
    // Retirer le frontmatter
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---/, '');
    // Retirer le markdown et compter les mots
    const textContent = contentWithoutFrontmatter
        .replace(/!\[.*?\]\(.*?\)/g, '') // Images
        .replace(/\[.*?\]\(.*?\)/g, '$1') // Liens
        .replace(/#{1,6}\s/g, '') // Headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1') // Italic
        .replace(/`(.*?)`/g, '$1') // Code
        .replace(/\n+/g, ' ') // Newlines
        .trim();
    
    return textContent.split(/\s+/).filter(word => word.length > 0).length;
}

// Fonction récursive pour analyser tous les fichiers
function analyzeDirectory(dir) {
    const results = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            results.push(...analyzeDirectory(fullPath));
        } else if (item.endsWith('.md')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const wordCount = countWords(content);
            const relativePath = path.relative(CONTENT_DIR, fullPath);
            
            results.push({
                path: relativePath,
                fullPath,
                wordCount,
                needsEnrichment: wordCount < MIN_WORD_COUNT
            });
        }
    }
    
    return results;
}

// Analyse principale
console.log('🔍 Analyse de la longueur du contenu...\n');

const articles = analyzeDirectory(CONTENT_DIR);
const shortArticles = articles.filter(article => article.needsEnrichment);

// Statistiques générales
console.log('📊 STATISTIQUES GÉNÉRALES:');
console.log(`Total d'articles: ${articles.length}`);
console.log(`Articles courts (<${MIN_WORD_COUNT} mots): ${shortArticles.length}`);
console.log(`Pourcentage d'articles courts: ${(shortArticles.length / articles.length * 100).toFixed(1)}%`);

// Moyenne de mots
const totalWords = articles.reduce((sum, article) => sum + article.wordCount, 0);
const averageWords = Math.round(totalWords / articles.length);
console.log(`Moyenne de mots par article: ${averageWords}`);

// Top 10 des articles les plus courts
console.log('\n🔴 TOP 10 ARTICLES LES PLUS COURTS:');
const shortestArticles = [...articles]
    .sort((a, b) => a.wordCount - b.wordCount)
    .slice(0, 10);

shortestArticles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.path} - ${article.wordCount} mots`);
});

// Liste complète des articles courts
console.log('\n📝 ARTICLES À ENRICHIR (<500 mots):');
shortArticles
    .sort((a, b) => a.wordCount - b.wordCount)
    .forEach(article => {
        console.log(`- ${article.path} (${article.wordCount} mots)`);
    });

// Distribution par nombre de mots
const ranges = [
    { label: '0-100 mots', min: 0, max: 100 },
    { label: '101-200 mots', min: 101, max: 200 },
    { label: '201-300 mots', min: 201, max: 300 },
    { label: '301-400 mots', min: 301, max: 400 },
    { label: '401-500 mots', min: 401, max: 500 },
    { label: '501-1000 mots', min: 501, max: 1000 },
    { label: '1000+ mots', min: 1001, max: Infinity }
];

console.log('\n📊 DISTRIBUTION PAR LONGUEUR:');
ranges.forEach(range => {
    const count = articles.filter(article => 
        article.wordCount >= range.min && article.wordCount <= range.max
    ).length;
    const percentage = (count / articles.length * 100).toFixed(1);
    console.log(`${range.label}: ${count} articles (${percentage}%)`);
});

// Sauvegarde du rapport
const report = {
    timestamp: new Date().toISOString(),
    totalArticles: articles.length,
    shortArticles: shortArticles.length,
    averageWords: averageWords,
    minWordCount: MIN_WORD_COUNT,
    articles: articles.map(article => ({
        path: article.path,
        wordCount: article.wordCount,
        needsEnrichment: article.needsEnrichment
    })),
    distribution: ranges.map(range => ({
        label: range.label,
        count: articles.filter(article => 
            article.wordCount >= range.min && article.wordCount <= range.max
        ).length
    }))
};

fs.writeFileSync('./content-length-analysis.json', JSON.stringify(report, null, 2));
console.log('\n✅ Rapport sauvegardé dans content-length-analysis.json');
