# Stratégie SEO GLP-1 France

## 🎯 Objectif
Optimiser le référencement naturel du site GLP-1 France pour générer du trafic qualifié, améliorer la visibilité sur les mots-clés stratégiques, et garantir la pertinence éditoriale de chaque article.

---

## 1. Mots-clés prioritaires
- GLP-1 France
- Wegovy remboursement
- Ozempic prix
- Perte de poids médicament
- Diabète type 2 traitement
- Mutuelle santé
- Remboursement médicament
- Obésité prise en charge
- Alternatives naturelles GLP-1
- Effets secondaires GLP-1

> Ces mots-clés sont à intégrer dans les titres, métadonnées, et contenus des articles prioritaires.

---

## 2. Stratégie éditoriale
- Créer des contenus originaux, utiles et approfondis sur chaque mot-clé prioritaire
- Optimiser les titres, metaTitle, metaDescription, et keywords
- Renforcer le maillage interne entre les articles stratégiques
- Enrichir les articles trop courts ou génériques
- Mettre à jour régulièrement les contenus selon l’évolution du marché et des requêtes

---

## 3. Audit SEO & Scoring

### Méthodologie d’audit
L’audit SEO s’effectue via le script `audit-seo-strategique.mjs` qui analyse chaque article selon :
- Couverture des mots-clés prioritaires
- Pertinence et originalité du contenu (détection de contenu générique/faible)
- Optimisation des métadonnées
- Maillage interne
- Qualité rédactionnelle (structure, lisibilité)
- Longueur du contenu

### Système de scoring
- **Score de pertinence (0-100)** pour chaque article
- **Score de couverture** pour chaque mot-clé (nombre d’articles optimisés)
- **Score moyen des collections**
- **Score général SEO** (moyenne pondérée de tous les critères)

### Interprétation
- Articles < 60 : à réécrire ou enrichir
- Articles 60-80 : à optimiser
- Articles > 80 : conformes à la stratégie

---

## 4. Lancer l’audit SEO

```bash
node scripts/audit-seo-strategique.mjs
```
Le rapport est généré dans `seo-strategique-report.json`.

---

## 5. Mise à jour
Ce fichier est la référence unique pour la stratégie SEO du site. Toute évolution doit être documentée ici.

---

> Pour toute question, contactez l’équipe SEO ou éditoriale.
