# Rapport Coach IA GLP-1 — 27 juin 2026

> Routine quotidienne exécutée à 12h00 Paris

---

## 🚨 ALERTE CRITIQUE : Silence du Coach depuis 4 jours

**Aucun message reçu depuis le 23 juin 2026.** Les journées 24, 25, 26 et 27 juin affichent 0 message, 0 conversation. Cela représente une rupture totale par rapport à une moyenne de ~60 messages/jour observée la semaine précédente.

**Cause probable** : dysfonctionnement de l'Edge Function `ai-coach`, du widget front-end, ou d'une règle CORS bloquant les requêtes en production.

**Action immédiate requise** : tester manuellement le Coach sur le site live et vérifier les logs Supabase de la fonction `ai-coach`.

---

## KPIs — 27 juin 2026 (J-1)

| Métrique | Aujourd'hui (24h) | Hier (48-24h) | J-4 (23 juin) |
|---|---|---|---|
| Messages total | **0** | **0** | 72 |
| Conversations | **0** | **0** | 13 |
| Messages / conv | — | — | 5,5 |
| Messages user | **0** | **0** | ~36 |
| Messages assistant | **0** | **0** | ~36 |

### Évolution sur 14 jours

| Date | Messages | Conv | Msg/conv |
|---|---|---|---|
| 23/06 | 72 | 13 | 5,5 |
| 22/06 | 56 | 12 | 4,7 |
| 21/06 | 32 | 6 | 5,3 |
| 20/06 | 50 | 9 | 5,6 |
| 19/06 | 78 | 14 | 5,6 |
| 18/06 | 66 | 12 | 5,5 |
| 17/06 | 38 | 8 | 4,8 |
| 16/06 | 60 | 10 | 6,0 |
| 15/06 | 102 | 18 | 5,7 |
| 14/06 | 36 | 7 | 5,1 |
| **24-27/06** | **0** | **0** | **—** |

**Pic le 15 juin** (jour du lancement du remboursement Wegovy/Mounjaro à 65 %). La tendance était stable (~60/jour) puis chute brutale à 0.

### Répartition modèles LLM (données 23 juin)

- `mistral-small-latest` : modèle principal (~60-70 % des échanges)
- `llama-3.3-70b-versatile` (Groq) : premier en chaîne, mais sature rapidement sur rate-limit → bascule Mistral
- `llama-3.1-8b-instant` (Groq) : non observé dans les conversations analysées

Groq 70B plafonne dès 1-2 échanges par conversation → Mistral prend le relais. Pas de `fallback-v1` détecté.

### Fraîcheur des données analytics

| Source | Dernière date | Statut |
|---|---|---|
| GA4 | 2026-06-26 | ✓ OK (1 jour) |
| GSC | 2026-06-24 | ✓ OK (3 jours, sous le seuil de 5j) |

---

## Analyse qualité (8 conversations du 23 juin)

*Source : toutes les conversations des dernières 24h disponibles — données du 23/06 car aucune donnée plus récente.*

### Résumé des conversations analysées

| conversation_id | Sujet | Msgs | Modèles | Score |
|---|---|---|---|---|
| `12af3ee8` | Produit douteux en pipette (arnaque) | 10 | Mistral | ✓ Bon |
| `5d80f042` | Prix Mounjaro Hérault / Agde / Montpellier | 10 | Groq + Mistral | ⚠ Partiel |
| `00dfb934` | "Je veux en acheter" (Wegovy) | 4 | Groq | ✗ Problème |
| `8aa02a94` | Prix Wegovy 0,5 à Apothical Serris | 6 | Mistral | ⚠ Partiel |
| `f8ac16ec` | Prix Mounjaro/Wegovy à Nice | 4 | Mistral | ✓ Bon |
| `0ae82ffe` | "A quoi sert le GLP-1" → éligibilité | 10 | Groq + Mistral | ⚠ Partiel |
| `30ebef2d` | Éligibilité + prix Trulicity/Rybelsus | 4 | Mistral | ⚠ Partiel |
| `df3ddd0a` | Documents pour remboursement pharmacie | 2 | Groq | ⚠ Partiel |

---

## Ce qui marche bien

1. **Gestion des cas d'arnaque** (conv `12af3ee8`) : le Coach a bien appliqué le protocole — question progressive sur le produit, le lieu d'achat, sans dramatiser. Ton empathique respecté.

