# 🔄 PLAN ANALYSE SEO DYNAMIQUE - GLP1 FRANCE

## 🎯 **ARCHITECTURE DU SYSTÈME**

### **1. Base de Données SEO**
```
📁 seo-analysis/
├── 📄 keywords-mapping.json      # Association mots-clés ↔ pages
├── 📄 pages-inventory.json       # Inventaire complet pages
├── 📄 seo-rules.json            # Règles SEO à vérifier
├── 📄 content-guidelines.json   # Charte éditoriale
└── 📊 reports/                  # Rapports générés
    ├── daily-checks/
    ├── weekly-audits/
    └── monthly-reports/
```

### **2. Modules d'Analyse**
```
🔧 scripts/seo-analysis/
├── 📄 keyword-mapper.mjs         # Mapping mots-clés/pages
├── 📄 content-checker.mjs        # Vérification charte
├── 📄 technical-seo.mjs          # SEO technique
├── 📄 on-page-analyzer.mjs       # Analyse on-page
├── 📄 performance-monitor.mjs    # Monitoring perf
└── 📄 dashboard-generator.mjs    # Dashboard dynamique
```

---

## 📊 **PHASE 1 : MAPPING MOTS-CLÉS ↔ PAGES**

### **Objectif**
Créer une carte complète associant chaque mot-clé à ses pages cibles et analyser la pertinence.

### **Structure de Données**
```json
{
  "keywords": {
    "ozempic prix": {
      "primary_page": "/glp1-perte-de-poids/ozempic-prix",
      "secondary_pages": [
        "/glp1-cout/",
        "/nouveaux-medicaments-perdre-poids"
      ],
      "search_volume": 8100,
      "difficulty": 65,
      "current_position": null,
      "target_position": 3,
      "content_analysis": {
        "title_optimized": false,
        "h1_contains_keyword": false,
        "density": 0,
        "content_length": 0,
        "last_updated": null
      }
    }
  },
  "pages": {
    "/glp1-perte-de-poids/ozempic-prix": {
      "primary_keywords": ["ozempic prix"],
      "secondary_keywords": ["ozempic cout", "prix ozempic pharmacie"],
      "content_score": 0,
      "technical_score": 0,
      "compliance_score": 0,
      "last_check": null
    }
  }
}
```

---

## 🔍 **PHASE 2 : ANALYSEURS SPÉCIALISÉS**

### **A. Content Compliance Checker**
```javascript
// Vérification automatique charte éditoriale
const contentRules = {
  title: {
    minLength: 30,
    maxLength: 60,
    mustContainKeyword: true,
    pattern: /^[A-Z][^!?]*$/
  },
  metaDescription: {
    minLength: 120,
    maxLength: 160,
    mustContainKeyword: true,
    mustHaveCTA: true
  },
  headings: {
    h1: { unique: true, containsKeyword: true },
    h2: { maxEmojis: 0, descriptive: true },
    hierarchy: { logical: true }
  },
  content: {
    minWords: 500,
    keywordDensity: { min: 1, max: 3 },
    readabilityScore: { min: 60 },
    medicalSources: { required: true },
    lastUpdated: { maxDays: 180 }
  },
  healthCompliance: {
    hasDisclaimer: true,
    encouragesConsultation: true,
    noMedicalPromises: true,
    hasSideEffects: true
  }
}
```

### **B. Technical SEO Monitor**
```javascript
// Vérification SEO technique
const technicalChecks = {
  performance: {
    loadTime: { max: 3000 },
    coreWebVitals: { LCP: 2500, FID: 100, CLS: 0.1 },
    imageOptimization: true,
    compression: true
  },
  indexation: {
    canonical: { exists: true, correct: true },
    metaRobots: { appropriate: true },
    sitemap: { updated: true, submitted: true },
    internalLinks: { min: 3, relevant: true }
  },
  structure: {
    urlStructure: { logical: true, keywords: true },
    breadcrumbs: { present: true },
    schema: { article: true, faq: true },
    openGraph: { complete: true }
  }
}
```

---

