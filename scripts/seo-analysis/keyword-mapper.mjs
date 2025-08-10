// 🔍 KEYWORD MAPPER - Analyse et mapping automatique mots-clés ↔ pages
// Scan complet du contenu pour identifier les mots-clés et leur optimisation

import fs from 'fs';
import path from 'path';

export class KeywordMapper {
  constructor() {
    this.contentDir = 'src/content';
    this.pagesDir = 'src/pages';
    this.keywordMap = new Map();
    this.pageInventory = new Map();
    
    // Mots-clés prioritaires GLP1
    this.priorityKeywords = [
      // Prix et coût
      'ozempic prix', 'wegovy prix', 'saxenda prix', 'mounjaro prix',
      'glp-1 prix', 'glp1 prix', 'glp-1 cout', 'glp1 cout', 
      'medicament pour maigrir prix', 'injection pour maigrir prix', 
      'prix ozempic pharmacie', 'wegovy prix pharmacie',
      
      // Perte de poids
      'glp-1 perte de poids', 'glp1 perte de poids', 
      'ozempic perte de poids', 'wegovy perte de poids',
      'medicament pour maigrir', 'injection pour maigrir', 
      'traitement obesite', 'nouveau medicament obesite', 
      'medicament perdre du poids', 'perte de poids',
      
      // GLP-1 général
      'glp-1', 'glp1', 'glp 1',
      
      // Diabète
      'glp-1 diabete', 'glp1 diabete', 'ozempic diabete', 
      'traitement diabete type 2', 'medicament diabete', 'insuline glp-1',
      
      // Médicaments spécifiques
      'ozempic', 'wegovy', 'saxenda', 'mounjaro', 'trulicity',
      
      // Médecins et ordonnances
      'medecin glp-1', 'medecin glp1', 'ordonnance ozempic', 
      'prescription glp-1', 'endocrinologue glp-1', 'diabetologue glp-1',
      
      // Effets secondaires
      'ozempic effets secondaires', 'wegovy effets secondaires',
      'glp-1 effets secondaires', 'glp1 effets secondaires',
      'effets indesirables glp-1', 'effets indesirables glp1',
      
      // Alternatives
      'alternative ozempic', 'alternative wegovy', 'substitut glp-1',
      'autres medicaments perte de poids',
      
      // Questions fréquentes
      'comment obtenir ozempic', 'ou acheter glp-1', 'glp-1 sans ordonnance',
      'glp1 sans ordonnance', 'glp-1 remboursement', 'ozempic remboursement'
    ];
    
    this.seoPatterns = {
      title: /title:\s*["']([^"']+)["']/,
      description: /description:\s*["']([^"']+)["']/,
      h1: /^#\s+(.+)$/m,
      h2: /^##\s+(.+)$/gm,
      h3: /^###\s+(.+)$/gm
    };
  }

