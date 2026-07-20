# Rapport Coach IA GLP-1 — 15 juin 2026

## KPIs

| Métrique | Valeur |
|---|---|
| Messages totaux | 66 |
| Conversations | 11 |
| Messages utilisateur | 33 |
| Messages assistant | 33 |
| Messages par conversation | 6,0 |
| Durée moyenne par conv | ~1min 47s |
| LLM (llama-3.3-70b) | 20/33 = **60,6%** |
| LLM (mistral-small) | 13/33 = **39,4%** |
| Fallback v1 | 0/33 = **0%** |
| Aujourd'hui vs hier | 66 vs 30 → **+120% ↑↑** |

> L'absence totale de fallback v1 confirme que les clés API Groq + Mistral sont opérationnelles.

---

## Ce qui marche bien

- **Flux éligibilité remboursement** : la majorité des conversations suit correctement le protocole (demande poids/taille → IMC → comorbidités → verdict). Conv `bc19122a` et `4b2b918c` sont des exemples parfaits.
- **Géolocalisation médicale** : dans `bc19122a`, le Coach propose le CHU de Rouen pour Vernon (27) — pertinence géographique excellente.
- **Primo-prescription CSO/CHU** : la règle critique (seul le CSO/CHU ouvre le droit au remboursement obésité, pas le généraliste) est bien appliquée dans `2c649ff3`.
- **Ton conversationnel** : les conversations courtes (2–4 échanges) sont généralement bien guidées, directes et sans pavés inutiles.
- **Zéro fallback rule engine** : le LLM gère 100% des échanges — la chaîne multi-fournisseurs (Groq → Mistral) absorbe bien la charge.

---

## Problèmes détectés

### 🔴 Critique — Hallucinations

