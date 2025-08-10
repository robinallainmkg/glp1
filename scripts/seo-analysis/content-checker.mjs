// 📝 CONTENT CHECKER - Vérification conformité charte éditoriale
// Analyse la qualité du contenu selon les standards SEO et santé

import fs from 'fs';
import path from 'path';

export class ContentChecker {
  constructor() {
    this.healthCompliance = {
      // Mots à éviter (promesses médicales)
      forbiddenWords: [
        'guérir', 'guérit', 'guérira', 'traiter définitivement',
        'miracle', 'miracul', 'révolutionnaire',
        'garantit', 'garantie', 'certitude',
        'soigne', 'soigner', 'traitement définitif'
      ],
      
      // Mots requis pour la responsabilité
      requiredMedicalTerms: [
        'consulter', 'médecin', 'professionnel de santé',
        'avis médical', 'prescription', 'suivi médical'
      ],
      
      // Termes d'effets secondaires requis
      sideEffectTerms: [
        'effet secondaire', 'effets secondaires', 'effet indésirable',
        'effets indésirables', 'risque', 'précaution'
      ],
      
      // Disclaimers requis
      disclaimerTerms: [
        'information', 'éducatif', 'consulter un médecin',
        'ne remplace pas', 'avis médical'
      ]
    };
    
    this.contentRules = {
      title: {
        minLength: 30,
        maxLength: 60,
        mustContainKeyword: true,
        pattern: /^[A-ZÀ-Ÿ][^!?]*$/,
        forbiddenChars: ['!', '?', '...']
      },
      
      metaDescription: {
        minLength: 120,
        maxLength: 160,
        mustContainKeyword: true,
        mustHaveCTA: true,
        ctaWords: ['découvr', 'appren', 'consult', 'contact', 'lire', 'voir', 'comprendre']
      },
      
      headings: {
        h1: { unique: true, containsKeyword: true, maxLength: 70 },
        h2: { maxEmojis: 0, descriptive: true, minLength: 20 },
        hierarchy: { logical: true }
      },
      
      content: {
        minWords: 500,
        keywordDensity: { min: 1, max: 3 },
        readabilityScore: { min: 60 },
        internalLinks: { min: 3 },
        externalLinks: { min: 1, authoritative: true },
        lastUpdated: { maxDays: 180 }
      },
      
      healthSpecific: {
        hasDisclaimer: true,
        encouragesConsultation: true,
        noMedicalPromises: true,
        hasSideEffects: true,
        sourcesRequired: true
      }
    };
    
    this.violations = [];
    this.scores = {};
  }

