# Rapport Coach IA — 2 juillet 2026

> Rapport généré automatiquement par l'agent de monitoring quotidien.

---

## ⚠️ ALERTE CRITIQUE : SILENCE DEPUIS 9 JOURS

**Dernier message enregistré : 23 juin 2026 à 21:23 UTC.**
Aucune activité depuis lors. Le Coach IA ne répond plus aux utilisateurs depuis 9 jours.

---

## KPIs — Dernières 24h

| Métrique | Valeur |
|---|---|
| Messages totaux | **0** |
| Conversations | **0** |
| Messages utilisateurs | **0** |
| Taux LLM vs Fallback | N/A |
| Évolution vs veille | = (0 hier aussi) |

### Activité des 14 derniers jours

| Date | Messages | Conversations |
|---|---|---|
| 23 juin 2026 | 72 | 13 |
| 22 juin 2026 | 56 | 12 |
| 21 juin 2026 | 32 | 6 |
| 20 juin 2026 | 50 | 9 |
| 19 juin 2026 | 78 | 14 |
| 18 juin 2026 | 44 | 9 |
| **24 juin → 2 juillet** | **0** | **0** |

Avant la coupure, l'activité était stable : ~55 messages/jour, ~10 conversations/jour.

---

## Diagnostic de la panne

Les logs de la edge function `ai-coach` sont vides. Causes probables par ordre de probabilité :

1. **Clé API Groq expirée ou révoquée** — La chaîne LLM tente Groq 70B → Mistral → Groq 8B. Si Groq est inaccessible et Mistral aussi, le fallback v1 (rules engine) devrait quand même répondre — mais les messages ne sont pas enregistrés, ce qui suggère que la edge function elle-même crashe ou n'est plus appelée.
2. **Edge function non déployée / en erreur** — Aucun log dans Supabase = la fonction ne s'exécute pas (erreur de démarrage Deno, import cassé) OU n'est pas appelée du tout (widget désactivé côté front ?).
3. **Changement côté Hostinger** — Si le deploy du 23 juin a cassé le widget `AiCoach.astro` (JS non chargé, CORS, etc.), les utilisateurs voient le chat mais les requêtes ne partent pas.

**Action immédiate recommandée** : Vérifier la edge function dans le dashboard Supabase → Functions → ai-coach → Logs.

---

## Analyse qualité — Conversations du 23 juin 2026

*Base d'analyse : 13 conversations, 72 messages, dernier jour actif.*

### KPIs qualité du 23 juin

| Métrique | Valeur |
|---|---|
| Messages/conversation (moy.) | 5,5 |
| Durée moyenne (conv. longues) | ~2 min 30 |
| Modèle principal | `llama-3.3-70b-versatile` |
| Modèle de secours | `mistral-small-latest` (bascule fréquente = Groq saturé) |
| Conversations ≥ 10 messages | 4/13 (31%) — bon engagement |
| Fallback v1 (rules engine) | 0 |

---

## Ce qui marche bien

- **Détection et traitement des arnaques** : La conversation `12af3ee8` (utilisateur ayant reçu un GLP-1 en pipette de 5ml) est exemplaire. Le Coach a correctement identifié le signal d'arnaque, posé des questions de clarification, expliqué pourquoi aucun vrai GLP-1 ne se présente sous cette forme, et orienté calmement vers les recours.
- **Flux éligibilité remboursement** : Conv `4562a89a` — à la question "Suis-je éligible au remboursement de Wegovy ?", le Coach a immédiatement demandé poids + taille sans lister les critères en bloc. Conforme au system prompt.
- **Prix + relance remboursement** : Conv `f8ac16ec` et `5d80f042` — après une question de prix, le Coach a systématiquement enchaîné sur le remboursement 65%. Bonne exécution du funnel.
- **Bascule LLM sans interruption** : Les conversations utilisant `mistral-small-latest` (basculement depuis Groq 70B saturé) maintiennent la même qualité. La chaîne de résilience fonctionne.
- **Engagement** : 4 conversations sur 13 ont atteint 10 messages — indice d'un fort intérêt utilisateur et de réponses suffisamment engageantes pour maintenir le dialogue.

---

## Problèmes détectés

### GRAVE — Erreur factuelle sur les critères d'éligibilité

**Conversation** : `0ae82ffe-bb29-49a9-ad88-3fdf016ffe7f`
**Message utilisateur** : "comment verifier l'eligibilité ?"
**Ce que le Coach a répondu** :
> "Si ton IMC est **≥ 30**, tu remplis le critère principal. Si **≥ 27 avec une comorbidité** (diabète, hypertension…), tu es aussi éligible."

**Ce qu'il aurait dû répondre** : Les seuils officiels sont IMC ≥ 35 avec comorbidité OU ≥ 40 sans. Dire IMC ≥ 27 ou ≥ 30 = éligible est FAUX et crée de faux espoirs. Le system prompt dit explicitement "Ne dis JAMAIS 'tu es éligible' pour un IMC < 35. C'est une ERREUR GRAVE."

