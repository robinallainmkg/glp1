# Test Extension GLP1 RAG Assistant

Write-Host "Extension GLP1 RAG Assistant Test" -ForegroundColor Green

# Verifier extension
$extensions = code --list-extensions
if ($extensions -match "glp1-publisher.glp1-rag-assistant") {
    Write-Host "Extension trouvee !" -ForegroundColor Green
} else {
    Write-Host "Extension non trouvee" -ForegroundColor Red
    exit 1
}

# Ouvrir VS Code
Write-Host "Ouverture VS Code..." -ForegroundColor Yellow
code "c:\Users\robin\Documents\glp1official\glp1\test-glp1-extension.js"

Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. Dans VS Code, appuyez sur Ctrl+Shift+P"
Write-Host "2. Tapez 'GLP1' pour voir les commandes"
Write-Host "3. Ou utilisez Ctrl+Shift+G pour question RAG"
Write-Host ""
Write-Host "Si pas de commandes visibles:"
Write-Host "- Redemarrez VS Code completement"
Write-Host "- Attendez quelques secondes"
