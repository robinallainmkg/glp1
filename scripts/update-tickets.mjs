import https from 'https';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

function patchRequest(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(options, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: resp }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function postRequest(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(options, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: resp }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const tickets = [
  { id: '7e7d2bae-7c04-4ed1-83cd-163680005b4c', after_final: '| Ozempic | ~77,60 € | 65% (DT2 uniquement) |', article_id: '6fdf9a8e-9411-4317-8f18-8b422532b8ef' },
  { id: '63764b52-4878-4250-94e4-0562a6add5e6', after_final: 'Incohérence corrigée: tableau principal ligne 90 mis à jour de 30% vers 65% (DT2 uniquement).', article_id: '6fdf9a8e-9411-4317-8f18-8b422532b8ef' },
  { id: 'c7b4363e-6605-40ea-a26b-255da923eaa2', after_final: '- **Réduction du volume de graisse viscérale** : environ -27 % en moyenne dans le groupe sémaglutide vs -11 % dans le groupe placebo (analyse de sous-groupe STEP 1, n=140)', article_id: '529730f7-d7c2-42ce-adbd-458e7380c3d7' },
  { id: '179dfdd8-24cd-422c-99de-ad78ef5e31b5', after_final: 'Article entièrement réécrit avec contenu réel (1500+ mots) sur portions alimentaires sous GLP-1: taille assiette, fréquence repas, aliments conseillés, gestion satiété précoce, apports nutritionnels.', article_id: 'd97a07c2-dd50-4f44-bc38-3bff24fe3117' },
  { id: 'ae0be4ec-3074-459d-84c4-0003a94c468d', after_final: 'Conditions Trulicity corrigées: suppression critères IMC erronés, formulation correcte DT2 insuffisamment contrôlé avec metformine ou contre-indication metformine.', article_id: '6fdf9a8e-9411-4317-8f18-8b422532b8ef' },
  { id: 'd6ac2fcd-723c-41aa-b920-f4d91b053beb', after_final: 'OASIS 4: perte de poids 16,6% sur 64 semaines (vs 2,7% placebo). Déjà appliqué dans fichier par run précédent, corrections cohérence appliquées.', article_id: '22060c38-098c-42b5-9b1a-e511ea47e2b7' },
  { id: '5e45b34a-0621-4ae7-a2c1-8ebefcb22301', after_final: 'Placeholders prix XX-XX supprimés. Article entièrement réécrit avec contenu réel sur portions alimentaires GLP-1.', article_id: 'd97a07c2-dd50-4f44-bc38-3bff24fe3117' },
  { id: '5bec0980-00f1-41bb-b4c0-fec2186a6e00', after_final: 'Fatigue: Fréquence corrigée vers Très fréquent (>=10% selon le RCP Saxenda). Évolution: Généralement temporaire.', article_id: 'e793360f-08bd-4400-9030-680ee7b7667f' },
  { id: '2d9f7b82-fca6-4285-bf12-0b07c489c2f6', after_final: 'Maux de tête: Fréquence corrigée vers Très fréquent (>=10%, environ 14% selon les études SCALE).', article_id: 'e793360f-08bd-4400-9030-680ee7b7667f' },
  { id: 'e63b6085-fa3e-4fff-953a-ba1d37436419', after_final: 'Affirmation HAS 2025 remplacée: la HAS ne dispose pas de recommandations officielles validant association systématique acupuncture/GLP-1. Utilisation au cas par cas avec médecin.', article_id: '60240521-9791-4823-95d0-67d3317c4a6f' },
  { id: '16b63783-5721-4899-88f1-7a79f2564a28', after_final: 'Section GLP-1 oraux corrigée: Rybelsus est le seul GLP-1 oral en France. Adlyxin (injection) retiré de la liste des GLP-1 oraux.', article_id: 'b8ce1a4d-b90f-4727-a748-c6ee27b2e51f' },
  { id: '9df29e62-9652-4007-88f8-d04f7c220eff', after_final: 'Maux de tête Rybelsus: Fréquence corrigée vers Très fréquent (>=1/10 selon le RCP EMA du sémaglutide).', article_id: 'bebd19dd-238a-4f1d-a7db-cdef5b227817' },
  { id: '167434db-8dc6-46d4-972c-6b5988373519', after_final: 'Article acupuncture entièrement réécrit avec coûts réels: 23-30€ médecin conventionné, 50-80€ non médecin. Remboursement SS conditionnel médecin conventionné. ALD correct.', article_id: '60240521-9791-4823-95d0-67d3317c4a6f' },
  { id: '792519cb-22b0-4561-986f-bdd824a7ddfe', after_final: 'Résultats ESSENCE déjà corrects dans fichier (62,9% résolution MASH, NEJM avril 2025, résultats définitifs).', article_id: '63e98e4b-463f-4547-b781-33c6b697093f' },
  { id: '17989e8d-f160-4f56-823f-2357b493e5f6', after_final: 'FDA approbation sémaglutide MASH août 2025 déjà présente dans fichier. EMA en cours. France pas encore disponible mars 2026.', article_id: '63e98e4b-463f-4547-b781-33c6b697093f' },
  { id: 'b9c27ad6-8ce4-4b99-81bf-c58b1107ef81', after_final: 'Ozempic remboursement corrigé 30% vers 65% dans note introductive effets-secondaires-rybelsus.', article_id: 'bebd19dd-238a-4f1d-a7db-cdef5b227817' },
  { id: '5ccf21db-dccf-49b7-a35a-6fc4901a1642', after_final: 'Section NAION ajoutée: risque très rare (1/10000), confirmé EMA/PRAC janvier 2025 pour sémaglutide (Rybelsus, Ozempic, Wegovy). Perte vision possible, consulter si troubles visuels soudains.', article_id: 'bebd19dd-238a-4f1d-a7db-cdef5b227817' },
  { id: 'c123dc2b-8697-48ed-ac8b-77d426012692', after_final: 'ALD acupuncture corrigé: 100% base SS uniquement médecin conventionné + rapport direct ALD. Acupuncteur non médecin: pas de remboursement SS même en ALD.', article_id: '60240521-9791-4823-95d0-67d3317c4a6f' },
  { id: '4aaa3278-6aea-4947-be25-e8afe6c73653', after_final: 'Rybelsus non remboursé en France (HAS avis défavorable). Coût intégralement charge patient 80-110€/mois. Correction dans guide-complet-rybelsus FAQ.', article_id: 'b8ce1a4d-b90f-4727-a748-c6ee27b2e51f' },
  { id: '668742ea-5a7b-4143-a190-6a3d88c01935', after_final: 'SURPASS-CVOT résultats publiés NEJM 2025: non-infériorité vs dulaglutide HR 0,92, supériorité non atteinte, réduction 8% MACE vs dulaglutide non significative.', article_id: '4bd2aee8-b7a6-496a-98c4-77001a4b5b6b' }
];

// Update all tickets to ready_to_deploy
for (const ticket of tickets) {
  const result = await patchRequest(
    '/rest/v1/correction_tickets?id=eq.' + ticket.id,
    { statut: 'ready_to_deploy', after_final: ticket.after_final, updated_at: new Date().toISOString() }
  );
  const status = result.status === 204 ? 'OK' : 'ERR ' + result.status;
  console.log(status + ' ' + ticket.id.substring(0,8) + '...');
}

// Log each ticket
for (const ticket of tickets) {
  await postRequest('/rest/v1/agent_logs', {
    agent_type: 'editorial',
    article_id: ticket.article_id,
    status: 'success',
    metadata: { ticket_id: ticket.id, action: 'correction', source_agent: 'fact-check', partition: '4/4' }
  });
}
console.log('All logs inserted');
