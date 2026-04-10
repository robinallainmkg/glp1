import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import dotenv from 'dotenv';
dotenv.config();

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
};

const IMAP_CONFIG = {
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT),
  secure: true,
  auth: { user: process.env.IMAP_USER, pass: process.env.IMAP_PASS }
};

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FROM = '"GLP1 France" <robin@glp1-france.fr>';
const SITE = 'https://glp1-france.fr';

// --- Templates par recommandation ---

const TEMPLATES = {
  mounjaro: {
    subject: 'Votre diagnostic GLP-1 — Recommandation Mounjaro',
    body: (answers) => `
    <p>Bonjour,</p>
    <p>Merci d'avoir compl&eacute;t&eacute; notre diagnostic GLP-1. Votre profil orientait vers <strong>Mounjaro (tirz&eacute;patide)</strong> &mdash; un traitement tr&egrave;s efficace avec des r&eacute;sultats souvent sup&eacute;rieurs aux autres GLP-1.</p>
    ${answers?.q4 === 'budget-limite' ? `<p>Nous avons not&eacute; que le budget est un crit&egrave;re important pour vous. Voici ce qu'il faut savoir :</p>` : `<p>Voici les informations essentielles :</p>`}
    <ul style="line-height: 1.8;">
      <li><strong>Prix actuel</strong> : entre 230 et 440 &euro;/mois selon le dosage (non rembours&eacute; pour le moment)</li>
      <li><strong>Bonne nouvelle</strong> : la HAS a donn&eacute; un avis favorable au remboursement en d&eacute;cembre 2025, les n&eacute;gociations sont en cours</li>
      <li><strong>Alternative</strong> : Ozempic est rembours&eacute; &agrave; 30% pour le diab&egrave;te de type 2</li>
      ${answers?.q7 === 'regulier' ? `<li><strong>Votre activit&eacute; physique r&eacute;guli&egrave;re</strong> est un excellent facteur qui amplifie les r&eacute;sultats</li>` : ''}
    </ul>
    <p>&rarr; <a href="${SITE}/collections/traitements-glp1/guide-complet-mounjaro/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Guide complet Mounjaro</a></p>
    <p>&rarr; <a href="${SITE}/collections/glp1-cout/prix-mounjaro-france/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Prix Mounjaro en France</a></p>`
  },

  wegovy: {
    subject: 'Votre diagnostic GLP-1 — Recommandation Wegovy',
    body: (answers) => `
    <p>Bonjour,</p>
    <p>Merci d'avoir compl&eacute;t&eacute; notre diagnostic GLP-1. Votre profil orientait vers <strong>Wegovy (s&eacute;maglutide 2,4 mg)</strong> &mdash; le traitement de r&eacute;f&eacute;rence pour la perte de poids.</p>
    <p>Voici les informations essentielles :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Wegovy</strong> est disponible en France depuis avril 2024</li>
      <li><strong>Prix</strong> : entre 200 et 320 &euro;/mois selon le dosage</li>
      <li><strong>Remboursement</strong> : pas encore pris en charge, mais attendu courant 2026</li>
      ${answers?.q7 === 'regulier' ? `<li><strong>Votre exercice r&eacute;gulier</strong> est un excellent facteur qui amplifie les r&eacute;sultats</li>` : ''}
    </ul>
    <p>&rarr; <a href="${SITE}/collections/traitements-glp1/guide-complet-wegovy/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Guide complet Wegovy</a></p>
    <p>&rarr; <a href="${SITE}/collections/glp1-cout/prix-wegovy-france/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Prix Wegovy en France</a></p>`
  },

  ozempic: {
    subject: 'Votre diagnostic GLP-1 — Recommandation Ozempic',
    body: (answers) => `
    <p>Bonjour,</p>
    <p>Merci d'avoir compl&eacute;t&eacute; notre diagnostic GLP-1. Votre profil orientait vers <strong>Ozempic (s&eacute;maglutide 1 mg)</strong> &mdash; le traitement GLP-1 le plus prescrit en France.</p>
    <p>Voici les informations essentielles :</p>
    <ul style="line-height: 1.8;">
      <li><strong>Ozempic</strong> est rembours&eacute; &agrave; 30% pour le diab&egrave;te de type 2 (hors AMM pour la perte de poids seule)</li>
      <li><strong>Prix</strong> : environ 200 &euro;/mois (avant remboursement &eacute;ventuel)</li>
      <li><strong>Efficacit&eacute;</strong> : perte de poids moyenne de 10-15% en 6 mois</li>
      ${answers?.q7 === 'regulier' ? `<li><strong>Votre activit&eacute; physique r&eacute;guli&egrave;re</strong> est un atout majeur pour maximiser les r&eacute;sultats</li>` : ''}
    </ul>
    <p>&rarr; <a href="${SITE}/collections/traitements-glp1/guide-complet-ozempic/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Guide complet Ozempic</a></p>
    <p>&rarr; <a href="${SITE}/collections/glp1-cout/prix-ozempic-france/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Prix Ozempic en France</a></p>`
  }
};

// --- Helpers ---

