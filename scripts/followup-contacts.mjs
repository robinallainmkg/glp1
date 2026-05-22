/**
 * Follow-up email pour les contacts sans interaction depuis 2 mois
 *
 * Usage: node scripts/followup-contacts.mjs [--dry-run]
 *
 * - Cherche les contacts de plus de 60 jours sans nouvelle interaction
 * - Envoie un email personnel et humain demandant du feedback
 * - Log en DB + copie IMAP Sent
 * - --dry-run : affiche les emails sans les envoyer
 */
import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import dotenv from 'dotenv';
dotenv.config();

const DRY_RUN = process.argv.includes('--dry-run');
const DAYS_THRESHOLD = 60;

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
const FROM = '"Robin — GLP1 France" <robin@glp1-france.fr>';
const SITE = 'https://glp1-france.fr';

function buildFollowupEmail(contact) {
  const prenom = contact.nom ? contact.nom.split(' ')[0] : null;
  const salut = prenom ? `Bonjour ${prenom}` : 'Bonjour';

  // Adapter le message selon le type de contact
  let contextLine = '';
  if (contact.contact_type === 'diagnostic') {
    const rec = contact.message?.match(/Recommandation:\s*(\w+)/)?.[1];
    if (rec) {
      contextLine = `<p>Il y a quelques semaines, vous aviez compl&eacute;t&eacute; notre diagnostic et nous vous avions orient&eacute; vers <strong>${rec}</strong>. J'esp&egrave;re que ces informations vous ont &eacute;t&eacute; utiles.</p>`;
    } else {
      contextLine = `<p>Il y a quelques semaines, vous aviez compl&eacute;t&eacute; notre diagnostic GLP-1. J'esp&egrave;re que les informations vous ont &eacute;t&eacute; utiles.</p>`;
    }
  } else if (contact.treatment) {
    contextLine = `<p>Il y a quelques semaines, vous nous aviez contact&eacute; au sujet de votre traitement sous <strong>${contact.treatment}</strong>. J'esp&egrave;re que tout se passe bien pour vous.</p>`;
  } else {
    contextLine = `<p>Il y a quelques semaines, vous nous aviez contact&eacute; via notre site. J'esp&egrave;re que les informations vous ont &eacute;t&eacute; utiles.</p>`;
  }

  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.7;">

  <p>${salut},</p>

  ${contextLine}

  <p>Je me permets ce petit message car <strong>GLP1 France est un projet personnel</strong> que j'ai cr&eacute;&eacute; pour aider les patients francophones &agrave; s'y retrouver dans le monde des traitements GLP-1. Ce n'est pas une grande entreprise — c'est moi, Robin, qui essaie de construire quelque chose d'utile.</p>

  <p>J'aimerais beaucoup avoir votre retour, m&ecirc;me rapide :</p>

  <ul style="padding-left: 20px;">
    <li>Est-ce que le site vous a aid&eacute; dans vos recherches ?</li>
    <li>Y a-t-il des informations qui vous manquent ou que vous aimeriez trouver ?</li>
    <li>Avez-vous essay&eacute; notre <a href="${SITE}/?utm_source=email&utm_medium=followup&utm_campaign=feedback_2m#coach" style="color: #059669; text-decoration: none; font-weight: 600;">Coach IA</a> ? Il est con&ccedil;u pour accompagner les patients au quotidien (questions alimentaires, effets secondaires, pr&eacute;paration des rdv m&eacute;decin...)</li>
  </ul>

  <div style="background: #f0fdf4; border-radius: 10px; padding: 20px; margin: 24px 0; border: 1px solid #bbf7d0;">
    <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">&#128172; Le Coach IA — votre accompagnement personnalis&eacute;</p>
    <p style="margin: 0 0 12px 0; font-size: 14px; color: #333;">Un assistant disponible 24h/24 pour r&eacute;pondre &agrave; vos questions sur les GLP-1, adapt&eacute; &agrave; votre situation. Gratuit pour commencer.</p>
    <a href="${SITE}/?utm_source=email&utm_medium=followup&utm_campaign=feedback_2m#coach" style="display: inline-block; background: #059669; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Essayer le Coach IA &rarr;</a>
  </div>

  <p>Vos retours comptent &eacute;norm&eacute;ment pour moi — c'est gr&acirc;ce &agrave; eux que je peux am&eacute;liorer le site et aider davantage de patients.</p>

  <p>Merci d'avance et bon courage dans votre parcours,</p>

  <p style="margin-top: 24px;">
    <strong>Robin</strong><br>
    <span style="color: #666; font-size: 14px;">Fondateur de <a href="${SITE}/?utm_source=email&utm_medium=followup&utm_campaign=feedback_2m" style="color: #059669; text-decoration: none;">GLP1 France</a></span><br>
    <span style="color: #999; font-size: 13px;">robin@glp1-france.fr</span>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
    Vous recevez ce message car vous avez utilis&eacute; notre site glp1-france.fr.
    Si vous ne souhaitez plus recevoir de messages, r&eacute;pondez simplement "stop" &agrave; cet email.
  </p>
</div>`;

  return {
    subject: `${salut.replace(/&[^;]+;/g, '')} — votre avis compte pour GLP1 France`,
    html
  };
}

async function main() {
  const cutoff = new Date(Date.now() - DAYS_THRESHOLD * 86400000).toISOString();

  // 1. Get contacts older than 60 days
  const contactsRes = await fetch(`${SUPA_URL}/rest/v1/contacts?created_at=lt.${cutoff}&status=neq.followup_sent&email=not.like.*test*&email=not.like.*example*&order=created_at.asc`, {
    headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
  });
  const contacts = await contactsRes.json();

  if (!Array.isArray(contacts) || contacts.length === 0) {
    console.log(`Aucun contact de plus de ${DAYS_THRESHOLD} jours sans follow-up.`);
    return;
  }

  // 2. Filter out newsletter-only signups (no real interaction) and own/test address
  const realContacts = contacts.filter(c =>
    c.contact_type !== 'newsletter' &&
    c.email &&
    c.email.toLowerCase() !== 'robinallainmkg@gmail.com'
  );

  console.log(`Contacts eligibles: ${realContacts.length} (sur ${contacts.length} total)`);
  if (DRY_RUN) console.log('--- DRY RUN — aucun email ne sera envoyé ---\n');

  const transporter = DRY_RUN ? null : nodemailer.createTransport(SMTP_CONFIG);

  for (const contact of realContacts) {
    const { subject, html } = buildFollowupEmail(contact);
    const daysSince = Math.round((Date.now() - new Date(contact.created_at).getTime()) / 86400000);

    console.log(`\n📧 ${contact.email} (${contact.nom || 'sans nom'}) — ${daysSince}j`);
    console.log(`   Type: ${contact.contact_type} | Traitement: ${contact.treatment || '-'}`);
    console.log(`   Sujet: ${subject}`);

    if (DRY_RUN) {
      console.log('   → [DRY RUN] Email non envoyé');
      continue;
    }

    try {
      // Send
      const info = await transporter.sendMail({ from: FROM, to: contact.email, subject, html });
      console.log(`   ✅ Envoyé → ${info.messageId}`);

      // IMAP copy
      try {
        const imap = new ImapFlow({ ...IMAP_CONFIG, logger: false });
        await imap.connect();
        const raw = `From: ${FROM}\r\nTo: ${contact.email}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\nDate: ${new Date().toUTCString()}\r\nMessage-ID: ${info.messageId}\r\n\r\n${html}`;
        await imap.append('INBOX.Sent', raw, ['\\Seen']);
        await imap.logout();
        console.log('   📧 Copie IMAP Sent');
      } catch (e) {
        console.log('   ⚠️ IMAP:', e.message);
      }

      // Log in DB
      await fetch(`${SUPA_URL}/rest/v1/email_replies`, {
        method: 'POST',
        headers: {
          'apikey': SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          from_email: 'robin@glp1-france.fr',
          to_email: contact.email,
          subject,
          body_html: html,
          category: 'followup_2m',
          utm_campaign: 'feedback_2m',
          sent_at: new Date().toISOString(),
          sent_to_imap: true
        })
      });

      // Update contact status
      await fetch(`${SUPA_URL}/rest/v1/contacts?id=eq.${contact.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ status: 'followup_sent', updated_at: new Date().toISOString() })
      });
      console.log('   ✏️ Status → followup_sent');

    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`);
    }
  }

  console.log('\nTerminé.');
}

main().catch(console.error);
