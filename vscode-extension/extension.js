const vscode = require('vscode');
const axios = require('axios');

// Configuration
const OPENAI_API_KEY = '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';

// Base de connaissances GLP1 embarquée
const GLP1_KNOWLEDGE = [
    {
        title: "GLP1 Guide Complet",
        content: "GLP-1 (Glucagon-Like Peptide-1) est une hormone incrétine produite naturellement par l'intestin grêle. Elle régule la glycémie en stimulant la sécrétion d'insuline. Les agonistes GLP-1 comme Ozempic et Wegovy imitent cette hormone pour traiter le diabète de type 2 et l'obésité.",
        keywords: ["glp1", "hormone", "insuline", "ozempic", "wegovy", "diabète"]
    },
    {
        title: "Ozempic France",
        content: "Ozempic (sémaglutide) coûte environ 80-100€ par mois en France. Pour le diabète, il peut être remboursé à 65% par l'Assurance maladie. Pour la perte de poids, il n'est pas remboursé. Très efficace pour perdre 10-15% du poids corporel.",
        keywords: ["ozempic", "prix", "france", "remboursement", "perte de poids", "efficacité"]
    },
    {
        title: "Wegovy France",
        content: "Wegovy (sémaglutide haute dose) coûte environ 300€ par mois en France. Spécifiquement autorisé pour l'obésité. Pas encore remboursé par la Sécurité sociale. Plus efficace qu'Ozempic pour la perte de poids.",
        keywords: ["wegovy", "prix", "france", "obésité", "perte de poids", "sémaglutide"]
    },
    {
        title: "Effets Secondaires GLP1",
        content: "Effets secondaires courants: nausées (très fréquent), vomissements, diarrhée, constipation, douleurs abdominales. Ces effets diminuent avec le temps. Commencer avec faible dose. Contre-indiqué si antécédents de cancer médullaire thyroïde.",
        keywords: ["effets secondaires", "nausées", "précautions", "contre-indications", "sécurité"]
    }
];

/**
 * Recherche dans la base de connaissances GLP1
 */
function searchGLP1Knowledge(query) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    
    const results = GLP1_KNOWLEDGE.map(item => {
        let score = 0;
        
        // Recherche dans les mots-clés
        item.keywords.forEach(keyword => {
            if (queryLower.includes(keyword)) {
                score += 3;
            }
        });
        
        // Recherche dans le contenu
        queryWords.forEach(word => {
            if (item.content.toLowerCase().includes(word)) {
                score += 1;
            }
            if (item.title.toLowerCase().includes(word)) {
                score += 2;
            }
        });
        
        return {
            ...item,
            similarity: score / 10
        };
    });
    
    return results
        .filter(r => r.similarity > 0.1)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
}

/**
 * Appeler l'API OpenAI
 */
async function callOpenAI(prompt, maxTokens = 1000) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: 0.7
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        });
        
        return response.data.choices[0].message.content;
    } catch (error) {
        throw new Error(`Erreur OpenAI: ${error.response?.data?.error?.message || error.message}`);
    }
}

/**
 * Activation de l'extension
 */
