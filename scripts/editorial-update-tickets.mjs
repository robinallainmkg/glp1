import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const supabase = createClient(supabaseUrl, supabaseKey);

const RUN_ID = 'c93e7dc4-5ef6-41f4-8b4e-921d698eb994';

// Tickets successfully applied
const APPLIED_TICKETS = [
  {
    id: 'f3c3fe72-479a-494a-8684-37834187248b',
    article_id: 'd4758e23-edce-4c95-80e3-5d08c0dbea2c',
    after_final: 'la HAS a rendu un avis favorable sur Wegovy en décembre 2024 et sur Mounjaro en décembre 2025. Les négociations de prix avec le CEPS sont en cours, avec un remboursement estimé au 2e semestre 2026',
    source_agent: 'fact-check'
  },
  {
    id: 'd4e0e15b-ad1a-4a6f-a0d2-2be9235eb9be',
    article_id: '7648f663-f039-4538-b014-9c1211883755',
    after_final: 'La Commission Européenne a approuvé le Wegovy 7,2 mg en janvier 2026, sur la base de l\'avis positif du CHMP (EMA) rendu le 12 décembre 2025. La demande d\'approbation auprès de la FDA est en cours pour 2026. En France, ce nouveau dosage devra encore être évalué par la HAS et faire l\'objet d\'une négociation tarifaire avec le CEPS avant d\'être disponible et remboursable.',
    source_agent: 'fact-check'
  },
  {
    id: '4f254aae-62f9-4dc7-b51b-2238c41c9cc3',
    article_id: 'ba887a25-0000-4000-a000-000000000001',
    after_final: '| **Rybelsus** | Sémaglutide oral | Diabète | 3-7% | Quotidienne | 80-110€ | Remboursement variable (à confirmer avec médecin) |',
    source_agent: 'fact-check'
  },
  {
    id: '8f05c932-5fd9-42ff-a694-2fbf94e87b5d',
    article_id: '3e5a270a-0000-4000-a000-000000000002',
    after_final: 'Ajout note dosage 7,2 mg CE janvier 2026 avant le tableau des tarifs',
    source_agent: 'fact-check'
  },
  {
    id: '3e6e0f75-2b24-470e-b3c0-ba583efb4884',
    article_id: '4cc53d9d-0000-4000-a000-000000000006',
    after_final: 'En janvier 2025, le PRAC a ouvert une révision du sémaglutide concernant la NOIAN. Cette révision s\'est conclue en juin 2025 : le PRAC a recommandé l\'inclusion de la NOIAN comme effet indésirable très rare dans les RCP d\'Ozempic et Wegovy.',
    source_agent: 'fact-check'
  },
  {
    id: '8207468c-ad13-4d34-8c8c-16ac0645735e',
    article_id: '015fb9f1-ca1c-4302-a23f-00da9b5d1df8',
    after_final: 'Perte de poids : 12,4% en moyenne à 72 semaines pour l\'indication obésité (étude ATTAIN-1, NEJM sept. 2025)',
    source_agent: 'fact-check'
  },
  {
    id: '3d88d525-5f47-46cb-9ba5-c40ee857d448',
    article_id: '5dd71180-3f97-4a5a-b53d-ea0a8ea2c12c',
    after_final: 'Remboursement : 30 % si diabète de type 2 (100 % en ALD), formulaire obligatoire depuis fév. 2025',
    source_agent: 'fact-check'
  },
  {
    id: 'e31f37ea-5544-4ea9-9647-894214890c55',
    article_id: 'd9c36bd5-dc2a-417b-89a9-ae3742c25a8a',
    after_final: '| Score KCCQ-CSS (qualité de vie) | +19,5 points | +12,7 points | Différence : +6,9 points (p<0,001) |',
    source_agent: 'fact-check'
  },
  {
    id: '2e8bea82-d8cf-47d1-999a-85a7089c55dd',
    article_id: '373bb7a2-805c-487b-a5cd-ac85d92e9b48',
    after_final: 'IMC ≥ 35 kg/m² — seul critère reconnu par la HAS dans son avis de remboursement de décembre 2024.',
    source_agent: 'fact-check'
  },
  {
    id: 'ff85f9c0-cd16-4fea-896e-527fbbfbb36f',
    article_id: '373bb7a2-805c-487b-a5cd-ac85d92e9b48',
    after_final: 'Prix Wegovy corrigés : 145€ à 295€/mois selon le dosage',
    source_agent: 'fact-check'
  },
  {
    id: 'a5c3e103-a1cc-4b4c-9651-54b5278dde3a',
    article_id: '91fa709c-6681-4b26-abfb-af01f4c7a96e',
    after_final: 'Patients ayant perdu >5%: 83% (corrigé depuis >10%)',
    source_agent: 'fact-check'
  },
  {
    id: 'c5735096-1e1e-414a-9d1e-540eba814ff2',
    article_id: '91fa709c-6681-4b26-abfb-af01f4c7a96e',
    after_final: 'Patients ayant perdu >15%: 48%, 30% ont perdu >20% (corrigé depuis >20%: 48%)',
    source_agent: 'fact-check'
  },
  {
    id: '2f57e642-321f-4ff8-b218-64e1edb81cd2',
    article_id: '0649dd27-05e1-4ed6-a12f-9836d221352b',
    after_final: 'L\'avis HAS favorable a été rendu le 9 décembre 2025.',
    source_agent: 'fact-check'
  },
  {
    id: '0285c480-17b5-4963-bb23-1b27f707a90c',
    article_id: 'aa75099e-fbeb-4eeb-a75d-2129f2eb594d',
    after_final: 'Je paye environ 53 euros par mois après remboursement à 30% par la Sécurité Sociale (prix officiel ~76,58 €/stylo).',
    source_agent: 'fact-check'
  },
  {
    id: 'be79b283-96f0-41cd-af94-d39fae8bea01',
    article_id: '283d4231-5e61-4ad9-838b-b06a220bf790',
    after_final: '| Distance de marche de 6 minutes (gain) | +38,2 m | +7,9 m | +30,3 m |',
    source_agent: 'fact-check'
  },
  {
    id: '1f1cb8d3-db41-40c9-8cf2-03426b569e89',
    article_id: '22060c38-098c-42b5-9b1a-e511ea47e2b7',
    after_final: 'OASIS 4 : perte de poids moyenne 13,6% en ITT ou 16,6% avec adhérence complète, sur 64 semaines (non 68).',
    source_agent: 'fact-check'
  },
  {
    id: '70109f5c-ba2f-4ce2-9e9e-ed8e27b01b37',
    article_id: '529730f7-d7c2-42ce-adbd-458e7380c3d7',
    after_final: 'Réduction de la masse grasse viscérale : -27,4% dans le groupe sémaglutide (STEP 1, sous-groupe imagerie)',
    source_agent: 'fact-check'
  },
  {
    id: 'a396acad-67a9-426c-bca9-e6d82c9bdfc3',
    article_id: '082ad74a-1849-400d-83d4-70183dba55df',
    after_final: 'Risque absolu : taux 0,1-0,2% sur plusieurs années dans les essais cliniques (SUSTAIN, SCALE). Méta-analyse Diabetes Care 2024 : OR 1,24 (+24% risque relatif).',
    source_agent: 'fact-check'
  },
  {
    id: '8c60b879-ffba-4411-bc6e-c31484a68796',
    article_id: '49c79b8d-0f18-498c-80a1-0e012e2543ed',
    after_final: 'Nuance sur l\'interaction : études cliniques montrent interaction modeste. MHRA recommande contraception additionnelle 4 premières semaines et après chaque augmentation de dose.',
    source_agent: 'fact-check'
  }
];

