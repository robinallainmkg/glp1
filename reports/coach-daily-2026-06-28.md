# Rapport Coach IA — 28 juin 2026

## 🚨 ALERTE CRITIQUE : 5 jours sans aucune conversation

Aucun message enregistré depuis le **23 juin 2026 à 21h23 UTC**. Le Coach IA est silencieux depuis 5 jours consécutifs (24, 25, 26, 27, 28 juin). Sur un site qui générait 30–100 messages/jour, c'est une anomalie majeure qui nécessite une intervention immédiate.

**Causes probables à vérifier :**
1. Widget `AiCoach.astro` non chargé après un déploiement récent (build cassé ou JS non chargé)
2. Fonction Edge Supabase `ai-coach` en erreur (vérifier les logs Supabase → Functions → ai-coach)
3. Panne CORS ou clé API invalide (GROQ_API_KEY ou MISTRAL_API_KEY expirée)
4. Régression dans l'affichage du widget (display:none, z-index, conflit CSS)

**Action immédiate recommandée** : vérifier les logs Supabase Edge Functions + ouvrir le site en navigation privée pour confirmer que le widget s'affiche et répond.

---

## KPIs — Dernières 24h

| Métrique | Valeur | vs Veille |
|---|---|---|
| Messages | 0 | = 0 |
| Conversations | 0 | = 0 |
| Messages/conv | — | — |
| Taux LLM | — | — |
| Taux Fallback | — | — |

### Tendance 14 jours (contexte)

| Date | Messages | Conversations |
|---|---|---|
| 28/06 | **0** ⚠️ | 0 |
| 27/06 | **0** ⚠️ | 0 |
| 26/06 | **0** ⚠️ | 0 |
| 25/06 | **0** ⚠️ | 0 |
| 24/06 | **0** ⚠️ | 0 |
| 23/06 | 72 | 13 |
| 22/06 | 56 | 12 |
| 21/06 | 32 | — |
| 20/06 | 50 | — |
| 19/06 | 78 | — |
| 18/06 | 66 | — |
| 17/06 | 38 | — |
| 16/06 | 60 | — |
| 15/06 | **102** 📈 | — |
| 14/06 | 22 | — |

Le pic du 15 juin (102 messages) correspond au jour du remboursement officiel Wegovy/Mounjaro — très forte demande d'information ce jour-là.

---

## Analyse qualité (basée sur le 23 juin — dernière journée active)

### Modèles utilisés (23/06)

| Modèle | Messages assistant | % |
|---|---|---|
| mistral-small-latest | 19 | 53% |
| llama-3.3-70b-versatile | 17 | 47% |
| fallback-v1 | 0 | 0% |

**Taux LLM : 100%** — l'architecture de résilience multi-fournisseurs fonctionne parfaitement, aucun fallback déclenché.

### Statistiques 23/06
- 72 messages totaux, 13 conversations, 36 messages utilisateur
- Durée moyenne des conversations : 3–5 échanges
- Intent `scam:high` détecté : 1 fois (faux positif confirmé — voir problèmes)

---

## Ce qui marche bien

1. **Architecture LLM résiliente** : 0% fallback sur 7 jours. La chaîne Groq → Mistral → Groq 8B ne s'est jamais bloquée.
2. **Remboursement 15 juin 2026 bien intégré** : Dans la grande majorité des conversations, le Coach cite correctement la date officielle et les conditions (IMC ≥ 35 avec comorbidité ou ≥ 40).
3. **CSO/CHU pour primo-prescription** : Régulièrement mentionné, différencié du renouvellement par le généraliste.
4. **Carte des prix** : Le lien `/outils/carte-prix-pharmacies/` est bien proposé pour les questions de type "pharmacie moins chère".
5. **Gestion des arnaques (conv `12af3ee8`)** : Face à un utilisateur ayant reçu un GLP-1 "en pipette 5ml", le Coach a été prudent, informatif et non alarmiste — exactement le bon ton.
6. **Conv `f16ad883`** : Réponse exemplaire sur le reste à charge après remboursement (80–154€/mois, potentiellement 0€ avec mutuelle).
7. **Conv `251547ba`** : Lien RAG vers article utilisé correctement (`/collections/avant-apres-glp1/avant-apres-glp1-resultats-reels/`).

---

