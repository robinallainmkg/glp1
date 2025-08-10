# Alternative gratuite - Verification manuelle positions Google
# Fichier : scripts/check-positions-manual.ps1

param(
    [string[]]$Keywords = @(
        "ozempic prix",
        "wegovy prix", 
        "medicament pour maigrir",
        "saxenda prix",
        "glp1 perte de poids"
    )
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "  VERIFICATION POSITIONS - ALTERNATIVE" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$Domain = "glp1-france.fr"
$Results = @()

Write-Host "VERIFICATION EN COURS..." -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Gray
Write-Host "Domaine cible : $Domain" -ForegroundColor Cyan
Write-Host ""

foreach ($keyword in $Keywords) {
    Write-Host "Verification : $keyword" -ForegroundColor White
    
    # Construire l'URL de recherche Google
    $SearchUrl = "https://www.google.fr/search?q=" + [System.Web.HttpUtility]::UrlEncode($keyword)
    
    Write-Host "  URL a verifier manuellement :" -ForegroundColor Gray
    Write-Host "  $SearchUrl" -ForegroundColor Cyan
    Write-Host "  Cherchez '$Domain' dans les resultats" -ForegroundColor Gray
    Write-Host ""
    
    # Ouvrir automatiquement dans le navigateur
    try {
        Start-Process $SearchUrl
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "  Impossible d'ouvrir automatiquement" -ForegroundColor Yellow
    }
    
    # Demander la position manuellement
    do {
        $Position = Read-Host "  Position trouvee pour '$keyword' (1-50, ou 'non' si non trouve)"
        if ($Position -eq "non" -or $Position -eq "n") {
            $Position = "Non trouve"
            break
        } elseif ($Position -match '^\d+$' -and [int]$Position -ge 1 -and [int]$Position -le 50) {
            break
        } else {
            Write-Host "  Entrez un nombre entre 1-50 ou 'non'" -ForegroundColor Yellow
        }
    } while ($true)
    
    $Results += [PSCustomObject]@{
        "Mot-cle" = $keyword
        "Position" = $Position
        "Date" = Get-Date -Format "dd/MM/yyyy"
        "Heure" = Get-Date -Format "HH:mm"
    }
    
    Write-Host "  Position enregistree : $Position" -ForegroundColor Green
    Write-Host ""
}

# Sauvegarder les resultats
$OutputFile = "positions-manual-$(Get-Date -Format 'yyyy-MM-dd').csv"
$Results | Export-Csv -Path $OutputFile -NoTypeInformation -Encoding UTF8

Write-Host "RESULTATS SAUVEGARDES :" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Gray
Write-Host "Fichier : $OutputFile" -ForegroundColor Cyan
Write-Host ""

# Afficher le resume
Write-Host "RESUME DES POSITIONS :" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Gray

$Top10 = 0
$Top50 = 0
$NotFound = 0

foreach ($result in $Results) {
    $pos = $result.Position
    Write-Host "$($result.'Mot-cle') : $pos" -ForegroundColor White
    
    if ($pos -match '^\d+$') {
        $posNum = [int]$pos
        if ($posNum -le 10) { $Top10++ }
        elseif ($posNum -le 50) { $Top50++ }
    } else {
        $NotFound++
    }
}

Write-Host ""
Write-Host "STATISTIQUES :" -ForegroundColor Magenta
Write-Host "=============" -ForegroundColor Gray
Write-Host "Top 10 : $Top10" -ForegroundColor Green
Write-Host "Top 50 : $Top50" -ForegroundColor Yellow
Write-Host "Non trouves : $NotFound" -ForegroundColor Red

Write-Host ""
Write-Host "AVANTAGES DE CETTE METHODE :" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Gray
Write-Host "- Gratuit et illimite" -ForegroundColor Green
Write-Host "- Donnees en temps reel" -ForegroundColor Green
Write-Host "- Pas de restrictions" -ForegroundColor Green
Write-Host "- Verification visuelle possible" -ForegroundColor Green

Write-Host ""
Write-Host "INCONVENIENTS :" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Gray
Write-Host "- Processus manuel" -ForegroundColor Red
Write-Host "- Plus long a executer" -ForegroundColor Red
Write-Host "- Pas d'historique automatique" -ForegroundColor Red

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
