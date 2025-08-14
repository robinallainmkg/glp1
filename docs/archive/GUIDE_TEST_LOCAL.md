# 🚀 TEST LOCAL - GLP-1 France

## 1. Démarrer le serveur de développement

```bash
npm run dev
```

Le serveur sera accessible sur : http://localhost:4321

## 2. Pages à tester pour l'affiliation

### Page de test d'affiliation
- **URL** : http://localhost:4321/test-affiliation
- **But** : Vérifier l'affichage du produit Talika dans différents placements
- **À vérifier** :
  - ✅ Le produit Talika s'affiche correctement
  - ✅ Les boutons d'affiliation fonctionnent
  - ✅ Le tracking des clics fonctionne (console)
  - ✅ Pas d'erreur dans la console du navigateur

### Page de test du placement intelligent
- **URL** : http://localhost:4321/test-placement-intelligent
- **But** : Vérifier le placement contextuel dans les articles
- **À vérifier** :
  - ✅ Le produit apparaît après 2 paragraphes si pertinent
  - ✅ Le produit n'apparaît pas si non pertinent
  - ✅ Le fallback en fin d'article fonctionne

### Page de test du design
- **URL** : http://localhost:4321/test-affiliation-design
- **But** : Vérifier les corrections du design et du header
- **À vérifier** :
  - ✅ Header avec couleurs sobres
  - ✅ Bouton d'affiliation bien visible
  - ✅ Pas de problème de CSS

### Articles existants
- **URL** : http://localhost:4321/articles/
- **But** : Vérifier le placement dans de vrais articles
- **À vérifier** :
  - ✅ Talika apparaît dans les articles pertinents
  - ✅ Placement après 2 paragraphes
  - ✅ Design cohérent

## 3. Console de debug

Ouvre la console développeur (F12) pour voir :
- 🔗 Logs de tracking des clics affiliés
- 📊 Informations de debug du placement
- ❌ Absence d'erreurs JavaScript

## 4. Test du build

```bash
npm run build
```

Doit se terminer sans erreur.

## 5. Test en production locale

```bash
npm run preview
```

Teste la version buildée sur : http://localhost:4321

## ✅ Checklist de validation

- [ ] Serveur de dev démarre sans erreur
- [ ] Page test-affiliation charge correctement
- [ ] Produit Talika s'affiche
- [ ] Boutons cliquables
- [ ] Tracking fonctionnel (console)
- [ ] Placement intelligent fonctionne
- [ ] Design corrigé
- [ ] Build réussit
- [ ] Preview fonctionne
- [ ] Aucune erreur console

## 🐛 En cas de problème

1. Vérifier les imports dans `test-affiliation.astro`
2. Vérifier que `affiliate-manager.ts` exporte les bonnes fonctions
3. Vérifier la console pour les erreurs JS
4. Redémarrer le serveur de dev si nécessaire
