# Script de validation complète TinaCMS et métadonnées
# Version: 1.0
# Utilisation: .\scripts\validate-tina-setup.ps1

param(
    [switch]$FixIssues = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

Write-Host "=== VALIDATION TINACMS ET MÉTADONNÉES ===" -ForegroundColor Green
Write-Host "Mode: $(if($FixIssues){'Correction automatique'}else{'Validation uniquement'})" -ForegroundColor Gray

$issues = @()
$stats = @{
    TotalArticles = 0
    ValidArticles = 0
    MissingImages = 0
    MetadataErrors = 0
    Collections = 0
}

# 1. Vérification configuration TinaCMS
Write-Host "1. Configuration TinaCMS..." -ForegroundColor Cyan

if (-not (Test-Path "tina\config.ts")) {
    $issues += "❌ Configuration TinaCMS manquante (tina\config.ts)"
} else {
    $tinaConfig = Get-Content "tina\config.ts" -Raw
    
    if (-not ($tinaConfig -match "collections:")) {
        $issues += "❌ Collections TinaCMS non définies"
    }
    
    # Compter les collections
    $collectionsMatches = [regex]::Matches($tinaConfig, "name:\s*[`"']([^`"']+)[`"']")
    $stats.Collections = $collectionsMatches.Count
    
    Write-Host "   Collections configurées: $($stats.Collections)" -ForegroundColor Green
}

# 2. Vérification variables d'environnement
Write-Host "2. Variables d'environnement..." -ForegroundColor Cyan

$envVars = @("NEXT_PUBLIC_TINA_CLIENT_ID", "TINA_TOKEN", "NEXT_PUBLIC_TINA_BRANCH")
foreach ($var in $envVars) {
    if (-not (Get-Variable -Name $var -ValueOnly -ErrorAction SilentlyContinue)) {
        if ($var -eq "TINA_TOKEN") {
            Write-Host "   ⚠️  $var non définie (optionnelle en local)" -ForegroundColor Yellow
        } else {
            $issues += "⚠️  Variable d'environnement $var manquante"
        }
    } else {
        Write-Host "   $var: OK" -ForegroundColor Green
    }
}

# 3. Vérification des collections et articles
Write-Host "3. Analyse des collections..." -ForegroundColor Cyan

$collections = @("medicaments-glp1", "glp1-perte-de-poids", "glp1-cout", "glp1-diabete", 
                "effets-secondaires-glp1", "medecins-glp1-france", "recherche-glp1", 
                "regime-glp1", "alternatives-glp1")

$allErrors = @()
$missingThumbnails = @()

foreach ($collection in $collections) {
    $collectionPath = "src\content\$collection"
    if (-not (Test-Path $collectionPath)) {
        $issues += "❌ Collection manquante: $collection"
        continue
    }
    
    $articles = Get-ChildItem "$collectionPath\*.md"
    $stats.TotalArticles += $articles.Count
    
    if ($Verbose) {
        Write-Host "   Collection $collection : $($articles.Count) articles" -ForegroundColor Gray
    }
    
    foreach ($article in $articles) {
        $content = Get-Content $article.FullName -Raw
        $slug = $article.BaseName
        $errors = @()
        
        # Vérifier pubDate format
        if ($content -match "pubDate:\s*'([^']+)'") {
            $errors += "pubDate avec quotes"
            if ($FixIssues) {
                $content = $content -replace "pubDate:\s*'([^']+)'", "pubDate: `$1"
                Set-Content $article.FullName -Value $content -Encoding UTF8
                Write-Host "   ✓ Corrigé: $slug - pubDate" -ForegroundColor Green
            }
        }
        
        # Vérifier meta description
        if ($content -match "metaDescription:\s*`([^`]*)`") {
            $metaDesc = $matches[1]
            if ($metaDesc.Length -gt 160) {
                $errors += "meta description trop longue ($($metaDesc.Length) chars)"
                $stats.MetadataErrors++
            }
        } elseif ($content -match "metaDescription:\s*[`"']([^`"']*)[`"']") {
            $metaDesc = $matches[1]
            if ($metaDesc.Length -gt 160) {
                $errors += "meta description trop longue ($($metaDesc.Length) chars)"
                $stats.MetadataErrors++
            }
        } else {
            $errors += "meta description manquante"
            $stats.MetadataErrors++
        }
        
        # Vérifier thumbnail
        $thumbnailPath = "public\images\thumbnails\$slug-illus.jpg"
        if (-not (Test-Path $thumbnailPath)) {
            $missingThumbnails += "$slug ($collection)"
            $stats.MissingImages++
        }
        
        if ($errors.Count -eq 0) {
            $stats.ValidArticles++
        } else {
            $allErrors += "$slug : " + ($errors -join ", ")
        }
    }
}

# 4. Vérification structure des images
Write-Host "4. Structure des images..." -ForegroundColor Cyan

$thumbnailsPath = "public\images\thumbnails"
if (-not (Test-Path $thumbnailsPath)) {
    $issues += "❌ Dossier thumbnails manquant: $thumbnailsPath"
} else {
    $thumbnailCount = (Get-ChildItem "$thumbnailsPath\*-illus.jpg" -ErrorAction SilentlyContinue).Count
    Write-Host "   Images thumbnails: $thumbnailCount fichiers" -ForegroundColor Green
}

$uploadsPath = "public\images\uploads"
if (Test-Path $uploadsPath) {
    $uploadsCount = (Get-ChildItem $uploadsPath -Recurse -File -ErrorAction SilentlyContinue).Count
    Write-Host "   Images uploads: $uploadsCount fichiers" -ForegroundColor Green
}

# 5. Test de build
Write-Host "5. Test de validation Astro..." -ForegroundColor Cyan

try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Build Astro: OK" -ForegroundColor Green
    } else {
        $issues += "❌ Erreur de build Astro"
        if ($Verbose) {
            $buildOutput | Select-Object -Last 5 | ForEach-Object { 
                Write-Host "     $_" -ForegroundColor Red 
            }
        }
    }
} catch {
    $issues += "❌ Impossible d'exécuter le build: $($_.Exception.Message)"
}

# 6. Rapport final
Write-Host ""
Write-Host "=== RAPPORT DE VALIDATION ===" -ForegroundColor Green
Write-Host ""
Write-Host "📊 STATISTIQUES:" -ForegroundColor White
Write-Host "   Collections: $($stats.Collections)/9" -ForegroundColor $(if($stats.Collections -eq 9){'Green'}else{'Yellow'})
Write-Host "   Articles totaux: $($stats.TotalArticles)" -ForegroundColor Green
Write-Host "   Articles valides: $($stats.ValidArticles)/$($stats.TotalArticles)" -ForegroundColor $(if($stats.ValidArticles -eq $stats.TotalArticles){'Green'}else{'Yellow'})
Write-Host "   Images manquantes: $($stats.MissingImages)" -ForegroundColor $(if($stats.MissingImages -eq 0){'Green'}else{'Yellow'})
Write-Host "   Erreurs métadonnées: $($stats.MetadataErrors)" -ForegroundColor $(if($stats.MetadataErrors -eq 0){'Green'}else{'Yellow'})

if ($issues.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  PROBLÈMES DÉTECTÉS:" -ForegroundColor Yellow
    $issues | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
}

if ($allErrors.Count -gt 0 -and $Verbose) {
    Write-Host ""
    Write-Host "📝 ERREURS D'ARTICLES:" -ForegroundColor Yellow
    $allErrors | Select-Object -First 10 | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    if ($allErrors.Count -gt 10) {
        Write-Host "   ... et $($allErrors.Count - 10) autres erreurs" -ForegroundColor Gray
    }
}

if ($missingThumbnails.Count -gt 0 -and $Verbose) {
    Write-Host ""
    Write-Host "🖼️  IMAGES MANQUANTES:" -ForegroundColor Yellow
    $missingThumbnails | Select-Object -First 10 | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    if ($missingThumbnails.Count -gt 10) {
        Write-Host "   ... et $($missingThumbnails.Count - 10) autres images" -ForegroundColor Gray
    }
}

Write-Host ""
if ($issues.Count -eq 0 -and $stats.MetadataErrors -eq 0) {
    Write-Host "✅ VALIDATION RÉUSSIE - Système prêt pour le déploiement!" -ForegroundColor Green
} else {
    Write-Host "⚠️  VALIDATION AVEC AVERTISSEMENTS - Vérifiez les problèmes ci-dessus" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 COMMANDES UTILES:" -ForegroundColor Cyan
Write-Host "   Corriger automatiquement: .\scripts\validate-tina-setup.ps1 -FixIssues" -ForegroundColor White
Write-Host "   Rapport détaillé: .\scripts\validate-tina-setup.ps1 -Verbose" -ForegroundColor White
Write-Host "   Générer images manquantes: .\scripts\image-generator.mjs --missing-only" -ForegroundColor White
Write-Host "   Déployer: .\scripts\deployment\deploy-auto.ps1" -ForegroundColor White