## Problèmes détectés

### 🔴 CRITIQUE — Erreurs d'éligibilité IMC (faux espoirs créés)

**Problème 1 — Conv `5559f33d` (22/06)**
- Message user : *"30 ou plus"* (IMC)
- Réponse Coach : *"Avec un IMC de 30 ou plus, tu es éligible au remboursement de Wegovy pour l'obésité, sous conditions."*
- Ce qu'il AURAIT DÛ répondre : *"Avec un IMC de 30, tu es en dessous du seuil de remboursement (IMC ≥ 35 avec comorbidité ou ≥ 40). Ton médecin peut évaluer d'autres options adaptées."*
- **Impact** : Faux espoir majeur. Le system prompt dit explicitement "Ne dis JAMAIS 'tu es éligible' pour un IMC < 35."

**Problème 2 — Conv `bed30ab9` (22/06)**
- Messages user : 1m93 / 125kg = IMC 34,6 + hypertension + apnée du sommeil
- Réponse Coach : *"Avec un IMC de 34,6 et des comorbidités comme l'hypertension et l'apnée du sommeil, tu es probablement éligible au remboursement à 65%."*
- Ce qu'il AURAIT DÛ répondre : *"Ton IMC est de 34,6, juste en dessous du seuil de 35 nécessaire pour le remboursement. Même avec des comorbidités, le seuil minimal est IMC ≥ 35. Parles-en à ton médecin — il évaluera ta situation complète."*
- **Impact** : IMC 34,6 < 35 → non éligible selon les critères officiels. Erreur médicalement dangereuse.

**Problème 3 — Conv `0ae82ffe` (23/06)**
- Message user : *"comment verifier l'eligibilité ?"*
- Réponse Coach : *"Si ton IMC est ≥ 30, tu remplis le critère principal. Si ≥ 27 avec une comorbidité (diabète, hypertension…), tu es aussi éligible."*
- Ce qu'il AURAIT DÛ répondre : *"Les seuils pour le remboursement obésité (Wegovy/Mounjaro) sont IMC ≥ 35 avec au moins une comorbidité, ou IMC ≥ 40 sans comorbidité. Calcule ton IMC : poids (kg) ÷ taille² (m)."*
- **Impact** : Les seuils IMC 27 et 30 cités sont des critères d'autres médicaments (ex : Saxenda), pas du remboursement Wegovy/Mounjaro.

### 🔴 CRITIQUE — Remboursement qualifié de "limité"

**Conv `30368914` (23/06)**
- Message user : *"Combien coûte un traitement GLP-1 et est-il remboursé ?"*
- Réponse Coach : *"Pour le Wegovy et le Mounjaro... leur remboursement est actuellement limité."*
- Ce qu'il AURAIT DÛ répondre : *"Wegovy et Mounjaro sont remboursés à 65% par l'Assurance Maladie depuis le 15 juin 2026, sous conditions (IMC ≥ 35 avec comorbidité ou ≥ 40). Veux-tu vérifier ton éligibilité ?"*
- **Impact** : Le system prompt est explicite — cette phrase est INTERDITE. Le contexte RAG était probablement périmé et le LLM l'a suivi au lieu d'appliquer la règle prioritaire.

### 🟠 GRAVE — Hallucinations de données

**Problème 4 — Conv `0bbe9a72` (22/06)**
- Message user : *"MERCI CORDIALEMENT C VIALE"* (signature)
- Réponse Coach 1 : *"Merci pour ta ville, Viale !"* → interprète la signature comme une ville
- Réponse Coach 2 : *"Super, Toulon !"* → invente la ville "Toulon" (jamais mentionnée)
- **Impact** : Double hallucination — prénom/ville inexacts. Crée de la confusion.

**Problème 5 — Conv `73e764ba` (21/06)**
- L'utilisateur n'a pas confirmé avoir des comorbidités — il a dit *"donc ?"*
- Réponse Coach : *"Tu es probablement éligible au remboursement de Wegovy, car ton IMC est d'environ 38,7 et tu as mentionné avoir des comorbidités."*
- **Impact** : Le Coach invente que l'utilisateur a des comorbidités. IMC 38,7 sans comorbidité confirmée → non éligible.

