// scripts/daily-prospection-report.mjs
// Rapport quotidien de prospection GLP-1 — à lancer le soir
// Usage: node scripts/daily-prospection-report.mjs

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TODAY = new Date().toISOString().split('T')[0];
const DATE_FR = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

async function fetchStats() {
  // Stats globales du jour
  const { data: global } = await supabase.rpc('exec_sql', { sql: `
    SELECT
      COUNT(*) FILTER (WHERE DATE(sent_at AT TIME ZONE 'Europe/Paris') = '${TODAY}'::date) AS envoyes_today,
      COUNT(*) FILTER (WHERE DATE(sent_at AT TIME ZONE 'Europe/Paris') = '${TODAY}'::date AND opened_at IS NOT NULL) AS ouverts_today,
      COUNT(*) FILTER (WHERE DATE(sent_at AT TIME ZONE 'Europe/Paris') = '${TODAY}'::date AND replied_at IS NOT NULL) AS reponses_today,
      COUNT(*) FILTER (WHERE DATE(sent_at AT TIME ZONE 'Europe/Paris') = '${TODAY}'::date AND bounced = true) AS bounces_today,
      COUNT(*) FILTER (WHERE replied_at IS NOT NULL) AS total_reponses_all_time,
      COUNT(*) AS total_envoyes_all_time
    FROM prospection_sends
  ` });

  // Détail du jour
  const { data: detail } = await supabase.from('prospection_sends')
    .select('*, prospects(email, company, prospect_type)')
    .gte('sent_at', TODAY + 'T00:00:00')
    .lte('sent_at', TODAY + 'T23:59:59')
    .order('sent_at');

  // A/B test global
  const { data: ab } = await supabase.rpc('exec_sql', { sql: `
    SELECT
      subject_variant,
      COUNT(*) AS envoyes,
      COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS ouverts,
      COUNT(*) FILTER (WHERE replied_at IS NOT NULL) AS reponses,
      ROUND(COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS taux_ouverture_pct
    FROM prospection_sends
    GROUP BY subject_variant
  ` });

  // Par verticale
  const { data: verticales } = await supabase.rpc('exec_sql', { sql: `
    SELECT
      p.prospect_type,
      COUNT(*) AS envoyes,
      COUNT(*) FILTER (WHERE s.opened_at IS NOT NULL) AS ouverts,
      COUNT(*) FILTER (WHERE s.replied_at IS NOT NULL) AS reponses
    FROM prospection_sends s
    JOIN prospects p ON p.id = s.prospect_id
    GROUP BY p.prospect_type
    ORDER BY reponses DESC, ouverts DESC
  ` });

  // Follow-ups en attente
  const { data: followups } = await supabase.rpc('exec_sql', { sql: `
    SELECT
      p.email, p.company, p.prospect_type,
      s.follow_up_step, s.sent_at,
      ROUND(EXTRACT(EPOCH FROM (NOW() - s.sent_at)) / 86400, 1) AS jours_depuis_envoi
    FROM prospection_sends s
    JOIN prospects p ON p.id = s.prospect_id
    WHERE s.replied_at IS NULL AND s.bounced = false
      AND (
        (s.follow_up_step = 0 AND NOW() - s.sent_at > INTERVAL '3 days')
        OR (s.follow_up_step = 1 AND NOW() - s.sent_at > INTERVAL '7 days')
        OR (s.follow_up_step = 2 AND NOW() - s.sent_at > INTERVAL '14 days')
      )
    ORDER BY s.sent_at
  ` });

  return { global, detail, ab, verticales, followups };
}

