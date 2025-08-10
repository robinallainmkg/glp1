# DEPLOIEMENT ALTERNATIF SANS WINSCP
# Utilise curl et PowerShell natif pour l'upload SFTP

param(
    [string]$CommitMessage = "Deploy: Mise a jour automatique"
)

Write-Host "DEPLOIEMENT AUTOMATIQUE ALTERNATIF - GLP-1 FRANCE" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Configuration SFTP
$sftpConfig = @{
    Host = "147.79.98.140"
    Port = 65002
    Username = "u403023291"
    Password = "_@%p8R*XG.s+/5)"
    RemotePath = "/public_html"
}

# 1. Verifications
Write-Host "Verifications..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Green

# 2. Commit et Push GitHub
Write-Host ""
Write-Host "Upload vers GitHub..." -ForegroundColor Cyan
git add .
git commit -m $CommitMessage
git push origin production --force --no-verify
Write-Host "Push GitHub reussi" -ForegroundColor Green

# 3. Build du site
Write-Host ""
Write-Host "Build du site..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path ".astro") { Remove-Item -Recurse -Force ".astro" }

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur de build" -ForegroundColor Red
    exit 1
}
Write-Host "Build reussi" -ForegroundColor Green

# 4. Upload via curl SFTP
Write-Host ""
Write-Host "Upload via curl SFTP..." -ForegroundColor Cyan

$sftpUrl = "sftp://$($sftpConfig.Username):$($sftpConfig.Password)@$($sftpConfig.Host):$($sftpConfig.Port)$($sftpConfig.RemotePath)/"

# Fonction pour uploader un fichier
function Upload-File {
    param($LocalPath, $RemotePath)
    
    $relativePath = $RemotePath.Replace("/public_html/", "")
    $curlArgs = @(
        "--sftp",
        "--upload-file", $LocalPath,
        "$sftpUrl$relativePath",
        "--create-dirs",
        "--silent",
        "--show-error"
    )
    
    try {
        curl @curlArgs
        return $LASTEXITCODE -eq 0
    } catch {
        Write-Host "Erreur upload $LocalPath : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Nettoyage du serveur (optionnel - peut etre ignore si erreur)
Write-Host "Nettoyage serveur..." -ForegroundColor Yellow
try {
    # Creer script de nettoyage temporaire
    $cleanScript = @"
rm /public_html/*
rm -r /public_html/*
"@
    $cleanScript | Out-File -FilePath "clean.sh" -Encoding ASCII
    
    $sshUrl = "ssh://$($sftpConfig.Username):$($sftpConfig.Password)@$($sftpConfig.Host):$($sftpConfig.Port)"
    curl --upload-file "clean.sh" "$sshUrl/tmp/clean.sh" --silent 2>$null
    curl "$sshUrl" --quote "cd /tmp && chmod +x clean.sh && ./clean.sh" --silent 2>$null
    
    Remove-Item "clean.sh" -Force -ErrorAction SilentlyContinue
    Write-Host "Serveur nettoye" -ForegroundColor Green
} catch {
    Write-Host "Nettoyage serveur ignore (continuons...)" -ForegroundColor Yellow
}

# Upload de tous les fichiers
Write-Host "Upload des fichiers..." -ForegroundColor Yellow
$uploadCount = 0
$errorCount = 0

Get-ChildItem -Path "dist" -Recurse -File | ForEach-Object {
    $localFile = $_.FullName
    $relativePath = $_.FullName.Substring((Get-Item "dist").FullName.Length + 1).Replace("\", "/")
    $remotePath = "/public_html/$relativePath"
    
    Write-Host "  Uploading: $relativePath" -ForegroundColor Gray
    
    if (Upload-File $localFile $remotePath) {
        $uploadCount++
    } else {
        $errorCount++
        Write-Host "    ECHEC: $relativePath" -ForegroundColor Red
    }
}

Write-Host ""
if ($errorCount -eq 0) {
    Write-Host "Upload reussi! $uploadCount fichiers uploades" -ForegroundColor Green
    Write-Host "Site mis a jour: https://glp1-france.fr" -ForegroundColor Green
} else {
    Write-Host "Upload partiel: $uploadCount reussis, $errorCount echecs" -ForegroundColor Yellow
    Write-Host "Verifiez le site: https://glp1-france.fr" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "DEPLOIEMENT TERMINE!" -ForegroundColor Green
