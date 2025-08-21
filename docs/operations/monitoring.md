# Maintenance et Monitoring - GLP-1 France

## 📋 Vue d'ensemble

Documentation complète des procédures de maintenance, monitoring système, et gestion des performances du site GLP-1 France.

## 🔍 Monitoring Système

### Métriques Clés à Surveiller

```typescript
// Types de métriques
interface SystemMetrics {
  performance: {
    page_load_time: number;     // Temps de chargement (ms)
    core_web_vitals: {
      lcp: number;              // Largest Contentful Paint
      fid: number;              // First Input Delay
      cls: number;              // Cumulative Layout Shift
    };
    lighthouse_score: number;   // Score Lighthouse global
  };
  
  availability: {
    uptime_percentage: number;  // Disponibilité (%)
    response_time: number;      // Temps de réponse API (ms)
    error_rate: number;         // Taux d'erreur (%)
  };
  
  business: {
    daily_visitors: number;     // Visiteurs quotidiens
    newsletter_signups: number; // Inscriptions newsletter
    guide_downloads: number;    // Téléchargements guide
    contact_submissions: number; // Soumissions contact
    affiliate_clicks: number;   // Clics affiliés
  };
  
  technical: {
    build_time: number;         // Temps de build (s)
    bundle_size: number;        // Taille bundle (KB)
    image_optimization: number; // Taux optimisation images (%)
    cache_hit_rate: number;     // Taux de cache (%)
  };
}
```

### Dashboard de Monitoring

```typescript
// utils/monitoring-dashboard.ts
export class MonitoringDashboard {
  private metrics: SystemMetrics[] = [];
  
  async collectMetrics(): Promise<SystemMetrics> {
    const [performance, availability, business, technical] = await Promise.all([
      this.collectPerformanceMetrics(),
      this.collectAvailabilityMetrics(),
      this.collectBusinessMetrics(),
      this.collectTechnicalMetrics()
    ]);
    
    const currentMetrics: SystemMetrics = {
      performance,
      availability,
      business,
      technical
    };
    
    this.metrics.push(currentMetrics);
    this.saveMetrics(currentMetrics);
    
    return currentMetrics;
  }
  
  private async collectPerformanceMetrics() {
    // Utiliser Web Vitals API ou outils externes
    try {
      const vitals = await this.getWebVitals();
      const lighthouse = await this.getLighthouseScore();
      
      return {
        page_load_time: vitals.loadTime,
        core_web_vitals: {
          lcp: vitals.lcp,
          fid: vitals.fid,
          cls: vitals.cls
        },
        lighthouse_score: lighthouse.overall
      };
    } catch (error) {
      console.error('Erreur collecte performance:', error);
      return this.getDefaultPerformanceMetrics();
    }
  }
  
  private async collectAvailabilityMetrics() {
    const results = await Promise.allSettled([
      this.pingEndpoint('https://glp1-france.fr'),
      this.pingEndpoint('https://glp1-france.fr/api/users'),
      this.pingEndpoint('https://glp1-france.fr/contact')
    ]);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const uptime = (successCount / results.length) * 100;
    
    return {
      uptime_percentage: uptime,
      response_time: await this.getAverageResponseTime(),
      error_rate: await this.getErrorRate()
    };
  }
  
  private async collectBusinessMetrics() {
    const [visitors, signups, downloads, contacts, clicks] = await Promise.all([
      this.getDailyVisitors(),
      this.getNewsletterSignups(),
      this.getGuideDownloads(),
      this.getContactSubmissions(),
      this.getAffiliateClicks()
    ]);
    
    return {
      daily_visitors: visitors,
      newsletter_signups: signups,
      guide_downloads: downloads,
      contact_submissions: contacts,
      affiliate_clicks: clicks
    };
  }
  
  private async collectTechnicalMetrics() {
    return {
      build_time: await this.getLastBuildTime(),
      bundle_size: await this.getBundleSize(),
      image_optimization: await this.getImageOptimizationRate(),
      cache_hit_rate: await this.getCacheHitRate()
    };
  }
  
  generateReport(period: 'day' | 'week' | 'month' = 'day'): string {
    const recentMetrics = this.getMetricsForPeriod(period);
    
    if (recentMetrics.length === 0) {
      return 'Aucune métrique disponible pour la période';
    }
    
    const latest = recentMetrics[recentMetrics.length - 1];
    const averages = this.calculateAverages(recentMetrics);
    
    return this.formatReport(latest, averages, period);
  }
  
  private formatReport(latest: SystemMetrics, averages: SystemMetrics, period: string): string {
    const formatNumber = (num: number, unit: string = '') => {
      return `${Math.round(num * 100) / 100}${unit}`;
    };
    
    return `
