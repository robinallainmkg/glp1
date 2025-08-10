// 🚀 VERSION FINALE - Analyse SEO Complète GLP1-France
import fs from 'fs';
import path from 'path';

console.log('🚀 === ANALYSE SEO COMPLÈTE - GLP1 FRANCE ===');
console.log(`⏰ Démarrage : ${new Date().toLocaleString('fr-FR')}`);
console.log('');

// Configuration
const CONFIG = {
  maxFiles: 50, // Limiter pour éviter les timeouts
  reportDir: 'seo-analysis',
  priorityKeywords: [
    // Prix et coût
    'ozempic prix', 'wegovy prix', 'saxenda prix', 'mounjaro prix',
    'glp-1 prix', 'glp1 prix', 'medicament pour maigrir prix',
    
    // Perte de poids
    'glp-1 perte de poids', 'glp1 perte de poids', 'perte de poids',
    'medicament pour maigrir', 'injection pour maigrir',
    
    // GLP-1 général
    'glp-1', 'glp1', 'ozempic', 'wegovy', 'saxenda', 'mounjaro',
    
    // Diabète
    'glp-1 diabete', 'glp1 diabete', 'diabete type 2',
    
    // Médecins
    'medecin glp-1', 'endocrinologue', 'prescription'
  ]
};

class SEOAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      pages: [],
      keywords: {},
      summary: {
        totalPages: 0,
        totalKeywords: 0,
        averageScore: 0,
        topIssues: []
      }
    };
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(CONFIG.reportDir)) {
      fs.mkdirSync(CONFIG.reportDir, { recursive: true });
    }
  }

  extractFrontmatter(content) {
    const frontmatterMatch = content.match(/^---\r?\n(.*?)\r?\n---/s);
    if (!frontmatterMatch) return {};
    
    const frontmatter = {};
    const lines = frontmatterMatch[1].split(/\r?\n/);
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        frontmatter[match[1]] = value;
      }
    }
    
    return frontmatter;
  }

  extractBody(content) {
    const bodyMatch = content.match(/^---\r?\n.*?\r?\n---\r?\n(.*)$/s);
    return bodyMatch ? bodyMatch[1] : content;
  }

  detectKeywords(frontmatter, body) {
    const detected = [];
    const fullText = ((frontmatter.title || '') + ' ' + 
                      (frontmatter.description || frontmatter.metaDescription || '') + 
                      ' ' + body).toLowerCase();
    
    for (const keyword of CONFIG.priorityKeywords) {
      if (fullText.includes(keyword.toLowerCase())) {
        const mentions = (fullText.match(new RegExp(keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        
        detected.push({
          keyword,
          inTitle: (frontmatter.title || '').toLowerCase().includes(keyword.toLowerCase()),
          inDescription: ((frontmatter.description || frontmatter.metaDescription || '')).toLowerCase().includes(keyword.toLowerCase()),
          mentions,
          score: this.calculateKeywordScore(keyword, frontmatter, body, fullText)
        });
      }
    }
    
    return detected.sort((a, b) => b.score - a.score);
  }

  calculateKeywordScore(keyword, frontmatter, body, fullText) {
    let score = 0;
    const keywordLower = keyword.toLowerCase();
    
    // Présence dans le titre (40 points)
    if ((frontmatter.title || '').toLowerCase().includes(keywordLower)) {
      score += 40;
    }
    
    // Présence dans la description (20 points)
    if (((frontmatter.description || frontmatter.metaDescription || '')).toLowerCase().includes(keywordLower)) {
      score += 20;
    }
    
    // Présence dans le H1 (20 points)
    const h1Match = body.match(/^#\s+(.+)$/m);
    if (h1Match && h1Match[1].toLowerCase().includes(keywordLower)) {
      score += 20;
    }
    
    // Densité (20 points max)
    const wordCount = body.split(/\s+/).length;
    const mentions = (fullText.match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const density = wordCount > 0 ? (mentions / wordCount) * 100 : 0;
    
    if (density >= 1 && density <= 3) {
      score += 20;
    } else if (density > 0 && density < 1) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  analyzeContent(frontmatter, body) {
    const issues = [];
    let score = 100;
    
    // Titre
    const title = frontmatter.title || '';
    if (!title) {
      issues.push('Titre manquant');
      score -= 30;
    } else if (title.length < 30) {
      issues.push('Titre trop court');
      score -= 20;
    } else if (title.length > 60) {
      issues.push('Titre trop long');
      score -= 15;
    }
    
    // Description
    const desc = frontmatter.description || frontmatter.metaDescription || '';
    if (!desc) {
      issues.push('Meta description manquante');
      score -= 25;
    } else if (desc.length < 120) {
      issues.push('Meta description trop courte');
      score -= 15;
    } else if (desc.length > 160) {
      issues.push('Meta description trop longue');
      score -= 10;
    }
    
    // Contenu
    const wordCount = body.split(/\s+/).length;
    if (wordCount < 300) {
      issues.push('Contenu trop court');
      score -= 20;
    }
    
    // Headings
    const h1Count = (body.match(/^#\s+/gm) || []).length;
    const h2Count = (body.match(/^##\s+/gm) || []).length;
    
    if (h1Count === 0) {
      issues.push('Aucun H1');
      score -= 15;
    } else if (h1Count > 1) {
      issues.push('Plusieurs H1');
      score -= 10;
    }
    
    if (h2Count === 0) {
      issues.push('Aucun H2');
      score -= 10;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      wordCount,
      h1Count,
      h2Count
    };
  }

  scanDirectory(dir, extensions = ['.md', '.astro']) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...this.scanDirectory(fullPath, extensions));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
      
      // Limite pour éviter les timeouts
      if (files.length >= CONFIG.maxFiles) break;
    }
    
    return files;
  }

  analyzeFile(filePath) {
    try {
      console.log(`   📄 ${path.basename(filePath)}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = this.extractFrontmatter(content);
      const body = this.extractBody(content);
      
      const keywords = this.detectKeywords(frontmatter, body);
      const contentAnalysis = this.analyzeContent(frontmatter, body);
      
      const url = this.getURL(filePath);
      
      const pageData = {
        filePath,
        url,
        title: frontmatter.title || 'Sans titre',
        description: frontmatter.description || frontmatter.metaDescription || '',
        keywords,
        content: contentAnalysis,
        overallScore: Math.round((contentAnalysis.score + (keywords[0]?.score || 0)) / 2),
        lastModified: fs.statSync(filePath).mtime
      };
      
      // Mettre à jour les statistiques globales
      keywords.forEach(kw => {
        if (!this.results.keywords[kw.keyword]) {
          this.results.keywords[kw.keyword] = {
            keyword: kw.keyword,
            pages: [],
            totalMentions: 0,
            averageScore: 0
          };
        }
        
        this.results.keywords[kw.keyword].pages.push({
          url,
          title: pageData.title,
          score: kw.score,
          mentions: kw.mentions
        });
        
        this.results.keywords[kw.keyword].totalMentions += kw.mentions;
      });
      
      this.results.pages.push(pageData);
      
    } catch (error) {
      console.warn(`   ⚠️ Erreur ${path.basename(filePath)}: ${error.message}`);
    }
  }

  getURL(filePath) {
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

  async run() {
    console.log('📍 ÉTAPE 1/3 : Scan des fichiers');
    console.log('─'.repeat(40));
    
    const contentFiles = this.scanDirectory('src/content', ['.md']);
    const pageFiles = this.scanDirectory('src/pages', ['.astro']);
    const allFiles = [...contentFiles, ...pageFiles].slice(0, CONFIG.maxFiles);
    
    console.log(`📄 ${allFiles.length} fichiers à analyser`);
    console.log('');
    
    console.log('📍 ÉTAPE 2/3 : Analyse du contenu');
    console.log('─'.repeat(40));
    
    for (const file of allFiles) {
      this.analyzeFile(file);
    }
    
    console.log('');
    console.log('📍 ÉTAPE 3/3 : Génération du rapport');
    console.log('─'.repeat(40));
    
    this.generateSummary();
    this.saveReport();
    this.generateDashboard();
    
    console.log('');
    console.log('✅ Analyse terminée !');
    this.displayResults();
  }

  generateSummary() {
    this.results.summary.totalPages = this.results.pages.length;
    this.results.summary.totalKeywords = Object.keys(this.results.keywords).length;
    
    if (this.results.pages.length > 0) {
      this.results.summary.averageScore = Math.round(
        this.results.pages.reduce((sum, page) => sum + page.overallScore, 0) / this.results.pages.length
      );
    }
    
    // Calculer score moyen par mot-clé
    Object.values(this.results.keywords).forEach(kwData => {
      if (kwData.pages.length > 0) {
        kwData.averageScore = Math.round(
          kwData.pages.reduce((sum, page) => sum + page.score, 0) / kwData.pages.length
        );
      }
    });
    
    // Top problèmes
    const allIssues = {};
    this.results.pages.forEach(page => {
      page.content.issues.forEach(issue => {
        allIssues[issue] = (allIssues[issue] || 0) + 1;
      });
    });
    
    this.results.summary.topIssues = Object.entries(allIssues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }

  saveReport() {
    const reportPath = path.join(CONFIG.reportDir, 'seo-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`   📊 Rapport sauvegardé : ${reportPath}`);
  }

  generateDashboard() {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard SEO - GLP1 France</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; background: #f8fafc; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .metric { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
        .metric-label { color: #64748b; font-size: 0.9rem; }
        .section { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .table th { background: #f8fafc; font-weight: 600; }
        .score { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; font-weight: 600; }
        .score-excellent { background: #dcfce7; color: #166534; }
        .score-good { background: #dbeafe; color: #1d4ed8; }
        .score-warning { background: #fed7aa; color: #c2410c; }
        .score-poor { background: #fecaca; color: #dc2626; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Dashboard SEO - GLP1 France</h1>
        <p>Analyse générée le ${new Date(this.results.timestamp).toLocaleDateString('fr-FR')}</p>
    </div>

    <div class="container">
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${this.results.summary.totalPages}</div>
                <div class="metric-label">Pages analysées</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.summary.totalKeywords}</div>
                <div class="metric-label">Mots-clés détectés</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.summary.averageScore}/100</div>
                <div class="metric-label">Score moyen</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.pages.filter(p => p.overallScore >= 80).length}</div>
                <div class="metric-label">Pages excellentes</div>
            </div>
        </div>

        <div class="section">
            <h2>🎯 Top Mots-clés</h2>
            <table class="table">
                <thead>
                    <tr><th>Mot-clé</th><th>Score moyen</th><th>Pages</th><th>Mentions</th></tr>
                </thead>
                <tbody>
                    ${Object.values(this.results.keywords)
                      .sort((a, b) => b.averageScore - a.averageScore)
                      .slice(0, 10)
                      .map(kw => `
                        <tr>
                            <td><strong>${kw.keyword}</strong></td>
                            <td><span class="score ${this.getScoreClass(kw.averageScore)}">${kw.averageScore}/100</span></td>
                            <td>${kw.pages.length}</td>
                            <td>${kw.totalMentions}</td>
                        </tr>
                      `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>📄 Pages à Optimiser</h2>
            <table class="table">
                <thead>
                    <tr><th>Page</th><th>Score</th><th>Mots-clés</th><th>Problèmes</th></tr>
                </thead>
                <tbody>
                    ${this.results.pages
                      .sort((a, b) => a.overallScore - b.overallScore)
                      .slice(0, 10)
                      .map(page => `
                        <tr>
                            <td>
                                <strong>${page.title}</strong><br>
                                <small style="color: #64748b;">${page.url}</small>
                            </td>
                            <td><span class="score ${this.getScoreClass(page.overallScore)}">${page.overallScore}/100</span></td>
                            <td>${page.keywords.length}</td>
                            <td>${page.content.issues.length}</td>
                        </tr>
                      `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🚨 Problèmes Récurrents</h2>
            <ul>
                ${this.results.summary.topIssues.map(issue => `
                    <li><strong>${issue.issue}</strong> : ${issue.count} pages concernées</li>
                `).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;

    const dashboardPath = path.join(CONFIG.reportDir, 'dashboard.html');
    fs.writeFileSync(dashboardPath, html);
    console.log(`   📊 Dashboard généré : ${dashboardPath}`);
  }

  getScoreClass(score) {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-warning';
    return 'score-poor';
  }

  displayResults() {
    console.log('📊 === RÉSULTATS ===');
    console.log(`📄 Pages analysées : ${this.results.summary.totalPages}`);
    console.log(`🔍 Mots-clés détectés : ${this.results.summary.totalKeywords}`);
    console.log(`📈 Score moyen : ${this.results.summary.averageScore}/100`);
    
    const excellentPages = this.results.pages.filter(p => p.overallScore >= 80).length;
    const poorPages = this.results.pages.filter(p => p.overallScore < 50).length;
    
    console.log(`✅ Pages excellentes (≥80) : ${excellentPages}`);
    console.log(`⚠️ Pages à améliorer (<50) : ${poorPages}`);
    
    console.log('\n🏆 TOP 3 MOTS-CLÉS :');
    Object.values(this.results.keywords)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3)
      .forEach((kw, i) => {
        console.log(`   ${i + 1}. ${kw.keyword} : ${kw.averageScore}/100 (${kw.pages.length} pages)`);
      });
    
    console.log('\n📂 FICHIERS GÉNÉRÉS :');
    console.log(`   📊 Dashboard : ${CONFIG.reportDir}/dashboard.html`);
    console.log(`   📄 Rapport JSON : ${CONFIG.reportDir}/seo-analysis-report.json`);
    console.log('\n🚀 Ouvrez le dashboard dans votre navigateur !');
  }
}

// Exécution
const analyzer = new SEOAnalyzer();
analyzer.run().catch(console.error);