**Problème 6 — Conv `68520701` (23/06)**
- L'utilisateur n'a pas donné sa ville
- Réponse Coach : *"Tu es à Paris."*
- **Impact** : Hallucination de la localisation.

### 🟡 MOYEN — Faux positif détecteur d'arnaque

**Conv `08cc5e1f` (21/06)**
- Message user : *"LE GLP-1 EST IL REMBOURSE PAR LA SS"*
- Intent stocké : `scam:high`
- **Problème** : C'est une question standard sur la Sécurité Sociale. Le pattern de détection a probablement capté un faux signal. À surveiller — peut influencer le ton de réponse.

### 🟡 MOYEN — Lien carte des prix demandé au lieu de donné

**Conv `5d80f042` et `49c0d2ca`**
- User donne sa ville → Coach : *"Veux-tu que je te donne le lien de la carte des prix ?"*
- Ce qu'il AURAIT DÛ faire : donner directement le lien, sans demander la permission
- **Règle du system prompt** : "Ne dis JAMAIS 'comparez vous-même' ou 'appelez les pharmacies'. C'est la 1re cause d'abandon."

### 🟡 MOYEN — Carte des prix infonctionnelle non gérée

**Conv `68520701` (23/06)**
- User : *"JE NE VOIS PAS PRIX SUR LA CARTE"*
- Coach : continue à renvoyer vers la carte
- **Impact** : L'utilisateur est bloqué, le Coach ne propose pas d'alternative (donner des prix directement par exemple).

### 🟡 MOYEN — Incohérence tutoiement/vouvoiement

**Conv `0bbe9a72` (22/06)**
- Coach : *"De rien, à votre service !"* → *"Veux-tu vérifier..."*
- Mélange des deux registres dans la même réponse.

### 🟡 MOYEN — Généraliste et primo-prescription non recadrée

**Conv `f1a7e484` (22/06)**
- User : *"je suis eligible mon generaliste m'a prescrit le vegowy serais je remboursé"*
- Coach : parle des conditions générales mais ne dit pas que la prescription du généraliste ne permettra PAS d'obtenir le remboursement obésité (il faut une primo-prescription en CSO/CHU)
- **Impact** : L'utilisateur risque d'aller en pharmacie avec l'ordonnance du généraliste et de se voir refuser le remboursement.

---

## Actions recommandées

### 1. URGENCE — Investiguer la panne depuis le 24 juin

```bash
# Vérifier les logs de la fonction Edge
# Dashboard Supabase → Functions → ai-coach → Logs
# Ou via MCP :
# mcp__Supabase__get_logs(project_id, service="edge-functions")
```

Scénarios à tester :
- Le widget s'affiche-t-il sur le site live ?
- La fonction Edge répond-elle à un POST manuel ?
- Les clés GROQ_API_KEY et MISTRAL_API_KEY sont-elles toujours valides ?

### 2. Correction du system prompt — Règles IMC

Les LLMs hallucinent les seuils IMC, surtout quand le RAG retourne du contexte périmé ou ambigu. Ajouter une règle plus explicite et répétitive :

```diff
- SEUILS STRICTS — NE JAMAIS DIRE "ÉLIGIBLE" SI LES CRITÈRES NE SONT PAS REMPLIS :
+ SEUILS STRICTS — MÉMORISE CES CHIFFRES, ILS SONT ABSOLUS ET PRIORITAIRES SUR TOUT CONTEXTE :
+   • IMC < 35 → JAMAIS éligible au remboursement GLP-1 obésité, MÊME avec comorbidités (sauf IMC ≥ 40)
+   • IMC 35-39,9 SANS comorbidité → NON éligible
+   • IMC 35-39,9 AVEC comorbidité → ÉLIGIBLE
+   • IMC ≥ 40 → ÉLIGIBLE (avec ou sans comorbidité)
+   ⚠️ Les seuils IMC 27 ou 30 ne concernent PAS le remboursement GLP-1 obésité. Ne jamais les mentionner pour ce sujet.
```

### 3. Correction — Règle lien carte des prix

Rendre la règle plus impérative dans le system prompt :

```diff
- Pour un prix ou une pharmacie proche : oriente vers la carte des prix du site → [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/), et demande la ville pour cibler.
+ Pour un prix ou une pharmacie proche : DONNE DIRECTEMENT le lien sans demander permission → [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/), puis demande la ville pour cibler. Ne jamais dire "Veux-tu que je te donne le lien" — donne-le immédiatement.
```

