# Script d'automatisation SEO pour GLP-1 France
# PowerShell script pour monitoring automatique

param(
    [string]$Mode = "report",  # report, deploy, full
    [switch]$Force = $false
)

Write-Host "🏥 GLP-1 France - Automatisation SEO" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$ProjectPath = "C:\Users\robin\projet\glp1-main"
Set-Location $ProjectPath

# === FONCTION: MONITORING SEO ===
function Start-SEOMonitoring {
    Write-Host "`n📊 Lancement du monitoring SEO..." -ForegroundColor Yellow
    
    try {
        # Exécution du script de monitoring
        node scripts/seo-monitor.mjs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Monitoring SEO terminé avec succès" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Erreur lors du monitoring SEO" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Erreur d'exécution: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# === FONCTION: VÉRIFICATION DU CONTENU ===
function Test-ContentQuality {
    Write-Host "`n🔍 Vérification de la qualité du contenu..." -ForegroundColor Yellow
    
    $issues = @()
    
    # Vérification des articles vides
    $emptyFiles = Get-ChildItem -Path "src\content" -Recurse -Filter "*.md" | Where-Object {
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $wordCount = ($content -split '\s+' | Where-Object { $_ -ne '' }).Count
            return $wordCount -lt 200
        }
        return $true
    }
    
    if ($emptyFiles.Count -gt 0) {
        $issues += "📝 $($emptyFiles.Count) articles vides détectés"
    }
    
    # Vérification des images manquantes
    $missingImages = Get-ChildItem -Path "src\content" -Recurse -Filter "*.md" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and $content -match '!\[[^\]]*\]\(([^)]+)\)') {
            $imagePaths = [regex]::Matches($content, '!\[[^\]]*\]\(([^)]+)\)') | ForEach-Object { $_.Groups[1].Value }
            foreach ($imagePath in $imagePaths) {
                if ($imagePath -notmatch '^https?://' -and -not (Test-Path (Join-Path "public" $imagePath))) {
                    "$($_.Name): $imagePath"
                }
            }
        }
    }
    
    if ($missingImages.Count -gt 0) {
        $issues += "🖼️ $($missingImages.Count) images manquantes détectées"
    }
    
    if ($issues.Count -eq 0) {
        Write-Host "✅ Aucun problème de qualité détecté" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️ Problèmes détectés:" -ForegroundColor Yellow
        $issues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
        return $false
    }
}

