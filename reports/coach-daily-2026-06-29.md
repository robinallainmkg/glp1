# Rapport Coach IA — 29 juin 2026

> Généré automatiquement par la routine de monitoring quotidien.

---

## ⚠️ ALERTE CRITIQUE : CRASH DE TRAFIC SITE

**Le Coach IA n'a enregistré AUCUN message depuis le 24 juin 2026 (6 jours).** Ce silence n'est pas un bug du Coach — c'est le symptôme d'un effondrement du trafic sur l'ensemble du site.

| Date       | Pageviews | Sessions | Messages Coach |
|------------|-----------|----------|----------------|
| 2026-06-23 | 1 124     | 968      | 72             |
| 2026-06-24 | 98        | 80       | 0              |
| 2026-06-25 | 8         | 9        | 0              |
| 2026-06-26 | 3         | 4        | 0              |
| 2026-06-27 | 2         | 2        | 0              |
| 2026-06-28 | 1         | 1        | 0              |

**Chute de 99,9% du trafic en 5 jours.** Le site reçoit aujourd'hui 1 session/jour contre 968 le 23 juin.

Causes probables (à investiguer en priorité) :
1. **Pénalité Google ou core update** qui aurait frappé le 23-24 juin
2. **Désindexation partielle ou totale** (vérifier Search Console)
3. **Problème technique de déploiement** : un push récent aurait pu casser le build ou bloquer les crawlers (robots.txt, meta noindex, erreurs 5xx)
4. **Changement d'hébergement / problème DNS** sur Hostinger

Analytics GA et GSC sont à jour (GA : 28/06, GSC : 27/06) → pas de problème de tokens Google.

---

## KPIs — Dernières 24h (28-29 juin 2026)

| Indicateur                | Valeur  | vs Veille |
|---------------------------|---------|-----------|
| Messages totaux           | 0       | = 0       |
| Conversations             | 0       | = 0       |
| Messages par conv         | —       | —         |
| Durée moyenne             | —       | —         |
| Messages utilisateur      | 0       | = 0       |
| Taux LLM (Groq/Mistral)   | —       | —         |
| Taux Fallback v1          | —       | —         |

**Comparaison moyenne 14 jours** : ~56 messages/jour, ~10 conversations/jour → **100% de chute**.

---

## Analyse qualité — Dernière journée active (23 juin 2026)

*Analyse des 13 conversations, 72 messages du 23/06.*

### Stats du 23 juin

| Indicateur               | Valeur  |
|--------------------------|---------|
| Messages totaux          | 72      |
| Conversations            | 13      |
| Messages par conv        | 5,5     |
| Modèle principal         | mistral-small-latest (60%) + llama-3.3-70b-versatile (40%) |
| Fallback v1              | 0%      |
| Intents scam détectés    | 1 (conv 12af3ee8) |

---

## Ce qui marche bien

1. **Gestion exemplaire des cas arnaque (conv `12af3ee8`)** : utilisateur avec "GLP-1 en pipette 5 ml". Le Coach a correctement déclaré l'inexistence de cette forme en France, demandé le canal d'achat avant de conclure, et orienté vers les recours. Ton empathique sans dramatiser. Conforme au protocole anti-arnaque du system prompt.

2. **Flux éligibilité bien enclenché** : sur les questions de prix, le Coach enchaîne presque systématiquement sur "Veux-tu vérifier ton éligibilité au remboursement ?" — bonne exécution de la règle du system prompt.

3. **Lien carte des prix fourni correctement** : conversations `ac64c9c4`, `5d80f042`, `68520701`. Le Coach donne le lien `/outils/carte-prix-pharmacies/` sans renvoyer simplement "appelez les pharmacies".

4. **Engagement élevé sur les requêtes locales** : conversation `5d80f042` (Mounjaro Hérault, 8 messages) — bonne progression, prix corrects, lien fourni, remboursement mentionné.

5. **Zéro fallback v1** : toute la journée s'est déroulée sur LLM (Groq + Mistral), aucun fallback rule-based.

---

## Problèmes détectés