# 📊 Rapport de Monitoring - ${period}
*Généré le ${new Date().toLocaleString('fr-FR')}*

## 🚀 Performance
- **Temps de chargement**: ${formatNumber(latest.performance.page_load_time, 'ms')} (moy: ${formatNumber(averages.performance.page_load_time, 'ms')})
- **Lighthouse Score**: ${formatNumber(latest.performance.lighthouse_score, '/100')}
- **Core Web Vitals**:
  - LCP: ${formatNumber(latest.performance.core_web_vitals.lcp, 'ms')}
  - FID: ${formatNumber(latest.performance.core_web_vitals.fid, 'ms')}
  - CLS: ${formatNumber(latest.performance.core_web_vitals.cls)}

## 🔌 Disponibilité
- **Uptime**: ${formatNumber(latest.availability.uptime_percentage, '%')}
- **Temps de réponse**: ${formatNumber(latest.availability.response_time, 'ms')}
- **Taux d'erreur**: ${formatNumber(latest.availability.error_rate, '%')}

## 📈 Business
- **Visiteurs quotidiens**: ${latest.business.daily_visitors}
- **Inscriptions newsletter**: ${latest.business.newsletter_signups}
- **Téléchargements guide**: ${latest.business.guide_downloads}
- **Messages contact**: ${latest.business.contact_submissions}
- **Clics affiliés**: ${latest.business.affiliate_clicks}

## ⚙️  Technique
- **Temps de build**: ${formatNumber(latest.technical.build_time, 's')}
- **Taille bundle**: ${formatNumber(latest.technical.bundle_size, 'KB')}
- **Optimisation images**: ${formatNumber(latest.technical.image_optimization, '%')}
- **Cache hit rate**: ${formatNumber(latest.technical.cache_hit_rate, '%')}

---
*Monitoring automatique GLP-1 France*
`;
  }
}
```

### Alertes Automatiques

