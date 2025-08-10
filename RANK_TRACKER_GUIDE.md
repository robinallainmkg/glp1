# Guide Rank Tracker Gratuit - Configuration GLP1 France

## 🚀 **Rank Tracker by SEO PowerSuite - Solution Gratuite**

### **Résumé des Possibilités**
✅ **Version gratuite disponible** - Limitations mais fonctionnelle  
❌ **Pas d'API officielle** pour la version gratuite  
✅ **Export CSV possible** pour récupérer les données  
✅ **Tracking illimité** de mots-clés (version gratuite limitée à 20 KW)  
✅ **Automatisation partielle** via scripts et exports  

---

## 📥 **ÉTAPE 1 : Installation et Configuration**

### **Téléchargement**
```bash
# Télécharger depuis : https://www.link-assistant.com/rank-tracker/download.html
# Version Windows recommandée pour votre environnement
```

### **Configuration initiale**
1. **Créer un projet** : "GLP1-France.fr"
2. **Ajouter le domaine** : glp1-france.fr
3. **Configurer les moteurs de recherche** :
   - Google.fr (France)
   - Google.fr (Mobile)
   - Google.com (International)

### **Paramètres recommandés**
```
Moteur de recherche : Google France
Langue : Français
Géolocalisation : France
Fréquence de vérification : Hebdomadaire (version gratuite)
Profondeur de scan : Top 50 résultats
```

---

## 🎯 **ÉTAPE 2 : Import des Mots-clés Prioritaires**

### **Liste pour Version Gratuite (20 mots-clés max)**
*Sélection des 20 mots-clés les plus critiques :*

```
ozempic prix
wegovy prix  
medicament pour maigrir
saxenda prix
glp1 perte de poids
mounjaro prix
injection pour maigrir
endocrinologue pour maigrir
clinique obesite
ozempic effet secondaire
wegovy danger
trulicity prix
medicament diabete
pilule qui fait maigrir
semaglutide prix
ozempic remboursement
wegovy remboursement
docteur pour maigrir
chirurgie bariatrique
nouveau medicament diabete
```

### **Méthode d'import en masse**
1. **Préparer un fichier CSV** :
```csv
Keyword,Search Engine,Location
ozempic prix,Google.fr,France
wegovy prix,Google.fr,France
medicament pour maigrir,Google.fr,France
[...suite de la liste...]
```

2. **Import dans Rank Tracker** :
   - Aller dans `Keywords` > `Add Keywords`
   - Choisir `Import from CSV file`
   - Sélectionner votre fichier

---

## 📊 **ÉTAPE 3 : Contournement des Limitations API**

### **Solution 1 : Export CSV Automatisé**

Créons un script pour automatiser l'export :

```powershell
# Script PowerShell : export-rankings.ps1
param(
    [string]$RankTrackerPath = "C:\Program Files (x86)\SEO PowerSuite\Rank Tracker\RankTracker.exe",
    [string]$ProjectFile = "C:\SEO\GLP1-France.rtd",
    [string]$ExportPath = "C:\SEO\exports\rankings-$(Get-Date -Format 'yyyy-MM-dd').csv"
)

# Fonction pour exporter les données
function Export-RankTrackerData {
    Write-Host "🚀 Démarrage de l'export Rank Tracker..." -ForegroundColor Green
    
    # Vérifier que Rank Tracker est installé
    if (-not (Test-Path $RankTrackerPath)) {
        Write-Error "Rank Tracker non trouvé : $RankTrackerPath"
        return
    }
    
    # Créer le dossier d'export si nécessaire
    $ExportDir = Split-Path $ExportPath -Parent
    if (-not (Test-Path $ExportDir)) {
        New-Item -ItemType Directory -Path $ExportDir -Force
    }
    
    # Instructions pour export manuel (version gratuite)
    Write-Host "📋 Instructions d'export manuel :" -ForegroundColor Yellow
    Write-Host "1. Ouvrir Rank Tracker"
    Write-Host "2. Charger le projet : $ProjectFile"
    Write-Host "3. Aller dans 'Target Keywords' tab"
    Write-Host "4. Sélectionner tous les mots-clés (Ctrl+A)"
    Write-Host "5. Right-click > Export > Export to CSV"
    Write-Host "6. Sauvegarder vers : $ExportPath"
    Write-Host ""
    Write-Host "⏰ Une fois exporté, appuyez sur Entrée pour continuer..."
    Read-Host
    
    # Vérifier que l'export existe
    if (Test-Path $ExportPath) {
        Write-Host "✅ Export réussi : $ExportPath" -ForegroundColor Green
        
        # Lire et analyser les données
        $RankingData = Import-Csv $ExportPath
        Write-Host "📊 Données importées : $($RankingData.Count) mots-clés" -ForegroundColor Cyan
        
        # Afficher un résumé
        $TopKeywords = $RankingData | Where-Object { $_."Google.fr Rank" -ne "" -and $_."Google.fr Rank" -ne ">" } | 
                       Sort-Object { [int]$_."Google.fr Rank" } | Select-Object -First 5
        
        Write-Host "🏆 Top 5 mots-clés :" -ForegroundColor Green
        foreach ($kw in $TopKeywords) {
            Write-Host "   $($kw.Keyword) - Position $($kw.'Google.fr Rank')" -ForegroundColor White
        }
        
        return $RankingData
    } else {
        Write-Error "Export non trouvé : $ExportPath"
    }
}

# Exécuter l'export
Export-RankTrackerData
```