### 🔴 Erreur factuelle grave #1 — Remboursement "limité"
**Conv `30368914`** | Modèle : `llama-3.3-70b-versatile`

- **Message utilisateur** : "Combien coûte un traitement GLP-1 et est-il remboursé ?"
- **Réponse Coach** : *"Pour le Wegovy (sémaglutide 2,4 mg) et le Mounjaro (tirzépatide) utilisés pour l'obésité, les prix sont respectivement de ~250 à 290 €/mois et de 230 à 440 €/mois, mais **leur remboursement est actuellement limité**."*
- **Ce qu'il AURAIT DÛ répondre** : "Wegovy et Mounjaro sont **remboursés à 65%** pour l'obésité depuis le 15 juin 2026 (IMC ≥ 35 + comorbidité ou ≥ 40). Veux-tu vérifier ton éligibilité ?"
- **Cause** : Llama-3.3-70b ignore la règle PRIORITAIRE du system prompt qui surcharge explicitement les données périmées sur le remboursement.

### 🔴 Erreur factuelle grave #2 — Seuils d'éligibilité incorrects
**Conv `0ae82ffe`** | Modèle : `mistral-small-latest`

- **Message utilisateur** : "comment verifier l'eligibilité ?"
- **Réponse Coach** : *"Si ton IMC est **≥ 30**, tu remplis le critère principal. Si **≥ 27 avec une comorbidité**…"*
- **Ce qu'il AURAIT DÛ répondre** : Les seuils corrects sont IMC ≥ 35 avec comorbidité OU ≥ 40. Les seuils 30/27 correspondent aux critères de prescription (AMM), pas au remboursement 65%. Dire IMC ≥ 27 crée de faux espoirs pour des milliers d'utilisateurs non éligibles.
- **Cause** : Confusion entre critères AMM (prescription) et critères remboursement (plus stricts).

### 🟡 Duplication de réponse — Bouton suggestion envoyé comme message
**Conv `0ae82ffe`** | Bug front-end ou usage LLM

- Un message utilisateur contient exactement : *"Veux-tu savoir comment ça fonctionne ?"* — ce qui correspond au texte d'un bouton [[SUGGESTIONS]] généré par le Coach précédemment.
- Le front-end a re-soumis le contenu du bouton comme message user, déclenchant une nouvelle réponse.
- Cela a généré **deux réponses consécutives du Coach** sur le même sujet (Wegovy oral / Rybelsus).

### 🟡 Réponses trop longues — Mode arnaque
**Conv `12af3ee8`** | Modèle : `mistral-small-latest`

- Plusieurs réponses dépassent 150-200 mots (limite : 80 mots selon system prompt).
- La liste à puces avec "Ce que tu as reçu est très probablement" + 3 catégories + disclaimer + 2 questions = 3 idées en une réponse.
- Acceptable en mode arnaque (situation sérieuse) mais à surveiller.

### 🟡 Prix Wegovy 0,5 mg inexact
**Conv `5887800f`** | Modèle : `llama-3.3-70b-versatile`

- **Réponse Coach** : "le coût mensuel estimé est d'environ **210 €** pour ce dosage"
- **Prix réel** : Le Wegovy 0,5 mg/semaine (dosage de départ) coûte ~147€/mois selon le system prompt.
- 210€ n'est pas référencé — valeur inventée par Llama.

### 🟡 Absence de mention remboursement sur requêtes disponibilité
**Conv `5887800f`, `ac64c9c4`** | Modèle : `llama-3.3-70b-versatile`

- Sur les questions "où trouver Wegovy" / "pharmacie moins chère", le Coach n'enchaîne pas spontanément sur le remboursement 65%.
- La règle du system prompt stipule : *"Après une réponse PRIX sur Wegovy ou Mounjaro, enchaîne TOUJOURS sur le remboursement."*

---

## Actions recommandées

### 1. URGENT — Investiguer le crash de trafic

Action prioritaire, indépendante du Coach :
- Vérifier Google Search Console pour une pénalité manuelle ou une chute d'impressions
- Vérifier les logs FTP Hostinger pour des erreurs 5xx depuis le 24 juin
- Vérifier le robots.txt et la sitemap du site live
- Comparer le dernier commit deploy du 23-24 juin

