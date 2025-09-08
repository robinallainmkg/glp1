# 🚀 Script d'Enrichissement de la Base de Données Supabase

# Configuration des variables d'environnement
$env:PUBLIC_SUPABASE_URL = "https://htdlypqjtpxhzmiwgwlt.supabase.co"
$env:PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpUIn0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0ZGx5cHFqdHB4aHptaXdnd2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMwMzk4NjksImV4cCI6MjAzODYxNTg2OX0.U8EtV6Aw12OIY6b3FYF7jb7kkZZhW_lNhZQtAGI8N8s"

Write-Host "ENRICHISSEMENT BASE DE DONNEES ANNUAIRE PROFESSIONNELS" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Execution des scripts SQL
Write-Host "Etape 1: Creation des tables..." -ForegroundColor Yellow

$sqlFiles = @(
    "scripts/database/create-professionals-tables.sql",
    "scripts/database/seed-french-cities.sql", 
    "scripts/database/seed-professionals.sql",
    "scripts/database/optimize-performance.sql"
)

foreach ($file in $sqlFiles) {
    if (Test-Path $file) {
        Write-Host "Trouve: $file" -ForegroundColor Green
    } else {
        Write-Host "Manquant: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "INSTRUCTIONS SUPABASE:" -ForegroundColor Magenta
Write-Host "1. Connectez-vous a https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Selectionnez votre projet" -ForegroundColor White  
Write-Host "3. Allez dans SQL Editor" -ForegroundColor White
Write-Host "4. Copiez/collez le contenu de chaque fichier SQL dans l'ordre:" -ForegroundColor White
Write-Host "   - create-professionals-tables.sql (TABLES)" -ForegroundColor Cyan
Write-Host "   - seed-french-cities.sql (VILLES)" -ForegroundColor Cyan
Write-Host "   - seed-professionals.sql (PROFESSIONNELS)" -ForegroundColor Cyan
Write-Host "   - optimize-performance.sql (OPTIMISATION)" -ForegroundColor Cyan
Write-Host ""

Write-Host "ETAPES SUIVANTES:" -ForegroundColor Magenta
Write-Host "1. Executez les scripts SQL dans Supabase (dans l'ordre)" -ForegroundColor White
Write-Host "2. Lancez l'enrichissement automatique:" -ForegroundColor White
Write-Host "   node scripts/enrich-database.mjs" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Verifiez les donnees dans Supabase Dashboard" -ForegroundColor White
Write-Host "4. Testez l'annuaire: npm run dev" -ForegroundColor White
Write-Host ""

# Affichage des URLs importantes
Write-Host "LIENS UTILES:" -ForegroundColor Magenta
Write-Host "Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor Blue
Write-Host "Votre projet: https://htdlypqjtpxhzmiwgwlt.supabase.co" -ForegroundColor Blue
Write-Host "Annuaire local: http://localhost:3000/annuaire-professionnels" -ForegroundColor Blue
Write-Host ""

Write-Host "PRET POUR L'ENRICHISSEMENT !" -ForegroundColor Green