### **Solution 2 : Web Scraping Simple**

Script alternatif pour vérifier les positions manuellement :

```javascript
// Script Node.js : check-rankings.js
const puppeteer = require('puppeteer');
const fs = require('fs');

const keywords = [
    'ozempic prix',
    'wegovy prix', 
    'medicament pour maigrir',
    'saxenda prix',
    'glp1 perte de poids'
];

const domain = 'glp1-france.fr';

async function checkRankings() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const results = [];
    
    for (const keyword of keywords) {
        try {
            console.log(`🔍 Vérification : ${keyword}`);
            
            await page.goto(`https://www.google.fr/search?q=${encodeURIComponent(keyword)}`, {
                waitUntil: 'networkidle2'
            });
            
            await page.waitForTimeout(2000);
            
            const searchResults = await page.$$('div.g');
            let position = 0;
            
            for (let i = 0; i < searchResults.length; i++) {
                const linkElement = await searchResults[i].$('h3 a');
                if (linkElement) {
                    const href = await page.evaluate(el => el.href, linkElement);
                    if (href && href.includes(domain)) {
                        position = i + 1;
                        break;
                    }
                }
            }
            
            results.push({
                keyword,
                position: position || 'Non trouvé',
                date: new Date().toISOString().split('T')[0]
            });
            
            console.log(`   Position : ${position || 'Non trouvé'}`);
            
        } catch (error) {
            console.error(`Erreur pour ${keyword}:`, error.message);
            results.push({
                keyword,
                position: 'Erreur',
                date: new Date().toISOString().split('T')[0]
            });
        }
        
        // Délai entre requêtes
        await page.waitForTimeout(3000);
    }
    
    await browser.close();
    
    // Sauvegarder les résultats
    const outputFile = `rankings-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    console.log(`📊 Résultats sauvegardés : ${outputFile}`);
    return results;
}

// Exécuter si appelé directement
if (require.main === module) {
    checkRankings().catch(console.error);
}

module.exports = { checkRankings };
```

---

## 🔄 **ÉTAPE 4 : Automatisation avec Script de Monitoring**

### **Dashboard automatisé simple**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rankings GLP1 - Monitoring Local</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .keyword-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .position { font-weight: bold; padding: 5px 10px; border-radius: 20px; }
        .position.top3 { background: #4ade80; color: white; }
        .position.top10 { background: #fbbf24; color: white; }
        .position.beyond { background: #ef4444; color: white; }
        .chart-container { width: 100%; height: 400px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Rankings GLP1-France.fr</h1>
        
        <div class="card">
            <h2>📊 Positions Actuelles</h2>
            <div id="rankings-list">
                <!-- Les données seront chargées ici -->
            </div>
        </div>
        
        <div class="card">
            <h2>📈 Évolution des Positions</h2>
            <canvas id="chart" width="400" height="200"></canvas>
        </div>
        
        <div class="card">
            <h2>🔄 Dernière Mise à Jour</h2>
            <p id="last-update">Chargement...</p>
            <button onclick="loadData()">Actualiser</button>
        </div>
    </div>

    <script>
        // Simulation de données (à remplacer par vrais exports)
        const sampleData = [
            { keyword: 'ozempic prix', position: 15, change: -2 },
            { keyword: 'wegovy prix', position: 8, change: +3 },
            { keyword: 'medicament pour maigrir', position: 25, change: 0 },
            { keyword: 'saxenda prix', position: 12, change: -1 },
            { keyword: 'glp1 perte de poids', position: 6, change: +4 }
        ];
        
        function loadData() {
            const container = document.getElementById('rankings-list');
            container.innerHTML = '';
            
            sampleData.forEach(item => {
                const div = document.createElement('div');
                div.className = 'keyword-row';
                
                const positionClass = item.position <= 3 ? 'top3' : 
                                    item.position <= 10 ? 'top10' : 'beyond';
                
                const changeIcon = item.change > 0 ? '📈' : 
                                 item.change < 0 ? '📉' : '➡️';
                
                div.innerHTML = `
                    <span><strong>${item.keyword}</strong></span>
                    <span>
                        <span class="position ${positionClass}">Position ${item.position}</span>
                        ${changeIcon} ${item.change > 0 ? '+' : ''}${item.change}
                    </span>
                `;
                
                container.appendChild(div);
            });
            
            document.getElementById('last-update').textContent = 
                `Dernière vérification : ${new Date().toLocaleString('fr-FR')}`;
        }
        
        // Graphique d'évolution
        function createChart() {
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
                    datasets: [{
                        label: 'Position Moyenne',
                        data: [23, 19, 15, 12],
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            reverse: true,
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Position Google'
                            }
                        }
                    }
                }
            });
        }
        
        // Initialisation
        loadData();
        createChart();
    </script>
