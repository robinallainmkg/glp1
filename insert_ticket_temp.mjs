const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const tickets = [
  {
    article_id: 'f34667ae-2bad-4f35-894f-9f2614f9af9a',
    slug: 'remboursement-mounjaro-france-2026-quand-conditions-ceps',
    title: 'Description meta trop longue (161 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_meta_fix',
    urgence: 'low',
    before_exact: 'Remboursement Mounjaro France 2026 : HAS favorable decembre 2025, negociations CEPS Eli Lilly en cours, calendrier realiste et conditions IMC pour en beneficier.',
    after_suggested: 'Remboursement Mounjaro France 2026 : HAS favorable, negociations CEPS en cours. Calendrier et conditions IMC.',
    claim_original: 'Description de 161 caracteres depasse la limite SEO de 160',
    realite_actuelle: 'La description doit faire entre 120 et 160 caracteres pour un affichage optimal dans les SERPs Google',
    statut: 'approved',
  }
];

let created = 0;
let failed = 0;
let skipped = 0;

for (const ticket of tickets) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/correction_tickets`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(ticket),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (res.ok) {
    console.log('CREATED:', ticket.slug, '(', ticket.ticket_type, ')');
    created++;
  } else if (res.status === 409 || (data && data.code === '23505')) {
    console.log('EXISTS:', ticket.slug, '- already exists, skipping');
    skipped++;
  } else {
    console.log('FAILED:', ticket.slug, JSON.stringify(data).slice(0, 200));
    failed++;
  }
}

console.log(`\nTickets created: ${created}, failed: ${failed}, skipped: ${skipped}`);
