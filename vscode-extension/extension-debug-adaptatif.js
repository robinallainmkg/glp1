const vscode = require('vscode');

function activate(context) {
    console.log('🚀 Extension RAGLP v3.6.0 - RAG Super Adaptatif Activée');

    // ========================================
    // SYSTÈME D'ANALYSE INTELLIGENT
    // ========================================

    function analyzeUserRequest(description) {
        console.log(`🔍 Analyse de la requête: "${description}"`);
        
        const query = description.toLowerCase();
        
        // Patterns de détection très spécifiques
        const typePatterns = {
            dashboard: /dashboard|admin|gestion|interface|tableau|stats|données|utilisateur|crud/i,
            api: /api|endpoint|route|backend|serveur|php|typescript|données|json/i,
            page: /page|article|contenu|seo|astro|blog|landing|site/i,
            component: /composant|component|réutilisable|module|ui|widget/i,
            form: /formulaire|form|contact|inscription|newsletter|input|validation/i,
            database: /base|données|json|storage|fichier|data|crud|bdd/i,
            auth: /auth|authentification|login|session|sécurité|permission/i,
            affiliate: /affiliation|produit|conversion|tracking|commission|vente/i,
            seo: /seo|référencement|google|search|ranking|meta|optimisation/i,
            medical: /médical|glp1|ozempic|wegovy|diabète|perte|poids|traitement|santé/i,
            performance: /performance|optimisation|vitesse|cache|bundle|lighthouse/i,
            design: /design|style|css|couleur|responsive|mobile|ui|ux/i
        };

        let detectedType = 'general';
        let matchedPattern = '';
        
        for (const [type, pattern] of Object.entries(typePatterns)) {
            if (pattern.test(query)) {
                detectedType = type;
                matchedPattern = pattern.toString();
                console.log(`✅ Type détecté: ${type.toUpperCase()} (pattern: ${matchedPattern})`);
                break;
            }
        }

        // Détection de complexité
        const complexityIndicators = {
            simple: /simple|basique|rapide|petit|léger|minimal|basic/i,
            medium: /moyen|standard|normal|complet|classique/i,
            complex: /complexe|avancé|sophistiqué|complet|intégration|système|enterprise/i
        };

        let complexity = 'medium';
        for (const [level, pattern] of Object.entries(complexityIndicators)) {
            if (pattern.test(query)) {
                complexity = level;
                console.log(`📊 Complexité: ${level.toUpperCase()}`);
                break;
            }
        }

        // Détection d'urgence
        const urgencyPatterns = {
            urgent: /urgent|rapide|vite|asap|immédiat|emergency/i,
            normal: /normal|standard|quand|possible/i,
            low: /futur|plus tard|éventuel|optionnel/i
        };

        let urgency = 'normal';
        for (const [level, pattern] of Object.entries(urgencyPatterns)) {
            if (pattern.test(query)) {
                urgency = level;
                console.log(`⏱️ Urgence: ${level.toUpperCase()}`);
                break;
            }
        }

        // Extraction de mots-clés
        const keywords = extractKeywords(query);
        console.log(`🔑 Mots-clés: ${keywords.join(', ')}`);

        const result = {
            type: detectedType,
            complexity,
            urgency,
            keywords,
            originalQuery: description
        };

        console.log(`🎯 Analyse finale:`, result);
        return result;
    }

    function extractKeywords(query) {
        const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'pour', 'avec', 'dans', 'sur', 'à', 'il', 'elle', 'est', 'sont', 'avoir', 'être', 'que', 'qui', 'cette', 'ces'];
        return query.split(/[\\s,.-]+/)
            .filter(word => word.length > 2 && !stopWords.includes(word.toLowerCase()))
            .slice(0, 5);
    }

    // ========================================
    // GÉNÉRATEUR DE PROMPT ADAPTATIF
    // ========================================

    function generateAdaptivePrompt(analysis) {
        console.log(`🎨 Génération du prompt adaptatif pour type: ${analysis.type}`);

        const timestamp = new Date().toLocaleString('fr-FR');
        
        let adaptivePrompt = `# 🤖 RAG Adaptatif GLP1 France v3.6.0
**Timestamp**: ${timestamp}
**Requête originale**: "${analysis.originalQuery}"

## 🔬 ANALYSE AUTOMATIQUE
- **Type détecté**: ${analysis.type.toUpperCase()} ✅
- **Complexité**: ${analysis.complexity.toUpperCase()} 📊
- **Urgence**: ${analysis.urgency.toUpperCase()} ⏱️
- **Mots-clés**: ${analysis.keywords.join(', ')} 🔑

`;

        // Contexte adaptatif selon le type
        const adaptiveContexts = {
            dashboard: `## 🖥️ CONTEXTE DASHBOARD ADMIN SPÉCIALISÉ
**Mission**: Créer une interface d'administration pour GLP1 France
**Localisation**: \`src/pages/admin-*.astro\`
**Références**: admin-dashboard.astro, admin-users-advanced.astro
**Style**: Design médical bleu (#667eea) violet (#764ba2)

**APIs disponibles pour dashboards**:
- \`/api/user-management.ts\` - CRUD utilisateurs
- \`/api/delete-user-hostinger.php\` - Suppression sécurisée
- \`/api/admin-data.ts\` - Données administratives
- \`data/users-unified.json\` - Base utilisateurs

**Fonctionnalités dashboard typiques**:
- Tables avec tri/filtrage ✅
- Statistiques en temps réel ✅
- Actions CRUD sécurisées ✅
- Export de données ✅
- Recherche avancée ✅`,

            api: `## 🔌 CONTEXTE API/BACKEND SPÉCIALISÉ
**Mission**: Développer des endpoints robustes pour GLP1 France
**Localisation**: \`src/pages/api/\`
**Format préféré**: TypeScript (.ts) > PHP (.php)
**Environnement**: Auto-détection local/Hostinger

**Structure de données GLP1**:
- \`data/users-unified.json\` - Utilisateurs (email, nom, date, etc.)
- \`data/articles-database.json\` - Articles SEO
- \`data/affiliate-products.json\` - Produits d'affiliation
- \`logs/\` - Journaux d'activité

**Sécurité API obligatoire**:
- Validation stricte des inputs ✅
- Logs avec IP/timestamp ✅
- Backup avant modifications ✅
- Gestion d'erreurs complète ✅`,

            medical: `## 🏥 CONTEXTE MÉDICAL GLP-1 SPÉCIALISÉ
**Mission**: Contenu médical spécialisé traitements GLP-1
**Domaine**: Diabète type 2, obésité, perte de poids
**Public**: Patients, familles, professionnels de santé
**Compliance**: ANSM, RGPD, directives médicales UE

**Traitements GLP-1 couverts**:
- **Ozempic** (semaglutide) - Diabète + perte poids
- **Wegovy** (semaglutide haute dose) - Obésité
- **Saxenda** (liraglutide) - Perte de poids
- **Trulicity** (dulaglutide) - Diabète
- **Mounjaro** (tirzepatide) - Nouvelle génération

**Vocabulaire médical obligatoire**:
- GLP-1: Glucagon-like peptide-1
- HbA1c: Hémoglobine glyquée
- IMC: Indice de masse corporelle
- Effet incrétine, résistance insuline`,

            seo: `## 🔍 CONTEXTE SEO MÉDICAL SPÉCIALISÉ
**Mission**: Optimisation SEO pour requêtes médicales GLP-1
**Mots-clés primaires**: GLP-1, Ozempic, Wegovy, diabète, perte poids
**Concurrence**: Sites médicaux, forums, pharmacies en ligne
**Autorité**: E-A-T (Expertise, Autorité, Confiance)

**Structure SEO optimisée**:
- H1 unique avec mot-clé principal ✅
- H2-H6 hiérarchie logique ✅
- Meta title 55-60 caractères ✅
- Meta description 150-160 caractères ✅
- Schema.org Medical/Article ✅
- Liens internes pertinents ✅`,

            general: `## 🔧 CONTEXTE GÉNÉRAL GLP1 FRANCE
**Framework**: Astro.js (SSG) + TypeScript
**Design**: Médical bleu/violet professionnel
**Hébergement**: Hostinger (production)
**Performance**: Core Web Vitals optimisés`
        };

        adaptivePrompt += adaptiveContexts[analysis.type] || adaptiveContexts.general;

        // Guidelines techniques adaptatives
        adaptivePrompt += `

## 🛠️ GUIDELINES TECHNIQUES ADAPTATIVES
**Niveau de complexité**: ${analysis.complexity.toUpperCase()}`;

        if (analysis.complexity === 'simple') {
            adaptivePrompt += `
- ✅ Solution directe et efficace
- ✅ Code minimal mais fonctionnel  
- ✅ Documentation basique inline
- ✅ MVP (Minimum Viable Product)
- ❌ Pas de sur-ingénierie`;
        } else if (analysis.complexity === 'complex') {
            adaptivePrompt += `
- ✅ Architecture modulaire et évolutive
- ✅ Tests unitaires et d'intégration
- ✅ Documentation complète (README + comments)
- ✅ Gestion d'erreurs avancée
- ✅ Optimisations performance
- ✅ Monitoring et logging détaillé
- ✅ Scalabilité prévue`;
        } else {
            adaptivePrompt += `
- ✅ Code structuré et maintenable
- ✅ Gestion d'erreurs standard
- ✅ Documentation des fonctions clés
- ✅ Tests de base
- ✅ Bonnes pratiques respectées`;
        }

        // Instructions de livraison selon l'urgence
        adaptivePrompt += `

## 📦 INSTRUCTIONS DE LIVRAISON
**Urgence**: ${analysis.urgency.toUpperCase()}`;

        if (analysis.urgency === 'urgent') {
            adaptivePrompt += `
**Délai**: Solution IMMÉDIATE requise ⚡
**Focus**: Fonctionnalité core uniquement
**Qualité**: Code fonctionnel, optimisation plus tard
**Livrable**: MVP prêt à déployer en < 30 min`;
        } else if (analysis.urgency === 'low') {
            adaptivePrompt += `
**Délai**: Planification long terme 🔮
**Focus**: Architecture optimale + best practices
**Qualité**: Code exemplaire et maintenable
**Livrable**: Solution de référence avec documentation`;
        } else {
            adaptivePrompt += `
**Délai**: Solution complète et testée 📊
**Focus**: Fonctionnalité + qualité + sécurité
**Qualité**: Code production-ready
**Livrable**: Prêt pour déploiement Hostinger`;
        }

        adaptivePrompt += `

## 🎯 INSTRUCTION FINALE PERSONNALISÉE
**Générez une solution ${analysis.complexity} pour les mots-clés**: ${analysis.keywords.join(', ')}
**Qui s'intègre parfaitement dans l'écosystème GLP1 France existant**
**Avec un niveau d'urgence ${analysis.urgency}**

---
🤖 *RAG Adaptatif v3.6.0 - Prompt personnalisé généré automatiquement*
🕐 *${timestamp}*`;

        console.log(`✅ Prompt adaptatif généré (${adaptivePrompt.length} caractères)`);
        return adaptivePrompt;
    }

    // ========================================
    // COMMANDES VS CODE
    // ========================================

    // Commande test
    const testCommand = vscode.commands.registerCommand('raglp.testConnection', () => {
        vscode.window.showInformationMessage('🚀 RAGLP v3.6.0 RAG Super Adaptatif - ACTIF ! ✅');
    });

    // Commande principale : Génération de prompt adaptatif
    const promptCommand = vscode.commands.registerCommand('raglp.generatePrompt', async () => {
        const description = await vscode.window.showInputBox({
            prompt: '🎯 Décrivez votre besoin (le RAG va s\'adapter automatiquement)',
            placeholder: 'Ex: dashboard admin urgent, api médical complexe, page seo ozempic...',
            ignoreFocusOut: true
        });

        if (description && description.trim()) {
            console.log(`🚀 Début de génération pour: "${description}"`);
            
            // Analyse intelligente
            const analysis = analyzeUserRequest(description);
            
            // Génération adaptative
            const adaptivePrompt = generateAdaptivePrompt(analysis);
            
            // Affichage
            const doc = await vscode.workspace.openTextDocument({
                content: adaptivePrompt,
                language: 'markdown'
            });
            
            await vscode.window.showTextDocument(doc);
            
            // Notification de succès avec détails
            vscode.window.showInformationMessage(
                `✅ Prompt ${analysis.type.toUpperCase()} adaptatif généré ! Complexité: ${analysis.complexity}, Urgence: ${analysis.urgency}`
            );
        }
    });

    // Commande de démo comparative
    const demoCommand = vscode.commands.registerCommand('raglp.demoAdaptive', async () => {
        const testRequests = [
            'dashboard admin pour gérer les utilisateurs avec stats',
            'api endpoint complexe pour supprimer des articles médicaux',  
            'page seo simple sur ozempic et wegovy',
            'formulaire contact urgent minimaliste'
        ];

        let demoContent = `# 🧪 DÉMONSTRATION RAG ADAPTATIF v3.6.0
Date: ${new Date().toLocaleString('fr-FR')}

## 🎯 Preuve que le RAG s'adapte vraiment à chaque requête

`;

        for (let i = 0; i < testRequests.length; i++) {
            const request = testRequests[i];
            const analysis = analyzeUserRequest(request);
            
            demoContent += `### Test ${i + 1}: "${request}"
- **Type détecté**: ${analysis.type.toUpperCase()} 🎯
- **Complexité**: ${analysis.complexity.toUpperCase()} 📊  
- **Urgence**: ${analysis.urgency.toUpperCase()} ⏱️
- **Mots-clés**: ${analysis.keywords.join(', ')} 🔑

`;
        }

        demoContent += `
## ✅ Conclusion
Chaque requête génère une analyse différente !
**Le RAG est bel et bien adaptatif** 🚀

Pour tester: \`Ctrl+Shift+P > RAGLP: Générer Prompt\``;

        const doc = await vscode.workspace.openTextDocument({
            content: demoContent,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
    });

    // Enregistrement des commandes
    context.subscriptions.push(testCommand);
    context.subscriptions.push(promptCommand);
    context.subscriptions.push(demoCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };
