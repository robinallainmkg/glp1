# Coach IA — Rapport Quotidien 2026-06-09

_Généré automatiquement — données de 09/06/2026 00:00 à 23:59 UTC_

---

## KPIs

| Métrique | Valeur | vs Veille |
|---|---|---|
| Messages totaux | 52 | +22 (+73%) ↑↑ |
| Conversations | 8 | — |
| Messages utilisateur | 26 | — |
| Messages assistant | 26 | — |
| Msgs par conversation | 6,5 (médiane 7) | — |
| Durée moy. conv. (>2 msgs) | ~1min 05s | — |
| LLM (llama-3.3-70b) | 21 / 26 = **80,8%** | — |
| Fallback-v1 | 5 / 26 = **19,2%** | — |

> **Signal positif** : +73% de volume en 24h — probablement lié au remboursement annoncé au 15 juin qui approche (J-6).

### Breakdown par intent (assistant)
| Intent | Nb |
|---|---|
| null (LLM, intent non forcé) | 21 |
| general (fallback générique) | 5 |

---

## Ce qui marche bien

- **Flux d'éligibilité** : Le Coach propose systématiquement la vérification en 2-3 questions et collecte poids/taille de manière fluide.
- **Calcul IMC correct** : dans la conv. `9c2eea74`, IMC 38,5 calculé correctement → verdict d'éligibilité juste.
- **Refus des "médecins partenaires"** (conv. `eeb7ade6`) : Le Coach refuse de recommander des services commerciaux tout en restant utile, en orientant vers annuaire-sante.ameli.fr. Très bon.
- **Plateau de poids** (conv. `c50d36e3`) : Réponse empathique, non alarmiste, bien calibrée sur le plan médical.
- **Gestion des messages tests/provocateurs** (conv. `be39a82f`) : Quand l'utilisateur demande plusieurs fois "donne ta ville", le Coach explique calmement qu'il est un assistant virtuel sans localisation — comportement robuste.
- **Connaissance du remboursement** : Toutes les réponses LLM mentionnent correctement la date du 15 juin 2026 et le taux de 65%.

---

## Problèmes détectés

### 🔴 Problème 1 — Fallback déclenché au milieu du flow d'éligibilité (critique)

**Conversations concernées** : `91aac1fd`, `93e97e8d`

Le LLM plante sur des messages **courts et contextuels** ("Oui, j'ai des comorbidités", "104 kg") en milieu de conversation. Le fallback prend le relais mais, n'ayant **aucun contexte**, répond avec le message générique inutile.

**Conv `91aac1fd` — le cas le plus grave** :
> User (17:44:32): **"Oui, j'ai des comorbidités"**
> Coach (fallback): _"Je n'ai pas pu traiter votre question en détail pour le moment. Pouvez-vous la reformuler ou préciser votre situation ? Par exemple : Quel traitement vous concerne (Ozempic, Wegovy, Mounjaro...) ?…"_

> User (17:44:40): **"Spondylarthrite ankylosante"**
> Coach (fallback): _[même réponse générique]_

**Ce qu'il aurait dû répondre** :
> "La spondylarthrite ankylosante peut être prise en compte parmi les comorbidités liées au poids. Avec votre IMC de 32,9, vous êtes légèrement sous le seuil de 35. Avez-vous suivi un accompagnement nutritionnel pendant au moins 6 mois sans résultat suffisant ? C'est la troisième condition."

**Cause probable** : Groq rate-limit ou erreur Mistral embed sur des messages courts — le fallback est immédiat sans retry.

---

### 🔴 Problème 2 — Erreur sur le seuil IMC (information médicale incorrecte)

**Conversation** : `93e97e8d`

> Coach (08:36:11): _"Vous devez avoir un IMC d'au moins **35 kg/m²** ou un IMC d'au moins **30 kg/m²** avec au moins une comorbidité…"_

