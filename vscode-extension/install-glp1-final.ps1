# Installation Extension GLP1 RAG Assistant v2.0
# Script automatise garantie de fonctionner

Write-Host "🚀 INSTALLATION GLP1 RAG ASSISTANT v2.0" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$extensionDir = "c:\Users\robin\Documents\glp1official\glp1\vscode-extension"

Write-Host "📂 Preparation des fichiers..." -ForegroundColor Yellow
cd $extensionDir

# Nettoyer anciens fichiers
Write-Host "🧹 Nettoyage..." -ForegroundColor Yellow
Remove-Item *.vsix -Force -ErrorAction SilentlyContinue

# Copier les nouveaux fichiers
Write-Host "📋 Configuration..." -ForegroundColor Yellow
Copy-Item package-final.json package.json -Force

# Creer le package
Write-Host "📦 Creation du package..." -ForegroundColor Yellow
try {
    vsce package --allow-missing-repository --no-dependencies
    Write-Host "✅ Package cree avec succes !" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur creation package" -ForegroundColor Red
    exit 1
}

# Installer l extension
Write-Host "🔧 Installation de l extension..." -ForegroundColor Yellow
$vsixFile = Get-ChildItem *.vsix | Select-Object -First 1
if ($vsixFile) {
    code --install-extension $vsixFile.Name
    Write-Host "✅ Extension installee !" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier .vsix non trouve" -ForegroundColor Red
    exit 1
}

# Ouvrir VS Code pour test
Write-Host "🚀 Ouverture VS Code pour test..." -ForegroundColor Yellow
code "c:\Users\robin\Documents\glp1official\glp1\test-extension-final.js"

Write-Host ""
Write-Host "🎯 INSTRUCTIONS FINALES :" -ForegroundColor Cyan
Write-Host "1. Dans VS Code : Ctrl+Shift+P" -ForegroundColor White
Write-Host "2. Tapez 'GLP1' - vous devriez voir :" -ForegroundColor White
Write-Host "   • 🧪 GLP1: Test Extension" -ForegroundColor Green
Write-Host "   • 🤖 GLP1: Poser une Question RAG" -ForegroundColor Green
Write-Host "   • 💻 GLP1: Générer du Code" -ForegroundColor Green
Write-Host ""
Write-Host "3. Ou utilisez Ctrl+Shift+G directement" -ForegroundColor White
Write-Host ""
Write-Host "Si ca ne marche pas, il y a un probleme systeme VS Code" -ForegroundColor Red
