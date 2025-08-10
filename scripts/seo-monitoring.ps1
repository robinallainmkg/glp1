# 🚀 SCRIPT AUTOMATION SEO - GLP1 FRANCE
# Automatise l'analyse SEO et génère des rapports

Write-Host "🚀 === AUTOMATION ANALYSE SEO - GLP1 FRANCE ===" -ForegroundColor Green
Write-Host "⏰ Démarrage : $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ProjectPath = "C:\Users\robin\projet\glp1-main"
$AnalysisScript = "scripts/seo-analysis/final-analysis.mjs"
$ReportDir = "seo-analysis"
$DashboardFile = "$ReportDir/dashboard.html"

# Vérification prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

if (!(Test-Path $ProjectPath)) {
    Write-Host "❌ Projet non trouvé : $ProjectPath" -ForegroundColor Red
    exit 1
}

Set-Location $ProjectPath

if (!(Test-Path $AnalysisScript)) {
    Write-Host "❌ Script d'analyse non trouvé : $AnalysisScript" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prérequis OK" -ForegroundColor Green
Write-Host ""

# Exécution de l'analyse
Write-Host "🔍 Lancement de l'analyse SEO..." -ForegroundColor Yellow
Write-Host "─" * 50

try {
    node $AnalysisScript
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Analyse terminée avec succès !" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'analyse (code: $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Vérification des fichiers générés
Write-Host ""
Write-Host "📂 Vérification des fichiers générés..." -ForegroundColor Yellow

$ReportFile = "$ReportDir/seo-analysis-report.json"
$DashboardPath = $DashboardFile

if (Test-Path $ReportFile) {
    $ReportSize = (Get-Item $ReportFile).Length
    Write-Host "✅ Rapport JSON généré : $ReportFile ($ReportSize bytes)" -ForegroundColor Green
} else {
    Write-Host "❌ Rapport JSON manquant : $ReportFile" -ForegroundColor Red
}

if (Test-Path $DashboardPath) {
    $DashboardSize = (Get-Item $DashboardPath).Length
    Write-Host "✅ Dashboard HTML généré : $DashboardPath ($DashboardSize bytes)" -ForegroundColor Green
} else {
    Write-Host "❌ Dashboard HTML manquant : $DashboardPath" -ForegroundColor Red
}

# Lecture du rapport pour afficher les statistiques
if (Test-Path $ReportFile) {
    Write-Host ""
    Write-Host "📊 === STATISTIQUES RAPIDES ===" -ForegroundColor Cyan
    
    try {
        $Report = Get-Content $ReportFile | ConvertFrom-Json
        
        Write-Host "📄 Pages analysées : $($Report.summary.totalPages)" -ForegroundColor White
        Write-Host "🔍 Mots-clés détectés : $($Report.summary.totalKeywords)" -ForegroundColor White
        Write-Host "📈 Score moyen : $($Report.summary.averageScore)/100" -ForegroundColor White
        
        $ExcellentPages = ($Report.pages | Where-Object { $_.overallScore -ge 80 }).Count
        $PoorPages = ($Report.pages | Where-Object { $_.overallScore -lt 50 }).Count
        
        Write-Host "✅ Pages excellentes (≥80) : $ExcellentPages" -ForegroundColor Green
        Write-Host "⚠️ Pages à améliorer (<50) : $PoorPages" -ForegroundColor Yellow
        
        # Top 3 mots-clés
        if ($Report.keywords) {
            Write-Host ""
            Write-Host "🏆 TOP 3 MOTS-CLÉS :" -ForegroundColor Cyan
            
            $TopKeywords = $Report.keywords.PSObject.Properties | 
                Sort-Object { $_.Value.averageScore } -Descending | 
                Select-Object -First 3
            
            $i = 1
            foreach ($kw in $TopKeywords) {
                $name = $kw.Name
                $score = $kw.Value.averageScore
                $pages = $kw.Value.pages.Count
                Write-Host "   $i. $name : $score/100 ($pages pages)" -ForegroundColor White
                $i++
            }
        }
        
        # Top problèmes
        if ($Report.summary.topIssues -and $Report.summary.topIssues.Count -gt 0) {
            Write-Host ""
            Write-Host "🚨 TOP PROBLÈMES :" -ForegroundColor Red
            
            foreach ($issue in $Report.summary.topIssues | Select-Object -First 3) {
                Write-Host "   • $($issue.issue) : $($issue.count) pages" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "⚠️ Erreur lecture rapport : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Options post-analyse
Write-Host ""
Write-Host "🎯 === OPTIONS POST-ANALYSE ===" -ForegroundColor Cyan

Write-Host "1. Ouvrir le dashboard dans le navigateur" -ForegroundColor White
Write-Host "2. Copier les rapports vers le dossier de déploiement" -ForegroundColor White
Write-Host "3. Programmer une analyse automatique" -ForegroundColor White
Write-Host "4. Quitter" -ForegroundColor White

do {
    $choice = Read-Host "`nChoisissez une option (1-4)"
    
    switch ($choice) {
        "1" {
            Write-Host "🌐 Ouverture du dashboard..." -ForegroundColor Green
            if (Test-Path $DashboardPath) {
                Start-Process $DashboardPath
            } else {
                Write-Host "❌ Dashboard non trouvé" -ForegroundColor Red
            }
        }
        
        "2" {
            $DeployPath = "..\glp1-deploy"
            if (Test-Path $DeployPath) {
                Write-Host "📁 Copie vers $DeployPath..." -ForegroundColor Green
                
                if (!(Test-Path "$DeployPath\seo-reports")) {
                    New-Item -Path "$DeployPath\seo-reports" -ItemType Directory | Out-Null
                }
                
                Copy-Item $ReportDir\* "$DeployPath\seo-reports\" -Recurse -Force
                Write-Host "✅ Rapports copiés vers le dossier de déploiement" -ForegroundColor Green
            } else {
                Write-Host "❌ Dossier de déploiement non trouvé : $DeployPath" -ForegroundColor Red
            }
        }
        
        "3" {
            Write-Host "⏰ Configuration analyse automatique..." -ForegroundColor Green
            Write-Host "📝 Créer une tâche planifiée Windows pour exécuter ce script quotidiennement ?" -ForegroundColor Yellow
            $automate = Read-Host "Créer la tâche ? (o/n)"
            
            if ($automate -eq "o" -or $automate -eq "O") {
                $TaskName = "SEO-Analysis-GLP1"
                $ScriptPath = (Get-Location).Path + "\scripts\seo-monitoring.ps1"
                
                Write-Host "🔧 Création de la tâche planifiée..." -ForegroundColor Green
                
                # Créer la tâche Windows (simplifiée)
                $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$ScriptPath`""
                $trigger = New-ScheduledTaskTrigger -Daily -At "06:00"
                $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
                
                try {
                    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Analyse SEO quotidienne GLP1-France" -Force
                    Write-Host "✅ Tâche planifiée créée : $TaskName (exécution quotidienne à 6h)" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Erreur création tâche : $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
        
        "4" {
            break
        }
        
        default {
            Write-Host "❌ Option invalide. Choisissez 1-4." -ForegroundColor Red
        }
    }
} while ($choice -ne "4")

Write-Host ""
Write-Host "🎉 === ANALYSE SEO TERMINÉE ===" -ForegroundColor Green
Write-Host "📂 Rapports disponibles dans : $ReportDir\" -ForegroundColor Cyan
Write-Host "📊 Dashboard : $DashboardPath" -ForegroundColor Cyan
Write-Host "⏰ Terminé à : $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Merci d'utiliser l'outil d'analyse SEO GLP1-France !" -ForegroundColor Green
