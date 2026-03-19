// Temporary script to insert SEO audit results
// Run with: node scripts/insert_seo_audit_tmp.mjs

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';
const AGENT_RUN_ID = '0ed7a7b1-eecb-4b26-9705-c050fd200789';

const rows = [
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'crawlability',
    severity: 'ok',
    page_url: '/',
    issue_title: 'robots.txt configuré',
    issue_detail: 'robots.txt présent avec Disallow sur /admin/, sitemap pointé correctement',
    recommendation: 'Aucune action requise'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'crawlability',
    severity: 'ok',
    page_url: '/',
    issue_title: 'Sitemap XML présent',
    issue_detail: 'sitemap-index.xml + sitemap-0.xml + sitemap.xml générés au build',
    recommendation: 'Aucune action requise'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'internal_links',
    severity: 'ok',
    page_url: '/',
    issue_title: 'Aucun lien <a> cassé',
    issue_detail: '0 lien cassé détecté sur 172 liens internes analysés (50 pages)',
    recommendation: 'Aucune action requise'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'headings',
    severity: 'critical',
    page_url: '/alternatives-glp1/alternatives-naturelles-glp1/',
    issue_title: 'H1 manquant',
    issue_detail: 'Page de redirection sans balise <h1> - page non crawlable correctement',
    recommendation: 'Ajouter un H1 ou supprimer la page de redirection si doublon de /collections/alternatives-glp1/alternatives-naturelles-ozempic/'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'meta_tags',
    severity: 'warning',
    page_url: '/alternatives-glp1/alternatives-naturelles-glp1/',
    issue_title: 'Title trop long (69 chars)',
    issue_detail: 'Title: "Redirecting to: https://glp1-france.fr/collections/alternatives-glp1/alternatives-naturelles-ozempic/"',
    recommendation: 'Corriger la page de redirection ou la supprimer'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'meta_tags',
    severity: 'warning',
    page_url: '/alternatives-glp1/alternatives-naturelles-glp1/',
    issue_title: 'Meta description manquante',
    issue_detail: 'Aucune balise <meta name="description"> sur cette page',
    recommendation: 'Ajouter une meta description ou supprimer la page si doublon'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'meta_tags',
    severity: 'warning',
    page_url: '/annuaire/',
    issue_title: 'Meta description trop longue (175 chars)',
    issue_detail: 'La description dépasse la limite recommandée de 160 caractères',
    recommendation: 'Raccourcir la meta description à moins de 160 caractères'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'meta_tags',
    severity: 'warning',
    page_url: '/collections/alternatives-glp1/',
    issue_title: 'Title trop long (64 chars)',
    issue_detail: 'Title: "Alternatives aux GLP-1 - Solutions naturelles et médicaments"',
    recommendation: 'Raccourcir le title à moins de 60 caractères'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'performance',
    severity: 'warning',
    page_url: '/articles/',
    issue_title: 'Page HTML trop volumineuse (696.6KB)',
    issue_detail: 'dist/articles/index.html dépasse largement 100KB - impact sur Core Web Vitals',
    recommendation: "Paginer la liste des articles ou implémenter le lazy loading"
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'performance',
    severity: 'warning',
    page_url: '/collections/effets-secondaires-glp1/',
    issue_title: 'Page HTML trop volumineuse (195.6KB)',
    issue_detail: 'Page de collection effets-secondaires-glp1 dépasse 100KB',
    recommendation: 'Paginer ou réduire le contenu affiché sur la page de collection'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'performance',
    severity: 'warning',
    page_url: '/collections/traitements-glp1/',
    issue_title: 'Page HTML trop volumineuse (180.2KB)',
    issue_detail: 'Page de collection traitements-glp1 dépasse 100KB',
    recommendation: 'Paginer ou réduire le contenu affiché'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'performance',
    severity: 'warning',
    page_url: '/collections/glp1-cout/',
    issue_title: 'Page HTML trop volumineuse (149.4KB)',
    issue_detail: 'Page de collection glp1-cout dépasse 100KB',
    recommendation: 'Paginer ou réduire le contenu affiché'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'performance',
    severity: 'warning',
    page_url: '/collections/regime-glp1/',
    issue_title: 'Page HTML trop volumineuse (144.5KB)',
    issue_detail: 'Page de collection regime-glp1 dépasse 100KB',
    recommendation: 'Paginer ou réduire le contenu affiché'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'performance',
    severity: 'warning',
    page_url: '/',
    issue_title: "Page d'accueil trop volumineuse (119.7KB)",
    issue_detail: 'dist/index.html dépasse 100KB',
    recommendation: 'Réduire le contenu de la homepage'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'performance',
    severity: 'info',
    page_url: '/',
    issue_title: 'Total site: 52.8MB, 279 HTML, 31 CSS, 22 JS',
    issue_detail: 'Taille totale du site - JS principal: 119.7KB, CSS principal: 89.6KB',
    recommendation: 'Envisager le code splitting et la minification agressive'
  },
  {
    agent_run_id: AGENT_RUN_ID,
    audit_type: 'internal_links',
    severity: 'info',
    page_url: '/',
    issue_title: 'Pages potentiellement orphelines',
    issue_detail: "84 pages non liées depuis les 50 pages échantillonnées (peut être normal)",
    recommendation: 'Vérifier le maillage interne des pages de collections et articles'
  }
];

