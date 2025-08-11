import fs from 'fs';
import path from 'path';

/**
 * SYSTÈME D'AUDIT SEO STRATÉGIQUE MASTER
 * =====================================
 * 
 * Ce script centralise toute la stratégie SEO et fournit un audit complet
 * exécutable à tout moment pour une vision actuelle du site.
 * 
 * COMPOSANTS :
 * - Stratégie mots-clés avec scoring
 * - Audit de pertinence du contenu
 * - Scoring des articles individuels
 * - Scoring des collections
 * - Score SEO global
 * - Recommandations prioritaires
 */

class SEOStrategyMaster {
    constructor() {
        this.contentDir = './src/content';
        this.dataDir = './data';
        
        // STRATÉGIE MOTS-CLÉS PRINCIPAUX
        this.keywordStrategy = {
            // Mots-clés primaires (fort volume, forte intention commerciale)
            primary: {
                'ozempic': { 
                    volume: 18000, 
                    difficulty: 65, 
                    intent: 'commercial', 
                    priority: 100,
                    targetedArticles: ['ozempic-prix', 'ozempic-regime', 'ozempic-injection-prix'],
                    currentRanking: null
                },
                'wegovy': { 
                    volume: 12000, 
                    difficulty: 60, 
                    intent: 'commercial', 
                    priority: 95,
                    targetedArticles: ['wegovy-prix', 'wegovy-avis', 'acheter-wegovy-en-france'],
                    currentRanking: null
                },
                'glp-1': { 
                    volume: 8000, 
                    difficulty: 55, 
                    intent: 'informational', 
                    priority: 90,
                    targetedArticles: ['glp-1', 'glp1-perte-de-poids', 'mecanisme-d-action'],
                    currentRanking: null
                },
                'semaglutide': { 
                    volume: 6500, 
                    difficulty: 58, 
                    intent: 'commercial', 
                    priority: 85,
                    targetedArticles: ['semaglutide-achat', 'nouveau-medicament'],
                    currentRanking: null
                },
                'trulicity': { 
                    volume: 5500, 
                    difficulty: 52, 
                    intent: 'commercial', 
                    priority: 80,
                    targetedArticles: ['trulicity-ou-ozempic', 'dosage-trulicity'],
                    currentRanking: null
                }
            },
            
            // Mots-clés secondaires (volume moyen, bonne opportunité)
            secondary: {
                'medicament pour maigrir': { 
                    volume: 9500, 
                    difficulty: 70, 
                    intent: 'commercial', 
                    priority: 75,
                    targetedArticles: ['medicament-pour-maigrir-tres-puissant'],
                    currentRanking: null
                },
                'diabete type 2': { 
                    volume: 14000, 
                    difficulty: 68, 
                    intent: 'informational', 
                    priority: 70,
                    targetedArticles: ['traitement-diabete-type-2', 'nouveau-traitement-diabete-type-2-injection'],
                    currentRanking: null
                },
                'perte de poids': { 
                    volume: 22000, 
                    difficulty: 75, 
                    intent: 'commercial', 
                    priority: 65,
                    targetedArticles: ['glp1-perte-de-poids', 'avant-apres-glp1'],
                    currentRanking: null
                },
                'mounjaro': { 
                    volume: 4500, 
                    difficulty: 45, 
                    intent: 'commercial', 
                    priority: 60,
                    targetedArticles: ['mounjaro-prix-france', 'mounjaro-injection-pour-maigrir'],
                    currentRanking: null
                },
                'tirzepatide': { 
                    volume: 3200, 
                    difficulty: 42, 
                    intent: 'commercial', 
                    priority: 55,
                    targetedArticles: ['tirzepatide-avis'],
                    currentRanking: null
                }
            },
            
            // Mots-clés longue traîne (faible volume, forte conversion)
            longTail: {
                'ozempic prix france': { 
                    volume: 1800, 
                    difficulty: 35, 
                    intent: 'commercial', 
                    priority: 50,
                    targetedArticles: ['ozempic-prix'],
                    currentRanking: null
                },
                'wegovy remboursement mutuelle': { 
                    volume: 820, 
                    difficulty: 30, 
                    intent: 'informational', 
                    priority: 45,
                    targetedArticles: ['wegovy-remboursement-mutuelle'],
                    currentRanking: null
                },
                'nouveau medicament diabete 2025': { 
                    volume: 1200, 
                    difficulty: 25, 
                    intent: 'informational', 
                    priority: 40,
                    targetedArticles: ['nouveau-medicament'],
                    currentRanking: null
                },
                'alternatives naturelles ozempic': { 
                    volume: 950, 
                    difficulty: 28, 
                    intent: 'informational', 
                    priority: 35,
                    targetedArticles: ['alternatives-naturelles-ozempic', 'semaglutide-naturel'],
                    currentRanking: null
                }
            }
        };
        
        // CRITÈRES D'ÉVALUATION DU CONTENU
        this.contentQualityCriteria = {
            relevance: {
                weight: 30,
                checks: [
                    'hasSpecificInformation',
                    'answersSearchIntent', 
                    'providesUniqueValue',
                    'isNotGeneric'
                ]
            },
            technical: {
                weight: 25,
                checks: [
                    'hasOptimizedTitle',
                    'hasMetaDescription',
                    'hasKeywords',
                    'hasInternalLinks',
                    'hasImages'
                ]
            },
            content: {
                weight: 25,
                checks: [
                    'hasMinimumWords',
                    'hasStructuredHeadings',
                    'hasLists',
                    'hasCallToAction'
                ]
            },
            userExperience: {
                weight: 20,
                checks: [
                    'hasReadableContent',
                    'hasGoodFormatting',
                    'hasCurrentInformation',
                    'hasAuthoritySignals'
                ]
            }
        };

        this.results = {
            timestamp: new Date().toISOString(),
            globalScore: 0,
            keywordScores: {},
            articleScores: {},
            collectionScores: {},
            contentQualityIssues: [],
            recommendations: []
        };
    }

