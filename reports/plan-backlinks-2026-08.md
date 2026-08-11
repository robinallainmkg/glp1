# Plan Backlinks GLP-1 France — lancé le 10/08/2026 (demande Robin : « crée un plan de backlinking, fais-le »)

**Problème** : autorité domaine quasi nulle post-suspension (24/06→04/07), zéro netlinking actif, positions volatiles sur les requêtes tête (crash « mounjaro prix » 17→64 le 08/08). Le contenu seul ne suffira pas à remonter le trafic.

**Objectif** : obtenir des liens éditoriaux depuis des sites santé/thermalisme/presse FR, en s'appuyant sur nos actifs gratuits. JAMAIS d'achat de liens, jamais de PBN, max 5 emails/jour, tout personnalisé.

**KPIs (suivis à chaque routine)** :
- Réponses outreach : `email_replies` (category `backlink_outreach`) vs `incoming_emails`
- Sessions referral dans `ga_metrics` (source ≠ organic/direct)
- Liens constatés (vérification manuelle des cibles ayant répondu oui)
- Effet final : positions des requêtes tête + recovery GSC

## Actifs « linkables » (ce qu'on pitche)

1. **Test d'éligibilité gratuit** (`/outils/test-eligibilite/`) — verdict selon les critères officiels, sans inscription. L'argument n°1 pour les associations de patients.
2. **Carte des prix en pharmacie** (`/outils/carte-prix-pharmacies/`) — 20 040 pharmacies FINESS, prix officiels BDPM. Unique en France.
3. **Guides parcours de soins** (qui peut prescrire, délais CSO/CHU, suivi 6 mois documenté) — le trio que cherchent les patients depuis le remboursement du 15/06.
4. **Cluster retraites/cures thermales** — comparatifs sourcés (stations agréées, FFJR, Vittel/Capvern/Contrexéville) : angle réciprocité avec les sites thermalisme qu'on cite déjà.
5. **[À CRÉER — action A1, veto 24h]** Page « Statistiques GLP-1 France 2026 » : chiffres citables sourcés (1 M d'éligibles, 41 CSO, prix officiels par molécule, remboursement 65 %…). Les pages stats sont les plus liées par la presse. Si pas de veto Robin d'ici le 11/08, la routine la crée.

## Vagues d'outreach

### V1 — Associations de patients (FAIT le 10/08, emails envoyés, category `backlink_outreach`)
| Cible | Contact | Statut | Angle |
|---|---|---|---|
| Ligue nationale Contre l'Obésité | contact@liguecontrelobesite.org (vérifié) | **Envoyé 10/08** | Test éligibilité + guides parcours pour leurs 9 000 membres ; réciprocité : nous les recommandons désormais dans nos guides parcours |
| CNAO (Collectif National des Associations d'Obèses) | contact@cnao.fr (vérifié) | **Envoyé 10/08** | Idem + carte prix pharmacies |

Réciprocité actée le 10/08 : liens éditoriaux vers LCO et CNAO ajoutés dans l'article délais CSO/CHU (aide à l'orientation des patients — utile au lecteur indépendamment de l'outreach).

### V2 — Thermalisme / retraites (réciprocité : on les cite déjà) — à dérouler 11-14/08
| Cible | Contact | Angle |
|---|---|---|
| lescuristes.fr | formulaire (page /contact en 404, chercher le bon endpoint) | On cite leurs avis Maâthermes dans notre comparatif Vittel/Capvern/Contrexéville |
| officiel-thermalisme.com | à trouver | Cité dans notre comparatif (tarifs Capvern) |
| location-cure.net | à trouver | Cité dans cure-thermale-obesite (liste 14 stations) |
| leguideduthermalisme.fr | à trouver | Échange de ressources cure thermale obésité |
| cure-thermale-france.fr | à trouver | Blog annuaire, page Luchon → notre article stations agréées |
| FFJR | formulaire ffjr.com/contact | Notre comparatif des organisateurs labellisés les met en avant |
| Offices de tourisme Brides-les-Bains / Vittel | à trouver | Nos pages avis/prix sur leurs stations |

### V3 — Écosystème santé/obésité — à dérouler 15-20/08
| Cible | Contact | Angle |
|---|---|---|
| expertisesobesites.org | formulaire /contact/ | Leur carte de ressources invite à signaler de nouvelles ressources |
| obesitefrance.fr (GCC CSO) | à trouver | Nos guides expliquent le parcours CSO aux patients |
| France Assos Santé | à trouver | Ressource outil éligibilité |
| Associations locales obésité (via la carte expertisesobesites) | à qualifier | Pitch V1 dupliqué, ton local |

### V4 — Digital PR / presse (dès que la page Statistiques existe)
- Data story : « Combien coûte un mois de Mounjaro dans votre département ? » (notre dataset pharmacies + prix officiels) → PQR (presse quotidienne régionale) + rubriques santé.
- Data story : « 1 million d'éligibles, 41 centres : le goulot d'étranglement du remboursement » (chiffres sourcés IQVIA/AP-HP déjà dans nos articles).
- Cibles : à constituer (20 rédactions santé/PQR), APRÈS validation de la page Statistiques.

## Règles
- Max 5 emails/jour, personnalisés, envoyés via `send-feedback-email` (tracés `backlink_outreach`).
- Une relance unique à J+7, jamais plus.
- STOP-check `incoming_emails` avant toute relance.
- Jamais de lien acheté, jamais d'échange de liens massif (la réciprocité éditoriale ponctuelle et utile au lecteur est OK).
- Chaque routine : vérifier les réponses (`incoming_emails`), mettre à jour les statuts de ce fichier, dérouler la vague suivante.

## EN ATTENTE ROBIN
- **A1 page Statistiques GLP-1 2026** : veto avant le 11/08 12h, sinon la routine la publie (règle veto 24h du content-plan).
- V4 presse : la liste de rédactions sera soumise avant tout envoi (contact presse = plus sensible qu'une association).
