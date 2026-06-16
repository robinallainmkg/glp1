# Rapport Coach IA GLP-1 — 16 juin 2026

## KPIs des dernières 24h

| Métrique | Valeur | vs veille |
|---|---|---|
| Messages totaux | 58 | ↓ -12% (vs 66 hier) |
| Conversations | 11 | — |
| Messages utilisateur | 29 | — |
| Messages assistant | 29 | — |
| Messages / conversation (moy.) | 5,3 | — |
| Durée moy. conversations actives | ~2:51 (6 conv. >2 msgs) | — |

### Répartition LLM

| Modèle | Messages | % |
|---|---|---|
| mistral-small-latest | 21 | 72,4% |
| llama-3.3-70b-versatile | 8 | 27,6% |
| fallback-v1 | 0 | 0% |

**100% LLM, 0% fallback** — tous les messages ont traversé le pipeline Groq/Mistral.

### Intent breakdown

`intent = NULL` pour 100% des messages assistant → normal (l'intent n'est renseigné qu'en cas de fallback ou signal arnaque).  
**Action requise** : pas de visibilité sur les sujets des questions. Voir recommandation #5.

### Engagement par conversation

| conversation_id | Msgs | Durée |
|---|---|---|
| 55b6ad9e (Cerfa Wegovy) | 10 | 4:19 |
| 7e1cd398 (Ordonnance Mounjaro) | 10 | 1:59 |
| c96de707 (Prix Wegovy) | 10 | 1:22 |
| bf505881 (Stock Perpignan) | 8 | 6:38 |
| 0a2cfe82 (Remboursement + apnée) | 6 | 2:31 |
| 607484e7 (Prix Mounjaro 2,5mg) | 4 | 0:20 |
| 5 conversations | 2 chacune | 0s |

---

## Ce qui marche bien

1. **Zéro fallback** : le pipeline LLM tient, Mistral prend le relais sur Groq sans interruption visible.
2. **Flow remboursement conv 0a2cfe82** : exemple parfait — Coach collecte IMC (35,7), identifie les comorbidités (apnée + cholestérol), donne un verdict clair, propose la checklist email au bon moment.
3. **Réponse Wegovy vs Mounjaro (d5e9b5da)** : concise, mécanisme GLP-1/GIP expliqué correctement, call-to-action adapté.
4. **Pharmacie locale (afa4b0e3)** : redirection immédiate vers `/outils/carte-prix-pharmacies/` + demande de ville — suit exactement le system prompt.
5. **Info remboursement 15 juin 2026** : précise et cohérente dans toutes les conversations.
6. **Mistral suit bien le format** : réponses brèves, ton tutoiement/vouvoiement cohérent, relance unique en fin de message.

---

## Problèmes détectés

### 🔴 CRITIQUE — Erreur d'éligibilité IMC (conv `7e1cd398`)

**User :** "76kg et 158cm"  
**Coach a répondu :** "Ton IMC est de **30,4**. Avec un IMC ≥ 30, tu es éligible au remboursement à 65% pour Mounjaro."  
**Ce qu'il AURAIT DÛ répondre :** IMC 30,4 NE remplit PAS le critère (≥ 35 avec comorbidité ou ≥ 40). Le Coach aurait dû dire : "Ton IMC est de 30,4. Pour le remboursement Mounjaro obésité, il faut un IMC ≥ 35 avec une comorbidité (ex. diabète T2, hypertension, apnée du sommeil) ou ≥ 40. As-tu une comorbidité reconnue ? Sinon, une consultation avec ton médecin permettra de définir la meilleure approche."

**Risque :** Utilisateur se rend en CSO/CHU convaincu d'être remboursé → déception, perte de confiance.

---

### 🔴 CRITIQUE — RAG contamination "stylo 3ml Ozempic" (convs `7e1cd398`, `bf505881`)

Dans deux conversations sans lien, le Coach a injecté : *"Le changement de présentation (stylo 3 ml) ne nécessite pas de nouvelle ordonnance pour Ozempic, donc ton ordonnance actuelle est toujours valide."*

- **Conv 7e1cd398** : user sous Mounjaro, jamais mentionné Ozempic. L'info sur le stylo 3ml est hors-sujet et fausse une réponse par ailleurs correcte.
- **Conv bf505881** : user cherche Wegovy en pharmacie, aucune ordonnance Ozempic mentionnée.

**Cause probable :** Un chunk RAG sur l'évolution du stylo Ozempic 3ml remonte avec un score borderline (~0.65-0.70) sur les requêtes contenant "ordonnance" et contamina la réponse.  
**Fix suggéré :** Abaisser `RAG_THRESHOLD` à 0.72 pour ce type de fragment, ou filtrer les chunks sur la pertinence du médicament évoqué dans le message.

---

### 🟠 INFO CONTRADICTOIRE — Cerfa Wegovy (conv `55b6ad9e`)

**Tour 2 (assistant) :** "Le Cerfa 14046*02 est requis pour la primo-prescription de Wegovy en CSO/CHU."  
**Tour 3 (assistant) :** "Pour Wegovy, il n'y a **pas** de Cerfa spécifique à remplir."

Deux réponses contradictoires sur la même question au sein de la même conversation. L'utilisateur ne sait pas quoi croire.  
**Ce qu'il faut dire :** Il n'existe pas de Cerfa spécifique pour Wegovy. La primo-prescription en CSO/CHU se base sur un dossier médical (IMC, comorbidités, échec prise en charge nutritionnelle), pas un formulaire Cerfa.

---

### 🟠 RÉPÉTITION SUR "OUI" — Flow interrompu (conv `607484e7`)

**User :** "Quel est le prix de mounjaro 2,5 mg ?"  
**Coach :** "~230€/mois. Veux-tu voir si tu peux être remboursé à 65% ?"  
**User :** "Oui"  
**Coach :** [Réponse identique] "Le prix de Mounjaro 2,5 mg est d'environ 230€. Veux-tu voir si tu peux être remboursé à 65% ?"

Le Coach a ignoré le "Oui" et répété la même réponse au lieu de démarrer le flow IMC. Abandon probable (0:20 de durée totale).  
**Cause :** Groq/llama ne contextualise pas suffisamment le "Oui" comme confirmation → il régénère la réponse précédente.

---

### 🟠 PREMIÈRE RÉPONSE TROP VAGUE (conv `7e1cd398`)

**User :** "je suis déjà sous mounjaro, est-ce que mon ordonnance avant remboursement est valide ?"  
**Coach (Groq) :** "il est important de consulter votre médecin pour discuter de la validité de votre ordonnance actuelle..."

Le system prompt interdit de renvoyer au médecin sans répondre d'abord. La réponse correcte directe : "Oui, ton ordonnance Mounjaro reste valable (généralement 3 mois pour les chroniques). Pour bénéficier du remboursement à 65%, ton médecin devra renouveler l'ordonnance en précisant l'indication obésité. Veux-tu qu'on vérifie ton éligibilité ?"

---

### 🟡 LIEN CARTE PRIX TARDIF (conv `c96de707`)

3 échanges avant que le Coach fournisse `/outils/carte-prix-pharmacies/`. Le system prompt stipule que c'est **"la 1re cause d'abandon"** et que le lien doit être donné immédiatement. Les 3 premiers tours (Groq) ont dit "comparez vous-même" ou "les prix varient" sans lien.

---

### 🟡 FORMAT [[SUGGESTIONS]] NON RESPECTÉ PAR GROQ (convs `68b02dc3`, `4832511e`)

Le Coach doit finir par `[[SUGGESTIONS]] Oui | Non` mais Groq/llama génère à la place :
- `• GLP-1 France est indépendant | Oui, c'est ça | Non, je me trompe`
- `• Oui, vérifions | Plus tard`

Le parsing côté Edge Function cherche `[[SUGGESTIONS]]` en regex et ne le trouve pas → les suggestions apparaissent comme du texte brut dans le chat. Visuellement dégradé.

---

### 🟡 CONFUSION UTILISATEUR SUR L'IDENTITÉ DU SITE (conv `bf505881`)

Deux messages consécutifs traitent GLP-1 France comme une pharmacie : "avez-vous en stock", "proposez-vous un service de livraison". Le Coach répond correctement mais pourrait être plus direct dès le 1er message : "GLP-1 France est un site d'information — nous ne vendons ni ne livrons de médicaments. Voici comment trouver Wegovy près de chez vous..."

---

## Actions recommandées

### 1. Fix critique : règle IMC dans le system prompt

Ajouter dans la section **FLUX "SUIS-JE ÉLIGIBLE AU REMBOURSEMENT ?"** :

```diff
- Puis donne un verdict CLAIR et nuancé : "éligible", "probablement éligible", ou "à confirmer avec ton médecin" — en rappelant que la décision finale revient au médecin (critères : IMC ≥ 35 avec comorbidité, ou ≥ 40, après échec d'une prise en charge nutritionnelle).
+ Puis donne un verdict CLAIR et nuancé selon l'IMC calculé :
+   - IMC ≥ 40 → "très probablement éligible" (même sans comorbidité)
+   - IMC 35–39,9 + comorbidité confirmée (diabète T2, HTA, apnée du sommeil…) → "éligible"
+   - IMC 35–39,9 sans comorbidité mentionnée → "peut-être éligible, à confirmer selon comorbidités"
+   - IMC < 35 → "l'IMC actuel (X) ne remplit pas encore le critère de remboursement (≥ 35 avec comorbidité ou ≥ 40). Parles-en à ton médecin."
+   ⚠️ RÈGLE ABSOLUE : ne dis JAMAIS qu'un IMC < 35 ouvre droit au remboursement obésité.
```

### 2. Fix RAG contamination — seuil de similarité

Dans `index.ts`, ligne 14 :
```diff
- const RAG_THRESHOLD = 0.65;
+ const RAG_THRESHOLD = 0.72;
```

Cela éliminera les chunks borderline (stylo 3ml Ozempic, etc.) qui contaminent des réponses sur d'autres médicaments.

### 3. Fix Cerfa — ajouter note dans le system prompt

Ajouter dans **CONTEXTE IMPORTANT** :
```diff
+ - CERFA : Il n'existe pas de formulaire Cerfa spécifique à remplir pour Wegovy ou Mounjaro. La primo-prescription en CSO/CHU repose sur un dossier médical (IMC, comorbidités, échec prise en charge nutritionnelle), pas sur un Cerfa. Le Cerfa concernait uniquement la prescription hors AMM de GLP-1 pour le diabète T2.
```

### 4. Renforcer l'instruction [[SUGGESTIONS]] pour Groq

Le modèle llama-3.3-70b ne respecte pas le format. Ajouter en fin de règle 91 du system prompt :
```diff
- À la TOUTE FIN de CHAQUE réponse, propose des choix cliquables, au format EXACT...
+ À la TOUTE FIN de CHAQUE réponse, propose des choix cliquables. Tu DOIS utiliser EXACTEMENT les balises [[SUGGESTIONS]] ou [[OPTIONS]] — aucun autre format (pas de tirets, pas de bullets "•"). Exemple EXACT :
+ [[SUGGESTIONS]] Oui, vérifions | Plus tard
+ Si tu n'utilises pas [[SUGGESTIONS]] ou [[OPTIONS]], les boutons n'apparaissent pas.
```

### 5. Ajouter tracking intent côté LLM

Le champ `intent` est null pour 100% des réponses LLM, ce qui aveugle le monitoring. Options :
- Ajouter une instruction au system prompt pour que le LLM indique l'intent dans une balise `[[INTENT:prix]]` parsée côté Edge Function
- Ou classifier post-hoc via la table `coach_messages` (job Supabase scheduled)

### 6. Nouveaux articles suggérés

Basé sur les conversations sans bon article de référence :
- **"Mon ordonnance Mounjaro/Wegovy est-elle toujours valable après le remboursement ?"** — question très fréquente, article dédié manquant
- **"Où trouver Wegovy ou Mounjaro en pharmacie à [ville] ?"** — pages locales (Perpignan, etc.) pour le SEO local + Coach
- **"Cerfa GLP-1 : ce qui est vraiment demandé en 2026"** — clarifier la confusion Cerfa diabète vs remboursement obésité

---

## Conversations marquantes

### Les 3 meilleures

**1. `0a2cfe82` — Flow remboursement exemplaire (6 msgs, 2:31)**  
Utilisateur avec apnée + cholestérol, 20kg déjà perdus avec Mounjaro. Coach collecte IMC (35,7), identifie comorbidités, donne verdict clair "éligible 65%", propose checklist email. Excellent.

**2. `d5e9b5da` — Comparatif Wegovy/Mounjaro (2 msgs)**  
Question simple, réponse concise et précise sur le double mécanisme GLP-1+GIP, différence d'efficacité ~5-7%, call-to-action adapté. Parfait en 1 échange.

**3. `bf505881` — Gestion utilisateur confus (8 msgs, 6:38)**  
Utilisateur qui pense contacter une pharmacie. Le Coach recadre correctement (pas de vente), fournit le lien carte des prix adapté à Perpignan, reste utile malgré la confusion initiale. Longue conversation bien gérée (hors problème stylo 3ml).

### Les 3 pires

**1. `7e1cd398` — Erreur IMC critique (10 msgs, 1:59)**  
Deux problèmes majeurs : première réponse vague (renvoie au médecin sans répondre), puis confusion Ozempic/Mounjaro injustifiée, et surtout IMC 30,4 déclaré "éligible" au remboursement → information médicale fausse.

**2. `c96de707` — Lien carte prix donné 3 exchanges trop tard (10 msgs, 1:22)**  
Groq répète "les prix varient, comparez" au lieu de donner immédiatement le lien. La règle anti-abandon du system prompt n'est pas suivie. Conversation se termine avec l'utilisateur qui donne sa ville mais sans réponse visible.

**3. `607484e7` — "Oui" ignoré, flow interrompu (4 msgs, 0:20)**  
L'utilisateur dit "Oui" pour démarrer le flow éligibilité mais le Coach lui répète la réponse précédente (prix). Abandon probable après 20 secondes.

---

*Rapport généré automatiquement le 16/06/2026 — Monitoring Coach IA GLP-1 France*
