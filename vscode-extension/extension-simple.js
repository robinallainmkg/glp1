const vscode = require('vscode');

/**
 * Activation de l'extension
 */
function activate(context) {
    console.log('🚀 Extension GLP1 RAG Assistant ACTIVÉE !');
    
    // Test simple - juste afficher un message
    let testCommand = vscode.commands.registerCommand('glp1-rag.test', async () => {
        vscode.window.showInformationMessage('🎉 Extension GLP1 fonctionne !');
    });
    
    // Commande simple de question
    let askCommand = vscode.commands.registerCommand('glp1-rag.ask', async () => {
        const query = await vscode.window.showInputBox({
            prompt: '🤖 Posez votre question sur GLP1',
            placeHolder: 'Ex: Quel est le prix d\'Ozempic ?'
        });
        
        if (!query) return;
        
        // Réponse simple sans API pour tester
        let response = '';
        if (query.toLowerCase().includes('ozempic')) {
            response = '💊 Ozempic coûte environ 80-100€ par mois en France. Remboursé à 65% pour le diabète.';
        } else if (query.toLowerCase().includes('wegovy')) {
            response = '💊 Wegovy coûte environ 300€ par mois en France. Pas encore remboursé.';
        } else {
            response = '🤖 Question reçue : "' + query + '". Extension GLP1 RAG fonctionne !';
        }
        
        // Afficher la réponse
        const doc = await vscode.workspace.openTextDocument({
            content: `# 🤖 Réponse GLP1 RAG Assistant

## Question
${query}

## Réponse
${response}

---
*Généré par GLP1 RAG Assistant - ${new Date().toLocaleString()}*`,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
    });
    
    context.subscriptions.push(testCommand);
    context.subscriptions.push(askCommand);
    
    // Message de confirmation
    vscode.window.showInformationMessage('🚀 GLP1 RAG Assistant activé ! Tapez Ctrl+Shift+P puis "GLP1"');
}

function deactivate() {
    console.log('Extension GLP1 RAG Assistant désactivée');
}

module.exports = {
    activate,
    deactivate
};
