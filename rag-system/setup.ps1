# 🤖 Configuration automatique RAG GLP1-France
# Script PowerShell pour Windows

Write-Host "🤖 ===============================================" -ForegroundColor Cyan
Write-Host "   Configuration automatique RAG GLP1-France" -ForegroundColor Cyan  
Write-Host "===============================================" -ForegroundColor Cyan

# Vérifier Python
Write-Host "`n🐍 Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python non trouvé" -ForegroundColor Red
    Write-Host "  💡 Installez Python depuis: https://python.org" -ForegroundColor Blue
    exit 1
}

# Vérifier pip
Write-Host "`n📦 Vérification de pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "  ✅ $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ pip non trouvé" -ForegroundColor Red
    exit 1
}

# Installer les dépendances
Write-Host "`n📥 Installation des dépendances..." -ForegroundColor Yellow
$packages = @("openai", "beautifulsoup4", "requests")

foreach ($package in $packages) {
    Write-Host "  📦 Installation de $package..." -ForegroundColor Blue
    try {
        pip install $package --quiet
        Write-Host "  ✅ $package installé" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Erreur avec $package" -ForegroundColor Red
    }
}

# Demander la clé OpenAI
Write-Host "`n🔑 Configuration OpenAI..." -ForegroundColor Yellow
Write-Host "  💡 Obtenez votre clé sur: https://platform.openai.com/api-keys" -ForegroundColor Blue

do {
    $apiKey = Read-Host "  🔑 Saisissez votre clé API OpenAI (sk-...)"
    if ($apiKey -like "sk-*") {
        break
    } else {
        Write-Host "  ❌ Format invalide. La clé doit commencer par 'sk-'" -ForegroundColor Red
    }
} while ($true)

# Créer le fichier .env
Write-Host "`n📝 Création du fichier de configuration..." -ForegroundColor Yellow
$envContent = @"
OPENAI_API_KEY=$apiKey
OPENAI_MODEL_EMBEDDING=text-embedding-3-small
OPENAI_MODEL_COMPLETION=gpt-4o-mini
MAX_CHUNKS_PER_RESPONSE=5
SIMILARITY_THRESHOLD=0.7
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "  ✅ Fichier .env créé" -ForegroundColor Green

# Mettre à jour search.php
Write-Host "`n⚙️ Configuration de l'API..." -ForegroundColor Yellow
if (Test-Path "api\search.php") {
    $searchContent = Get-Content "api\search.php" -Raw -Encoding UTF8
    $searchContent = $searchContent -replace "your-openai-api-key-here", $apiKey
    $searchContent | Out-File -FilePath "api\search.php" -Encoding UTF8
    Write-Host "  ✅ API configurée" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Fichier search.php non trouvé" -ForegroundColor Yellow
}

# Créer les répertoires
Write-Host "`n📁 Création des répertoires..." -ForegroundColor Yellow
$directories = @("embeddings", "docs\content", "logs")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    Write-Host "  ✅ $dir" -ForegroundColor Green
}

# Lancer l'indexation
Write-Host "`n🔍 Indexation du contenu..." -ForegroundColor Yellow
Write-Host "  📊 Cela peut prendre plusieurs minutes..." -ForegroundColor Blue

try {
    $env:OPENAI_API_KEY = $apiKey
    python indexer.py
    Write-Host "  ✅ Indexation terminée" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Erreur d'indexation: $_" -ForegroundColor Red
    Write-Host "  💡 Vérifiez votre clé API et votre connexion" -ForegroundColor Blue
}