function coachCTA(campaign) {
  return `
    <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #059669;">
      <p style="margin: 0 0 8px 0;"><strong>&#128172; Notre Coach IA est disponible 24h/24</strong></p>
      <p style="margin: 0 0 12px 0; font-size: 14px;">Il peut r&eacute;pondre &agrave; toutes vos questions sur les traitements GLP-1, l'alimentation et le suivi.</p>
      <a href="${SITE}/?utm_source=email&utm_medium=sav&utm_campaign=${campaign}#coach" style="display: inline-block; background: #059669; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Parler au Coach IA &rarr;</a>
    </div>`;
}

function wrap(body) {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">GLP1 France</h1>
  </div>
  <div style="padding: 24px; background: #f8faf9; border-radius: 0 0 12px 12px;">
    ${body}
    <p>N'h&eacute;sitez pas &agrave; nous recontacter pour toute question.</p>
    <p>Bien cordialement,<br><strong>L'&eacute;quipe GLP1 France</strong><br>
    <a href="${SITE}/?utm_source=email&utm_medium=sav" style="color: #059669;">glp1-france.fr</a></p>
  </div>
</div>`;
}

async function supaFetch(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...rest,
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    }
  });
  return res;
}

// --- Main ---

async function main() {
  // 1. Fetch new diagnostic contacts that haven't been replied to
  const contactsRes = await supaFetch('contacts?contact_type=eq.diagnostic&status=eq.new&select=*');
  const contacts = await contactsRes.json();

  if (!contacts.length) {
    console.log('Aucun nouveau diagnostic en attente.');
    return;
  }

  console.log(`${contacts.length} diagnostic(s) en attente\n`);

  // 2. Fetch matching diagnostics from diagnostics table
  const emails = contacts.map(c => c.email).filter(Boolean);
  const diagRes = await supaFetch(`diagnostics?email=in.(${emails.map(e => `"${e}"`).join(',')})&select=*`);
  const diagnostics = await diagRes.json();

  // Index by email
  const diagByEmail = {};
  for (const d of diagnostics) diagByEmail[d.email] = d;

  const transporter = nodemailer.createTransport(SMTP_CONFIG);

  for (const contact of contacts) {
    let reco, answers;

    const diag = diagByEmail[contact.email];
    if (diag) {
      // Source: diagnostics table
      reco = diag.recommendation?.toLowerCase();
      answers = diag.answers || {};
    } else {
      // Fallback: parse from contacts.message field
      const recoMatch = contact.message?.match(/Recommandation:\s*(\w+)/i);
      const answersMatch = contact.message?.match(/Réponses:\s*(\{.*\})/);
      reco = recoMatch?.[1]?.toLowerCase();
      try { answers = answersMatch ? JSON.parse(answersMatch[1]) : {}; } catch { answers = {}; }
      if (reco) console.log(`  ℹ️ Fallback contacts.message pour ${contact.email} → ${reco}`);
    }

    if (!reco) {
      console.log(`⚠️ Pas de recommandation trouvée pour ${contact.email}, skip`);
      continue;
    }

    const template = TEMPLATES[reco];
    if (!template) {
      console.log(`⚠️ Template inconnu pour recommandation "${reco}" (${contact.email}), skip`);
      continue;
    }
    const campaign = 'diagnostic_reply';
    const subject = template.subject;
    const html = wrap(template.body(answers) + coachCTA(campaign));

    try {
      // Send SMTP
      const info = await transporter.sendMail({ from: FROM, to: contact.email, subject, html });
      console.log(`✅ SMTP envoyé à ${contact.email} (${reco}) -> ${info.messageId}`);

      // Copy IMAP Sent
      try {
        const imap = new ImapFlow({ ...IMAP_CONFIG, logger: false });
        await imap.connect();
        const raw = [
          `From: ${FROM}`,
          `To: ${contact.email}`,
          `Subject: ${subject}`,
          `Content-Type: text/html; charset=utf-8`,
          `Date: ${new Date().toUTCString()}`,
          `Message-ID: ${info.messageId}`,
          '',
          html
        ].join('\r\n');
        await imap.append('INBOX.Sent', raw, ['\\Seen']);
        await imap.logout();
        console.log('  📧 IMAP copie Sent OK');
      } catch (imapErr) {
        console.log('  ⚠️ IMAP copy failed:', imapErr.message);
      }

      // Log in Supabase email_replies
      const logRes = await supaFetch('email_replies', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          from_email: 'robin@glp1-france.fr',
          to_email: contact.email,
          subject,
          body_html: html,
          category: campaign,
          utm_campaign: campaign,
          sent_at: new Date().toISOString(),
          sent_to_imap: true
        })
      });
      if (logRes.ok) console.log('  📊 Supabase logged');
      else console.log('  ⚠️ Supabase error:', logRes.status);

      // Update contact status → replied
      await supaFetch(`contacts?id=eq.${contact.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ status: 'replied', updated_at: new Date().toISOString() })
      });
      console.log('  ✏️ Contact status → replied\n');

    } catch (err) {
      console.log(`❌ ERREUR ${contact.email}: ${err.message}\n`);
    }
  }

  console.log('Done!');
}

main();