# === FONCTION: BUILD ET TEST ===
function Invoke-BuildAndTest {
    Write-Host "`n🔨 Build et test du site..." -ForegroundColor Yellow
    
    try {
        # Build du site
        npm run build
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Erreur lors du build" -ForegroundColor Red
            return $false
        }
        
        Write-Host "✅ Build réussi" -ForegroundColor Green
        
        # Vérification des tailles de fichiers
        $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "📦 Taille du build: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
        
        # Comptage des pages générées
        $pageCount = (Get-ChildItem -Path "dist" -Recurse -Filter "*.html").Count
        Write-Host "📄 Pages générées: $pageCount" -ForegroundColor Cyan
        
        return $true
    }
    catch {
        Write-Host "❌ Erreur lors du build: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# === FONCTION: DÉPLOIEMENT ===
function Start-Deployment {
    Write-Host "`n🚀 Déploiement du site..." -ForegroundColor Yellow
    
    try {
        .\deploy-auto.ps1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Déploiement réussi" -ForegroundColor Green
            Write-Host "🌐 Site accessible: https://glp1-france.fr" -ForegroundColor Cyan
            return $true
        } else {
            Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Erreur de déploiement: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# === FONCTION: GÉNÉRATION DE CONTENU ===
function Start-ContentGeneration {
    Write-Host "`n✍️ Génération de contenu automatique..." -ForegroundColor Yellow
    
    # Vérifie si des scripts de génération existent
    $contentScripts = @(
        "scripts\generate-medicaments-content.mjs",
        "scripts\complete-medicaments-content.mjs"
    )
    
    $executed = $false
    
    foreach ($script in $contentScripts) {
        if (Test-Path $script) {
            Write-Host "🔄 Exécution de $script..." -ForegroundColor Cyan
            try {
                node $script
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ $script exécuté avec succès" -ForegroundColor Green
                    $executed = $true
                } else {
                    Write-Host "⚠️ Avertissements dans $script" -ForegroundColor Yellow
                }
            }
            catch {
                Write-Host "❌ Erreur dans $script`: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    if (-not $executed) {
        Write-Host "ℹ️ Aucun script de génération de contenu trouvé" -ForegroundColor Cyan
    }
    
    return $executed
}

# === FONCTION: NETTOYAGE ===
function Clear-TempFiles {
    Write-Host "`n🧹 Nettoyage des fichiers temporaires..." -ForegroundColor Yellow
    
    $tempPaths = @("dist", "node_modules\.cache", ".astro")
    
    foreach ($path in $tempPaths) {
        if (Test-Path $path) {
            try {
                Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "🗑️ Supprimé: $path" -ForegroundColor Gray
            }
            catch {
                Write-Host "⚠️ Impossible de supprimer: $path" -ForegroundColor Yellow
            }
        }
    }
}

# === FONCTION: RAPPORT FINAL ===
function Show-FinalReport {
    Write-Host "`n📋 RAPPORT FINAL" -ForegroundColor Magenta
    Write-Host "================" -ForegroundColor Magenta
    
    # Informations Git
    $gitBranch = git branch --show-current 2>$null
    $gitCommit = git rev-parse --short HEAD 2>$null
    
    Write-Host "🔧 Branche: $gitBranch" -ForegroundColor Cyan
    Write-Host "📝 Commit: $gitCommit" -ForegroundColor Cyan
    
    # Informations sur les rapports
    if (Test-Path "reports\latest-report.md") {
        $reportTime = (Get-Item "reports\latest-report.md").LastWriteTime
        Write-Host "📊 Dernier rapport SEO: $($reportTime.ToString('dd/MM/yyyy HH:mm'))" -ForegroundColor Cyan
    }
    
    # Statut du site
    Write-Host "🌐 Site en production: https://glp1-france.fr" -ForegroundColor Green
    Write-Host "🔧 Dashboard admin: https://glp1-france.fr/admin-stats" -ForegroundColor Green
    
    Write-Host "`n✨ Automatisation terminée avec succès!" -ForegroundColor Green
}

# === EXECUTION PRINCIPALE ===
Write-Host "Mode d'exécution: $Mode" -ForegroundColor Cyan

switch ($Mode) {
    "report" {
        Write-Host "📊 Mode: Rapport SEO uniquement" -ForegroundColor Yellow
        $success = Start-SEOMonitoring
        if ($success) {
            Show-FinalReport
        }
    }
    
    "content" {
        Write-Host "✍️ Mode: Génération de contenu" -ForegroundColor Yellow
        Start-ContentGeneration
        Test-ContentQuality
        if (Invoke-BuildAndTest) {
            Write-Host "✅ Contenu généré et testé avec succès" -ForegroundColor Green
        }
    }
    
    "deploy" {
        Write-Host "🚀 Mode: Déploiement" -ForegroundColor Yellow
        if (Invoke-BuildAndTest) {
            Start-Deployment
            Start-SEOMonitoring
            Show-FinalReport
        }
    }
    
    "full" {
        Write-Host "🎯 Mode: Automatisation complète" -ForegroundColor Yellow
        
        # 1. Monitoring initial
        Write-Host "`n1️⃣ PHASE 1: Monitoring initial" -ForegroundColor Magenta
        Start-SEOMonitoring
        
        # 2. Génération de contenu
        Write-Host "`n2️⃣ PHASE 2: Génération de contenu" -ForegroundColor Magenta
        Start-ContentGeneration
        
        # 3. Vérification qualité
        Write-Host "`n3️⃣ PHASE 3: Vérification qualité" -ForegroundColor Magenta
        $qualityOk = Test-ContentQuality
        
        # 4. Build et test
        Write-Host "`n4️⃣ PHASE 4: Build et test" -ForegroundColor Magenta
        $buildOk = Invoke-BuildAndTest
        
        # 5. Déploiement (si tout est OK ou si Force)
        if ($buildOk -and ($qualityOk -or $Force)) {
            Write-Host "`n5️⃣ PHASE 5: Déploiement" -ForegroundColor Magenta
            Start-Deployment
        } else {
            Write-Host "`n⚠️ Déploiement annulé (problèmes détectés). Utilisez -Force pour forcer." -ForegroundColor Yellow
        }
        
        # 6. Monitoring final
        Write-Host "`n6️⃣ PHASE 6: Monitoring final" -ForegroundColor Magenta
        Start-SEOMonitoring
        
        # 7. Rapport final
        Show-FinalReport
    }
    
    "clean" {
        Write-Host "🧹 Mode: Nettoyage" -ForegroundColor Yellow
        Clear-TempFiles
        Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
    }
    
    default {
        Write-Host "❌ Mode inconnu: $Mode" -ForegroundColor Red
        Write-Host "Modes disponibles: report, content, deploy, full, clean" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n🎉 Script terminé!" -ForegroundColor Green
