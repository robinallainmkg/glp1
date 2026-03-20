import fs from 'fs';

const existingData = JSON.parse(fs.readFileSync(process.env.HOME + '/existing_links.json', 'utf8'));
const existingSet = new Set(existingData.map(r => `${r.source_slug}|${r.target_slug}`));

const RUN_ID = '228a7958-24b4-4ce8-9759-60f5ffb5fdb2';

const candidates = [
  // Guide Ozempic
  ["guide-complet-ozempic", "glp1-benefices-cardiovasculaires-coeur", "bénéfices cardiovasculaires", "Ozempic a démontré des bénéfices cardiovasculaires significatifs dans SELECT.", "contextual", 2],
  ["guide-complet-ozempic", "remboursement-glp1-2026", "remboursement", "Consultez les conditions de remboursement des GLP-1 en 2026.", "contextual", 2],
  ["guide-complet-ozempic", "glp1-perte-de-poids", "perte de poids sous GLP-1", "Ozempic favorise une perte de poids significative.", "contextual", 3],

  // Guide Wegovy
  ["guide-complet-wegovy", "remboursement-glp1-2026", "remboursement", "Le remboursement de Wegovy est soumis à des conditions spécifiques.", "contextual", 2],
  ["guide-complet-wegovy", "glp1-perte-de-poids", "perte de poids", "Wegovy est approuvé pour la perte de poids chez les patients obèses.", "contextual", 3],
  ["guide-complet-wegovy", "guide-complet-trulicity", "Trulicity", "À la différence du Trulicity, Wegovy est indiqué pour l'obésité.", "related", 4],

  // Guide Mounjaro
  ["guide-complet-mounjaro", "remboursement-glp1-2026", "conditions de remboursement", "Les conditions de remboursement de Mounjaro évoluent en 2026.", "contextual", 2],
  ["guide-complet-mounjaro", "guide-complet-rybelsus", "Rybelsus", "Contrairement au Rybelsus oral, Mounjaro s'administre par injection.", "related", 5],

  // Guide Zepbound
  ["guide-complet-zepbound", "remboursement-glp1-2026", "remboursement GLP-1", "Le remboursement de Zepbound dépend des décisions du CEPS.", "contextual", 2],
  ["guide-complet-zepbound", "glp1-perte-de-poids", "perte de poids", "Zepbound permet une perte de poids supérieure à 20%.", "contextual", 3],

  // Guide Trulicity
  ["guide-complet-trulicity", "guide-complet-wegovy", "Wegovy", "Pour la perte de poids, le Wegovy est plus indiqué que le Trulicity.", "related", 3],
  ["guide-complet-trulicity", "glp1-benefices-cardiovasculaires-coeur", "bénéfices cardiovasculaires", "Le Trulicity a montré des bénéfices cardiovasculaires dans REWIND.", "contextual", 2],
  ["guide-complet-trulicity", "remboursement-glp1-2026", "remboursement", "Le Trulicity est remboursé dans le cadre du diabète de type 2.", "contextual", 3],

  // Guide Victoza
  ["guide-complet-victoza", "guide-complet-trulicity", "Trulicity", "Le Trulicity est une alternative au Victoza avec injection hebdomadaire.", "related", 4],
  ["guide-complet-victoza", "glp1-benefices-cardiovasculaires-coeur", "bénéfices cardiovasculaires", "Le Victoza a démontré des bénéfices cardiovasculaires dans LEADER.", "contextual", 2],

  // Guide Rybelsus
  ["guide-complet-rybelsus", "guide-complet-trulicity", "Trulicity", "Le Trulicity est un GLP-1 injectable, contrairement au Rybelsus oral.", "related", 4],
  ["guide-complet-rybelsus", "remboursement-glp1-2026", "remboursement", "Le remboursement du Rybelsus est limité au diabète de type 2.", "contextual", 3],
  ["guide-complet-rybelsus", "glp1-benefices-cardiovasculaires-coeur", "protection cardiovasculaire", "Le sémaglutide oral offre une protection cardiovasculaire similaire.", "contextual", 3],

  // Wegovy vs Mounjaro
  ["wegovy-vs-mounjaro-comparatif-2026", "glp1-benefices-cardiovasculaires-coeur", "bénéfices cardiovasculaires", "Les deux traitements présentent des bénéfices cardiovasculaires distincts.", "contextual", 2],
  ["wegovy-vs-mounjaro-comparatif-2026", "glp1-perte-de-poids", "perte de poids", "La perte de poids est le critère principal de comparaison.", "contextual", 3],

  // Effets secondaires Mounjaro
  ["effets-secondaires-mounjaro", "glp1-benefices-cardiovasculaires-coeur", "bénéfices cardiovasculaires", "Malgré les effets secondaires, les bénéfices cardiovasculaires restent importants.", "contextual", 3],
  ["effets-secondaires-mounjaro", "guide-complet-ozempic", "Ozempic", "Ozempic partage certains effets secondaires gastro-intestinaux avec Mounjaro.", "related", 4],

  // Ozempic danger
  ["ozempic-danger", "glp1-benefices-cardiovasculaires-coeur", "bénéfices cardiovasculaires prouvés", "Malgré les risques, Ozempic possède des bénéfices cardiovasculaires prouvés.", "contextual", 2],

  // Wegovy danger
  ["wegovy-danger", "remboursement-glp1-2026", "remboursement de Wegovy", "Vérifiez les conditions de remboursement avant de commencer Wegovy.", "contextual", 4],
  ["wegovy-danger", "glp1-perte-de-poids", "perte de poids", "La perte de poids sous Wegovy doit être surveillée médicalement.", "contextual", 3],

  // Prix pages
  ["prix-ozempic-france", "glp1-perte-de-poids", "perte de poids", "Ozempic est aussi utilisé pour la perte de poids hors AMM.", "contextual", 3],
  ["prix-wegovy-france", "glp1-perte-de-poids", "perte de poids", "Le prix de Wegovy se justifie par une perte de poids moyenne de 15%.", "contextual", 3],
  ["prix-mounjaro-france", "remboursement-glp1-2026", "remboursement GLP-1 2026", "Consultez notre guide complet du remboursement GLP-1 en 2026.", "contextual", 2],

  // GLP-1 perte de poids
  ["glp1-perte-de-poids", "glp1-vs-chirurgie-bariatrique-sleeve-bypass-comparatif", "chirurgie bariatrique", "Les GLP-1 sont une alternative à la chirurgie bariatrique.", "contextual", 2],
  ["glp1-perte-de-poids", "glp1-benefices-cardiovasculaires-coeur", "bénéfices cardiovasculaires", "La perte de poids sous GLP-1 s'accompagne de bénéfices cardiovasculaires.", "contextual", 2],

  // Guide complet GLP-1 2025
  ["guide-complet-glp1-2025-france", "guide-complet-ozempic", "guide Ozempic", "Consultez notre guide complet Ozempic pour les détails de prescription.", "contextual", 2],
  ["guide-complet-glp1-2025-france", "alternatives-naturelles-ozempic", "alternatives naturelles", "Des alternatives naturelles aux GLP-1 existent pour certains patients.", "contextual", 3],

  // Protéines GLP-1
  ["glp1-proteines", "glp1-perte-de-poids", "perte de poids sous GLP-1", "L'apport en protéines est crucial pendant la perte de poids sous GLP-1.", "contextual", 3],

  // Alternatives naturelles
  ["alternatives-naturelles-ozempic", "glp1-perte-de-poids", "perte de poids GLP-1", "Les GLP-1 médicamenteux restent plus efficaces pour la perte de poids.", "contextual", 3],
  ["alternatives-naturelles-ozempic", "remboursement-glp1-2026", "remboursement des GLP-1", "Les alternatives naturelles ne bénéficient pas du remboursement.", "contextual", 4],

  // Bénéfices cardiovasculaires
  ["glp1-benefices-cardiovasculaires-coeur", "glp1-perte-de-poids", "perte de poids", "Les bénéfices cardiovasculaires sont indépendants de la perte de poids.", "contextual", 2],
  ["glp1-benefices-cardiovasculaires-coeur", "guide-complet-trulicity", "Trulicity (dulaglutide)", "Le Trulicity a démontré des bénéfices cardiovasculaires dans REWIND.", "contextual", 3],
  ["glp1-benefices-cardiovasculaires-coeur", "remboursement-glp1-2026", "remboursement", "Les bénéfices cardiovasculaires facilitent le remboursement des GLP-1.", "contextual", 4],

  // Quel traitement choisir
  ["quel-traitement-glp1-choisir", "glp1-vs-chirurgie-bariatrique-sleeve-bypass-comparatif", "chirurgie bariatrique", "Pour les cas sévères, la chirurgie bariatrique peut être envisagée.", "contextual", 3],
  ["quel-traitement-glp1-choisir", "glp1-benefices-cardiovasculaires-coeur", "bénéfices cardiovasculaires", "Certains GLP-1 offrent des bénéfices cardiovasculaires supplémentaires.", "contextual", 2],
  ["quel-traitement-glp1-choisir", "glp1-perte-de-poids", "perte de poids", "La perte de poids attendue varie selon le traitement GLP-1 choisi.", "contextual", 3],

  // Sémaglutide naturel
  ["semaglutide-naturel", "remboursement-glp1-2026", "remboursement des GLP-1", "Les alternatives naturelles ne bénéficient pas du remboursement des GLP-1.", "contextual", 3],

  // Berbérine
  ["berberine-glp1", "remboursement-glp1-2026", "remboursement GLP-1", "La berbérine n'est pas éligible au remboursement contrairement aux GLP-1.", "contextual", 4],
];

// Filter out existing
const newSuggestions = candidates.filter(([src, tgt]) => !existingSet.has(`${src}|${tgt}`));

console.log(`Candidates: ${candidates.length}`);
console.log(`Already existing: ${candidates.length - newSuggestions.length}`);
console.log(`New to insert: ${newSuggestions.length}`);

// Limit to 50
const toInsert = newSuggestions.slice(0, 50).map(([src, tgt, anchor, ctx, type, prio]) => ({
  agent_run_id: RUN_ID,
  source_slug: src,
  target_slug: tgt,
  anchor_text: anchor,
  context_sentence: ctx,
  link_type: type,
  priority: prio,
  status: 'approved'
}));

fs.writeFileSync(process.env.HOME + '/new_suggestions.json', JSON.stringify(toInsert, null, 2));
console.log(`Written ${toInsert.length} suggestions to ~/new_suggestions.json`);
