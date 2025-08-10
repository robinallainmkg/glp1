# Analyseur simple pour les exports Rank Tracker
param(
    [string]$CsvFile = "C:\Users\robin\Documents\Progression du positionnement - glp1-france.fr.csv"
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "    ANALYSE RANKINGS - GLP1 FRANCE" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path $CsvFile)) {
    Write-Host "ERREUR: Fichier non trouve : $CsvFile" -ForegroundColor Red
    exit
}

Write-Host "Analyse du fichier : $CsvFile" -ForegroundColor Cyan
Write-Host ""

try {
    $Data = Import-Csv $CsvFile
    
    Write-Host "RESULTATS D'ANALYSE :" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Gray
    
    $TotalKeywords = $Data.Count
    Write-Host "Total mots-cles analyses : $TotalKeywords" -ForegroundColor White
    
    Write-Host ""
    Write-Host "DETAIL PAR MOT-CLE :" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($row in $Data) {
        $keyword = $row."Mot clé"
        $position = $row."Pos. Google.fr"
        
        Write-Host "Mot-cle : $keyword" -ForegroundColor White
        
        if ($position -match '^\d+$') {
            $pos = [int]$position
            if ($pos -le 3) {
                Write-Host "  Position : $position (EXCELLENT - Top 3)" -ForegroundColor Green
            } elseif ($pos -le 10) {
                Write-Host "  Position : $position (TRES BIEN - Top 10)" -ForegroundColor Yellow
            } elseif ($pos -le 50) {
                Write-Host "  Position : $position (CORRECT - Page 1-5)" -ForegroundColor Cyan
            } else {
                Write-Host "  Position : $position (A AMELIORER)" -ForegroundColor Red
            }
        } elseif ($position -eq "Pos. > 50") {
            Write-Host "  Position : Au-dela de 50 (A AMELIORER)" -ForegroundColor Red
        } elseif ($position -eq "" -or $position -eq $null) {
            Write-Host "  Position : Non scanne" -ForegroundColor Gray
        } else {
            Write-Host "  Position : $position" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    # Compter les positions
    $Beyond50 = ($Data | Where-Object { $_."Pos. Google.fr" -eq "Pos. > 50" -or $_."Pos. Google.fr" -eq "" }).Count
    $NotScanned = ($Data | Where-Object { $_."Pos. Google.fr" -eq "" -or $_."Pos. Google.fr" -eq $null }).Count
    
    Write-Host "RESUME :" -ForegroundColor Yellow
    Write-Host "========" -ForegroundColor Gray
    Write-Host "Mots-cles au-dela de la position 50 : $Beyond50" -ForegroundColor Red
    Write-Host "Mots-cles non scannes : $NotScanned" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "RECOMMANDATIONS IMMEDIATES :" -ForegroundColor Magenta
    Write-Host "=============================" -ForegroundColor Gray
    Write-Host "1. Tous vos mots-cles sont mal positionnes (>50)" -ForegroundColor Yellow
    Write-Host "2. Il faut optimiser le contenu existant" -ForegroundColor Yellow
    Write-Host "3. Verifier que vos pages ciblent bien ces mots-cles" -ForegroundColor Yellow
    Write-Host "4. Ameliorer le SEO on-page" -ForegroundColor Yellow
    
} catch {
    Write-Host "ERREUR lors de l'analyse : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
