const vscode = require('vscode');

// ========================================
// ACTIVATION DE L'EXTENSION
// ========================================

function activate(context) {
    console.log('🚀 Extension RAGLP v3.5.0 - RAG Adaptatif Activée');

    // ========================================
    // GÉNÉRATEURS DE CODE ADAPTATIFS
    // ========================================

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
**Exemples existants**: admin-dashboard.astro, admin-user-data.astro, admin-users-advanced.astro
**Style**: Design médical professionnel avec gradients bleu/violet
**Fonctionnalités**: CRUD, statistiques, recherche, export, sécurité

**APIs disponibles**:
- \`/api/user-management.ts\` - Gestion utilisateurs
- \`/api/delete-user-hostinger.php\` - Suppression sécurisée
- \`data/users-unified.json\` - Base utilisateurs`,

            api: `

## 🔌 Contexte API/Backend
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

## 🛠️ Guidelines Techniques Adaptées
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
    }

    // ========================================
    // GÉNÉRATEURS DE CODE SPÉCIALISÉS
    // ========================================

    function generateUserDashboard(description) {
        const analysis = analyzeUserRequest(description);
        
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard ${analysis.keywords[0] || 'Admin'} - GLP1 France</title>
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
            text-align: center;
        }
        .header h1 { 
            margin: 0; 
            font-size: 2.5em; 
            font-weight: 300; 
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .data-table {
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
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        .btn:hover {
            background: #5a6fd8;
        }
        .btn-danger {
            background: #dc3545;
        }
        .btn-danger:hover {
            background: #c82333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Dashboard ${analysis.keywords[0] || 'Admin'}</h1>
            <p>Gestion ${description}</p>
        </div>
        
        <div class="dashboard-grid">
            <div class="card">
                <h3>📊 Statistiques</h3>
                <p>Total: <strong id="total-count">0</strong></p>
                <p>Aujourd'hui: <strong id="today-count">0</strong></p>
            </div>
            
            <div class="card">
                <h3>🔍 Actions Rapides</h3>
                <button class="btn" onclick="refreshData()">🔄 Actualiser</button>
                <button class="btn" onclick="exportData()">📊 Exporter</button>
            </div>
        </div>
        
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="data-table-body">
                    <!-- Données dynamiques -->
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Code adapté à la requête: ${description}
        let data = [];
        
        async function loadData() {
            try {
                // Adapter selon le type de données demandé
                const response = await fetch('/api/${analysis.type === 'dashboard' ? 'admin-data' : 'user-management'}');
                const result = await response.json();
                data = result.data || result || [];
                displayData();
                updateStats();
            } catch (error) {
                console.error('Erreur de chargement:', error);
            }
        }
        
        function displayData() {
            const tbody = document.getElementById('data-table-body');
            tbody.innerHTML = data.map(item => \`
                <tr>
                    <td>\${item.id || Date.now()}</td>
                    <td>\${item.name || item.nom || 'N/A'}</td>
                    <td>\${item.email || 'N/A'}</td>
                    <td>\${new Date(item.date || Date.now()).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteItem('\${item.id || item.email}')">
                            🗑️ Supprimer
                        </button>
                    </td>
                </tr>
            \`).join('');
        }
        
        function updateStats() {
            document.getElementById('total-count').textContent = data.length;
            const today = new Date().toDateString();
            const todayCount = data.filter(item => 
                new Date(item.date || Date.now()).toDateString() === today
            ).length;
            document.getElementById('today-count').textContent = todayCount;
        }
        
        async function deleteItem(id) {
            if (!confirm('Confirmer la suppression ?')) return;
            
            try {
                const response = await fetch('/api/delete-user-hostinger.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: id })
                });
                
                if (response.ok) {
                    alert('✅ Suppression réussie');
                    loadData();
                } else {
                    throw new Error('Erreur serveur');
                }
            } catch (error) {
                alert('❌ Erreur: ' + error.message);
            }
        }
        
        function refreshData() {
            loadData();
        }
        
        function exportData() {
            const csv = [
                ['ID', 'Nom', 'Email', 'Date'],
                ...data.map(item => [
                    item.id || Date.now(),
                    item.name || item.nom || 'N/A',
                    item.email || 'N/A',
                    new Date(item.date || Date.now()).toLocaleDateString()
                ])
            ].map(row => row.join(',')).join('\\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '${analysis.keywords[0] || 'data'}-export.csv';
            a.click();
        }
        
        // Chargement initial
        document.addEventListener('DOMContentLoaded', loadData);
    </script>
</body>
</html>`;
    }

    // ========================================
    // COMMANDES VSCODE
    // ========================================

    // Commande de test de connexion
    const testCommand = vscode.commands.registerCommand('raglp.testConnection', () => {
        vscode.window.showInformationMessage('🚀 RAGLP v3.5.0 - RAG Adaptatif Fonctionnel ! ✅');
    });

    // Commande pour poser une question contextuelle
    const askCommand = vscode.commands.registerCommand('raglp.askQuestion', async () => {
        const question = await vscode.window.showInputBox({
            prompt: '🤔 Quelle est votre question sur GLP1 France ?',
            placeholder: 'Ex: Comment créer un dashboard de gestion des articles ?'
        });

        if (question) {
            const prompt = generateDevelopmentPrompt(question);
            const doc = await vscode.workspace.openTextDocument({
                content: prompt,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
        }
    });

    // Commande pour générer du code adaptatif
    const codeCommand = vscode.commands.registerCommand('raglp.generateCode', async () => {
        const description = await vscode.window.showInputBox({
            prompt: '🛠️ Décrivez le code à générer',
            placeholder: 'Ex: Dashboard admin pour gérer les utilisateurs avec recherche et suppression'
        });

        if (description) {
            const analysis = analyzeUserRequest(description);
            let code = '';

            // Génération adaptative selon le type détecté
            switch (analysis.type) {
                case 'dashboard':
                case 'admin':
                    code = generateUserDashboard(description);
                    break;
                default:
                    code = generateUserDashboard(description);
            }

            const doc = await vscode.workspace.openTextDocument({
                content: code,
                language: 'html'
            });
            await vscode.window.showTextDocument(doc);
        }
    });

    // Commande pour générer un prompt adaptatif
    const promptCommand = vscode.commands.registerCommand('raglp.generatePrompt', async () => {
        const description = await vscode.window.showInputBox({
            prompt: '🎯 Décrivez votre besoin pour le RAG adaptatif',
            placeholder: 'Ex: Créer un système de newsletter avec validation email'
        });

        if (description) {
            const prompt = generateDevelopmentPrompt(description);
            const doc = await vscode.workspace.openTextDocument({
                content: prompt,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
        }
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
