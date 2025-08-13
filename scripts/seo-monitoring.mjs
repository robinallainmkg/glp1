import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

// Script de monitoring SEO complet
class SEOMonitor {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            totalArticles: 0,
            seoMetrics: {
                titlesOptimized: 0,
                metaDescriptionsPresent: 0,
                keywordsPresent: 0,
                internalLinksCount: 0,
                contentQuality: {
                    shortArticles: 0,
                    mediumArticles: 0,
                    longArticles: 0
                }
            },
            technicalSEO: {
                structuredContent: 0,
                headingHierarchy: 0,
                imageOptimization: 0
            },
            contentAnalysis: {
                readabilityScore: 0,
                keywordDensity: {},
                topicCoverage: {}
            },
            recommendations: []
        };
    }

    // Analyser un article individuel
    analyzeArticle(filePath, content) {
        const analysis = {
            path: filePath,
            wordCount: this.countWords(content),
            seoScore: 0,
            issues: [],
            strengths: []
        };

        // Extraire le frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
        const articleContent = content.replace(/^---[\s\S]*?---/, '');

        // Analyser les métadonnées
        this.analyzeFrontmatter(frontmatter, analysis);
        
        // Analyser le contenu
        this.analyzeContent(articleContent, analysis);
        
        // Analyser la structure
        this.analyzeStructure(articleContent, analysis);
        
        // Calculer le score SEO
        analysis.seoScore = this.calculateSEOScore(analysis);
        
        return analysis;
    }

    // Analyser le frontmatter
    analyzeFrontmatter(frontmatter, analysis) {
        const title = this.extractField(frontmatter, 'title');
        const metaTitle = this.extractField(frontmatter, 'metaTitle');
        const metaDescription = this.extractField(frontmatter, 'metaDescription');
        const keywords = this.extractField(frontmatter, 'keywords');

        // Titre
        if (title) {
            if (title.length >= 50 && title.length <= 60) {
                analysis.strengths.push('Titre optimisé (50-60 caractères)');
                this.results.seoMetrics.titlesOptimized++;
            } else if (title.length < 30) {
                analysis.issues.push('Titre trop court (< 30 caractères)');
            } else if (title.length > 70) {
                analysis.issues.push('Titre trop long (> 70 caractères)');
            }
        } else {
            analysis.issues.push('Titre manquant');
        }

        // Meta title
        if (metaTitle && metaTitle.length >= 50 && metaTitle.length <= 60) {
            analysis.strengths.push('Meta title optimisé');
        }

        // Meta description
        if (metaDescription) {
            this.results.seoMetrics.metaDescriptionsPresent++;
            if (metaDescription.length >= 150 && metaDescription.length <= 160) {
                analysis.strengths.push('Meta description optimisée (150-160 caractères)');
            } else if (metaDescription.length < 120) {
                analysis.issues.push('Meta description trop courte (< 120 caractères)');
            } else if (metaDescription.length > 170) {
                analysis.issues.push('Meta description trop longue (> 170 caractères)');
            }
        } else {
            analysis.issues.push('Meta description manquante');
        }

        // Mots-clés
        if (keywords) {
            this.results.seoMetrics.keywordsPresent++;
            const keywordList = keywords.split(',').map(k => k.trim());
            if (keywordList.length >= 3 && keywordList.length <= 8) {
                analysis.strengths.push(`Mots-clés bien définis (${keywordList.length})`);
            } else if (keywordList.length < 3) {
                analysis.issues.push('Pas assez de mots-clés (< 3)');
            } else {
                analysis.issues.push('Trop de mots-clés (> 8)');
            }
        } else {
            analysis.issues.push('Mots-clés manquants');
        }
    }

    // Analyser le contenu
    analyzeContent(content, analysis) {
        // Compter les liens internes
        const internalLinks = (content.match(/\]\(\/[^)]+\)/g) || []).length;
        this.results.seoMetrics.internalLinksCount += internalLinks;
        
        if (internalLinks >= 3) {
            analysis.strengths.push(`Bon maillage interne (${internalLinks} liens)`);
        } else if (internalLinks === 0) {
            analysis.issues.push('Aucun lien interne');
        } else {
            analysis.issues.push(`Maillage interne insuffisant (${internalLinks} liens)`);
        }

        // Analyser la qualité du contenu
        if (analysis.wordCount >= 1000) {
            analysis.strengths.push('Contenu long et détaillé');
            this.results.seoMetrics.contentQuality.longArticles++;
        } else if (analysis.wordCount >= 500) {
            analysis.strengths.push('Contenu de longueur correcte');
            this.results.seoMetrics.contentQuality.mediumArticles++;
        } else {
            analysis.issues.push('Contenu trop court (< 500 mots)');
            this.results.seoMetrics.contentQuality.shortArticles++;
        }

        // Vérifier la présence d'images
        const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
        if (images > 0) {
            analysis.strengths.push(`${images} image(s) présente(s)`);
        } else {
            analysis.issues.push('Aucune image');
        }
    }

    // Analyser la structure
    analyzeStructure(content, analysis) {
        // Compter les titres H2 et H3
        const h2Count = (content.match(/^## /gm) || []).length;
        const h3Count = (content.match(/^### /gm) || []).length;
        
        if (h2Count >= 3) {
            analysis.strengths.push(`Bonne structure (${h2Count} sections H2)`);
            this.results.technicalSEO.structuredContent++;
        } else if (h2Count === 0) {
            analysis.issues.push('Aucun titre H2');
        } else {
            analysis.issues.push(`Structure insuffisante (${h2Count} sections H2)`);
        }

        // Vérifier la hiérarchie des titres
        const headings = content.match(/^#{1,6} .+$/gm) || [];
        let hierarchyCorrect = true;
        let previousLevel = 1;
        
        for (const heading of headings) {
            const level = heading.match(/^#+/)[0].length;
            if (level > previousLevel + 1) {
                hierarchyCorrect = false;
                break;
            }
            previousLevel = level;
        }
        
        if (hierarchyCorrect) {
            analysis.strengths.push('Hiérarchie des titres correcte');
            this.results.technicalSEO.headingHierarchy++;
        } else {
            analysis.issues.push('Hiérarchie des titres incorrecte');
        }

        // Vérifier les listes et formatage
        const lists = (content.match(/^[\-\*\+] /gm) || []).length;
        const numberedLists = (content.match(/^\d+\. /gm) || []).length;
        const boldText = (content.match(/\*\*(.*?)\*\*/g) || []).length;
        
        if (lists + numberedLists >= 3) {
            analysis.strengths.push('Bon usage des listes');
        }
        
        if (boldText >= 5) {
            analysis.strengths.push('Bon formatage (texte en gras)');
        }
    }

    // Calculer le score SEO
    calculateSEOScore(analysis) {
        let score = 0;
        const maxScore = 100;
        
        // Points pour les forces (max 80 points)
        score += Math.min(analysis.strengths.length * 8, 80);
        
        // Pénalités pour les problèmes (max -50 points)
        score -= Math.min(analysis.issues.length * 5, 50);
        
        // Bonus pour les articles longs
        if (analysis.wordCount >= 1000) score += 10;
        else if (analysis.wordCount >= 700) score += 5;
        
        return Math.max(0, Math.min(maxScore, score));
    }

    // Extraire un champ du frontmatter
    extractField(frontmatter, fieldName) {
        const regex = new RegExp(`${fieldName}:\\s*["']?([^"'\\n]+)["']?`, 'i');
        const match = frontmatter.match(regex);
        return match ? match[1].trim() : null;
    }

    // Compter les mots
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

    // Analyser récursivement un dossier
    analyzeDirectory(dir) {
        const articles = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                articles.push(...this.analyzeDirectory(fullPath));
            } else if (item.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const relativePath = path.relative(CONTENT_DIR, fullPath);
                const analysis = this.analyzeArticle(relativePath, content);
                articles.push(analysis);
            }
        }
        
        return articles;
    }

    // Générer des recommandations
    generateRecommendations(articles) {
        const recommendations = [];
        
        // Articles avec score faible
        const lowScoreArticles = articles.filter(a => a.seoScore < 50);
        if (lowScoreArticles.length > 0) {
            recommendations.push({
                priority: 'high',
                type: 'optimization',
                title: 'Articles à optimiser en priorité',
                description: `${lowScoreArticles.length} articles ont un score SEO < 50`,
                articles: lowScoreArticles.slice(0, 10).map(a => a.path)
            });
        }

        // Articles sans liens internes
        const noLinksArticles = articles.filter(a => 
            a.issues.some(issue => issue.includes('Aucun lien interne'))
        );
        if (noLinksArticles.length > 0) {
            recommendations.push({
                priority: 'medium',
                type: 'internal-linking',
                title: 'Améliorer le maillage interne',
                description: `${noLinksArticles.length} articles sans liens internes`,
                articles: noLinksArticles.slice(0, 5).map(a => a.path)
            });
        }

        // Articles sans images
        const noImagesArticles = articles.filter(a => 
            a.issues.some(issue => issue.includes('Aucune image'))
        );
        if (noImagesArticles.length > 0) {
            recommendations.push({
                priority: 'low',
                type: 'content-enhancement',
                title: 'Ajouter des images',
                description: `${noImagesArticles.length} articles sans images`,
                articles: noImagesArticles.slice(0, 5).map(a => a.path)
            });
        }

        return recommendations;
    }

    // Exécuter l'analyse complète
    async run() {
        console.log('🔍 Monitoring SEO en cours...\n');
        
        const articles = this.analyzeDirectory(CONTENT_DIR);
        this.results.totalArticles = articles.length;
        
        // Calculer les statistiques globales
        const totalScore = articles.reduce((sum, article) => sum + article.seoScore, 0);
        const averageScore = Math.round(totalScore / articles.length);
        
        // Générer les recommandations
        this.results.recommendations = this.generateRecommendations(articles);
        
        // Rapport détaillé
        console.log('📊 RAPPORT DE MONITORING SEO');
        console.log('=' .repeat(50));
        console.log(`Total d'articles analysés: ${this.results.totalArticles}`);
        console.log(`Score SEO moyen: ${averageScore}/100`);
        console.log(`Articles avec métadonnées complètes: ${this.results.seoMetrics.metaDescriptionsPresent}`);
        console.log(`Total de liens internes: ${this.results.seoMetrics.internalLinksCount}`);
        
        console.log('\n📈 DISTRIBUTION DE LA QUALITÉ DU CONTENU:');
        console.log(`Articles longs (1000+ mots): ${this.results.seoMetrics.contentQuality.longArticles}`);
        console.log(`Articles moyens (500-999 mots): ${this.results.seoMetrics.contentQuality.mediumArticles}`);
        console.log(`Articles courts (<500 mots): ${this.results.seoMetrics.contentQuality.shortArticles}`);
        
        // Top 10 meilleurs articles
        const topArticles = articles
            .sort((a, b) => b.seoScore - a.seoScore)
            .slice(0, 10);
        
        console.log('\n🏆 TOP 10 ARTICLES SEO:');
        topArticles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.path} - Score: ${article.seoScore}/100`);
        });
        
        // Articles à améliorer
        const worstArticles = articles
            .sort((a, b) => a.seoScore - b.seoScore)
            .slice(0, 10);
        
        console.log('\n⚠️  ARTICLES À AMÉLIORER EN PRIORITÉ:');
        worstArticles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.path} - Score: ${article.seoScore}/100`);
            if (article.issues.length > 0) {
                console.log(`   Issues: ${article.issues.slice(0, 3).join(', ')}`);
            }
        });
        
        // Recommandations
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 RECOMMANDATIONS:');
            this.results.recommendations.forEach((rec, index) => {
                const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
                console.log(`${priority} ${rec.title}`);
                console.log(`   ${rec.description}`);
            });
        }
        
        // Évolution dans le temps
        this.compareWithPrevious();
        
        // Sauvegarder le rapport
        const fullReport = {
            ...this.results,
            articles: articles,
            summary: {
                averageScore,
                totalScore,
                topArticles: topArticles.slice(0, 5),
                worstArticles: worstArticles.slice(0, 5)
            }
        };
        
        fs.writeFileSync('./seo-monitoring-report.json', JSON.stringify(fullReport, null, 2));
        console.log('\n✅ Rapport de monitoring sauvegardé dans seo-monitoring-report.json');
        
        return fullReport;
    }

    // Comparer avec le monitoring précédent
    compareWithPrevious() {
        try {
            const previousReport = JSON.parse(fs.readFileSync('./seo-monitoring-report.json', 'utf-8'));
            const currentAverage = Math.round(this.results.totalArticles > 0 ? 
                (this.results.seoMetrics.titlesOptimized + this.results.seoMetrics.metaDescriptionsPresent) / this.results.totalArticles * 100 : 0);
            const previousAverage = Math.round(previousReport.totalArticles > 0 ? 
                (previousReport.seoMetrics.titlesOptimized + previousReport.seoMetrics.metaDescriptionsPresent) / previousReport.totalArticles * 100 : 0);
            
            console.log('\n📊 ÉVOLUTION DEPUIS LE DERNIER MONITORING:');
            const evolution = currentAverage - previousAverage;
            if (evolution > 0) {
                console.log(`📈 Amélioration: +${evolution}% en qualité SEO`);
            } else if (evolution < 0) {
                console.log(`📉 Dégradation: ${evolution}% en qualité SEO`);
            } else {
                console.log(`➡️  Stable: aucun changement significatif`);
            }
            
            const linksEvolution = this.results.seoMetrics.internalLinksCount - (previousReport.seoMetrics.internalLinksCount || 0);
            if (linksEvolution !== 0) {
                console.log(`🔗 Liens internes: ${linksEvolution > 0 ? '+' : ''}${linksEvolution}`);
            }
            
        } catch (error) {
            console.log('\n📊 Premier monitoring - aucune comparaison disponible');
        }
    }
}

// Exécution
const monitor = new SEOMonitor();
monitor.run().catch(console.error);