2. **Redirection vers le remboursement** : sur 5 conversations mentionnant un prix, 4 ont bien enchaîné sur "Veux-tu vérifier si tu peux être remboursé à 65% ?". La règle CONTEXTE IMPORTANT est bien intégrée par Mistral.

3. **Prix corrects et à jour** : les fourchettes Mounjaro (~176-434 €), Wegovy (~147-350 €), Ozempic (~77 €) et le remboursement 65 % depuis le 15 juin 2026 sont systématiquement cités correctement par Mistral.

4. **Bascule LLM transparente** : le passage Groq → Mistral est invisible pour l'utilisateur ; la conversation continue sans rupture.

5. **Réponses courtes** : Mistral respecte la consigne 40-80 mots dans la plupart des échanges.

---

## Problèmes détectés

### [BLOQUANT] Confusion de produit — conv `00dfb934`

**Message user** : "Tu peux m'en trouver" (suite à "Je veux en acheter" [du Wegovy])  
**Réponse Coach** : "Pour trouver un endocrinologue qui prescrit **Mounjaro**, tu peux essayer Doctolib..."  
**Ce qu'il AURAIT DÛ répondre** : rester sur Wegovy, ne pas introduire Mounjaro sans raison. Ex : "Je ne peux pas te diriger vers une pharmacie directement — il faut une ordonnance. Pour Wegovy, ton médecin traitant ou un endocrinologue peut te prescrire le traitement. Tu veux les étapes ?"  
**Cause** : Groq llama-3.3-70b hallucine Mounjaro à la place de Wegovy dans le contexte de la conversation.

---

### [HAUT] Lien carte des prix manquant — conv `5d80f042`

**Message user** : "Agde" (en réponse à une demande de ville pour trouver Mounjaro moins cher)  
**Réponse Coach (Groq)** : "Pour trouver Mounjaro 10 mg à un bon prix à Agde, je te conseille de vérifier les prix dans les pharmacies de la ville. Veux-tu que je te donne le lien de la carte des prix en pharmacie pour que tu puisses comparer les prix à Agde ?"  
**Ce qu'il AURAIT DÛ répondre** : donner directement le lien `/outils/carte-prix-pharmacies/` sans poser la question intermédiaire. Le system prompt dit *"Ne réponds JAMAIS 'comparez vous-même' ou 'appelez les pharmacies'"* et *"donne TOUJOURS le lien de la carte des prix"*.  
**Cause** : Groq ne suit pas la règle "REQUÊTES LOCALES". Mistral la suit correctement (échange suivant "Montpellier").

---

### [HAUT] Répétition à l'identique sur "Oui" — conv `8aa02a94`

**Message user** : "Oui" (en réponse à "Veux-tu que je vérifie si tu peux être remboursé à 65% ?")  
**Réponse Coach** : répétition EXACTE du message précédent sur le prix Wegovy 0,5 mg (147 €, même texte)  
**Ce qu'il AURAIT DÛ répondre** : "Vérifions ensemble ! Quel est ton poids et ta taille ?" (lancement du test d'éligibilité)  
**Cause** : Mistral ne détecte pas que le "Oui" est une réponse à la question de remboursement et régénère le contexte prix à l'identique. Probablement un problème de prompt ou de récupération d'historique.

---

### [MOYEN] Test d'éligibilité non lancé correctement — conv `30ebef2d`

**Message user** : "Suis-je éligible au remboursement à 65% ?"  
**Réponse Coach** : a listé les conditions (IMC ≥ 35 avec comorbidité ou ≥ 40) puis demandé "As-tu déjà essayé une prise en charge nutritionnelle ?"  
**Ce qu'il AURAIT DÛ répondre** : selon le system prompt *"LANCE le test tout de suite. Réponse COURTE + demande sa 1re info : 'Vérifions ensemble ! Quel est ton poids et ta taille ?'"*  
**Cause** : Mistral liste les critères au lieu de lancer directement le mini-test. L'utilisateur quitte peut-être sans avoir été guidé.

---

### [MOYEN] Réponse hasty sur dosage Rybelsus avant clarification — conv `12af3ee8`

