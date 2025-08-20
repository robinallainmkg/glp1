# Vérification de la configuration TinaCMS
Write-Host "=== VERIFICATION CONFIGURATION TINACMS ==="
Write-Host ""

# Vérification des variables d'environnement
Write-Host "Variables d'environnement actuelles:"
Write-Host "NEXT_PUBLIC_TINA_CLIENT_ID: $env:NEXT_PUBLIC_TINA_CLIENT_ID"
Write-Host "TINA_TOKEN: $env:TINA_TOKEN"
Write-Host ""

# Chargement du fichier .env si les variables ne sont pas définies
if (-not $env:NEXT_PUBLIC_TINA_CLIENT_ID -or -not $env:TINA_TOKEN) {
    Write-Host "Chargement des variables depuis .env..."
    
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-Host "  $name = $value"
            }
        }
    } else {
        Write-Host "❌ Fichier .env non trouvé!"
        exit 1
    }
}

Write-Host ""
Write-Host "Configuration TinaCMS:"
Write-Host "Client ID: $env:NEXT_PUBLIC_TINA_CLIENT_ID"
Write-Host "Token: $env:TINA_TOKEN"

# Vérification que les valeurs correspondent aux attendues
$expectedClientId = "d2c40213-494b-4005-94ad-b601dbdf1f0e"
$expectedToken = "f5ae6be5c8b2d3dbb575918e775be87d1f4ec29d"

if ($env:NEXT_PUBLIC_TINA_CLIENT_ID -eq $expectedClientId -and $env:TINA_TOKEN -eq $expectedToken) {
    Write-Host "✅ Configuration TinaCMS correcte!"
} else {
    Write-Host "❌ Configuration TinaCMS incorrecte!"
    Write-Host "Attendu Client ID: $expectedClientId"
    Write-Host "Attendu Token: $expectedToken"
    exit 1
}

Write-Host ""
Write-Host "🎉 Configuration identique pour local et live!"