**Le seuil de 30 est FAUX.** Le system prompt stipule clairement IMC ≥ 35 avec comorbidité, ou IMC ≥ 40. Le LLM a halluciné le seuil de 30, ce qui pourrait créer de faux espoirs chez des patients inéligibles (IMC entre 30 et 35 sans comorbidité suffisante). C'est une erreur médicale potentiellement préjudiciable.

**Ce qu'il aurait dû répondre** :
> "Pour être éligible au remboursement à 65%, vous devez avoir un IMC d'au moins **35** avec au moins une comorbidité (diabète T2, hypertension, apnée du sommeil…), ou un IMC d'au moins **40** sans comorbidité…"

---

### 🟡 Problème 3 — Fallback sur question technique d'injection légitime

**Conversation** : `5c905820`

> User (18:56:08): **"faut il enlever une bulle d'air avant"** (suite à une question sur comment injecter Mounjaro)
> Coach (fallback): _"Je n'ai pas pu traiter votre question en détail…"_

La question est 100% légitime et mérite une vraie réponse. Avec un auto-injecteur pré-rempli (stylo Mounjaro), il est **inutile de chasser les bulles d'air** — le stylo est conçu pour cela, contrairement aux seringues traditionnelles.

**Ce qu'il aurait dû répondre** :
> "Non, avec un stylo auto-injecteur pré-rempli comme Mounjaro, il n'est pas nécessaire de chasser les bulles d'air — le mécanisme du stylo gère cela automatiquement. Contrairement aux seringues traditionnelles, il suffit de vérifier que l'aiguille est bien fixée et de sélectionner la dose."

---

### 🟡 Problème 4 — Réponse redondante (double exposition des critères)

**Conversation** : `9c2eea74`

Après "Vérifions les conditions", le Coach répète l'intégralité des critères d'éligibilité qu'il venait juste de donner dans le message précédent. Résultat : deux messages successifs avec les mêmes informations (IMC ≥ 35, comorbidités, 6 mois suivi nutritionnel…). Cela alourdit la conversation sans apporter de valeur.

**Ce qu'il aurait dû répondre** (court) :
> "Parfait. Commençons par ton poids et ta taille pour calculer ton IMC ?"

---

## Actions recommandées

### 1. Retry sur erreur LLM (priorité : haute)

Ajouter 1 retry avec délai court (500 ms) avant de basculer sur le fallback. La majorité des fallbacks semblent être des erreurs transitoires (rate limit Groq ou timeout Mistral).

```typescript
// Dans le bloc catch du LLM (ligne ~672)
} catch (llmError) {
  // Retry once before fallback
  try {
    await new Promise(r => setTimeout(r, 500));
    // ... re-run LLM call (extraire en fonction)
  } catch (_retryError) {
    // Fallback v1 si retry échoue aussi
    console.error("LLM error (after retry), falling back to v1:", llmError);
    const fallback = classifyAndRespond(cleanMessage);
    ...
  }
}
```

### 2. Fallback contextuel (priorité : haute)

Quand le fallback générique `intent: "general"` est sur le point de répondre, vérifier si une conversation est en cours. Si `historyMessages.length > 0`, substituer le message générique par :

```typescript
// Ligne ~222 dans classifyAndRespond
// Fallback générique → version contextuelle si conversation en cours
const FALLBACK_CONTEXTUAL = "Je veux m'assurer de bien comprendre ta situation. Peux-tu me donner un peu plus de détail — par exemple ton traitement actuel, ton IMC, ou la question précise qui te préoccupe ?";
const FALLBACK_GENERIC = "Je n'ai pas pu traiter votre question en détail...";
// → passer hasHistory en paramètre et choisir selon le cas
```

### 3. Renforcer le system prompt sur le seuil IMC (priorité : haute)

Ajouter une ligne explicite dans `SYSTEM_PROMPT` pour ancrer le seuil correct :