**Message user** : "quelle est la posologie de la solution buvable ?" (premier message suspect, potentiellement un faux GLP-1)  
**Réponse Coach** : a donné la posologie de Rybelsus (3 mg, 7 mg, 14 mg) en supposant que l'utilisateur parlait de Rybelsus  
**Ce qu'il AURAIT DÛ répondre** : demander d'abord *quel* produit l'utilisateur a en main — car une "solution buvable de GLP-1" est un signal d'arnaque potentiel. Donner une posologie sans savoir peut rassurer à tort.  
**Note** : le Coach a bien rattrapé l'erreur au message suivant ("j ai recu le glp-1 en pipette 5 dans une boite").

---

### [MOYEN] Information douteuse sur les documents de remboursement — conv `df3ddd0a`

**Message user** : "Qu'Elle document pour remboursement pharmacie"  
**Réponse Coach (Groq)** : mentionne "Le justificatif de prescription complété et signé par le médecin" comme document séparé de l'ordonnance  
**Problème** : l'ordonnance IS le justificatif de prescription. Il n'existe pas de "justificatif de prescription" distinct en pharmacie de ville. La réponse peut induire en erreur. Aussi, le Coach n'a pas demandé "pour quel médicament ?" (remboursement Wegovy/Mounjaro obésité vs Ozempic diabète = procédures différentes).

---

### [INFO] Aucune proposition de Dossier GLP-1 sur 8 conversations

Le Dossier GLP-1 Personnalisé (4,99 €) n'a été proposé dans **aucune** des 8 conversations du 23 juin, alors que plusieurs ont collecté des infos sur le poids/taille/éligibilité (conditions déclencheuses selon le system prompt). Taux de conversion funnel = 0 %.  
**Cause** : Mistral ne déclenche pas le `[[DOSSIER_READY]]` / la proposition même quand les données sont disponibles.

---

## Actions recommandées

### 1. [URGENT] Vérifier que le Coach est en ligne

```bash
# Tester l'Edge Function directement
curl -X POST https://ywekaivgjzsmdocchvum.supabase.co/functions/v1/ai-coach \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -d '{"session_id":"test-monitor-001","message":"Bonjour"}'
```

Vérifier aussi :
- Les logs Supabase Edge Functions (`supabase functions logs ai-coach`)
- Le widget `AiCoach.astro` est bien chargé sur le site live
- Les en-têtes CORS en production

**Hypothèse principale** : une mise à jour du site (deploy du 23-24 juin ?) a pu casser le widget ou les clés API.

---

### 2. [HAUT] Correction système : Groq n'applique pas les règles REQUÊTES LOCALES

**Problème** : llama-3.3-70b oublie le lien `/outils/carte-prix-pharmacies/` sur les requêtes locales (ville).

**Fix recommandé dans le system prompt** — renforcer la règle avec le chemin exact DANS la règle principale (actuellement dans "REQUÊTES LOCALES" séparé) :

```diff
RÈGLES ABSOLUES :
+14. Quand quelqu'un donne une ville pour trouver un prix en pharmacie, réponds TOUJOURS avec ce lien exact : [Carte des prix en pharmacie](/outils/carte-prix-pharmacies/) — ne pose JAMAIS la question "veux-tu le lien ?" avant de le donner.
```

---

### 3. [HAUT] Correction système : éviter la répétition sur "Oui"

**Problème** : quand l'historique contient une question "Veux-tu que je vérifie ton éligibilité ?" et que l'utilisateur répond "Oui/oui", le Coach régénère le message précédent.

**Fix recommandé** :

```diff
FLUX "SUIS-JE ÉLIGIBLE AU REMBOURSEMENT ?" :
-⚠️ Si quelqu'un demande "suis-je éligible ?" : ne liste JAMAIS les critères en bloc — LANCE le test tout de suite.
+⚠️ Si quelqu'un demande "suis-je éligible ?" OU répond "oui" à ta proposition de vérifier l'éligibilité : LANCE le test immédiatement. Réponse : "Vérifions ensemble ! Quel est ton poids et ta taille ?" — ne répète JAMAIS les informations déjà données dans le message précédent.
```

---

### 4. [MOYEN] Renforcer la détection de confusion de produit (Groq)

Ajouter dans le system prompt :

