# Coach IA GLP-1 France — Rapport quotidien 2026-06-03

> Fenêtre analysée : 2026-06-02 12h41 → 2026-06-03 10h04 UTC

---

## KPIs

| Métrique | Valeur | vs veille |
|---|---|---|
| Messages totaux | 30 | +2 ↑ (+7%) |
| Conversations | 12 | — |
| Messages utilisateurs | 15 | — |
| Messages assistant | 15 | — |
| Messages par conversation (moy.) | 2,5 | — |
| Taux LLM (Groq llama-3.3-70b) | **100%** | — |
| Taux Fallback | 0% | — |
| Durée moy. conv. > 2 échanges | ~1min11s | — |

**Évolution vs veille :** 30 messages aujourd'hui, 28 hier → +7%.

**Breakdown intents :**
- `null` (non classifié) : 14/15 réponses (93%)
- `scam:high` : 1/15 (7%) — dont 1 faux positif confirmé (voir §Problèmes)

---

## Ce qui marche bien

1. **100% LLM, 0% fallback.** Groq est stable, aucune dégradation de service.

2. **Réponses avec liens d'articles pertinents.** La quasi-totalité des réponses inclut un lien de profondeur correctement résolu (ex. `/collections/glp1-cout/prix-mounjaro-france/`, `/collections/effets-secondaires-glp1/contrefacon-glp1-faux-ozempic-danger/`). Le RAG fonctionne.

3. **Gestion correcte d'un vrai contexte arnaque (conv. `0a67fabe`).** L'utilisateur revenait dans une conversation déjà marquée scam. Le Coach a fourni les recours adaptés (ANSM, opposition bancaire) et n'a pas jugé.

4. **Prix Mounjaro (conv. `318f1efb`)** : réponse directe, prix exacts par dosage (2,5 mg ~230€, 5 mg ~275€), note sur la variabilité pharmacie, lien article. < 100 mots. ✓

5. **Vouvoiement/tutoiement cohérent** dans toutes les conversations. Pas d'incohérence de registre détectée.

6. **Réponse perte de poids (conv. `05ba49c3`)** : chiffres factuels (15-20%), lien article, ton rassurant sans promesse excessive.

---

## Problèmes détectés

### 🔴 P1 — CRITIQUE : Annette.care réactivé dans 4 conversations (système interdit)

**Règle CLAUDE.md :** _"Annette.care — DESACTIVE. NE PAS reactiver sans décision explicite. Ne plus utiliser code CARE50 ni lien affilié."_

**Conversations impactées :**

| conv_id | Question user | Ce que le Coach a fait |
|---|---|---|
| `1e3f67e4` | "j'ai une lettre d'adressage vers un endocrinologue... éligible au remboursement ?" | Recommande Annette.care + code CARE50 |
| `562b8335` | "Bonjour, je suis fumeuse... accompagnement GLP-1 sans grossir ?" | Recommande Annette.care + code CARE50 |
| `bc678a6b` | "Comment obtenir une ordonnance pour un GLP-1 ?" | Recommande Annette.care + code CARE50 en tête de réponse |
| `af0ee4d0` | Problème connexion → confusion → Coach redirige vers support | Mentionne Annette.care en fin de réponse |

**Cause racine :** Le system prompt dans `supabase/functions/ai-coach/index.ts` (lignes 55-62) contient encore les instructions complètes Annette (lien, code CARE50, note Google 4.8/5). Il n'a jamais été mis à jour.

**Ce qu'il aurait dû répondre (ex. `bc678a6b`) :**
> "Les GLP-1 sont délivrés uniquement sur ordonnance. Pour obtenir une prescription, consultez votre médecin traitant ou un endocrinologue. Si vous êtes éligible à Wegovy/Mounjaro (IMC ≥ 35 avec comorbidité ou ≥ 40), la prescription initiale doit se faire dans un Centre Spécialisé de l'Obésité (CSO). Pour trouver le CSO le plus proche : [annuaire-sante.ameli.fr](https://annuaire-sante.ameli.fr)."

