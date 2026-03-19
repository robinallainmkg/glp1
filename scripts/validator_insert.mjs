// Validator: insert correction tickets only (validation results already inserted)
const SUPABASE_URL = "https://ywekaivgjzsmdocchvum.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs";
const RUN_ID = "fe805da8-bf9b-47af-b001-2a3677f7317a";

async function insert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Error inserting into ${table}:`, text.slice(0, 200));
    return false;
  }
  return true;
}

// Article ID map from Supabase lookups
const articleIdMap = {
  'alternatives-glp1/acupuncture-glp1': '60240521-9791-4823-95d0-67d3317c4a6f',
  'glp1-cout/prix-victoza-france': '538f91a7-7a48-4a71-9139-021b10e7ffcc',
  'remboursement-ozempic-diabete-justificatif-prescription-guide-2026': '898ff9d4-b669-4c38-8d27-554fa1f663a5',
  'glp1-menopause-perte-poids-femme-ths': '0602f614-58b0-492c-852b-6e21ec102756',
  'reprise-poids-glp1-4-fois-plus-rapide-etude-2026': '8c3301aa-e2aa-438b-b737-5bac40cc151f',
  'glp1-cholesterol-triglycerides-profil-lipidique-benefices': '39d1cc9b-e544-4c6b-807c-59e78d066c72',
  'glp1-microbiote-intestinal-flore-impact-probiotiques': '153211d2-0cef-4dc7-baaf-e9d1a05b1943',
  'pharmacovigilance-glp1-france-ansm-bilan-2025-2026': 'c0641c7b-7238-4ab0-81fa-8b2d74e3df62',
  'glp1-sport-exercice-musculation-guide': 'e48b89cb-6b40-45eb-99d7-ef57d80f44a1',
  'comment-s-injecter-glp1-guide-pratique-ozempic-wegovy-mounjaro': 'b66c786d-dc66-44ac-9802-c9fefe2579af',
  'wegovy-comprime-oral-pilule-france-date-ema': '22060c38-098c-42b5-9b1a-e511ea47e2b7',
};

// Correction tickets for warnings (seo_meta and sync issues)
const tickets = [
  {
    article_id: articleIdMap['alternatives-glp1/acupuncture-glp1'],
    slug: 'alternatives-glp1/acupuncture-glp1',
    title: 'SEO: Description trop longue (161 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'description: 161 caracteres (max 160)',
    after_suggested: 'Raccourcir la description de 1 caractere pour respecter la limite de 160 chars',
    claim_original: 'Description depasse la limite SEO',
    realite_actuelle: 'La description fait 161 chars, elle sera tronquee dans les SERPs Google',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['glp1-cout/prix-victoza-france'],
    slug: 'glp1-cout/prix-victoza-france',
    title: 'SEO: Description trop longue (169 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'description: 169 caracteres (max 160)',
    after_suggested: 'Raccourcir la description a maximum 160 chars',
    claim_original: 'Description depasse la limite SEO',
    realite_actuelle: 'La description fait 169 chars, soit 9 chars de trop',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['remboursement-ozempic-diabete-justificatif-prescription-guide-2026'],
    slug: 'remboursement-ozempic-diabete-justificatif-prescription-guide-2026',
    title: 'SEO: Title trop long (69 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 69 caracteres (max 65)',
    after_suggested: 'Raccourcir le titre a maximum 65 chars',
    claim_original: 'Title depasse la limite SEO',
    realite_actuelle: 'Le titre fait 69 chars, risque de coupure dans les SERPs',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['glp1-menopause-perte-poids-femme-ths'],
    slug: 'glp1-menopause-perte-poids-femme-ths',
    title: 'SEO: Title trop long (70 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 70 caracteres (max 65)',
    after_suggested: 'Raccourcir le titre a maximum 65 chars',
    claim_original: 'Title depasse la limite SEO',
    realite_actuelle: 'Le titre fait 70 chars, soit 5 chars de trop',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['reprise-poids-glp1-4-fois-plus-rapide-etude-2026'],
    slug: 'reprise-poids-glp1-4-fois-plus-rapide-etude-2026',
    title: 'SEO: Title trop long (76 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 76 caracteres (max 65)',
    after_suggested: 'Raccourcir le titre a maximum 65 chars',
    claim_original: 'Title depasse la limite SEO',
    realite_actuelle: 'Le titre fait 76 chars, soit 11 chars de trop',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['glp1-cholesterol-triglycerides-profil-lipidique-benefices'],
    slug: 'glp1-cholesterol-triglycerides-profil-lipidique-benefices',
    title: 'SEO: Title trop long (75 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 75 caracteres (max 65)',
    after_suggested: 'Raccourcir le titre a maximum 65 chars',
    claim_original: 'Title depasse la limite SEO',
    realite_actuelle: 'Le titre fait 75 chars, soit 10 chars de trop',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['glp1-microbiote-intestinal-flore-impact-probiotiques'],
    slug: 'glp1-microbiote-intestinal-flore-impact-probiotiques',
    title: 'SEO: Title trop long (78 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 78 caracteres (max 65)',
    after_suggested: 'Raccourcir le titre a maximum 65 chars',
    claim_original: 'Title depasse la limite SEO',
    realite_actuelle: 'Le titre fait 78 chars, soit 13 chars de trop',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['pharmacovigilance-glp1-france-ansm-bilan-2025-2026'],
    slug: 'pharmacovigilance-glp1-france-ansm-bilan-2025-2026',
    title: 'SEO: Title trop long (69 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 69 caracteres (max 65)',
    after_suggested: 'Raccourcir le titre a maximum 65 chars',
    claim_original: 'Title depasse la limite SEO',
    realite_actuelle: 'Le titre fait 69 chars, soit 4 chars de trop',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['glp1-sport-exercice-musculation-guide'],
    slug: 'glp1-sport-exercice-musculation-guide',
    title: 'SEO: Title trop long (68 chars) - glp1-sport-performance-sportif-composition-corporelle',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 68 caracteres (max 65)',
    after_suggested: 'Raccourcir le titre a maximum 65 chars',
    claim_original: 'Title depasse la limite SEO',
    realite_actuelle: 'Le titre fait 68 chars, soit 3 chars de trop',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['comment-s-injecter-glp1-guide-pratique-ozempic-wegovy-mounjaro'],
    slug: 'comment-s-injecter-glp1-guide-pratique-ozempic-wegovy-mounjaro',
    title: 'SEO: Title trop long (69 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 69 caracteres (max 65)',
    after_suggested: 'Raccourcir le titre a maximum 65 chars',
    claim_original: 'Title depasse la limite SEO',
    realite_actuelle: 'Le titre fait 69 chars, soit 4 chars de trop',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['wegovy-comprime-oral-pilule-france-date-ema'],
    slug: 'wegovy-comprime-oral-pilule-france-date-ema',
    title: 'SEO: Description trop courte (117 chars, min 120)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'description: 117 caracteres (min 120)',
    after_suggested: 'Allonger la description a minimum 120 chars',
    claim_original: 'Description trop courte pour les SERPs',
    realite_actuelle: 'La description fait 117 chars, soit 3 chars sous le minimum recommande',
    statut: 'approved'
  },
  {
    article_id: articleIdMap['glp1-cout/prix-victoza-france'],
    slug: 'glp1-cout/prix-victoire-france',
    title: 'Sync: Entree DB avec slug typo (glp1-cout/prix-victoire-france)',
    source_agent: 'validator',
    ticket_type: 'sync_issue',
    urgence: 'urgent',
    before_exact: 'Entree articles DB: slug=glp1-cout/prix-victoire-france, is_active=true',
    after_suggested: 'Corriger ou supprimer cette entree DB (typo probable - article existe sous glp1-cout/prix-victoza-france)',
    claim_original: 'Article fantome en base de donnees avec slug typo',
    realite_actuelle: 'Aucun fichier .md pour prix-victoire-france - probablement doublon avec prix-victoza-france',
    statut: 'approved'
  },
];

console.log('Inserting correction tickets...');
let ticketsInserted = 0;
for (const ticket of tickets) {
  const ok = await insert('correction_tickets', ticket);
  if (ok) ticketsInserted++;
}
console.log(`Inserted ${ticketsInserted}/${tickets.length} correction tickets`);