// Ticket rejected (conflicting data, NEJM preferred over caducee.net)
const REJECTED_TICKET_ID = 'a5832b43-d8d6-4b51-857c-95bd46fa44c4';

async function updateTickets() {
  let successCount = 0;
  let errorCount = 0;

  // Mark all applied tickets as in_progress first, then ready_to_deploy
  for (const ticket of APPLIED_TICKETS) {
    // Mark in_progress
    const { error: ipError } = await supabase
      .from('correction_tickets')
      .update({ statut: 'in_progress' })
      .eq('id', ticket.id);
    if (ipError) {
      console.error(`ERROR marking in_progress ${ticket.id}:`, ipError.message);
      errorCount++;
      continue;
    }

    // Mark ready_to_deploy with after_final
    const { error: rdError } = await supabase
      .from('correction_tickets')
      .update({ statut: 'ready_to_deploy', after_final: ticket.after_final, updated_at: new Date().toISOString() })
      .eq('id', ticket.id);
    if (rdError) {
      console.error(`ERROR marking ready_to_deploy ${ticket.id}:`, rdError.message);
      errorCount++;
      continue;
    }

    // Insert log
    const { error: logError } = await supabase
      .from('agent_logs')
      .insert({
        agent_type: 'editorial',
        article_id: ticket.article_id,
        status: 'success',
        metadata: { ticket_id: ticket.id, action: 'correction', source_agent: ticket.source_agent }
      });
    if (logError) {
      console.error(`ERROR inserting log for ${ticket.id}:`, logError.message);
    }

    console.log(`OK ticket ${ticket.id}`);
    successCount++;
  }

  // Reject conflicting SUMMIT ticket
  const { error: rejError } = await supabase
    .from('correction_tickets')
    .update({ statut: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', REJECTED_TICKET_ID);
  if (rejError) {
    console.error('ERROR rejecting ticket:', rejError.message);
  } else {
    console.log(`REJECTED ticket ${REJECTED_TICKET_ID} (conflicting KCCQ data, NEJM preferred)`);
  }

  console.log(`\nTickets: ${successCount} applied, ${errorCount} errors, 1 rejected`);
  return { successCount, errorCount };
}

updateTickets().then(r => console.log('Done:', r)).catch(console.error);
