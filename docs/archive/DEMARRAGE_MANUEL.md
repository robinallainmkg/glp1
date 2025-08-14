# 🚀 DÉMARRAGE MANUEL DU SERVEUR

## Commandes à exécuter dans le terminal

```bash
# Se placer dans le dossier du projet
cd /Users/mac/Projet/glp11aout/glp1

# Lancer le serveur de développement
npm run dev
```

## 📱 Pages de test ouvertes automatiquement

1. **http://localhost:4321/test-nouveau-placement**
   - Teste le placement intelligent après 2 paragraphes
   - Nouveau design sans doublons

2. **http://localhost:4321/test-shopify-collabs**
   - Teste tous les variants côte à côte
   - Vérification du code promo GLP1

## 🔍 Autres pages importantes

- **http://localhost:4321/admin-dashboard** (mot de passe: 12031990Robin!)
- **http://localhost:4321/test-placement-intelligent**

## ✅ Points à vérifier

- [ ] Code promo GLP1 affiché UNE SEULE FOIS
- [ ] Bannière APRÈS 2 paragraphes (pas en bas)
- [ ] Prix 49,90€ côte à côte avec code promo
- [ ] Design simplifié sans doublons
- [ ] Lien vers talika.fr/GLP1 fonctionne

## 🛠️ En cas de problème

```bash
# Nettoyer et rebuilder
npm run clean
npm install
npm run dev
```

Le Simple Browser s'est ouvert automatiquement sur les pages de test ! 🎯
