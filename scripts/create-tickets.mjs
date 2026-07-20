import 'dotenv/config';
import https from 'https';

const SUPABASE_URL = 'ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function postTicket(ticket) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(ticket);
    const options = {
      hostname: SUPABASE_URL,
      path: '/rest/v1/correction_tickets',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const tickets = [
  {
    article_id: '0de808ea-e3fb-497f-a9e1-3667a7c043f6',
    slug: 'vinaigre-cidre-glp1',
    title: 'SEO: description trop longue (161 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'description: 161 caracteres (max 160)',
    after_suggested: 'Raccourcir la description a 160 chars maximum',
    claim_original: 'Meta description de 161 chars (max 160)',
    realite_actuelle: 'Description 1 caractere au-dessus de la limite, sera tronquee dans les SERPs Google',
    statut: 'approved'
  },
  {
    article_id: 'bebd19dd-238a-4f1d-a7db-cdef5b227817',
    slug: 'effets-secondaires-rybelsus',
    title: 'SEO: description (167 chars) et title (66 chars) trop longs',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 66 chars (max 65), description: 167 chars (max 160)',
    after_suggested: 'Raccourcir title a 65 chars max et description a 160 chars max',
    claim_original: 'Title et description depassent les limites SEO recommandees',
    realite_actuelle: 'Title de 66 chars et description de 167 chars - impact negatif sur le CTR Google',
    statut: 'approved'
  },
  {
    article_id: '373bb7a2-805c-487b-a5cd-ac85d92e9b48',
    slug: 'quand-wegovy-rembourse-france-2026-conditions-calendrier',
    title: 'SEO: description trop longue (161 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'description: 161 caracteres (max 160)',
    after_suggested: 'Raccourcir la description a 160 chars maximum',
    claim_original: 'Meta description de 161 chars (max 160)',
    realite_actuelle: 'Description 1 caractere au-dessus de la limite SEO',
    statut: 'approved'
  },
  {
    article_id: '0602f614-58b0-492c-852b-6e21ec102756',
    slug: 'glp1-menopause-perte-poids-femme-ths',
    title: 'SEO: description trop longue (164 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'description: 164 caracteres (max 160)',
    after_suggested: 'Raccourcir la description a 160 chars maximum',
    claim_original: 'Meta description de 164 chars depasse la limite de 160',
    realite_actuelle: 'Description 4 caracteres au-dessus - sera tronquee dans les SERPs',
    statut: 'approved'
  },
  {
    article_id: 'ed7973d8-f7a0-44d0-a363-b0e3d4cb0545',
    slug: 'nouveau-stylo-ozempic-3ml-2026-changement-utilisation',
    title: 'SEO: description trop longue (161 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'description: 161 caracteres (max 160)',
    after_suggested: 'Raccourcir la description a 160 chars maximum',
    claim_original: 'Meta description de 161 chars (max 160)',
    realite_actuelle: 'Description 1 caractere au-dessus de la limite SEO',
    statut: 'approved'
  },
  {
    article_id: '0d1b199f-bf9d-47a8-8984-dbfa43acff5a',
    slug: 'glp1-osteoporose-risque-osseux',
    title: 'SEO: mainKeyword absent du title',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: "GLP-1 Osteoporose Os Fracture Risque : Guide Prevention 2026" - mainKeyword: "glp1 osteoporose os fracture risque"',
    after_suggested: 'Integrer le mainKeyword exact dans le title pour ameliorer le SEO',
    claim_original: 'mainKeyword non present dans le title de larticle',
    realite_actuelle: 'Le title utilise des majuscules/accents differents du mainKeyword - penalisation potentielle SEO',
    statut: 'approved'
  },
  {
    article_id: 'e1a4569b-27b4-4dab-980c-8a44d77e8ea8',
    slug: 'operation-pour-maigrir-prix',
    title: 'SEO: mainKeyword absent du title',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: "Operation Bariatrique Prix : Sleeve, Bypass et GLP-1" - mainKeyword: "operation bariatrique prix remboursement"',
    after_suggested: 'Ajouter "remboursement" dans le title pour matcher le mainKeyword complet',
    claim_original: 'mainKeyword "operation bariatrique prix remboursement" non present dans le title',
    realite_actuelle: 'Le title manque le mot "remboursement" du mainKeyword - manque a gagner SEO sur requetes longue traine',
    statut: 'approved'
  },
  {
    article_id: '082ad74a-1849-400d-83d4-70183dba55df',
    slug: 'glp1-pancreatite-risque-ozempic-pancreas-symptomes',
    title: 'SEO: title trop long (66 chars)',
    source_agent: 'validator',
    ticket_type: 'seo_issue',
    urgence: 'warning',
    before_exact: 'title: 66 chars (max 65) - "GLP-1 et Pancreatite : Risque Reel, Symptomes et Conduite a"',
    after_suggested: 'Raccourcir le title a 65 chars maximum',
    claim_original: 'Title de 66 chars depasse la limite recommandee de 65 chars',
    realite_actuelle: 'Title sera tronque dans les SERPs Google si 66+ chars - impact CTR',
    statut: 'approved'
  },
  {
    article_id: '86abb456-0000-4000-a000-000000000007',
    slug: 'temoignage-laurent-transformation-glp1',
    title: 'Sync: slug en base different du slug fichier',
    source_agent: 'validator',
    ticket_type: 'sync_issue',
    urgence: 'warning',
    before_exact: 'DB slug: temoignage-laurent-transformation-glp1 / Fichier: laurent-transformation-glp1.md',
    after_suggested: 'Mettre a jour le slug en base OU renommer le fichier pour correspondance',
    claim_original: 'Incoherence slug Supabase vs nom fichier markdown',
    realite_actuelle: 'Le fichier existe sous src/content/temoignages/laurent-transformation-glp1.md mais le slug en base a un prefixe temoignage- supplementaire',
    statut: 'approved'
  },
  {
    article_id: 'd63094aa-0000-4000-a000-000000000008',
    slug: 'temoignage-sophie-transformation-glp1',
    title: 'Sync: slug en base different du slug fichier',
    source_agent: 'validator',
    ticket_type: 'sync_issue',
    urgence: 'warning',
    before_exact: 'DB slug: temoignage-sophie-transformation-glp1 / Fichier: sophie-transformation-glp1.md',
    after_suggested: 'Mettre a jour le slug en base OU renommer le fichier',
    claim_original: 'Incoherence slug Supabase vs nom fichier markdown',
    realite_actuelle: 'Fichier existe sous sophie-transformation-glp1.md mais DB a le slug temoignage-sophie-transformation-glp1',
    statut: 'approved'
  },
  {
    article_id: 'b8bf47ec-0000-4000-a000-000000000009',
    slug: 'temoignage-marie-transformation-glp1',
    title: 'Sync: slug en base different du slug fichier',
    source_agent: 'validator',
    ticket_type: 'sync_issue',
    urgence: 'warning',
    before_exact: 'DB slug: temoignage-marie-transformation-glp1 / Fichier: marie-transformation-glp1.md',
    after_suggested: 'Mettre a jour le slug en base OU renommer le fichier',
    claim_original: 'Incoherence slug Supabase vs nom fichier markdown',
    realite_actuelle: 'Fichier existe sous marie-transformation-glp1.md mais DB a le slug temoignage-marie-transformation-glp1',
    statut: 'approved'
  }
];

let successCount = 0;
for (const ticket of tickets) {
  try {
    const result = await postTicket(ticket);
    if (Array.isArray(result) && result[0]?.id) {
      console.log(`OK: ${ticket.slug} -> ${result[0].id}`);
      successCount++;
    } else if (result?.code) {
      console.log(`ERROR: ${ticket.slug} -> ${result.message}`);
    } else {
      console.log(`RESULT: ${ticket.slug} -> ${JSON.stringify(result).substring(0, 100)}`);
    }
  } catch(e) {
    console.log(`EXCEPTION: ${ticket.slug} -> ${e.message}`);
  }
}

console.log(`\nCreated ${successCount}/${tickets.length} tickets`);
