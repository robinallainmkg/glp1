# Test Extension GLP1 - Redemarrage Force

Write-Host "Test Extension GLP1 avec redemarrage VS Code" -ForegroundColor Green

# Verifier extension
$extensions = code --list-extensions
if ($extensions -match "glp1-publisher.glp1-rag-assistant") {
    Write-Host "Extension GLP1 trouvee !" -ForegroundColor Green
} else {
    Write-Host "Extension non trouvee" -ForegroundColor Red
    exit 1
}

# Fermer VS Code
Write-Host "Fermeture VS Code..." -ForegroundColor Yellow
Get-Process Code -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# Redemarrer VS Code
Write-Host "Redemarrage VS Code..." -ForegroundColor Yellow
code "c:\Users\robin\Documents\glp1official\glp1\test-glp1-extension.js"

Write-Host ""
Write-Host "ATTENDEZ 5 secondes pour activation..." -ForegroundColor Red
Write-Host ""
Write-Host "PUIS TESTEZ:" -ForegroundColor Cyan
Write-Host "1. Ctrl+Shift+P puis tapez 'GLP1'"
Write-Host "2. Ou Ctrl+Shift+G pour question RAG"
Write-Host ""
Write-Host "Questions test:"
Write-Host "- Quel est le prix d'Ozempic en France ?"
Write-Host "- Difference entre Ozempic et Wegovy ?"
