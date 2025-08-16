# Diagnostic Extension GLP1 RAG Assistant

Write-Host "🔍 DIAGNOSTIC EXTENSION GLP1" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

# Vérifier extension installée
Write-Host "📋 Extensions installées:" -ForegroundColor Yellow
code --list-extensions | Select-String "glp1"

Write-Host ""
Write-Host "🚀 Ouverture VS Code avec fichier de test..." -ForegroundColor Yellow
code "c:\Users\robin\Documents\glp1official\glp1\test-extension-final.js"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎯 TESTS À FAIRE DANS VS CODE:" -ForegroundColor Cyan
Write-Host "1. Ctrl+Shift+P puis tapez 'GLP1'" -ForegroundColor White
Write-Host "2. Vous devriez voir:" -ForegroundColor White
Write-Host "   • 🧪 GLP1: Test Extension" -ForegroundColor Green
Write-Host "   • 🤖 GLP1: Poser une Question RAG" -ForegroundColor Green
Write-Host "   • 💻 GLP1: Générer du Code" -ForegroundColor Green
Write-Host ""
Write-Host "3. Ou essayez Ctrl+Shift+Q" -ForegroundColor White
Write-Host ""
Write-Host "SI VOUS NE VOYEZ RIEN:" -ForegroundColor Red
Write-Host "- Redémarrez VS Code complètement" -ForegroundColor Yellow
Write-Host "- Attendez 5 secondes après ouverture" -ForegroundColor Yellow
Write-Host "- Essayez F1 au lieu de Ctrl+Shift+P" -ForegroundColor Yellow