function activate(context) {
    console.log('Extension GLP1 RAG Assistant activée');
    
    // Commande: Poser une question RAG
    let askCommand = vscode.commands.registerCommand('glp1-rag.ask', async () => {
        const query = await vscode.window.showInputBox({
            prompt: '🤖 Posez votre question sur GLP1, Ozempic, Wegovy...',
            placeHolder: 'Ex: Quel est le prix d\'Ozempic en France ?'
        });
        
        if (!query) return;
        
        try {
            // Recherche dans la base de connaissances
            const results = searchGLP1Knowledge(query);
            
            if (results.length === 0) {
                vscode.window.showWarningMessage('Aucune information trouvée pour cette question');
                return;
            }
            
            // Créer le contexte
            const context = results.map(r => r.content).join('\n\n');
            
            // Générer la réponse
            const prompt = `En tant qu'expert médical spécialisé en GLP1, répondez précisément à cette question en vous basant sur le contexte fourni:

Question: ${query}

Contexte:
${context}

Réponse (soyez précis et professionnel):`;

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "🤖 Génération de la réponse...",
                cancellable: false
            }, async () => {
                const answer = await callOpenAI(prompt);
                
                // Afficher la réponse dans un nouvel éditeur
                const doc = await vscode.workspace.openTextDocument({
                    content: `# 🤖 Réponse GLP1 RAG Assistant

## Question
${query}

## Réponse
${answer}

## Sources utilisées
${results.map((r, i) => `${i + 1}. ${r.title}`).join('\n')}

---
*Généré par GLP1 RAG Assistant - ${new Date().toLocaleString()}*`,
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(doc);
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Erreur: ${error.message}`);
        }
    });
    
    // Commande: Générer du code
    let generateCodeCommand = vscode.commands.registerCommand('glp1-rag.generateCode', async () => {
        const description = await vscode.window.showInputBox({
            prompt: '💻 Décrivez le code à générer',
            placeHolder: 'Ex: Un calculateur IMC avec recommandations GLP1'
        });
        
        if (!description) return;
        
        const codeType = await vscode.window.showQuickPick([
            'HTML/CSS/JavaScript',
            'PHP Backend',
            'WordPress Plugin',
            'React Component',
            'API REST'
        ], {
            placeHolder: 'Choisissez le type de code'
        });
        
        if (!codeType) return;
        
        try {
            const prompt = `En tant qu'expert développeur web spécialisé dans le domaine médical GLP1, créez le code complet pour:

Description: ${description}
Type: ${codeType}

Exigences:
- Code fonctionnel et prêt à utiliser
- Design moderne et responsive
- Commentaires explicatifs
- Adapté au domaine médical GLP1/Ozempic/Wegovy
- Optimisé pour l'expérience utilisateur

Fournissez le code source complet avec les instructions d'utilisation.`;

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "💻 Génération du code...",
                cancellable: false
            }, async () => {
                const code = await callOpenAI(prompt, 2000);
                
                // Déterminer l'extension du fichier
                let language = 'html';
                if (codeType.includes('PHP')) language = 'php';
                else if (codeType.includes('React')) language = 'javascript';
                else if (codeType.includes('API')) language = 'json';
                
                // Créer un nouveau fichier avec le code
                const doc = await vscode.workspace.openTextDocument({
                    content: `/*
 * 💻 Code généré par GLP1 RAG Assistant
 * Description: ${description}
 * Type: ${codeType}
 * Généré le: ${new Date().toLocaleString()}
 */

${code}`,
                    language: language
                });
                
                await vscode.window.showTextDocument(doc);
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Erreur: ${error.message}`);
        }
    });
    
    // Commande: Créer du contenu
    let createContentCommand = vscode.commands.registerCommand('glp1-rag.createContent', async () => {
        const topic = await vscode.window.showInputBox({
            prompt: '📝 Sujet du contenu à créer',
            placeHolder: 'Ex: Ozempic vs Wegovy comparaison détaillée'
        });
        
        if (!topic) return;
        
        const contentType = await vscode.window.showQuickPick([
            'Article de blog SEO',
            'Page de vente',
            'FAQ',
            'Guide pratique',
            'Fiche produit'
        ], {
            placeHolder: 'Type de contenu'
        });
        
        if (!contentType) return;
        
        const keywords = await vscode.window.showInputBox({
            prompt: '🔍 Mots-clés SEO (séparés par des virgules)',
            placeHolder: 'ozempic, wegovy, glp1, perte de poids'
        });
        
        try {
            const prompt = `En tant qu'expert rédacteur médical spécialisé en GLP1, créez un contenu complet et optimisé SEO:

Sujet: ${topic}
Type: ${contentType}
Mots-clés: ${keywords}

Créez:
1. Titre SEO optimisé
2. Méta-description (150-160 caractères)
3. Structure avec H2/H3
4. Contenu informatif et engageant (800-1200 mots)
5. Call-to-action pertinents
6. Conseils d'optimisation

Le contenu doit être médicalement précis, SEO-friendly et respecter les bonnes pratiques du domaine de la santé.`;

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "📝 Création du contenu...",
                cancellable: false
            }, async () => {
                const content = await callOpenAI(prompt, 2000);
                
                const doc = await vscode.workspace.openTextDocument({
                    content: `# 📝 Contenu GLP1 généré

## Métadonnées
- **Sujet**: ${topic}
- **Type**: ${contentType}
- **Mots-clés**: ${keywords}
- **Généré le**: ${new Date().toLocaleString()}

---

${content}

---
*Créé par GLP1 RAG Assistant*`,
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(doc);
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Erreur: ${error.message}`);
        }
    });
    
    // Commande: Optimiser SEO
    let optimizeSEOCommand = vscode.commands.registerCommand('glp1-rag.optimizeSEO', async () => {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showWarningMessage('Ouvrez un fichier pour l\'optimiser');
            return;
        }
        
        const content = editor.document.getText();
        const fileName = editor.document.fileName;
        
        if (!content) {
            vscode.window.showWarningMessage('Le fichier est vide');
            return;
        }
        
        const keyword = await vscode.window.showInputBox({
            prompt: '🎯 Mot-clé principal pour l\'optimisation SEO',
            placeHolder: 'Ex: ozempic france'
        });
        
        if (!keyword) return;
        
        try {
            const prompt = `En tant qu'expert SEO spécialisé dans le domaine médical, analysez et optimisez ce contenu:

Fichier: ${fileName}
Mot-clé principal: ${keyword}

Contenu à analyser:
${content.substring(0, 2000)}...

Fournissez:
1. 📊 Analyse SEO actuelle
2. 🎯 Recommandations d'optimisation
3. 💻 Code/balises à ajouter
4. 📝 Suggestions de contenu
5. 🔗 Opportunités de maillage interne
6. 📈 Prédiction d'impact

Concentrez-vous sur les spécificités du domaine médical (E-A-T, YMYL).`;

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "🎯 Analyse SEO en cours...",
                cancellable: false
            }, async () => {
                const analysis = await callOpenAI(prompt, 1500);
                
                const doc = await vscode.workspace.openTextDocument({
                    content: `# 🎯 Analyse SEO - ${fileName}

## Mot-clé ciblé
${keyword}

## Analyse et Recommandations
${analysis}

---
*Analyse générée par GLP1 RAG Assistant - ${new Date().toLocaleString()}*`,
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Erreur: ${error.message}`);
        }
    });
    
    // Enregistrer les commandes
    context.subscriptions.push(askCommand);
    context.subscriptions.push(generateCodeCommand);
    context.subscriptions.push(createContentCommand);
    context.subscriptions.push(optimizeSEOCommand);
    
    // Message de bienvenue
    vscode.window.showInformationMessage('🤖 GLP1 RAG Assistant activé ! Utilisez Ctrl+Shift+G pour poser une question.');
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
