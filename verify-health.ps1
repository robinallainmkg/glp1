param(
    [switch]$Quick,
    [switch]$Full
)

Write-Host "=== VERIFICATION SANTE SITE GLP-1 ===" -ForegroundColor Green
Write-Host ""

$issues = @()
$warnings = @()

# VERIFICATION 1: Configuration Locale
Write-Host "1. Configuration locale..." -ForegroundColor Cyan

if (-not (Test-Path "astro.config.mjs")) {
    $issues += "❌ astro.config.mjs manquant"
} else {
    Write-Host "   ✅ Configuration Astro presente" -ForegroundColor Green
}

if (-not (Test-Path "package.json")) {
    $issues += "❌ package.json manquant"
} else {
    $packageContent = Get-Content "package.json" | ConvertFrom-Json
    if ($packageContent.scripts.build) {
        Write-Host "   ✅ Script build configure" -ForegroundColor Green
    } else {
        $issues += "❌ Script build manquant dans package.json"
    }
}

# VERIFICATION 2: Structure des Dossiers
Write-Host "2. Structure des dossiers..." -ForegroundColor Cyan

$requiredFolders = @("src", "public", "src/pages", "src/layouts")
foreach ($folder in $requiredFolders) {
    if (Test-Path $folder) {
        Write-Host "   ✅ $folder" -ForegroundColor Green
    } else {
        $issues += "❌ Dossier manquant: $folder"
    }
}

# VERIFICATION 3: Fichiers Critiques
Write-Host "3. Fichiers critiques..." -ForegroundColor Cyan

$criticalFiles = @(
    "src/pages/index.astro",
    "src/pages/nouveaux-medicaments-perdre-poids.astro",
    "src/pages/qu-est-ce-que-glp1.astro"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        if ($size -gt 1000) {
            Write-Host "   ✅ $file ($($size/1024)KB)" -ForegroundColor Green
        } else {
            $warnings += "⚠️  $file trop petit ($size bytes)"
        }
    } else {
        $issues += "❌ Fichier critique manquant: $file"
    }
}

# VERIFICATION 4: Build Test
if (-not $Quick) {
    Write-Host "4. Test de build..." -ForegroundColor Cyan
    
    # Sauvegarde dist si existe
    $distBackup = $false
    if (Test-Path "dist") {
        Rename-Item "dist" "dist_backup"
        $distBackup = $true
        Write-Host "   💾 Sauvegarde dist existant" -ForegroundColor Gray
    }
    
    try {
        # Test build rapide
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            if (Test-Path "dist/index.html") {
                $indexSize = (Get-Item "dist/index.html").Length
                $pageCount = (Get-ChildItem "dist" -Recurse -Name "index.html").Count
                Write-Host "   ✅ Build OK: $pageCount pages, index=$($indexSize/1024)KB" -ForegroundColor Green
            } else {
                $issues += "❌ Build reussi mais index.html manquant"
            }
        } else {
            $issues += "❌ Echec de build"
            Write-Host "   Erreur build:" -ForegroundColor Red
            $buildOutput | Select-Object -Last 5 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        }
    } catch {
        $issues += "❌ Erreur lors du test de build: $($_.Exception.Message)"
    } finally {
        # Nettoyage et restauration
        if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
        if ($distBackup) {
            Rename-Item "dist_backup" "dist"
            Write-Host "   🔄 Dist original restaure" -ForegroundColor Gray
        }
    }
}

# VERIFICATION 5: Connectivité Serveur
if ($Full) {
    Write-Host "5. Test connectivite serveur..." -ForegroundColor Cyan
    
    $winscpPaths = @(
        "C:\Users\robin\AppData\Local\Programs\WinSCP\WinSCP.com",
        "${env:ProgramFiles}\WinSCP\WinSCP.com",
        "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com"
    )
    
    $winscpPath = $null
    foreach ($path in $winscpPaths) {
        if (Test-Path $path) {
            $winscpPath = $path
            break
        }
    }
    
    if ($winscpPath) {
        $testScript = @"
option batch on
open sftp://u403023291@147.79.98.140:65002 -password="_@%p8R*XG.s+/5)" -hostkey="ssh-ed25519 255 ryF1Sy3SwsauJOcEYq3xYVLfjAbN3LKJX3qRxdU1AHA"
cd domains/glp1-france.fr/public_html
ls index.html
close
exit
"@
        $testScript | Out-File -FilePath "health-check.txt" -Encoding UTF8
        try {
            & $winscpPath /script=health-check.txt > $null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Serveur accessible, index.html present" -ForegroundColor Green
            } else {
                $warnings += "⚠️  Probleme de connexion serveur ou fichier manquant"
            }
        } catch {
            $warnings += "⚠️  Erreur test serveur: $($_.Exception.Message)"
        } finally {
            if (Test-Path "health-check.txt") { Remove-Item "health-check.txt" }
        }
    } else {
        $warnings += "⚠️  WinSCP non trouve pour test serveur"
    }
}