```diff
- sous conditions (IMC ≥ 35 avec comorbidité ou IMC ≥ 40, après échec...)
+ sous conditions (IMC ≥ 35 kg/m² avec ≥1 comorbidité, OU IMC ≥ 40 kg/m² sans comorbidité — JAMAIS IMC 30)
+ ⚠️ NE JAMAIS citer un seuil de 30 ou 32 pour le remboursement obésité GLP-1 — c'est incorrect.
```

### 4. Ajouter un pattern "injection technique" au fallback v1 (priorité : moyenne)

```typescript
{
  intent: 'injection',
  pattern: /bulle.*air|air.*bulle|aiguille|inject|piqu|site.*injection|rotation.*site|abdomen|cuisse|bras/i,
  response: "Avec un stylo auto-injecteur pré-rempli (Ozempic, Wegovy, Mounjaro), vous n'avez pas besoin de chasser les bulles d'air — le mécanisme du stylo gère cela automatiquement.\n\nSites d'injection recommandés : abdomen (zone péri-ombilicale), cuisse, ou haut du bras. Pratiquez une rotation des sites à chaque injection pour éviter les lipodystrophies.\n\nSi l'aiguille est bloquée ou le stylo ne fonctionne pas, contactez votre pharmacien."
},
```

> ⚠️ Ce pattern doit être inséré **avant** le pattern `device` dans `INTENT_PATTERNS` pour éviter les conflits.

### 5. Suggestion de nouvel article

Les utilisateurs posent régulièrement des questions pratiques sur la technique d'injection (bulle d'air, rotation des sites, gestion du froid…) qui ne sont pas bien couvertes. Suggéré :

- **"Bien injecter son traitement GLP-1 : guide complet"** — collection `traitements-glp1`  
  Topics : comment tenir le stylo, chasser ou pas les bulles d'air, sites d'injection et rotation, douleur minimale, que faire si le stylo est bloqué.

---

## Conversations marquantes

### Les 3 meilleures

**1. `eeb7ade6` — Refus propre d'une demande commerciale**  
L'utilisateur demande des "médecins partenaires". Le Coach refuse élégamment ("je ne peux pas te proposer des médecins partenaires") sans être sec, puis oriente vers les ressources officielles et adapte la réponse à Paris. Parfait alignement éthique + utilité.

**2. `c50d36e3` — Plateau de poids géré avec empathie**  
"14,5 kg depuis janvier, plus de perte depuis 3 semaines." Le Coach félicite, normalise le plateau, explique l'adaptation au dosage, et renvoie au médecin sans dramatiser. Ton et contenu exemplaires.

**3. `9c2eea74` — Flow d'éligibilité complet et concluant**  
La conversation la plus complète : l'utilisateur déjà sous Mounjaro depuis mars cherche à savoir s'il sera remboursé. Le Coach guide proprement jusqu'au calcul d'IMC (38,5 → éligible), verdict clair. 1 min 58s d'engagement.

### Les 3 pires

**1. `91aac1fd` — Rupture brutale du flow (fallback ×2)**  
Le fallback coupe la conversation en plein milieu du test d'éligibilité sur des réponses simples ("Oui, j'ai des comorbidités" / "Spondylarthrite ankylosante"). L'utilisateur se retrouve avec le message "reformulez votre question" après avoir consciencieusement suivi les instructions du Coach. Très mauvaise expérience utilisateur.

**2. `93e97e8d` — Erreur IMC + fallbacks sur données numériques**  
Double problème : (1) IMC ≥ 30 cité à tort, (2) fallbacks sur "104 kg" et "Donnes ton poids". L'utilisateur donne ses données et n'obtient pas de réponse. Ce pattern se retrouve dans plusieurs conversations.

**3. `5c905820` — Question technique sans réponse**  
"Faut-il enlever une bulle d'air avant ?" est une question de sécurité légitime pour un nouveau patient. Réponse fallback générique = zéro valeur ajoutée, risque que l'utilisateur cherche sur des forums non fiables.

---

_Rapport généré le 2026-06-09. Prochaine action recommandée : déployer le retry LLM + pattern injection avant la mise en remboursement du 15 juin (J-6, pic de trafic attendu)._