```typescript
// utils/alert-system.ts
export class AlertSystem {
  private thresholds = {
    performance: {
      page_load_time: 3000,    // 3s max
      lighthouse_score: 80,    // Score min 80
      lcp: 2500,              // 2.5s max
      cls: 0.1                // 0.1 max
    },
    availability: {
      uptime_percentage: 99,   // 99% min
      response_time: 1000,     // 1s max
      error_rate: 5            // 5% max
    },
    business: {
      daily_visitors_drop: 50, // -50% alerte
      error_spike: 10          // +10 erreurs/h
    }
  };
  
  checkAlerts(metrics: SystemMetrics): Alert[] {
    const alerts: Alert[] = [];
    
    // Performance alerts
    if (metrics.performance.page_load_time > this.thresholds.performance.page_load_time) {
      alerts.push({
        type: 'performance',
        severity: 'warning',
        message: `Temps de chargement élevé: ${metrics.performance.page_load_time}ms`,
        metric: 'page_load_time',
        value: metrics.performance.page_load_time,
        threshold: this.thresholds.performance.page_load_time
      });
    }
    
    if (metrics.performance.lighthouse_score < this.thresholds.performance.lighthouse_score) {
      alerts.push({
        type: 'performance',
        severity: 'warning',
        message: `Score Lighthouse faible: ${metrics.performance.lighthouse_score}/100`,
        metric: 'lighthouse_score',
        value: metrics.performance.lighthouse_score,
        threshold: this.thresholds.performance.lighthouse_score
      });
    }
    
    // Availability alerts
    if (metrics.availability.uptime_percentage < this.thresholds.availability.uptime_percentage) {
      alerts.push({
        type: 'availability',
        severity: 'critical',
        message: `Disponibilité faible: ${metrics.availability.uptime_percentage}%`,
        metric: 'uptime_percentage',
        value: metrics.availability.uptime_percentage,
        threshold: this.thresholds.availability.uptime_percentage
      });
    }
    
    if (metrics.availability.error_rate > this.thresholds.availability.error_rate) {
      alerts.push({
        type: 'availability',
        severity: 'error',
        message: `Taux d'erreur élevé: ${metrics.availability.error_rate}%`,
        metric: 'error_rate',
        value: metrics.availability.error_rate,
        threshold: this.thresholds.availability.error_rate
      });
    }
    
    return alerts;
  }
  
  async sendAlerts(alerts: Alert[]): Promise<void> {
    if (alerts.length === 0) return;
    
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const errorAlerts = alerts.filter(a => a.severity === 'error');
    const warningAlerts = alerts.filter(a => a.severity === 'warning');
    
    // Notifications immédiates pour alertes critiques
    if (criticalAlerts.length > 0) {
      await this.sendImmediateNotification(criticalAlerts);
    }
    
    // Email digest pour autres alertes
    if (errorAlerts.length > 0 || warningAlerts.length > 0) {
      await this.sendEmailDigest([...errorAlerts, ...warningAlerts]);
    }
    
    // Log toutes les alertes
    this.logAlerts(alerts);
  }
  
  private async sendImmediateNotification(alerts: Alert[]): Promise<void> {
    const message = alerts.map(a => `🚨 ${a.message}`).join('\n');
    
    // Discord/Slack webhook
    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `**ALERTE CRITIQUE - GLP-1 France**\n\n${message}`,
          username: 'GLP-1 Monitor'
        })
      });
    } catch (error) {
      console.error('Erreur envoi notification Discord:', error);
    }
    
    // SMS (via service externe)
    // await this.sendSMS(message);
  }
  
  private logAlerts(alerts: Alert[]): void {
    alerts.forEach(alert => {
      console.log(`[ALERT] [${alert.severity.toUpperCase()}] ${alert.message}`);
    });
  }
}

interface Alert {
  type: 'performance' | 'availability' | 'business' | 'technical';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp?: string;
}
```

## 🛠️ Maintenance Préventive

### Checklist de Maintenance Hebdomadaire

```powershell
# scripts/weekly-maintenance.ps1
# Maintenance hebdomadaire automatisée

function Invoke-WeeklyMaintenance {
    Write-Host "🔧 Démarrage maintenance hebdomadaire" -ForegroundColor Yellow
    
    $report = @()
    
    # 1. Backup des données
    Write-Step "Sauvegarde des données..."
    try {
        $backupResult = Backup-UserData
        $report += "✅ Backup réussi: $backupResult"
    } catch {
        $report += "❌ Erreur backup: $($_.Exception.Message)"
    }
    
    # 2. Nettoyage des logs
    Write-Step "Nettoyage des logs..."
    try {
        $cleanedSize = Clean-LogFiles
        $report += "✅ Logs nettoyés: $cleanedSize MB libérés"
    } catch {
        $report += "❌ Erreur nettoyage logs: $($_.Exception.Message)"
    }
    
    # 3. Optimisation images
    Write-Step "Optimisation des images..."
    try {
        $optimizedCount = Optimize-Images
        $report += "✅ Images optimisées: $optimizedCount fichiers"
    } catch {
        $report += "❌ Erreur optimisation images: $($_.Exception.Message)"
    }
    
    # 4. Mise à jour dépendances
    Write-Step "Vérification des dépendances..."
    try {
        $outdatedPackages = Check-OutdatedPackages
        if ($outdatedPackages.Count -eq 0) {
            $report += "✅ Toutes les dépendances sont à jour"
        } else {
            $report += "⚠️  Dépendances obsolètes: $($outdatedPackages -join ', ')"
        }
    } catch {
        $report += "❌ Erreur vérification dépendances: $($_.Exception.Message)"
    }
    
    # 5. Test de sécurité
    Write-Step "Audit de sécurité..."
    try {
        $securityIssues = Run-SecurityAudit
        if ($securityIssues.Count -eq 0) {
            $report += "✅ Aucun problème de sécurité détecté"
        } else {
            $report += "🔒 Problèmes sécurité: $($securityIssues.Count) vulnérabilités"
        }
    } catch {
        $report += "❌ Erreur audit sécurité: $($_.Exception.Message)"
    }
    
    # 6. Performance check
    Write-Step "Test de performance..."
    try {
        $perfResults = Test-SitePerformance
        $report += "📊 Performance: LCP ${perfResults.lcp}ms, CLS ${perfResults.cls}"
    } catch {
        $report += "❌ Erreur test performance: $($_.Exception.Message)"
    }
    
    # 7. Validation contenu
    Write-Step "Validation du contenu..."
    try {
        $contentIssues = Validate-Content
        if ($contentIssues.Count -eq 0) {
            $report += "✅ Contenu valide"
        } else {
            $report += "📝 Problèmes contenu: $($contentIssues.Count) à corriger"
        }
    } catch {
        $report += "❌ Erreur validation contenu: $($_.Exception.Message)"
    }
    
    # Génération du rapport
    Generate-MaintenanceReport $report
    
    Write-Host "🎉 Maintenance hebdomadaire terminée!" -ForegroundColor Green
}

