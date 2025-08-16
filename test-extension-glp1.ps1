# Script de test pour l'extension GLP1 RAG Assistant

Write-Host "🚀 Test Extension GLP1 RAG Assistant" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Vérifier que l'extension est installée
Write-Host "📋 Vérification de l'installation..." -ForegroundColor Yellow
$extensions = code --list-extensions
if ($extensions -match "glp1-publisher.glp1-rag-assistant") {
    Write-Host "✅ Extension GLP1 RAG Assistant trouvée !" -ForegroundColor Green
} else {
    Write-Host "❌ Extension non trouvée" -ForegroundColor Red
    Write-Host "Extensions installées:" -ForegroundColor Yellow
    $extensions
    exit 1
}

# Ouvrir VS Code avec le fichier de test
Write-Host "🔧 Ouverture de VS Code avec fichier de test..." -ForegroundColor Yellow
code "c:\Users\robin\Documents\glp1official\glp1\test-glp1-extension.js"

Write-Host ""
Write-Host "📝 INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. Dans VS Code, appuyez sur Ctrl+Shift+P" -ForegroundColor White
Write-Host "2. Tapez 'GLP1' pour voir les commandes" -ForegroundColor White
Write-Host "3. Ou utilisez directement:" -ForegroundColor White
Write-Host "   - Ctrl+Shift+G pour poser une question RAG" -ForegroundColor White
Write-Host "   - Ctrl+Shift+C pour générer du code" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Questions test à essayer:" -ForegroundColor Cyan
Write-Host "- 'Quel est le prix d'Ozempic en France ?'" -ForegroundColor White
Write-Host "- 'Différence entre Ozempic et Wegovy ?'" -ForegroundColor White
Write-Host "- 'Effets secondaires GLP1 ?'" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Si les commandes n'apparaissent pas:" -ForegroundColor Red
Write-Host "- Redémarrez VS Code complètement" -ForegroundColor White
Write-Host "- Attendez quelques secondes après ouverture" -ForegroundColor White
Write-Host "- L'extension s'active au demarrage maintenant" -ForegroundColor White
