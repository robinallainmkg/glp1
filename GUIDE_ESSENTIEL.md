# 🚀 GUIDE ESSENTIEL - GLP-1 France (Août 2025)

## ⚡ L'ESSENTIEL EN 2 MINUTES

### Projet actuel
- **119 articles** en 9 collections thématiques
- **Dashboard admin** : `/admin-dashboard` (mot de passe : `12031990Robin!`)
- **1 seul script** de déploiement : `.\deploy-auto.ps1`
- **Site live** : Netlify automatique après chaque push Git

### Architecture
```
📁 src/content/          # 119 articles Markdown
📁 src/pages/            # Pages Astro
📁 scripts/              # Outils d'automatisation
📄 admin-dashboard.astro # Interface de gestion
📄 deploy-auto.ps1      # Déploiement unique
```

---

## 📋 ACTIONS QUOTIDIENNES

### 1. Modifier du contenu
```bash
# Éditer les articles dans src/content/[collection]/
# Exemple : src/content/medicaments-glp1/ozempic.md
```

### 2. Déployer les changements
```powershell
.\deploy-auto.ps1
```
**C'est tout !** Le script fait : build → commit → push → déploiement Netlify automatique

### 3. Vérifier le dashboard
- Aller sur `/admin-dashboard`
- Voir les métriques SEO en temps réel
- Identifier les articles à optimiser

---

## 📊 MÉTRIQUES IMPORTANTES

### Collections (119 articles total)
| Collection | Articles | Priorité |
|------------|----------|----------|
| **medicaments-glp1** | 39 | ⭐ HAUTE |
| **glp1-perte-de-poids** | 16 | ⭐ HAUTE |
| **glp1-diabete** | 15 | 🟡 Moyenne |
| **regime-glp1** | 15 | 🟡 Moyenne |
| **alternatives-glp1** | 15 | 🟡 Moyenne |
| Autres | 19 | 🔵 Faible |

### Score SEO (Dashboard)
- **0-40** : 🔴 Critique (contenu vide/insuffisant)
- **40-70** : 🟡 À optimiser (structure/liens manquants)
- **70-100** : 🟢 Bon (SEO optimisé)

---

## 🎯 OBJECTIFS CLAIRS

### Court terme (30 jours)
1. **Score SEO moyen** : 45 → 70+
2. **Articles vides** : 51 → 10 maximum
3. **Liens internes** : 3 → 8+ par article

### Moyen terme (3 mois)
1. **Trafic** : +150% minimum
2. **Score global** : 70 → 85+
3. **Monétisation** : Préparation affiliation

---

## 🔧 OUTILS DISPONIBLES

### Scripts d'audit (créés récemment)
```bash
# Compter les articles
node scripts/audit-simple.mjs

# Audit SEO complet  
node scripts/audit-seo-bulk.mjs

# Corriger H1/H2
node scripts/fix-structure.mjs
```

### Dashboard admin
- **Collections** : Vue d'ensemble par thématique
- **Articles** : Liste complète avec scores
- **Mots-clés** : Analyse de densité
- **Roadmap** : Plan de monétisation

---

## ⚠️ RÈGLES IMPORTANTES

### À FAIRE
✅ Toujours utiliser `.\deploy-auto.ps1`  
✅ Vérifier le dashboard après changements  
✅ 1 seul H1 par article  
✅ 3-8 H2 pour structurer  
✅ 5-15 liens internes par article  

### À NE PAS FAIRE
❌ Utiliser d'autres scripts de déploiement  
❌ Modifier directement les fichiers de build  
❌ Ignorer les scores SEO du dashboard  
❌ Créer des articles sans structure H2  

---

## 🚀 PROCHAINES ÉTAPES

### Cette semaine
1. Audit SEO complet avec `audit-seo-bulk.mjs`
2. Identifier les 20 articles les plus critiques
3. Commencer l'optimisation des articles vides

### Semaine suivante
1. Extension contenu : 500 → 1000+ mots
2. Maillage interne systématique
3. Sections "Articles similaires"

---

**🎯 Objectif final** : Transformer les 119 articles en machine SEO générant 50k visiteurs/mois et préparant 5000€/mois de revenus d'affiliation.
