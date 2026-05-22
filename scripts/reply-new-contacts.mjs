/**
 * Réponse automatique aux contacts en statut 'new'
 *
 * Usage: node scripts/reply-new-contacts.mjs [--dry-run]
 *
 * - Détecte les diagnostics, formulaires de contact, victimes de scam
 * - Répond avec un email personnalisé orientant vers le Coach IA
 * - Log en DB + copie IMAP Sent
 * - Met à jour le statut du contact → 'replied'
 */
import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import dotenv from 'dotenv';
dotenv.config();

const DRY_RUN = process.argv.includes('--dry-run');

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

// --- Templates HTML ---

function wrap(body) {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; line-height: 1.7;">
  <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">GLP1 France</h1>
    <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 13px;">Information & accompagnement GLP-1</p>
  </div>
  <div style="padding: 28px; background: #f8faf9; border-radius: 0 0 12px 12px;">
    ${body}
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #6b7280;">
      Bien cordialement,<br>
      <strong style="color: #1a1a2e;">L'équipe GLP1 France</strong><br>
      <a href="${SITE}/?utm_source=email&utm_medium=sav" style="color: #059669; text-decoration: none;">glp1-france.fr</a>
    </p>
    <p style="font-size: 11px; color: #9ca3af; margin-top: 16px;">
      Vous recevez ce message car vous avez utilisé notre site glp1-france.fr.<br>
      Pour ne plus recevoir nos messages, répondez simplement "stop".
    </p>
  </div>
</div>`;
}

function coachCTA(campaign) {
  return `
  <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 10px; padding: 20px; margin: 24px 0; border-left: 4px solid #059669;">
    <p style="margin: 0 0 6px 0; font-weight: 700; color: #065f46;">💬 Notre Coach IA — disponible 24h/24</p>
    <p style="margin: 0 0 14px 0; font-size: 14px; color: #374151;">
      Posez vos questions sur les traitements GLP-1, la nutrition, les effets secondaires,
      la préparation de votre rendez-vous médecin… Il s'adapte à votre situation personnelle.
    </p>
    <a href="${SITE}/?utm_source=email&utm_medium=sav&utm_campaign=${campaign}#coach"
       style="display: inline-block; background: #059669; color: white; padding: 11px 22px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
      Parler au Coach IA →
    </a>
  </div>`;
}

// --- Génération d'email selon le type de contact ---

function buildEmail(contact) {
  const prenom = contact.nom ? contact.nom.split(' ')[0] : null;
  const salut = prenom ? `Bonjour ${prenom}` : 'Bonjour';

  // === DIAGNOSTIC ===
  if (contact.contact_type === 'diagnostic') {
    const rec = contact.message?.match(/Recommandation:\s*(\w+)/i)?.[1] || 'mounjaro';
    const alreadyOnGlp1 = contact.message?.includes('glp1-deja');
    const budgetLimite = contact.message?.includes('budget-limite');
    const recLabel = rec === 'mounjaro' ? 'Mounjaro (tirzépatide)' : rec === 'wegovy' ? 'Wegovy (sémaglutide)' : rec;

    const prixInfo = budgetLimite
      ? `<p>Nous avons noté que le budget est un point important pour vous. Bonne nouvelle : la HAS a rendu un avis favorable au remboursement de Mounjaro en décembre 2025 — les négociations avec l'État sont en cours pour 2026.</p>`
      : '';

    const dejaTraitementInfo = alreadyOnGlp1
      ? `<p>Puisque vous êtes déjà sous traitement GLP-1, notre Coach IA peut vous aider à <strong>optimiser votre suivi</strong> : nutrition adaptée, gestion des effets secondaires, questions à poser à votre médecin pour le prochain palier.</p>`
      : `<p>Prochaine étape : <strong>parler à votre médecin ou endocrinologue</strong> pour obtenir une prescription. Notre Coach IA peut vous aider à préparer ce rendez-vous.</p>`;

    return {
      subject: `Votre diagnostic GLP-1 — Recommandation ${rec.charAt(0).toUpperCase() + rec.slice(1)}`,
      category: 'diagnostic_reply',
      html: wrap(`
      <p>${salut},</p>
      <p>Merci d'avoir complété notre diagnostic GLP-1 ! 🎯</p>
      <p>Votre profil oriente vers <strong>${recLabel}</strong>. C'est l'un des traitements les plus efficaces actuellement disponibles en France, avec des résultats cliniques très solides.</p>
      ${prixInfo}
      ${dejaTraitementInfo}
      <p>Pour aller plus loin, voici nos ressources :</p>
      <ul style="line-height: 1.9;">
        <li><a href="${SITE}/collections/traitements-glp1/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Comparatif complet des traitements GLP-1</a></li>
        <li><a href="${SITE}/collections/glp1-cout/?utm_source=email&utm_medium=sav&utm_campaign=diagnostic_reply" style="color: #059669;">Tous les prix & remboursements</a></li>
      </ul>
      ${coachCTA('diagnostic_reply')}
      <p>N'hésitez pas si vous avez d'autres questions.</p>`)
    };
  }

  // === SCAM / COMMANDE PHYSIQUE ===
  // Physical-product & unauthorized-charge indicators. GLP1 France ne vend
  // aucun produit physique, donc toute mention de flacons/boîtes/gélules/colis
  // ou de prélèvements/débits non sollicités = victime d'un site frauduleux.
  const scamKeywords = [
    'flacon', 'commandé', 'commande', 'livraison', 'pack', 'rembours',
    'boîte', 'boite', 'gélule', 'gelule', 'colis', 'prélèvement', 'prelevement',
    'débit', 'debit'
  ];
  const isScam = contact.subject === 'remboursement' ||
    (contact.message && contact.contact_type === 'contact' &&
      scamKeywords.some(kw => contact.message.toLowerCase().includes(kw)));

  if (isScam) {
    return {
      subject: 'Important : GLP1 France ne vend pas de produits physiques',
      category: 'scam_victim',
      html: wrap(`
      <p>${salut},</p>
      <p>Merci pour votre message. Je dois d'abord vous apporter une précision <strong>très importante</strong> :</p>
      <div style="background: #fff7ed; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-weight: 600; color: #92400e;">⚠️ GLP1 France (glp1-france.fr) est un site d'information et d'orientation — nous ne vendons pas de flacons, d'injections ou de produits physiques.</p>
      </div>
      <p>Si vous avez reçu des produits ou été débité sans l'avoir voulu, vous avez très probablement affaire à <strong>un site frauduleux</strong> usurpant l'image des traitements GLP-1.</p>
      <p><strong>Démarches à suivre rapidement :</strong></p>
      <ol style="line-height: 2.2;">
        <li>Contactez immédiatement votre <strong>banque</strong> pour signaler la transaction et demander un remboursement (chargeback)</li>
        <li>Signalez le site sur <a href="https://www.signal-spam.fr" style="color: #059669;">signal-spam.fr</a> et à la répression des fraudes via <a href="https://www.signalconso.gouv.fr" style="color: #059669;">signalconso.gouv.fr</a></li>
        <li>Conservez toutes les preuves (emails, relevés bancaires, capture d'écran du site)</li>
      </ol>
      <p>Pour toute question médicale sur les traitements GLP-1 légitimes, notre Coach IA peut vous accompagner gratuitement :</p>
      ${coachCTA('scam_victim')}
      <p>Je suis sincèrement désolé que vous ayez vécu cette situation. N'hésitez pas à nous recontacter si vous avez besoin d'autres informations.</p>`)
    };
  }

  // === PROBLÈME ABONNEMENT COACH IA ===
  const isCoachIssue = contact.message && (
    contact.message.toLowerCase().includes('abonnement') ||
    contact.message.toLowerCase().includes('plan') ||
    contact.message.toLowerCase().includes('payé') ||
    contact.message.toLowerCase().includes('payer')
  );

  if (isCoachIssue) {
    return {
      subject: 'Votre abonnement Coach IA — accès à votre plan',
      category: 'support_coaching',
      html: wrap(`
      <p>${salut},</p>
      <p>Merci de nous avoir contactés. Je comprends tout à fait votre situation et je suis là pour vous aider à accéder à votre plan personnalisé.</p>
      <p>Voici comment accéder à votre plan :</p>
      <ol style="line-height: 2.2;">
        <li>Rendez-vous sur <a href="${SITE}/?utm_source=email&utm_medium=sav&utm_campaign=support_coaching#coach" style="color: #059669;">glp1-france.fr</a></li>
        <li>Cliquez sur "Connexion" en haut de page</li>
        <li>Connectez-vous avec votre adresse email <strong>${contact.email}</strong></li>
        <li>Votre plan personnalisé s'affichera dans votre espace</li>
      </ol>
      <p>Si vous n'arrivez pas à vous connecter, répondez à cet email avec votre numéro de commande ou la date du paiement, je vérifierai votre compte manuellement.</p>
      ${coachCTA('support_coaching')}
      <p>Je reste à votre disposition pour tout problème d'accès.</p>`)
    };
  }

  // === RÉPONSE GÉNÉRIQUE ===
  return {
    subject: 'Votre message — GLP1 France',
    category: 'contact_reply',
    html: wrap(`
    <p>${salut},</p>
    <p>Merci de nous avoir contactés via GLP1 France.</p>
    <p>Nous avons bien reçu votre message concernant "<em>${contact.subject || 'votre demande'}</em>" et nous faisons le nécessaire pour vous répondre dans les meilleurs délais.</p>
    <p>En attendant, notre Coach IA peut peut-être déjà vous aider :</p>
    ${coachCTA('contact_reply')}
    <p>Il peut répondre instantanément à de nombreuses questions sur les traitements GLP-1, les prix, les effets secondaires et les démarches pour obtenir une prescription.</p>
    <p>N'hésitez pas si vous avez d'autres questions.</p>`)
  };
}