Le modèle a probablement confondu avec les critères d'indication médicale générale (IMC ≥ 27 dans certains guidelines) avec les critères de remboursement français depuis juin 2026.

---

### GRAVE — Info remboursement périmée donnée comme valide

**Conversation** : `30368914-caa4-44ce-9751-3d539c9fb001`
**Message utilisateur** : "Combien coûte un traitement GLP-1 et est-il remboursé ?"
**Ce que le Coach a répondu** :
> "Pour le Wegovy et le Mounjaro utilisés pour l'obésité, les prix sont respectivement de ~250 à 290€/mois et de 230 à 440€/mois, mais **leur remboursement est actuellement limité**."

**Ce qu'il aurait dû répondre** : Wegovy ET Mounjaro sont remboursés à 65% depuis le 15 juin 2026. Ce fait est marqué PRIORITAIRE dans le system prompt avec une instruction explicite de l'ignorer si le contexte RAG dit "non remboursé". Erreur probable : le contexte RAG récupéré avait du contenu périmé, et le modèle (Groq 70B) l'a suivi au lieu d'appliquer la règle de priorité.

---

### MODÉRÉ — Confusion de produit

**Conversation** : `00dfb934-9288-4604-aeca-c31cce09604d`
**Message utilisateur** : "Tu peux m en trouver" (contexte : recherche Wegovy)
**Ce que le Coach a répondu** :
> "Pour trouver un endocrinologue qui prescrit **Mounjaro**..."

**Ce qu'il aurait dû répondre** : La conversation portait sur Wegovy. Pas de Mounjaro mentionné. Le Coach a perdu le contexte produit entre les deux messages.

---

### MODÉRÉ — Perte de contexte produit entre messages

**Conversation** : `30ebef2d-f7b8-40d0-b59a-11950ecf866d`
**Situation** : L'utilisateur demandait son éligibilité Wegovy/Mounjaro, puis a tapé "Prix".
**Ce que le Coach a répondu** : Prix de **Trulicity** (dulaglutide) et **Rybelsus** — deux produits non mentionnés dans la conversation.
**Ce qu'il aurait dû répondre** : Prix Wegovy/Mounjaro (les produits du contexte).

---

### MINEUR — Violation de la règle "ne jamais dire de comparer soi-même"

**Conversation** : `5d80f042-a32d-47c3-9466-bcad2476f58d`
**Message utilisateur** : "Quelle pharmacie à 280" (Mounjaro 10mg Hérault)
**Ce que le Coach a répondu** :
> "il faut comparer les prix en appelant plusieurs pharmacies."

**Ce qu'il aurait dû répondre** : Donner directement le lien de la carte des prix + demander la ville. Le system prompt dit explicitement "Ne réponds JAMAIS 'comparez vous-même' ou 'appelez les pharmacies'. C'est la 1ère cause d'abandon."

---

### MINEUR — Formulation "nos" interdite

**Conversation** : `ac64c9c4-c12a-469d-9999-980b8e276c4e`
**Ce que le Coach a dit** : "je te conseille d'utiliser **notre** carte des prix en pharmacie"
**Règle** : Ne jamais dire "nos articles", "nos guides", "notre carte". Formuler de façon neutre.

---

### MINEUR — Réponse tronquée (coupure mid-sentence)

**Conversation** : `12af3ee8-1536-484a-bcd2-d1ef3a46aca1` (21:23:40)
**Le dernier message du Coach** se termine sur :
> "...Veux-tu que je t'aide à vérifier si ce site est fiable ou signaler l'arnaque"

Phrase coupée, sans point ni suggestion cliquable. Probable coupure par `max_tokens` (220 tokens) qui n'est pas assez pour les réponses arnaque/scam qui nécessitent plus de détails.

---

## Actions recommandées

### 1. URGENT — Diagnostiquer la panne (9 jours de silence)

Étapes dans l'ordre :
1. Dashboard Supabase → Functions → `ai-coach` → Logs → chercher les erreurs depuis le 24/06
2. Vérifier que la edge function est bien **déployée et active** (status vert)
3. Tester manuellement avec `curl -X POST https://ywekaivgjzsmdocchvum.supabase.co/functions/v1/ai-coach -H "Content-Type: application/json" -d '{"session_id":"test","message":"Bonjour"}'`
4. Si la function répond → problème côté widget frontend (AiCoach.astro, JS désactivé, CORS, ou deploy cassé le 23/06)
5. Si la function ne répond pas → vérifier les clés API (GROQ_API_KEY, MISTRAL_API_KEY) dans les secrets Supabase

### 2. Fix du system prompt — Critères éligibilité (erreur grave)

Le modèle confond les critères de remboursement avec les critères d'indication générale. Ajouter dans le system prompt, section FLUX ÉLIGIBILITÉ, une note explicite :

```diff
FLUX "SUIS-JE ÉLIGIBLE AU REMBOURSEMENT ?" 
+ ⚠️ ATTENTION AUX SEUILS — REMBOURSEMENT ≠ INDICATION MÉDICALE GÉNÉRALE :
+ Le remboursement obésité France (65%) depuis le 15 juin 2026 s'applique à IMC ≥ 35 avec
+ comorbidité OU IMC ≥ 40. NE jamais mentionner IMC ≥ 27 ou IMC ≥ 30 comme seuil
+ d'éligibilité AU REMBOURSEMENT. Ces seuils sont ceux d'autres pays ou d'autres contextes.
```

