# Script de migration des références data vers Supabase
# Version: 1.1 (sans emojis pour eviter problemes encodage)
# Utilisation: .\scripts\check-data-migration.ps1

param(
    [switch]$DryRun = $false,
    [switch]$Backup = $true
)

$ErrorActionPreference = "Continue"

Write-Host "=== MIGRATION DATA VERS SUPABASE ===" -ForegroundColor Green
Write-Host "Mode: $(if($DryRun){'Simulation (dry-run)'}else{'Execution reelle'})" -ForegroundColor Gray

$changes = @()
$filesToUpdate = @()

# 1. Identifier les fichiers utilisant encore data/
Write-Host "1. Recherche des references data/*.json..." -ForegroundColor Cyan

$dataReferences = @()
try {
    $dataReferences = Select-String -Path "src\**\*.*" -Pattern "data\/[a-zA-Z0-9\-_]+\.json" -AllMatches 2>$null
} catch {
    # Ignore les erreurs de recherche
}

if ($dataReferences.Count -gt 0) {
    Write-Host "   Trouve $($dataReferences.Count) references a corriger:" -ForegroundColor Yellow
    $dataReferences | ForEach-Object {
        $file = $_.Filename
        $line = $_.LineNumber
        $match = $_.Line.Trim()
        Write-Host "     ${file}:${line} - $match" -ForegroundColor Gray
        
        if ($file -notin $filesToUpdate) {
            $filesToUpdate += $file
        }
    }
} else {
    Write-Host "   OK - Aucune reference data/*.json trouvee dans src/" -ForegroundColor Green
}

# 2. Vérifier les fichiers de documentation
Write-Host "2. Recherche dans la documentation..." -ForegroundColor Cyan

$docFiles = Get-ChildItem "docs\*.md" -Recurse -ErrorAction SilentlyContinue
$docReferences = @()

foreach ($file in $docFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match "data/[a-zA-Z0-9\-_]+\.json") {
        $docReferences += $file.FullName
        Write-Host "   $($file.Name) contient des references data/" -ForegroundColor Yellow
    }
}

# 3. Vérifier le dossier data
Write-Host "3. Analyse du dossier data actuel:" -ForegroundColor Cyan

if (Test-Path "data") {
    $dataFiles = Get-ChildItem "data\*.json" -ErrorAction SilentlyContinue
    Write-Host "   Fichiers presens: $($dataFiles.Count)" -ForegroundColor Green
    
    if ($dataFiles.Count -gt 0) {
        $totalSize = ($dataFiles | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($totalSize / 1MB, 2)
        Write-Host "   Taille totale: $sizeMB MB" -ForegroundColor Green
    }
} else {
    Write-Host "   OK - Dossier data deja supprime" -ForegroundColor Green
}

# 4. Vérifier la configuration Supabase
Write-Host "4. Verification configuration Supabase:" -ForegroundColor Cyan

$supabaseConfigured = $false
if (Test-Path "src\lib\supabase.ts") {
    Write-Host "   OK - Configuration Supabase trouvee" -ForegroundColor Green
    $supabaseConfigured = $true
} else {
    Write-Host "   ERREUR - Configuration Supabase manquante" -ForegroundColor Red
    $changes += "Creer src/lib/supabase.ts"
}

# Variables d'environnement
$envVars = @("PUBLIC_SUPABASE_URL", "PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY")
foreach ($var in $envVars) {
    $varValue = [System.Environment]::GetEnvironmentVariable($var)
    if ($varValue) {
        Write-Host "   OK - $var configuree" -ForegroundColor Green
    } else {
        Write-Host "   ATTENTION - $var manquante" -ForegroundColor Yellow
        $changes += "Configurer variable d'environnement: $var"
    }
}

# 5. Résumé et actions
Write-Host ""
Write-Host "=== RESUME DE LA MIGRATION ===" -ForegroundColor Green

if ($filesToUpdate.Count -eq 0 -and $docReferences.Count -eq 0 -and $changes.Count -eq 0) {
    Write-Host "OK - MIGRATION COMPLETE - Aucune action requise!" -ForegroundColor Green
    Write-Host "   - Toutes les references data/ ont ete migrees" -ForegroundColor Green
    Write-Host "   - Configuration Supabase operationnelle" -ForegroundColor Green
} else {
    Write-Host "ACTIONS A EFFECTUER: $($changes.Count + $filesToUpdate.Count + $docReferences.Count)" -ForegroundColor Yellow
    
    if ($filesToUpdate.Count -gt 0) {
        Write-Host ""
        Write-Host "FICHIERS CODE A MIGRER:" -ForegroundColor Yellow
        $filesToUpdate | ForEach-Object {
            Write-Host "   - $_" -ForegroundColor Gray
        }
    }
    
    if ($docReferences.Count -gt 0) {
        Write-Host ""
        Write-Host "DOCUMENTATION A METTRE A JOUR:" -ForegroundColor Yellow
        $docReferences | ForEach-Object {
            $fileName = Split-Path $_ -Leaf
            Write-Host "   - $fileName" -ForegroundColor Gray
        }
    }
    
    if ($changes.Count -gt 0) {
        Write-Host ""
        Write-Host "AUTRES ACTIONS:" -ForegroundColor Yellow
        $changes | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
    }
}

Write-Host ""
Write-Host "COMMANDES UTILES:" -ForegroundColor Cyan
Write-Host "   Supprimer dossier data: .\scripts\deployment\deploy-auto.ps1 -CleanLocalData" -ForegroundColor White
Write-Host "   Test Supabase: npm run db:test" -ForegroundColor White
Write-Host "   Migration dry-run: .\scripts\check-data-migration.ps1 -DryRun" -ForegroundColor White

# 6. Proposition de suppression du dossier data
if (-not $DryRun -and $changes.Count -eq 0 -and $filesToUpdate.Count -eq 0 -and (Test-Path "data")) {
    Write-Host ""
    Write-Host "SUPPRESSION DU DOSSIER DATA" -ForegroundColor Yellow
    $response = Read-Host "Supprimer le dossier data maintenant? (y/N)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        if ($Backup) {
            Write-Host "   Creation sauvegarde..." -ForegroundColor Cyan
            $backupPath = "data-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            Copy-Item "data" $backupPath -Recurse
            Write-Host "   Sauvegarde creee: $backupPath" -ForegroundColor Green
        }
        
        Write-Host "   Suppression en cours..." -ForegroundColor Cyan
        Remove-Item "data" -Recurse -Force
        Write-Host "   OK - Dossier data supprime!" -ForegroundColor Green
        
        if ($Backup) {
            Write-Host "   (Sauvegarde disponible dans $backupPath)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   Dossier data conserve" -ForegroundColor Gray
    }
}