// --- Envoi email + log ---

async function sendEmail(transporter, to, subject, html) {
  return transporter.sendMail({ from: FROM, to, subject, html });
}

async function saveToImap(imap_cfg, to, subject, html, messageId) {
  const imap = new ImapFlow({ ...imap_cfg, logger: false });
  await imap.connect();
  const raw = [
    `From: ${FROM}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=utf-8`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    '',
    html
  ].join('\r\n');
  await imap.append('INBOX.Sent', raw, ['\\Seen']);
  await imap.logout();
}

async function logToSupabase(contact, subject, html, category) {
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
      category,
      utm_campaign: category,
      sent_at: new Date().toISOString(),
      sent_to_imap: true
    })
  });

  await fetch(`${SUPA_URL}/rest/v1/contacts?id=eq.${contact.id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ status: 'replied', updated_at: new Date().toISOString() })
  });
}

// --- Main ---

async function main() {
  // Fetch all 'new' contacts (exclude tests/newsletter)
  const res = await fetch(
    `${SUPA_URL}/rest/v1/contacts?status=eq.new&contact_type=neq.newsletter&email=not.like.*test*&email=not.like.*example*&order=created_at.asc`,
    { headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` } }
  );
  const contacts = await res.json();

  if (!Array.isArray(contacts) || contacts.length === 0) {
    console.log('Aucun contact nouveau à traiter.');
    return { sent: 0, details: [] };
  }

  console.log(`${contacts.length} contact(s) nouveau(x) trouvé(s).`);
  if (DRY_RUN) console.log('--- DRY RUN — aucun email ne sera envoyé ---\n');

  const transporter = DRY_RUN ? null : nodemailer.createTransport(SMTP_CONFIG);
  const results = [];

  for (const contact of contacts) {
    // Skip Robin's own test diagnostics
    if (contact.email === 'robinallainmkg@gmail.com') {
      console.log(`⏭️  Skip (Robin) ${contact.email}`);
      continue;
    }

    const { subject, html, category } = buildEmail(contact);
    const prenom = contact.nom ? contact.nom.split(' ')[0] : contact.email;
    console.log(`\n📧 ${prenom} <${contact.email}> — type: ${contact.contact_type}`);
    console.log(`   Catégorie: ${category}`);
    console.log(`   Sujet: ${subject}`);

    if (DRY_RUN) {
      console.log('   → [DRY RUN] Non envoyé');
      results.push({ email: contact.email, subject, category, status: 'dry_run' });
      continue;
    }

    try {
      const info = await sendEmail(transporter, contact.email, subject, html);
      console.log(`   ✅ Envoyé → ${info.messageId}`);

      try {
        await saveToImap(IMAP_CONFIG, contact.email, subject, html, info.messageId);
        console.log('   📧 Copie IMAP Sent');
      } catch (e) {
        console.log(`   ⚠️ IMAP: ${e.message}`);
      }

      await logToSupabase(contact, subject, html, category);
      console.log('   📊 DB loggé + status → replied');

      results.push({ email: contact.email, subject, category, status: 'sent' });
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`);
      results.push({ email: contact.email, subject, category, status: 'error', error: err.message });
    }
  }

  const sent = results.filter(r => r.status === 'sent').length;
  console.log(`\n✅ Terminé — ${sent}/${contacts.length} emails envoyés.`);
  return { sent, details: results };
}

main().catch(console.error);
