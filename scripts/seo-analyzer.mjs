import fs from 'node:fs';
import path from 'node:path';

/**
 * Analyseur SEO Automatique pour GLP1 France
 * Analyse les performances SEO des articles et fournit des recommandations
 */
export class SEOAnalyzer {
  constructor() {
    this.seoRules = {
      wordCount: {
        min: 300,
        ideal: 500,
        max: 3000,
        weight: 30
      },
      titleLength: {
        min: 30,
        max: 60,
        weight: 20
      },
      descriptionLength: {
        min: 140,
        max: 160,
        weight: 20
      },
      keywords: {
        min: 3,
        max: 10,
        weight: 15
      },
      headings: {
        weight: 10
      },
      freshness: {
        weight: 5
      }
    };
  }

  /**
   * Analyse un article individual
   */
  analyzeArticle(article) {
    const scores = {};
    let totalScore = 0;

    // Analyse du nombre de mots
    scores.wordCount = this.analyzeWordCount(article.wordCount);
    
    // Analyse du titre
    scores.title = this.analyzeTitle(article.title);
    
    // Analyse de la description
    scores.description = this.analyzeDescription(article.description);
    
    // Analyse des mots-clés
    scores.keywords = this.analyzeKeywords(article.keywords);
    
    // Analyse des en-têtes (si contenu disponible)
    scores.headings = this.analyzeHeadings(article.content);
    
    // Analyse de la fraîcheur
    scores.freshness = this.analyzeFreshness(article.lastModified);

    // Calcul du score total
    totalScore = Object.values(scores).reduce((sum, score) => sum + score.score, 0);

    return {
      totalScore: Math.min(totalScore, 100),
      scores,
      recommendations: this.generateRecommendations(scores, article),
      issues: this.identifyIssues(scores, article),
      strengths: this.identifyStrengths(scores, article)
    };
  }

  /**
   * Analyse de masse de tous les articles
   */
  async analyzeBulk(articlesPath = 'data/articles-database.json') {
    try {
      const rawData = fs.readFileSync(articlesPath, 'utf-8');
      const database = JSON.parse(rawData);
      
      const results = {
        summary: {
          totalArticles: database.allArticles.length,
          averageScore: 0,
          distribution: {
            excellent: 0, // 80+
            good: 0,      // 60-79
            average: 0,   // 40-59
            poor: 0       // <40
          }
        },
        articles: [],
        globalRecommendations: [],
        priorityActions: []
      };

      // Analyser chaque article
      for (const article of database.allArticles) {
        const analysis = this.analyzeArticle(article);
        results.articles.push({
          ...article,
          seoAnalysis: analysis
        });

        // Mettre à jour les statistiques
        const score = analysis.totalScore;
        if (score >= 80) results.summary.distribution.excellent++;
        else if (score >= 60) results.summary.distribution.good++;
        else if (score >= 40) results.summary.distribution.average++;
        else results.summary.distribution.poor++;
      }

      // Calculer le score moyen
      results.summary.averageScore = Math.round(
        results.articles.reduce((sum, a) => sum + a.seoAnalysis.totalScore, 0) / 
        results.articles.length
      );

      // Générer les recommandations globales
      results.globalRecommendations = this.generateGlobalRecommendations(results.articles);
      results.priorityActions = this.generatePriorityActions(results.articles);

      return results;
    } catch (error) {
      console.error('Erreur lors de l\'analyse SEO en masse:', error);
      throw error;
    }
  }

  /**
   * Analyse du nombre de mots
   */
  analyzeWordCount(wordCount) {
    const rule = this.seoRules.wordCount;
    let score = 0;
    let status = 'poor';
    let message = '';

    if (!wordCount || wordCount === 0) {
      message = 'Nombre de mots non défini';
    } else if (wordCount < rule.min) {
      score = (wordCount / rule.min) * 10;
      status = 'poor';
      message = `Trop court (${wordCount} mots). Minimum recommandé: ${rule.min} mots.`;
    } else if (wordCount < rule.ideal) {
      score = 10 + ((wordCount - rule.min) / (rule.ideal - rule.min)) * 20;
      status = 'average';
      message = `Correct (${wordCount} mots). Idéal: ${rule.ideal}+ mots.`;
    } else if (wordCount <= rule.max) {
      score = rule.weight;
      status = 'excellent';
      message = `Excellent (${wordCount} mots). Longueur idéale pour le SEO.`;
    } else {
      score = 25;
      status = 'good';
      message = `Très long (${wordCount} mots). Considérer diviser en plusieurs articles.`;
    }

    return {
      score: Math.round(score),
      maxScore: rule.weight,
      status,
      message,
      value: wordCount
    };
  }

