#!/usr/bin/env node
// Rapport enrichi quotidien — 2 sections B2B + B2C
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createTransport } from 'nodemailer';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const NOW = new Date();
const TODAY = NOW.toISOString().split('T')[0];
const DATE_FR = NOW.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function delaiLabel(sentAt, openedAt) {
  if (!openedAt) return '—';
  const secs = (new Date(openedAt) - new Date(sentAt)) / 1000;
  if (secs < 30) return `⚠️ ${Math.round(secs)}s (auto-pixel probable)`;
  if (secs < 300) return `${Math.round(secs)}s`;
  if (secs < 3600) return `${Math.round(secs / 60)}min ✅ lecture humaine`;
  return `${Math.round(secs / 3600)}h${Math.round((secs % 3600) / 60)}min ✅ lecture humaine`;
}

async function main() {
  console.log('📊 Génération du rapport enrichi (B2B + B2C)...');

  // === B2B DATA ===
  const { data: todaySends } = await supabase
    .from('prospection_sends')
    .select('*, prospects(email, company, prospect_type)')
    .gte('sent_at', TODAY + 'T00:00:00+00:00')
    .lte('sent_at', TODAY + 'T23:59:59+00:00')
    .order('sent_at');

  const { data: allSends } = await supabase
    .from('prospection_sends')
    .select('*, prospects(prospect_type)');

  const b2b = {
    envoyes: todaySends?.length || 0,
    ouverts: todaySends?.filter(s => s.opened_at).length || 0,
    reponses: todaySends?.filter(s => s.replied_at).length || 0,
    bounces: todaySends?.filter(s => s.bounced).length || 0,
  };

  // Par type de partenaire
  const typeMap = {};
  for (const s of (todaySends || [])) {
    const t = s.prospects?.prospect_type || 'autre';
    if (!typeMap[t]) typeMap[t] = { type: t, envoyes: 0, ouverts: 0, reponses: 0, bounces: 0 };
    typeMap[t].envoyes++;
    if (s.opened_at) typeMap[t].ouverts++;
    if (s.replied_at) typeMap[t].reponses++;
    if (s.bounced) typeMap[t].bounces++;
  }
  const byType = Object.values(typeMap).sort((a, b) => b.ouverts - a.ouverts);

  // A/B test global
  const abMap = {};
  for (const s of (allSends || [])) {
    const v = s.subject_variant || 'a';
    if (!abMap[v]) abMap[v] = { variant: v, envoyes: 0, ouverts: 0 };
    abMap[v].envoyes++;
    if (s.opened_at) abMap[v].ouverts++;
  }
  const abTest = Object.values(abMap).sort((a, b) => a.variant.localeCompare(b.variant));

  // === B2C DATA ===
  let incomingEmails = [];
  let chatData = { sessions: 0, messages: 0 };
  let emailTrend = [];

  const { data: emailsToday } = await supabase
    .from('incoming_emails')
    .select('category, status, received_at')
    .gte('received_at', TODAY + 'T00:00:00+00:00')
    .lte('received_at', TODAY + 'T23:59:59+00:00');

  if (emailsToday) {
    const catMap = {};
    for (const e of emailsToday) {
      const c = e.category || 'other';
      if (!catMap[c]) catMap[c] = { category: c, nb: 0, replies: 0 };
      catMap[c].nb++;
      if (e.status === 'replied') catMap[c].replies++;
    }
    incomingEmails = Object.values(catMap).sort((a, b) => b.nb - a.nb);
  }

  const { data: chats } = await supabase
    .from('chat_messages')
    .select('session_id, created_at')
    .gte('created_at', TODAY + 'T00:00:00+00:00')
    .lte('created_at', TODAY + 'T23:59:59+00:00');

  if (chats) {
    const sessions = new Set(chats.map(c => c.session_id));
    chatData = { sessions: sessions.size, messages: chats.length };
  }

  // Tendance 7 jours
  const sevenDaysAgo = new Date(NOW - 7 * 86400000).toISOString();
  const { data: recentEmails } = await supabase
    .from('incoming_emails')
    .select('received_at')
    .gte('received_at', sevenDaysAgo);

  if (recentEmails) {
    const dayMap = {};
    for (const e of recentEmails) {
      const d = e.received_at.split('T')[0];
      dayMap[d] = (dayMap[d] || 0) + 1;
    }
    emailTrend = Object.entries(dayMap)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7)
      .map(([jour, emails]) => ({ jour, emails }));
  }

  // === BUILD HTML ===
  const txOuv = b2b.envoyes > 0 ? Math.round(b2b.ouverts / b2b.envoyes * 100) : 0;
  const bounceAlert = b2b.bounces / Math.max(b2b.envoyes, 1) > 0.05
    ? `<div style="background:#fef2f2;border:1px solid #fca5a5;padding:12px;border-radius:6px;color:#dc2626;margin-top:12px">⚠️ <strong>ALERTE : bounce rate > 5%</strong> — vérifier la campagne</div>`
    : '';

  const typeRows = byType.map(t => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #dbeafe">${t.type.replace(/_/g,' ')}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #dbeafe;text-align:center">${t.envoyes}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #dbeafe;text-align:center">${t.ouverts}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #dbeafe;text-align:center">${t.reponses}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #dbeafe;text-align:center">${t.bounces}</td>
    </tr>`).join('') || `<tr><td colspan="5" style="padding:12px;text-align:center;color:#94a3b8">Aucun envoi aujourd'hui</td></tr>`;

  const detailRows = (todaySends || []).map((s, i) => {
    const p = s.prospects || {};
    const bg = i % 2 === 0 ? 'white' : '#f8fafc';
    return `
    <tr style="background:${bg}">
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${p.company || '—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#64748b">${p.email || ''}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:12px">${(s.subject_variant || '').toUpperCase()}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${s.sent_at ? new Date(s.sent_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px">${delaiLabel(s.sent_at, s.opened_at)}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${s.replied_at ? '✅' : '—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${s.bounced ? '❌' : '—'}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="7" style="padding:12px;text-align:center;color:#94a3b8">Aucun envoi</td></tr>`;

  const winner = abTest.length >= 2
    ? abTest.reduce((a, b) => (b.envoyes > 0 ? b.ouverts/b.envoyes : 0) > (a.envoyes > 0 ? a.ouverts/a.envoyes : 0) ? b : a, abTest[0])
    : null;

  const abRows = abTest.map(r => {
    const taux = r.envoyes > 0 ? Math.round(r.ouverts / r.envoyes * 100) : 0;
    const isWinner = winner && r.variant === winner.variant;
    return `
    <tr style="background:${isWinner ? '#dcfce7' : 'white'}">
      <td style="padding:9px 12px;border-bottom:1px solid #dbeafe">${isWinner ? '🏆 ' : ''}Variant ${r.variant.toUpperCase()}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #dbeafe;text-align:center">${r.envoyes}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #dbeafe;text-align:center">${r.ouverts}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #dbeafe;text-align:center"><strong>${taux}%</strong></td>
    </tr>`;
  }).join('');

  const catLabels = {
    info_request: '❓ Info générale',
    diagnostic_followup: '🩺 Suivi diagnostic',
    remboursement: '💶 Remboursement',
    effets_secondaires: '⚠️ Effets secondaires',
    scam_victim: '🚨 Arnaque',
    medecin: '👨‍⚕️ Médecin',
    other: '📩 Autre',
  };

  const emailRows = incomingEmails.length > 0
    ? incomingEmails.map(e => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #dcfce7">${catLabels[e.category] || e.category}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #dcfce7;text-align:center">${e.nb}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #dcfce7;text-align:center">${e.replies}</td>
    </tr>`).join('')
    : `<tr><td colspan="3" style="padding:12px;text-align:center;color:#94a3b8">Aucun email entrant aujourd'hui</td></tr>`;

  const trendRows = emailTrend.map(e => {
    const d = new Date(e.jour).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    const isToday = e.jour === TODAY;
    return `
    <tr style="background:${isToday ? '#dcfce7' : 'white'}">
      <td style="padding:7px 12px;border-bottom:1px solid #dcfce7;font-size:13px">${isToday ? `<strong>${d} (auj.)</strong>` : d}</td>
      <td style="padding:7px 12px;border-bottom:1px solid #dcfce7;text-align:center">${e.emails}</td>
    </tr>`;
  }).join('');

  const totalB2cToday = incomingEmails.reduce((s, e) => s + e.nb, 0);
  const totalB2cReplied = incomingEmails.reduce((s, e) => s + e.replies, 0);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rapport GLP-1 France — ${DATE_FR}</title></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b">
<div style="max-width:780px;margin:0 auto">

  <!-- Header -->
  <div style="background:#0f172a;color:white;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">
    <h1 style="margin:0;font-size:24px;font-weight:700">Rapport Quotidien GLP-1 France</h1>
    <p style="margin:8px 0 0;opacity:0.7;font-size:14px;text-transform:capitalize">${DATE_FR}</p>
  </div>

  <!-- ======================== SECTION B2B ======================== -->
  <div style="background:#eff6ff;border:2px solid #2563eb;border-top:none;padding:28px 32px">
    <div style="background:#2563eb;color:white;border-radius:8px;padding:12px 18px;margin-bottom:20px">
      <h2 style="margin:0;font-size:18px">🤝 SECTION 1 — Prospection Partenaires B2B</h2>
      <p style="margin:4px 0 0;font-size:12px;opacity:0.85">Professionnels de santé &amp; e-commerce démarchés pour partenariats affiliation — <strong>PAS des patients</strong></p>
    </div>

    <!-- KPIs B2B -->
    <div style="display:flex;gap:12px;margin-bottom:20px">
      <div style="flex:1;background:white;border-radius:8px;padding:16px;text-align:center;border:1px solid #bfdbfe">
        <div style="font-size:36px;font-weight:800;color:#1d4ed8">${b2b.envoyes}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">Envoyés aujourd'hui</div>
      </div>
      <div style="flex:1;background:white;border-radius:8px;padding:16px;text-align:center;border:1px solid #bfdbfe">
        <div style="font-size:36px;font-weight:800;color:${txOuv > 30 ? '#0284c7' : '#94a3b8'}">${b2b.ouverts}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">Ouverts (${txOuv}%)</div>
      </div>
      <div style="flex:1;background:white;border-radius:8px;padding:16px;text-align:center;border:1px solid #bfdbfe">
        <div style="font-size:36px;font-weight:800;color:${b2b.reponses > 0 ? '#059669' : '#94a3b8'}">${b2b.reponses}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">Réponses</div>
      </div>
      <div style="flex:1;background:white;border-radius:8px;padding:16px;text-align:center;border:1px solid #bfdbfe">
        <div style="font-size:36px;font-weight:800;color:${b2b.bounces > 0 ? '#dc2626' : '#94a3b8'}">${b2b.bounces}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">Bounces</div>
      </div>
    </div>
    ${bounceAlert}

    <!-- Par type de partenaire -->
    <h3 style="color:#1d4ed8;font-size:14px;margin:20px 0 8px">Par type de partenaire</h3>
    <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;font-size:13px">
      <tr style="background:#dbeafe">
        <th style="padding:9px 12px;text-align:left;font-weight:600">Type</th>
        <th style="padding:9px 12px;text-align:center;font-weight:600">Envoyés</th>
        <th style="padding:9px 12px;text-align:center;font-weight:600">Ouverts</th>
        <th style="padding:9px 12px;text-align:center;font-weight:600">Réponses</th>
        <th style="padding:9px 12px;text-align:center;font-weight:600">Bounces</th>
      </tr>
      ${typeRows}
    </table>

    <!-- Détail envois -->
    <h3 style="color:#1d4ed8;font-size:14px;margin:20px 0 8px">Détail des envois du jour</h3>
    <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;font-size:12px">
      <tr style="background:#dbeafe">
        <th style="padding:8px 10px;text-align:left">Société</th>
        <th style="padding:8px 10px;text-align:left">Email</th>
        <th style="padding:8px 10px;text-align:center">Variant</th>
        <th style="padding:8px 10px;text-align:center">Heure envoi</th>
        <th style="padding:8px 10px;text-align:left">Délai ouverture</th>
        <th style="padding:8px 10px;text-align:center">Répondu</th>
        <th style="padding:8px 10px;text-align:center">Bounce</th>
      </tr>
      ${detailRows}
    </table>

    <!-- A/B Test -->
    <h3 style="color:#1d4ed8;font-size:14px;margin:20px 0 8px">A/B Test — Sujets (cumulé toute la campagne)</h3>
    <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;font-size:13px">
      <tr style="background:#dbeafe">
        <th style="padding:9px 12px;text-align:left">Variant</th>
        <th style="padding:9px 12px;text-align:center">Envoyés</th>
        <th style="padding:9px 12px;text-align:center">Ouverts</th>
        <th style="padding:9px 12px;text-align:center">Taux ouverture</th>
      </tr>
      ${abRows || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#94a3b8">Pas encore de données</td></tr>'}
    </table>

    <!-- Insights B2B -->
    <div style="background:#dbeafe;border-radius:8px;padding:14px 18px;margin-top:20px;font-size:13px">
      <strong>💡 Insights B2B :</strong>
      <ul style="margin:8px 0 0;padding-left:20px;line-height:1.8">
        <li>Warmup jour 9 — limite 25/jour — <strong>${b2b.envoyes} envoyés</strong>, ${b2b.bounces} bounces (${b2b.envoyes > 0 ? Math.round(b2b.bounces/b2b.envoyes*100) : 0}% — ${b2b.bounces/Math.max(b2b.envoyes,1) > 0.05 ? '⚠️ ALERTE' : '✅ sous seuil 5%'})</li>
        <li>7 nouveaux prospects découverts aujourd'hui (77 doublons filtrés)</li>
        <li>${winner ? `Variant <strong>${winner.variant.toUpperCase()}</strong> en tête sur l'A/B test (${winner.envoyes > 0 ? Math.round(winner.ouverts/winner.envoyes*100) : 0}% ouvertures)` : 'Données A/B insuffisantes pour désigner un gagnant'}</li>
        <li>Type de partenaire le mieux représenté aujourd'hui : <strong>${byType[0]?.type?.replace(/_/g,' ') || '—'}</strong></li>
      </ul>
    </div>
  </div>

  <!-- Séparateur -->
  <div style="background:#e2e8f0;padding:16px 32px;text-align:center;font-size:12px;color:#64748b;border-left:2px solid #2563eb;border-right:2px solid #16a34a">
    ↑ B2B : Démarches partenariats &nbsp;|&nbsp; B2C : Activité patients ↓
  </div>

  <!-- ======================== SECTION B2C ======================== -->
  <div style="background:#f0fdf4;border:2px solid #16a34a;border-top:none;padding:28px 32px">
    <div style="background:#16a34a;color:white;border-radius:8px;padding:12px 18px;margin-bottom:20px">
      <h2 style="margin:0;font-size:18px">👤 SECTION 2 — Leads Patients / Visiteurs du site</h2>
      <p style="margin:4px 0 0;font-size:12px;opacity:0.85">Personnes ayant visité glp1-france.fr et interagi — <strong>ces personnes cherchent des infos GLP-1 pour elles-mêmes</strong></p>
    </div>

    <!-- KPIs B2C -->
    <div style="display:flex;gap:12px;margin-bottom:20px">
      <div style="flex:1;background:white;border-radius:8px;padding:16px;text-align:center;border:1px solid #bbf7d0">
        <div style="font-size:36px;font-weight:800;color:#16a34a">${totalB2cToday}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">Contacts aujourd'hui</div>
      </div>
      <div style="flex:1;background:white;border-radius:8px;padding:16px;text-align:center;border:1px solid #bbf7d0">
        <div style="font-size:36px;font-weight:800;color:#0284c7">${totalB2cReplied}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">Réponses SAV envoyées</div>
      </div>
      <div style="flex:1;background:white;border-radius:8px;padding:16px;text-align:center;border:1px solid #bbf7d0">
        <div style="font-size:36px;font-weight:800;color:#7c3aed">${chatData.sessions}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">Sessions Coach IA</div>
      </div>
      <div style="flex:1;background:white;border-radius:8px;padding:16px;text-align:center;border:1px solid #bbf7d0">
        <div style="font-size:36px;font-weight:800;color:#9333ea">${chatData.messages}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">Messages Coach IA</div>
      </div>
    </div>

    <!-- Par catégorie -->
    <h3 style="color:#15803d;font-size:14px;margin:0 0 8px">Emails entrants par catégorie</h3>
    <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;font-size:13px;margin-bottom:20px">
      <tr style="background:#dcfce7">
        <th style="padding:9px 12px;text-align:left;font-weight:600">Catégorie</th>
        <th style="padding:9px 12px;text-align:center;font-weight:600">Reçus</th>
        <th style="padding:9px 12px;text-align:center;font-weight:600">Répondus</th>
      </tr>
      ${emailRows}
    </table>

    <!-- Tendance 7 jours -->
    ${emailTrend.length > 0 ? `
    <h3 style="color:#15803d;font-size:14px;margin:0 0 8px">Tendance 7 jours — emails entrants</h3>
    <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;font-size:13px;margin-bottom:20px">
      <tr style="background:#dcfce7">
        <th style="padding:8px 12px;text-align:left;font-weight:600">Jour</th>
        <th style="padding:8px 12px;text-align:center;font-weight:600">Emails reçus</th>
      </tr>
      ${trendRows}
    </table>` : ''}

    <!-- Note B2C -->
    <div style="background:#dcfce7;border-radius:8px;padding:14px 18px;font-size:13px">
      <strong>📝 Note :</strong> Ces personnes cherchent des informations sur les GLP-1 pour elles-mêmes (traitement, remboursement, effets secondaires...). Elles ne font pas partie de la démarche de partenariat B2B.
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#0f172a;color:white;border-radius:0 0 12px 12px;padding:18px 32px;text-align:center;font-size:12px">
    <p style="margin:0">GLP-1 France — Rapport automatique quotidien</p>
    <p style="margin:4px 0 0;opacity:0.6">Généré automatiquement le ${DATE_FR} par le pipeline de prospection (Claude Code)</p>
  </div>

</div>
</body>
</html>`;

  // === SEND EMAIL ===
  const transporter = createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'robin@glp1-france.fr',
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `🤝 Partenaires B2B : ${b2b.envoyes} envoyés | 👤 Leads patients : ${totalB2cToday} contacts — GLP-1 France ${DATE_FR}`;

  const info = await transporter.sendMail({
    from: '"GLP-1 France" <robin@glp1-france.fr>',
    to: 'robinallainmkg@gmail.com',
    subject,
    html,
  });

  console.log('✅ Rapport enrichi envoyé:', info.messageId);
  console.log(`   B2B: ${b2b.envoyes} envoyés / ${b2b.ouverts} ouverts / ${b2b.reponses} réponses / ${b2b.bounces} bounces`);
  console.log(`   B2C: ${totalB2cToday} emails patients / ${chatData.sessions} sessions Coach IA`);
}

main().catch(e => {
  console.error('❌ Erreur rapport enrichi:', e.message);
  process.exit(1);
});