function Backup-UserData {
    $timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
    $backupDir = "backups/weekly/$timestamp"
    
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    $dataFiles = @(
        "data/users-unified.json",
        "data/contact-submissions.json",
        "data/newsletter-subscribers.json",
        "data/affiliate-products.json",
        "data/authors-testimonials.json"
    )
    
    foreach ($file in $dataFiles) {
        if (Test-Path $file) {
            Copy-Item $file $backupDir
        }
    }
    
    # Compression du backup
    Compress-Archive -Path $backupDir -DestinationPath "$backupDir.zip"
    Remove-Item $backupDir -Recurse
    
    return "$backupDir.zip"
}

function Clean-LogFiles {
    $logPath = "logs"
    $cleanedSize = 0
    
    if (Test-Path $logPath) {
        # Supprimer logs > 30 jours
        Get-ChildItem $logPath -Filter "*.log" | Where-Object {
            $_.LastWriteTime -lt (Get-Date).AddDays(-30)
        } | ForEach-Object {
            $cleanedSize += $_.Length
            Remove-Item $_.FullName
        }
        
        # Archiver logs > 7 jours
        Get-ChildItem $logPath -Filter "*.log" | Where-Object {
            $_.LastWriteTime -lt (Get-Date).AddDays(-7)
        } | ForEach-Object {
            $archivePath = $_.FullName.Replace('.log', '.archive')
            Compress-Archive -Path $_.FullName -DestinationPath $archivePath
            Remove-Item $_.FullName
        }
    }
    
    return [math]::Round($cleanedSize / 1MB, 2)
}

function Optimize-Images {
    $imageCount = 0
    $uploadPath = "public/images/uploads"
    
    if (Test-Path $uploadPath) {
        Get-ChildItem $uploadPath -Recurse -Include "*.jpg", "*.png" | ForEach-Object {
            $originalSize = $_.Length
            
            # Optimisation avec ImageMagick (si disponible)
            try {
                & magick $_.FullName -quality 85 -strip $_.FullName
                $newSize = (Get-Item $_.FullName).Length
                
                if ($newSize -lt $originalSize) {
                    $imageCount++
                }
            } catch {
                # Ignorer si ImageMagick non disponible
            }
        }
    }
    
    return $imageCount
}

function Check-OutdatedPackages {
    try {
        $outdated = npm outdated --json | ConvertFrom-Json
        return $outdated.PSObject.Properties.Name
    } catch {
        return @()
    }
}

