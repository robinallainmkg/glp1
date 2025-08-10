param(
    [string]$CommitMessage = "Deploy: Mise à jour automatique"
)

#
# DEPLOIEMENT AUTOMATIQUE FINAL - GLP-1 FRANCE
# Version corrigée pour PowerShell Windows
#

$ErrorActionPreference = "Continue"

Write-Host "DEPLOIEMENT AUTOMATIQUE FINAL - GLP-1 FRANCE" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

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

# Nettoyer les anciens builds
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path ".astro") { Remove-Item ".astro" -Recurse -Force }

npm run build
Write-Host "Build reussi" -ForegroundColor Green

if (-not (Test-Path "dist\index.html")) {
    Write-Host "Erreur: index.html non trouve dans dist\" -ForegroundColor Red
    exit 1
}

# 4. Upload via FTP PowerShell natif
Write-Host ""
Write-Host "Upload vers Hostinger via FTP natif..." -ForegroundColor Yellow

# Configuration FTP
$ftpHost = "147.79.98.140"
$ftpUser = "u403023291"
$ftpPass = "_@%p8R*XG.s+/5)"
$ftpPath = "/public_html"

# Compter les fichiers
$allFiles = Get-ChildItem -Path "dist" -Recurse -File
$totalFiles = $allFiles.Count
$uploadedFiles = 0

Write-Host "Fichiers à uploader: $totalFiles" -ForegroundColor Cyan

# Upload chaque fichier via FTP
foreach ($file in $allFiles) {
    try {
        $localPath = $file.FullName
        $relativePath = $file.FullName.Substring((Get-Item "dist").FullName.Length + 1).Replace("\", "/")
        $remotePath = "$ftpPath/$relativePath"
        
        # Créer l'URI FTP
        $ftpUri = "ftp://$ftpHost$remotePath"
        
        # Créer la demande FTP
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $ftpRequest.UseBinary = $true
        $ftpRequest.UsePassive = $true
        
        # Lire le fichier local
        $fileContent = [System.IO.File]::ReadAllBytes($localPath)
        $ftpRequest.ContentLength = $fileContent.Length
        
        # Upload
        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        # Vérifier la réponse
        $response = $ftpRequest.GetResponse()
        $response.Close()
        
        $uploadedFiles++
        $percent = [math]::Round(($uploadedFiles / $totalFiles) * 100, 1)
        Write-Host "  [$percent%] $relativePath" -ForegroundColor Green
        
    } catch {
        Write-Host "  [ERREUR] $relativePath - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
if ($uploadedFiles -eq $totalFiles) {
    Write-Host "Upload reussi! $uploadedFiles/$totalFiles fichiers" -ForegroundColor Green
    Write-Host "Site mis a jour: https://glp1-france.fr" -ForegroundColor Green
} else {
    Write-Host "Upload partiel: $uploadedFiles/$totalFiles fichiers" -ForegroundColor Yellow
    
    # Fallback: informations pour upload manuel
    Write-Host ""
    Write-Host "Informations pour upload manuel:" -ForegroundColor Yellow
    Write-Host "Host: $ftpHost" -ForegroundColor White
    Write-Host "User: $ftpUser" -ForegroundColor White
    Write-Host "Pass: $ftpPass" -ForegroundColor White
    Write-Host "Path: $ftpPath" -ForegroundColor White
    Write-Host "Local: .\dist\" -ForegroundColor White
    
    # Ouvrir le dossier dist
    try {
        Start-Process "dist"
        Write-Host "Dossier dist ouvert" -ForegroundColor Green
    } catch {
        Write-Host "Dossier dist: .\dist\" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Deploiement termine!" -ForegroundColor Green
