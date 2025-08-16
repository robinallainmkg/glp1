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

    // Fonction de génération de RAG adaptatif intelligent
    function generateDevelopmentPrompt(description) {
        // Analyse intelligente de la requête utilisateur
        const analysis = analyzeUserRequest(description);
        
        const basePrompt = `# 🏥 RAG Intelligent GLP1 France - Réponse Adaptative

## 🎯 Analyse de la Requête
**Demande**: "${description}"
**Type détecté**: ${analysis.type.toUpperCase()}
**Complexité**: ${analysis.complexity}
**Technologies impliquées**: ${analysis.technologies.join(', ')}
**Urgence**: ${analysis.urgency}`;

        const contextualPrompt = generateContextualPrompt(analysis, description);
        const technicalPrompt = generateTechnicalGuidelines(analysis);
        const deliverablePrompt = generateDeliverableInstructions(analysis);

        return basePrompt + contextualPrompt + technicalPrompt + deliverablePrompt;
    }

    function analyzeUserRequest(description) {
        const query = description.toLowerCase();
        
        // Détection du type de demande
        const typePatterns = {
            dashboard: /dashboard|admin|gestion|interface|tableau|stats|données|utilisateur/i,
            api: /api|endpoint|route|backend|serveur|php|typescript|données/i,
            page: /page|article|contenu|seo|astro|blog|landing/i,
            component: /composant|component|réutilisable|module|ui|widget/i,
            form: /formulaire|form|contact|inscription|newsletter|input/i,
            database: /base|données|json|storage|fichier|data|crud/i,
            auth: /auth|authentification|login|session|sécurité|permission/i,
            affiliate: /affiliation|produit|conversion|tracking|commission|vente/i,
            seo: /seo|référencement|google|search|ranking|meta|optimisation/i,
            medical: /médical|glp1|ozempic|wegovy|diabète|perte|poids|traitement/i,
            performance: /performance|optimisation|vitesse|cache|bundle|lighthouse/i,
            design: /design|style|css|couleur|responsive|mobile|ui\/ux/i
        };

        let detectedType = 'general';
        for (const [type, pattern] of Object.entries(typePatterns)) {
            if (pattern.test(query)) {
                detectedType = type;
                break;
            }
        }

        // Détection de la complexité
        const complexityIndicators = {
            simple: /simple|basique|rapide|petit|léger/i,
            medium: /moyen|standard|normal|complet/i,
            complex: /complexe|avancé|sophistiqué|complet|intégration|système/i
        };

        let complexity = 'medium';
        for (const [level, pattern] of Object.entries(complexityIndicators)) {
            if (pattern.test(query)) {
                complexity = level;
                break;
            }
        }

        // Détection des technologies
        const techPatterns = {
            astro: /astro|\.astro|page|frontmatter/i,
            typescript: /typescript|\.ts|api|backend/i,
            php: /php|\.php|serveur/i,
            css: /css|style|design|couleur/i,
            json: /json|données|base|storage/i,
            javascript: /javascript|js|interactif|dynamique/i
        };

        const technologies = [];
        for (const [tech, pattern] of Object.entries(techPatterns)) {
            if (pattern.test(query)) {
                technologies.push(tech);
            }
        }

        // Détection de l'urgence
        const urgencyPatterns = {
            urgent: /urgent|rapide|vite|asap|immédiat/i,
            normal: /normal|standard|quand|possible/i,
            low: /futur|plus tard|éventuel|optionnel/i
        };

        let urgency = 'normal';
        for (const [level, pattern] of Object.entries(urgencyPatterns)) {
            if (pattern.test(query)) {
                urgency = level;
                break;
            }
        }

        return {
            type: detectedType,
            complexity,
            technologies: technologies.length > 0 ? technologies : ['astro', 'typescript'],
            urgency,
            keywords: extractKeywords(query)
        };
    }

    function extractKeywords(query) {
        const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'pour', 'avec', 'dans', 'sur', 'à', 'il', 'elle', 'est', 'sont', 'avoir', 'être'];
        return query.split(' ')
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .slice(0, 5);
    }

    function generateContextualPrompt(analysis, description) {
        const contexts = {
            dashboard: `

## 🖥️ Contexte Dashboard Admin
**Objectif**: Interface d'administration pour GLP1 France
**Localisation**: \`src/pages/admin-*.astro\`
**Exemples existants**: admin-dashboard.astro, admin-user-data.astro
**Style**: Design médical professionnel avec gradients bleu/violet
**Fonctionnalités**: CRUD, statistiques, recherche, export, sécurité

**APIs disponibles**:
- \`/api/user-management.ts\` - Gestion utilisateurs
- \`/api/delete-user-hostinger.php\` - Suppression sécurisée
- \`data/users-unified.json\` - Base utilisateurs`,

            api: `

## � Contexte API/Backend
**Objectif**: Endpoints pour le site GLP1 France
**Localisation**: \`src/pages/api/\`
**Formats**: TypeScript (.ts) préféré, PHP (.php) pour legacy
**Environnement**: Auto-détection local/Hostinger
**Sécurité**: Validation, logs, backups automatiques

**Structure données**:
- \`data/users-unified.json\` - Utilisateurs (email, nom, date)
- \`data/articles-database.json\` - Articles SEO
- \`data/affiliate-products.json\` - Produits affiliation`,

            medical: `

## 🏥 Contexte Médical GLP-1
**Domaine**: Traitements GLP-1 pour diabète et perte de poids
**Traitements**: Ozempic, Wegovy, Saxenda, Trulicity, Mounjaro
**Public**: Patients, familles, professionnels de santé
**Compliance**: ANSM, RGPD, éthique médicale

**Vocabulaire spécialisé**:
- GLP-1: Glucagon-like peptide-1
- Semaglutide, Liraglutide, Tirzepatide
- Diabète type 2, obésité, HbA1c`,

            seo: `

## 🔍 Contexte SEO Médical
**Mots-clés cibles**: GLP-1, Ozempic, Wegovy, diabète, perte poids
**Structure**: H1 unique, hiérarchie H2-H6 logique
**Schema.org**: Medical, Article, Product (affiliation)
**Performance**: Core Web Vitals, SSG Astro optimisé
**Autorité**: Liens internes, sources médicales fiables`,

            general: `

## 🔧 Contexte Général GLP1 France
**Framework**: Astro.js (SSG) + TypeScript
**Design System**: Médical bleu (#667eea) / violet (#764ba2)
**Hébergement**: Hostinger (production)
**Architecture**: Pages statiques + APIs JSON`
        };

        return contexts[analysis.type] || contexts.general;
    }

    function generateTechnicalGuidelines(analysis) {
        return `

## �️ Guidelines Techniques Adaptées
**Complexité**: ${analysis.complexity.toUpperCase()}
**Technologies**: ${analysis.technologies.join(' + ')}

### 📋 Checklist Technique
${analysis.complexity === 'simple' ? 
`- ✅ Solution directe et efficace
- ✅ Code minimal mais fonctionnel
- ✅ Documentation basique` :
analysis.complexity === 'complex' ?
`- ✅ Architecture modulaire et évolutive
- ✅ Tests unitaires et d'intégration
- ✅ Documentation complète
- ✅ Gestion d'erreurs avancée
- ✅ Optimisations performance` :
`- ✅ Code structuré et maintenable
- ✅ Gestion d'erreurs standard
- ✅ Documentation des fonctions clés`}

### 🛡️ Sécurité Requise
- Validation stricte des entrées utilisateur
- Sanitisation des données (XSS, injection)
- Logs détaillés avec timestamp et IP
- Backup automatique avant modifications critiques
- Headers de sécurité appropriés

### 🎨 Standards Design GLP1
- Couleurs: Gradient bleu #667eea vers violet #764ba2
- Typography: Segoe UI, arial fallback
- Spacing: Padding 20px, margins cohérents
- Border-radius: 12px pour cards, 8px pour inputs
- Mobile-first responsive design`;
    }

    function generateDeliverableInstructions(analysis) {
        const urgencyInstructions = {
            urgent: `

## 🚀 Livraison URGENTE
**Délai**: Solution immédiate
**Focus**: Fonctionnalité core, MVP rapide
**Qualité**: Code fonctionnel, optimisation ultérieure`,

            normal: `

## 📦 Livraison Standard
**Délai**: Solution complète et testée
**Focus**: Fonctionnalité + qualité + sécurité
**Qualité**: Code production-ready`,

            low: `

## 🔮 Livraison Planifiée
**Délai**: Solution optimale et documentée
**Focus**: Architecture évolutive + best practices
**Qualité**: Code exemplaire et maintenable`
        };

        return urgencyInstructions[analysis.urgency] + `

## 📝 Format de Réponse Attendu
1. **Code principal**: ${analysis.technologies.includes('astro') ? 'Fichier .astro complet' : 'Code selon technologie détectée'}
2. **Configuration**: Imports, dépendances, setup requis
3. **Documentation**: Commentaires inline, README si complexe
4. **Tests**: ${analysis.complexity === 'simple' ? 'Tests basiques' : 'Suite de tests complète'}
5. **Déploiement**: Instructions Hostinger si applicable

## 🎯 Instruction Finale
**Génère une solution ${analysis.complexity} pour**: "${analysis.keywords.join(', ')}"
**Qui s'intègre parfaitement dans l'écosystème GLP1 France existant.**

---
*RAG adaptatif - Réponse contextualisée selon l'analyse de la requête*`;

        return basePrompt + contextualPrompt + technicalPrompt + deliverablePrompt;
    }

    // ========================================
    // COMMANDES VSCODE
    // ========================================
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


function deactivate() {}

module.exports = {
    activate,
    deactivate
};
