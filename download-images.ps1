# Script pour télécharger les images depuis Hostinger
$ErrorActionPreference = "Continue"

Write-Host "=== TELECHARGEMENT IMAGES DEPUIS HOSTINGER ===" -ForegroundColor Green

# Créer le dossier uploads s'il n'existe pas
$uploadsDir = "public\images\uploads"
if (!(Test-Path $uploadsDir)) {
    New-Item -ItemType Directory -Path $uploadsDir -Force
    Write-Host "Dossier uploads créé" -ForegroundColor Yellow
}

# Script WinSCP pour télécharger les images
$winscpScript = @"
open sftp://u403023291@147.79.98.140:65002 -password="_@%p8R*XG.s+/5)" -hostkey="ssh-ed25519 255 ryF1Sy3SwsauJOcEYq3xYVLfjAbN3LKJX3qRxdU1AHA"
cd domains/glp1-france.fr/public_html/images/uploads
lcd public\images\uploads
get *.png
get *.jpg
get *.jpeg
get *.webp
close
exit
"@

$winscpScript | Out-File -FilePath "download-images.txt" -Encoding UTF8

# Chercher WinSCP
$winscpPaths = @(
    "C:\Users\robin\AppData\Local\Programs\WinSCP\WinSCP.com",
    "${env:ProgramFiles}\WinSCP\WinSCP.com",
    "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com"
)

$winscpFound = $false
foreach ($path in $winscpPaths) {
    if (Test-Path $path) {
        Write-Host "WinSCP trouvé: $path" -ForegroundColor Green
        try {
            & $path /script=download-images.txt /log=download-images.log
            if ($LASTEXITCODE -eq 0) {
                Write-Host "TÉLÉCHARGEMENT RÉUSSI!" -ForegroundColor Green
                $winscpFound = $true
                break
            } else {
                Write-Host "Erreur WinSCP (code: $LASTEXITCODE)" -ForegroundColor Red
            }
        } catch {
            Write-Host "Erreur lors de l'exécution: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

if (!$winscpFound) {
    Write-Host "❌ WinSCP non trouvé ou erreur de connexion" -ForegroundColor Red
    Write-Host "💡 Vérifiez l'installation de WinSCP" -ForegroundColor Yellow
}

# Nettoyage
if (Test-Path "download-images.txt") { Remove-Item "download-images.txt" }

Write-Host "=== TERMINÉ ===" -ForegroundColor Green