  async checkAllPages(pageData) {
    console.log('🔍 Vérification conformité contenu...');
    
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: 0,
        averageScore: 0,
        highQualityPages: 0,
        lowQualityPages: 0,
        criticalIssues: 0
      },
      pages: [],
      globalIssues: []
    };

    let totalScore = 0;
    
    for (const [url, page] of Object.entries(pageData)) {
      const pageResult = await this.checkPage(page);
      results.pages.push(pageResult);
      
      totalScore += pageResult.overallScore;
      
      if (pageResult.overallScore >= 80) {
        results.summary.highQualityPages++;
      } else if (pageResult.overallScore < 50) {
        results.summary.lowQualityPages++;
      }
      
      // Compter les problèmes critiques
      results.summary.criticalIssues += pageResult.checks.filter(check => 
        check.severity === 'critical' && !check.passed
      ).length;
    }
    
    results.summary.totalPages = results.pages.length;
    results.summary.averageScore = results.summary.totalPages > 0 
      ? Math.round(totalScore / results.summary.totalPages) 
      : 0;
    
    // Identifier les problèmes globaux
    results.globalIssues = this.identifyGlobalIssues(results.pages);
    
    return results;
  }

  async checkPage(pageData) {
    console.log(`   📄 Vérification : ${pageData.title}`);
    
    const checks = [
      this.checkTitle(pageData),
      this.checkMetaDescription(pageData),
      this.checkHeadingStructure(pageData),
      this.checkContentQuality(pageData),
      this.checkHealthCompliance(pageData),
      this.checkSEOOptimization(pageData),
      this.checkFreshness(pageData),
      this.checkLinks(pageData)
    ];

    const results = await Promise.all(checks);
    return this.compilePageResults(pageData, results);
  }

  checkTitle(pageData) {
    const title = pageData.title || '';
    const issues = [];
    const warnings = [];
    let score = 100;

    // Vérifications critiques
    if (!title) {
      issues.push('Titre manquant');
      score = 0;
    } else {
      // Longueur
      if (title.length < this.contentRules.title.minLength) {
        issues.push(`Titre trop court (${title.length} < ${this.contentRules.title.minLength} caractères)`);
        score -= 30;
      } else if (title.length > this.contentRules.title.maxLength) {
        issues.push(`Titre trop long (${title.length} > ${this.contentRules.title.maxLength} caractères)`);
        score -= 25;
      }
      
      // Format
      if (!this.contentRules.title.pattern.test(title)) {
        issues.push('Titre ne commence pas par une majuscule ou contient des caractères interdits');
        score -= 15;
      }
      
      // Caractères interdits
      this.contentRules.title.forbiddenChars.forEach(char => {
        if (title.includes(char)) {
          warnings.push(`Caractère déconseillé dans le titre : "${char}"`);
          score -= 5;
        }
      });
      
      // Mots-clés
      const hasKeyword = pageData.keywords && pageData.keywords.length > 0 
        ? pageData.keywords.some(kw => title.toLowerCase().includes(kw.keyword.toLowerCase()))
        : false;
      
      if (!hasKeyword) {
        issues.push('Titre ne contient pas de mot-clé principal');
        score -= 20;
      }
    }

    return {
      rule: 'title_optimization',
      passed: issues.length === 0,
      severity: issues.length > 0 ? 'critical' : 'info',
      score: Math.max(0, score),
      issues,
      warnings,
      data: { length: title.length, title }
    };
  }

  checkMetaDescription(pageData) {
    const description = pageData.description || '';
    const issues = [];
    const warnings = [];
    let score = 100;

    if (!description) {
      issues.push('Meta description manquante');
      score = 0;
    } else {
      // Longueur
      if (description.length < this.contentRules.metaDescription.minLength) {
        issues.push(`Meta description trop courte (${description.length} < ${this.contentRules.metaDescription.minLength})`);
        score -= 30;
      } else if (description.length > this.contentRules.metaDescription.maxLength) {
        issues.push(`Meta description trop longue (${description.length} > ${this.contentRules.metaDescription.maxLength})`);
        score -= 25;
      }
      
      // Appel à l'action
      const hasCTA = this.contentRules.metaDescription.ctaWords.some(cta => 
        description.toLowerCase().includes(cta)
      );
      
      if (!hasCTA) {
        warnings.push('Meta description sans appel à l\'action clair');
        score -= 15;
      }
      
      // Mot-clé
      const hasKeyword = pageData.keywords && pageData.keywords.length > 0 
        ? pageData.keywords.some(kw => description.toLowerCase().includes(kw.keyword.toLowerCase()))
        : false;
      
      if (!hasKeyword) {
        issues.push('Meta description ne contient pas de mot-clé');
        score -= 20;
      }
    }

    return {
      rule: 'meta_description',
      passed: issues.length === 0,
      severity: issues.length > 0 ? 'high' : 'info',
      score: Math.max(0, score),
      issues,
      warnings,
      data: { length: description.length }
    };
  }

  checkHeadingStructure(pageData) {
    const issues = [];
    const warnings = [];
    let score = 100;
    
    // Analyser les headings depuis le contenu (s'il est disponible)
    const headings = this.extractHeadings(pageData);
    
    // Vérifier H1
    if (headings.h1.length === 0) {
      issues.push('Aucun H1 trouvé');
      score -= 40;
    } else if (headings.h1.length > 1) {
      issues.push(`Plusieurs H1 détectés (${headings.h1.length})`);
      score -= 25;
    } else {
      const h1 = headings.h1[0];
      if (h1.length > this.contentRules.headings.h1.maxLength) {
        warnings.push('H1 trop long (>70 caractères)');
        score -= 10;
      }
      
      // Vérifier présence mot-clé dans H1
      const hasKeyword = pageData.keywords && pageData.keywords.length > 0 
        ? pageData.keywords.some(kw => h1.toLowerCase().includes(kw.keyword.toLowerCase()))
        : false;
      
      if (!hasKeyword) {
        issues.push('H1 ne contient pas de mot-clé principal');
        score -= 20;
      }
    }
    
    // Vérifier H2
    if (headings.h2.length === 0) {
      warnings.push('Aucun H2 trouvé - structure peu claire');
      score -= 15;
    } else if (headings.h2.length < 2) {
      warnings.push('Peu de H2 - contenu peut manquer de structure');
      score -= 10;
    }
    
    // Vérifier hiérarchie logique
    if (headings.h3.length > 0 && headings.h2.length === 0) {
      issues.push('H3 sans H2 - hiérarchie illogique');
      score -= 20;
    }

    return {
      rule: 'heading_structure',
      passed: issues.length === 0,
      severity: issues.length > 0 ? 'high' : 'info',
      score: Math.max(0, score),
      issues,
      warnings,
      data: {
        h1Count: headings.h1.length,
        h2Count: headings.h2.length,
        h3Count: headings.h3.length
      }
    };
  }

  checkContentQuality(pageData) {
    const issues = [];
    const warnings = [];
    let score = 100;
    
    const wordCount = pageData.wordCount || 0;
    
    // Longueur du contenu
    if (wordCount < this.contentRules.content.minWords) {
      issues.push(`Contenu trop court (${wordCount} < ${this.contentRules.content.minWords} mots)`);
      score -= 30;
    } else if (wordCount < 800) {
      warnings.push('Contenu pourrait être plus développé (< 800 mots)');
      score -= 10;
    }
    
    // Densité des mots-clés
    if (pageData.keywords && pageData.keywords.length > 0) {
      const primaryKeyword = pageData.keywords[0];
      if (primaryKeyword.density < this.contentRules.content.keywordDensity.min) {
        warnings.push(`Densité mot-clé faible (${primaryKeyword.density.toFixed(2)}%)`);
        score -= 15;
      } else if (primaryKeyword.density > this.contentRules.content.keywordDensity.max) {
        issues.push(`Sur-optimisation détectée (${primaryKeyword.density.toFixed(2)}%)`);
        score -= 25;
      }
    }
    
    // Liens internes
    const internalLinks = pageData.seo?.content?.internalLinks || 0;
    if (internalLinks < this.contentRules.content.internalLinks.min) {
      warnings.push(`Peu de liens internes (${internalLinks} < ${this.contentRules.content.internalLinks.min})`);
      score -= 15;
    }
    
    // Liens externes
    const externalLinks = pageData.seo?.content?.externalLinks || 0;
    if (externalLinks < this.contentRules.content.externalLinks.min) {
      warnings.push('Aucun lien externe vers des sources');
      score -= 10;
    }

    return {
      rule: 'content_quality',
      passed: issues.length === 0,
      severity: issues.length > 0 ? 'medium' : 'info',
      score: Math.max(0, score),
      issues,
      warnings,
      data: {
        wordCount,
        internalLinks,
        externalLinks,
        readingTime: pageData.readingTime || Math.ceil(wordCount / 200)
      }
    };
  }

  checkHealthCompliance(pageData) {
    const issues = [];
    const warnings = [];
    let score = 100;
    
    // Simuler l'analyse du contenu complet
    const fullContent = (pageData.title + ' ' + pageData.description).toLowerCase();
    
    // Vérifier mots interdits (promesses médicales)
    this.healthCompliance.forbiddenWords.forEach(word => {
      if (fullContent.includes(word.toLowerCase())) {
        issues.push(`Mot interdit détecté : "${word}" - Risque juridique`);
        score -= 25;
      }
    });
    
    // Vérifier encouragement consultation médicale
    const hasConsultationEncouragement = this.healthCompliance.requiredMedicalTerms.some(term =>
      fullContent.includes(term.toLowerCase())
    );
    
    if (!hasConsultationEncouragement) {
      issues.push('Pas d\'encouragement à la consultation médicale');
      score -= 30;
    }
    
    // Vérifier mention effets secondaires pour médicaments
    const mentionsMedication = ['ozempic', 'wegovy', 'saxenda', 'mounjaro', 'glp1'].some(med =>
      fullContent.includes(med.toLowerCase())
    );
    
    if (mentionsMedication) {
      const hasSideEffectMention = this.healthCompliance.sideEffectTerms.some(term =>
        fullContent.includes(term.toLowerCase())
      );
      
      if (!hasSideEffectMention) {
        issues.push('Médicament mentionné sans information sur les effets secondaires');
        score -= 35;
      }
    }
    
    // Vérifier disclaimer
    const hasDisclaimer = this.healthCompliance.disclaimerTerms.some(term =>
      fullContent.includes(term.toLowerCase())
    );
    
    if (!hasDisclaimer) {
      warnings.push('Aucun disclaimer informatif détecté');
      score -= 15;
    }

    return {
      rule: 'health_compliance',
      passed: issues.length === 0,
      severity: issues.length > 0 ? 'critical' : 'info',
      score: Math.max(0, score),
      issues,
      warnings,
      data: {
        mentionsMedication,
        hasConsultationEncouragement,
        hasDisclaimer
      }
    };
  }

  checkSEOOptimization(pageData) {
    const issues = [];
    const warnings = [];
    let score = pageData.seo?.overall || 0;
    
    // Utiliser les données SEO existantes
    if (pageData.seo) {
      Object.entries(pageData.seo).forEach(([section, data]) => {
        if (data.issues && data.issues.length > 0) {
          data.issues.forEach(issue => {
            if (data.score < 50) {
              issues.push(`${section}: ${issue}`);
            } else {
              warnings.push(`${section}: ${issue}`);
            }
          });
        }
      });
    }

    return {
      rule: 'seo_optimization',
      passed: score >= 70,
      severity: score < 50 ? 'high' : score < 70 ? 'medium' : 'info',
      score,
      issues,
      warnings,
      data: pageData.seo || {}
    };
  }

  checkFreshness(pageData) {
    const issues = [];
    const warnings = [];
    let score = 100;
    
    if (pageData.lastModified) {
      const lastModified = new Date(pageData.lastModified);
      const daysSinceUpdate = Math.floor((Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate > this.contentRules.content.lastUpdated.maxDays) {
        warnings.push(`Contenu non mis à jour depuis ${daysSinceUpdate} jours`);
        score -= 20;
      } else if (daysSinceUpdate > 90) {
        warnings.push(`Contenu pourrait nécessiter une mise à jour (${daysSinceUpdate} jours)`);
        score -= 10;
      }
    } else {
      warnings.push('Date de dernière modification inconnue');
      score -= 5;
    }

    return {
      rule: 'content_freshness',
      passed: issues.length === 0,
      severity: 'low',
      score: Math.max(0, score),
      issues,
      warnings,
      data: { lastModified: pageData.lastModified }
    };
  }

  checkLinks(pageData) {
    const issues = [];
    const warnings = [];
    let score = 100;
    
    const internalLinks = pageData.seo?.content?.internalLinks || 0;
    const externalLinks = pageData.seo?.content?.externalLinks || 0;
    
    // Vérifications déjà faites dans content quality
    // Ici on peut ajouter des vérifications plus avancées
    
    if (internalLinks === 0) {
      issues.push('Aucun lien interne - Page isolée');
      score -= 30;
    }
    
    if (externalLinks === 0) {
      warnings.push('Aucune source externe - Crédibilité réduite');
      score -= 15;
    }

    return {
      rule: 'link_structure',
      passed: issues.length === 0,
      severity: issues.length > 0 ? 'medium' : 'info',
      score: Math.max(0, score),
      issues,
      warnings,
      data: { internalLinks, externalLinks }
    };
  }

  extractHeadings(pageData) {
    // Simuler l'extraction des headings
    // Dans un vrai cas, on parserait le contenu markdown
    return {
      h1: pageData.title ? [pageData.title] : [],
      h2: [], // À implémenter avec le parsing du contenu
      h3: []
    };
  }

  compilePageResults(pageData, checkResults) {
    const allIssues = [];
    const allWarnings = [];
    let totalScore = 0;
    let criticalIssuesCount = 0;

    checkResults.forEach(result => {
      totalScore += result.score;
      allIssues.push(...result.issues);
      allWarnings.push(...result.warnings);
      
      if (result.severity === 'critical' && !result.passed) {
        criticalIssuesCount++;
      }
    });

    const overallScore = Math.round(totalScore / checkResults.length);
    
    return {
      url: pageData.url,
      title: pageData.title,
      overallScore,
      grade: this.getGrade(overallScore),
      criticalIssuesCount,
      totalIssues: allIssues.length,
      totalWarnings: allWarnings.length,
      checks: checkResults,
      summary: {
        strengths: this.identifyStrengths(checkResults),
        priorities: this.identifyPriorities(checkResults),
        quickWins: this.identifyQuickWins(checkResults)
      }
    };
  }

  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  identifyStrengths(checkResults) {
    return checkResults
      .filter(result => result.passed && result.score >= 80)
      .map(result => result.rule);
  }

  identifyPriorities(checkResults) {
    return checkResults
      .filter(result => result.severity === 'critical' && !result.passed)
      .map(result => ({
        rule: result.rule,
        issues: result.issues,
        impact: 'Critique'
      }))
      .slice(0, 3);
  }

  identifyQuickWins(checkResults) {
    return checkResults
      .filter(result => !result.passed && result.score > 50 && result.score < 80)
      .map(result => ({
        rule: result.rule,
        effort: 'Facile',
        impact: 'Moyen'
      }))
      .slice(0, 3);
  }

  identifyGlobalIssues(pagesResults) {
    const issueFrequency = {};
    
    pagesResults.forEach(page => {
      page.checks.forEach(check => {
        check.issues.forEach(issue => {
          issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
        });
      });
    });
    
    // Retourner les problèmes les plus fréquents
    return Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({
        issue,
        frequency: count,
        percentage: Math.round((count / pagesResults.length) * 100)
      }));
  }

  async generateReport(results) {
    console.log('📊 Génération rapport conformité...');
    
    // Créer le dossier de rapport s'il n'existe pas
    const reportDir = 'seo-analysis';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Sauvegarder le rapport complet
    const reportPath = path.join(reportDir, 'content-compliance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    // Générer un résumé textuel
    this.generateComplianceSummary(results);
    
    console.log(`✅ Rapport conformité sauvegardé : ${reportPath}`);
    
    return results;
  }

  generateComplianceSummary(results) {
    const highQualityPercent = Math.round((results.summary.highQualityPages / results.summary.totalPages) * 100);
    const lowQualityPercent = Math.round((results.summary.lowQualityPages / results.summary.totalPages) * 100);
    
    const summary = `
# 📋 RAPPORT CONFORMITÉ CONTENU - ${new Date(results.timestamp).toLocaleDateString('fr-FR')}

## 📊 RÉSUMÉ GLOBAL
- **Pages analysées :** ${results.summary.totalPages}
- **Score moyen :** ${results.summary.averageScore}/100
- **Pages haute qualité (≥80) :** ${results.summary.highQualityPages} (${highQualityPercent}%)
- **Pages à améliorer (<50) :** ${results.summary.lowQualityPages} (${lowQualityPercent}%)
- **Problèmes critiques :** ${results.summary.criticalIssues}

## 🚨 PROBLÈMES RÉCURRENTS
${results.globalIssues.map(issue => 
  `- **${issue.issue}** : ${issue.frequency} pages (${issue.percentage}%)`
).join('\n')}

## ⭐ TOP PAGES (Score ≥ 80)
${results.pages
  .filter(page => page.overallScore >= 80)
  .sort((a, b) => b.overallScore - a.overallScore)
  .slice(0, 5)
  .map(page => `- **${page.title}** : ${page.overallScore}/100 (Grade ${page.grade})`)
  .join('\n')}

## ⚠️ PAGES PRIORITAIRES (Score < 50)
${results.pages
  .filter(page => page.overallScore < 50)
  .sort((a, b) => a.overallScore - b.overallScore)
  .slice(0, 5)
  .map(page => `- **${page.title}** : ${page.overallScore}/100 - ${page.criticalIssuesCount} problème(s) critique(s)`)
  .join('\n')}

## 🎯 ACTIONS PRIORITAIRES

### Conformité Santé Critique
${results.pages
  .filter(page => page.checks.some(check => 
    check.rule === 'health_compliance' && check.severity === 'critical' && !check.passed
  ))
  .slice(0, 3)
  .map(page => 
    `**${page.title}** - Problèmes de conformité santé détectés`
  ).join('\n')}

### Optimisations SEO Rapides
${results.pages
  .filter(page => page.summary.quickWins.length > 0)
  .slice(0, 3)
  .map(page => 
    `**${page.title}** - ${page.summary.quickWins.map(win => win.rule).join(', ')}`
  ).join('\n')}

## 📈 RECOMMANDATIONS

1. **Conformité Santé** : Priorité absolue - Réviser ${results.pages.filter(p => p.checks.some(c => c.rule === 'health_compliance' && !c.passed)).length} pages
2. **Optimisation Titles** : ${results.globalIssues.find(i => i.issue.includes('Titre'))?.frequency || 0} pages à corriger
3. **Meta Descriptions** : ${results.globalIssues.find(i => i.issue.includes('Meta'))?.frequency || 0} pages à optimiser
4. **Structure Contenu** : Améliorer la hiérarchie H1-H2-H3 sur les pages faiblement notées
5. **Liens Internes** : Renforcer le maillage interne (${results.pages.filter(p => p.checks.some(c => c.rule === 'link_structure' && !c.passed)).length} pages concernées)
`;

    fs.writeFileSync('seo-analysis/content-compliance-summary.md', summary);
    console.log('✅ Résumé conformité généré : seo-analysis/content-compliance-summary.md');
  }
}

// Script exécutable
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('⚠️ Ce script doit être utilisé via l\'orchestrateur principal');
  console.log('👉 Utilisez : node scripts/seo-analysis/run-analysis.mjs');
}