# VERIFICATION 6: Configuration Deploy
Write-Host "6. Configuration deploiement..." -ForegroundColor Cyan

$deployScripts = @("deploy-auto.ps1", "deploy-securise.ps1")
foreach ($script in $deployScripts) {
    if (Test-Path $script) {
        # Vérifier le chemin dans le script
        $content = Get-Content $script -Raw
        if ($content -match "domains/glp1-france\.fr/public_html") {
            Write-Host "   ✅ $script - Chemin correct" -ForegroundColor Green
        } else {
            if ($content -match "domains/glp1-france\.fr") {
                $issues += "❌ $script - Chemin INCORRECT (manque public_html)"
            } else {
                $warnings += "⚠️  $script - Chemin non detecte"
            }
        }
    } else {
        $warnings += "⚠️  Script de deploiement manquant: $script"
    }
}

# VERIFICATION 7: Contenu SEO
if (-not $Quick) {
    Write-Host "7. Verification contenu SEO..." -ForegroundColor Cyan
    
    # Vérifier homepage
    if (Test-Path "src/pages/index.astro") {
        $homeContent = Get-Content "src/pages/index.astro" -Raw
        if ($homeContent -match "Ozempic.*Wegovy") {
            Write-Host "   ✅ Homepage - Mots-cles accessibles" -ForegroundColor Green
        } else {
            $warnings += "⚠️  Homepage - Strategie d'accessibilite a verifier"
        }
        
        if ($homeContent -match "nouveaux-medicaments-perdre-poids") {
            Write-Host "   ✅ Homepage - Lien vers landing page" -ForegroundColor Green
        } else {
            $warnings += "⚠️  Homepage - Lien landing page manquant"
        }
    }
}

Write-Host ""

# RAPPORT FINAL
Write-Host "=== RAPPORT DE SANTE ===" -ForegroundColor White

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 EXCELLENT: Aucun probleme detecte!" -ForegroundColor Green
    Write-Host "   Le site est pret pour le deploiement" -ForegroundColor White
} else {
    if ($issues.Count -gt 0) {
        Write-Host "🚨 PROBLEMES CRITIQUES ($($issues.Count)):" -ForegroundColor Red
        $issues | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  AVERTISSEMENTS ($($warnings.Count)):" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
        Write-Host ""
    }
}

# RECOMMANDATIONS
if ($issues.Count -gt 0) {
    Write-Host "📋 ACTIONS RECOMMANDEES:" -ForegroundColor Cyan
    Write-Host "   1. Corrigez les problemes critiques ci-dessus" -ForegroundColor White
    Write-Host "   2. Relancez: .\verify-health.ps1 -Full" -ForegroundColor White
    Write-Host "   3. Une fois OK, deployez avec: .\deploy-securise.ps1" -ForegroundColor White
} else {
    Write-Host "🚀 PRET POUR DEPLOIEMENT:" -ForegroundColor Green
    Write-Host "   Utilisez: .\deploy-securise.ps1 'Votre message'" -ForegroundColor White
}

Write-Host ""
Write-Host "🔧 Options disponibles:" -ForegroundColor Gray
Write-Host "   .\verify-health.ps1          # Verification rapide" -ForegroundColor Gray
Write-Host "   .\verify-health.ps1 -Full    # Verification complete avec serveur" -ForegroundColor Gray
Write-Host "   .\verify-health.ps1 -Quick   # Verification minimale" -ForegroundColor Gray

Write-Host ""
