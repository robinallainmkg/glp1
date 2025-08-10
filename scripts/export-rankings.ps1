# Script PowerShell pour automatiser l'export Rank Tracker
# Fichier : export-rankings.ps1

param(
    [string]$ExportPath = "C:\SEO\exports\rankings-$(Get-Date -Format 'yyyy-MM-dd').csv",
    [string]$DashboardPath = "C:\Users\robin\projet\glp1-main\seo-rankings-dashboard.html"
)

# Configuration
$Keywords = @(
    "ozempic prix",
    "wegovy prix", 
    "medicament pour maigrir",
    "saxenda prix",
    "glp1 perte de poids",
    "mounjaro prix",
    "injection pour maigrir",
    "endocrinologue pour maigrir",
    "clinique obesite",
    "ozempic effet secondaire",
    "wegovy danger",
    "trulicity prix",
    "medicament diabete",
    "pilule qui fait maigrir",
    "semaglutide prix",
    "ozempic remboursement",
    "wegovy remboursement",
    "docteur pour maigrir",
    "chirurgie bariatrique",
    "nouveau medicament diabete"
)

function Show-Instructions {
    Write-Host "🎯 INSTRUCTIONS EXPORT RANK TRACKER" -ForegroundColor Green
    Write-Host "=" * 50 -ForegroundColor Gray
    Write-Host ""
    Write-Host "1. 📂 Ouvrir Rank Tracker" -ForegroundColor Yellow
    Write-Host "2. 🏗️ Charger votre projet GLP1-France.fr" -ForegroundColor Yellow
    Write-Host "3. 📋 Aller dans l'onglet 'Target Keywords'" -ForegroundColor Yellow
    Write-Host "4. 🔍 Cliquer sur 'Check Rankings' pour actualiser" -ForegroundColor Yellow
    Write-Host "5. ✅ Sélectionner tous les mots-clés (Ctrl+A)" -ForegroundColor Yellow
    Write-Host "6. 📤 Clic droit > Export > Export to CSV" -ForegroundColor Yellow
    Write-Host "7. 💾 Sauvegarder vers :" -ForegroundColor Yellow
    Write-Host "   $ExportPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏰ Une fois l'export terminé, appuyez sur Entrée..." -ForegroundColor Magenta
    Read-Host
}

function Create-ExportDirectory {
    $ExportDir = Split-Path $ExportPath -Parent
    if (-not (Test-Path $ExportDir)) {
        Write-Host "📁 Création du dossier : $ExportDir" -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $ExportDir -Force | Out-Null
    }
}

function Analyze-Rankings {
    param([string]$CsvPath)
    
    if (-not (Test-Path $CsvPath)) {
        Write-Error "❌ Fichier CSV non trouvé : $CsvPath"
        return $null
    }
    
    Write-Host "📊 Analyse des données..." -ForegroundColor Cyan
    
    try {
        $Data = Import-Csv $CsvPath -Delimiter ","
        
        # Nettoyer et analyser les données
        $CleanData = @()
        foreach ($row in $Data) {
            $keyword = $row.Keyword
            $position = $row."Google.fr Rank"
            
            # Nettoyer la position (retirer les caractères non numériques)
            $cleanPosition = if ($position -match '^\d+$') { [int]$position } else { 999 }
            
            $CleanData += [PSCustomObject]@{
                Keyword = $keyword
                Position = $cleanPosition
                PositionText = $position
                Category = Get-KeywordCategory -Keyword $keyword
            }
        }
        
        # Statistiques
        $TopKeywords = $CleanData | Where-Object { $_.Position -le 10 } | Sort-Object Position
        $Top3Keywords = $CleanData | Where-Object { $_.Position -le 3 }
        $AveragePosition = ($CleanData | Where-Object { $_.Position -ne 999 } | Measure-Object -Property Position -Average).Average
        
        Write-Host ""
        Write-Host "📈 RÉSULTATS ANALYSE" -ForegroundColor Green
        Write-Host "=" * 30 -ForegroundColor Gray
        Write-Host "🎯 Mots-clés analysés : $($CleanData.Count)" -ForegroundColor White
        Write-Host "🏆 Top 3 : $($Top3Keywords.Count)" -ForegroundColor Green
        Write-Host "📊 Top 10 : $($TopKeywords.Count)" -ForegroundColor Yellow
        Write-Host "📍 Position moyenne : $([math]::Round($AveragePosition, 1))" -ForegroundColor Cyan
        
        if ($Top3Keywords.Count -gt 0) {
            Write-Host ""
            Write-Host "🥇 MOTS-CLÉS TOP 3 :" -ForegroundColor Green
            foreach ($kw in $Top3Keywords) {
                Write-Host "   Position $($kw.Position) : $($kw.Keyword)" -ForegroundColor White
            }
        }
        
        if ($TopKeywords.Count -gt 0) {
            Write-Host ""
            Write-Host "🔟 MOTS-CLÉS TOP 10 :" -ForegroundColor Yellow
            foreach ($kw in $TopKeywords) {
                Write-Host "   Position $($kw.Position) : $($kw.Keyword)" -ForegroundColor White
            }
        }
        
        return $CleanData
        
    } catch {
        Write-Error "❌ Erreur lors de l'analyse : $($_.Exception.Message)"
        return $null
    }
}

