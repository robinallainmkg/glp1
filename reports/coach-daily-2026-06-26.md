# Rapport Coach IA — 26 juin 2026

> **⚠️ ALERTE : Aucun message depuis le 23 juin 2026 (3 jours de silence).** Vérifier si l'Edge Function `ai-coach` est opérationnelle.

---

## KPIs

### Dernières 24h (25→26 juin)
| Métrique | Valeur |
|---|---|
| Messages | **0** |
| Conversations | **0** |
| Messages/conv | — |
| Durée moyenne | — |
| Taux LLM | — |
| Évolution vs veille | = (0 → 0) |

### Dernière journée active : 23 juin 2026 (référence)
| Métrique | Valeur |
|---|---|
| Messages totaux | **72** |
| Conversations | **13** |
| Messages user | ~36 (estimation) |
| Messages/conv | **5,5** |
| Taux LLM | **100%** (0 fallback-v1) |
| Split modèles | Llama-3.3-70B : 70% · Mistral-Small : 30% |
| Intentions détectées | 1 × `scam:high` / 125 × `null` |
| Évolution vs veille (22 juin) | 72 vs 56 → **+29% ↑** |

### Activité 7 derniers jours
| Date | Messages | Conv |
|---|---|---|
| 23 juin | 72 | 13 |
| 22 juin | 56 | 12 |
| 21 juin | 32 | 6 |
| 20 juin | 50 | 9 |
| 19 juin | 42 | 9 |
| 24 juin | 0 | 0 |
| 25 juin | 0 | 0 |

Tendance : forte croissance jusqu'au 23 juin, puis arrêt brutal.

---

## Ce qui marche bien

1. **Flux remboursement parfait** : La conv `4562a89a` ("Suis-je éligible ?") est exemplaire — réponse immédiate "Vérifions ensemble ! Quel est ton poids et ta taille ?" sans listing des critères, exactement comme le system prompt le prescrit.

2. **Gestion des arnaques solide** (conv `12af3ee8`) : Quand l'utilisateur mentionne un "GLP-1 en pipette 5 dans une boite", le Coach identifie correctement le produit comme suspect (intent `scam:high`), rassure, et demande où il a été acheté. Ton calme et informatif, sans dramatiser.

3. **Remboursement 15 juin 2026 bien intégré** : Toutes les réponses mentionnant le remboursement citent correctement la date du 15 juin 2026, IMC ≥ 35/40, CSO/CHU — la mise à jour du system prompt est pleinement assimilée par le LLM.

4. **Chaîne de résilience LLM fonctionnelle** : Mistral Small prend le relais quand Groq sature (30% des réponses). Aucun fallback-v1 déclenché sur la période.

5. **Guidage progressif prix→remboursement** (conv `0ae82ffe`) : 10 messages, 2min31, l'utilisateur passe de "A quoi sert le GLP-1" à "comment vérifier l'éligibilité" en étant guidé naturellement. Bonne illustration du funnel.

---

## Problèmes détectés

### 🔴 Critique

**1. Hallucination de localisation** — Conv `68520701`
- **Message user** : "Oui, donne ma ville"
- **Réponse Coach** : "Tu es à Paris. Pour trouver une pharmacie pas chère, je te conseille de vérifier les prix sur notre carte des prix en pharmacie. Pour le suivi médical, il y a le CHU Pitié-Salpêtrière ou la Clinique de la Muette."
- **Problème** : L'utilisateur n'a JAMAIS mentionné Paris. Le Coach a inventé une localisation (hallucination). L'utilisateur est en Essonne (code postal 91160), révélé 2 échanges plus tard.
- **Ce qu'il aurait dû répondre** : "Dans quelle ville es-tu ?" (question directe, pas d'hypothèse)

**2. Réponses tronquées en milieu de phrase** — Convs `8aa02a94`, `12af3ee8`
- `MAX_RESPONSE_TOKENS = 220` est trop court pour les réponses complexes (produits suspects, listes de critères).
- Exemple (conv `12af3ee8`) : "Veux-tu que je t'aide à vérifier si ce site est fiable ou signaler l'arnaque" — fin coupée, bouton d'action jamais proposé.
- Conv `8aa02a94` : "Vérifions ensemble ! Pour être éligible au remboursement à 65% (obésité), il faut : - IMC ≥ 35 avec au moins une comorbidité..." → tronquée avant la suite.

### 🟡 Important

