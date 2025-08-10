# Script pour ajouter des sections "Articles similaires" aux articles medicaments-glp1

$contentDir = "c:\Users\robin\projet\glp1-main\src\content\medicaments-glp1"

# Définir les groupes d'articles similaires par thématique
$relatedArticles = @{
    "saxenda-prix" = @(
        "Ozempic injection prix"="/medicaments-glp1/ozempic-injection-prix/"
        "Victoza posologie"="/medicaments-glp1/victoza-posologie/"
        "Semaglutide achat"="/medicaments-glp1/semaglutide-achat/"
        "Wegovy avis"="/medicaments-glp1/wegovy-avis/"
    )
    "wegovy-avis" = @(
        "Tirzepatide avis"="/medicaments-glp1/tirzepatide-avis/"
        "Saxenda prix"="/medicaments-glp1/saxenda-prix/"
        "Nouveau médicament"="/medicaments-glp1/nouveau-medicament/"
        "Trulicity danger"="/medicaments-glp1/trulicity-danger/"
    )
    "mounjaro-prix-france" = @(
        "Tirzepatide avis"="/medicaments-glp1/tirzepatide-avis/"
        "Ozempic injection prix"="/medicaments-glp1/ozempic-injection-prix/"
        "Nouveau médicament"="/medicaments-glp1/nouveau-medicament/"
        "Semaglutide achat"="/medicaments-glp1/semaglutide-achat/"
    )
    "metformine-autre-nom" = @(
        "Sulfamide hypoglycémiant"="/medicaments-glp1/sulfamide-hypoglycemiant/"
        "Metformine diarrhée solution"="/medicaments-glp1/metformine-diarrhee-solution/"
        "Traitement diabète type 2"="/medicaments-glp1/traitement-diabete-type-2/"
        "Médicaments qui augmentent la glycémie"="/medicaments-glp1/medicaments-qui-augmentent-la-glycemie/"
    )
    "victoza-rupture" = @(
        "Victoza posologie"="/medicaments-glp1/victoza-posologie/"
        "Semaglutide achat"="/medicaments-glp1/semaglutide-achat/"
        "Trulicity ou Ozempic"="/medicaments-glp1/trulicity-ou-ozempic/"
        "Nouveau médicament"="/medicaments-glp1/nouveau-medicament/"
    )
}

function Add-RelatedArticles {
    param(
        [string]$FilePath,
        [array]$Articles
    )
    
    $content = Get-Content $FilePath -Raw
    
    # Vérifier si la section existe déjà
    if ($content -match "## Articles similaires") {
        Write-Host "Section déjà présente dans $FilePath"
        return
    }
    
    # Créer la section "Articles similaires"
    $relatedSection = "`n`n## Articles similaires`n`n"
    
    foreach ($article in $Articles.GetEnumerator()) {
        $title = $article.Key
        $url = $article.Value
        $relatedSection += "- **[$title]($url)** - Description adaptée à l'article`n"
    }
    
    # Ajouter avant la dernière ligne s'il y a du contenu
    if ($content.Length -gt 0) {
        $content = $content.TrimEnd() + $relatedSection
        Set-Content -Path $FilePath -Value $content -Encoding UTF8
        Write-Host "Section ajoutée à $FilePath"
    }
}

# Traiter les fichiers spécifiques
foreach ($articleKey in $relatedArticles.Keys) {
    $filePath = Join-Path $contentDir "$articleKey.md"
    if (Test-Path $filePath) {
        Add-RelatedArticles -FilePath $filePath -Articles $relatedArticles[$articleKey]
    }
}

Write-Host "Script terminé."
