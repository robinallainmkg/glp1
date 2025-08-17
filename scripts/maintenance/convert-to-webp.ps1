# Script de conversion d'images vers WebP/JPEG pour optimisation SEO
param(
    [string]$ImageName = "image-home2.png",
    [string]$OutputFormat = "jpg", # jpg ou webp
    [int]$Quality = 85
)

# Chercher l'image dans les dossiers
$possiblePaths = @(
    "public\images\home",
    "public\images\temoignages", 
    "public\images\experts",
    "public\images\produits",
    "public\images\uploads"
)

$imagePath = ""
foreach ($path in $possiblePaths) {
    $testPath = Join-Path $path $ImageName
    if (Test-Path $testPath) {
        $imagePath = $testPath
        break
    }
}

if ($imagePath -eq "") {
    Write-Host "Image non trouvee : $ImageName" -ForegroundColor Red
    exit 1
}

Write-Host "Conversion de l'image..." -ForegroundColor Cyan
Write-Host "Source : $imagePath" -ForegroundColor Gray

Add-Type -AssemblyName System.Drawing

try {
    # Charger l'image
    $image = [System.Drawing.Image]::FromFile((Resolve-Path $imagePath).Path)
    
    # Définir le chemin de sortie
    $directory = Split-Path $imagePath -Parent
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($ImageName)
    $outputPath = Join-Path $directory "$baseName.$OutputFormat"
    
    if ($OutputFormat -eq "jpg" -or $OutputFormat -eq "jpeg") {
        # Conversion vers JPEG
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
        
        # Créer une nouvelle image pour supprimer la transparence
        $bitmap = New-Object System.Drawing.Bitmap($image.Width, $image.Height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.Clear([System.Drawing.Color]::White) # Fond blanc
        $graphics.DrawImage($image, 0, 0)
        
        $bitmap.Save($outputPath, $jpegCodec, $encoderParams)
        $bitmap.Dispose()
        $graphics.Dispose()
        
    } else {
        # Pour WebP, utiliser PNG comme fallback si WebP n'est pas supporté
        $image.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    
    $image.Dispose()
    
    # Statistiques
    $originalSize = (Get-Item $imagePath).Length
    $newSize = (Get-Item $outputPath).Length
    $reduction = [math]::Round((($originalSize - $newSize) / $originalSize) * 100, 1)
    
    Write-Host "Conversion reussie !" -ForegroundColor Green
    Write-Host "Fichier cree : $outputPath" -ForegroundColor Cyan
    Write-Host "Taille originale : $([math]::Round($originalSize/1MB, 2)) MB" -ForegroundColor Gray
    Write-Host "Nouvelle taille : $([math]::Round($newSize/1MB, 2)) MB" -ForegroundColor Gray
    Write-Host "Reduction : $reduction%" -ForegroundColor Green
    
    # Analyser avec le script SEO
    Write-Host ""
    Write-Host "Analyse SEO de l'image convertie..." -ForegroundColor Yellow
    $newImageName = "$baseName.$OutputFormat"
    & ".\scripts\maintenance\optimize-image-seo-clean.ps1" -ImageName $newImageName
    
} catch {
    Write-Host "Erreur lors de la conversion : $($_.Exception.Message)" -ForegroundColor Red
}