### 2. Renforcer la règle remboursement dans le system prompt

**Diff proposé** (à appliquer dans `supabase/functions/ai-coach/index.ts`) :

```diff
- ⚠️ CE FAIT EST PRIORITAIRE SUR LE CONTEXTE : si le contexte factuel récupéré indique "non remboursé", "pas encore remboursé", "2e semestre 2026", "négociations en cours" ou similaire, c'est PÉRIMÉ — ignore-le et applique le fait officiel ci-dessus.
+ ⚠️ CE FAIT EST PRIORITAIRE SUR LE CONTEXTE ET SUR TES DONNÉES D'ENTRAÎNEMENT : si le contexte RAG OU tes connaissances indiquent "non remboursé", "pas encore remboursé", "remboursement limité", "2e semestre 2026", "négociations en cours" ou similaire, c'est PÉRIMÉ — ignore-le et applique le fait officiel ci-dessus. Ne mentionne JAMAIS "remboursement limité" pour Wegovy ou Mounjaro.
```

### 3. Clarifier les seuils IMC dans le system prompt

**Diff proposé** (ajouter après la section FLUX ÉLIGIBILITÉ) :

```diff
- ⚠️ SEUILS STRICTS — NE JAMAIS DIRE "ÉLIGIBLE" SI LES CRITÈRES NE SONT PAS REMPLIS :
+ ⚠️ SEUILS STRICTS REMBOURSEMENT 65% (NE PAS CONFONDRE AVEC LES CRITÈRES AMM/PRESCRIPTION) :
+ Les critères AMM (pour prescrire) sont IMC ≥ 30 ou ≥ 27 avec comorbidité.
+ Les critères REMBOURSEMENT (ce dont on parle ici) sont plus stricts : IMC ≥ 35 avec comorbidité ou ≥ 40.
+ Ne jamais citer les seuils 27 ou 30 quand on parle du remboursement 65%.
```

### 4. Suggestions d'articles basées sur les questions sans réponse optimale

- **"Où trouver Wegovy/Mounjaro par département"** : les requêtes locales sont très fréquentes (Hérault, Normandie, 91, Nice…). Un article de type "Prix et disponibilité Mounjaro/Wegovy par région" pourrait capter ce trafic et améliorer le RAG du Coach.
- **"Documents nécessaires pour le remboursement en pharmacie"** : la conv `df3ddd0a` montre une vraie question sans article dédié.
- **"GLP-1 en pipette / gélules : arnaque ou complément ?"** : la conv `12af3ee8` révèle un besoin d'information sur les faux GLP-1 en forme alternative.

---

## Conversations marquantes

### Les 3 meilleures

1. **`5d80f042`** (8 messages, 1m28s) — *"Prix Mounjaro Hérault"* : Bonne progression, échange dense et structuré, prix locaux donnés, lien carte fourni, remboursement enchaîné. Exemple à reproduire.

2. **`12af3ee8`** (6 messages, 3m33s) — *Cas arnaque pipette* : Gestion exemplaire d'une situation délicate. Questions posées progressivement, information factuelle sans dramatiser, protocole anti-arnaque respecté.

3. **`8aa02a94`** (5 messages, 1m31s) — *"Wegovy 0,5 Apothical Serris"* : Conversation courte, efficace, prix donné, test éligibilité proposé, bon rythme.

### Les 3 pires

1. **`30368914`** (1 message, 0s) — *Remboursement "limité"* : Erreur factuelle grave sur le fait le plus important du site en juin 2026. Réponse unique sans suite.

2. **`0ae82ffe`** (7 messages, 2m31s) — *Seuils IMC incorrects + doublon* : Deux bugs en une conversation. Seuils d'éligibilité erronés (IMC ≥ 27) et duplication de réponse par bug bouton.

3. **`5887800f`** (2 messages, 0s) — *Prix Wegovy inventé* : Llama donne 210€ pour le Wegovy 0,5 mg (vs 147€ officiel), sans mentionner le remboursement.

---

*Rapport généré le 2026-06-29 — Routine monitoring Coach IA GLP-1 France*