## 🚀 **PHASE 3 : IMPLÉMENTATION SCRIPTS**

### **Script 1 : Keyword Mapper**
```javascript
// scripts/seo-analysis/keyword-mapper.mjs
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class KeywordMapper {
  constructor() {
    this.contentDir = 'src/content';
    this.pagesDir = 'src/pages';
    this.keywordMap = new Map();
    this.pageInventory = new Map();
  }

  async scanContent() {
    // Scanner tous les fichiers .md et .astro
    const contentFiles = await glob(`${this.contentDir}/**/*.md`);
    const pageFiles = await glob(`${this.pagesDir}/**/*.astro`);
    
    for (const file of [...contentFiles, ...pageFiles]) {
      await this.analyzeFile(file);
    }
  }

  async analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = this.extractFrontmatter(content);
    const body = this.extractBody(content);
    
    // Analyser les mots-clés présents
    const detectedKeywords = this.detectKeywords(frontmatter, body);
    
    // Analyser la structure SEO
    const seoAnalysis = this.analyzeSEO(frontmatter, body);
    
    // Stocker dans l'inventaire
    this.pageInventory.set(filePath, {
      url: this.getURL(filePath),
      keywords: detectedKeywords,
      seo: seoAnalysis,
      lastModified: fs.statSync(filePath).mtime
    });
  }

  detectKeywords(frontmatter, body) {
    const priorityKeywords = [
      'ozempic prix', 'wegovy prix', 'saxenda prix',
      'medicament pour maigrir', 'glp1 perte de poids',
      // ... liste complète
    ];
    
    const detected = [];
    const fullText = (frontmatter.title + ' ' + body).toLowerCase();
    
    for (const keyword of priorityKeywords) {
      if (fullText.includes(keyword.toLowerCase())) {
        detected.push({
          keyword,
          inTitle: frontmatter.title?.toLowerCase().includes(keyword.toLowerCase()),
          inH1: this.checkH1(body, keyword),
          density: this.calculateDensity(body, keyword),
          prominence: this.calculateProminence(body, keyword)
        });
      }
    }
    
    return detected;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: this.pageInventory.size,
        keywordCoverage: this.calculateCoverage(),
        topIssues: this.identifyIssues()
      },
      details: Object.fromEntries(this.pageInventory)
    };
    
    fs.writeFileSync(
      'seo-analysis/keyword-mapping-report.json',
      JSON.stringify(report, null, 2)
    );
    
    return report;
  }
}
```

### **Script 2 : Content Checker**
```javascript
// scripts/seo-analysis/content-checker.mjs
class ContentChecker {
  constructor() {
    this.rules = this.loadContentRules();
    this.violations = [];
  }

  async checkPage(pageData) {
    const checks = [
      this.checkTitle(pageData),
      this.checkMetaDescription(pageData),
      this.checkHeadingStructure(pageData),
      this.checkContentQuality(pageData),
      this.checkHealthCompliance(pageData),
      this.checkFreshness(pageData)
    ];

    const results = await Promise.all(checks);
    return this.compileResults(pageData.url, results);
  }

  checkTitle(pageData) {
    const title = pageData.frontmatter?.title || '';
    const issues = [];

    if (title.length < 30) issues.push('Title trop court (<30 chars)');
    if (title.length > 60) issues.push('Title trop long (>60 chars)');
    if (!pageData.keywords.some(kw => title.toLowerCase().includes(kw.keyword.toLowerCase()))) {
      issues.push('Title ne contient pas le mot-clé principal');
    }
    if (!/^[A-Z]/.test(title)) issues.push('Title ne commence pas par majuscule');

    return {
      rule: 'title_optimization',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 25))
    };
  }

  checkHealthCompliance(pageData) {
    const content = pageData.body.toLowerCase();
    const issues = [];

    // Vérifier disclaimer médical
    if (!content.includes('consulter') && !content.includes('médecin')) {
      issues.push('Pas d\'encouragement à la consultation médicale');
    }

    // Vérifier absence de promesses
    const medicalPromises = ['guérir', 'traiter', 'soigner', 'miracle'];
    if (medicalPromises.some(word => content.includes(word))) {
      issues.push('Contient des promesses médicales à éviter');
    }

    // Vérifier mention effets secondaires
    if (content.includes('ozempic') || content.includes('wegovy')) {
      if (!content.includes('effet') && !content.includes('secondaire')) {
        issues.push('Médicament mentionné sans effets secondaires');
      }
    }

    return {
      rule: 'health_compliance',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 33))
    };
  }
}
```