</body>
</html>
```

---

## 📅 **ÉTAPE 5 : Planning de Monitoring**

### **Routine hebdomadaire recommandée**

```powershell
# Script de routine : weekly-seo-check.ps1

# Configuration
$Date = Get-Date -Format "yyyy-MM-dd"
$LogFile = "C:\SEO\logs\seo-check-$Date.log"

Write-Host "🎯 Routine SEO hebdomadaire - $Date" -ForegroundColor Green

# 1. Export Rank Tracker
Write-Host "1️⃣ Export des positions..." -ForegroundColor Yellow
# Exporter manuellement depuis Rank Tracker

# 2. Vérification Google Search Console
Write-Host "2️⃣ Vérification GSC..." -ForegroundColor Yellow
Start-Process "https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Aglp1-france.fr"

# 3. Analyse concurrence (optionnel)
Write-Host "3️⃣ Vérification concurrence..." -ForegroundColor Yellow
$Competitors = @("doctissimo.fr", "ameli.fr", "vidal.fr")
foreach ($competitor in $Competitors) {
    Write-Host "   Concurrent : $competitor" -ForegroundColor Cyan
    # Vérification manuelle recommandée
}

# 4. Génération rapport
Write-Host "4️⃣ Génération du rapport..." -ForegroundColor Yellow
$Report = @"
📊 RAPPORT SEO HEBDOMADAIRE - $Date

🎯 POSITIONS ACTUELLES :
- À remplir avec données Rank Tracker

📈 ÉVOLUTIONS :
- À analyser vs semaine précédente

⚠️ ACTIONS REQUISES :
- [ ] Optimiser pages ayant chuté
- [ ] Créer contenu pour mots-clés opportunités
- [ ] Surveiller nouveaux concurrents

📝 NOTES :
- Ajouter observations manuelles
"@

$Report | Out-File -FilePath $LogFile -Encoding UTF8
Write-Host "✅ Rapport sauvegardé : $LogFile" -ForegroundColor Green
```

---

## 🎯 **RÉSUMÉ : Solution Rank Tracker Gratuite**

### ✅ **Avantages**
- **Gratuit** pour 20 mots-clés
- **Données précises** de positions Google
- **Historique** des rankings  
- **Export CSV** pour récupérer les données
- **Interface complète** pour analyse

### ❌ **Limitations**
- **Pas d'API** directe disponible
- **20 mots-clés max** en version gratuite
- **Export manuel** requis
- **Pas d'automatisation** native

### 🔧 **Contournements**
- **Scripts d'export** automatisés
- **Web scraping** complémentaire
- **Dashboard custom** avec vos données
- **Routine manuelle** organisée

### 💡 **Recommandation**
Pour démarrer **immédiatement** et **gratuitement** :
1. **Installer Rank Tracker** gratuit
2. **Configurer les 20 mots-clés** prioritaires
3. **Exporter hebdomadairement** en CSV
4. **Utiliser le dashboard** HTML custom
5. **Upgrader vers SERPWatcher** (29€/mois) si budget disponible

Cette solution vous permettra de **commencer le monitoring** sans coût initial tout en gardant la possibilité d'évoluer vers des outils payants plus avancés !