  // Fonction pour scanner récursivement les fichiers
  async scanDirectory(dir, extensions = ['.md', '.astro']) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️ Dossier non trouvé: ${dir}`);
      return files;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Récursion dans les sous-dossiers
        const subFiles = await this.scanDirectory(fullPath, extensions);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Vérifier l'extension
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }

  async scanContent() {
    console.log('🔍 Scan du contenu en cours...');
    
    try {
      // Scanner tous les fichiers de contenu
      const contentFiles = await this.scanDirectory(this.contentDir, ['.md']);
      const pageFiles = await this.scanDirectory(this.pagesDir, ['.astro']);
      
      console.log(`📄 ${contentFiles.length} fichiers de contenu trouvés`);
      console.log(`📄 ${pageFiles.length} pages trouvées`);
      
      // Analyser chaque fichier
      for (const file of [...contentFiles, ...pageFiles]) {
        await this.analyzeFile(file);
      }
      
      console.log('✅ Scan terminé !');
      return this.generateMapping();
    } catch (error) {
      console.error('❌ Erreur lors du scan:', error);
      throw error;
    }
  }

  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = this.extractFrontmatter(content);
      const body = this.extractBody(content);
      
      // Analyser les mots-clés présents
      const detectedKeywords = this.detectKeywords(frontmatter, body);
      
      // Analyser la structure SEO
      const seoAnalysis = this.analyzeSEO(frontmatter, body);
      
      // Calculer l'URL de la page
      const url = this.getURL(filePath);
      
      // Stocker dans l'inventaire
      const pageData = {
        filePath,
        url,
        title: frontmatter.title || 'Sans titre',
        description: frontmatter.description || '',
        keywords: detectedKeywords,
        seo: seoAnalysis,
        lastModified: fs.statSync(filePath).mtime,
        wordCount: body.split(/\s+/).length,
        readingTime: Math.ceil(body.split(/\s+/).length / 200)
      };
      
      this.pageInventory.set(filePath, pageData);
      
      // Mettre à jour la carte des mots-clés
      detectedKeywords.forEach(keywordData => {
        if (!this.keywordMap.has(keywordData.keyword)) {
          this.keywordMap.set(keywordData.keyword, {
            keyword: keywordData.keyword,
            pages: [],
            primaryPage: null,
            totalMentions: 0,
            averageScore: 0
          });
        }
        
        const keywordEntry = this.keywordMap.get(keywordData.keyword);
        keywordEntry.pages.push({
          url,
          filePath,
          title: frontmatter.title,
          score: keywordData.score,
          inTitle: keywordData.inTitle,
          inH1: keywordData.inH1,
          density: keywordData.density,
          prominence: keywordData.prominence
        });
        
        keywordEntry.totalMentions++;
        
        // Déterminer la page principale pour ce mot-clé
        if (!keywordEntry.primaryPage || keywordData.score > keywordEntry.primaryPage.score) {
          keywordEntry.primaryPage = {
            url,
            title: frontmatter.title,
            score: keywordData.score
          };
        }
      });
      
    } catch (error) {
      console.warn(`⚠️ Erreur analyse fichier ${filePath}:`, error.message);
    }
  }

  extractFrontmatter(content) {
    const frontmatterMatch = content.match(/^---\r?\n(.*?)\r?\n---/s);
    if (!frontmatterMatch) return {};
    
    try {
      const frontmatter = {};
      const lines = frontmatterMatch[1].split(/\r?\n/);
      
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          let value = match[2].trim();
          // Enlever les guillemets
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          frontmatter[match[1]] = value;
        }
      }
      
      return frontmatter;
    } catch (error) {
      console.warn('Erreur parsing frontmatter:', error);
      return {};
    }
  }

  extractBody(content) {
    // Enlever le frontmatter
    const bodyMatch = content.match(/^---\r?\n.*?\r?\n---\r?\n(.*)$/s);
    return bodyMatch ? bodyMatch[1] : content;
  }

  detectKeywords(frontmatter, body) {
    const detected = [];
    const fullText = ((frontmatter.title || '') + ' ' + (frontmatter.description || '') + ' ' + body).toLowerCase();
    const titleText = (frontmatter.title || '').toLowerCase();
    
    for (const keyword of this.priorityKeywords) {
      const keywordLower = keyword.toLowerCase();
      
      if (fullText.includes(keywordLower)) {
        const keywordData = {
          keyword,
          inTitle: titleText.includes(keywordLower),
          inH1: this.checkH1(body, keyword),
          inDescription: (frontmatter.description || '').toLowerCase().includes(keywordLower),
          density: this.calculateDensity(body, keyword),
          prominence: this.calculateProminence(body, keyword),
          firstMention: this.getFirstMention(body, keyword),
          totalMentions: this.countMentions(fullText, keyword)
        };
        
        // Calculer le score SEO pour ce mot-clé
        keywordData.score = this.calculateKeywordScore(keywordData);
        
        detected.push(keywordData);
      }
    }
    
    return detected.sort((a, b) => b.score - a.score);
  }

  checkH1(body, keyword) {
    const h1Match = body.match(/^#\s+(.+)$/m);
    if (!h1Match) return false;
    return h1Match[1].toLowerCase().includes(keyword.toLowerCase());
  }

  calculateDensity(body, keyword) {
    const words = body.toLowerCase().split(/\s+/).length;
    const mentions = this.countMentions(body.toLowerCase(), keyword);
    return words > 0 ? (mentions / words) * 100 : 0;
  }

  calculateProminence(body, keyword) {
    const firstMention = this.getFirstMention(body, keyword);
    const totalLength = body.length;
    
    if (firstMention === -1) return 0;
    
    // Plus le mot-clé apparaît tôt, meilleur le score (0-100)
    return Math.max(0, 100 - (firstMention / totalLength) * 100);
  }

  getFirstMention(body, keyword) {
    return body.toLowerCase().indexOf(keyword.toLowerCase());
  }

  countMentions(text, keyword) {
    const regex = new RegExp(keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    return (text.match(regex) || []).length;
  }

  calculateKeywordScore(keywordData) {
    let score = 0;
    
    // Présence dans le titre (40 points)
    if (keywordData.inTitle) score += 40;
    
    // Présence dans H1 (25 points)
    if (keywordData.inH1) score += 25;
    
    // Présence dans description (15 points)
    if (keywordData.inDescription) score += 15;
    
    // Densité optimale 1-3% (10 points)
    if (keywordData.density >= 1 && keywordData.density <= 3) {
      score += 10;
    } else if (keywordData.density > 0 && keywordData.density < 1) {
      score += 5; // Sous-optimisé
    }
    
    // Prominence (10 points) - plus c'est tôt, mieux c'est
    score += Math.min(10, keywordData.prominence / 10);
    
    return Math.round(score);
  }

  analyzeSEO(frontmatter, body) {
    const analysis = {
      title: this.analyzeTitleSEO(frontmatter.title),
      description: this.analyzeDescriptionSEO(frontmatter.description),
      headings: this.analyzeHeadings(body),
      content: this.analyzeContentSEO(body),
      overall: 0
    };
    
    // Calculer le score global
    const scores = Object.values(analysis).filter(item => typeof item.score === 'number');
    analysis.overall = scores.length > 0 
      ? Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length)
      : 0;
    
    return analysis;
  }

  analyzeTitleSEO(title) {
    if (!title) {
      return { score: 0, issues: ['Titre manquant'] };
    }
    
    const issues = [];
    let score = 100;
    
    if (title.length < 30) {
      issues.push('Titre trop court (<30 caractères)');
      score -= 25;
    }
    
    if (title.length > 60) {
      issues.push('Titre trop long (>60 caractères)');
      score -= 25;
    }
    
    if (!/^[A-ZÀ-Ÿ]/.test(title)) {
      issues.push('Titre ne commence pas par une majuscule');
      score -= 15;
    }
    
    return { score: Math.max(0, score), issues, length: title.length };
  }

  analyzeDescriptionSEO(description) {
    if (!description) {
      return { score: 0, issues: ['Meta description manquante'] };
    }
    
    const issues = [];
    let score = 100;
    
    if (description.length < 120) {
      issues.push('Meta description trop courte (<120 caractères)');
      score -= 25;
    }
    
    if (description.length > 160) {
      issues.push('Meta description trop longue (>160 caractères)');
      score -= 25;
    }
    
    // Vérifier présence d'un appel à l'action
    const ctas = ['découvr', 'appren', 'consult', 'contact', 'lire', 'voir'];
    if (!ctas.some(cta => description.toLowerCase().includes(cta))) {
      issues.push('Pas d\'appel à l\'action dans la description');
      score -= 20;
    }
    
    return { score: Math.max(0, score), issues, length: description.length };
  }

  analyzeHeadings(body) {
    const h1s = (body.match(/^#\s+(.+)$/gm) || []);
    const h2s = (body.match(/^##\s+(.+)$/gm) || []);
    const h3s = (body.match(/^###\s+(.+)$/gm) || []);
    
    const issues = [];
    let score = 100;
    
    if (h1s.length === 0) {
      issues.push('Aucun H1 trouvé');
      score -= 40;
    } else if (h1s.length > 1) {
      issues.push('Plusieurs H1 détectés');
      score -= 20;
    }
    
    if (h2s.length === 0) {
      issues.push('Aucun H2 trouvé');
      score -= 20;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      h1Count: h1s.length,
      h2Count: h2s.length,
      h3Count: h3s.length
    };
  }

  analyzeContentSEO(body) {
    const wordCount = body.split(/\s+/).length;
    const issues = [];
    let score = 100;
    
    if (wordCount < 300) {
      issues.push('Contenu trop court (<300 mots)');
      score -= 30;
    } else if (wordCount < 500) {
      issues.push('Contenu court (<500 mots)');
      score -= 15;
    }
    
    // Vérifier présence de liens
    const internalLinks = (body.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    const externalLinks = (body.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;
    
    if (internalLinks === 0) {
      issues.push('Aucun lien interne');
      score -= 20;
    }
    
    if (internalLinks < 3) {
      issues.push('Peu de liens internes (<3)');
      score -= 10;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      wordCount,
      internalLinks,
      externalLinks,
      readingTime: Math.ceil(wordCount / 200)
    };
  }

  getURL(filePath) {
    // Convertir le chemin de fichier en URL
    if (filePath.includes('src/content/')) {
      return filePath
        .replace(/.*src\/content\//, '/')
        .replace(/\.md$/, '/')
        .replace(/\/index\/$/, '/');
    } else if (filePath.includes('src/pages/')) {
      return filePath
        .replace(/.*src\/pages\//, '/')
        .replace(/\.astro$/, '/')
        .replace(/\/index\/$/, '/');
    }
    return filePath;
  }

  generateMapping() {
    const timestamp = new Date().toISOString();
    
    // Convertir les Maps en objets pour JSON
    const keywordsObj = {};
    this.keywordMap.forEach((data, keyword) => {
      keywordsObj[keyword] = {
        ...data,
        averageScore: data.pages.length > 0 
          ? Math.round(data.pages.reduce((sum, page) => sum + page.score, 0) / data.pages.length)
          : 0
      };
    });
    
    const pagesObj = {};
    this.pageInventory.forEach((data, filePath) => {
      pagesObj[data.url] = data;
    });
    
    const mapping = {
      timestamp,
      summary: {
        totalPages: this.pageInventory.size,
        totalKeywords: this.keywordMap.size,
        averageKeywordsPerPage: this.pageInventory.size > 0 
          ? Math.round(Array.from(this.pageInventory.values()).reduce((sum, page) => sum + page.keywords.length, 0) / this.pageInventory.size)
          : 0,
        topKeywords: this.getTopKeywords(5),
        lowScorePages: this.getLowScorePages(60)
      },
      keywords: keywordsObj,
      pages: pagesObj
    };
    
    return mapping;
  }

  getTopKeywords(limit = 5) {
    return Array.from(this.keywordMap.values())
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .slice(0, limit)
      .map(kw => ({
        keyword: kw.keyword,
        mentions: kw.totalMentions,
        pages: kw.pages.length,
        bestScore: Math.max(...kw.pages.map(p => p.score))
      }));
  }

  getLowScorePages(threshold = 60) {
    return Array.from(this.pageInventory.values())
      .filter(page => page.seo.overall < threshold)
      .sort((a, b) => a.seo.overall - b.seo.overall)
      .slice(0, 10)
      .map(page => ({
        url: page.url,
        title: page.title,
        score: page.seo.overall,
        mainIssues: this.getMainIssues(page.seo)
      }));
  }

  getMainIssues(seoAnalysis) {
    const allIssues = [];
    Object.values(seoAnalysis).forEach(analysis => {
      if (analysis.issues && Array.isArray(analysis.issues)) {
        allIssues.push(...analysis.issues);
      }
    });
    return allIssues.slice(0, 3);
  }

  async generateReport() {
    console.log('📊 Génération du rapport...');
    
    const mapping = this.generateMapping();
    
    // Créer le dossier de rapport s'il n'existe pas
    const reportDir = 'seo-analysis';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Sauvegarder le rapport
    const reportPath = path.join(reportDir, 'keyword-mapping-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(mapping, null, 2));
    
    console.log(`✅ Rapport sauvegardé : ${reportPath}`);
    
    // Générer un résumé texte
    this.generateTextSummary(mapping);
    
    return mapping;
  }

  generateTextSummary(mapping) {
    const summary = `
# 📊 RAPPORT MAPPING MOTS-CLÉS - ${new Date(mapping.timestamp).toLocaleDateString('fr-FR')}

## 📈 RÉSUMÉ GLOBAL
- **Pages analysées :** ${mapping.summary.totalPages}
- **Mots-clés détectés :** ${mapping.summary.totalKeywords}
- **Moyenne mots-clés/page :** ${mapping.summary.averageKeywordsPerPage}

## 🏆 TOP MOTS-CLÉS
${mapping.summary.topKeywords.map(kw => 
  `- **${kw.keyword}** : ${kw.mentions} mentions, ${kw.pages} pages, meilleur score ${kw.bestScore}/100`
).join('\n')}

## ⚠️ PAGES À OPTIMISER (Score < 60)
${mapping.summary.lowScorePages.map(page => 
  `- **${page.title}** (${page.score}/100) : ${page.mainIssues.join(', ')}`
).join('\n')}

## 🎯 RECOMMANDATIONS PRIORITAIRES

### Optimisation Immédiate
${mapping.summary.lowScorePages.slice(0, 3).map(page => 
  `1. **${page.title}** - Score ${page.score}/100
   - URL: ${page.url}
   - Actions: Optimiser title, meta description, structure H1-H2`
).join('\n')}

### Opportunités Mots-clés
${Object.entries(mapping.keywords)
  .filter(([_, data]) => data.averageScore < 50)
  .slice(0, 5)
  .map(([keyword, data]) => 
    `- **${keyword}** : Score moyen ${data.averageScore}/100 sur ${data.pages.length} page(s)`
  ).join('\n')}
`;

    fs.writeFileSync('seo-analysis/keyword-mapping-summary.md', summary);
    console.log('✅ Résumé généré : seo-analysis/keyword-mapping-summary.md');
  }
}

// Script exécutable
if (import.meta.url === `file://${process.argv[1]}`) {
  const mapper = new KeywordMapper();
  mapper.scanContent()
    .then(mapping => {
      console.log('🎉 Mapping terminé !');
      return mapper.generateReport();
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}
