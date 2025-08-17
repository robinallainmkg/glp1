# Script pour standardiser tous les titres selon la règle : première lettre en majuscule, reste en minuscules

$files = Get-ChildItem -Path "src\content" -Recurse -Filter "*.md"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Traiter les titres avec guillemets qui ont des majuscules excessives
    if ($content -match 'title:\s*"([^"]*)"') {
        $originalTitle = $matches[1]
        $newTitle = $originalTitle.ToLower()
        $newTitle = $newTitle.Substring(0,1).ToUpper() + $newTitle.Substring(1)
        
        if ($originalTitle -ne $newTitle) {
            $content = $content -replace ('title:\s*"' + [regex]::Escape($originalTitle) + '"'), ('title: "' + $newTitle + '"')
            $modified = $true
            Write-Host "Modifié: $($file.Name) - '$originalTitle' -> '$newTitle'"
        }
    }
    
    # Traiter les metaTitle de la même façon
    if ($content -match 'metaTitle:\s*"([^"]*)"') {
        $originalMetaTitle = $matches[1]
        $newMetaTitle = $originalMetaTitle.ToLower()
        $newMetaTitle = $newMetaTitle.Substring(0,1).ToUpper() + $newMetaTitle.Substring(1)
        
        if ($originalMetaTitle -ne $newMetaTitle) {
            $content = $content -replace ('metaTitle:\s*"' + [regex]::Escape($originalMetaTitle) + '"'), ('metaTitle: "' + $newMetaTitle + '"')
            $modified = $true
            Write-Host "Modifié metaTitle: $($file.Name) - '$originalMetaTitle' -> '$newMetaTitle'"
        }
    }
    
    # Traiter les titres sans guillemets qui n'ont pas de majuscule du tout
    if ($content -match 'title:\s*([^\r\n"]+)') {
        $originalTitle = $matches[1].Trim()
        if ($originalTitle -notmatch '"' -and $originalTitle -match '^[a-z]') {
            $newTitle = $originalTitle.Substring(0,1).ToUpper() + $originalTitle.Substring(1)
            $content = $content -replace ('title:\s*' + [regex]::Escape($originalTitle)), ('title: ' + $newTitle)
            $modified = $true
            Write-Host "Modifié sans guillemets: $($file.Name) - '$originalTitle' -> '$newTitle'"
        }
    }
    
    if ($modified) {
        Set-Content $file.FullName -Value $content -NoNewline
    }
}

Write-Host "Standardisation des titres terminée!"
