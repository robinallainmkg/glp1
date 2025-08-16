# 📚 Extension GLP1 RAG Assistant - Guide d'Utilisation

## 🎯 Vue d'ensemble

Cette extension VS Code utilise directement votre système RAG existant (`C:\Users\robin\Documents\glp1official\glp1\rag-system`) pour vous assister dans le développement. Elle lit l'index de votre contenu GLP1-France et génère des prompts contextualisés.

## 🚀 Installation

### 1. Empaqueter l'extension

```powershell
cd "C:\Users\robin\Documents\glp1official\glp1\vscode-extension"
vsce package --out glp1-rag-assistant-1.0.0.vsix
```

### 2. Installer dans VS Code

```powershell
code --install-extension glp1-rag-assistant-1.0.0.vsix --force
```

### 3. Vérifier l'installation

Après installation, vous devriez voir le message : **"✅ GLP1 RAG Assistant prêt !"**

## 🛠️ Commandes Disponibles

### 1. 🔍 **Rechercher dans le RAG**
- **Commande** : `GLP1: Rechercher dans le RAG`
- **Raccourci** : `Ctrl+Shift+G`
- **Usage** : Recherchez dans tout votre contenu indexé GLP1-France

**Exemple** :
- Tapez "Ozempic effets secondaires"
- L'extension trouve tous les contenus pertinents
- Affiche un rapport avec pertinence et extraits

### 2. 🎯 **Générer Prompt avec RAG**
- **Commande** : `GLP1: Générer Prompt avec RAG`
- **Usage** : Crée un prompt de développement avec contexte RAG

**Exemple** :
- Décrivez : "page article sur Wegovy"
- L'extension analyse le type (médical)
- Recherche le contenu pertinent dans votre RAG
- Génère un prompt avec contexte spécialisé

### 3. 📚 **Explorer l'Index RAG**
- **Commande** : `GLP1: Explorer l'Index RAG`
- **Usage** : Visualise tout le contenu de votre index RAG

## 📋 Comment utiliser

### Scénario 1 : Recherche de contenu
```
1. Ctrl+Shift+P
2. Tapez "GLP1: Rechercher"
3. Entrez votre requête : "prix Ozempic France"
4. Consultez les résultats avec scores de pertinence
```

### Scénario 2 : Développement assisté
```
1. Ctrl+Shift+P
2. Tapez "GLP1: Générer Prompt"
3. Décrivez : "dashboard admin pour gérer les utilisateurs"
4. Obtenez un prompt avec contexte RAG pertinent
```

### Scénario 3 : Exploration du contenu
```
1. Ctrl+Shift+P
2. Tapez "GLP1: Explorer"
3. Naviguez dans tout votre contenu indexé
```

## 🎨 Types de requêtes détectés

L'extension analyse automatiquement vos demandes et adapte le contexte :

- **🏥 Médical** : ozempic, wegovy, diabète → Contexte médical spécialisé
- **⚙️ Admin** : dashboard, gestion → Contexte interface administration
- **🔌 API** : endpoint, backend → Contexte développement API
- **📝 SEO** : référencement, meta → Contexte optimisation SEO
- **📄 Contenu** : article, page → Contexte rédaction
- **💰 Affiliation** : produit, commission → Contexte commercial

## 🔧 Structure des résultats

### Format de recherche
```markdown
# 🔍 Résultats RAG GLP1-France

**Requête**: "votre recherche"
**Trouvé**: X résultats pertinents

## 1. Titre du contenu
**URL**: https://glp1-france.fr/...
**Pertinence**: ████████ (85%)
**Extrait**: Contenu pertinent...
```

### Format de prompt
```markdown
# 🤖 Prompt GLP1-France avec Contexte RAG

**Type détecté**: MEDICAL
**Demande**: "votre demande"

## 📚 CONTEXTE RAG PERTINENT
### 1. Document pertinent
**Source**: URL
**Pertinence**: 95%
**Contenu**: Extrait...

## 🎯 INSTRUCTIONS DE DÉVELOPPEMENT
- Guidelines spécialisées selon le type
- Cohérence avec l'écosystème existant
```

## 🔍 Résolution de problèmes

### Erreur "Index RAG introuvable"
```
Vérifiez que le fichier existe :
C:\Users\robin\Documents\glp1official\glp1\rag-system\embeddings\glp1_embeddings.json
```

### Aucun résultat trouvé
- Essayez des termes plus généraux
- Vérifiez l'orthographe
- Utilisez "Explorer l'Index RAG" pour voir le contenu disponible

### Extension non active
1. Redémarrez VS Code
2. Vérifiez dans Extensions que "GLP1 RAG Assistant" est activé
3. Consultez la console (F12) pour les logs d'erreur

## 🎯 Exemples d'usage pratiques

### Développement médical
```
Requête : "Créer page comparaison Ozempic vs Wegovy"
→ Type détecté : MEDICAL
→ Contexte : Terminologie GLP-1, compliance française
→ Références : Contenu existant sur les deux médicaments
```

### Dashboard administration
```
Requête : "interface gestion utilisateurs"
→ Type détecté : ADMIN
→ Contexte : Sécurité, CRUD, interface professionnelle
→ Références : Structures admin existantes
```

### API backend
```
Requête : "endpoint suppression produits"
→ Type détecté : API
→ Contexte : Validation, logging, sécurité
→ Références : APIs existantes du projet
```

## 📊 Avantages de cette approche

✅ **Contexte réel** : Utilise votre contenu indexé, pas des données génériques
✅ **Rapidité** : Accès instantané à votre base de connaissances
✅ **Pertinence** : Scoring automatique de la pertinence
✅ **Adaptation** : Contexte spécialisé selon le type de requête
✅ **Intégration** : Directement dans VS Code pendant le développement

---

🚀 **Votre système RAG maintenant accessible directement dans VS Code !**
