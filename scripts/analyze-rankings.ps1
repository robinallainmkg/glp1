# Script d'analyse des rankings exportés depuis Rank Tracker
# Fichier : scripts/analyze-rankings.ps1

param(
    [string]$CsvFile = ""
)

function Find-LatestRankingFile {
    $ExportPath = "C:\SEO\exports"
    if (-not (Test-Path $ExportPath)) {
        Write-Host "❌ Dossier exports non trouvé : $ExportPath" -ForegroundColor Red
        return $null
    }
    
    $LatestFile = Get-ChildItem -Path $ExportPath -Filter "*.csv" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($LatestFile) {
        return $LatestFile.FullName
    } else {
        Write-Host "❌ Aucun fichier CSV trouvé dans $ExportPath" -ForegroundColor Red
        return $null
    }
}

function Analyze-RankingData {
    param([string]$FilePath)
    
    Write-Host "📊 Analyse du fichier : $FilePath" -ForegroundColor Cyan
    
    try {
        $Data = Import-Csv $FilePath
        
        Write-Host ""
        Write-Host "📈 RÉSULTATS D'ANALYSE" -ForegroundColor Green
        Write-Host "=" * 40 -ForegroundColor Gray
        
        $TotalKeywords = $Data.Count
        Write-Host "🎯 Total mots-clés : $TotalKeywords" -ForegroundColor White
        
        # Analyser les positions
        $Top3 = 0
        $Top10 = 0
        $Top50 = 0
        $NotRanked = 0
        
        foreach ($row in $Data) {
            $position = $row."Google.fr Rank"
            
            if ($position -match '^\d+$') {
                $pos = [int]$position
                if ($pos -le 3) { $Top3++ }
                elseif ($pos -le 10) { $Top10++ }
                elseif ($pos -le 50) { $Top50++ }
            } else {
                $NotRanked++
            }
        }
        
        Write-Host ""
        Write-Host "🏆 RÉPARTITION DES POSITIONS :" -ForegroundColor Yellow
        Write-Host "   🥇 Top 3 (positions 1-3) : $Top3" -ForegroundColor Green
        Write-Host "   🥈 Top 10 (positions 4-10) : $Top10" -ForegroundColor Yellow
        Write-Host "   🥉 Top 50 (positions 11-50) : $Top50" -ForegroundColor Orange
        Write-Host "   ❌ Non classés : $NotRanked" -ForegroundColor Red
        
        # Afficher le top 5 des mieux classés
        $BestRanked = $Data | Where-Object { $_."Google.fr Rank" -match '^\d+$' } | 
                     Sort-Object { [int]$_."Google.fr Rank" } | 
                     Select-Object -First 5
        
        if ($BestRanked.Count -gt 0) {
            Write-Host ""
            Write-Host "🌟 TOP 5 MIEUX CLASSÉS :" -ForegroundColor Green
            foreach ($kw in $BestRanked) {
                Write-Host "   Position $($_."Google.fr Rank") : $($_.Keyword)" -ForegroundColor White
            }
        }
        
        # Identifier les opportunités
        $Opportunities = $Data | Where-Object { 
            $_."Google.fr Rank" -match '^\d+$' -and [int]$_."Google.fr Rank" -ge 11 -and [int]$_."Google.fr Rank" -le 30 
        }
        
        if ($Opportunities.Count -gt 0) {
            Write-Host ""
            Write-Host "🎯 OPPORTUNITÉS (positions 11-30) :" -ForegroundColor Cyan
            foreach ($opp in $Opportunities) {
                Write-Host "   Position $($_."Google.fr Rank") : $($_.Keyword)" -ForegroundColor White
            }
        }
        
        # Recommandations
        Write-Host ""
        Write-Host "💡 RECOMMANDATIONS :" -ForegroundColor Magenta
        
        if ($Top3 -eq 0) {
            Write-Host "   • Priorité : Optimiser pour atteindre le top 3" -ForegroundColor Yellow
        }
        
        if ($NotRanked -gt 5) {
            Write-Host "   • Créer du contenu pour les mots-clés non classés" -ForegroundColor Yellow
        }
        
        if ($Opportunities.Count -gt 0) {
            Write-Host "   • Enrichir le contenu pour les positions 11-30" -ForegroundColor Yellow
        }
        
        Write-Host "   • Répéter l'analyse chaque semaine" -ForegroundColor Yellow
        
    } catch {
        Write-Host "❌ Erreur lors de l'analyse : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Script principal
Write-Host "🔍 ANALYSEUR DE RANKINGS - GLP1 FRANCE" -ForegroundColor Green
Write-Host "=" * 45 -ForegroundColor Gray
Write-Host ""

if ($CsvFile -eq "") {
    Write-Host "🔎 Recherche du fichier de rankings le plus récent..." -ForegroundColor Cyan
    $CsvFile = Find-LatestRankingFile
}

if ($CsvFile -and (Test-Path $CsvFile)) {
    Analyze-RankingData -FilePath $CsvFile
} else {
    Write-Host ""
    Write-Host "⚠️ AUCUN FICHIER DE RANKINGS TROUVÉ" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 ÉTAPES À SUIVRE :" -ForegroundColor Cyan
    Write-Host "1. Ouvrir Rank Tracker" -ForegroundColor White
    Write-Host "2. Sélectionner votre projet GLP1-France" -ForegroundColor White
    Write-Host "3. Cliquer sur 'Check Rankings'" -ForegroundColor White
    Write-Host "4. Exporter en CSV vers C:\SEO\exports\" -ForegroundColor White
    Write-Host "5. Relancer ce script" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Ou spécifiez le fichier manuellement :" -ForegroundColor Yellow
    Write-Host "   .\scripts\analyze-rankings.ps1 -CsvFile 'C:\chemin\vers\fichier.csv'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Analyse terminée !" -ForegroundColor Green