```diff
RÈGLES ABSOLUES :
+15. Ne cite JAMAIS un médicament différent de celui mentionné par l'utilisateur, sauf pour une comparaison explicitement demandée. Si l'utilisateur parle de Wegovy, réponds sur Wegovy. Si l'utilisateur parle de Mounjaro, réponds sur Mounjaro.
```

---

### 5. [MOYEN] Améliorer la conversion Dossier GLP-1

Modifier la règle de déclenchement pour la rendre plus agressive :

```diff
CONVERSION — DOSSIER GLP-1 PERSONNALISÉ (4,99€) :
-QUAND proposer : dès que tu as collecté poids + taille + comorbidités
+QUAND proposer : dès que tu as l'IMC (poids + taille) OU dès qu'un utilisateur a mentionné chercher un médecin / préparer une consultation / vouloir commencer un traitement. N'attends pas d'avoir TOUTES les infos pour proposer.
```

---

### 6. [MINEUR] Corriger la réponse sur les documents de remboursement

Mettre à jour le fallback intent `price` ou ajouter un pattern `document|justificatif|papier.*remboursement` avec une réponse correcte :

```
Documents pour le remboursement en pharmacie :
1. L'ordonnance de ton médecin (= aussi le justificatif de prescription)
2. Ta carte Vitale à jour
3. Ta carte de mutuelle (si tu veux la prise en charge complémentaire)

Pour Wegovy/Mounjaro (remboursement obésité 65 %), l'ordonnance doit préciser le dosage et l'indication. La primo-prescription vient d'un CSO/CHU.
```

---

### 7. [NOUVEAU CONTENU] Articles à créer basés sur les questions sans bonne réponse

- **"Documents nécessaires pour le remboursement Wegovy/Mounjaro en pharmacie"** — question fréquente, réponse incomplète actuellement
- **"GLP-1 en gélules ou en pipette : arnaque ou complément alimentaire ?"** — la conv `12af3ee8` montre un besoin réel et distinct
- **"Trouver un endocrinologue ou CSO près de chez moi"** — guide par région avec annuaire Ameli

---

## Conversations marquantes

### Les 3 meilleures (23 juin)

**1. `f8ac16ec`** — Simple, propre, efficace  
2 questions précises (prix général, prix Nice Mounjaro 5 mg), 2 réponses Mistral directes avec chiffres corrects + relance remboursement. Durée courte, engagement fort. Modèle à suivre.

**2. `12af3ee8`** — Gestion exemplaire d'un cas d'arnaque  
Protocole anti-arnaque bien suivi : questions progressives, ton rassurant, information factuelle sur les contrefaçons. Le Coach ne pas sauté aux conclusions. Correction partielle d'une erreur initiale (posologie Rybelsus donnée trop tôt).

**3. `0ae82ffe`** — Parcours complet de l'ignorance à l'éligibilité  
L'utilisateur est passé de "A quoi sert le GLP-1 ?" à la vérification de son éligibilité en 5 échanges. Bonne progression guidée malgré le changement de modèle (Groq → Mistral à mi-conversation).

### Les 3 pires (à corriger)

**1. `00dfb934`** — Confusion produit (Wegovy → Mounjaro) 🔴  
Groq a substitué Mounjaro à Wegovy sans raison. Erreur factuelle qui mine la confiance.

**2. `8aa02a94`** — Répétition à l'identique sur "Oui" 🔴  
L'utilisateur a explicitement dit "Oui" pour l'éligibilité et le Coach a répété le prix Wegovy. Opportunité de conversion manquée ; l'utilisateur a dû relancer "Merci" pour obtenir la suite.

**3. `30ebef2d`** — Test d'éligibilité mal lancé 🟡  
Le Coach a listé les critères au lieu de lancer directement "Quel est ton poids et ta taille ?". Friction supplémentaire, risque d'abandon.

---

## Checklist de suivi

- [ ] **URGENT** : Tester le Coach en production aujourd'hui (curl ou visite manuelle du site)
- [ ] Vérifier les logs Edge Function `ai-coach` dans Supabase
- [ ] Identifier le commit/deploy du 23-24 juin qui a précédé le silence
- [ ] Appliquer les corrections au system prompt (règles 14 et 15, flux éligibilité)
- [ ] Vérifier que le Dossier GLP-1 est proposé dans les prochaines conversations testées

---

*Rapport généré automatiquement — routine coach-daily · 2026-06-27*