function delaiLabel(sentAt, openedAt) {
  if (!openedAt) return '—';
  const secs = (new Date(openedAt) - new Date(sentAt)) / 1000;
  if (secs < 30) return `${Math.round(secs)}s <span style="color:#999;font-size:11px">(auto-pixel probable)</span>`;
  if (secs < 300) return `${Math.round(secs)}s`;
  if (secs < 3600) return `${Math.round(secs / 60)}min <span style="color:#16a34a;font-size:11px">✅ lecture humaine probable</span>`;
  return `${Math.round(secs / 3600)}h${Math.round((secs % 3600) / 60)}min <span style="color:#16a34a;font-size:11px">✅ lecture humaine probable</span>`;
}

function insights(stats) {
  const { detail, ab, verticales } = stats;
  const msgs = [];

  // Vraies ouvertures (délai > 5min)
  const vrais = (detail || []).filter(s => s.opened_at && (new Date(s.opened_at) - new Date(s.sent_at)) > 300000);
  if (vrais.length > 0) {
    msgs.push(`🔥 <strong>${vrais.length} lecture(s) humaine(s) probable(s)</strong> : ${vrais.map(s => s.prospects?.company || s.prospects?.email).join(', ')}`);
  }

  // A/B gagnant
  if (ab && ab.length === 2) {
    const [a, b] = ab.sort((x, y) => (y.taux_ouverture_pct || 0) - (x.taux_ouverture_pct || 0));
    if (a.taux_ouverture_pct > b.taux_ouverture_pct) {
      msgs.push(`📊 <strong>Variant ${a.subject_variant.toUpperCase()} en tête</strong> : ${a.taux_ouverture_pct}% vs ${b.taux_ouverture_pct}% d'ouvertures`);
    }
  }

  // Meilleure verticale
  if (verticales && verticales.length > 0) {
    const best = verticales[0];
    const taux = best.envoyes > 0 ? Math.round(best.ouverts / best.envoyes * 100) : 0;
    msgs.push(`🎯 <strong>Meilleure verticale : ${best.prospect_type}</strong> — ${taux}% d'ouvertures`);
  }

  if (msgs.length === 0) msgs.push('Pas encore assez de données pour des insights significatifs.');
  return msgs.map(m => `<li style="margin-bottom:8px">${m}</li>`).join('');
}

