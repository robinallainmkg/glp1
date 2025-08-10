# Script simplifié pour débuter avec Rank Tracker
# Fichier : scripts/rank-tracker-simple.ps1

Write-Host "🎯 GUIDE RANK TRACKER - ÉTAPES SUIVANTES" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Rank Tracker installé" -ForegroundColor Green
Write-Host "✅ Domaine configuré" -ForegroundColor Green
Write-Host "✅ Dossier exports créé" -ForegroundColor Green
Write-Host ""

Write-Host "📋 PROCHAINES ÉTAPES :" -ForegroundColor Yellow
Write-Host ""

Write-Host "1 - IMPORTER LES MOTS-CLES" -ForegroundColor Cyan
Write-Host "   - Dans Rank Tracker > Target Keywords > Add Keywords" -ForegroundColor White
Write-Host "   - Import from file > Selectionner :" -ForegroundColor White
Write-Host "     $PWD\keywords-import-rank-tracker.csv" -ForegroundColor Cyan
Write-Host ""

Write-Host "2 - SCANNER LES POSITIONS" -ForegroundColor Cyan
Write-Host "   - Cliquer sur 'Check Rankings'" -ForegroundColor White
Write-Host "   - Attendre 2-3 minutes" -ForegroundColor White
Write-Host ""

Write-Host "3 - EXPORTER LES DONNEES" -ForegroundColor Cyan
Write-Host "   - Selectionner tous les mots-cles (Ctrl+A)" -ForegroundColor White
Write-Host "   - Clic droit > Export > Export to CSV" -ForegroundColor White
Write-Host "   - Sauvegarder dans : C:\SEO\exports\rankings-$(Get-Date -Format 'yyyy-MM-dd').csv" -ForegroundColor Cyan
Write-Host ""

Write-Host "4 - ANALYSER AVEC LE SCRIPT" -ForegroundColor Cyan
Write-Host "   - Executer : .\scripts\analyze-rankings.ps1" -ForegroundColor White
Write-Host ""

Write-Host "AIDE MOTS-CLES CONFIGURES :" -ForegroundColor Magenta
Write-Host ""

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
    "ozempic effet secondaire"
)

for ($i = 0; $i -lt $Keywords.Count; $i++) {
    Write-Host "   $($i+1). $($Keywords[$i])" -ForegroundColor White
}

Write-Host ""
Write-Host "BESOIN D'AIDE ?" -ForegroundColor Yellow
Write-Host "   - Relancez ce script a tout moment" -ForegroundColor White
Write-Host "   - Les instructions sont dans QUICK_START_RANK_TRACKER.md" -ForegroundColor White
Write-Host ""

# Vérifier si Rank Tracker est en cours d'exécution
$RankTrackerProcess = Get-Process -Name "RankTracker" -ErrorAction SilentlyContinue
if ($RankTrackerProcess) {
    Write-Host "✅ Rank Tracker est en cours d'exécution" -ForegroundColor Green
} else {
    Write-Host "⚠️ Rank Tracker n'est pas démarré" -ForegroundColor Yellow
    Write-Host "   Lancez Rank Tracker et ouvrez votre projet GLP1-France" -ForegroundColor White
}

Write-Host ""
Write-Host "🚀 Prêt à continuer ? Suivez les étapes ci-dessus !" -ForegroundColor Green
