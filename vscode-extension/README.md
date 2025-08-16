# GLP1 RAG Assistant - Extension VS Code

🤖 **Assistant IA spécialisé GLP1 directement intégré dans Visual Studio Code**

## 🚀 Fonctionnalités

### 1. Questions RAG Intelligentes
- **Raccourci**: `Ctrl+Shift+G`
- Posez des questions sur GLP1, Ozempic, Wegovy
- Réponses basées sur une base de connaissances médicale
- Contexte français avec prix et remboursements

### 2. Génération de Code
- **Raccourci**: `Ctrl+Shift+C`
- Générez du code HTML/CSS/JS, PHP, React
- Spécialisé pour le domaine médical
- Templates optimisés pour les sites santé

### 3. Création de Contenu
- Articles de blog SEO
- Pages de vente
- FAQ médicales
- Guides pratiques
- Fiches produits

### 4. Optimisation SEO
- Analyse SEO en temps réel
- Recommandations spécifiques au domaine médical
- Optimisation E-A-T (Expertise, Authoritativeness, Trustworthiness)
- Suggestions de maillage interne

## 🛠️ Installation

1. **Prérequis**: Node.js installé
2. **Dépendances**:
   ```bash
   npm install axios
   ```

3. **Installation dans VS Code**:
   - Ouvrir la palette de commandes (`Ctrl+Shift+P`)
   - Tapez `Extensions: Install from VSIX`
   - Sélectionnez le fichier `.vsix` généré

## ⚙️ Configuration

### Clé API OpenAI
L'extension utilise l'API OpenAI intégrée. La clé est configurée dans le code pour une utilisation immédiate.

## 📋 Commandes Disponibles

| Commande | Raccourci | Description |
|----------|-----------|-------------|
| `GLP1: Poser une Question RAG` | `Ctrl+Shift+G` | Questions intelligentes |
| `GLP1: Générer du Code` | `Ctrl+Shift+C` | Génération de code |
| `GLP1: Créer du Contenu` | - | Rédaction automatisée |
| `GLP1: Optimiser SEO` | - | Analyse et optimisation |

## 🎯 Cas d'Usage

### Pour les Développeurs
- Créer des calculateurs médicaux
- Développer des landing pages
- Générer des API REST
- Créer des plugins WordPress

### Pour les Rédacteurs
- Rédiger des articles optimisés SEO
- Créer des comparatifs produits
- Générer des FAQ détaillées
- Optimiser le contenu existant

### Pour les SEO
- Analyser la densité des mots-clés
- Optimiser les métadonnées
- Suggérer des améliorations
- Vérifier la conformité E-A-T

## 🔬 Base de Connaissances Intégrée

L'extension contient une base de connaissances spécialisée sur :
- **GLP-1** : Mécanisme d'action, effets
- **Ozempic** : Prix France, remboursement, efficacité
- **Wegovy** : Coût, autorisation, comparaisons
- **Effets secondaires** : Précautions, contre-indications

## 🏥 Conformité Médicale

- Respect des standards E-A-T de Google
- Informations médicalement vérifiées
- Disclaimers appropriés
- Focus sur l'expérience utilisateur patient

## 📊 Exemple d'Utilisation

```javascript
// Question : "Quel est le prix d'Ozempic en France ?"
// Réponse automatique basée sur la base de connaissances

// Génération de code calculateur IMC
// avec recommandations GLP1 personnalisées

// Création d'article SEO optimisé
// "Ozempic vs Wegovy : Comparaison complète 2024"
```

## 🔧 Développement

### Structure du Projet
```
vscode-extension/
├── extension.js      # Code principal
├── package.json      # Configuration extension
├── icon.png          # Icône extension
└── README.md         # Documentation
```

### API Utilisées
- **OpenAI GPT-4o-mini** : Génération de réponses
- **OpenAI Embeddings** : Recherche sémantique
- **VS Code API** : Intégration IDE

## 🚀 Compilation et Déploiement

```bash
# Installer vsce
npm install -g vsce

# Empaqueter l'extension
vsce package

# Installer localement
code --install-extension glp1-rag-assistant-1.0.0.vsix
```

## 📝 Changelog

### Version 1.0.0
- ✅ Questions RAG intelligentes
- ✅ Génération de code spécialisé
- ✅ Création de contenu médical
- ✅ Optimisation SEO avancée
- ✅ Base de connaissances intégrée

## 🤝 Support

Pour toute question ou suggestion :
- Ouvrir un ticket dans VS Code
- Utiliser la commande `GLP1: Poser une Question RAG`

---

**🔬 Développé spécialement pour le domaine médical GLP1**
*Extension VS Code pour développeurs et rédacteurs spécialisés*