function Run-SecurityAudit {
    $issues = @()
    
    try {
        # npm audit
        $auditResult = npm audit --json | ConvertFrom-Json
        if ($auditResult.vulnerabilities) {
            $issues += $auditResult.vulnerabilities.PSObject.Properties.Name
        }
    } catch {
        # Ignorer si pas de npm audit
    }
    
    # Vérifications manuelles
    $securityChecks = @(
        @{ File = ".env"; Description = "Fichier .env exposé" },
        @{ File = "package-lock.json"; Description = "Lock file à jour" },
        @{ File = "public/.htaccess"; Description = "Configuration serveur" }
    )
    
    foreach ($check in $securityChecks) {
        if (-not (Test-Path $check.File)) {
            $issues += $check.Description
        }
    }
    
    return $issues
}

function Test-SitePerformance {
    # Utiliser Lighthouse CLI si disponible
    try {
        $result = & lighthouse "https://glp1-france.fr" --only-categories=performance --output=json --quiet
        $data = $result | ConvertFrom-Json
        
        return @{
            lcp = $data.audits.'largest-contentful-paint'.numericValue
            cls = $data.audits.'cumulative-layout-shift'.numericValue
            fcp = $data.audits.'first-contentful-paint'.numericValue
        }
    } catch {
        return @{ lcp = 0; cls = 0; fcp = 0 }
    }
}

function Validate-Content {
    $issues = @()
    
    # Vérifier liens internes
    $pages = Get-ChildItem "src/pages" -Recurse -Include "*.astro", "*.md"
    foreach ($page in $pages) {
        $content = Get-Content $page.FullName -Raw
        
        # Chercher liens internes cassés
        $links = [regex]::Matches($content, 'href=["\']([^"\']*)["\']')
        foreach ($link in $links) {
            $url = $link.Groups[1].Value
            if ($url.StartsWith('/') -and -not $url.StartsWith('//')) {
                $filePath = "src/pages$url"
                if (-not (Test-Path $filePath) -and -not (Test-Path "$filePath.astro")) {
                    $issues += "Lien cassé dans $($page.Name): $url"
                }
            }
        }
    }
    
    # Vérifier images manquantes
    $imageRefs = [regex]::Matches($content, 'src=["\']([^"\']*\.(?:jpg|png|gif|webp))["\']')
    foreach ($imageRef in $imageRefs) {
        $imagePath = $imageRef.Groups[1].Value
        if ($imagePath.StartsWith('/')) {
            $fullPath = "public$imagePath"
            if (-not (Test-Path $fullPath)) {
                $issues += "Image manquante: $imagePath"
            }
        }
    }
    
    return $issues
}

function Generate-MaintenanceReport {
    param($ReportItems)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $report = @"
# 🔧 Rapport de Maintenance Hebdomadaire
*Généré le $timestamp*

## Résultats

$($ReportItems | ForEach-Object { "- $_" } | Out-String)

## Actions Recommandées

"@
    
    # Analyser les problèmes et suggérer actions
    $hasErrors = $ReportItems | Where-Object { $_.StartsWith('❌') }
    $hasWarnings = $ReportItems | Where-Object { $_.StartsWith('⚠️') }
    
    if ($hasErrors) {
        $report += "### 🚨 Actions Urgentes`n"
        $hasErrors | ForEach-Object {
            $report += "- Corriger: $($_-replace '^❌ ', '')`n"
        }
        $report += "`n"
    }
    
    if ($hasWarnings) {
        $report += "### ⚠️  Actions Recommandées`n"
        $hasWarnings | ForEach-Object {
            $report += "- Vérifier: $($_-replace '^⚠️  ', '')`n"
        }
        $report += "`n"
    }
    
    if (-not $hasErrors -and -not $hasWarnings) {
        $report += "### ✅ Statut`n"
        $report += "Aucune action requise. Système en bon état.`n`n"
    }
    
    $report += "---`n*Maintenance automatique GLP-1 France*"
    
    # Sauvegarder rapport
    $reportPath = "logs/maintenance-$(Get-Date -Format 'yyyy-MM-dd').md"
    New-Item -ItemType Directory -Path (Split-Path $reportPath) -Force | Out-Null
    Set-Content $reportPath $report
    
    Write-Host "`n📄 Rapport sauvegardé: $reportPath" -ForegroundColor Cyan
    Write-Host $report
}