---

## 📊 **PHASE 4 : DASHBOARD TEMPS RÉEL**

### **Interface Web Dynamique**
```html
<!-- seo-dashboard.html -->
<!DOCTYPE html>
<html>
<head>
    <title>SEO Dashboard - GLP1 France</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div id="dashboard">
        <!-- Dashboard SEO temps réel -->
        <div class="metrics-grid">
            <div class="metric-card" id="overall-score">
                <h3>Score SEO Global</h3>
                <div class="score" id="global-score">-</div>
            </div>
            
            <div class="metric-card" id="keyword-coverage">
                <h3>Couverture Mots-clés</h3>
                <div class="progress-bar">
                    <div class="progress" id="keyword-progress"></div>
                </div>
            </div>
            
            <div class="metric-card" id="compliance-score">
                <h3>Conformité Charte</h3>
                <div class="score" id="compliance-value">-</div>
            </div>
        </div>

        <div class="analysis-sections">
            <section id="keyword-analysis">
                <h2>Analyse par Mot-clé</h2>
                <div id="keyword-table"></div>
            </section>

            <section id="page-analysis">
                <h2>Analyse par Page</h2>
                <div id="page-table"></div>
            </section>

            <section id="issues-priority">
                <h2>Issues Prioritaires</h2>
                <div id="issues-list"></div>
            </section>
        </div>
    </div>

    <script>
        // Dashboard JavaScript
        class SEODashboard {
            constructor() {
                this.data = null;
                this.refreshInterval = 300000; // 5 minutes
                this.init();
            }

            async init() {
                await this.loadData();
                this.renderDashboard();
                this.startAutoRefresh();
            }

            async loadData() {
                try {
                    const response = await fetch('/seo-analysis/latest-report.json');
                    this.data = await response.json();
                } catch (error) {
                    console.error('Erreur chargement données:', error);
                }
            }

            renderDashboard() {
                this.renderOverallScore();
                this.renderKeywordAnalysis();
                this.renderPageAnalysis();
                this.renderPriorityIssues();
            }

            renderKeywordAnalysis() {
                const container = document.getElementById('keyword-table');
                const keywords = this.data.keywords || {};
                
                let html = '<table class="analysis-table">';
                html += '<thead><tr><th>Mot-clé</th><th>Page Principale</th><th>Position</th><th>Score Contenu</th><th>Issues</th></tr></thead>';
                html += '<tbody>';
                
                Object.entries(keywords).forEach(([keyword, data]) => {
                    const issues = data.issues || [];
                    const issueCount = issues.length;
                    const scoreClass = data.score > 80 ? 'good' : data.score > 60 ? 'warning' : 'danger';
                    
                    html += `
                        <tr>
                            <td><strong>${keyword}</strong></td>
                            <td>${data.primary_page}</td>
                            <td class="position">${data.current_position || 'Non classé'}</td>
                            <td class="score ${scoreClass}">${data.score || 0}/100</td>
                            <td class="issues">${issueCount} problème(s)</td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table>';
                container.innerHTML = html;
            }
        }

        // Initialiser le dashboard
        document.addEventListener('DOMContentLoaded', () => {
            window.dashboard = new SEODashboard();
        });
    </script>
</body>
</html>
```

---

## ⚡ **PHASE 5 : AUTOMATISATION**

### **Script Principal d'Orchestration**
```javascript
// scripts/seo-analysis/run-analysis.mjs
import { KeywordMapper } from './keyword-mapper.mjs';
import { ContentChecker } from './content-checker.mjs';
import { TechnicalAnalyzer } from './technical-analyzer.mjs';
import { DashboardGenerator } from './dashboard-generator.mjs';