function Get-KeywordCategory {
    param([string]$Keyword)
    
    if ($Keyword -match "prix|cout|tarif") { return "Prix" }
    if ($Keyword -match "effet|danger|secondaire") { return "Effets" }
    if ($Keyword -match "medecin|endocrinologue|clinique|docteur") { return "Médecins" }
    if ($Keyword -match "remboursement|mutuelle") { return "Remboursement" }
    if ($Keyword -match "diabete|insuline") { return "Diabète" }
    return "Général"
}

function Update-Dashboard {
    param([object[]]$RankingData)
    
    if (-not $RankingData) {
        Write-Warning "⚠️ Pas de données pour mettre à jour le dashboard"
        return
    }
    
    Write-Host "🔄 Mise à jour du dashboard..." -ForegroundColor Cyan
    
    # Générer les données JavaScript
    $jsData = $RankingData | ForEach-Object {
        "{ keyword: '$($_.Keyword)', position: $($_.Position), category: '$($_.Category)' }"
    }
    $jsDataString = "[$($jsData -join ', ')]"
    
    $htmlContent = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rankings GLP1-France.fr - $(Get-Date -Format 'dd/MM/yyyy')</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1a202c; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
        .card { background: white; padding: 25px; margin: 20px 0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; border-left: 4px solid #667eea; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #2d3748; margin-bottom: 5px; }
        .stat-label { color: #4a5568; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .keyword-list { display: grid; gap: 10px; }
        .keyword-row { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f7fafc; }
        .keyword-name { font-weight: 600; color: #2d3748; }
        .keyword-category { background: #e2e8f0; color: #4a5568; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 10px; }
        .position-badge { font-weight: bold; padding: 6px 12px; border-radius: 20px; color: white; font-size: 0.9rem; }
        .position-1-3 { background: #48bb78; }
        .position-4-10 { background: #ed8936; }
        .position-11-50 { background: #4299e1; }
        .position-beyond { background: #f56565; }
        .chart-container { height: 400px; margin: 20px 0; }
        .update-info { text-align: center; color: #718096; font-size: 0.9rem; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Rankings SEO - GLP1-France.fr</h1>
            <p>Monitoring des positions Google - Mise à jour $(Get-Date -Format 'dd/MM/yyyy HH:mm')</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value" id="total-keywords">0</div>
                <div class="stat-label">Mots-clés suivis</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="top3-count">0</div>
                <div class="stat-label">Top 3</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="top10-count">0</div>
                <div class="stat-label">Top 10</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="avg-position">-</div>
                <div class="stat-label">Position moyenne</div>
            </div>
        </div>

        <div class="card">
            <h2>🎯 Positions par Mot-clé</h2>
            <div class="keyword-list" id="keyword-list">
                <!-- Généré par JavaScript -->
            </div>
        </div>

        <div class="card">
            <h2>📈 Répartition par Position</h2>
            <div class="chart-container">
                <canvas id="position-chart"></canvas>
            </div>
        </div>

        <div class="update-info">
            📅 Données exportées depuis Rank Tracker le $(Get-Date -Format 'dd/MM/yyyy à HH:mm')<br>
            🔄 Prochaine mise à jour recommandée : $(Get-Date).AddDays(7).ToString('dd/MM/yyyy')
        </div>
    </div>

    <script>
        // Données des rankings
        const rankingData = $jsDataString;
        
        function updateStats() {
            const totalKeywords = rankingData.length;
            const top3 = rankingData.filter(kw => kw.position <= 3 && kw.position > 0).length;
            const top10 = rankingData.filter(kw => kw.position <= 10 && kw.position > 0).length;
            const validPositions = rankingData.filter(kw => kw.position > 0 && kw.position < 999);
            const avgPosition = validPositions.length > 0 ? 
                Math.round(validPositions.reduce((sum, kw) => sum + kw.position, 0) / validPositions.length * 10) / 10 : 0;
            
            document.getElementById('total-keywords').textContent = totalKeywords;
            document.getElementById('top3-count').textContent = top3;
            document.getElementById('top10-count').textContent = top10;
            document.getElementById('avg-position').textContent = avgPosition || '-';
        }
        
        function renderKeywordList() {
            const container = document.getElementById('keyword-list');
            const sortedData = rankingData.sort((a, b) => {
                if (a.position === 999 && b.position === 999) return 0;
                if (a.position === 999) return 1;
                if (b.position === 999) return -1;
                return a.position - b.position;
            });
            
            container.innerHTML = sortedData.map(kw => {
                let positionClass = 'position-beyond';
                let positionText = 'Non classé';
                
                if (kw.position > 0 && kw.position <= 3) {
                    positionClass = 'position-1-3';
                    positionText = `Position `+ kw.position;
                } else if (kw.position <= 10) {
                    positionClass = 'position-4-10';
                    positionText = `Position `+ kw.position;
                } else if (kw.position <= 50) {
                    positionClass = 'position-11-50';
                    positionText = `Position `+ kw.position;
                } else if (kw.position < 999) {
                    positionText = `Position `+ kw.position;
                }
                
                return `
                    <div class="keyword-row">
                        <div>
                            <span class="keyword-name">`+ kw.keyword +`</span>
                            <span class="keyword-category">`+ kw.category +`</span>
                        </div>
                        <span class="position-badge `+ positionClass +`">`+ positionText +`</span>
                    </div>
                `;
            }).join('');
        }
        
        function createChart() {
            const ctx = document.getElementById('position-chart').getContext('2d');
            
            const positions = {
                'Top 3 (1-3)': rankingData.filter(kw => kw.position >= 1 && kw.position <= 3).length,
                'Top 10 (4-10)': rankingData.filter(kw => kw.position >= 4 && kw.position <= 10).length,
                'Top 50 (11-50)': rankingData.filter(kw => kw.position >= 11 && kw.position <= 50).length,
                'Au-delà (50+)': rankingData.filter(kw => kw.position > 50 && kw.position < 999).length,
                'Non classé': rankingData.filter(kw => kw.position === 999).length
            };
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(positions),
                    datasets: [{
                        data: Object.values(positions),
                        backgroundColor: ['#48bb78', '#ed8936', '#4299e1', '#f56565', '#a0aec0'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }
        
        // Initialisation
        updateStats();
        renderKeywordList();
        createChart();
    </script>
</body>
</html>
"@
    
    try {
        $htmlContent | Out-File -FilePath $DashboardPath -Encoding UTF8
        Write-Host "✅ Dashboard mis à jour : $DashboardPath" -ForegroundColor Green
        
        # Ouvrir le dashboard
        Start-Process $DashboardPath
        
    } catch {
        Write-Error "❌ Erreur mise à jour dashboard : $($_.Exception.Message)"
    }
}

function Main {
    Write-Host "🚀 EXPORT RANK TRACKER - GLP1 FRANCE" -ForegroundColor Green
    Write-Host "=" * 50 -ForegroundColor Gray
    Write-Host ""
    
    # Créer les dossiers nécessaires
    Create-ExportDirectory
    
    # Afficher les instructions
    Show-Instructions
    
    # Analyser les données si le fichier existe
    $RankingData = Analyze-Rankings -CsvPath $ExportPath
    
    if ($RankingData) {
        # Mettre à jour le dashboard
        Update-Dashboard -RankingData $RankingData
        
        Write-Host ""
        Write-Host "🎯 PROCHAINES ÉTAPES :" -ForegroundColor Magenta
        Write-Host "1. 📊 Consulter le dashboard : $DashboardPath" -ForegroundColor Yellow
        Write-Host "2. 📈 Analyser les opportunités d'amélioration" -ForegroundColor Yellow
        Write-Host "3. 🔄 Répéter l'export chaque semaine" -ForegroundColor Yellow
        Write-Host "4. 📝 Documenter les changements de positions" -ForegroundColor Yellow
        
    } else {
        Write-Host "⚠️ Aucune donnée analysée. Vérifiez l'export depuis Rank Tracker." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "✅ Script terminé !" -ForegroundColor Green
}

# Exécution du script principal
Main