# Exécution si script appelé directement
if ($MyInvocation.InvocationName -ne '.') {
    Invoke-WeeklyMaintenance
}
```

### Tâches de Maintenance Quotidienne

```powershell
# scripts/daily-maintenance.ps1
function Invoke-DailyMaintenance {
    Write-Host "🌅 Maintenance quotidienne" -ForegroundColor Yellow
    
    # 1. Health check
    & $PSScriptRoot\health-check.ps1
    
    # 2. Backup rapide données critiques
    Backup-CriticalData
    
    # 3. Nettoyage cache
    Clear-TempFiles
    
    # 4. Monitoring métriques
    Collect-DailyMetrics
    
    # 5. Rotation logs
    Rotate-DailyLogs
    
    Write-Host "✅ Maintenance quotidienne terminée" -ForegroundColor Green
}

function Backup-CriticalData {
    $today = Get-Date -Format "yyyy-MM-dd"
    $backupPath = "backups/daily/$today"
    
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    
    # Backup seulement données modifiées récemment
    $criticalFiles = @(
        "data/users-unified.json",
        "data/contact-submissions.json"
    )
    
    foreach ($file in $criticalFiles) {
        if (Test-Path $file) {
            $lastWrite = (Get-Item $file).LastWriteTime
            if ($lastWrite -gt (Get-Date).AddDays(-1)) {
                Copy-Item $file $backupPath
            }
        }
    }
}