---

### 🔴 P2 — TIPMP mal interprétée → réponse potentiellement dangereuse

**conv_id :** `802751d8`
**Message user :** "j'ai une TIPMP et je voudrais savoir si c'est incompatible avec les injections de GLP-1"

**Ce que le Coach a répondu :**
> "TIPMP (Thrombopénie Induite par les Plaquettes Maternelles) [...] Les GLP-1 n'interfèrent généralement pas avec les médicaments anti-agrégants plaquettaires..."

**Problème :** TIPMP signifie très probablement **Tumeur Intra-Papillaire Mucineuse du Pancréas** (IPMN en anglais) — une lésion kystique précancéreuse du pancréas. C'est une contre-indication potentielle sérieuse pour les GLP-1 (risque de pancréatite). Le Coach a inventé une définition incorrecte et répondu sur une pathologie complètement différente.

**Ce qu'il aurait dû répondre :**
> "TIPMP peut désigner une tumeur kystique du pancréas (Tumeur Intra-Papillaire Mucineuse du Pancréas). Si c'est le cas, c'est important à signaler à votre médecin avant un traitement GLP-1, car ces médicaments peuvent augmenter le risque de pancréatite. Je vous recommande de poser cette question précisément à votre endocrinologue ou gastro-entérologue avant de commencer."

---

### 🟠 P3 — Remboursement Mounjaro : date imprécise (J-12 du 15 juin ignoré)

**Conversations impactées :** `694be2dc`, `08112d76`