function buildHtml(stats, rawDetail) {
  const g = stats.global?.[0] || {};
  const envoyes = parseInt(g.envoyes_today) || 0;
  const ouverts = parseInt(g.ouverts_today) || 0;
  const reponses = parseInt(g.reponses_today) || 0;
  const bounces = parseInt(g.bounces_today) || 0;
  const txOuv = envoyes > 0 ? Math.round(ouverts / envoyes * 100) : 0;
  const txRep = envoyes > 0 ? Math.round(reponses / envoyes * 100) : 0;
  const bounceAlert = bounces / Math.max(envoyes, 1) > 0.05
    ? `<div style="background:#fef2f2;border:1px solid #fca5a5;padding:12px;border-radius:6px;margin:16px 0;color:#dc2626">⚠️ <strong>ALERTE BOUNCE RATE > 5%</strong> — Campagne à surveiller</div>`
    : '';

  const detailRows = (rawDetail || []).map(s => {
    const p = s.prospects || {};
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9">${p.company || '—'}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b">${p.email}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9">${p.prospect_type?.replace(/_/g, ' ')}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${s.subject_variant?.toUpperCase()}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${s.opened_at ? '✅' : '❌'}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;font-size:12px">${delaiLabel(s.sent_at, s.opened_at)}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${s.replied_at ? '✅' : '—'}</td>
      </tr>`;
  }).join('');

  const abRows = (stats.ab || []).map(r => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center"><strong>Variant ${r.subject_variant?.toUpperCase()}</strong></td>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${r.envoyes}</td>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${r.ouverts}</td>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center"><strong>${r.taux_ouverture_pct}%</strong></td>
      <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${r.reponses}</td>
    </tr>`).join('');

  const vertRows = (stats.verticales || []).map(r => {
    const t = r.envoyes > 0 ? Math.round(r.ouverts / r.envoyes * 100) : 0;
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9">${r.prospect_type?.replace(/_/g, ' ')}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${r.envoyes}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${r.ouverts} (${t}%)</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${r.reponses}</td>
      </tr>`;
  }).join('');

  const fuRows = (stats.followups || []).map(r => {
    const step = parseInt(r.follow_up_step);
    const action = step === 0 ? 'Relance J+3' : step === 1 ? 'Preuve valeur J+7' : 'Breakup J+14';
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9">${r.company}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b">${r.email}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9">${r.jours_depuis_envoi}j</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9"><strong>${action}</strong></td>
      </tr>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 20px; }
  .card { background: white; border-radius: 8px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 16px; color: #475569; margin: 0 0 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
  .stat { display: inline-block; margin-right: 24px; margin-bottom: 12px; }
  .stat .val { font-size: 32px; font-weight: 700; color: #0f172a; }
  .stat .lbl { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f1f5f9; padding: 8px; text-align: left; font-size: 12px; color: #64748b; }
  ul { margin: 0; padding-left: 20px; }
</style></head>
<body>
<div class="card">
  <h1>📊 Prospection GLP-1</h1>
  <p style="color:#64748b;margin:0 0 20px">${DATE_FR}</p>
  ${bounceAlert}
  <div>
    <div class="stat"><div class="val">${envoyes}</div><div class="lbl">Envoyés</div></div>
    <div class="stat"><div class="val" style="color:${txOuv > 50 ? '#16a34a' : '#ea580c'}">${ouverts}</div><div class="lbl">Ouverts (${txOuv}%)</div></div>
    <div class="stat"><div class="val" style="color:${reponses > 0 ? '#2563eb' : '#94a3b8'}">${reponses}</div><div class="lbl">Réponses (${txRep}%)</div></div>
    <div class="stat"><div class="val" style="color:${bounces > 0 ? '#dc2626' : '#94a3b8'}">${bounces}</div><div class="lbl">Bounces</div></div>
  </div>
  <p style="font-size:12px;color:#94a3b8;margin-top:16px">Total campagne : ${g.total_envoyes_all_time} envoyés — ${g.total_reponses_all_time} réponses</p>
</div>

<div class="card">
  <h2>Détail des envois du jour</h2>
  <table>
    <tr><th>Société</th><th>Email</th><th>Verticale</th><th>Variant</th><th>Ouvert</th><th>Délai ouverture</th><th>Répondu</th></tr>
    ${detailRows || '<tr><td colspan="7" style="padding:16px;text-align:center;color:#94a3b8">Aucun envoi aujourd\'hui</td></tr>'}
  </table>
</div>

<div class="card">
  <h2>A/B Test — Sujets</h2>
  <table>
    <tr><th>Variant</th><th>Envoyés</th><th>Ouverts</th><th>Taux ouverture</th><th>Réponses</th></tr>
    ${abRows || '<tr><td colspan="5" style="padding:16px;text-align:center;color:#94a3b8">Pas encore de données</td></tr>'}
  </table>
</div>

<div class="card">
  <h2>Performance par verticale</h2>
  <table>
    <tr><th>Verticale</th><th>Envoyés</th><th>Ouverts</th><th>Réponses</th></tr>
    ${vertRows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8">Pas encore de données</td></tr>'}
  </table>
</div>

${(stats.followups || []).length > 0 ? `
<div class="card">
  <h2>Follow-ups à envoyer</h2>
  <table>
    <tr><th>Société</th><th>Email</th><th>Age</th><th>Prochaine action</th></tr>
    ${fuRows}
  </table>
</div>` : ''}

<div class="card">
  <h2>💡 Insights</h2>
  <ul>${insights({ ...stats, detail: rawDetail })}</ul>
</div>

<div style="text-align:center;color:#94a3b8;font-size:11px;margin-top:20px">
  Généré automatiquement le ${DATE_FR} — glp1-france.fr
</div>
</body>
</html>`;
}

async function main() {
  console.log('📊 Génération du rapport quotidien de prospection...');

  // Fetch depuis Supabase directement (sans rpc exec_sql)
  const { data: detail } = await supabase
    .from('prospection_sends')
    .select('*, prospects(email, company, prospect_type)')
    .gte('sent_at', TODAY + 'T00:00:00+00:00')
    .lte('sent_at', TODAY + 'T23:59:59+00:00')
    .order('sent_at');

  const { data: allSends } = await supabase.from('prospection_sends').select('*, prospects(prospect_type)');

  // Calculs manuels
  const envoyes_today = detail?.length || 0;
  const ouverts_today = detail?.filter(s => s.opened_at).length || 0;
  const reponses_today = detail?.filter(s => s.replied_at).length || 0;
  const bounces_today = detail?.filter(s => s.bounced).length || 0;
  const total_envoyes = allSends?.length || 0;
  const total_reponses = allSends?.filter(s => s.replied_at).length || 0;

  // A/B par variant
  const abMap = {};
  for (const s of (allSends || [])) {
    const v = s.subject_variant || 'a';
    if (!abMap[v]) abMap[v] = { subject_variant: v, envoyes: 0, ouverts: 0, reponses: 0 };
    abMap[v].envoyes++;
    if (s.opened_at) abMap[v].ouverts++;
    if (s.replied_at) abMap[v].reponses++;
  }
  const ab = Object.values(abMap).map(r => ({
    ...r,
    taux_ouverture_pct: r.envoyes > 0 ? Math.round(r.ouverts / r.envoyes * 100) : 0
  }));

  // Par verticale
  const vMap = {};
  for (const s of (allSends || [])) {
    const v = s.prospects?.prospect_type || 'autre';
    if (!vMap[v]) vMap[v] = { prospect_type: v, envoyes: 0, ouverts: 0, reponses: 0 };
    vMap[v].envoyes++;
    if (s.opened_at) vMap[v].ouverts++;
    if (s.replied_at) vMap[v].reponses++;
  }
  const verticales = Object.values(vMap).sort((a, b) => b.reponses - a.reponses || b.ouverts - a.ouverts);

  // Follow-ups dus
  const now = new Date();
  const followups = (allSends || []).filter(s => {
    if (s.replied_at || s.bounced) return false;
    const age = (now - new Date(s.sent_at)) / 86400000;
    const step = s.follow_up_step || 0;
    return (step === 0 && age > 3) || (step === 1 && age > 7) || (step === 2 && age > 14);
  }).map(s => ({
    ...s,
    company: s.prospects?.company,
    prospect_type: s.prospects?.prospect_type,
    jours_depuis_envoi: Math.round((now - new Date(s.sent_at)) / 86400000 * 10) / 10
  }));

  const stats = {
    global: [{ envoyes_today, ouverts_today, reponses_today, bounces_today, total_envoyes_all_time: total_envoyes, total_reponses_all_time: total_reponses }],
    ab,
    verticales,
    followups
  };

  const html = buildHtml(stats, detail || []);
  const subject = `📊 Prospection GLP-1 — ${DATE_FR} | ${envoyes_today} envoyés / ${ouverts_today} ouverts / ${reponses_today} réponses`;

  // Envoi email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'robin@glp1-france.fr',
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: '"GLP-1 France" <robin@glp1-france.fr>',
    to: 'robinallainmkg@gmail.com',
    subject,
    html
  });

  console.log(`✅ Rapport envoyé à robinallainmkg@gmail.com`);
  console.log(`   Envoyés: ${envoyes_today} | Ouverts: ${ouverts_today} (${envoyes_today > 0 ? Math.round(ouverts_today/envoyes_today*100) : 0}%) | Réponses: ${reponses_today} | Bounces: ${bounces_today}`);
  if (followups.length > 0) console.log(`   ⚠️ ${followups.length} follow-up(s) en attente`);
}

main().catch(console.error);