async function insertRows() {
  // First delete the test row we already inserted
  const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/seo_audit_results?agent_run_id=eq.${AGENT_RUN_ID}&issue_title=eq.robots.txt configure`, {
    method: 'DELETE',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    }
  });
  console.log('Deleted test row:', deleteRes.status);

  // Insert all rows
  const res = await fetch(`${SUPABASE_URL}/rest/v1/seo_audit_results`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(rows)
  });

  const text = await res.text();
  console.log('Insert status:', res.status);
  if (text) console.log('Response:', text);

  if (res.status === 201 || res.status === 200) {
    console.log(`Successfully inserted ${rows.length} seo_audit_results rows`);
  } else {
    console.error('Insert failed:', text);
  }
}

// Step 2: Check article slugs
async function checkSlugs() {
  const slugs = ['alternatives-naturelles-glp1', 'alternatives-naturelles-ozempic', 'annuaire'];
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/articles?slug=in.(${slugs.join(',')})&is_active=eq.true&select=id,title,slug`,
    {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      }
    }
  );
  const data = await res.json();
  console.log('\nFound articles:', JSON.stringify(data, null, 2));
  return data;
}

// Step 3: Create correction tickets
async function createTickets(articles) {
  let ticketsCreated = 0;

  // Ticket for H1 missing on alternatives-naturelles-glp1
  const altArticle = articles.find(a => a.slug === 'alternatives-naturelles-glp1');
  if (altArticle) {
    const ticketData = {
      article_id: altArticle.id,
      slug: altArticle.slug,
      title: altArticle.title,
      source_agent: 'seo-audit',
      ticket_type: 'heading_issue',
      urgence: 'urgent',
      before_exact: 'Page sans balise H1 - page de redirection',
      after_suggested: 'Ajouter un H1 pertinent ou supprimer la page si doublon de /collections/alternatives-glp1/alternatives-naturelles-ozempic/',
      claim_original: 'H1 manquant sur /alternatives-glp1/alternatives-naturelles-glp1/',
      realite_actuelle: 'Aucune balise h1 détectée dans le HTML généré',
      statut: 'approved'
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/correction_tickets`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(ticketData)
    });
    const data = await res.json();
    if (res.status === 201) {
      console.log('\nCreated H1 ticket for alternatives-naturelles-glp1:', data[0]?.id);
      ticketsCreated++;
    } else {
      console.log('\nH1 ticket result:', res.status, JSON.stringify(data));
    }
  } else {
    console.log('\nNo article found for slug: alternatives-naturelles-glp1');
  }

  // Ticket for annuaire meta description
  const annuaireArticle = articles.find(a => a.slug === 'annuaire');
  if (annuaireArticle) {
    const ticketData = {
      article_id: annuaireArticle.id,
      slug: annuaireArticle.slug,
      title: annuaireArticle.title,
      source_agent: 'seo-audit',
      ticket_type: 'meta_description',
      urgence: 'normal',
      before_exact: 'Meta description trop longue (175 chars) sur /annuaire/',
      after_suggested: 'Raccourcir la meta description à moins de 160 caractères',
      claim_original: 'Meta description dépasse la limite recommandée de 160 caractères',
      realite_actuelle: 'Meta description de 175 caractères détectée',
      statut: 'approved'
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/correction_tickets`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(ticketData)
    });
    const data = await res.json();
    if (res.status === 201) {
      console.log('Created meta description ticket for annuaire:', data[0]?.id);
      ticketsCreated++;
    } else {
      console.log('Annuaire ticket result:', res.status, JSON.stringify(data));
    }
  } else {
    console.log('No article found for slug: annuaire');
  }

  console.log(`\nTotal correction_tickets created: ${ticketsCreated}`);
  return ticketsCreated;
}

async function main() {
  await insertRows();
  const articles = await checkSlugs();
  await createTickets(articles);
}

main().catch(console.error);
