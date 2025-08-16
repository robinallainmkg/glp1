const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    console.log('🚀 Extension RAGLP v4.0.0 - RAG RÉEL Intégré Activée');

    // ========================================
    // INTÉGRATION RAG SYSTÈME EXISTANT
    // ========================================

    // Chemin vers votre RAG système
    const RAG_SYSTEM_PATH = 'C:\\Users\\robin\\Documents\\glp1official\\glp1\\rag-system';
    const EMBEDDINGS_PATH = path.join(RAG_SYSTEM_PATH, 'embeddings', 'glp1_embeddings.json');

    async function loadRAGIndex() {
        try {
            if (!fs.existsSync(EMBEDDINGS_PATH)) {
                throw new Error(`Index RAG introuvable: ${EMBEDDINGS_PATH}`);
            }

            const embeddings = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf8'));
            console.log(`✅ Index RAG chargé: ${embeddings.length} documents indexés`);
            return embeddings;
        } catch (error) {
            console.error('❌ Erreur chargement RAG:', error);
            vscode.window.showErrorMessage(`Erreur RAG: ${error.message}`);
            return [];
        }
    }

    function searchRAGContent(query, embeddings, maxResults = 10) {
        console.log(`🔍 Recherche dans RAG: "${query}"`);
        
        if (!embeddings || embeddings.length === 0) {
            console.log('❌ Aucun embedding disponible');
            return [];
        }

        // Recherche textuelle simple (en attendant l'intégration OpenAI)
        const queryLower = query.toLowerCase();
        const results = [];

        if (Array.isArray(embeddings)) {
            embeddings.forEach((item, index) => {
                let score = 0;
                const content = (item.content || '').toLowerCase();
                const title = (item.title || '').toLowerCase();
                const url = (item.url || '').toLowerCase();

                // Scoring basique
            if (title.includes(queryLower)) score += 10;
            if (url.includes(queryLower)) score += 5;
            if (content.includes(queryLower)) score += 1;

            // Recherche par mots-clés
            const queryWords = queryLower.split(/\\s+/);
            queryWords.forEach(word => {
                if (word.length > 2) {
                    if (title.includes(word)) score += 3;
                    if (content.includes(word)) score += 1;
                }
            });

            if (score > 0) {
                results.push({
                    ...item,
                    score,
                    relevance: Math.min(score / 10, 1)
                });
            }
        });
        }

        // Trier par score et limiter
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }

    function analyzeUserRequest(description) {
        console.log(`🔍 Analyse de la requête: "${description}"`);
        
        const query = description.toLowerCase();
        
        // Patterns de détection spécifiques au projet GLP1
        const typePatterns = {
            dashboard: /dashboard|admin|gestion|interface|tableau|stats|données|utilisateur|crud/i,
            api: /api|endpoint|route|backend|serveur|php|typescript|données|json/i,
            page: /page|article|contenu|seo|astro|blog|landing|site/i,
            component: /composant|component|réutilisable|module|ui|widget/i,
            form: /formulaire|form|contact|inscription|newsletter|input|validation/i,
            database: /base|données|json|storage|fichier|data|crud|bdd/i,
            medical: /médical|glp1|ozempic|wegovy|diabète|perte|poids|traitement|santé|mounjaro|saxenda|trulicity/i,
            seo: /seo|référencement|google|search|ranking|meta|optimisation/i,
            affiliate: /affiliation|produit|conversion|tracking|commission|vente/i
        };

        let detectedType = 'general';
        for (const [type, pattern] of Object.entries(typePatterns)) {
            if (pattern.test(query)) {
                detectedType = type;
                console.log(`✅ Type détecté: ${type.toUpperCase()}`);
                break;
            }
        }

        // Détection de complexité
        const complexity = /complexe|avancé|sophistiqué|enterprise/i.test(query) ? 'complex' :
                          /simple|basique|rapide|minimal/i.test(query) ? 'simple' : 'medium';

        // Détection d'urgence
        const urgency = /urgent|rapide|vite|asap|immédiat/i.test(query) ? 'urgent' :
                       /futur|plus tard|éventuel|optionnel/i.test(query) ? 'low' : 'normal';

        // Extraction de mots-clés
        const keywords = query.split(/[\\s,.-]+/)
            .filter(word => word.length > 2)
            .slice(0, 8);

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

    async function generateRAGPrompt(analysis) {
        console.log(`🎨 Génération du prompt avec RAG réel pour: ${analysis.type}`);

        const timestamp = new Date().toLocaleString('fr-FR');
        
        // Charger l'index RAG
        const embeddings = await loadRAGIndex();
        
        // Rechercher le contenu pertinent
        const ragResults = searchRAGContent(analysis.originalQuery, embeddings, 15);
        
        console.log(`🔍 RAG trouvé ${ragResults.length} résultats pertinents`);

        let prompt = `# 🤖 RAG RÉEL GLP1 France v4.0.0 - DONNÉES INDEXÉES
**Timestamp**: ${timestamp}
**Requête**: "${analysis.originalQuery}"

## 🔬 ANALYSE AUTOMATIQUE
- **Type détecté**: ${analysis.type.toUpperCase()} ✅
- **Complexité**: ${analysis.complexity.toUpperCase()} 📊  
- **Urgence**: ${analysis.urgency.toUpperCase()} ⏱️
- **Mots-clés**: ${analysis.keywords.join(', ')} 🔑

## 📚 CONTENU RAG PERTINENT (${ragResults.length} sources)
`;

        if (ragResults.length > 0) {
            ragResults.forEach((result, index) => {
                const relevanceBar = '█'.repeat(Math.round(result.relevance * 10));
                prompt += `
### 📄 Source ${index + 1}: ${result.title || 'Document'}
**URL**: ${result.url || 'N/A'}
**Pertinence**: ${relevanceBar} (${Math.round(result.relevance * 100)}%)
**Contenu**: ${(result.content || '').substring(0, 300)}...

`;
            });
        } else {
            prompt += `
❌ **Aucun contenu pertinent trouvé dans l'index RAG**
🔄 **Suggestion**: Relancez l'indexation avec \`python indexer.py\`
`;
        }

        // Contexte technique selon le type détecté
        const technicalContext = {
            dashboard: `
## 🖥️ CONTEXTE DASHBOARD TECHNIQUE
**Structure**: Astro.js + TypeScript
**Localisation**: \`src/pages/admin-*.astro\`
**APIs**: \`src/pages/api/\` (TypeScript preferred)
**Data**: \`data/users-unified.json\`, \`data/articles-database.json\`
**Style**: Design médical bleu/violet`,

            api: `
## 🔌 CONTEXTE API BACKEND
**Format**: TypeScript (.ts) > PHP (.php)
**Localisation**: \`src/pages/api/\`
**Sécurité**: Validation + Logs + Backup obligatoires
**Data**: JSON files in \`data/\` directory`,

            medical: `
## 🏥 CONTEXTE MÉDICAL GLP-1
**Compliance**: ANSM, RGPD, directives UE
**Vocabulaire**: GLP-1, HbA1c, IMC, effet incrétine
**Traitements**: Ozempic, Wegovy, Saxenda, Trulicity, Mounjaro`,

            seo: `
## 🔍 CONTEXTE SEO MÉDICAL
**Mots-clés**: GLP-1, diabète, perte poids, obésité
**Structure**: H1 unique, meta optimisées, schema.org
**E-A-T**: Expertise médicale requise`,

            general: `
## 🔧 CONTEXTE GÉNÉRAL
**Framework**: Astro.js (SSG) + TypeScript
**Hébergement**: Hostinger (production)
**Performance**: Core Web Vitals optimisés`
        };

        prompt += technicalContext[analysis.type] || technicalContext.general;

        prompt += `

## 🎯 INSTRUCTION BASÉE SUR LE RAG
**Utilisez OBLIGATOIREMENT le contenu RAG ci-dessus comme référence**
**Générez une solution ${analysis.complexity} pour**: ${analysis.keywords.join(', ')}
**Niveau d'urgence**: ${analysis.urgency}
**Intégration**: Cohérent avec l'écosystème GLP1 existant

### 📋 CHECKLIST
- ✅ Référencer le contenu RAG pertinent
- ✅ Respecter la structure technique existante  
- ✅ Suivre les patterns du projet
- ✅ Maintenir la cohérence avec le contenu indexé

---
🤖 *RAG RÉEL v4.0.0 - Basé sur ${ragResults.length} sources indexées*
🕐 *${timestamp}*`;

        console.log(`✅ Prompt RAG généré avec ${ragResults.length} sources (${prompt.length} caractères)`);
        return prompt;
    }

    // ========================================
    // COMMANDES VS CODE
    // ========================================

    // Test de connexion RAG
    const testRAGCommand = vscode.commands.registerCommand('raglp.testRAG', async () => {
        const embeddings = await loadRAGIndex();
        const count = embeddings.length;
        vscode.window.showInformationMessage(`🚀 RAG RÉEL v4.0.0 - ${count} documents indexés ! ✅`);
    });

    // Commande principale avec RAG réel
    const ragPromptCommand = vscode.commands.registerCommand('raglp.generateRAGPrompt', async () => {
        const description = await vscode.window.showInputBox({
            prompt: '🎯 Décrivez votre besoin (le RAG va chercher dans votre contenu indexé)',
            placeholder: 'Ex: dashboard admin, api ozempic, page seo diabète...',
            ignoreFocusOut: true
        });

        if (description && description.trim()) {
            console.log(`🚀 Génération RAG pour: "${description}"`);
            
            // Analyse de la requête
            const analysis = analyzeUserRequest(description);
            
            // Génération avec RAG réel
            const ragPrompt = await generateRAGPrompt(analysis);
            
            // Affichage du résultat
            const doc = await vscode.workspace.openTextDocument({
                content: ragPrompt,
                language: 'markdown'
            });
            
            await vscode.window.showTextDocument(doc);
            
            vscode.window.showInformationMessage(`✅ Prompt RAG généré avec ${analysis.type} contexte !`);
        }
    });

    // Commande de recherche directe dans le RAG
    const searchRAGCommand = vscode.commands.registerCommand('raglp.searchRAG', async () => {
        const query = await vscode.window.showInputBox({
            prompt: '🔍 Recherchez dans votre contenu indexé',
            placeholder: 'Ex: ozempic, dashboard, api...',
            ignoreFocusOut: true
        });

        if (query && query.trim()) {
            const embeddings = await loadRAGIndex();
            const results = searchRAGContent(query, embeddings, 10);
            
            let searchResults = `# 🔍 Résultats RAG pour: "${query}"

**Trouvé**: ${results.length} résultats pertinents

`;

            results.forEach((result, index) => {
                const relevanceBar = '█'.repeat(Math.round(result.relevance * 10));
                searchResults += `
## ${index + 1}. ${result.title || 'Document'}
**URL**: ${result.url || 'N/A'}
**Pertinence**: ${relevanceBar} (${Math.round(result.relevance * 100)}%)
**Extrait**: ${(result.content || '').substring(0, 200)}...

---
`;
            });

            const doc = await vscode.workspace.openTextDocument({
                content: searchResults,
                language: 'markdown'
            });
            
            await vscode.window.showTextDocument(doc);
        }
    });

    // Enregistrer les commandes
    context.subscriptions.push(testRAGCommand);
    context.subscriptions.push(ragPromptCommand);
    context.subscriptions.push(searchRAGCommand);
}

function deactivate() {
    console.log('🔴 Extension RAGLP v4.0.0 désactivée');
}

module.exports = {
    activate,
    deactivate
};
