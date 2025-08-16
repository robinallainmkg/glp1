const vscode = require('vscode');

// Base de connaissances GLP1
const GLP1_RESPONSES = {
    ozempic: {
        keywords: ['ozempic', 'semaglutide', 'novo nordisk'],
        response: `**💊 Ozempic (Semaglutide)**

🎯 **Utilisation**: Traitement du diabète de type 2 et aide à la perte de poids
💰 **Prix**: 70-120€/mois selon la dose (non remboursé pour obésité seule)
⚡ **Efficacité**: Jusqu'à 15% de perte de poids
🏥 **Prescription**: Endocrinologue ou médecin formé

📍 **Plus d'infos**: Consultez votre médecin pour un avis personnalisé`
    },
    wegovy: {
        keywords: ['wegovy', 'semaglutide perte poids'],
        response: `**🔥 Wegovy (Semaglutide dosage obésité)**

🎯 **Utilisation**: Traitement spécifique de l'obésité (IMC ≥30)
💰 **Prix**: 280-350€/mois (non remboursé)
⚡ **Efficacité**: Jusqu'à 20% de perte de poids
🏥 **Prescription**: Médecin spécialisé en obésité

📍 **Plus d'infos**: Traitement le plus puissant de la gamme GLP1`
    },
    prix: {
        keywords: ['prix', 'coût', 'cout', 'tarif', 'remboursement'],
        response: `**💰 Prix des traitements GLP1**

🩺 **Ozempic**: 70-120€/mois
🔥 **Wegovy**: 280-350€/mois  
💊 **Saxenda**: 150-200€/mois
💉 **Trulicity**: 80-100€/mois

🏛️ **Remboursement**: Uniquement pour diabète (pas pour obésité seule)
💡 **Conseil**: Comparez avec votre mutuelle pour optimiser vos frais`
    },
    effets: {
        keywords: ['effet', 'secondaire', 'nausée', 'vomissement'],
        response: `**⚠️ Effets secondaires des GLP1**

🤢 **Fréquents**: Nausées, vomissements, diarrhée
😴 **Modérés**: Fatigue, maux de tête
🏥 **Rares**: Pancréatite, calculs biliaires

💡 **Conseils**: 
- Commencer par petites doses
- Manger lentement et peu
- Rester hydraté`
    }
};

function activate(context) {
    console.log('🚀 Extension RAGLP activée');

    // ========== FONCTIONS DE GÉNÉRATION DE CODE ==========
    
    // Générateur de dashboard de gestion d'utilisateurs
    function generateUserDashboard(description) {
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Utilisateurs - GLP1 France</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
        }
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 2.5em; 
            font-weight: 300; 
        }
        .users-table {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .delete-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        .delete-btn:hover {
            background: #c82333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Dashboard Utilisateurs - GLP1 France</h1>
            <p>Gestion complète des utilisateurs • Sécurisé • Temps réel</p>
        </div>

        <div class="users-table">
            <div style="background: #667eea; color: white; padding: 20px;">
                <h3 style="margin: 0;">👥 Liste des Utilisateurs</h3>
            </div>
            
            <div id="loading" style="text-align: center; padding: 50px;">
                <p>⏳ Chargement des utilisateurs...</p>
            </div>
            
            <div id="users-content" style="display: none;">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Nom</th>
                            <th>Date Inscription</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-tbody">
                        <!-- Données chargées dynamiquement -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
    // Chargement des utilisateurs
    async function loadUsers() {
        try {
            const response = await fetch('/api/user-management.ts?action=list');
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Erreur de chargement');
            
            const users = data.users || [];
            
            // Remplir le tableau
            document.getElementById('users-tbody').innerHTML = users.map(user => \`
                <tr data-user-email="\${user.email}">
                    <td>\${user.id}</td>
                    <td><strong>\${user.email}</strong></td>
                    <td>\${user.name || '-'}</td>
                    <td>\${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteUser('\${user.email}')">
                            🗑️ Supprimer
                        </button>
                    </td>
                </tr>
            \`).join('');
            
            document.getElementById('loading').style.display = 'none';
            document.getElementById('users-content').style.display = 'block';
            
        } catch (error) {
            console.error('Erreur:', error);
            document.getElementById('loading').innerHTML = '<p style="color: #dc3545;">❌ Erreur de chargement</p>';
        }
    }
    
    // Suppression d'un utilisateur
    async function deleteUser(email) {
        if (!confirm(\`Supprimer l'utilisateur \${email} ?\`)) return;
        
        try {
            const response = await fetch('/api/delete-user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                alert(\`✅ Utilisateur \${email} supprimé avec succès\`);
                loadUsers(); // Recharger la liste
            } else {
                throw new Error(result.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            alert(\`❌ Erreur: \${error.message}\`);
        }
    }
    
    // Chargement initial
    document.addEventListener('DOMContentLoaded', loadUsers);
    </script>
</body>
</html>`;
    }
    
    // Générateur de formulaire de contact
    function generateContactForm() {
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact - GLP1 France</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .contact-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            color: #333;
        }
        .header h1 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
        }
        .form-group textarea {
            min-height: 120px;
            resize: vertical;
        }
        .submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 18px 40px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="contact-container">
        <div class="header">
            <h1>🏥 Contactez-nous</h1>
            <p>Une question sur les traitements GLP1 ? Notre équipe vous répond rapidement.</p>
        </div>
        
        <form id="contact-form">
            <div class="form-group">
                <label for="name">Nom complet *</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="subject">Sujet *</label>
                <select id="subject" name="subject" required>
                    <option value="">Choisissez un sujet</option>
                    <option value="information-glp1">Informations sur les GLP1</option>
                    <option value="effets-secondaires">Effets secondaires</option>
                    <option value="prix-remboursement">Prix et remboursement</option>
                    <option value="medecin-specialiste">Trouver un médecin spécialisé</option>
                    <option value="autre">Autre</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="message">Message *</label>
                <textarea id="message" name="message" placeholder="Décrivez votre question..." required></textarea>
            </div>
            
            <button type="submit" class="submit-btn">
                📧 Envoyer le message
            </button>
        </form>
    </div>
    
    <script>
    document.getElementById('contact-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/api/contact.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                alert('✅ Message envoyé avec succès !');
                this.reset();
            } else {
                throw new Error('Erreur lors de l\\'envoi');
            }
        } catch (error) {
            alert('❌ Erreur: ' + error.message);
        }
    });
    </script>
</body>
</html>`;
    }
    
    // Générateur d'API PHP
    function generateUserAPI(description) {
        return `<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

/**
 * API de Gestion d'Utilisateurs GLP1 France
 * ${description}
 */

define('DATA_FILE', __DIR__ . '/../../data/users-unified.json');

class UserManager {
    
    public function getAllUsers() {
        if (!file_exists(DATA_FILE)) {
            return ['users' => []];
        }
        
        $jsonContent = file_get_contents(DATA_FILE);
        $data = json_decode($jsonContent, true);
        
        return $data ?: ['users' => []];
    }
    
    public function deleteUser($email) {
        $data = $this->getAllUsers();
        $userFound = false;
        
        foreach ($data['users'] as $key => $user) {
            if ($user['email'] === $email) {
                unset($data['users'][$key]);
                $data['users'] = array_values($data['users']);
                $userFound = true;
                break;
            }
        }
        
        if (!$userFound) {
            throw new Exception("Utilisateur avec l'email $email introuvable");
        }
        
        if (file_put_contents(DATA_FILE, json_encode($data, JSON_PRETTY_PRINT)) === false) {
            throw new Exception('Erreur lors de la sauvegarde');
        }
        
        return true;
    }
}

try {
    $userManager = new UserManager();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            $data = $userManager->getAllUsers();
            echo json_encode(['success' => true, 'data' => $data]);
            break;
            
        case 'DELETE':
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['email'])) {
                throw new Exception('Email requis');
            }
            
            $userManager->deleteUser($input['email']);
            echo json_encode(['success' => true, 'message' => 'Utilisateur supprimé avec succès']);
            break;
            
        default:
            throw new Exception('Méthode non supportée');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>`;
    }
    
    // Générateur de template générique
    function generateGenericTemplate(description) {
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description} - GLP1 France</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
        }
        .glp1-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            margin-bottom: 20px;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="glp1-container">
        <div class="header">
            <h1>🏥 ${description}</h1>
            <p>Développé pour GLP1 France - Site de référence sur les traitements GLP1</p>
        </div>
        
        <div class="card">
            <h3>✨ Fonctionnalité en développement</h3>
            <p>Cette section sera complétée avec les fonctionnalités spécifiques à votre demande.</p>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
            <button class="btn-primary" onclick="alert('Fonctionnalité à implémenter')">
                🚀 Action principale
            </button>
        </div>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Page chargée: ${description}');
    });
    </script>
</body>
</html>`;
    }

    // Fonction de génération de prompts de développement
    function generateDevelopmentPrompt(description) {
        const prompt = `# 🏥 Prompt de Développement GLP1 France

## 📋 Demande Utilisateur
**Description**: ${description}

## 🎯 Contexte du Projet
**Site**: GLP1 France - Site de référence sur les traitements GLP1 (Ozempic, Wegovy, Saxenda)
**Architecture**: Astro.js + TypeScript + Tailwind CSS
**Backend**: API TypeScript + PHP (gestion utilisateurs)
**Base de données**: JSON files (users-unified.json, articles-database.json)

## 🔧 Technologies Disponibles
- **Frontend**: Astro, TypeScript, Tailwind CSS
- **Backend**: Node.js, PHP
- **Base de données**: JSON files, pas de SQL
- **APIs**: Système de gestion d'utilisateurs existant (/api/user-management.ts)
- **Sécurité**: Authentification par mot de passe, validation des données

## 📁 Structure du Projet
\`\`\`
src/
├── pages/
│   ├── admin-dashboard.astro    # Dashboard admin principal
│   ├── admin-user-data.astro    # Gestion des utilisateurs
│   └── api/
│       ├── user-management.ts   # API principale utilisateurs
│       └── delete-user.php      # API suppression sécurisée
data/
├── users-unified.json          # Base utilisateurs
└── articles-database.json      # Base articles
\`\`\`

## 🛡️ Exigences de Sécurité
1. **Validation des entrées**: Toujours valider email, données utilisateur
2. **Sauvegarde automatique**: Créer backup avant modification
3. **Logs**: Enregistrer toutes les actions importantes
4. **Authentification**: Vérifier les permissions admin
5. **Gestion d'erreurs**: Try/catch, messages d'erreur explicites

## 🎨 Guidelines de Design
- **Couleurs**: #667eea (bleu principal), #764ba2 (violet)
- **Style**: Design moderne, cards avec border-radius 12px
- **Mobile-first**: Responsive design obligatoire
- **Icons**: Emojis pour les actions (🗑️ supprimer, ✅ succès, ❌ erreur)

## 📦 Livrables Attendus
1. **Code principal**: Fichier(s) principal(aux) avec fonctionnalité complète
2. **Tests**: Code de test/validation
3. **Documentation**: Commentaires explicatifs dans le code
4. **Sécurité**: Validation et gestion d'erreurs
5. **Design**: Interface cohérente avec l'existant

## 🚀 Instructions Spécifiques
Développe une solution complète, sécurisée et prête à l'emploi pour: **${description}**

Utilise les patterns existants du projet GLP1, notamment:
- Le style du dashboard admin-dashboard.astro
- L'API user-management.ts pour les données
- Le système de sécurité avec backup automatique
- Le design cohérent avec les couleurs et styles du site

**Important**: Assure-toi que le code soit directement utilisable en production sur le site GLP1 France.`;

        return prompt;
    }

    // ========== COMMANDES VSCODE ==========

    // Commande de test
    let testCommand = vscode.commands.registerCommand('raglp.test', () => {
        vscode.window.showInformationMessage('🏥 RAGLP Extension fonctionne ! Version 3.3.0');
    });

    // Commande pour poser une question
    let askCommand = vscode.commands.registerCommand('raglp.ask', async () => {
        const query = await vscode.window.showInputBox({
            prompt: 'Posez votre question sur les GLP1',
            placeHolder: 'Ex: prix ozempic, effets secondaires wegovy...'
        });
        
        if (!query) return;
        
        // Recherche dans la base de connaissances
        let response = '';
        const queryLower = query.toLowerCase();
        
        for (const [key, data] of Object.entries(GLP1_RESPONSES)) {
            if (data.keywords.some(keyword => queryLower.includes(keyword))) {
                response = data.response;
                break;
            }
        }
        
        if (!response) {
            response = `Question reçue : "${query}"\n\nDésolé, je n'ai pas trouvé de réponse spécifique. Essayez des mots-clés comme :\n- ozempic, wegovy, semaglutide\n- prix, coût, remboursement\n- effets secondaires`;
        }
        
        // Afficher la réponse
        const panel = vscode.window.createWebviewPanel(
            'raglpResponse',
            '🏥 Réponse RAGLP',
            vscode.ViewColumn.One,
            {}
        );
        
        panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                    .content { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
                    pre { background: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>🏥 RAGLP Assistant - GLP1 France</h2>
                    <p>Votre question : "${query}"</p>
                </div>
                <div class="content">
                    <pre>${response}</pre>
                </div>
            </body>
            </html>
        `;
    });

    // Commande génération de code
    let codeCommand = vscode.commands.registerCommand('raglp.generateCode', async () => {
        const description = await vscode.window.showInputBox({
            prompt: 'Décrivez le code à générer pour le site GLP1',
            placeHolder: 'Ex: dashboard admin users, calculateur IMC, formulaire contact'
        });
        
        if (!description) return;
        
        let code = '';
        const desc = description.toLowerCase();
        
        if (desc.includes('dashboard') && (desc.includes('user') || desc.includes('utilisateur'))) {
            code = generateUserDashboard(description);
        } else if (desc.includes('calculateur') || desc.includes('imc')) {
            code = `<!DOCTYPE html>
<html>
<head>
    <title>Calculateur IMC GLP1</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin: 15px 0; }
        input { padding: 10px; width: 200px; border: 1px solid #ddd; border-radius: 5px; }
        button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .result { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🏥 Calculateur IMC avec Recommandations GLP1</h1>
    
    <div class="form-group">
        <label>Poids (kg):</label><br>
        <input type="number" id="weight" placeholder="70">
    </div>
    
    <div class="form-group">
        <label>Taille (cm):</label><br>
        <input type="number" id="height" placeholder="170">
    </div>
    
    <button onclick="calculateIMC()">Calculer IMC</button>
    
    <div id="result" class="result" style="display:none;"></div>
    
    <script>
    function calculateIMC() {
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value) / 100;
        
        if (!weight || !height) {
            alert('Veuillez saisir votre poids et taille');
            return;
        }
        
        const imc = weight / (height * height);
        const result = document.getElementById('result');
        
        let category = '';
        let glp1Recommendation = '';
        
        if (imc < 18.5) {
            category = 'Insuffisance pondérale';
            glp1Recommendation = 'GLP1 non recommandé';
        } else if (imc < 25) {
            category = 'Poids normal';
            glp1Recommendation = 'GLP1 non nécessaire';
        } else if (imc < 30) {
            category = 'Surpoids';
            glp1Recommendation = 'Consultez votre médecin pour évaluer les options';
        } else {
            category = 'Obésité';
            glp1Recommendation = 'GLP1 peut être bénéfique - consultez un spécialiste';
        }
        
        result.innerHTML = \`
            <h3>Résultats</h3>
            <p><strong>IMC:</strong> \${imc.toFixed(1)}</p>
            <p><strong>Catégorie:</strong> \${category}</p>
            <p><strong>Recommandation GLP1:</strong> \${glp1Recommendation}</p>
        \`;
        result.style.display = 'block';
    }
    </script>
</body>
</html>`;
        } else if (desc.includes('formulaire') || desc.includes('contact')) {
            code = generateContactForm();
        } else if (desc.includes('api') && (desc.includes('user') || desc.includes('utilisateur'))) {
            code = generateUserAPI(description);
        } else {
            code = generateGenericTemplate(description);
        }
        
        // Créer un nouveau fichier avec le code
        const doc = await vscode.workspace.openTextDocument({
            content: code,
            language: desc.includes('api') || desc.includes('php') ? 'php' : 'html'
        });
        
        await vscode.window.showTextDocument(doc);
    });

    // Commande génération de prompts pour développement
    let promptCommand = vscode.commands.registerCommand('raglp.generatePrompt', async () => {
        const description = await vscode.window.showInputBox({
            prompt: 'Décrivez la fonctionnalité à développer pour le site GLP1',
            placeHolder: 'Ex: supprimer des users dans dashboard admin avec sécurité'
        });
        
        if (!description) return;
        
        const prompt = generateDevelopmentPrompt(description);
        
        // Créer un nouveau fichier avec le prompt
        const doc = await vscode.workspace.openTextDocument({
            content: prompt,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
    });

    // Enregistrer les commandes
    context.subscriptions.push(testCommand);
    context.subscriptions.push(askCommand);
    context.subscriptions.push(codeCommand);
    context.subscriptions.push(promptCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