    // AUDIT DE PERTINENCE DU CONTENU
    analyzeContentRelevance(content, filePath) {
        const issues = [];
        const strengths = [];
        let relevanceScore = 0;
        
        // Détecter contenu générique
        const genericPatterns = [
            /\*\[.*à développer.*\]\*/gi,
            /\[définition et présentation à développer\]/gi,
            /\[mécanisme d'action à développer\]/gi,
            /lorem ipsum/gi,
            /texte de remplissage/gi,
            /contenu à compléter/gi
        ];
        
        const hasGenericContent = genericPatterns.some(pattern => pattern.test(content));
        if (hasGenericContent) {
            issues.push('Contenu générique détecté');
            relevanceScore -= 30;
        }
        
        // Vérifier la spécificité du contenu
        const wordCount = this.countWords(content);
        const specificTerms = this.countSpecificTerms(content);
        const specificityRatio = specificTerms / wordCount;
        
        if (specificityRatio > 0.1) {
            strengths.push('Contenu spécialisé et technique');
            relevanceScore += 20;
        } else if (specificityRatio < 0.05) {
            issues.push('Manque de termes spécialisés');
            relevanceScore -= 10;
        }
        
        // Vérifier l'actualité du contenu
        const currentYear = new Date().getFullYear();
        const hasCurrentYear = content.includes(currentYear.toString());
        const hasRecentDates = content.includes('2024') || content.includes('2025');
        
        if (hasCurrentYear && hasRecentDates) {
            strengths.push('Contenu actualisé');
            relevanceScore += 15;
        } else {
            issues.push('Contenu potentiellement obsolète');
            relevanceScore -= 5;
        }
        
        // Vérifier la profondeur du traitement
        const h2Count = (content.match(/^## /gm) || []).length;
        const h3Count = (content.match(/^### /gm) || []).length;
        
        if (h2Count >= 5 && h3Count >= 3) {
            strengths.push('Traitement approfondi du sujet');
            relevanceScore += 15;
        } else if (h2Count < 3) {
            issues.push('Traitement superficiel du sujet');
            relevanceScore -= 15;
        }
        
        // Vérifier les données factuelles
        const hasNumbers = /\d+[%€$]|\d+\s*(mg|ml|euros?|dollars?)/.test(content);
        const hasStatistics = /\d+%|\d+\s*patients?|\d+\s*études?/.test(content);
        
        if (hasNumbers && hasStatistics) {
            strengths.push('Contenu factuel avec données');
            relevanceScore += 10;
        } else {
            issues.push('Manque de données factuelles');
            relevanceScore -= 5;
        }
        
        return {
            relevanceScore: Math.max(0, Math.min(100, relevanceScore + 50)), // Base de 50
            issues,
            strengths,
            hasGenericContent,
            specificityRatio: Math.round(specificityRatio * 1000) / 10 // Pourcentage avec 1 décimale
        };
    }

    // SCORING DES ARTICLES INDIVIDUELS
    scoreArticle(filePath, content) {
        const articleScore = {
            path: filePath,
            totalScore: 0,
            details: {},
            issues: [],
            strengths: []
        };

        // 1. Analyse de pertinence (30% du score)
        const relevanceAnalysis = this.analyzeContentRelevance(content, filePath);
        articleScore.details.relevance = relevanceAnalysis.relevanceScore;
        articleScore.issues.push(...relevanceAnalysis.issues);
        articleScore.strengths.push(...relevanceAnalysis.strengths);

        // 2. Optimisation technique (25% du score)
        const technicalAnalysis = this.analyzeTechnicalSEO(content, filePath);
        articleScore.details.technical = technicalAnalysis.score;
        articleScore.issues.push(...technicalAnalysis.issues);
        articleScore.strengths.push(...technicalAnalysis.strengths);

        // 3. Qualité du contenu (25% du score)
        const contentAnalysis = this.analyzeContentQuality(content);
        articleScore.details.content = contentAnalysis.score;
        articleScore.issues.push(...contentAnalysis.issues);
        articleScore.strengths.push(...contentAnalysis.strengths);

        // 4. Potentiel de ranking (20% du score)
        const rankingAnalysis = this.analyzeRankingPotential(content, filePath);
        articleScore.details.ranking = rankingAnalysis.score;
        articleScore.issues.push(...rankingAnalysis.issues);
        articleScore.strengths.push(...rankingAnalysis.strengths);

        // Calcul du score total
        articleScore.totalScore = Math.round(
            (articleScore.details.relevance * 0.30) +
            (articleScore.details.technical * 0.25) +
            (articleScore.details.content * 0.25) +
            (articleScore.details.ranking * 0.20)
        );

        return articleScore;
    }

    // ANALYSE TECHNIQUE SEO
    analyzeTechnicalSEO(content, filePath) {
        const issues = [];
        const strengths = [];
        let score = 0;

        // Extraire le frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';

        // Titre
        const title = this.extractFrontmatterField(frontmatter, 'title');
        if (title) {
            if (title.length >= 40 && title.length <= 60) {
                strengths.push('Titre optimisé (40-60 caractères)');
                score += 20;
            } else if (title.length < 30) {
                issues.push('Titre trop court');
                score += 5;
            } else if (title.length > 70) {
                issues.push('Titre trop long');
                score += 5;
            } else {
                score += 15;
            }
        } else {
            issues.push('Titre manquant');
        }

        // Meta description
        const metaDescription = this.extractFrontmatterField(frontmatter, 'metaDescription');
        if (metaDescription) {
            if (metaDescription.length >= 140 && metaDescription.length <= 160) {
                strengths.push('Meta description optimisée');
                score += 20;
            } else if (metaDescription.length < 120) {
                issues.push('Meta description trop courte');
                score += 10;
            } else {
                score += 15;
            }
        } else {
            issues.push('Meta description manquante');
        }

        // Mots-clés
        const keywords = this.extractFrontmatterField(frontmatter, 'keywords');
        if (keywords) {
            const keywordCount = keywords.split(',').length;
            if (keywordCount >= 3 && keywordCount <= 7) {
                strengths.push(`Mots-clés bien définis (${keywordCount})`);
                score += 15;
            } else {
                score += 10;
            }
        } else {
            issues.push('Mots-clés manquants');
        }

        // Liens internes
        const internalLinks = (content.match(/\]\(\//g) || []).length;
        if (internalLinks >= 5) {
            strengths.push(`Bon maillage interne (${internalLinks} liens)`);
            score += 15;
        } else if (internalLinks >= 2) {
            score += 10;
        } else {
            issues.push('Maillage interne insuffisant');
            score += 5;
        }

        // Images
        const images = (content.match(/!\[.*?\]/g) || []).length;
        if (images >= 2) {
            strengths.push(`Images présentes (${images})`);
            score += 10;
        } else if (images === 1) {
            score += 8;
        } else {
            issues.push('Aucune image');
            score += 3;
        }

        return { score: Math.min(100, score), issues, strengths };
    }

    // ANALYSE QUALITÉ CONTENU
    analyzeContentQuality(content) {
        const issues = [];
        const strengths = [];
        let score = 0;

        const wordCount = this.countWords(content);
        
        // Longueur du contenu
        if (wordCount >= 1000) {
            strengths.push(`Contenu long et détaillé (${wordCount} mots)`);
            score += 25;
        } else if (wordCount >= 500) {
            strengths.push(`Contenu de bonne longueur (${wordCount} mots)`);
            score += 20;
        } else {
            issues.push(`Contenu trop court (${wordCount} mots)`);
            score += 10;
        }

        // Structure des titres
        const h2Count = (content.match(/^## /gm) || []).length;
        const h3Count = (content.match(/^### /gm) || []).length;
        
        if (h2Count >= 4 && h3Count >= 2) {
            strengths.push('Excellente structure des titres');
            score += 20;
        } else if (h2Count >= 3) {
            strengths.push('Bonne structure des titres');
            score += 15;
        } else {
            issues.push('Structure des titres insuffisante');
            score += 8;
        }

        // Listes et formatage
        const lists = (content.match(/^[-*+] /gm) || []).length;
        const numberedLists = (content.match(/^\d+\. /gm) || []).length;
        const boldText = (content.match(/\*\*(.*?)\*\*/g) || []).length;
        
        if (lists + numberedLists >= 5 && boldText >= 10) {
            strengths.push('Excellent formatage et lisibilité');
            score += 15;
        } else if (lists + numberedLists >= 2) {
            score += 10;
        } else {
            issues.push('Formatage insuffisant');
            score += 5;
        }

        // Tables et données structurées
        const tables = (content.match(/\|.*\|/g) || []).length;
        if (tables >= 3) {
            strengths.push('Données bien structurées en tables');
            score += 10;
        }

        // Call-to-action
        const cta = /contactez|consultez|découvrez|en savoir plus|cliquez ici/gi.test(content);
        if (cta) {
            strengths.push('Call-to-action présent');
            score += 10;
        } else {
            issues.push('Aucun call-to-action');
            score += 5;
        }

        return { score: Math.min(100, score), issues, strengths };
    }

    // ANALYSE POTENTIEL DE RANKING
    analyzeRankingPotential(content, filePath) {
        const issues = [];
        const strengths = [];
        let score = 50; // Score de base

        // Correspondance avec mots-clés stratégiques
        const matchedKeywords = this.findMatchingKeywords(content, filePath);
        if (matchedKeywords.length > 0) {
            strengths.push(`Cible ${matchedKeywords.length} mot(s)-clé(s) stratégique(s)`);
            score += matchedKeywords.length * 10;
        } else {
            issues.push('Aucun mot-clé stratégique ciblé');
            score -= 10;
        }

        // Densité des mots-clés
        const keywordDensity = this.calculateKeywordDensity(content, matchedKeywords);
        if (keywordDensity >= 1 && keywordDensity <= 3) {
            strengths.push(`Densité mots-clés optimale (${keywordDensity}%)`);
            score += 15;
        } else if (keywordDensity > 3) {
            issues.push('Sur-optimisation détectée');
            score -= 10;
        } else {
            issues.push('Sous-optimisation des mots-clés');
            score -= 5;
        }

        // Fraîcheur du contenu
        const hasRecentInfo = /2024|2025|récent|nouveau|dernière|mise à jour/gi.test(content);
        if (hasRecentInfo) {
            strengths.push('Contenu actualisé');
            score += 10;
        }

        // Autorité et crédibilité
        const authoritySignals = /étude|recherche|expert|médecin|professionnel|source|référence/gi;
        const authorityCount = (content.match(authoritySignals) || []).length;
        if (authorityCount >= 5) {
            strengths.push('Signaux d\'autorité présents');
            score += 15;
        } else if (authorityCount >= 2) {
            score += 8;
        } else {
            issues.push('Manque de signaux d\'autorité');
            score -= 5;
        }

        return { score: Math.max(0, Math.min(100, score)), issues, strengths };
    }

    // SCORING DES COLLECTIONS
    scoreCollection(collectionPath) {
        const articles = this.getCollectionArticles(collectionPath);
        const collectionName = path.basename(collectionPath);
        
        const collectionScore = {
            name: collectionName,
            path: collectionPath,
            articleCount: articles.length,
            averageScore: 0,
            totalScore: 0,
            coverage: {},
            internalLinking: 0,
            keywordCoverage: 0,
            issues: [],
            strengths: []
        };

        if (articles.length === 0) {
            collectionScore.issues.push('Collection vide');
            return collectionScore;
        }

        // Calculer score moyen des articles
        const articleScores = articles.map(article => {
            const content = fs.readFileSync(article, 'utf-8');
            return this.scoreArticle(path.relative(this.contentDir, article), content);
        });

        collectionScore.averageScore = Math.round(
            articleScores.reduce((sum, score) => sum + score.totalScore, 0) / articleScores.length
        );

        // Analyser la couverture des mots-clés
        const keywordsCovered = this.analyzeCollectionKeywordCoverage(articles, collectionName);
        collectionScore.keywordCoverage = keywordsCovered.length;

        // Analyser le maillage interne
        const internalLinking = this.analyzeCollectionInternalLinking(articles);
        collectionScore.internalLinking = internalLinking.percentage;

        // Déterminer les forces et faiblesses
        if (collectionScore.averageScore >= 80) {
            collectionScore.strengths.push('Collection excellente qualité');
        } else if (collectionScore.averageScore >= 60) {
            collectionScore.strengths.push('Collection bonne qualité');
        } else {
            collectionScore.issues.push('Collection qualité à améliorer');
        }

        if (collectionScore.keywordCoverage >= 5) {
            collectionScore.strengths.push('Excellente couverture mots-clés');
        } else if (collectionScore.keywordCoverage < 2) {
            collectionScore.issues.push('Couverture mots-clés insuffisante');
        }

        if (collectionScore.internalLinking >= 70) {
            collectionScore.strengths.push('Excellent maillage interne');
        } else if (collectionScore.internalLinking < 30) {
            collectionScore.issues.push('Maillage interne insuffisant');
        }

        // Score total de la collection
        collectionScore.totalScore = Math.round(
            (collectionScore.averageScore * 0.6) +
            (Math.min(100, collectionScore.keywordCoverage * 10) * 0.25) +
            (collectionScore.internalLinking * 0.15)
        );

        return collectionScore;
    }

    // CALCUL DU SCORE SEO GLOBAL
    calculateGlobalScore() {
        const scores = {
            contentQuality: 0,
            technicalSEO: 0,
            keywordStrategy: 0,
            userExperience: 0,
            competitiveness: 0
        };

        // Score qualité contenu (moyenne des articles)
        const articleScores = Object.values(this.results.articleScores);
        if (articleScores.length > 0) {
            scores.contentQuality = Math.round(
                articleScores.reduce((sum, article) => sum + article.totalScore, 0) / articleScores.length
            );
        }

        // Score technique SEO (moyenne des scores techniques)
        if (articleScores.length > 0) {
            scores.technicalSEO = Math.round(
                articleScores.reduce((sum, article) => sum + (article.details.technical || 0), 0) / articleScores.length
            );
        }

        // Score stratégie mots-clés (couverture et optimisation)
        const keywordCoverage = this.calculateKeywordCoverage();
        scores.keywordStrategy = Math.round(keywordCoverage * 100);

        // Score expérience utilisateur (formatage et lisibilité)
        if (articleScores.length > 0) {
            scores.userExperience = Math.round(
                articleScores.reduce((sum, article) => sum + (article.details.content || 0), 0) / articleScores.length
            );
        }

        // Score compétitivité (potentiel de ranking)
        if (articleScores.length > 0) {
            scores.competitiveness = Math.round(
                articleScores.reduce((sum, article) => sum + (article.details.ranking || 0), 0) / articleScores.length
            );
        }

        // Score global pondéré
        const globalScore = Math.round(
            (scores.contentQuality * 0.25) +
            (scores.technicalSEO * 0.25) +
            (scores.keywordStrategy * 0.20) +
            (scores.userExperience * 0.15) +
            (scores.competitiveness * 0.15)
        );

        return { globalScore, scores };
    }

    // MÉTHODES UTILITAIRES

    countWords(content) {
        const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---/, '');
        const textContent = contentWithoutFrontmatter
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/\n+/g, ' ')
            .trim();
        
        return textContent.split(/\s+/).filter(word => word.length > 0).length;
    }

    countSpecificTerms(content) {
        const medicalTerms = [
            'glp-1', 'glp1', 'semaglutide', 'liraglutide', 'tirzepatide', 'dulaglutide',
            'ozempic', 'wegovy', 'trulicity', 'mounjaro', 'saxenda', 'victoza',
            'diabète', 'glycémie', 'insuline', 'hémoglobine', 'hba1c',
            'obésité', 'surpoids', 'imc', 'adiposité', 'métabolisme',
            'injection', 'sous-cutané', 'posologie', 'dosage', 'administration',
            'effets secondaires', 'contre-indications', 'précautions', 'surveillance',
            'remboursement', 'sécurité sociale', 'mutuelle', 'prix', 'coût',
            'endocrinologue', 'diabétologue', 'médecin', 'prescription', 'ordonnance'
        ];
        
        const contentLower = content.toLowerCase();
        return medicalTerms.filter(term => contentLower.includes(term)).length;
    }

    extractFrontmatterField(frontmatter, fieldName) {
        const regex = new RegExp(`${fieldName}:\\s*["']?([^"'\\n]+)["']?`, 'i');
        const match = frontmatter.match(regex);
        return match ? match[1].trim() : null;
    }

    findMatchingKeywords(content, filePath) {
        const allKeywords = {
            ...this.keywordStrategy.primary,
            ...this.keywordStrategy.secondary,
            ...this.keywordStrategy.longTail
        };
        
        const contentLower = content.toLowerCase();
        const pathLower = filePath.toLowerCase();
        const matched = [];
        
        for (const [keyword, data] of Object.entries(allKeywords)) {
            if (contentLower.includes(keyword.toLowerCase()) || 
                pathLower.includes(keyword.toLowerCase()) ||
                data.targetedArticles.some(article => pathLower.includes(article))) {
                matched.push(keyword);
            }
        }
        
        return matched;
    }

    calculateKeywordDensity(content, keywords) {
        if (keywords.length === 0) return 0;
        
        const wordCount = this.countWords(content);
        const contentLower = content.toLowerCase();
        
        let totalKeywordOccurrences = 0;
        keywords.forEach(keyword => {
            const occurrences = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
            totalKeywordOccurrences += occurrences;
        });
        
        return Math.round((totalKeywordOccurrences / wordCount) * 100 * 10) / 10;
    }

    getCollectionArticles(collectionPath) {
        const articles = [];
        
        try {
            const items = fs.readdirSync(collectionPath);
            for (const item of items) {
                const fullPath = path.join(collectionPath, item);
                if (fs.statSync(fullPath).isFile() && item.endsWith('.md')) {
                    articles.push(fullPath);
                }
            }
        } catch (error) {
            // Collection n'existe pas ou erreur de lecture
        }
        
        return articles;
    }

    analyzeCollectionKeywordCoverage(articles, collectionName) {
        const allKeywords = {
            ...this.keywordStrategy.primary,
            ...this.keywordStrategy.secondary,
            ...this.keywordStrategy.longTail
        };
        
        const coveredKeywords = [];
        
        for (const [keyword, data] of Object.entries(allKeywords)) {
            const isTargetedByCollection = articles.some(articlePath => {
                const content = fs.readFileSync(articlePath, 'utf-8');
                const relativePath = path.relative(this.contentDir, articlePath);
                return data.targetedArticles.some(target => relativePath.includes(target)) ||
                       content.toLowerCase().includes(keyword.toLowerCase());
            });
            
            if (isTargetedByCollection) {
                coveredKeywords.push(keyword);
            }
        }
        
        return coveredKeywords;
    }

    analyzeCollectionInternalLinking(articles) {
        let totalLinks = 0;
        let totalPossibleLinks = 0;
        
        articles.forEach(articlePath => {
            const content = fs.readFileSync(articlePath, 'utf-8');
            const internalLinks = (content.match(/\]\(\//g) || []).length;
            totalLinks += internalLinks;
            totalPossibleLinks += articles.length - 1; // Peut lier vers tous les autres articles
        });
        
        const percentage = totalPossibleLinks > 0 ? Math.round((totalLinks / totalPossibleLinks) * 100) : 0;
        
        return { totalLinks, percentage };
    }

    calculateKeywordCoverage() {
        const allKeywords = {
            ...this.keywordStrategy.primary,
            ...this.keywordStrategy.secondary,
            ...this.keywordStrategy.longTail
        };
        
        const totalKeywords = Object.keys(allKeywords).length;
        let coveredKeywords = 0;
        
        for (const [keyword, data] of Object.entries(allKeywords)) {
            const hasTargetedArticle = data.targetedArticles.some(target => {
                const targetPath = path.join(this.contentDir, target + '.md');
                return fs.existsSync(targetPath);
            });
            
            if (hasTargetedArticle) {
                coveredKeywords++;
            }
        }
        
        return coveredKeywords / totalKeywords;
    }

    // ANALYSE RÉCURSIVE DU CONTENU
    analyzeDirectory(dir) {
        const results = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Analyser la collection
                const collectionScore = this.scoreCollection(fullPath);
                this.results.collectionScores[item] = collectionScore;
                
                // Analyser récursivement
                results.push(...this.analyzeDirectory(fullPath));
            } else if (item.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const relativePath = path.relative(this.contentDir, fullPath);
                const articleScore = this.scoreArticle(relativePath, content);
                
                this.results.articleScores[relativePath] = articleScore;
                results.push(articleScore);
                
                // Détecter les problèmes de qualité
                const relevanceAnalysis = this.analyzeContentRelevance(content, relativePath);
                if (relevanceAnalysis.hasGenericContent || relevanceAnalysis.relevanceScore < 40) {
                    this.results.contentQualityIssues.push({
                        path: relativePath,
                        issues: relevanceAnalysis.issues,
                        score: relevanceAnalysis.relevanceScore
                    });
                }
            }
        }
        
        return results;
    }

    // GÉNÉRATION DES RECOMMANDATIONS
    generateRecommendations() {
        const recommendations = [];
        
        // Recommandations basées sur le score global
        const { globalScore } = this.calculateGlobalScore();
        this.results.globalScore = globalScore;
        
        if (globalScore < 60) {
            recommendations.push({
                priority: 'critical',
                category: 'global',
                title: 'Score SEO global faible',
                description: `Score actuel: ${globalScore}/100. Nécessite une action immédiate.`,
                actions: ['Audit approfondi de tous les articles', 'Refonte de la stratégie SEO', 'Optimisation technique prioritaire']
            });
        }
        
        // Recommandations pour le contenu générique/faible
        if (this.results.contentQualityIssues.length > 0) {
            const criticalIssues = this.results.contentQualityIssues.filter(issue => issue.score < 30);
            
            if (criticalIssues.length > 0) {
                recommendations.push({
                    priority: 'high',
                    category: 'content',
                    title: 'Contenu générique détecté',
                    description: `${criticalIssues.length} articles avec contenu générique ou très faible qualité`,
                    actions: ['Réécriture complète du contenu', 'Ajout d\'informations spécialisées', 'Suppression des placeholders'],
                    articles: criticalIssues.slice(0, 10).map(issue => issue.path)
                });
            }
        }
        
        // Recommandations pour les collections
        const weakCollections = Object.values(this.results.collectionScores)
            .filter(collection => collection.totalScore < 50)
            .sort((a, b) => a.totalScore - b.totalScore);
        
        if (weakCollections.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'collections',
                title: 'Collections sous-performantes',
                description: `${weakCollections.length} collections nécessitent une attention`,
                actions: ['Enrichissement du contenu', 'Amélioration du maillage interne', 'Optimisation des mots-clés'],
                collections: weakCollections.slice(0, 5).map(col => col.name)
            });
        }
        
        // Recommandations pour les mots-clés
        const keywordCoverage = this.calculateKeywordCoverage();
        if (keywordCoverage < 0.8) {
            recommendations.push({
                priority: 'medium',
                category: 'keywords',
                title: 'Couverture mots-clés incomplète',
                description: `${Math.round(keywordCoverage * 100)}% des mots-clés stratégiques couverts`,
                actions: ['Création d\'articles ciblés', 'Optimisation du contenu existant', 'Recherche de mots-clés supplémentaires']
            });
        }
        
        this.results.recommendations = recommendations;
        return recommendations;
    }

    // EXÉCUTION DE L'AUDIT COMPLET
    async runCompleteAudit() {
        console.log('🚀 AUDIT SEO STRATÉGIQUE MASTER');
        console.log('================================\n');
        
        console.log('📊 Analyse en cours...');
        
        // Analyser tout le contenu
        const articles = this.analyzeDirectory(this.contentDir);
        
        // Calculer les scores
        const { globalScore, scores } = this.calculateGlobalScore();
        
        // Générer les recommandations
        this.generateRecommendations();
        
        // Afficher les résultats
        this.displayResults();
        
        // Sauvegarder le rapport
        this.saveReport();
        
        return this.results;
    }

    // AFFICHAGE DES RÉSULTATS
    displayResults() {
        const { globalScore, scores } = this.calculateGlobalScore();
        
        console.log('\n📈 SCORES SEO GLOBAUX');
        console.log('======================');
        console.log(`🎯 Score SEO Global: ${globalScore}/100`);
        console.log(`📝 Qualité Contenu: ${scores.contentQuality}/100`);
        console.log(`⚙️  SEO Technique: ${scores.technicalSEO}/100`);
        console.log(`🔑 Stratégie Mots-clés: ${scores.keywordStrategy}/100`);
        console.log(`👥 Expérience Utilisateur: ${scores.userExperience}/100`);
        console.log(`🏆 Compétitivité: ${scores.competitiveness}/100`);
        
        // Top 5 meilleures collections
        const topCollections = Object.values(this.results.collectionScores)
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 5);
        
        console.log('\n🏆 TOP 5 COLLECTIONS');
        console.log('====================');
        topCollections.forEach((collection, index) => {
            console.log(`${index + 1}. ${collection.name}: ${collection.totalScore}/100 (${collection.articleCount} articles)`);
        });
        
        // Top 10 meilleurs articles
        const topArticles = Object.values(this.results.articleScores)
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);
        
        console.log('\n🎖️  TOP 10 ARTICLES');
        console.log('===================');
        topArticles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.path}: ${article.totalScore}/100`);
        });
        
        // Articles problématiques
        if (this.results.contentQualityIssues.length > 0) {
            console.log('\n🔴 ARTICLES PROBLÉMATIQUES');
            console.log('===========================');
            this.results.contentQualityIssues
                .sort((a, b) => a.score - b.score)
                .slice(0, 10)
                .forEach((issue, index) => {
                    console.log(`${index + 1}. ${issue.path}: ${issue.score}/100`);
                    issue.issues.forEach(problem => console.log(`   ⚠️  ${problem}`));
                });
        }
        
        // Recommandations prioritaires
        console.log('\n💡 RECOMMANDATIONS PRIORITAIRES');
        console.log('================================');
        this.results.recommendations
            .sort((a, b) => {
                const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            })
            .forEach((rec, index) => {
                const priorityIcon = rec.priority === 'critical' ? '🚨' : 
                                   rec.priority === 'high' ? '🔴' : 
                                   rec.priority === 'medium' ? '🟡' : '🟢';
                console.log(`${priorityIcon} ${rec.title}`);
                console.log(`   ${rec.description}`);
                if (rec.actions) {
                    rec.actions.forEach(action => console.log(`   • ${action}`));
                }
                console.log('');
            });
    }

    // SAUVEGARDE DU RAPPORT
    saveReport() {
        const report = {
            ...this.results,
            summary: {
                timestamp: this.results.timestamp,
                globalScore: this.results.globalScore,
                totalArticles: Object.keys(this.results.articleScores).length,
                totalCollections: Object.keys(this.results.collectionScores).length,
                criticalIssues: this.results.contentQualityIssues.filter(issue => issue.score < 30).length,
                topPerformers: Object.values(this.results.articleScores)
                    .filter(article => article.totalScore >= 80).length
            },
            keywordStrategy: this.keywordStrategy
        };
        
        fs.writeFileSync('./seo-strategy-master-report.json', JSON.stringify(report, null, 2));
        console.log('\n✅ Rapport sauvegardé: seo-strategy-master-report.json');
    }
}

// EXÉCUTION
if (import.meta.url === new URL(import.meta.resolve('./seo-strategy-master.mjs')).href) {
    const audit = new SEOStrategyMaster();
    audit.runCompleteAudit().catch(console.error);
}

export default SEOStrategyMaster;
