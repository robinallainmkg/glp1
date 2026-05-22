/**
 * Rapport quotidien envoyé à Robin
 *
 * Usage: node scripts/daily-report.mjs
 *
 * - Résume les contacts entrants du jour / de la semaine
 * - Activité Coach IA
 * - Emails envoyés
 * - Funnel conversion (diagnostics → coach → paiement)
 */
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
};

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FROM = '"GLP1 France Bot" <robin@glp1-france.fr>';
const REPORT_TO = process.env.REPORT_EMAIL || 'robinallainmkg@gmail.com';
const SITE = 'https://glp1-france.fr';

async function query(endpoint) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${endpoint}`, {
    headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
  });
  return res.json();
}

async function sql(q) {
  const res = await fetch(`${SUPA_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: q })
  });
  return res.json();
}

function badge(n, color = '#059669') {
  const bg = n > 0 ? color : '#9ca3af';
  return `<span style="background:${bg};color:white;padding:2px 8px;border-radius:12px;font-size:13px;font-weight:700;">${n}</span>`;
}

function row(label, value, highlight = false) {
  const bg = highlight ? '#f0fdf4' : 'white';
  return `<tr style="background:${bg};">
    <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;color:#374151;">${label}</td>
    <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;">${value}</td>
  </tr>`;
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  // --- Fetch data in parallel ---

  const [
    contactsToday,
    contactsWeek,
    coachMsgsToday,
    coachMsgsWeek,
    emailsSentToday,
    emailsSentWeek,
    newContacts,
    incomingEmailsWeek,
    diagnosticsDetailed,
    coachConversationsWeek,
    gaDaily,
    gaTopPages,
  ] = await Promise.all([
    // Contacts aujourd'hui
    fetch(`${SUPA_URL}/rest/v1/contacts?created_at=gte.${today}T00:00:00Z&contact_type=neq.newsletter&email=not.like.*test*&email=not.like.*example*&select=id,email,nom,contact_type,status,created_at`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // Contacts cette semaine
    fetch(`${SUPA_URL}/rest/v1/contacts?created_at=gte.${weekAgo}T00:00:00Z&contact_type=neq.newsletter&email=not.like.*test*&email=not.like.*example*&select=id,email,nom,contact_type,status,created_at`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // Coach IA messages aujourd'hui
    fetch(`${SUPA_URL}/rest/v1/coach_messages?created_at=gte.${today}T00:00:00Z&select=id,created_at`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // Coach IA messages cette semaine
    fetch(`${SUPA_URL}/rest/v1/coach_messages?created_at=gte.${weekAgo}T00:00:00Z&select=id,created_at`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // Emails envoyés aujourd'hui
    fetch(`${SUPA_URL}/rest/v1/email_replies?created_at=gte.${today}T00:00:00Z&select=to_email,subject,category,sent_at`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // Emails envoyés cette semaine
    fetch(`${SUPA_URL}/rest/v1/email_replies?created_at=gte.${weekAgo}T00:00:00Z&select=to_email,subject,category,sent_at`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // Contacts new non traités
    fetch(`${SUPA_URL}/rest/v1/contacts?status=eq.new&contact_type=neq.newsletter&email=not.like.*test*&email=not.like.*example*&select=id,email,nom,contact_type,subject,created_at`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // Emails entrants cette semaine
    fetch(`${SUPA_URL}/rest/v1/incoming_emails?received_at=gte.${weekAgo}T00:00:00Z&select=from_email,from_name,subject,category,status,received_at`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // Diagnostics détaillés (7j) avec message complet
    fetch(`${SUPA_URL}/rest/v1/contacts?created_at=gte.${weekAgo}T00:00:00Z&contact_type=eq.diagnostic&email=not.like.*test*&email=not.like.*example*&email=neq.robinallainmkg@gmail.com&select=id,email,nom,message,treatment,concerns,age,status,created_at&order=created_at.desc`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // Conversations Coach IA (7j) avec messages
    fetch(`${SUPA_URL}/rest/v1/coach_messages?created_at=gte.${weekAgo}T00:00:00Z&select=session_id,role,content,created_at,intent&order=created_at.asc`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()),

    // GA — tendance 7 derniers jours (totaux par jour)
    fetch(`${SUPA_URL}/rest/v1/ga_metrics?date=gte.${weekAgo}&select=date,pageviews,sessions,new_users&order=date.asc`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()).then(rows => {
      if (!Array.isArray(rows)) return [];
      const byDate = {};
      for (const r of rows) {
        if (!byDate[r.date]) byDate[r.date] = { date: r.date, pageviews: 0, sessions: 0, new_users: 0 };
        byDate[r.date].pageviews += r.pageviews || 0;
        byDate[r.date].sessions += r.sessions || 0;
        byDate[r.date].new_users += r.new_users || 0;
      }
      return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    }),

    // GA — top pages du dernier jour disponible
    fetch(`${SUPA_URL}/rest/v1/ga_metrics?select=date,page_path,pageviews,sessions,avg_time_on_page,new_users&order=date.desc,pageviews.desc`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    }).then(r => r.json()).then(rows => {
      if (!Array.isArray(rows) || rows.length === 0) return { date: null, pages: [] };
      const latestDate = rows[0].date;
      return { date: latestDate, pages: rows.filter(r => r.date === latestDate).slice(0, 15) };
    }),
  ]);

  // --- Analyse ---
  const diagnosticsWeek = Array.isArray(diagnosticsDetailed) ? diagnosticsDetailed : [];
  const formsWeek = Array.isArray(contactsWeek) ? contactsWeek.filter(c => c.contact_type === 'contact') : [];
  const coachSessionsWeek = new Set(Array.isArray(coachConversationsWeek) ? coachConversationsWeek.map(m => m.session_id) : []).size;
  const pendingCount = Array.isArray(newContacts) ? newContacts.filter(c => c.email !== 'robinallainmkg@gmail.com').length : 0;
  const pendingContacts = Array.isArray(newContacts) ? newContacts.filter(c => c.email !== 'robinallainmkg@gmail.com') : [];

  // KPI j-1 — comparaison via Date() pour gérer les formats Supabase (espace au lieu de T)
  const yStart = new Date(yesterday + 'T00:00:00Z').getTime();
  const yEnd   = new Date(today    + 'T00:00:00Z').getTime();
  const inY = ts => { const t = new Date(ts).getTime(); return t >= yStart && t < yEnd; };

  const diagYesterday  = diagnosticsWeek.filter(c => inY(c.created_at));
  const formsYesterday = formsWeek.filter(c => inY(c.created_at));
  const sessionsYesterday = new Set(
    (Array.isArray(coachConversationsWeek) ? coachConversationsWeek : [])
      .filter(m => inY(m.created_at))
      .map(m => m.session_id)
  ).size;
  const emailsInYesterday  = (Array.isArray(incomingEmailsWeek) ? incomingEmailsWeek : []).filter(e => inY(e.received_at)).length;
  const emailsOutYesterday = (Array.isArray(emailsSentWeek) ? emailsSentWeek : []).filter(e => inY(e.sent_at)).length;

  // Date affichage
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // --- Sections HTML ---

  function contactsList(contacts) {
    if (!Array.isArray(contacts) || contacts.length === 0) return '<p style="color:#9ca3af;font-size:14px;margin:8px 0;">Aucun contact</p>';
    return contacts.slice(0, 10).map(c => {
      const label = c.contact_type === 'diagnostic' ? '🔍 Diagnostic' :
                    c.contact_type === 'contact' ? '📬 Formulaire' : c.contact_type;
      const date = new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      const statusBg = c.status === 'replied' ? '#d1fae5' : '#fef3c7';
      const statusColor = c.status === 'replied' ? '#065f46' : '#92400e';
      return `<div style="background:white;border-radius:8px;padding:12px 14px;margin:6px 0;border:1px solid #e5e7eb;display:flex;align-items:center;gap:12px;">
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:600;color:#1a1a2e;">${label} — ${c.nom || c.email}</div>
          <div style="font-size:12px;color:#6b7280;">${c.email} · ${date}</div>
        </div>
        <span style="background:${statusBg};color:${statusColor};padding:3px 9px;border-radius:12px;font-size:11px;font-weight:600;">${c.status}</span>
      </div>`;
    }).join('');
  }

  // Labels lisibles pour les réponses du diagnostic
  const DIAG_LABELS = {
    q1: 'Objectif principal',
    q2: 'IMC / Situation',
    q3: 'Fréquence sport',
    q4: 'Budget',
    q5: 'Priorité',
    q6: 'Santé',
    q7: 'Alimentation',
    q8: 'Tolérance effets secondaires',
  };
  const DIAG_VALUES = {
    poids: 'Perte de poids', diabete: 'Diabète type 2', 'poids-diabete': 'Poids + Diabète',
    surpoids: 'Surpoids (IMC 25-29)', 'obesite-1': 'Obésité modérée (IMC 30-34)', 'obesite-2': 'Obésité sévère (IMC 35+)', normal: 'Poids normal',
    jamais: 'Jamais', 'quelques-fois': 'Quelquefois', regulier: 'Régulier', intensif: 'Intensif',
    'budget-serre': 'Budget serré (<100€/mois)', 'budget-moyen': 'Budget moyen (100-250€/mois)', 'budget-large': 'Budget large (>250€/mois)',
    rapide: 'Efficacité rapide', 'effet-secondaires': 'Effets secondaires minimaux', equilibre: 'Équilibré',
    normale: 'Bonne santé générale', 'hypertension': 'Hypertension', 'cardio': 'Problème cardiovasculaire', 'thyroide': 'Thyroïde',
    faible: 'Faible appétit', equilibree: 'Alimentation équilibrée', occasionnel: 'Grignotages occasionnels', frequent: 'Grignotages fréquents',
    aucun: 'Pas d\'effets gênants', mineurs: 'Effets mineurs OK', moyens: 'Tolère effets moyens',
  };

  function renderDiagnosticDetail(c) {
    const date = new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    // Extraire la recommandation et les réponses du champ message
    let recommendation = c.treatment || '';
    let answers = {};
    if (c.message) {
      const recMatch = c.message.match(/Recommandation:\s*(\S+)/i);
      if (recMatch) recommendation = recommendation || recMatch[1];
      const jsonMatch = c.message.match(/Réponses:\s*(\{.*\})/s);
      if (jsonMatch) {
        try { answers = JSON.parse(jsonMatch[1]); } catch {}
      }
    }
    const treatmentColor = {
      mounjaro: '#7c3aed', ozempic: '#2563eb', wegovy: '#059669', saxenda: '#dc2626', trulicity: '#0891b2', victoza: '#0891b2'
    }[recommendation?.toLowerCase()] || '#374151';

    const answersHtml = Object.entries(answers).map(([k, v]) => {
      const label = DIAG_LABELS[k] || k;
      const value = DIAG_VALUES[v] || v;
      return `<tr>
        <td style="padding:5px 10px;font-size:12px;color:#6b7280;white-space:nowrap;">${label}</td>
        <td style="padding:5px 10px;font-size:12px;color:#1a1a2e;font-weight:500;">${value}</td>
      </tr>`;
    }).join('');

    const concernsHtml = Array.isArray(c.concerns) && c.concerns.length
      ? `<div style="margin-top:6px;font-size:11px;color:#6b7280;">Préoccupations: ${c.concerns.join(', ')}</div>` : '';

    return `<div style="background:white;border-radius:10px;padding:16px;margin:10px 0;border:1px solid #e5e7eb;border-left:4px solid ${treatmentColor};">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div>
          <div style="font-size:14px;font-weight:700;color:#1a1a2e;">${c.nom || c.email}</div>
          <div style="font-size:12px;color:#6b7280;">${c.email} · ${date}${c.age ? ` · ${c.age} ans` : ''}</div>
        </div>
        <span style="background:${treatmentColor};color:white;padding:4px 12px;border-radius:12px;font-size:13px;font-weight:700;text-transform:uppercase;">${recommendation || '?'}</span>
      </div>
      ${answersHtml ? `<table style="width:100%;border-collapse:collapse;">${answersHtml}</table>` : ''}
      ${concernsHtml}
    </div>`;
  }

  function renderCoachConversations(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return '<p style="color:#9ca3af;font-size:14px;margin:8px 0;">Aucune conversation cette semaine</p>';
    }
    // Grouper par session_id
    const sessions = {};
    for (const m of messages) {
      if (!sessions[m.session_id]) sessions[m.session_id] = [];
      sessions[m.session_id].push(m);
    }
    return Object.entries(sessions).map(([sid, msgs]) => {
      const first = msgs[0];
      const last = msgs[msgs.length - 1];
      const dateStart = new Date(first.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      const userMsgs = msgs.filter(m => m.role === 'user').length;
      const shortId = sid.slice(0, 8);

      const transcript = msgs.map(m => {
        const isUser = m.role === 'user';
        const bg = isUser ? '#eff6ff' : '#f0fdf4';
        const color = isUser ? '#1e40af' : '#065f46';
        const label = isUser ? '👤 Visiteur' : '🤖 Coach IA';
        const content = m.content || '';
        const intent = m.intent ? `<span style="font-size:10px;background:#e5e7eb;padding:2px 6px;border-radius:8px;margin-left:6px;color:#374151;">${m.intent}</span>` : '';
        return `<div style="background:${bg};border-radius:8px;padding:10px 12px;margin:4px 0;">
          <div style="font-size:11px;font-weight:700;color:${color};margin-bottom:4px;">${label}${intent}</div>
          <div style="font-size:13px;color:#1a1a2e;white-space:pre-wrap;">${content}</div>
        </div>`;
      }).join('');

      return `<div style="background:#f8faf9;border-radius:10px;padding:16px;margin:12px 0;border:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div style="font-size:13px;font-weight:700;color:#1a1a2e;">Session ${shortId}</div>
          <div style="font-size:12px;color:#6b7280;">${dateStart} · ${msgs.length} messages (${userMsgs} visiteur)</div>
        </div>
        ${transcript}
      </div>`;
    }).join('');
  }

  function renderTraffic(gaDaily, gaTopPages) {
    const latestDate = gaTopPages?.date;
    const latestDay = latestDate ? (gaDaily || []).find(d => d.date === latestDate) : null;
    const isStale = latestDate && latestDate < weekAgo;

    const staleNote = isStale
      ? `<p style="color:#dc2626;font-size:12px;margin:0 0 12px 0;">⚠️ Données GA non synchronisées depuis plus de 3 jours (dernier: ${latestDate})</p>` : '';

    const latestLabel = latestDate
      ? new Date(latestDate + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
      : '—';

    // Barre de tendance — toujours 7 jours, jours manquants = 0
    const days7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      return d.toISOString().split('T')[0];
    });
    const gaByDate = {};
    for (const d of (gaDaily || [])) gaByDate[d.date] = d;
    const maxPv = Math.max(...days7.map(d => gaByDate[d]?.pageviews || 0), 1);
    const trendBars = days7.map(dateKey => {
      const data = gaByDate[dateKey];
      const pv = data?.pageviews || 0;
      const pct = Math.round((pv / maxPv) * 100);
      const isLatest = dateKey === latestDate;
      const noData = !data;
      const barColor = noData ? '#f3f4f6' : isLatest ? '#059669' : '#d1fae5';
      const textColor = noData ? '#d1d5db' : '#374151';
      const labelDate = new Date(dateKey + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      return `<td style="text-align:center;padding:0 3px;vertical-align:bottom;">
        <div style="font-size:10px;color:${textColor};margin-bottom:3px;">${pv || ''}</div>
        <div style="background:${barColor};width:28px;height:${Math.max(pct * 0.6, 4)}px;border-radius:3px 3px 0 0;margin:0 auto;"></div>
        <div style="font-size:10px;color:#9ca3af;margin-top:3px;">${labelDate}</div>
      </td>`;
    }).join('');

    // Top pages
    const topPagesHtml = (gaTopPages?.pages || []).map((p, i) => {
      const mins = p.avg_time_on_page ? Math.floor(p.avg_time_on_page / 60) + 'm' + (p.avg_time_on_page % 60) + 's' : '—';
      const isHighlight = i === 0;
      const bg = isHighlight ? '#f0fdf4' : 'white';
      return `<tr style="background:${bg};">
        <td style="padding:8px 10px;font-size:12px;color:#1a1a2e;border-bottom:1px solid #f3f4f6;">${p.page_path}</td>
        <td style="padding:8px 10px;font-size:12px;text-align:right;font-weight:600;border-bottom:1px solid #f3f4f6;">${p.pageviews}</td>
        <td style="padding:8px 10px;font-size:12px;text-align:right;color:#6b7280;border-bottom:1px solid #f3f4f6;">${p.sessions}</td>
        <td style="padding:8px 10px;font-size:12px;text-align:right;color:#6b7280;border-bottom:1px solid #f3f4f6;">${mins}</td>
        <td style="padding:8px 10px;font-size:12px;text-align:right;color:#6b7280;border-bottom:1px solid #f3f4f6;">${p.new_users ?? '—'}</td>
      </tr>`;
    }).join('');

    return `<div style="background:white;border-radius:10px;padding:18px;border:1px solid #e5e7eb;">
      ${staleNote}
      <div style="display:flex;gap:16px;margin-bottom:16px;">
        <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#059669;">${latestDay?.pageviews ?? '—'}</div>
          <div style="font-size:11px;color:#6b7280;">pages vues</div>
        </div>
        <div style="flex:1;background:#eff6ff;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#2563eb;">${latestDay?.sessions ?? '—'}</div>
          <div style="font-size:11px;color:#6b7280;">sessions</div>
        </div>
        <div style="flex:1;background:#faf5ff;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#7c3aed;">${latestDay?.new_users ?? '—'}</div>
          <div style="font-size:11px;color:#6b7280;">nouveaux visiteurs</div>
        </div>
      </div>
      <p style="font-size:11px;color:#9ca3af;margin:0 0 14px 0;">Dernier jour disponible : ${latestLabel}</p>

      ${trendBars ? `<table style="width:100%;margin-bottom:20px;"><tr>${trendBars}</tr></table>` : ''}

      ${topPagesHtml ? `
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:6px 10px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;">Page</th>
            <th style="padding:6px 10px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;">Vues</th>
            <th style="padding:6px 10px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;">Sessions</th>
            <th style="padding:6px 10px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;">Temps moy.</th>
            <th style="padding:6px 10px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;">Nvx visiteurs</th>
          </tr>
        </thead>
        <tbody>${topPagesHtml}</tbody>
      </table>` : '<p style="color:#9ca3af;font-size:13px;margin:0;">Pas de données de trafic disponibles</p>'}
    </div>`;
  }

  function emailList(emails) {
    if (!Array.isArray(emails) || emails.length === 0) return '<p style="color:#9ca3af;font-size:14px;margin:8px 0;">Aucun email envoyé</p>';
    return emails.slice(0, 10).map(e => {
      const date = new Date(e.sent_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      return `<div style="background:white;border-radius:8px;padding:10px 14px;margin:6px 0;border:1px solid #e5e7eb;">
        <div style="font-size:13px;font-weight:600;color:#1a1a2e;">✉️ ${e.to_email}</div>
        <div style="font-size:12px;color:#6b7280;">${e.subject} · <em>${e.category}</em> · ${date}</div>
      </div>`;
    }).join('');
  }

  // Alerte contacts en attente
  const pendingList = pendingContacts.map(c => {
    const typeLabel = c.contact_type === 'diagnostic' ? '🔍 Diagnostic' : c.contact_type === 'contact' ? '📬 Formulaire' : `📩 ${c.contact_type}`;
    const date = new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `<div style="font-size:12px;color:#78350f;margin-top:6px;padding:6px 10px;background:rgba(0,0,0,0.04);border-radius:6px;">
      ${typeLabel} · ${c.email}${c.nom ? ` (${c.nom})` : ''} · ${date}
    </div>`;
  }).join('');

  const alertSection = pendingCount > 0
    ? `<div style="background:#fef3c7;border-radius:10px;padding:16px;margin:20px 0;border-left:4px solid #f59e0b;">
        <p style="margin:0;font-weight:700;color:#92400e;">⚠️ ${pendingCount} contact(s) non traité(s)</p>
        ${pendingList}
      </div>`
    : `<div style="background:#d1fae5;border-radius:10px;padding:16px;margin:20px 0;border-left:4px solid #059669;">
        <p style="margin:0;font-weight:700;color:#065f46;">✅ Tous les contacts sont traités</p>
      </div>`;

  // Insights dynamiques
  function buildInsights() {
    const items = [];

    // Trafic — GA a toujours 1-2j de décalage, on compare j-2 vs j-3 (jours complets fiables)
    const gaByDate = {};
    for (const d of (gaDaily || [])) gaByDate[d.date] = d;
    // Pages vues du dernier jour disponible (utilisé plus bas pour l'insight "trafic mais 0 diagnostic")
    const latestPv = (Array.isArray(gaDaily) && gaDaily.length) ? (gaDaily[gaDaily.length - 1].pageviews || 0) : 0;
    const j2 = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    const j3 = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
    const dayJ2 = gaByDate[j2], dayJ3 = gaByDate[j3];
    if (dayJ2 && dayJ3 && dayJ2.pageviews > 0 && dayJ3.pageviews > 0) {
      const diff = Math.round(((dayJ2.pageviews - dayJ3.pageviews) / dayJ3.pageviews) * 100);
      const labelJ2 = new Date(j2 + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const labelJ3 = new Date(j3 + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (diff > 20) items.push({ type: 'good', text: `Trafic en hausse de +${diff}% (${dayJ2.pageviews} vues le ${labelJ2} vs ${dayJ3.pageviews} le ${labelJ3}). Surveille les pages qui captent ce flux.` });
      else if (diff < -20) items.push({ type: 'warn', text: `Trafic en baisse de ${diff}% (${dayJ2.pageviews} vues le ${labelJ2} vs ${dayJ3.pageviews} le ${labelJ3}). Vérifie s'il y a une chute sur une page spécifique.` });
    }

    // Top page et potentiel conversion
    const topPage = gaTopPages?.pages?.[0];
    if (topPage) {
      const isTarifs = topPage.page_path.includes('tarif') || topPage.page_path.includes('prix');
      const isTraitement = topPage.page_path.includes('traitement') || topPage.page_path.includes('guide');
      if (isTarifs) items.push({ type: 'good', text: `La page la plus visitée est "${topPage.page_path}" (${topPage.pageviews} vues) — signal d'intention fort. C'est le bon endroit pour renforcer un CTA diagnostic ou Coach IA.` });
      else if (isTraitement) items.push({ type: 'info', text: `La page la plus visitée est une page traitement : "${topPage.page_path}" (${topPage.pageviews} vues). Les visiteurs cherchent de l'info médicale — un lien vers le diagnostic pourrait capter cette intention.` });
    }

    // Diagnostic → Coach
    if (diagnosticsWeek.length > 0 && coachSessionsWeek === 0) {
      items.push({ type: 'warn', text: `${diagnosticsWeek.length} diagnostic(s) complété(s) cette semaine mais 0 discussion Coach IA. Le CTA post-diagnostic ne convertit pas encore — à investiguer.` });
    } else if (diagnosticsWeek.length > 0 && coachSessionsWeek > 0) {
      items.push({ type: 'good', text: `${diagnosticsWeek.length} diagnostic(s) → ${coachSessionsWeek} discussion(s) Coach IA. Le funnel fonctionne. Regarde les transcripts pour identifier les objections récurrentes.` });
    }

    // Contacts sans réponse
    if (pendingCount > 0) {
      const types = pendingContacts.map(c => c.contact_type === 'diagnostic' ? 'diagnostic' : 'formulaire');
      items.push({ type: 'warn', text: `${pendingCount} contact(s) en attente (${[...new Set(types)].join(', ')}). Lancer la réponse automatique depuis le terminal.` });
    }

    // Pas de diagnostic
    if (diagnosticsWeek.length === 0 && latestPv > 50) {
      items.push({ type: 'warn', text: `Trafic présent (${latestPv} vues) mais 0 diagnostic cette semaine. Le formulaire de diagnostic est peut-être trop peu visible ou le trafic ne tombe pas sur les bonnes pages.` });
    }

    // Emails entrants inhabituels
    const incomingReal = (Array.isArray(incomingEmailsWeek) ? incomingEmailsWeek : []).filter(e => !e.from_email?.includes('noreply') && !e.from_email?.includes('newsletter'));
    if (incomingReal.length > 3) {
      items.push({ type: 'info', text: `${incomingReal.length} emails entrants cette semaine (hors newsletters). Assure-toi qu'aucun n'est une victime de scam ou une demande sensible non traitée.` });
    }

    if (items.length === 0) items.push({ type: 'info', text: 'Activité normale. Pas de signal particulier à surveiller aujourd\'hui.' });

    return items.map(({ type, text }) => {
      const icon = type === 'good' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
      const bg = type === 'good' ? '#f0fdf4' : type === 'warn' ? '#fffbeb' : '#eff6ff';
      const border = type === 'good' ? '#059669' : type === 'warn' ? '#f59e0b' : '#3b82f6';
      return `<div style="background:${bg};border-left:3px solid ${border};border-radius:0 8px 8px 0;padding:12px 14px;margin:8px 0;font-size:13px;line-height:1.6;color:#1a1a2e;">
        ${icon} ${text}
      </div>`;
    }).join('');
  }

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;color:#1a1a2e;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1a1a2e,#059669);padding:28px;border-radius:14px 14px 0 0;">
    <div style="display:flex;align-items:center;gap:14px;">
      <div>
        <h1 style="color:white;margin:0;font-size:22px;">📊 Rapport quotidien</h1>
        <p style="color:#d1fae5;margin:4px 0 0 0;font-size:14px;">${dateStr} · GLP1 France</p>
      </div>
    </div>
  </div>

  <div style="padding:28px;background:#f8faf9;border-radius:0 0 14px 14px;">

    <!-- KPI j-1 par source -->
    <h2 style="font-size:16px;color:#1a1a2e;margin:0 0 14px 0;">📊 KPI hier par source</h2>
    <table style="width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      ${row('Diagnostics complétés', badge(diagYesterday.length, '#059669'), diagYesterday.length > 0)}
      ${row('Formulaires de contact', badge(formsYesterday.length, '#3b82f6'), formsYesterday.length > 0)}
      ${row('Discussions Coach IA', badge(sessionsYesterday, '#8b5cf6'), sessionsYesterday > 0)}
      ${row('Emails reçus', badge(emailsInYesterday, '#f59e0b'), emailsInYesterday > 0)}
      ${row('Emails envoyés', badge(emailsOutYesterday, '#059669'), emailsOutYesterday > 0)}
      ${row('Contacts en attente de réponse', badge(pendingCount, pendingCount > 0 ? '#ef4444' : '#9ca3af'), pendingCount > 0)}
    </table>
    <p style="font-size:11px;color:#9ca3af;margin:0 0 4px 6px;">7 derniers jours — diag: ${diagnosticsWeek.length} · formulaires: ${formsWeek.length} · discussions: ${coachSessionsWeek} · emails envoyés: ${Array.isArray(emailsSentWeek) ? emailsSentWeek.length : 0}</p>

    ${alertSection}

    <!-- Trafic hebdo -->
    <h2 style="font-size:16px;color:#1a1a2e;margin:24px 0 10px 0;">🌐 Trafic hebdo</h2>
    ${renderTraffic(gaDaily, gaTopPages)}

    <!-- Diagnostics détaillés -->
    <h2 style="font-size:16px;color:#1a1a2e;margin:28px 0 10px 0;">🔍 Diagnostics complétés (7j)</h2>
    ${diagnosticsWeek.length > 0
      ? diagnosticsWeek.map(renderDiagnosticDetail).join('')
      : '<p style="color:#9ca3af;font-size:14px;margin:8px 0;">Aucun diagnostic cette semaine</p>'}

    <!-- Discussions détaillées -->
    <h2 style="font-size:16px;color:#1a1a2e;margin:28px 0 10px 0;">💬 Discussions Coach IA (7j)</h2>
    ${renderCoachConversations(Array.isArray(coachConversationsWeek) ? coachConversationsWeek : [])}

    <!-- Emails envoyés -->
    <h2 style="font-size:16px;color:#1a1a2e;margin:24px 0 10px 0;">📤 Emails envoyés (7j)</h2>
    ${emailList(emailsSentWeek)}

    <!-- Emails entrants -->
    ${Array.isArray(incomingEmailsWeek) && incomingEmailsWeek.length > 0 ? `
    <h2 style="font-size:16px;color:#1a1a2e;margin:24px 0 10px 0;">📥 Emails reçus (7j)</h2>
    ${incomingEmailsWeek.map(e => `<div style="background:white;border-radius:8px;padding:10px 14px;margin:6px 0;border:1px solid #e5e7eb;">
      <div style="font-size:13px;font-weight:600;">${e.from_name || e.from_email}</div>
      <div style="font-size:12px;color:#6b7280;">${e.subject} · ${e.category || 'non catégorisé'}</div>
    </div>`).join('')}` : ''}

    <!-- Insights & recommandations -->
    <h2 style="font-size:16px;color:#1a1a2e;margin:28px 0 10px 0;">🎯 Insights & recommandations</h2>
    <div style="border-radius:10px;overflow:hidden;">
      ${buildInsights()}
    </div>

    <!-- Lien dashboard -->
    <div style="text-align:center;margin:28px 0 0 0;">
      <a href="${SITE}/admin/?utm_source=email&utm_medium=report&utm_campaign=daily"
         style="display:inline-block;background:#1a1a2e;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        Voir le dashboard admin →
      </a>
    </div>

    <p style="font-size:11px;color:#9ca3af;margin-top:24px;text-align:center;">
      Rapport généré automatiquement · <a href="${SITE}" style="color:#059669;">glp1-france.fr</a>
    </p>
  </div>
</div>`;

  // --- Envoi ---
  const transporter = nodemailer.createTransport(SMTP_CONFIG);
  const info = await transporter.sendMail({
    from: FROM,
    to: REPORT_TO,
    subject: `📊 GLP1 France — ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} | ${diagYesterday.length} diag · ${sessionsYesterday} discussions · ${pendingCount > 0 ? `⚠️ ${pendingCount} en attente` : '✅ tout traité'}`,
    html
  });

  console.log(`✅ Rapport envoyé à ${REPORT_TO} → ${info.messageId}`);
}

main().catch(console.error);
