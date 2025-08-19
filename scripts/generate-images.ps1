#!/usr/bin/env pwsh

# Script PowerShell pour générer les images thumbnails

Write-Host "🎨 Génération des images thumbnails..." -ForegroundColor Cyan

# Vérifier que Node.js est installé
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire du projet
Set-Location $PSScriptRoot\..

# Exécuter le script de génération
Write-Host "📁 Exécution du script de génération..." -ForegroundColor Yellow
$process = Start-Process -FilePath "node" -ArgumentList "scripts/generate-thumbnails.mjs" -Wait -PassThru -NoNewWindow

if ($process.ExitCode -eq 0) {
    Write-Host "✅ Images générées avec succès !" -ForegroundColor Green
    Write-Host "📂 Images sauvegardées dans : /public/images/thumbnails/" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erreur lors de la génération des images (Code: $($process.ExitCode))" -ForegroundColor Red
}

Write-Host "`n🔍 Vérification des images générées..." -ForegroundColor Cyan
$thumbnailDir = "public/images/thumbnails"

if (Test-Path $thumbnailDir) {
    $imageCount = (Get-ChildItem $thumbnailDir -Filter "*.svg").Count
    Write-Host "📊 $imageCount images SVG trouvées dans $thumbnailDir" -ForegroundColor Green
} else {
    Write-Host "⚠️ Le dossier $thumbnailDir n'existe pas encore" -ForegroundColor Yellow
}
