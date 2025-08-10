# Guide simplifie Rank Tracker - Version corrigee
Write-Host "========================================" -ForegroundColor Green
Write-Host "     GUIDE RANK TRACKER - GLP1 FRANCE" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Statut actuel :" -ForegroundColor Yellow
Write-Host "[OK] Rank Tracker installe" -ForegroundColor Green
Write-Host "[OK] Domaine configure" -ForegroundColor Green
Write-Host "[OK] Dossier exports cree" -ForegroundColor Green
Write-Host ""

Write-Host "PROCHAINES ETAPES :" -ForegroundColor Cyan
Write-Host ""

Write-Host "ETAPE 1 - IMPORTER LES MOTS-CLES" -ForegroundColor Yellow
Write-Host "  a) Dans Rank Tracker, aller dans Target Keywords" -ForegroundColor White
Write-Host "  b) Cliquer sur Add Keywords" -ForegroundColor White  
Write-Host "  c) Choisir Import from file" -ForegroundColor White
Write-Host "  d) Selectionner le fichier :" -ForegroundColor White
Write-Host "     $PWD\keywords-import-rank-tracker.csv" -ForegroundColor Cyan
Write-Host ""

Write-Host "ETAPE 2 - SCANNER LES POSITIONS" -ForegroundColor Yellow
Write-Host "  a) Cliquer sur Check Rankings" -ForegroundColor White
Write-Host "  b) Patienter 2-3 minutes pour le scan" -ForegroundColor White
Write-Host ""

Write-Host "ETAPE 3 - EXPORTER LES RESULTATS" -ForegroundColor Yellow
Write-Host "  a) Selectionner tous les mots-cles (Ctrl+A)" -ForegroundColor White
Write-Host "  b) Clic droit, puis Export, puis CSV" -ForegroundColor White
Write-Host "  c) Sauvegarder dans C:\SEO\exports\" -ForegroundColor White
Write-Host ""

Write-Host "ETAPE 4 - ANALYSER LES DONNEES" -ForegroundColor Yellow
Write-Host "  a) Executer le script d'analyse :" -ForegroundColor White
Write-Host "     .\scripts\analyze-rankings.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "MOTS-CLES CONFIGURES (20 total) :" -ForegroundColor Magenta
Write-Host "  1. ozempic prix" -ForegroundColor White
Write-Host "  2. wegovy prix" -ForegroundColor White
Write-Host "  3. medicament pour maigrir" -ForegroundColor White
Write-Host "  4. saxenda prix" -ForegroundColor White
Write-Host "  5. glp1 perte de poids" -ForegroundColor White
Write-Host "  6. mounjaro prix" -ForegroundColor White
Write-Host "  7. injection pour maigrir" -ForegroundColor White
Write-Host "  8. endocrinologue pour maigrir" -ForegroundColor White
Write-Host "  9. clinique obesite" -ForegroundColor White
Write-Host " 10. ozempic effet secondaire" -ForegroundColor White
Write-Host " ... et 10 autres mots-cles" -ForegroundColor Gray
Write-Host ""

Write-Host "AIDE :" -ForegroundColor Yellow
Write-Host "  - Pour relancer ce guide : .\scripts\rank-tracker-simple.ps1" -ForegroundColor White
Write-Host "  - Documentation complete : QUICK_START_RANK_TRACKER.md" -ForegroundColor White
Write-Host ""

# Verifier si Rank Tracker est lance
$RankTrackerRunning = Get-Process -Name "*rank*" -ErrorAction SilentlyContinue
if ($RankTrackerRunning) {
    Write-Host "[INFO] Rank Tracker detecte en cours d'execution" -ForegroundColor Green
} else {
    Write-Host "[INFO] Lancez Rank Tracker pour continuer" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pret a continuer ? Suivez les etapes ci-dessus !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
