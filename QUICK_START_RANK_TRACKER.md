# 🚀 DÉMARRAGE RAPIDE - Rank Tracker Gratuit

## ⚡ **Setup en 15 minutes**

### **ÉTAPE 1 : Téléchargement (2 min)**
```
🔗 Lien : https://www.link-assistant.com/rank-tracker/download.html
📥 Télécharger : Version Windows gratuite
💾 Installer : Installation standard
```

### **ÉTAPE 2 : Configuration Projet (3 min)**
```
1. 🏗️ Nouveau projet : "GLP1-France"
2. 🌐 Domaine : glp1-france.fr
3. 🔍 Moteur : Google.fr (France)
4. 📍 Localisation : France
```

### **ÉTAPE 3 : Import Mots-clés (5 min)**
```
1. 📋 Keywords > Add Keywords
2. 📂 Import from CSV file
3. 📄 Sélectionner : keywords-import-rank-tracker.csv
4. ✅ Valider l'import des 20 mots-clés
```

### **ÉTAPE 4 : Premier Scan (3 min)**
```
1. 🔍 Cliquer "Check Rankings"
2. ⏰ Attendre scan complet (2-3 min)
3. 📊 Voir les positions actuelles
```

### **ÉTAPE 5 : Export Initial (2 min)**
```
1. 📋 Sélectionner tous (Ctrl+A)
2. 🖱️ Clic droit > Export > CSV
3. 💾 Sauvegarder dans : C:\SEO\exports\
4. 📛 Nom : rankings-YYYY-MM-DD.csv
```

---

## 🎯 **Utilisation Hebdomadaire**

### **Routine Recommandée :**
```powershell
# Exécuter le script automatisé
.\scripts\export-rankings.ps1
```

### **Ou Process Manuel :**
1. **Ouvrir Rank Tracker** (2 min)
2. **Check Rankings** pour actualiser (3 min)
3. **Export CSV** des données (1 min)
4. **Exécuter le script** d'analyse (1 min)
5. **Consulter le dashboard** généré (5 min)

---

## 📊 **Interprétation des Résultats**

### **Codes de Position :**
- **Position 1-3** : 🥇 Excellent (Top 3)
- **Position 4-10** : 🥈 Très bien (Top 10)
- **Position 11-50** : 🥉 Correct (Page 1-5)
- **Position 50+** : ⚠️ À améliorer
- **Non trouvé** : ❌ Non classé

### **Priorités d'Action :**
```
🎯 URGENT (Positions 50+) :
- Optimiser le contenu existant
- Améliorer SEO on-page
- Créer contenu spécialisé

📈 OPPORTUNITÉ (Positions 11-30) :
- Enrichir le contenu
- Ajouter mots-clés secondaires
- Améliorer linking interne

🔥 MAINTENIR (Positions 1-10) :
- Surveiller la concurrence
- Actualiser régulièrement
- Renforcer la position
```

---

## 🔧 **Troubleshooting**

### **Problème : Rankings non trouvés**
```
✅ Solutions :
- Vérifier l'orthographe des mots-clés
- Attendre 24h entre les scans
- Utiliser proxies si bloqué
- Vérifier la géolocalisation
```

### **Problème : Export CSV vide**
```
✅ Solutions :
- Faire un scan complet avant export
- Vérifier les permissions fichier
- Utiliser un autre format (TXT)
- Redémarrer Rank Tracker
```

### **Problème : Script PowerShell bloqué**
```
✅ Solutions :
- Exécuter : Set-ExecutionPolicy RemoteSigned
- Clic droit > "Exécuter avec PowerShell"
- Vérifier les chemins de fichiers
```

---

## 🎯 **Évolution vers Payant**

### **Limitations Version Gratuite :**
- ❌ **20 mots-clés max**
- ❌ **Pas de rapports automatiques**
- ❌ **Export limité**
- ❌ **Pas d'API**

### **Alternatives Payantes :**
```
💰 SERPWatcher (29€/mois) :
- 200 mots-clés
- Rapports automatiques
- Interface moderne
- Support client

💰 SEMrush (99€/mois) :
- 500 mots-clés
- Analyse concurrentielle
- Outils marketing complets
- API disponible
```

### **Quand Upgrader :**
- Plus de 20 mots-clés à suivre
- Besoin d'automatisation complète
- Analyse concurrentielle avancée
- Budget marketing disponible

---

## 📝 **Checklist Hebdomadaire**

```
□ Lundi : Scan des positions actuelles
□ Mardi : Export et analyse des données
□ Mercredi : Identification des opportunités
□ Jeudi : Optimisation des pages prioritaires
□ Vendredi : Vérification concurrence
□ Samedi : Planification contenu semaine suivante
□ Dimanche : Repos (ou veille SEO 😉)
```

---

## 🎉 **Quick Start Commands**

### **Installation complète :**
```powershell
# Créer la structure de dossiers
New-Item -ItemType Directory -Path "C:\SEO\exports" -Force
New-Item -ItemType Directory -Path "C:\SEO\logs" -Force

# Copier le fichier d'import
Copy-Item "keywords-import-rank-tracker.csv" "C:\SEO\"

# Rendre le script exécutable
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Premier export
.\scripts\export-rankings.ps1
```

**🚀 Vous êtes prêt à monitorer vos rankings Google gratuitement !**
