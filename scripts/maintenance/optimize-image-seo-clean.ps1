# Script d'optimisation SEO des images
param(
    [string]$ImageName = "mariejourney9.png",
    [string]$ImagePath = "",
    [switch]$AnalyzeAll
)

# Chercher l'image dans différents dossiers possibles
$possiblePaths = @(
    "public\images\uploads",
    "public\images\home",
    "public\images\temoignages", 
    "public\images\experts",
    "public\images\produits",
    "c:\Users\robin\Documents\glp1official\glp1\public\images\uploads"
)

$imagePath = ""
$uploadsPath = ""

if ($ImagePath -ne "") {
    # Si un chemin spécifique est fourni
    $imagePath = $ImagePath
    $uploadsPath = Split-Path $ImagePath -Parent
} else {
    # Chercher l'image dans les dossiers possibles
    foreach ($path in $possiblePaths) {
        $fullPath = Join-Path (Get-Location) $path
        $testPath = Join-Path $fullPath $ImageName
        
        if (Test-Path $testPath) {
            $imagePath = $testPath
            $uploadsPath = $fullPath
            break
        }
    }
    
    # Si toujours pas trouvé, essayer les chemins absolus
    if ($imagePath -eq "") {
        foreach ($path in $possiblePaths) {
            if (Test-Path $path) {
                $testPath = Join-Path $path $ImageName
                if (Test-Path $testPath) {
                    $imagePath = $testPath
                    $uploadsPath = $path
                    break
                }
            }
        }
    }
}

Write-Host "=== OPTIMISATION SEO DES IMAGES ===" -ForegroundColor Cyan
Write-Host "Image cible : $ImageName" -ForegroundColor Green
Write-Host "Chemin recherche : $uploadsPath" -ForegroundColor Gray
Write-Host ""

# Analyser l'image
if (-not (Test-Path $imagePath)) {
    Write-Host "❌ Erreur : Image non trouvée dans les chemins suivants :" -ForegroundColor Red
    foreach ($path in $possiblePaths) {
        $testPath = Join-Path (Get-Location) $path
        $fullTestPath = Join-Path $testPath $ImageName
        Write-Host "   - $fullTestPath" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Images disponibles dans le projet :" -ForegroundColor Yellow
    foreach ($path in $possiblePaths) {
        $fullPath = Join-Path (Get-Location) $path
        if (Test-Path $fullPath) {
            Write-Host "Dans $fullPath :" -ForegroundColor Cyan
            Get-ChildItem $fullPath -Filter "*.png","*.jpg","*.jpeg","*.webp" -ErrorAction SilentlyContinue | ForEach-Object {
                Write-Host "   - $($_.Name)" -ForegroundColor Gray
            }
        }
    }
    exit 1
}

Write-Host "✅ Image trouvée : $imagePath" -ForegroundColor Green
Write-Host ""

$imageFile = Get-Item $imagePath
$sizeKB = [math]::Round($imageFile.Length / 1024, 2)
$sizeMB = [math]::Round($imageFile.Length / 1024 / 1024, 2)

Write-Host "ANALYSE DE L'IMAGE" -ForegroundColor Yellow
Write-Host "Nom : $($imageFile.Name)"
Write-Host "Taille : $sizeKB KB ($sizeMB MB)"
Write-Host "Cree : $($imageFile.CreationTime)"
Write-Host "Modifie : $($imageFile.LastWriteTime)"
Write-Host ""

# Calcul du score SEO
$score = 100
$issues = @()
$recommendations = @()

# Evaluation de la taille
if ($sizeKB -gt 1000) {
    $score -= 30
    $issues += "Taille trop importante ($sizeKB KB)"
    $recommendations += "Compresser l'image (objectif moins de 500 KB)"
} elseif ($sizeKB -gt 500) {
    $score -= 15
    $issues += "Taille elevee ($sizeKB KB)"
    $recommendations += "Compression recommendee (objectif moins de 300 KB)"
}

# Evaluation du nom de fichier
if ($imageFile.Name -notmatch '^[a-z0-9\-]+\.(jpg|jpeg|png|webp)$') {
    $score -= 20
    $issues += "Nom de fichier non optimise SEO"
    $recommendations += "Renommer avec des tirets et mots-cles"
}

# Evaluation du format
$ext = $imageFile.Extension.ToLower()
if ($ext -eq '.png' -and $sizeKB -gt 200) {
    $score -= 10
    $issues += "PNG volumineux - JPG serait plus efficace"
    $recommendations += "Convertir en JPG pour reduire la taille"
}

$finalScore = [math]::Max(0, $score)

Write-Host "SCORE SEO : $finalScore/100" -ForegroundColor $(if($finalScore -ge 80) {"Green"} elseif($finalScore -ge 60) {"Yellow"} else {"Red"})
Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "PROBLEMES DETECTES :" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue"
    }
    Write-Host ""
}

if ($recommendations.Count -gt 0) {
    Write-Host "RECOMMANDATIONS :" -ForegroundColor Green
    foreach ($rec in $recommendations) {
        Write-Host "  + $rec"
    }
    Write-Host ""
}