**Message user (694be2dc) :** "je suis sous mounjaro est je voudrais savoir si a partir du 15 juin la mutuelle prend en charge les 35% restant ?"
*(L'utilisateur connaît la date du 15 juin !)*

**Ce que le Coach a répondu :**
> "Mounjaro n'est pas remboursé par la Sécurité Sociale, mais un remboursement est attendu au 2e semestre 2026."

**Problème :** Le system prompt indique explicitement _"Depuis le 15 juin 2026, Wegovy ET Mounjaro sont remboursés à 65%"_. Le LLM ignore cette précision et répond avec une formule vague "2e semestre 2026" alors que l'utilisateur mentionne lui-même la date exacte. La réponse aurait dû confirmer le 15 juin et expliquer les conditions d'éligibilité (IMC ≥ 35 + comorbidité ou ≥ 40) et le parcours CSO/CHU.

**Ce qu'il aurait dû répondre :**
> "Oui, à partir du 15 juin 2026 (dans 12 jours), Mounjaro sera remboursé à 65% par l'Assurance Maladie pour l'obésité — à condition d'avoir un IMC ≥ 35 avec une comorbidité (ou ≥ 40), et une prescription initiale faite dans un Centre Spécialisé de l'Obésité (CSO). La mutuelle peut prendre en charge tout ou partie des 35% restants selon votre contrat. Vérifiez directement avec elle."

---

### 🟠 P4 — Faux positif scam sur problème de connexion

**conv_id :** `af0ee4d0`
**Séquence :**
1. User : "bonjour je n'arrive pas à me connecter sur l'application"
2. Coach : demande quelle application (correct)
3. User : "on m'indique que la combinaison mot de passe et l'identifiant est incorrect alors que c'est faux" → **intent: scam:high déclenché**
4. Coach : "Pouvez-vous me dire si vous avez acheté un produit en ligne récemment, notamment un médicament GLP-1 ?" ← hors sujet complet

**Problème :** Le pattern `post_scam` (`pas re[cç]u|jamais livr[eé]|rembourse|litige|plainte`) ou un autre pattern a déclenché `scam:high` sur un simple message de support technique. Le Coach a alors posé une question totalement hors sujet qui a dérouté l'utilisateur.

**Ce qu'il aurait dû répondre :**
> "Si votre mot de passe est refusé, essayez la fonction 'Mot de passe oublié' pour en générer un nouveau. Si le problème persiste, contactez le support de l'application directement."

---

### 🟡 P5 — Réponse au "Bonjour" trop prolixe

**conv_id :** `694be2dc`
**User :** "Bonjour,"
**Coach :** Long paragraphe listant sémaglutide, tirzépatide, liraglutide, dulaglutide + demande ce que l'utilisateur veut savoir.

**Problème :** 68 mots pour répondre à un simple "Bonjour". Le system prompt dit de ne se présenter qu'une fois. Le Coach aurait dû simplement dire "Bonjour ! Comment puis-je vous aider ?" (≤ 10 mots).

---

### 🟡 P6 — Prix Mounjaro sans mention du remboursement imminent

**conv_id :** `318f1efb` (2026-06-03 10h04, soit J-12 du 15 juin)
**User :** "Prix de l'injection mounjaro style 2.5 ml et mounjaro style 5ml"

Le Coach donne les prix corrects mais n'ajoute pas : *"À noter : à partir du 15 juin 2026 (dans 12 jours), Mounjaro sera remboursé à 65% pour les cas éligibles."* C'est une information très utile que le Coach a ici.

---

## Actions recommandées

### Action 1 — URGENT : Retirer Annette du system prompt

**Fichier :** `supabase/functions/ai-coach/index.ts`

**Diff proposé** (lignes 54-62) :

```diff
-ORIENTATION MÉDICALE (PRESCRIPTION / MÉDECIN / ACCOMPAGNEMENT) :
-Quand quelqu'un cherche un médecin, une prescription, un renouvellement, un suivi nutritionnel ou un accompagnement GLP-1 :
-- RECOMMANDE EN PRIORITÉ Annette.care : plateforme d'accompagnement avec des médecins partenaires qui peuvent faire la primo-prescription GLP-1 si le patient est éligible, + un suivi diététique personnalisé + notre Coach IA qui les accompagne pendant tout le traitement.
-- Critères d'éligibilité pour un traitement GLP-1 : IMC >= 30 (obésité), ou IMC >= 27 avec au moins une comorbidité (diabète type 2, hypertension, apnée du sommeil, etc.).
-- Quand tu recommandes Annette, donne TOUJOURS le lien cliquable : [Découvrir Annette.care](https://www.annette.care/?utm_source=glp1france&utm_medium=chat_coach&utm_campaign=partenariat_coach)
-- Mentionne le code promo CARE50 (50% sur le 1er mois, soit 24,50 EUR au lieu de 49 EUR).
-- Mets en avant : consultation médicale + accompagnement diététique + Coach IA intégré pour le suivi.
-- Note Google : 4.8/5 avec 2000+ patients accompagnés.
-- En complément (pas en remplacement) : le médecin traitant reste une option, annuaire-sante.ameli.fr pour trouver un praticien.
+ORIENTATION MÉDICALE (PRESCRIPTION / MÉDECIN / ACCOMPAGNEMENT) :
+Quand quelqu'un cherche un médecin, une prescription, un renouvellement, un suivi nutritionnel ou un accompagnement GLP-1 :
+- Oriente vers le médecin traitant ou un endocrinologue.
+- Pour Wegovy/Mounjaro (obésité), la prescription initiale doit se faire dans un Centre Spécialisé de l'Obésité (CSO). Le renouvellement est possible chez le généraliste.
+- Critères d'éligibilité : IMC >= 35 avec comorbidité (ou >= 40) pour Wegovy/Mounjaro obésité ; IMC >= 30 pour les autres cas.
+- Donne le lien annuaire-sante.ameli.fr pour trouver un praticien ou un CSO.
+- NE recommande AUCUNE plateforme commerciale tierce.
```

Idem pour le bloc `doctorContext` (lignes 559-564) et le fallback `intent: 'prescription'` (ligne 110) et `intent: 'diet'` (ligne 100) — tous mentionnent encore Annette/CARE50.

### Action 2 — Renforcer l'instruction remboursement avec date exacte

Dans le system prompt, ajouter après la ligne remboursement :

```diff
+- IMPORTANT SUR LA DATE : Quand un utilisateur mentionne le "15 juin" ou demande le remboursement Mounjaro/Wegovy, confirme que c'est bien le 15 juin 2026 (tu peux calculer le nombre de jours restants si utile). Ne dis jamais "2e semestre 2026" si la date exacte du 15 juin est connue.
```

### Action 3 — Ajouter TIPMP/IPMN dans le contexte pancréatique

Dans le system prompt, ajouter dans CONTEXTE IMPORTANT :

```diff
+- PANCRÉAS : Si quelqu'un mentionne TIPMP, IPMN, kyste pancréatique, pancréatite ou histoire pancréatique, dis clairement que c'est une question à poser impérativement au médecin avant de démarrer un GLP-1, car ces médicaments peuvent augmenter le risque de pancréatite. Ne tente pas de définir l'acronyme médical toi-même.
```

### Action 4 — Améliorer la détection scam pour éviter les faux positifs

Dans `detectScamSignals`, le pattern `post_scam` déclenche sur "jamais livré" / "rembourse" / "litige" — mais "mot de passe incorrect" ne devrait pas déclencher. Vérifier si c'est un autre pattern qui s'est activé, probablement `online_purchase`. Ajouter une liste de messages à exclure ou resserrer le pattern :

```diff
-{ pattern: /\b(pas re[cç]u|jamais livr[eé]|rembourse|litige|plainte)\b/i, signal: 'post_scam' },
+{ pattern: /\b(pas re[cç]u|jamais livr[eé]|litige|plainte)\b.*\b(commande|achat|produit|colis)\b/i, signal: 'post_scam' },
```

### Action 5 — Réponse minimale au "Bonjour" seul

Ajouter dans le system prompt :

```diff
+- Si l'utilisateur envoie uniquement une salutation ("Bonjour", "Salut", "Hello"), réponds par une courte salutation et demande comment tu peux aider. Maximum 10 mots. N'énumère pas les traitements.
```

### Idées d'articles basées sur les questions sans bonne réponse

| Sujet | Intention | Priorité |
|---|---|---|
| TIPMP/IPMN et GLP-1 : compatibilité | Information médicale | Haute |
| Arrêt tabac + prise de poids : comment les GLP-1 peuvent aider | Curiosité + intention | Moyenne |
| Remboursement Mounjaro/Wegovy : guide pratique CSO (post-15 juin 2026) | Informationnel | Haute |
| Connexion / accès espace patient : FAQ | Support | Faible |

---

## Conversations marquantes

### Les 3 meilleures

**1. `af0ee4d0` (6 messages, 1min08s)** — Engagement le plus fort. Malgré un faux positif scam initial, le Coach a maintenu la conversation et a finalement orienté correctement. L'utilisateur a continué à répondre, signe d'engagement.

**2. `694be2dc` (4 messages, 54s)** — Multi-tour naturel avec une vraie question sur le remboursement. Le Coach a géré la progression correctement même si la réponse sur la date est imprécise.

**3. `e40aff87` — "Ou acheter"** — Réponse très complète avec distinction pharmacies de ville / en ligne, avertissement sur les sites frauduleux, et 3 liens d'articles pertinents. Excellent rapport qualité/longueur.

### Les 3 pires

**1. `802751d8` — TIPMP** — Erreur médicale potentiellement grave. Le Coach a inventé une définition fausse d'un acronyme médical et répondu sur le mauvais sujet. À corriger en priorité.

**2. `1e3f67e4` — Lettre d'adressage + remboursement** — Double problème : Annette.care réactivé à tort + réponse hors sujet (l'utilisateur demandait si sa situation spécifique est éligible, pas un guide générique sur les critères).

**3. `694be2dc` — "Bonjour, + question remboursement"** — Réponse trop longue au simple "Bonjour" + date de remboursement inexacte alors que l'utilisateur avait lui-même mentionné le "15 juin".

---

*Rapport généré le 2026-06-03 par l'agent de monitoring Coach IA.*