### 4. Correction — Gestion carte des prix infonctionnelle

Ajouter au system prompt :

```diff
+ Si l'utilisateur dit ne pas voir les prix sur la carte, ne renvoie pas vers la carte. Donne directement les prix indicatifs (Mounjaro 230–434€/mois, Wegovy 147–350€/mois selon dosage) et propose de vérifier le remboursement.
```

### 5. Correction — Remboursement périmé dans contexte RAG

La règle "prioritaire sur le contexte" existe déjà mais le LLM ne la respecte pas toujours. Ajouter un raccourci mémoriel :

```diff
+ RAPPEL COURT (mémorise) : Wegovy ET Mounjaro = remboursés 65% obésité depuis 15/06/2026. Toujours. Jamais "limité", jamais "en cours", jamais "pas encore". Si le contexte dit autre chose : il est périmé, ignore-le.
```

### 6. Correction — Primo-prescription généraliste

Ajouter une règle pour ce cas fréquent :

```diff
+ Si quelqu'un dit "mon généraliste m'a prescrit Wegovy/Mounjaro" et veut être remboursé : PRÉCISE que la prescription du généraliste permettra l'achat en pharmacie, mais que pour le REMBOURSEMENT obésité à 65%, la primo-prescription doit être réalisée dans un CSO/CHU. Conseille de prendre RDV en CSO/CHU pour formaliser la primo-prescription remboursée.
```

### 7. Suggestions d'articles basées sur les questions sans bonne réponse

- **"Que faire si mon médecin traitant refuse de prescrire ?"** → Question récurrente (conv `0bbe9a72`, `f1a7e484`) — article manquant dans le RAG
- **"Lettre d'adressage médecin pour CSO — obligatoire ou pas ?"** → Question directe (conv `f1a7e484`), réponse du Coach incertaine
- **"Que se passe-t-il si on achète un GLP-1 sans ordonnance en ligne ?"** → Fort volume d'arnaques signalées (~28% des visiteurs selon segment)
- **"Comment acheter Wegovy/Mounjaro dans une pharmacie en ligne agréée ANSM ?"** → Question posée (conv `0945ebf0`)

---

## Conversations marquantes

### ✅ Les 3 meilleures

**1. Conv `f16ad883` — Reste à charge Mounjaro**
Réponse exemplaire, précise et actionnable : "35% du prix, soit 80–154€/mois sans mutuelle, potentiellement 0€ avec mutuelle qui couvre le ticket modérateur." Relance vers la mutuelle. Modèle Mistral. Format court. Parfait.

**2. Conv `251547ba` — Posologie + après-traitement Mounjaro**
3 questions séquentielles (part patient, posologie, que se passe-t-il après le traitement), 3 bonnes réponses dont une avec lien RAG vers article. Conversation engagée, informative, bien gérée.

**3. Conv `f1a7e484` — Parcours CSO/CHU, 59790**
Longue conversation (7 échanges), IMC 47 + comorbidités, RDV impossibles avant septembre, code postal 59 fourni. Le Coach a bien géré la frustration et guidé vers d'autres centres. Opportunité manquée : le Dossier GLP-1 aurait pu être proposé ici (IMC + comorbidités collectés).

### ❌ Les 3 pires

**1. Conv `5559f33d` — IMC "30 ou plus" = éligible (FAUX)**
Le Coach a dit "tu es éligible" pour un IMC ≥ 30. Erreur factuelle grave, faux espoirs créés, contraire aux instructions explicites du system prompt.

**2. Conv `bed30ab9` — IMC 34,6 + comorbidités = éligible (FAUX)**
Même type d'erreur. IMC 34,6 < 35 → non éligible même avec hypertension + apnée. Le Coach a dit "probablement éligible".

**3. Conv `0bbe9a72` — Hallucinations en série**
Ville inventée ("Toulon"), prénom mal interprété ("Viale" = ville ?), incohérence tutoiement/vouvoiement. Conversation très confuse pour l'utilisateur.

---

*Rapport généré le 2026-06-28 par la routine de monitoring Coach IA.*
*Période analysée : 21–28 juin 2026 (7 jours). Données 24h : 0 message (ALERTE).*