**3. Incohérence de prix** — Conv `30368914`
- **Message user** : "Combien coûte un traitement GLP-1 et est-il remboursé ?"
- **Réponse Coach (Llama)** : "Wegovy ~250 à 290 €/mois, Mounjaro 230 à 440 €/mois"
- **System prompt** : "Wegovy ~147-350€/mois · Mounjaro ~176-434€/mois"
- Le Llama 70B hallucine une fourchette différente de celle du system prompt. Mistral respecte mieux les prix définis.

**4. Confusion salutation temporelle** — Conv `12af3ee8`
- **Message user** : "Bonsoir" (21h20 UTC)
- **Réponse Coach** : "Bonjour ! Je suis le Coach GLP-1 France."
- Le Coach répond "Bonjour" à un message envoyé le soir. Perte de crédibilité.

**5. Information hors sujet (Rybelsus non demandé)** — Conv `12af3ee8`
- **Message user** : "quelle est la posologie de la solution buvale ?" (dans le contexte d'un produit reçu en pipette)
- **Réponse Coach** : Donne la posologie complète de Rybelsus (semaine 1-4, 5-8, 9+, règles de prise)
- **Ce qu'il aurait dû répondre** : Clarifier d'abord que le produit reçu (pipette 5 ml) n'est pas un GLP-1 légal, PUIS expliquer les formes galéniques réelles — sans donner de posologie non sollicitée sur un produit différent.

**6. Guidance pharmacie incohérente** — Conv `5d80f042`
- Tour 3 : "Pour trouver Mounjaro 10 mg à 280€ dans l'Hérault, il faut comparer les prix en appelant plusieurs pharmacies." → contredit le system prompt ("Ne réponds JAMAIS 'appelez les pharmacies'")
- Tour suivant : donne le lien de la carte des prix (correct).
- Le modèle ne suit pas de manière consistante la règle sur les pharmacies locales.

**7. Confusion de produit** — Conv `00dfb934`
- **Message user** : "Tu peux m en trouver" (après "Je veux en acheter" sans préciser de produit)
- **Réponse Coach** : "Pour trouver un endocrinologue qui prescrit Mounjaro..." — Mounjaro n'a jamais été mentionné par l'utilisateur.

### 🟢 Mineur

**8. Champ `intent` non renseigné** : 125/126 réponses assistants ont `intent: null`. Les patterns de l'intent engine (price, prescription, side_effects…) ne sont pas loggés dans la colonne `intent` pour les réponses LLM (seul le scam est correctement propagé). Perte de données analytiques.

**9. Document remboursement pharmacie inventé** — Conv `df3ddd0a`
- Le Coach mentionne un "justificatif de prescription complété et signé par le médecin" comme document séparé de l'ordonnance — ce document n'existe pas dans le parcours standard. Il faut: ordonnance + carte Vitale (+ attestation mutuelle). Pas de document spécial supplémentaire pour le remboursement pharmacie.

---

## Actions recommandées

### 1. [URGENT] Vérifier l'opérationnalité de l'Edge Function
```bash
curl -X POST https://ywekaivgjzsmdocchvum.supabase.co/functions/v1/ai-coach \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test-monitor","message":"Bonsoir"}'
```
3 jours sans message (24-26 juin) = panne probable ou blocage réseau côté Hostinger/DNS.

### 2. [URGENT] Augmenter MAX_RESPONSE_TOKENS
```diff
- const MAX_RESPONSE_TOKENS = 700;
+ const MAX_RESPONSE_TOKENS = 700; // déjà OK pour consultations
  // ...
  max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 220,
+ // → remplacer 220 par 350 pour les réponses standard
  max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 350,
```
Le `MAX_RESPONSE_TOKENS = 700` est bien défini en haut, mais dans l'appel LLM il est hardcodé à `220` pour le mode normal. Passer à **350** minimum.

### 3. [PRIORITÉ HAUTE] Interdire les hypothèses de localisation dans le system prompt
Ajouter après la règle REQUÊTES LOCALES :
```
- INTERDIT : supposer ou deviner la ville/région de l'utilisateur. Si la ville n'est pas explicitement fournie, demande-la : "Dans quelle ville es-tu ?" — ne propose jamais de pharmacie, CHU ou hôpital spécifique sans que la ville soit connue avec certitude.
```

### 4. [PRIORITÉ HAUTE] Corriger la salutation temporelle
Dans le system prompt, remplacer :
```
Tu salues ("Bonjour"/"Salut") et te présentes UNIQUEMENT au tout premier message
```
Par :
```
Tu salues UNIQUEMENT au tout premier message, en adaptant l'heure : "Bonjour" (matin/après-midi), "Bonsoir" (après 18h). Ensuite tu réponds directement, sans re-saluer.
```
Note: l'heure peut être injectée via un contexte dynamique dans `userMessageWithContext`.

### 5. [PRIORITÉ NORMALE] Logguer les intents LLM dans coach_messages
Dans la fonction `saveMessages`, le champ `intent` est passé depuis `detectedIntent = scamSignals.isScamRelated ? scam:severity : null`. Il faudrait aussi mapper les patterns LLM communs (price, prescription, etc.) pour alimenter les analytics. Actuellement 99% des messages ont `intent: null`.

### 6. [PRIORITÉ NORMALE] Corriger les prix Wegovy/Mounjaro pour le modèle Llama
Le Llama 70B (modèle principal) ignore parfois les prix exacts du system prompt. Envisager de renforcer avec un format structuré :
```
PRIX OFFICIELS (ne jamais dévier de ces valeurs) :
- Ozempic : 77€/boîte
- Wegovy : 147€ (0,25mg) à 350€/mois (2,4mg)
- Mounjaro : 176€ (2,5mg) à 434€/mois (15mg)
- Saxenda : 270€/mois
```

### 7. [PRIORITÉ BASSE] Corriger la liste de documents remboursement
Remplacer dans le fallback `price` ou ajouter une règle dans le system prompt :
```
Documents pour remboursement en pharmacie : (1) ordonnance du médecin, (2) carte Vitale à jour, (3) attestation mutuelle si applicable. PAS de document supplémentaire "justificatif de prescription" — l'ordonnance suffit.
```

---

## Suggestions d'articles basées sur les questions sans réponse satisfaisante

| Thème | Requêtes observées | Article suggéré |
|---|---|---|
| Pharmacies en Normandie | "pour la normandie" | Page dédiée région Normandie dans `/collections/glp1-cout/` ou enrichissement de la carte des prix |
| Produits GLP-1 contrefaits en pipette | "GLP-1 en pipette 5 dans une boite" | Article `arnaques-glp1-en-ligne-comment-les-reconnaitre` dans `/collections/temoignages/` |
| Documents remboursement pharmacie | "Qu'Elle document pour remboursement pharmacie" | Article ou FAQ `checklist-documents-remboursement-glp1` |
| Prix par ville / département | "Prix Hérault Mounjaro 10mg", "Prix actuel Mounjaro 5mg à Nice" | Enrichir la carte des prix avec données par code postal |

---

## Conversations marquantes

### Top 3 (meilleures)

**1. Conv `0ae82ffe` — "A quoi sert le GLP-1" → éligibilité (2min31, 10 messages)**
Parcours complet et naturel. L'utilisateur part d'une question générale et arrive à "comment vérifier l'éligibilité" avec calcul d'IMC. Le Coach guide sans imposer. Modèle d'une bonne conversation funnel.

**2. Conv `4562a89a` — Éligibilité Wegovy (1 échange)**
Réponse parfaite en 1 échange : "Vérifions ensemble ! Quel est ton poids et ta taille ?" — conforme au system prompt, sans liste de critères, action immédiate.

**3. Conv `f8ac16ec` — Prix + remboursement Nice (3 échanges)**
Réponses précises, information sur le remboursement 15 juin 2026 correctement appliquée, passage fluide de la question générale au cas particulier (Mounjaro 5mg à Nice). Ton conversationnel.

### Bottom 3 (à corriger)

**1. Conv `68520701` — Hallucination Paris (10 messages, 1min26)**
Le Coach invente que l'utilisateur est à Paris. L'utilisateur (Essonne 91160) dit "JE NE VOIS PAS PRIX SUR LA CARTE" — la carte des prix ne lui est pas utile. 10 échanges pour un résultat nul. Besoin de la règle anti-hypothèse de localisation.

**2. Conv `12af3ee8` — Soir/Bonjour + réponses tronquées (10 messages, 3min33)**
"Bonsoir" → "Bonjour". Posologie Rybelsus non sollicitée. Deux réponses tronquées en milieu de phrase. Pourtant le fond (détection arnaque pipette) est bon — dommage que la forme nuise.

**3. Conv `00dfb934` — Confusion produit Mounjaro (2 messages)**
"Je veux en acheter" + "Tu peux m en trouver" → le Coach parle de Mounjaro sans raison. L'utilisateur n'a pas spécifié de produit. Si la prochaine réponse avait demandé "Quel traitement as-tu en tête : Wegovy, Mounjaro, Ozempic ?", elle aurait été bien meilleure.

---

*Rapport généré automatiquement le 2026-06-26. Données source : Supabase projet `ywekaivgjzsmdocchvum`, table `coach_messages`.*