class SEOAnalysisOrchestrator {
  async runFullAnalysis() {
    console.log('🚀 Démarrage analyse SEO complète...');
    
    // 1. Mapper les mots-clés et pages
    const mapper = new KeywordMapper();
    await mapper.scanContent();
    const mappingReport = mapper.generateReport();
    
    // 2. Vérifier la conformité contenu
    const checker = new ContentChecker();
    const contentReport = await checker.checkAllPages(mappingReport.pages);
    
    // 3. Analyser le SEO technique
    const techAnalyzer = new TechnicalAnalyzer();
    const techReport = await techAnalyzer.runChecks();
    
    // 4. Générer le dashboard
    const dashboard = new DashboardGenerator();
    await dashboard.generate({
      mapping: mappingReport,
      content: contentReport,
      technical: techReport
    });
    
    // 5. Générer les recommandations
    const recommendations = this.generateRecommendations({
      mapping: mappingReport,
      content: contentReport,
      technical: techReport
    });
    
    console.log('✅ Analyse terminée !');
    return { mappingReport, contentReport, techReport, recommendations };
  }

  generateRecommendations(reports) {
    const recommendations = [];
    
    // Analyser les problèmes critiques
    reports.content.pages.forEach(page => {
      if (page.score < 60) {
        recommendations.push({
          priority: 'HIGH',
          type: 'content',
          page: page.url,
          issue: 'Score contenu faible',
          action: 'Optimiser title, meta et contenu',
          impact: 'Amélioration positioning'
        });
      }
    });
    
    // Analyser les opportunités mots-clés
    Object.entries(reports.mapping.keywords).forEach(([keyword, data]) => {
      if (!data.current_position || data.current_position > 20) {
        recommendations.push({
          priority: 'MEDIUM',
          type: 'keyword',
          keyword,
          page: data.primary_page,
          issue: 'Mot-clé mal positionné',
          action: 'Enrichir contenu et optimiser on-page',
          impact: 'Gain trafic organique'
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorities = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  }
}

// Script exécutable
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new SEOAnalysisOrchestrator();
  orchestrator.runFullAnalysis().catch(console.error);
}
```

---

## 🔄 **PHASE 6 : INTÉGRATION CONTINUE**

### **Automation via GitHub Actions**
```yaml
# .github/workflows/seo-analysis.yml
name: SEO Analysis
on:
  schedule:
    - cron: '0 6 * * *'  # Tous les jours à 6h
  push:
    paths:
      - 'src/content/**'
      - 'src/pages/**'

jobs:
  seo-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run SEO Analysis
        run: node scripts/seo-analysis/run-analysis.mjs
      
      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: seo-reports
          path: seo-analysis/reports/
      
      - name: Deploy Dashboard
        run: |
          cp seo-analysis/dashboard.html public/seo-dashboard.html
          npm run build
```

### **Monitoring Continu**
```powershell
# scripts/monitor-seo.ps1
# Script PowerShell pour monitoring local

Write-Host "🔍 Monitoring SEO - GLP1 France" -ForegroundColor Green

while ($true) {
    # Exécuter l'analyse
    node scripts/seo-analysis/run-analysis.mjs
    
    # Vérifier les scores critiques
    $report = Get-Content "seo-analysis/latest-report.json" | ConvertFrom-Json
    
    $criticalIssues = $report.recommendations | Where-Object { $_.priority -eq "HIGH" }
    
    if ($criticalIssues.Count -gt 0) {
        Write-Host "⚠️ $($criticalIssues.Count) problèmes critiques détectés !" -ForegroundColor Red
        foreach ($issue in $criticalIssues) {
            Write-Host "   - $($issue.page): $($issue.issue)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ Aucun problème critique" -ForegroundColor Green
    }
    
    # Attendre 1 heure
    Start-Sleep -Seconds 3600
}
```

Ce système vous donnera une **analyse SEO dynamique complète et automatisée** ! Voulez-vous que je commence par implémenter l'un de ces modules en priorité ?