**Problème 1** — Conv `b1f6a692` (message 5)
- **User** : `"Oui"` (réponse à une question sur l'abonnement)
- **Coach** : *"Vous avez donc déjà un stylo Ozempic et vous vous demandez comment gérer la transition vers le nouveau stylo 3ml."*
- **Problème** : L'utilisateur n'a jamais mentionné de stylo Ozempic ni de "nouveau stylo 3ml". Hallucination sévère complètement hors contexte.
- **Attendu** : Reprendre le fil de la conversation (abonnement → suivi traitement → question de fond non identifiée).

**Problème 2** — Conv `3b66a421` (message 2)
- **User** : `"Oui, je donne ma ville"` (confirmation d'intention, pas la ville)
- **Coach** : *"Tu es à Paris."*
- **Problème** : L'utilisateur n'a pas donné sa ville. Le Coach l'invente ("Paris").
- **Attendu** : *"Quelle est ta ville ?"* ou attendre la réponse.

---

### 🔴 Critique — Erreur factuelle médicale

**Problème 3** — Conv `e5265f46` (messages 4 et 5)
- **User** : `"80 kg pour 1m58"`
- **Coach** : *"Ton IMC est 32,0 (obésité). Tu es éligible au remboursement à 65% pour Wegovy ou Mounjaro."*
- **Problème** : IMC 32 ne satisfait PAS les critères de remboursement CPAM (IMC ≥ 35 avec comorbidité ou ≥ 40). Le Coach confond les critères AMM (IMC ≥ 30 ou ≥ 27 avec comorbidité) avec les critères de remboursement. Erreur médicale grave pouvant induire le patient en erreur.
- **Attendu** : *"Ton IMC est 32,0. Pour le remboursement à 65%, il faut IMC ≥ 35 avec une comorbidité ou ≥ 40. As-tu une comorbidité (diabète, hypertension, apnée du sommeil) ?"*

**Problème 4** — Conv `fc42f2e0` (message 1) — Même erreur
- **User** : `"En faisant 88kg et 1m62 suis je en obesite"`
- **Coach** : *"Pour Mounjaro ou Wegovy, il te faut IMC ≥ 30 (ou ≥ 27 avec comorbidité)."*
- **Problème** : Critères AMM (accès au traitement) confondus avec critères remboursement CPAM. L'utilisateur posait une simple question sur l'obésité, pas les critères de remboursement.
- **Attendu** : Confirmer l'obésité (IMC 33,6 = oui), puis proposer de vérifier l'éligibilité au remboursement sans citer les mauvais critères.

---

### 🔴 Critique — Hallucination produit (NovoCare)

**Problème 5** — Conv `e5265f46` (message 3)
- **User** : `"Oui, aide-moi"` (après question sur aide financière Novo Nordisk)
- **Coach** : *"Le programme d'aide financière de Novo Nordisk pour Wegovy s'appelle NovoCare. Il peut couvrir jusqu'à 100% du coût pour les situations les plus précaires."*
- **Problème** : NovoCare est un programme américain. Il n'existe pas sous ce nom en France. Le Coach hallucine un programme avec des promesses ("jusqu'à 100%") non vérifiées.
- **Attendu** : Rediriger vers le remboursement CPAM à 65% (qui vient d'entrer en vigueur le 15 juin) et préciser qu'il n'existe pas de programme d'aide financière direct fabricant disponible en France actuellement.

---

### 🟠 Majeur — Confusion "Abonnement"

**Problème 6** — Conv `b1f6a692` (message 4)
- **User** : `"Abonnement"`
- **Coach** : *"Un abonnement pour suivre son traitement GLP-1 peut être très utile. Veux-tu savoir comment optimiser ton suivi avec un calendrier type pour les 12 premiers mois de traitement ?"*
- **Problème** : L'utilisateur voulait probablement renseignements sur l'abonnement Coach IA (tarifs, `/tarifs/`). Le Coach interprète comme "abonnement suivi traitement". Intent manqué, opportunité de conversion perdue.
- **Attendu** : Clarifier — *"Tu veux en savoir plus sur le Coach Premium ou sur le suivi de ton traitement ?"* ou directement mentionner les tarifs Coach si le contexte le suggère.

---

### 🟠 Majeur — Mounjaro "non remboursé" (information périmée)

**Problème 7** — Conv `2c649ff3` (message 4, modèle mistral-small)
- **Coach** : *"Pour Mounjaro, la négociation est en cours : pas encore de remboursement en mai 2026."*
- **Problème** : Nous sommes le **15 juin 2026** et Mounjaro **est** remboursé à 65% depuis aujourd'hui. Le system prompt le précise explicitement et indique d'ignorer le contexte RAG périmé. Le modèle Mistral a ignoré l'instruction prioritaire.
- **Attendu** : *"Mounjaro est remboursé à 65% pour l'obésité depuis le 15 juin 2026, dans les mêmes conditions que Wegovy."*

---

### 🟡 Mineur — Règle "nos contenus" violée

**Problème 8** — Conv `3b66a421`
- **Coach** : *"notre carte des prix en pharmacie"*
- **Problème** : Règle 11 du system prompt — ne jamais utiliser "nos" pour désigner les contenus du site.
- **Attendu** : *"la carte des prix en pharmacie"*

---

### 🟡 Mineur — Incohérence vouvoiement/tutoiement

**Problème 9** — Conv `b1f6a692` (message 2)
- **Coach** : *"Il semble que **vous** ayez des questions... Veux-tu me dire..."* (mix vous/tu dans le même message)
- **Attendu** : Choisir un registre et s'y tenir. L'utilisateur avait tutoié ("Veux-tu savoir") donc tutoiement attendu.

---

### 🟡 Mineur — Réponse dupliquée

**Problème 10** — Conv `a0027b9c` (message 2)
- **User** : `"I am in department 87"` (après une question sur le prix)
- **Coach** : Répète quasi-mot pour mot la même réponse sur le prix Wegovy (295–360€/mois), seule la mention "département 87" est ajoutée. Aucune progression.
- **Attendu** : Aller directement vers la proposition de trouver les pharmacies dans le 87 → carte des prix → demander ville précise (Limoges, etc.).

---

### 🟡 Mineur — Non-conformité requête locale (Périgueux)

**Problème 11** — Conv `6e3f67a2`
- **User** : `"Pharmacie Périgueux"`
- **Coach** : Parle de "l'annuaire des pharmacies de la ville" et de "pharmacies en ligne agréées ANSM" — sans mentionner la carte des prix du site.
- **Attendu** : Selon instructions — *"Voici la carte des prix en pharmacie → [lien]. Tu es à Périgueux (24) ?"* puis orienter.

---

## Actions recommandées

### 1. Corriger la confusion AMM vs Remboursement (PRIORITAIRE)

**Problème** : Le Coach confond critères AMM (IMC ≥30 ou ≥27+comorbidité) et critères remboursement CPAM (IMC ≥35+comorbidité ou ≥40). Erreur dans `e5265f46` et `fc42f2e0`.

**Diff system prompt** — après le paragraphe sur le flux éligibilité (ligne ~68) :

```diff
+ ⚠️ DISTINCTION CRITIQUE — AMM vs REMBOURSEMENT :
+ - Critères AMM (autorisation médicale d'utilisation) : IMC ≥ 30, OU IMC ≥ 27 avec comorbidité. C'est la condition pour qu'un médecin puisse prescrire Wegovy ou Mounjaro.
+ - Critères REMBOURSEMENT CPAM à 65% : IMC ≥ 35 avec comorbidité (diabète T2, HTA, apnée...) OU IMC ≥ 40. Ces critères sont PLUS stricts.
+ Ne jamais dire qu'un patient avec IMC < 35 est "éligible au remboursement" sans avoir confirmé une comorbidité. Si IMC entre 30 et 35 : un médecin PEUT prescrire (AMM), mais le remboursement à 65% ne s'applique PAS sans comorbidité. Être précis sur ce point.
```

---

### 2. Anti-hallucination ville / données utilisateur

**Diff system prompt** — dans la section REQUÊTES LOCALES :

```diff
+ ⚠️ Ne JAMAIS supposer la ville, le département ou les données personnelles d'un utilisateur. Si l'utilisateur confirme vouloir donner une info mais ne l'a pas encore fournie ("Oui je donne ma ville"), réponds : "Quelle est ta ville ?" — n'invente jamais une ville.
```

---

### 3. Intent "Abonnement Coach"

**Diff system prompt** — dans la section CONVERSION :

```diff
+ INTENT ABONNEMENT : Si quelqu'un écrit "abonnement", "tarif", "prix Coach", "combien ça coûte", "s'abonner", "souscrire", "premium" — il parle de l'abonnement Coach IA, pas de son traitement. Réponds : "Tu veux en savoir plus sur Coach Premium ? Les tarifs sont disponibles ici → [Tarifs](/tarifs/). L'abonnement te donne accès à des échanges illimités et un suivi personnalisé de ton traitement."
```

---

### 4. Supprimer la référence NovoCare

**Diff system prompt** — dans la section CONTEXTE IMPORTANT, ajouter :

```diff
+ - Il n'existe PAS de programme d'aide financière fabricant pour Wegovy ou Mounjaro en France (NovoCare est un programme AMÉRICAIN de Novo Nordisk, non applicable en France). Ne jamais mentionner NovoCare. En cas de question sur l'aide financière : orienter vers le remboursement CPAM à 65% (depuis le 15 juin 2026) et vers le reste à charge estimé avec la mutuelle.
```

---

### 5. Renforcer la règle sur le contexte RAG périmé pour Mounjaro

**Diff system prompt** — dans le paragraphe REMBOURSEMENT :

```diff
- ⚠️ CE FAIT EST PRIORITAIRE SUR LE CONTEXTE : si le contexte factuel récupéré indique "non remboursé"...
+ ⚠️ CE FAIT EST PRIORITAIRE SUR TOUT — y compris sur les données de mémoire du modèle (training data). La date du jour est TOUJOURS le 15 juin 2026 ou ultérieure dans ce système. Ne jamais citer "mai 2026", "pas encore remboursé", "en cours de négociation" pour Wegovy ou Mounjaro.
```

---

### Articles à créer (basés sur questions sans bonne réponse)

| Sujet | Intent détectée | Priorité |
|---|---|---|
| "Comment demander le remboursement Wegovy/Mounjaro quand on est déjà sous traitement" | `d2ec0cbd` — déjà sous traitement depuis août 2025 | Haute |
| "Aide financière pour les traitements GLP-1 en France" | `e5265f46` — question sur NovoCare | Haute |
| "Trouver un CSO par région / département" | `bc19122a`, `2c649ff3` — récurrent | Haute |
| "Wegovy 2.4mg : prix par pharmacie et région" | `a0027b9c` — question sur la variabilité des prix | Moyenne |

---

## Conversations marquantes

### 3 meilleures

**1. `bc19122a`** (Vernon, 10 msgs, 2min 57s)
Flux éligibilité → recherche CSO → géolocalisation CHU Rouen. Le Coach guide parfaitement, propose l'annuaire ameli, identifie Vernon (27) et propose le CHU Rouen à ~1h. Seul bémol : légère répétition sur l'annuaire entre messages 3 et 4.

**2. `4b2b918c`** (IMC 33,5 + apnée, 6 msgs, 2min 26s)
Calcul IMC correct, exploration comorbidités une par une, verdict final clair et conforme ("pas encore éligible, IMC 33,5 < 35"). Le Coach ne force pas un verdict positif malgré l'apnée.

**3. `2c649ff3`** (primo-prescription + MGEN, 8 msgs, 1min 38s)
Bonne explication de la règle CSO/CHU sur la primo-prescription. La réponse sur MGEN est structurée. Reste la confusion "Oui dans le 95" qui n'a pas déclenché de recherche CSO en Val-d'Oise.

---

### 3 pires

**1. `b1f6a692`** (Wegovy vs Mounjaro → "Abonnement" → stylo Ozempic, 10 msgs, 8min 07s)
Trois problèmes cumulés : intent "Abonnement" raté, incohérence vouvoiement/tutoiement, puis hallucination majeure sur un "stylo Ozempic 3ml" jamais mentionné. La conversation déraille complètement à partir du message 4. Priorité de correction maximale.

**2. `e5265f46`** (remboursement Wegovy + NovoCare + IMC, 10 msgs, 2min 15s)
Trois erreurs en chaîne : mention du programme NovoCare (inexistant en France), critères de remboursement incorrects (IMC ≥30 au lieu de ≥35), et verdict "éligible" erroné pour un IMC 32,0 sans comorbidité confirmée. Cette conversation délivre une fausse information médicale à l'utilisateur.

**3. `3b66a421`** (Paris hallucination, 4 msgs, 10s)
Hallucination sur la ville ("Tu es à Paris" sans que l'utilisateur l'ait fournie), violation de la règle "notre carte" → "la carte". Conversation trop courte pour récupérer.
