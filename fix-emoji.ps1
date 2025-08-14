# Script pour corriger l'emoji cassé
$content = Get-Content "src\pages\quel-traitement-glp1-choisir.astro" -Raw -Encoding UTF8
$fixedContent = $content -replace "�", "🩹"
$fixedContent | Set-Content "src\pages\quel-traitement-glp1-choisir.astro" -Encoding UTF8
Write-Host "Emoji corrigé avec succès !"
