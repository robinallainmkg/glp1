#!/usr/bin/env python3
"""
🤖 Configuration automatique du système RAG GLP1-France
Lancez ce script pour configurer automatiquement votre système RAG.
"""

import os
import sys
import json
import subprocess
from pathlib import Path

class RAGConfigurator:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.config = {}
        
    def print_banner(self):
        print("""
🤖 ===============================================
   Configuration automatique RAG GLP1-France
===============================================
        """)
        
    def check_dependencies(self):
        """Vérifier et installer les dépendances Python"""
        print("📦 Vérification des dépendances...")
        
        required_packages = ['openai', 'beautifulsoup4', 'requests']
        missing_packages = []
        
        for package in required_packages:
            try:
                __import__(package.replace('-', '_'))
                print(f"  ✅ {package}")
            except ImportError:
                missing_packages.append(package)
                print(f"  ❌ {package}")
        
        if missing_packages:
            print(f"\n📥 Installation des packages manquants: {', '.join(missing_packages)}")
            try:
                subprocess.check_call([
                    sys.executable, '-m', 'pip', 'install'
                ] + missing_packages)
                print("  ✅ Installation réussie")
            except subprocess.CalledProcessError:
                print("  ❌ Erreur d'installation")
                print("  💡 Essayez manuellement: pip install " + " ".join(missing_packages))
                return False
        
        return True
    
    def setup_openai_key(self):
        """Configuration de la clé OpenAI"""
        print("\n🔑 Configuration OpenAI...")
        
        # Vérifier si la clé existe déjà
        env_file = self.base_dir / '.env'
        api_key = None
        
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if line.startswith('OPENAI_API_KEY='):
                        api_key = line.split('=', 1)[1].strip()
                        break
        
        if not api_key:
            print("  📝 Veuillez saisir votre clé API OpenAI:")
            print("  💡 Obtenez-la sur: https://platform.openai.com/api-keys")
            api_key = input("  🔑 Clé API (sk-...): ").strip()
            
            if not api_key.startswith('sk-'):
                print("  ❌ Format de clé invalide")
                return False
            
            # Sauvegarder dans .env
            with open(env_file, 'w') as f:
                f.write(f"OPENAI_API_KEY={api_key}\n")
                f.write("OPENAI_MODEL_EMBEDDING=text-embedding-3-small\n")
                f.write("OPENAI_MODEL_COMPLETION=gpt-4o-mini\n")
                f.write("MAX_CHUNKS_PER_RESPONSE=5\n")
                f.write("SIMILARITY_THRESHOLD=0.7\n")
            
        # Mettre à jour search.php avec la clé
        search_php = self.base_dir / 'api' / 'search.php'
        if search_php.exists():
            content = search_php.read_text(encoding='utf-8')
            if 'your-openai-api-key-here' in content:
                content = content.replace('your-openai-api-key-here', api_key)
                search_php.write_text(content, encoding='utf-8')
                print("  ✅ Clé API configurée dans search.php")
        
        self.config['api_key'] = api_key
        print("  ✅ Clé OpenAI configurée")
        return True
    
    def create_directories(self):
        """Créer les répertoires nécessaires"""
        print("\n📁 Création des répertoires...")
        
        directories = [
            'embeddings',
            'docs/content',
            'logs'
        ]
        
        for directory in directories:
            dir_path = self.base_dir / directory
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"  ✅ {directory}")
        
        return True
    
    def test_openai_connection(self):
        """Tester la connexion OpenAI"""
        print("\n🔗 Test de la connexion OpenAI...")
        
        try:
            import openai
            openai.api_key = self.config['api_key']
            
            # Test simple avec l'API embeddings
            response = openai.Embedding.create(
                model="text-embedding-3-small",
                input="test de connexion"
            )
            
            print("  ✅ Connexion OpenAI réussie")
            return True
            
        except Exception as e:
            print(f"  ❌ Erreur de connexion: {e}")
            print("  💡 Vérifiez votre clé API et votre connexion internet")
            return False
    
    def run_indexing(self):
        """Lancer l'indexation du contenu"""
        print("\n🔍 Indexation du contenu...")
        
        indexer_script = self.base_dir / 'indexer.py'
        if not indexer_script.exists():
            print("  ❌ Script indexer.py non trouvé")
            return False
        
        print("  📊 Lancement de l'indexation (cela peut prendre plusieurs minutes)...")
        
        try:
            # Définir les variables d'environnement
            env = os.environ.copy()
            env['OPENAI_API_KEY'] = self.config['api_key']
            
            result = subprocess.run([
                sys.executable, str(indexer_script)
            ], env=env, capture_output=True, text=True, cwd=self.base_dir)
            
            if result.returncode == 0:
                print("  ✅ Indexation terminée")
                
                # Vérifier que les embeddings ont été créés
                embeddings_file = self.base_dir / 'embeddings' / 'glp1_embeddings.json'
                if embeddings_file.exists():
                    with open(embeddings_file, 'r') as f:
                        data = json.load(f)
                        count = len(data.get('chunks', []))
                        print(f"  📊 {count} chunks indexés")
                else:
                    print("  ⚠️  Fichier d'embeddings non créé")
                    
                return True
            else:
                print(f"  ❌ Erreur d'indexation: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"  ❌ Erreur: {e}")
            return False
    
    def setup_web_server(self):
        """Configuration du serveur web"""
        print("\n🌐 Configuration du serveur web...")
        
        # Créer un fichier .htaccess pour Apache
        htaccess = self.base_dir / '.htaccess'
        htaccess_content = """# Configuration RAG GLP1-France
RewriteEngine On

# CORS pour l'API
<FilesMatch "\\.(php)$">
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</FilesMatch>

# Gestion des requêtes OPTIONS
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Protection des fichiers sensibles
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>
"""
        
        with open(htaccess, 'w') as f:
            f.write(htaccess_content)
        
        print("  ✅ Fichier .htaccess créé")
        
        # Instructions pour le déploiement
        print("\n📋 Instructions de déploiement:")
        print("  1. Copiez le dossier 'rag-system' sur votre serveur web")
        print("  2. Assurez-vous que PHP est activé")
        print("  3. Testez avec: http://votre-site.com/rag-system/demo.html")
        
        return True
    
    def create_test_page(self):
        """Créer une page de test simple"""
        print("\n🧪 Création de la page de test...")
        
        test_page = self.base_dir / 'test-simple.html'
        test_content = """<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test RAG Simple</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .result { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px; }
        button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        input { padding: 10px; width: 300px; margin-right: 10px; }
    </style>
</head>
<body>
    <h1>🤖 Test RAG GLP1-France</h1>
    
    <div>
        <input type="text" id="query" placeholder="Votre question..." value="Qu'est-ce que GLP1 ?">
        <button onclick="testRAG()">Tester</button>
    </div>
    
    <div id="result"></div>
    
    <script>
        async function testRAG() {
            const query = document.getElementById('query').value;
            const resultDiv = document.getElementById('result');
            
            resultDiv.innerHTML = 'Recherche en cours...';
            
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
                    let html = '<h3>✅ Test réussi!</h3>';
                    html += '<p><strong>Réponse:</strong> ' + data.answer + '</p>';
                    html += '<p><strong>Sources trouvées:</strong> ' + data.results.length + '</p>';
                    resultDiv.innerHTML = html;
                } else {
                    resultDiv.innerHTML = '<h3>❌ Erreur:</h3><p>' + data.error + '</p>';
                }
                
            } catch (error) {
                resultDiv.innerHTML = '<h3>❌ Erreur de connexion:</h3><p>' + error.message + '</p>';
            }
        }
    </script>
</body>
</html>"""
        
        with open(test_page, 'w', encoding='utf-8') as f:
            f.write(test_content)
        
        print("  ✅ Page de test créée: test-simple.html")
        return True
    
    def run_final_test(self):
        """Test final du système"""
        print("\n🎯 Test final du système...")
        
        # Vérifier que tous les fichiers nécessaires existent
        required_files = [
            'indexer.py',
            'api/search.php',
            'glp1-chat-widget.js',
            'demo.html',
            'embeddings/glp1_embeddings.json'
        ]
        
        all_files_exist = True
        for file_path in required_files:
            full_path = self.base_dir / file_path
            if full_path.exists():
                print(f"  ✅ {file_path}")
            else:
                print(f"  ❌ {file_path} manquant")
                all_files_exist = False
        
        if all_files_exist:
            print("\n🎉 Configuration terminée avec succès!")
            print("\n📋 Prochaines étapes:")
            print("  1. Ouvrez demo.html dans votre navigateur")
            print("  2. Testez le système avec quelques questions")
            print("  3. Intégrez le widget sur votre site")
            print("  4. Consultez README.md pour plus d'informations")
            return True
        else:
            print("\n⚠️  Configuration incomplète")
            return False
    
    def run(self):
        """Lancer la configuration complète"""
        self.print_banner()
        
        steps = [
            ("Dépendances", self.check_dependencies),
            ("Clé OpenAI", self.setup_openai_key),
            ("Répertoires", self.create_directories),
            ("Test connexion", self.test_openai_connection),
            ("Indexation", self.run_indexing),
            ("Serveur web", self.setup_web_server),
            ("Page de test", self.create_test_page),
            ("Test final", self.run_final_test)
        ]
        
        for step_name, step_func in steps:
            if not step_func():
                print(f"\n❌ Échec à l'étape: {step_name}")
                print("💡 Consultez les logs ci-dessus pour corriger le problème")
                return False
        
        print("\n🎉 Configuration terminée!")
        return True

if __name__ == "__main__":
    configurator = RAGConfigurator()
    success = configurator.run()
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)
