/**
 * Analyseur de mots-clés pour le dashboard SEO
 * Lit le fichier CSV et analyse les performances
 */

export function parseKeywordsCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      keyword: values[0]?.trim(),
      searchEngine: values[1]?.trim(),
      location: values[2]?.trim()
    };
  }).filter(item => item.keyword);
}

export function analyzeKeywordOpportunities(keywords, articles) {
  return keywords.map(kw => {
    const keyword = kw.keyword.toLowerCase();
    
    // Trouve les articles qui ciblent ce mot-clé
    const targetingArticles = articles.filter(article => {
      const mainKw = (article.mainKeyword || '').toLowerCase();
      const title = (article.title || '').toLowerCase();
      const slug = article.slug.toLowerCase();
      
      return mainKw.includes(keyword) || 
             title.includes(keyword) || 
             slug.includes(keyword) ||
             keyword.includes(mainKw);
    });
    
    // Calcul du score d'opportunité
    let opportunityScore = 50; // Base
    
    // Intent commercial (prix, achat) = plus d'opportunité
    if (keyword.includes('prix') || keyword.includes('achat') || keyword.includes('acheter')) {
      opportunityScore += 25;
    }
    
    // Mots-clés longs = moins de concurrence
    const wordCount = keyword.split(' ').length;
    if (wordCount >= 4) opportunityScore += 20;
    else if (wordCount >= 3) opportunityScore += 15;
    else if (wordCount === 1) opportunityScore -= 15;
    
    // Marques spécifiques = bon potentiel
    const brands = ['ozempic', 'wegovy', 'saxenda', 'mounjaro', 'trulicity'];
    if (brands.some(brand => keyword.includes(brand))) {
      opportunityScore += 15;
    }
    
    // Intent médical (danger, effet) = bon potentiel de trafic
    if (keyword.includes('danger') || keyword.includes('effet') || keyword.includes('secondaire')) {
      opportunityScore += 10;
    }
    
    // Géo-localisation = moins de concurrence
    if (keyword.includes('france') || keyword.includes('français')) {
      opportunityScore += 10;
    }
    
    // Pénalité si déjà bien couvert
    if (targetingArticles.length > 2) {
      opportunityScore -= 10;
    } else if (targetingArticles.length === 0) {
      opportunityScore += 15; // Opportunité non exploitée
    }
    
    // Score de qualité des articles existants
    const avgScore = targetingArticles.length > 0 ? 
      targetingArticles.reduce((sum, a) => sum + (a.seoScore || 0), 0) / targetingArticles.length : 0;
    
    if (avgScore < 50 && targetingArticles.length > 0) {
      opportunityScore += 10; // Articles à améliorer
    }
    
    return {
      keyword: kw.keyword,
      searchEngine: kw.searchEngine,
      location: kw.location,
      targetingArticles: targetingArticles.length,
      avgArticleScore: avgScore ? Math.round(avgScore) : 0,
      opportunityScore: Math.max(0, Math.min(100, opportunityScore)),
      articles: targetingArticles.map(a => ({
        title: a.title,
        slug: a.slug,
        collection: a.collection,
        score: a.seoScore || 0,
        density: a.mainKeywordDensity || 0
      })),
      recommendations: generateKeywordRecommendations(kw.keyword, targetingArticles, opportunityScore)
    };
  }).sort((a, b) => b.opportunityScore - a.opportunityScore);
}

function generateKeywordRecommendations(keyword, articles, score) {
  const recommendations = [];
  
  if (articles.length === 0) {
    recommendations.push({
      type: 'CREATE',
      priority: 'HIGH',
      action: `Créer un article ciblant "${keyword}"`
    });
  } else if (articles.length === 1 && articles[0].seoScore < 60) {
    recommendations.push({
      type: 'OPTIMIZE',
      priority: 'MEDIUM',
      action: `Optimiser l'article existant pour "${keyword}"`
    });
  } else if (articles.length > 3) {
    recommendations.push({
      type: 'CONSOLIDATE',
      priority: 'LOW',
      action: `Consolider les ${articles.length} articles ciblant "${keyword}"`
    });
  }
  
  // Recommandations spécifiques par type de mot-clé
  if (keyword.includes('prix') && score > 70) {
    recommendations.push({
      type: 'COMMERCIAL',
      priority: 'HIGH',
      action: 'Ajouter des comparatifs de prix et des CTA'
    });
  }
  
  if (keyword.includes('danger') || keyword.includes('effet')) {
    recommendations.push({
      type: 'MEDICAL',
      priority: 'HIGH',
      action: 'Renforcer les disclaimers médicaux et sources scientifiques'
    });
  }
  
  return recommendations;
}

export function generateKeywordMatrix(keywordAnalysis) {
  // Matrice des intentions de recherche
  const intents = {
    commercial: keywordAnalysis.filter(k => 
      k.keyword.includes('prix') || 
      k.keyword.includes('achat') || 
      k.keyword.includes('acheter')
    ),
    informational: keywordAnalysis.filter(k => 
      k.keyword.includes('qu est ce que') || 
      k.keyword.includes('comment') || 
      k.keyword.includes('pourquoi')
    ),
    medical: keywordAnalysis.filter(k => 
      k.keyword.includes('effet') || 
      k.keyword.includes('danger') || 
      k.keyword.includes('secondaire')
    ),
    local: keywordAnalysis.filter(k => 
      k.keyword.includes('france') || 
      k.keyword.includes('français') ||
      k.keyword.includes('clinique') ||
      k.keyword.includes('medecin')
    )
  };
  
  return {
    byIntent: intents,
    totalKeywords: keywordAnalysis.length,
    highOpportunity: keywordAnalysis.filter(k => k.opportunityScore >= 80).length,
    mediumOpportunity: keywordAnalysis.filter(k => k.opportunityScore >= 60 && k.opportunityScore < 80).length,
    lowOpportunity: keywordAnalysis.filter(k => k.opportunityScore < 60).length,
    uncoveredKeywords: keywordAnalysis.filter(k => k.targetingArticles === 0).length
  };
}
