# Systeme de rotation pour version gratuite Rank Tracker
# Fichier : scripts/rotation-keywords.ps1

Write-Host "========================================" -ForegroundColor Green
Write-Host "   ROTATION MOTS-CLES - VERSION GRATUITE" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Groupes de 5 mots-cles prioritaires
$Groups = @{
    "Groupe1_Prix" = @(
        "ozempic prix",
        "wegovy prix", 
        "saxenda prix",
        "mounjaro prix",
        "semaglutide prix"
    )
    "Groupe2_Medical" = @(
        "medicament pour maigrir",
        "injection pour maigrir",
        "pilule qui fait maigrir",
        "endocrinologue pour maigrir",
        "clinique obesite"
    )
    "Groupe3_Effets" = @(
        "ozempic effet secondaire",
        "wegovy danger",
        "trulicity prix",
        "medicament diabete",
        "glp1 perte de poids"
    )
    "Groupe4_Complement" = @(
        "ozempic remboursement",
        "wegovy remboursement",
        "docteur pour maigrir",
        "chirurgie bariatrique",
        "nouveau medicament diabete"
    )
}

Write-Host "STRATEGIE VERSION GRATUITE :" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Gray
Write-Host "- Rank Tracker gratuit limite a 5 mots-cles" -ForegroundColor White
Write-Host "- Solution : Rotation par groupes thematiques" -ForegroundColor White
Write-Host "- 4 groupes de 5 mots-cles chacun" -ForegroundColor White
Write-Host "- Analyse complete sur 4 semaines" -ForegroundColor White
Write-Host ""

Write-Host "PLANNING DE ROTATION :" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Gray

$WeekNumber = (Get-Date).DayOfYear / 7
$CurrentGroup = [math]::Floor($WeekNumber) % 4 + 1
$GroupName = "Groupe$CurrentGroup" + "_" + @("Prix", "Medical", "Effets", "Complement")[$CurrentGroup - 1]

Write-Host "Semaine actuelle : Semaine $([math]::Floor($WeekNumber) + 1)" -ForegroundColor White
Write-Host "Groupe actuel : $GroupName" -ForegroundColor Yellow
Write-Host ""

Write-Host "MOTS-CLES A TRACKER CETTE SEMAINE :" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Gray

$CurrentKeywords = $Groups[$GroupName]
for ($i = 0; $i -lt $CurrentKeywords.Count; $i++) {
    Write-Host "  $($i + 1). $($CurrentKeywords[$i])" -ForegroundColor White
}

Write-Host ""
Write-Host "INSTRUCTIONS :" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Gray
Write-Host "1. Supprimer les anciens mots-cles dans Rank Tracker" -ForegroundColor White
Write-Host "2. Ajouter les 5 mots-cles ci-dessus" -ForegroundColor White
Write-Host "3. Scanner les positions" -ForegroundColor White
Write-Host "4. Exporter les resultats" -ForegroundColor White
Write-Host "5. Revenir la semaine prochaine pour le groupe suivant" -ForegroundColor White
Write-Host ""

# Generer le fichier CSV pour cette semaine
$WeeklyKeywords = @()
foreach ($keyword in $CurrentKeywords) {
    $WeeklyKeywords += [PSCustomObject]@{
        Keyword = $keyword
        "Search Engine" = "Google.fr"
        Location = "France"
    }
}

$OutputFile = "keywords-week-$CurrentGroup.csv"
$WeeklyKeywords | Export-Csv -Path $OutputFile -NoTypeInformation -Encoding UTF8

Write-Host "FICHIER GENERE :" -ForegroundColor Green
Write-Host "================" -ForegroundColor Gray
Write-Host "Fichier : $OutputFile" -ForegroundColor Cyan
Write-Host "A importer dans Rank Tracker cette semaine" -ForegroundColor White
Write-Host ""

Write-Host "PLANNING COMPLET (4 semaines) :" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Gray
Write-Host "Semaine 1 : Groupe Prix (ozempic, wegovy, saxenda, mounjaro, semaglutide)" -ForegroundColor White
Write-Host "Semaine 2 : Groupe Medical (medicaments, injections, medecins)" -ForegroundColor White  
Write-Host "Semaine 3 : Groupe Effets (effets secondaires, dangers, diabete)" -ForegroundColor White
Write-Host "Semaine 4 : Groupe Complement (remboursements, alternatives)" -ForegroundColor White
Write-Host ""

Write-Host "PROCHAINE ROTATION : $(Get-Date).AddDays(7).ToString('dd/MM/yyyy')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