  /**
   * Analyse du titre
   */
  analyzeTitle(title) {
    const rule = this.seoRules.titleLength;
    let score = 0;
    let status = 'poor';
    let message = '';

    if (!title) {
      message = 'Titre manquant';
    } else {
      const length = title.length;
      
      if (length < rule.min) {
        score = (length / rule.min) * 10;
        status = 'poor';
        message = `Titre trop court (${length} caractères). Minimum: ${rule.min}.`;
      } else if (length <= rule.max) {
        score = rule.weight;
        status = 'excellent';
        message = `Titre parfait (${length} caractères). Longueur idéale pour le SEO.`;
      } else {
        score = 15;
        status = 'average';
        message = `Titre trop long (${length} caractères). Maximum recommandé: ${rule.max}.`;
      }
    }

    return {
      score: Math.round(score),
      maxScore: rule.weight,
      status,
      message,
      value: title?.length || 0
    };
  }

  /**
   * Analyse de la description
   */
  analyzeDescription(description) {
    const rule = this.seoRules.descriptionLength;
    let score = 0;
    let status = 'poor';
    let message = '';

    if (!description) {
      message = 'Description manquante';
    } else {
      const length = description.length;
      
      if (length < rule.min) {
        score = (length / rule.min) * 10;
        status = 'poor';
        message = `Description trop courte (${length} caractères). Minimum: ${rule.min}.`;
      } else if (length <= rule.max) {
        score = rule.weight;
        status = 'excellent';
        message = `Description parfaite (${length} caractères). Longueur idéale.`;
      } else {
        score = 15;
        status = 'average';
        message = `Description trop longue (${length} caractères). Maximum: ${rule.max}.`;
      }
    }

    return {
      score: Math.round(score),
      maxScore: rule.weight,
      status,
      message,
      value: description?.length || 0
    };
  }

  /**
   * Analyse des mots-clés
   */
  analyzeKeywords(keywords) {
    const rule = this.seoRules.keywords;
    let score = 0;
    let status = 'poor';
    let message = '';

    if (!keywords || keywords.length === 0) {
      message = 'Aucun mot-clé défini';
    } else {
      const count = keywords.length;
      
      if (count < rule.min) {
        score = (count / rule.min) * 10;
        status = 'poor';
        message = `Pas assez de mots-clés (${count}). Minimum recommandé: ${rule.min}.`;
      } else if (count <= rule.max) {
        score = rule.weight;
        status = 'excellent';
        message = `Nombre de mots-clés optimal (${count}).`;
      } else {
        score = 10;
        status = 'average';
        message = `Trop de mots-clés (${count}). Maximum recommandé: ${rule.max}.`;
      }
    }

    return {
      score: Math.round(score),
      maxScore: rule.weight,
      status,
      message,
      value: keywords?.length || 0
    };
  }