# Vérifier les résultats
Write-Host "`n🔍 Vérification des fichiers..." -ForegroundColor Yellow
$requiredFiles = @(
    "indexer.py",
    "api\search.php", 
    "glp1-chat-widget.js",
    "demo.html",
    "embeddings\glp1_embeddings.json"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file manquant" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Créer un fichier de test simple
Write-Host "`n🧪 Création du test..." -ForegroundColor Yellow
$testContent = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Test RAG</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 40px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
        h1 { color: #333; text-align: center; }
        input { width: 70%; padding: 15px; font-size: 16px; border: 2px solid #ddd; border-radius: 5px; }
        button { padding: 15px 25px; font-size: 16px; background: #007cba; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px; }
        button:hover { background: #005a87; }
        .result { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #007cba; }
        .loading { text-align: center; color: #666; }
        .error { background: #fee; border-left-color: #dc3545; color: #721c24; }
        .success { background: #efe; border-left-color: #28a745; color: #155724; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Test RAG GLP1-France</h1>
        <p style="text-align: center; color: #666;">Testez votre système d'intelligence artificielle</p>
        
        <div style="text-align: center; margin-bottom: 30px;">
            <input type="text" id="query" placeholder="Posez votre question..." value="Qu'est-ce que GLP1 ?">
            <button onclick="testRAG()">Tester</button>
        </div>
        
        <div id="result"></div>
        
        <div style="margin-top: 40px; padding: 20px; background: #e3f2fd; border-radius: 5px;">
            <h3 style="margin-top: 0;">💡 Exemples de questions :</h3>
            <ul>
                <li>Qu'est-ce que GLP1 ?</li>
                <li>Prix d'Ozempic en France</li>
                <li>Effets secondaires Wegovy</li>
                <li>Comment obtenir une prescription ?</li>
            </ul>
        </div>
    </div>
    
    <script>
        async function testRAG() {
            const query = document.getElementById('query').value;
            const resultDiv = document.getElementById('result');
            
            if (!query.trim()) {
                resultDiv.innerHTML = '<div class="result error">Veuillez saisir une question</div>';
                return;
            }
            
            resultDiv.innerHTML = '<div class="result loading">🔍 Recherche en cours...</div>';
            
            try {
                const response = await fetch('api/search.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: query,
                        generate_answer: true,
                        limit: 3
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    let html = '<div class="result success">';
                    html += '<h3>✅ Test réussi!</h3>';
                    html += '<p><strong>Question:</strong> ' + query + '</p>';
                    html += '<p><strong>Réponse:</strong><br>' + data.answer.replace(/\n/g, '<br>') + '</p>';
                    html += '<p><strong>Sources trouvées:</strong> ' + data.results.length + '</p>';
                    html += '</div>';
                    resultDiv.innerHTML = html;
                } else {
                    resultDiv.innerHTML = '<div class="result error"><h3>❌ Erreur:</h3><p>' + data.error + '</p></div>';
                }
                
            } catch (error) {
                resultDiv.innerHTML = '<div class="result error"><h3>❌ Erreur de connexion:</h3><p>' + error.message + '</p></div>';
            }
        }
        
        // Test automatique au chargement
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                if (confirm('Voulez-vous lancer un test automatique ?')) {
                    testRAG();
                }
            }, 1000);
        });
    </script>
</body>
</html>
"@

$testContent | Out-File -FilePath "test-rag.html" -Encoding UTF8
Write-Host "  ✅ Fichier test-rag.html créé" -ForegroundColor Green

# Résultats finaux
Write-Host "`n🎯 Résultats de la configuration:" -ForegroundColor Yellow

if ($allFilesExist) {
    Write-Host "`n🎉 Configuration terminée avec succès!" -ForegroundColor Green
    Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Blue
    Write-Host "  1. Ouvrez test-rag.html dans votre navigateur" -ForegroundColor White
    Write-Host "  2. Testez avec quelques questions" -ForegroundColor White
    Write-Host "  3. Si ça marche, ouvrez demo.html pour la démo complète" -ForegroundColor White
    Write-Host "  4. Intégrez le widget sur votre site" -ForegroundColor White
    
    # Ouvrir automatiquement le test
    Write-Host "`n🌐 Ouverture du test..." -ForegroundColor Yellow
    try {
        Start-Process "test-rag.html"
    } catch {
        Write-Host "  💡 Ouvrez manuellement: test-rag.html" -ForegroundColor Blue
    }
    
} else {
    Write-Host "`n⚠️  Configuration incomplète" -ForegroundColor Yellow
    Write-Host "  💡 Vérifiez les erreurs ci-dessus" -ForegroundColor Blue
}

Write-Host "`n📚 Documentation complète dans README.md" -ForegroundColor Blue
Write-Host "🆘 En cas de problème, consultez les logs dans le dossier 'logs'" -ForegroundColor Blue

Write-Host "`nAppuyez sur Entrée pour terminer..." -ForegroundColor Gray
Read-Host