function Clear-TempFiles {
    $tempPaths = @(
        "temp",
        "node_modules/.cache",
        "dist/.astro"
    )
    
    foreach ($path in $tempPaths) {
        if (Test-Path $path) {
            Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Collect-DailyMetrics {
    # Collecter métriques via API Google Analytics
    # Sauvegarder dans fichier de métriques quotidiennes
    
    $metrics = @{
        date = Get-Date -Format "yyyy-MM-dd"
        visitors = Get-DailyVisitors
        page_views = Get-DailyPageViews
        bounce_rate = Get-BounceRate
        avg_session_duration = Get-AvgSessionDuration
    }
    
    $metricsPath = "data/daily-metrics.json"
    
    if (Test-Path $metricsPath) {
        $existingMetrics = Get-Content $metricsPath | ConvertFrom-Json
    } else {
        $existingMetrics = @()
    }
    
    $existingMetrics += $metrics
    
    # Garder seulement 90 jours
    $cutoffDate = (Get-Date).AddDays(-90).ToString("yyyy-MM-dd")
    $existingMetrics = $existingMetrics | Where-Object { $_.date -gt $cutoffDate }
    
    Set-Content $metricsPath ($existingMetrics | ConvertTo-Json -Depth 3)
}

function Rotate-DailyLogs {
    $logFiles = Get-ChildItem "logs" -Filter "*.log" -ErrorAction SilentlyContinue
    
    foreach ($log in $logFiles) {
        if ($log.Length -gt 10MB) {
            $timestamp = Get-Date -Format "yyyyMMdd-HHmm"
            $archiveName = $log.BaseName + "-$timestamp.log"
            $archivePath = Join-Path $log.Directory $archiveName
            
            Move-Item $log.FullName $archivePath
            New-Item $log.FullName -ItemType File | Out-Null
        }
    }
}

# Planifier avec Task Scheduler Windows
# schtasks /create /tn "GLP1 Daily Maintenance" /tr "powershell.exe -File C:\path\to\daily-maintenance.ps1" /sc daily /st 02:00
```

## 📊 Tableaux de Bord

### Dashboard Principal (HTML)

```html
<!-- public/admin/monitoring-dashboard.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Monitoring - GLP-1 France</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f7fa;
            color: #2d3748;
        }
        
        .dashboard {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .dashboard-header {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .dashboard-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 0.5rem;
        }
        
        .dashboard-subtitle {
            color: #718096;
            font-size: 1.1rem;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .metric-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .metric-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .metric-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        
        .metric-icon--performance { background: #e6fffa; color: #0d9488; }
        .metric-icon--availability { background: #f0fff4; color: #16a34a; }
        .metric-icon--business { background: #eff6ff; color: #2563eb; }
        .metric-icon--technical { background: #fef3c7; color: #d97706; }
        
        .metric-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a202c;
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            color: #718096;
            font-size: 0.9rem;
        }
        
        .metric-trend {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
            font-size: 0.9rem;
        }
        
        .trend-positive { color: #16a34a; }
        .trend-negative { color: #dc2626; }
        .trend-neutral { color: #6b7280; }
        
        .charts-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .chart-container {
            position: relative;
            height: 300px;
        }
        
        .alerts-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .alert-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .alert-critical { background: #fef2f2; border-left: 4px solid #dc2626; }
        .alert-warning { background: #fffbeb; border-left: 4px solid #d97706; }
        .alert-info { background: #eff6ff; border-left: 4px solid #2563eb; }
        
        .refresh-button {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59,130,246,0.3);
            font-size: 1.2rem;
        }
        
        @media (max-width: 768px) {
            .charts-grid { grid-template-columns: 1fr; }
            .dashboard { padding: 1rem; }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="dashboard-header">
            <h1 class="dashboard-title">🩺 Monitoring GLP-1 France</h1>
            <p class="dashboard-subtitle">
                Tableau de bord en temps réel • Dernière mise à jour: <span id="last-update"></span>
            </p>
        </div>
        
        <div class="metrics-grid">
            <!-- Performance -->
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-icon metric-icon--performance">🚀</div>
                    <div class="metric-title">Performance</div>
                </div>
                <div class="metric-value" id="performance-score">--</div>
                <div class="metric-label">Score Lighthouse</div>
                <div class="metric-trend">
                    <span id="performance-trend">--</span>
                </div>
            </div>
            
            <!-- Disponibilité -->
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-icon metric-icon--availability">🔌</div>
                    <div class="metric-title">Disponibilité</div>
                </div>
                <div class="metric-value" id="uptime-percentage">--</div>
                <div class="metric-label">Uptime (24h)</div>
                <div class="metric-trend">
                    <span id="uptime-trend">--</span>
                </div>
            </div>
            
            <!-- Business -->
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-icon metric-icon--business">📈</div>
                    <div class="metric-title">Visiteurs</div>
                </div>
                <div class="metric-value" id="daily-visitors">--</div>
                <div class="metric-label">Aujourd'hui</div>
                <div class="metric-trend">
                    <span id="visitors-trend">--</span>
                </div>
            </div>
            
            <!-- Technique -->
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-icon metric-icon--technical">⚙️</div>
                    <div class="metric-title">Bundle Size</div>
                </div>
                <div class="metric-value" id="bundle-size">--</div>
                <div class="metric-label">KB</div>
                <div class="metric-trend">
                    <span id="bundle-trend">--</span>
                </div>
            </div>
        </div>
        
        <div class="charts-section">
            <h2>📊 Graphiques de Performance</h2>
            <div class="charts-grid">
                <div class="chart-container">
                    <canvas id="performance-chart"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="visitors-chart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="alerts-section">
            <h2>🚨 Alertes Récentes</h2>
            <div id="alerts-container">
                <!-- Alertes chargées dynamiquement -->
            </div>
        </div>
    </div>
    
    <button class="refresh-button" onclick="refreshDashboard()" title="Actualiser">
        🔄
    </button>
    
    <script>
        // Configuration des graphiques
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        
        let performanceChart, visitorsChart;
        
        // Initialisation du dashboard
        async function initDashboard() {
            await refreshDashboard();
            initCharts();
            
            // Auto-refresh toutes les 5 minutes
            setInterval(refreshDashboard, 5 * 60 * 1000);
        }
        
        async function refreshDashboard() {
            document.getElementById('last-update').textContent = new Date().toLocaleString('fr-FR');
            
            try {
                // Charger métriques depuis API
                const metrics = await fetchMetrics();
                updateMetrics(metrics);
                updateCharts(metrics);
                updateAlerts(metrics);
                
            } catch (error) {
                console.error('Erreur actualisation dashboard:', error);
                showError('Erreur de connexion aux métriques');
            }
        }
        
        async function fetchMetrics() {
            // Simulation - remplacer par vraie API
            return {
                performance: {
                    lighthouse_score: 92,
                    page_load_time: 1250,
                    core_web_vitals: { lcp: 1800, fid: 45, cls: 0.08 }
                },
                availability: {
                    uptime_percentage: 99.8,
                    response_time: 280,
                    error_rate: 0.2
                },
                business: {
                    daily_visitors: 1547,
                    newsletter_signups: 23,
                    guide_downloads: 67
                },
                technical: {
                    bundle_size: 145,
                    build_time: 28,
                    cache_hit_rate: 94
                }
            };
        }
        
        function updateMetrics(metrics) {
            document.getElementById('performance-score').textContent = metrics.performance.lighthouse_score;
            document.getElementById('uptime-percentage').textContent = metrics.availability.uptime_percentage + '%';
            document.getElementById('daily-visitors').textContent = metrics.business.daily_visitors.toLocaleString();
            document.getElementById('bundle-size').textContent = metrics.technical.bundle_size;
            
            // Mise à jour des tendances (simulation)
            updateTrend('performance-trend', '+2%', 'positive');
            updateTrend('uptime-trend', 'Stable', 'neutral');
            updateTrend('visitors-trend', '+15%', 'positive');
            updateTrend('bundle-trend', '-3KB', 'positive');
        }
        
        function updateTrend(elementId, text, type) {
            const element = document.getElementById(elementId);
            element.textContent = text;
            element.className = `trend-${type}`;
        }
        
        function initCharts() {
            // Graphique performance
            const perfCtx = document.getElementById('performance-chart').getContext('2d');
            performanceChart = new Chart(perfCtx, {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                    datasets: [{
                        label: 'Score Lighthouse',
                        data: [89, 91, 88, 92, 90, 93, 92],
                        borderColor: '#0d9488',
                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { title: { display: true, text: 'Performance (7 jours)' } },
                    scales: { y: { beginAtZero: false, min: 80, max: 100 } }
                }
            });
            
            // Graphique visiteurs
            const visitCtx = document.getElementById('visitors-chart').getContext('2d');
            visitorsChart = new Chart(visitCtx, {
                type: 'bar',
                data: {
                    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                    datasets: [{
                        label: 'Visiteurs',
                        data: [1200, 1350, 1450, 1650, 1547, 1800, 1950],
                        backgroundColor: '#2563eb',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { title: { display: true, text: 'Visiteurs quotidiens' } }
                }
            });
        }
        
        function updateCharts(metrics) {
            // Mettre à jour avec nouvelles données
            // Implementation selon vraies données historiques
        }
        
        function updateAlerts(metrics) {
            const alertsContainer = document.getElementById('alerts-container');
            
            // Simulation d'alertes
            const alerts = [
                { type: 'info', message: 'Backup quotidien effectué avec succès', time: '2 min' },
                { type: 'warning', message: 'Temps de réponse légèrement élevé (350ms)', time: '1h' }
            ];
            
            alertsContainer.innerHTML = alerts.map(alert => `
                <div class="alert-item alert-${alert.type}">
                    <div style="flex: 1;">
                        <div style="font-weight: 500;">${alert.message}</div>
                        <div style="font-size: 0.8rem; color: #6b7280;">Il y a ${alert.time}</div>
                    </div>
                </div>
            `).join('');
        }
        
        function showError(message) {
            const alertsContainer = document.getElementById('alerts-container');
            alertsContainer.innerHTML = `
                <div class="alert-item alert-critical">
                    <div>❌ ${message}</div>
                </div>
            `;
        }
        
        // Initialisation au chargement
        document.addEventListener('DOMContentLoaded', initDashboard);
    </script>
</body>
</html>
```

---

> **Important** : La maintenance préventive et le monitoring continu sont essentiels pour assurer la stabilité et les performances du site.