### 3. Fix du system prompt — Renforcer la règle priorité remboursement

Ajouter un exemple explicite de ce qu'il ne faut pas dire :

```diff
⚠️ CE FAIT EST PRIORITAIRE SUR LE CONTEXTE : si le contexte factuel récupéré indique
"non remboursé", "pas encore remboursé", "2e semestre 2026", "négociations en cours"
ou "remboursement limité" → c'est PÉRIMÉ — ignore-le et applique le fait officiel.
+ EXEMPLE DE RÉPONSE INTERDITE : "leur remboursement est actuellement limité" — FAUX.
+ EXEMPLE DE RÉPONSE CORRECTE : "remboursés à 65% depuis le 15 juin 2026 sous conditions".
```

### 4. Augmenter `max_tokens` pour les flux scam

Pour les conversations détectant `scam:high`, la limite de 220 tokens est insuffisante. Le Coach est obligé d'énoncer les recours (signal.conso, pré-plainte) tout en posant des questions de clarification.

```diff
max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : 220,
```
```diff
const isScamHigh = scamSignals.severity === 'high';
max_tokens: hasConsultation ? MAX_RESPONSE_TOKENS : (isScamHigh ? 350 : 220),
```

### 5. Fix — Règle "ne jamais dire d'appeler les pharmacies"

Ajouter dans les INTENT_PATTERNS `price`/`availability` une instruction explicite :

Dans le system prompt, renforcer :
```diff
Pour un prix ou une pharmacie proche : oriente vers la carte des prix → [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/), et demande la ville pour cibler.
+ Ne dis JAMAIS "appelle les pharmacies", "compare toi-même", "vérifie auprès de ta pharmacie" — donne TOUJOURS le lien de la carte des prix ET demande la ville dans la même réponse.
```

### 6. Suggestion de nouveaux articles

Questions fréquentes sans article dédié identifié :
- "Documents nécessaires pour le remboursement en pharmacie" — conversation `df3ddd0a` : réponse du Coach incertaine (mentionnait un "justificatif de prescription" qui n'existe pas comme document séparé)
- "Où trouver Mounjaro/Wegovy moins cher dans ma région" — forte demande dans plusieurs conversations, la carte des prix est souvent mentionnée mais les utilisateurs ne la trouvent pas intuitive
- "GLP-1 en pipette / en gélules — est-ce une arnaque ?" — question distincte qui mérite un article dédié (volume arnaque = 28% des visiteurs)

---

## Conversations marquantes

### Top 3 — Meilleures conversations

**1. `12af3ee8` — Détection arnaque (pipette 5ml)**
Durée : 3min33 | 10 messages
Le Coach a géré avec excellence un cas d'arnaque classique : pipette de "GLP-1" reçue par colis. Empathie, questions de clarification, explication claire des formes légales, orientation vers les recours. Seul défaut : dernière réponse tronquée faute de tokens.

**2. `5d80f042` — Recherche prix localisée (Mounjaro Hérault)**
Durée : 1min23 | 10 messages
Utilisateur très précis (dosage 10mg, ville Agde puis Montpellier). Le Coach a correctement guidé vers la carte des prix avec le lien, mentionné le remboursement 65%, demandé la ville. Bonne progression du funnel.

**3. `0ae82ffe` — Parcours éducatif complet (GLP-1 → comment obtenir → éligibilité)**
Durée : 2min31 | 10 messages
Utilisateur passant de "à quoi sert le GLP-1" à "comment obtenir" puis "vérifier l'éligibilité". Bon accompagnement progressif. Défaut notable : erreur sur les seuils IMC (cf. problèmes ci-dessus).

### Top 3 — Conversations à corriger

**1. `30368914` — Remboursement "limité" (info fausse)**
1 seul message/réponse. Le Coach a dit que le remboursement Wegovy/Mounjaro est "actuellement limité" — information fausse depuis le 15 juin 2026. Une seule interaction, mais un utilisateur reparti avec une fausse information sur un point clé.

**2. `df3ddd0a` — Documents remboursement pharmacie**
1 seul message/réponse. La réponse mentionne un "justificatif de prescription complété et signé par le médecin" comme document séparé — ce document n'existe pas en tant que tel en France. Réponse en vouvoiement sans contexte (on ne sait pas si l'utilisateur avait vouvoyé). Qualité médiocre.

**3. `00dfb934` — Confusion Wegovy → Mounjaro**
Utilisateur demandant "Je veux en acheter" puis "Tu peux m en trouver" (contexte Wegovy). Le Coach a basculé sur Mounjaro sans raison. Rupture de contexte qui doit être corrigée en s'assurant que le produit mentionné dans la conversation est maintenu dans le contexte.

---

*Rapport généré le 2 juillet 2026 — Agent monitoring Coach IA GLP-1 France*
