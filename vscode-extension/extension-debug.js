const vscode = require('vscode');

function activate(context) {
    // Message immédiat à l'activation
    console.log('🚀 Extension GLP1 ACTIVÉE !');
    
    // Notification visible
    vscode.window.showInformationMessage('🎉 Extension GLP1 RAG Assistant est ACTIVE !');
    
    // Commande de test ultra-simple
    let disposable = vscode.commands.registerCommand('extension.glp1test', function () {
        vscode.window.showInformationMessage('✅ Extension GLP1 fonctionne parfaitement !');
    });
    
    // Commande question simple
    let askDisposable = vscode.commands.registerCommand('extension.glp1ask', async function () {
        const question = await vscode.window.showInputBox({
            prompt: 'Posez votre question GLP1'
        });
        
        if (question) {
            let response = '';
            if (question.toLowerCase().includes('ozempic')) {
                response = 'Ozempic coûte 80-100€/mois en France';
            } else if (question.toLowerCase().includes('wegovy')) {
                response = 'Wegovy coûte 300€/mois en France';
            } else {
                response = 'Question reçue: ' + question;
            }
            
            vscode.window.showInformationMessage('🤖 ' + response);
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(askDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
