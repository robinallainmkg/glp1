# Script pour tester l'extension GLP1 avec redémarrage forcé

Write-Host "🔄 Test Extension GLP1 avec redémarrage VS Code" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Vérifier l'extension
$extensions = code --list-extensions
if ($extensions -match "glp1-publisher.glp1-rag-assistant") {
    Write-Host "✅ Extension GLP1 trouvée !" -ForegroundColor Green
} else {
    Write-Host "❌ Extension non trouvée - Reinstallation..." -ForegroundColor Red
    code --install-extension "c:\Users\robin\Documents\glp1official\glp1\vscode-extension\glp1-rag-assistant-1.0.2.vsix"
}

# Fermer tous les processus VS Code
Write-Host "🔄 Fermeture de tous les processus VS Code..." -ForegroundColor Yellow
Get-Process Code -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Redémarrer VS Code avec le fichier de test
Write-Host "🚀 Redémarrage VS Code avec fichier de test..." -ForegroundColor Yellow
code "c:\Users\robin\Documents\glp1official\glp1\test-glp1-extension.js"

Write-Host ""
Write-Host "⏰ ATTENDEZ 5 secondes pour l'activation..." -ForegroundColor Red
Write-Host ""
Write-Host "📝 PUIS TESTEZ DANS VS CODE:" -ForegroundColor Cyan
Write-Host "1. Ctrl+Shift+P puis tapez 'GLP1'" -ForegroundColor White
Write-Host "2. Ou directement Ctrl+Shift+G pour question RAG" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Questions test:" -ForegroundColor Cyan
Write-Host "- 'Quel est le prix d'Ozempic en France ?'" -ForegroundColor White
Write-Host "- 'Différence entre Ozempic et Wegovy ?'" -ForegroundColor White
