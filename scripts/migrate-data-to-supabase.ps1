# Script de migration des références data vers Supabase
# Version: 1.0
# Utilisation: .\scripts\migrate-data-to-supabase.ps1

param(
    [switch]$DryRun = $false,
    [switch]$Backup = $true
)

$ErrorActionPreference = "Continue"

Write-Host "=== MIGRATION DATA VERS SUPABASE ===" -ForegroundColor Green
Write-Host "Mode: $(if($DryRun){'Simulation (dry-run)'}else{'Execution réelle'})" -ForegroundColor Gray

$changes = @()
$filesToUpdate = @()

# 1. Identifier les fichiers utilisant encore data/
Write-Host "1. Recherche des références data/*.json..." -ForegroundColor Cyan

$dataReferences = @()
$searchPatterns = @(
    "data\/[a-zA-Z0-9\-_]+\.json",
    "data\\[a-zA-Z0-9\-_]+\.json",
    "'data/[^']*'",
    '"data/[^"]*"'
)

foreach ($pattern in $searchPatterns) {
    try {
        $matches = Select-String -Path "src\**\*.*" -Pattern $pattern -AllMatches 2>$null
        $dataReferences += $matches
    } catch {
        # Ignore les erreurs de recherche
    }
}

if ($dataReferences.Count -gt 0) {
    Write-Host "   Trouvé $($dataReferences.Count) références à corriger:" -ForegroundColor Yellow
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
    Write-Host "   ✓ Aucune référence data/*.json trouvée dans src/" -ForegroundColor Green
}

# 2. Vérifier les fichiers de documentation
Write-Host "2. Recherche dans la documentation..." -ForegroundColor Cyan

$docFiles = Get-ChildItem "docs\*.md" -Recurse
$docReferences = @()

foreach ($file in $docFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "data/[a-zA-Z0-9\-_]+\.json") {
        $docReferences += $file.FullName
        Write-Host "   $($file.Name) contient des références data/" -ForegroundColor Yellow
    }
}

# 3. Proposer les actions de migration
Write-Host ""
Write-Host "3. Actions de migration recommandées:" -ForegroundColor Magenta

if ($filesToUpdate.Count -gt 0) {
    Write-Host ""
    Write-Host "📁 FICHIERS CODE À MIGRER:" -ForegroundColor Yellow
    $filesToUpdate | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor Gray
        $changes += "Migrer $_ vers Supabase API"
    }
    
    Write-Host ""
    Write-Host "🔧 ACTIONS SUGGÉRÉES:" -ForegroundColor Cyan
    Write-Host "   1. Remplacer les imports JSON par des appels Supabase" -ForegroundColor White
    Write-Host "   2. Utiliser src/lib/supabase.ts pour les requêtes" -ForegroundColor White
    Write-Host "   3. Créer des fonctions d'API dans src/pages/api/" -ForegroundColor White
    Write-Host "   4. Mettre à jour les types TypeScript" -ForegroundColor White
}

if ($docReferences.Count -gt 0) {
    Write-Host ""
    Write-Host "📖 DOCUMENTATION À METTRE À JOUR:" -ForegroundColor Yellow
    $docReferences | ForEach-Object {
        $fileName = Split-Path $_ -Leaf
        Write-Host "   - $fileName" -ForegroundColor Gray
        $changes += "Mettre à jour documentation: $fileName"
    }
}

# 4. Vérifier le dossier data
Write-Host ""
Write-Host "4. Analyse du dossier data actuel:" -ForegroundColor Cyan

if (Test-Path "data") {
    $dataFiles = Get-ChildItem "data\*.json"
    Write-Host "   Fichiers présents: $($dataFiles.Count)" -ForegroundColor Green
    
    $totalSize = ($dataFiles | Measure-Object -Property Length -Sum).Sum
    $sizeMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host "   Taille totale: $sizeMB MB" -ForegroundColor Green
    
    if ($Backup -and -not $DryRun) {
        Write-Host "   Création sauvegarde..." -ForegroundColor Cyan
        $backupPath = "data-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item "data" $backupPath -Recurse
        Write-Host "   ✓ Sauvegarde créée: $backupPath" -ForegroundColor Green
    }
} else {
    Write-Host "   ✓ Dossier data déjà supprimé" -ForegroundColor Green
}

# 5. Vérifier la configuration Supabase
Write-Host ""
Write-Host "5. Vérification configuration Supabase:" -ForegroundColor Cyan

$supabaseConfigured = $false
if (Test-Path "src\lib\supabase.ts") {
    Write-Host "   ✓ Configuration Supabase trouvée" -ForegroundColor Green
    $supabaseConfigured = $true
} else {
    Write-Host "   ❌ Configuration Supabase manquante" -ForegroundColor Red
    $changes += "Créer src/lib/supabase.ts"
}

# Variables d'environnement
$envVars = @("PUBLIC_SUPABASE_URL", "PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY")
foreach ($var in $envVars) {
    $varValue = [System.Environment]::GetEnvironmentVariable($var)
    if ($varValue) {
        Write-Host "   ✓ $var configurée" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $var manquante" -ForegroundColor Yellow
        $changes += "Configurer variable d'environnement: $var"
    }
}

# 6. Résumé et actions
Write-Host ""
Write-Host "=== RÉSUMÉ DE LA MIGRATION ===" -ForegroundColor Green

if ($changes.Count -eq 0) {
    Write-Host "✅ MIGRATION COMPLÈTE - Aucune action requise!" -ForegroundColor Green
    Write-Host "   - Toutes les références data/ ont été migrées" -ForegroundColor Green
    Write-Host "   - Configuration Supabase opérationnelle" -ForegroundColor Green
} else {
    Write-Host "📋 ACTIONS À EFFECTUER: $($changes.Count)" -ForegroundColor Yellow
    $changes | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
}

Write-Host ""
Write-Host "💡 COMMANDES UTILES:" -ForegroundColor Cyan
Write-Host "   Supprimer dossier data: .\scripts\deployment\deploy-auto.ps1 -CleanLocalData" -ForegroundColor White
Write-Host "   Test Supabase: npm run db:test" -ForegroundColor White
Write-Host "   Migration dry-run: .\scripts\migrate-data-to-supabase.ps1 -DryRun" -ForegroundColor White

if (-not $DryRun -and $changes.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  MIGRATION INCOMPLÈTE" -ForegroundColor Yellow
    Write-Host "   Corrigez les fichiers listés avant de supprimer le dossier data" -ForegroundColor Yellow
}

# 7. Proposition de suppression du dossier data
if (-not $DryRun -and $changes.Count -eq 0 -and (Test-Path "data")) {
    Write-Host ""
    Write-Host "🗑️ SUPPRESSION DU DOSSIER DATA" -ForegroundColor Yellow
    $response = Read-Host "Supprimer le dossier data maintenant? (y/N)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "   Suppression en cours..." -ForegroundColor Cyan
        Remove-Item "data" -Recurse -Force
        Write-Host "   ✅ Dossier data supprimé!" -ForegroundColor Green
        Write-Host "   (Sauvegarde disponible dans $backupPath)" -ForegroundColor Gray
    } else {
        Write-Host "   Dossier data conservé" -ForegroundColor Gray
    }
}