  /**
   * Analyse des en-têtes
   */
  analyzeHeadings(content) {
    const rule = this.seoRules.headings;
    let score = 0;
    let status = 'poor';
    let message = '';

    if (!content) {
      message = 'Contenu non disponible pour l\'analyse';
      score = 5; // Score neutre
      status = 'average';
    } else {
      const h2Count = (content.match(/^## /gm) || []).length;
      const h3Count = (content.match(/^### /gm) || []).length;
      const totalHeadings = h2Count + h3Count;

      if (totalHeadings === 0) {
        message = 'Aucun sous-titre détecté. Ajoutez des H2/H3 pour structurer.';
      } else if (totalHeadings < 3) {
        score = 6;
        status = 'average';
        message = `Structure correcte (${totalHeadings} sous-titres). Ajoutez-en plus si l'article est long.`;
      } else {
        score = rule.weight;
        status = 'excellent';
        message = `Excellente structure (${totalHeadings} sous-titres).`;
      }
    }

    return {
      score: Math.round(score),
      maxScore: rule.weight,
      status,
      message,
      value: content ? (content.match(/^#{2,3} /gm) || []).length : 0
    };
  }

  /**
   * Analyse de la fraîcheur du contenu
   */
  analyzeFreshness(lastModified) {
    const rule = this.seoRules.freshness;
    let score = 0;
    let status = 'average';
    let message = '';

    if (!lastModified) {
      message = 'Date de modification non disponible';
      score = 3;
    } else {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(lastModified).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceUpdate <= 30) {
        score = rule.weight;
        status = 'excellent';
        message = `Contenu récent (${daysSinceUpdate} jours).`;
      } else if (daysSinceUpdate <= 90) {
        score = 3;
        status = 'good';
        message = `Contenu assez récent (${daysSinceUpdate} jours).`;
      } else if (daysSinceUpdate <= 365) {
        score = 2;
        status = 'average';
        message = `Contenu à rafraîchir (${daysSinceUpdate} jours).`;
      } else {
        score = 1;
        status = 'poor';
        message = `Contenu ancien (${Math.floor(daysSinceUpdate / 365)} an(s)). Mise à jour recommandée.`;
      }
    }

    return {
      score: Math.round(score),
      maxScore: rule.weight,
      status,
      message,
      value: lastModified
    };
  }

  /**
   * Génère des recommandations pour un article
   */
  generateRecommendations(scores, article) {
    const recommendations = [];

    // Recommandations basées sur les scores
    Object.entries(scores).forEach(([category, result]) => {
      if (result.status === 'poor') {
        recommendations.push({
          category,
          priority: 'high',
          message: result.message,
          action: this.getActionForCategory(category, result)
        });
      } else if (result.status === 'average') {
        recommendations.push({
          category,
          priority: 'medium',
          message: result.message,
          action: this.getActionForCategory(category, result)
        });
      }
    });

    return recommendations;
  }

  /**
   * Identifie les problèmes majeurs
   */
  identifyIssues(scores, article) {
    const issues = [];

    if (scores.wordCount.score < 15) {
      issues.push({
        type: 'critical',
        message: 'Article trop court pour un bon référencement',
        fix: 'Étendre le contenu à au moins 500 mots'
      });
    }

    if (scores.title.score < 10) {
      issues.push({
        type: 'high',
        message: 'Titre non optimisé pour le SEO',
        fix: 'Revoir la longueur et les mots-clés du titre'
      });
    }

    if (scores.description.score < 10) {
      issues.push({
        type: 'high',
        message: 'Meta description manquante ou mal optimisée',
        fix: 'Rédiger une description de 140-160 caractères'
      });
    }

    return issues;
  }

  /**
   * Identifie les points forts
   */
  identifyStrengths(scores, article) {
    const strengths = [];

    Object.entries(scores).forEach(([category, result]) => {
      if (result.status === 'excellent') {
        strengths.push({
          category,
          message: result.message
        });
      }
    });

    return strengths;
  }

  /**
   * Génère des recommandations globales
   */
  generateGlobalRecommendations(articles) {
    const recommendations = [];
    
    // Articles trop courts
    const shortArticles = articles.filter(a => a.seoAnalysis.scores.wordCount.score < 15);
    if (shortArticles.length > 0) {
      recommendations.push({
        title: 'Articles trop courts',
        count: shortArticles.length,
        description: `${shortArticles.length} articles ont moins de 300 mots`,
        action: 'Étendre le contenu de ces articles',
        priority: 'high'
      });
    }

    // Descriptions manquantes
    const missingDescriptions = articles.filter(a => a.seoAnalysis.scores.description.score < 10);
    if (missingDescriptions.length > 0) {
      recommendations.push({
        title: 'Descriptions manquantes',
        count: missingDescriptions.length,
        description: `${missingDescriptions.length} articles n'ont pas de meta description optimisée`,
        action: 'Rédiger des descriptions de 140-160 caractères',
        priority: 'high'
      });
    }

    // Contenu ancien
    const oldContent = articles.filter(a => a.seoAnalysis.scores.freshness.score < 3);
    if (oldContent.length > 0) {
      recommendations.push({
        title: 'Contenu à rafraîchir',
        count: oldContent.length,
        description: `${oldContent.length} articles n'ont pas été mis à jour récemment`,
        action: 'Réviser et mettre à jour le contenu ancien',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Génère des actions prioritaires
   */
  generatePriorityActions(articles) {
    const actions = [];

    // Trier les articles par score SEO (les plus faibles en premier)
    const worstArticles = articles
      .sort((a, b) => a.seoAnalysis.totalScore - b.seoAnalysis.totalScore)
      .slice(0, 10);

    worstArticles.forEach((article, index) => {
      actions.push({
        rank: index + 1,
        title: article.title,
        slug: article.slug,
        score: article.seoAnalysis.totalScore,
        topIssue: article.seoAnalysis.issues[0]?.message || 'Score SEO faible',
        action: article.seoAnalysis.recommendations[0]?.action || 'Révision générale nécessaire'
      });
    });

    return actions;
  }

  /**
   * Obtient l'action recommandée pour une catégorie
   */
  getActionForCategory(category, result) {
    const actions = {
      wordCount: 'Étendre le contenu avec des informations détaillées et utiles',
      title: 'Optimiser la longueur du titre entre 30-60 caractères',
      description: 'Rédiger une meta description de 140-160 caractères',
      keywords: 'Ajouter des mots-clés pertinents (3-10 recommandés)',
      headings: 'Structurer avec des sous-titres H2 et H3',
      freshness: 'Mettre à jour le contenu avec des informations récentes'
    };

    return actions[category] || 'Révision recommandée';
  }

  /**
   * Exporte le rapport d'analyse
   */
  async exportReport(analysis, format = 'json') {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `seo-report-${timestamp}.${format}`;

    if (format === 'json') {
      fs.writeFileSync(filename, JSON.stringify(analysis, null, 2));
    } else if (format === 'csv') {
      // Implémentation CSV si nécessaire
      console.log('Export CSV non implémenté');
    }

    return filename;
  }
}

// Export par défaut
export default SEOAnalyzer;
