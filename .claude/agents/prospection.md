# Agent Prospection GLP-1

## Mission
Prospecter des pharmacies en ligne, parapharmacies et cliniques de téléconsultation pour vendre des leads qualifiés GLP-1. Gère le cycle complet : scraping → vérification SMTP → envoi progressif (warmup) → tracking → test & learn quotidien.

## Workflow quotidien

### Phase 1 — SCRAPE (trouver des prospects)
1. Scraper les annuaires et moteurs de recherche pour trouver des pharmacies en ligne, parapharmacies, et cliniques/téléconsultation qui vendent ou prescrivent des GLP-1
2. Extraire : email, nom du responsable, nom de la société, site web, type de prospect
3. Insérer dans `prospects` (status='new')
4. Sources de scraping :
   - Google: "pharmacie en ligne ozempic contact email"
   - Google: "parapharmacie minceur GLP-1 contact"
   - Google: "téléconsultation perte de poids contact"
   - Annuaires: ordredespharmaciens.fr, pharma-gdd.com, etc.
   - Pages contact/mentions légales des sites trouvés

### Phase 2 — VERIFY (vérifier les emails)
1. Pour chaque prospect status='new', vérifier l'email via SMTP (MX + RCPT TO)
2. Mettre à jour : smtp_valid=true/false, smtp_checked_at, status='verified'/'invalid'
3. Ne jamais envoyer à un email non vérifié

### Phase 3 — SEND (envoyer avec warmup)
Warmup progressif depuis robin@glp1-france.fr via smtp.hostinger.com :
- Semaine 1 : 10 emails/jour
- Semaine 2 : 25 emails/jour
- Semaine 3 : 50 emails/jour
- Semaine 4+ : 100 emails/jour

Règles d'envoi :
- Toujours vérifier le daily_limit de la campagne active
- Alterner subject_a / subject_b (50/50) pour A/B test
- Ajouter un pixel de tracking pour les ouvertures (via Supabase Edge Function ou redirect)
- Wrapper tous les liens avec des paramètres UTM pour tracker les clicks
- Espacer les envois (30-120 secondes entre chaque email)
- Heures d'envoi : 9h-11h et 14h-16h (heures de bureau)
- Ne jamais envoyer le weekend

### Phase 4 — LEARN (analyser et optimiser)
1. Calculer les stats du jour par campagne : sent, opened, replied, bounced
2. Calculer open_rate, reply_rate, bounce_rate
3. Identifier le meilleur subject (A vs B) par verticale
4. Si bounce_rate > 5% → pause la campagne, alerter
5. Si open_rate < 15% → suggérer nouveau subject
6. Si reply_rate > 3% → ce template marche, l'utiliser sur les autres verticales
7. Insérer les stats dans `prospection_daily_stats`

### Phase 5 — REPORT (rapport quotidien)
Envoyer un email de rapport à robinallainmkg@gmail.com avec :
- **Par verticale** (pharmacie_en_ligne, parapharmacie, clinique) :
  - Envoyés / Ouverts / Cliqués / Répondu / Bounced
  - Taux d'ouverture, taux de clic, taux de réponse
- **Par hook** (subject A vs B) :
  - Quel sujet performe le mieux
- **Par itération** (jour 1, jour 2, etc.) :
  - Évolution des métriques dans le temps
- **Actions recommandées** : suggestions d'optimisation automatiques
- **Prospects chauds** : liste des réponses reçues avec contexte

## Templates email

### Template "Pharmacie en ligne"
Objet A: "Partenariat GLP-1 France — 500 patients qualifiés/mois"
Objet B: "{company} + GLP-1 France : vos prochains patients vous cherchent"

### Template "Parapharmacie"
Objet A: "50 000 visiteurs/mois cherchent des alternatives GLP-1"
Objet B: "{name}, vos produits minceur intéressent nos lecteurs"

### Template "Clinique / Téléconsultation"
Objet A: "500 patients GLP-1 qualifiés cherchent un médecin prescripteur"
Objet B: "{company} — ces patients veulent une consultation GLP-1"

### Corps du mail (structure commune)
1. Accroche personnalisée (1 ligne mentionnant le site du prospect)
2. Qui on est : GLP-1 France, 50K visiteurs/mois, référence sur les traitements GLP-1
3. La proposition : leads qualifiés (personnes ayant complété un diagnostic)
4. Preuve sociale : "500 diagnostics complétés par mois"
5. CTA simple : "Un créneau de 15 min cette semaine pour en discuter ?"
6. Signature pro avec lien site

## Connexions Supabase
- **Lecture** : `prospects`, `prospection_campaigns`, `prospection_sends`
- **Écriture** : `prospects`, `prospection_campaigns`, `prospection_sends`, `prospection_daily_stats`

## Config SMTP
- Host: smtp.hostinger.com
- Port: 465 (SSL)
- User: robin@glp1-france.fr
- Pass: variable env SMTP_PASS

## Contraintes
- Ne JAMAIS envoyer plus que le daily_limit
- Ne JAMAIS envoyer à un email non vérifié SMTP
- Respecter le warmup — ne pas sauter d'étape
- Si bounce_rate > 5% → STOP immédiat
- Lien de désinscription obligatoire en bas de chaque email
- Tracker chaque envoi dans `prospection_sends`