# Verification de l'utilisation
Write-Host "UTILISATION DANS LE SITE" -ForegroundColor Cyan
$usageCount = 0
$foundFiles = @()

# Chercher dans les fichiers Astro
Get-ChildItem -Path "src" -Recurse -Filter "*.astro" -ErrorAction SilentlyContinue | ForEach-Object {
    $content = (Get-Content $_.FullName -ErrorAction SilentlyContinue) -join "`n"
    if ($content -and $content -match [regex]::Escape($ImageName)) {
        $foundFiles += $_.Name
        $usageCount++
    }
}

# Chercher dans les fichiers JSON
Get-ChildItem -Path "data" -Recurse -Filter "*.json" -ErrorAction SilentlyContinue | ForEach-Object {
    $content = (Get-Content $_.FullName -ErrorAction SilentlyContinue) -join "`n"
    if ($content -and $content -match [regex]::Escape($ImageName)) {
        $foundFiles += $_.Name
        $usageCount++
    }
}

Write-Host "Utilisations trouvees : $usageCount"
if ($foundFiles.Count -gt 0) {
    foreach ($file in $foundFiles) {
        Write-Host "  - $file" -ForegroundColor Green
    }
} else {
    Write-Host "  Aucune utilisation detectee" -ForegroundColor Yellow
}
Write-Host ""

# Recommandations SEO detaillees
Write-Host "OPTIMISATIONS SEO RECOMMANDEES" -ForegroundColor Magenta
Write-Host ""

Write-Host "1. COMPRESSION :"
if ($sizeKB -gt 500) {
    Write-Host "   - Utiliser TinyPNG.com ou TinyJPG.com"
    Write-Host "   - Objectif : moins de 300 KB pour le web"
    Write-Host "   - Gain de vitesse de chargement significatif"
} else {
    Write-Host "   + Taille acceptable pour le web"
}

Write-Host ""
Write-Host "2. NOMMAGE SEO :"
if ($imageFile.Name -notmatch '^[a-z0-9\-]+\.(jpg|jpeg|png|webp)$') {
    Write-Host "   - Renommer : marie-transformation-glp1-avant-apres.jpg"
    Write-Host "   - Utiliser des mots-cles pertinents"
    Write-Host "   - Eviter espaces et caracteres speciaux"
} else {
    Write-Host "   + Nom SEO-friendly"
}

Write-Host ""
Write-Host "3. FORMAT :"
if ($ext -eq '.png' -and $sizeKB -gt 200) {
    Write-Host "   - Convertir en JPG (meilleure compression)"
    Write-Host "   - Ou utiliser WebP (support moderne)"
} else {
    Write-Host "   + Format adapte"
}

Write-Host ""
Write-Host "4. ATTRIBUTS HTML :"
Write-Host "   - Ajouter alt='Transformation Marie GLP-1 avant apres 18kg'"
Write-Host "   - Inclure loading='lazy' pour la performance"
Write-Host "   - Specifier width et height pour eviter le CLS"

Write-Host ""
Write-Host "5. PERFORMANCE WEB :"
Write-Host "   - Optimiser pour Core Web Vitals"
Write-Host "   - Utiliser des formats modernes (WebP, AVIF)"
Write-Host "   - Implementer le lazy loading"

Write-Host ""
if ($AnalyzeAll) {
    Write-Host "ANALYSE DE TOUTES LES IMAGES" -ForegroundColor Cyan
    Write-Host ""
    
    $allImages = Get-ChildItem -Path $uploadsPath -Filter "*.*" | Where-Object { $_.Extension -match '\.(png|jpg|jpeg|webp)$' }
    $problemImages = 0
    
    foreach ($img in $allImages) {
        $imgSizeKB = [math]::Round($img.Length / 1024, 2)
        $imgScore = 100
        
        if ($imgSizeKB -gt 1000) { $imgScore -= 30 }
        elseif ($imgSizeKB -gt 500) { $imgScore -= 15 }
        
        if ($img.Name -notmatch '^[a-z0-9\-]+\.(jpg|jpeg|png|webp)$') { $imgScore -= 20 }
        
        $status = if ($imgScore -ge 80) { "OK" } elseif ($imgScore -ge 60) { "WARN" } else { "FAIL" }
        $color = if ($imgScore -ge 80) { "Green" } elseif ($imgScore -ge 60) { "Yellow" } else { "Red" }
        
        Write-Host "$status $($img.Name) - $imgSizeKB KB - Score: $imgScore/100" -ForegroundColor $color
        
        if ($imgScore -lt 80) { $problemImages++ }
    }
    
    Write-Host ""
    Write-Host "Resume : $problemImages images necessitent une optimisation" -ForegroundColor $(if($problemImages -eq 0) {"Green"} else {"Yellow"})
}

Write-Host ""
Write-Host "OUTILS RECOMMANDES :" -ForegroundColor Green
Write-Host "- TinyPNG.com - Compression en ligne gratuite"
Write-Host "- Squoosh.app - Outil Google pour compression"
Write-Host "- GIMP - Edition et export optimise"
Write-Host "- ImageOptim - Outil local pour Mac/PC"

Write-Host ""
Write-Host "ANALYSE TERMINEE" -ForegroundColor Green
