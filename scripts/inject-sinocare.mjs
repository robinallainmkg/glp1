#!/usr/bin/env node
// Injecte des mentions Sinocare dans les articles markdown selon un mapping.
// Usage: node scripts/inject-sinocare.mjs --batch=prix
//        node scripts/inject-sinocare.mjs --batch=all --dry-run
//
// Mapping = liste d'articles avec les placements à insérer.
// Chaque insertion = type + productId + position + optional context.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'src', 'content');

// ========== Catalogue (copie miroir de src/lib/sinocareProducts.ts) ==========
const AWIN_MID = '114180';
const AWIN_AFFID = '2879557';

const PRODUCTS = {
  'safe-aq-smart': { name: 'Sinocare Safe AQ Smart', shortDesc: 'Lecteur de glycémie compact', priceFromEur: 17.99, rating: 4.8, ued: 'https://en.sinocare.com/fr/products/safe-aq-smart-blood-glucometer' },
  'safe-aq-air': { name: 'Sinocare Safe AQ Air Bluetooth', shortDesc: 'Lecteur Bluetooth — sync app smartphone', priceFromEur: 22.99, rating: 4.7, ued: 'https://en.sinocare.com/fr/products/sinocare-safe-aq-air-bluetooth-blood-sugar-monitor' },
  'ican-cgm': { name: 'Sinocare iCan i3 CGM 15 jours', shortDesc: 'Capteur de glycémie continue 15 jours', priceFromEur: 49.90, rating: 4.6, ued: 'https://en.sinocare.com/fr/products/ican-cgm-15-days-continuous-glucose-monitoring' },
  'safe-aq-pro-i': { name: 'Sinocare Safe AQ Pro I', shortDesc: 'Kit complet glucomètre + bandelettes', priceFromEur: 19.99, rating: 4.9, ued: 'https://en.sinocare.com/fr/products/sinocare-safe-aq-pro-i-blood-glucose-meter' },
  'strips-50-with-lancets': { name: 'Bandelettes Sinocare 50 pcs + lancettes', shortDesc: '50 bandelettes + lancettes gratuites', priceFromEur: 16.99, rating: 4.8, ued: 'https://en.sinocare.com/fr/products/sinocare-blood-glucose-test-strips' },
  'strips-100': { name: 'Bandelettes Sinocare 100 pcs', shortDesc: '100 bandelettes + lancettes — pack économique', priceFromEur: 27.99, rating: 5.0, ued: 'https://en.sinocare.com/fr/products/100pcs-sinocare-blood-glucose-test-strips-with-free-lancets' },
  'strips-200': { name: 'Bandelettes Sinocare 200 pcs', shortDesc: '200 bandelettes — stock 6 mois', priceFromEur: 49.99, rating: 5.0, ued: 'https://en.sinocare.com/fr/products/200pcs-sinocare-glucometer-glucose-test-strips-with-free-lancets' },
  'bp-monitor-arm': { name: 'Tensiomètre Sinocare bras', shortDesc: 'Tensiomètre haut du bras — double mémoire', priceFromEur: 34.99, rating: 4.9, ued: 'https://en.sinocare.com/fr/products/tensiometre-au-bras-sinocare' },
  'insulin-needles': { name: 'Aiguilles stylo insuline Sinocare 32G 4mm', shortDesc: '100 aiguilles 32G 4mm pour stylos GLP-1', priceFromEur: 14.99, rating: 5.0, ued: 'https://en.sinocare.com/fr/products/aiguilles-pour-stylo-a-insuline-sinocare' },
};

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
function escHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function awinUrl(productId, placement, slug) {
  const p = PRODUCTS[productId];
  if (!p) throw new Error(`Unknown product ${productId}`);
  const clickref = `glp1france_${slugify(placement)}_${slugify(productId)}_${slugify(slug)}`.slice(0, 80);
  return `https://www.awin1.com/cread.php?awinmid=${AWIN_MID}&awinaffid=${AWIN_AFFID}&clickref=${encodeURIComponent(clickref)}&ued=${encodeURIComponent(p.ued)}`;
}
function fmtPrice(n) { return n.toFixed(2).replace('.', ','); }

const SPONSORED = 'rel="sponsored noopener" target="_blank"';

// ========== Renderers (miroir de sinocareSnippets.ts) ==========
const render = {
  mention(productId, slug, linkText) {
    const p = PRODUCTS[productId];
    const url = awinUrl(productId, 'mention', slug);
    const text = escHtml(linkText || p.name);
    return `<a href="${url}" ${SPONSORED} data-sinocare-mention style="color:#1B6FA0;font-weight:600;text-decoration:underline;text-decoration-color:#7dd3fc;text-underline-offset:3px;">${text}</a>`;
  },
  card(productId, slug) {
    const p = PRODUCTS[productId];
    const url = awinUrl(productId, 'card', slug);
    return `\n<aside data-sinocare-card style="margin:1.5rem auto;max-width:380px;border:1px solid #e2e8f0;border-radius:14px;padding:1.1rem;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.04);box-sizing:border-box;">
  <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem;">
    <span style="font-size:.72rem;background:#f0f9ff;color:#0369a1;padding:.2rem .55rem;border-radius:4px;font-weight:600;letter-spacing:.02em;">SINOCARE</span>
    <span style="font-size:.78rem;color:#475569;">★ ${p.rating}/5</span>
  </div>
  <h4 style="margin:0 0 .4rem 0;font-size:1.02rem;font-weight:700;color:#0f172a;line-height:1.3;">${escHtml(p.name)}</h4>
  <p style="margin:0 0 .8rem 0;font-size:.88rem;color:#475569;line-height:1.5;">${escHtml(p.shortDesc)}</p>
  <div style="display:flex;align-items:center;justify-content:space-between;gap:.6rem;flex-wrap:wrap;margin-bottom:.5rem;">
    <span style="font-size:1.05rem;font-weight:700;color:#0f172a;">À partir de ${fmtPrice(p.priceFromEur)}&nbsp;€</span>
    <a href="${url}" ${SPONSORED} style="background:#1B6FA0;color:#fff;font-size:.88rem;font-weight:600;padding:.55rem 1.1rem;border-radius:7px;text-decoration:none;white-space:nowrap;">Voir &rarr;</a>
  </div>
  <span style="font-size:.72rem;color:#94a3b8;font-style:italic;">Lien sponsorisé</span>
</aside>\n`;
  },
  compare(productIds, slug) {
    const items = productIds.slice(0, 3).map(id => ({ id, ...PRODUCTS[id] }));
    const cols = items.map(p => {
      const url = awinUrl(p.id, 'compare', slug);
      return `<td style="border:1px solid #e2e8f0;padding:1rem;vertical-align:top;width:${100/items.length}%;background:#fff;">
      <div style="font-size:.7rem;color:#0369a1;font-weight:600;margin-bottom:.3rem;letter-spacing:.02em;">SINOCARE</div>
      <h4 style="margin:0 0 .4rem 0;font-size:.95rem;color:#0f172a;line-height:1.3;">${escHtml(p.name)}</h4>
      <p style="margin:0 0 .6rem 0;font-size:.82rem;color:#475569;line-height:1.45;">${escHtml(p.shortDesc)}</p>
      <div style="font-size:.95rem;font-weight:700;color:#0f172a;margin-bottom:.7rem;">Dès ${fmtPrice(p.priceFromEur)}&nbsp;€</div>
      <div style="font-size:.78rem;color:#475569;margin-bottom:.7rem;">★ ${p.rating}/5</div>
      <a href="${url}" ${SPONSORED} style="display:inline-block;background:#1B6FA0;color:#fff;font-size:.82rem;font-weight:600;padding:.45rem .9rem;border-radius:6px;text-decoration:none;">Découvrir</a>
    </td>`;
    }).join('');
    return `\n<div data-sinocare-compare style="margin:1.75rem 0;overflow-x:auto;">
  <table style="width:100%;border-collapse:collapse;font-family:inherit;">
    <tbody><tr>${cols}</tr></tbody>
  </table>
  <p style="margin:.6rem 0 0 0;font-size:.78rem;color:#94a3b8;text-align:right;font-style:italic;">Liens sponsorisés &middot; Sinocare via Awin</p>
</div>\n`;
  },
  callout(productId, slug, title, body) {
    const p = PRODUCTS[productId];
    const url = awinUrl(productId, 'callout', slug);
    const calloutTitle = title || `Conseil pratique`;
    const calloutBody = body || `Pour un suivi régulier, beaucoup de patients utilisent un appareil simple comme le ${p.name} — disponible dès ${fmtPrice(p.priceFromEur)}&nbsp;€.`;
    return `\n<div data-sinocare-callout style="margin:1.5rem 0;background:linear-gradient(135deg,#ecfdf5,#f0fdfa);border-left:4px solid #14b8a6;border-radius:8px;padding:1.1rem 1.2rem;">
  <p style="margin:0 0 .4rem 0;font-weight:700;color:#0f766e;font-size:.95rem;">💡 ${escHtml(calloutTitle)}</p>
  <p style="margin:0 0 .7rem 0;color:#134e4a;font-size:.92rem;line-height:1.55;">${calloutBody}</p>
  <a href="${url}" ${SPONSORED} style="display:inline-block;font-size:.85rem;color:#0f766e;font-weight:600;text-decoration:underline;">Voir le produit (lien sponsorisé) &rarr;</a>
</div>\n`;
  },
  bullet(productId, slug, otherItems) {
    const p = PRODUCTS[productId];
    const url = awinUrl(productId, 'bullet', slug);
    const others = (otherItems || []).map(it => `<li style="margin-bottom:.4rem;">${it}</li>`).join('');
    return `\n<ul data-sinocare-bullet style="margin:1rem 0;padding-left:1.3rem;">
  <li style="margin-bottom:.4rem;"><a href="${url}" ${SPONSORED} style="color:#1B6FA0;font-weight:600;">${escHtml(p.name)}</a> — ${escHtml(p.shortDesc)} <span style="font-size:.72rem;color:#94a3b8;">(sponsorisé)</span></li>
  ${others}
</ul>\n`;
  },
  doctorQuote(productId, slug, quoteBody) {
    const p = PRODUCTS[productId];
    const url = awinUrl(productId, 'doctorquote', slug);
    const bodyWithLink = quoteBody.replace('[PRODUCT]', `<a href="${url}" ${SPONSORED} style="color:#1B6FA0;font-weight:600;">${escHtml(p.name)}</a>`);
    return `\n<blockquote data-sinocare-quote style="margin:1.75rem 0;padding:1.2rem 1.4rem;background:#f8fafc;border-left:4px solid #1B6FA0;border-radius:6px;">
  <p style="margin:0 0 .7rem 0;font-style:italic;color:#1e293b;font-size:1rem;line-height:1.6;">«&nbsp;${bodyWithLink}&nbsp;»</p>
  <footer style="display:flex;align-items:center;gap:.6rem;font-size:.85rem;color:#475569;flex-wrap:wrap;">
    <a href="/auteurs/dr-marie-dubois/" style="color:#1B6FA0;text-decoration:none;font-weight:600;">Dr Marie Dubois</a>
    <span style="color:#94a3b8;">&middot; rédactrice santé GLP-1 France &middot; <span style="font-size:.72rem;font-style:italic;">lien sponsorisé</span></span>
  </footer>
</blockquote>\n`;
  },
  footer(productIds, slug) {
    const items = productIds.slice(0, 3).map(id => ({ id, ...PRODUCTS[id] }));
    const links = items.map(p => {
      const url = awinUrl(p.id, 'footer', slug);
      return `<li style="margin-bottom:.45rem;font-size:.88rem;line-height:1.5;"><a href="${url}" ${SPONSORED} style="color:#1B6FA0;font-weight:600;">${escHtml(p.name)}</a> — ${escHtml(p.shortDesc)} <span style="color:#94a3b8;">(dès ${fmtPrice(p.priceFromEur)}&nbsp;€)</span></li>`;
    }).join('');
    return `\n<aside data-sinocare-footer style="margin:2rem 0 1rem 0;padding:1.1rem 1.3rem;border:1px solid #e2e8f0;border-radius:10px;background:#fafbfc;">
  <p style="margin:0 0 .6rem 0;font-size:.85rem;font-weight:700;color:#475569;letter-spacing:.02em;text-transform:uppercase;">📦 Matériel mentionné dans cet article</p>
  <ul style="margin:0;padding-left:1.2rem;">${links}</ul>
  <p style="margin:.7rem 0 0 0;font-size:.75rem;color:#94a3b8;font-style:italic;">Les liens ci-dessus sont sponsorisés — Sinocare est un partenaire commercial via Awin.</p>
</aside>\n`;
  },
};

// ========== Mapping articles → placements ==========
// Chaque article a une `file` (relative à src/content/), une `slug`, et une liste de `inserts`.
// Chaque insert = { type, productId|productIds, afterH2: <number 1-indexed> ou "last" ou "before-last" }
// Le script trouve les H2 (## ...) et insère après la position demandée.

const MAPPING = {
  // ===== Batch 1 — Prix obésité (Mounjaro / Wegovy / Saxenda / Zepbound) =====
  prix_obesite: [
    {
      file: 'glp1-cout/prix-mounjaro-france.md', slug: 'prix-mounjaro-france',
      inserts: [
        { type: 'callout', productId: 'ican-cgm', afterH2: 2, title: 'Comprendre vos pics glycémiques sous Mounjaro', body: 'Le tirzépatide agit fortement sur la glycémie. Pour les patients diabétiques (et même obésité avec résistance à l\'insuline), un capteur de glycémie continue comme le Sinocare iCan i3 (15 jours d\'autonomie) permet de visualiser concrètement l\'effet du traitement, hors prises de sang en pharmacie.' },
        { type: 'card', productId: 'safe-aq-air', afterH2: 4 },
        { type: 'footer', productIds: ['ican-cgm', 'safe-aq-air', 'insulin-needles'] },
      ],
    },
    {
      file: 'glp1-cout/prix-wegovy-france.md', slug: 'prix-wegovy-france',
      inserts: [
        { type: 'callout', productId: 'bp-monitor-arm', afterH2: 2, title: 'Suivez votre tension pendant le traitement', body: 'Le sémaglutide influence la tension artérielle (généralement à la baisse, mais variable selon les patients). Le tensiomètre Sinocare permet un suivi domicile fiable, particulièrement utile en début de traitement.' },
        { type: 'card', productId: 'ican-cgm', afterH2: 4 },
        { type: 'footer', productIds: ['bp-monitor-arm', 'ican-cgm', 'insulin-needles'] },
      ],
    },
    {
      file: 'glp1-cout/prix-saxenda-france.md', slug: 'prix-saxenda-france',
      inserts: [
        { type: 'callout', productId: 'insulin-needles', afterH2: 2, title: 'Aiguilles compatibles stylo Saxenda', body: 'Le stylo Saxenda utilise des aiguilles standards 32G 4mm. Pack 100 aiguilles Sinocare pour environ 15&nbsp;€, compatibles également avec les autres stylos GLP-1.' },
        { type: 'footer', productIds: ['insulin-needles', 'safe-aq-smart', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'glp1-cout/prix-zepbound-france.md', slug: 'prix-zepbound-france',
      inserts: [
        { type: 'callout', productId: 'ican-cgm', afterH2: 2, title: 'Visualiser l\'effet de Zepbound sur votre glycémie', body: 'Zepbound (tirzépatide indication obésité) agit fortement sur la régulation glycémique. Un capteur de glycémie continue comme le Sinocare iCan i3 permet de suivre les variations sur 15 jours.' },
        { type: 'footer', productIds: ['ican-cgm', 'safe-aq-air', 'insulin-needles'] },
      ],
    },
  ],

  // ===== Batch 2 — Prix DT2 (Ozempic / Trulicity / Victoza / Rybelsus) =====
  prix_dt2: [
    {
      file: 'glp1-cout/prix-ozempic-france.md', slug: 'prix-ozempic-france',
      inserts: [
        { type: 'callout', productId: 'safe-aq-smart', afterH2: 2, title: 'Suivi glycémie sous Ozempic', body: 'Pour les patients diabétiques sous Ozempic, l\'autosurveillance glycémique reste recommandée par la HAS. Un lecteur fiable et abordable comme le Sinocare Safe AQ Smart est largement utilisé.' },
        { type: 'compare', productIds: ['safe-aq-smart', 'safe-aq-air', 'ican-cgm'], afterH2: 4 },
        { type: 'footer', productIds: ['safe-aq-smart', 'strips-100', 'ican-cgm'] },
      ],
    },
    {
      file: 'glp1-cout/prix-trulicity-france.md', slug: 'prix-trulicity-france',
      inserts: [
        { type: 'callout', productId: 'safe-aq-smart', afterH2: 2, title: 'Autosurveillance sous Trulicity', body: 'Le dulaglutide (Trulicity) est généralement prescrit chez les patients DT2. L\'autosurveillance glycémique est recommandée, particulièrement en cas d\'association avec d\'autres antidiabétiques.' },
        { type: 'footer', productIds: ['safe-aq-smart', 'strips-50-with-lancets', 'insulin-needles'] },
      ],
    },
    {
      file: 'glp1-cout/prix-victoza-france.md', slug: 'prix-victoza-france',
      inserts: [
        { type: 'callout', productId: 'safe-aq-pro-i', afterH2: 2, title: 'Kit démarrage suivi glycémie', body: 'Pour les patients démarrant un GLP-1 comme Victoza, un kit complet (glucomètre + bandelettes + lancettes) simplifie le démarrage de l\'autosurveillance.' },
        { type: 'footer', productIds: ['safe-aq-pro-i', 'strips-100', 'insulin-needles'] },
      ],
    },
    {
      file: 'glp1-cout/prix-rybelsus-france.md', slug: 'prix-rybelsus-france',
      inserts: [
        { type: 'callout', productId: 'safe-aq-air', afterH2: 2, title: 'Suivi glycémie sous Rybelsus oral', body: 'Rybelsus (sémaglutide oral) demande une rigueur de prise. Suivre votre glycémie via un lecteur Bluetooth permet de visualiser les tendances dans l\'app.' },
        { type: 'footer', productIds: ['safe-aq-air', 'strips-50-with-lancets', 'ican-cgm'] },
      ],
    },
  ],

  // ===== Batch 3 — Remboursement / mutuelles =====
  remboursement: [
    {
      file: 'glp1-cout/wegovy-remboursement-mutuelle.md', slug: 'wegovy-remboursement-mutuelle',
      inserts: [
        { type: 'callout', productId: 'strips-100', afterH2: 2, title: 'Consommables non remboursés : optimiser le budget', body: 'Les bandelettes pour autosurveillance représentent un coût récurrent. Un pack 100 bandelettes Sinocare (~28&nbsp;€) sort à environ 0,28&nbsp;€/bandelette, contre 0,55-0,75&nbsp;€ en pharmacie de marque.' },
        { type: 'footer', productIds: ['strips-100', 'safe-aq-smart', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'glp1-cout/remboursement-glp1-2026.md', slug: 'remboursement-glp1-2026',
      inserts: [
        { type: 'callout', productId: 'strips-100', afterH2: 2, title: 'Réduire les coûts annexes', body: 'En attendant le remboursement complet, le matériel d\'autosurveillance représente un poste de dépense maîtrisable. Bandelettes Sinocare 100 pcs pour environ 28&nbsp;€.' },
        { type: 'footer', productIds: ['strips-100', 'safe-aq-smart', 'ican-cgm'] },
      ],
    },
    {
      file: 'glp1-cout/quand-wegovy-rembourse-france-2026-conditions-calendrier.md', slug: 'quand-wegovy-rembourse-france-2026',
      inserts: [
        { type: 'callout', productId: 'strips-100', afterH2: 2, title: 'Coûts annexes : matériel d\'autosurveillance', body: 'En attendant le remboursement, le matériel reste à votre charge. Les bandelettes Sinocare (lecteurs glycémie) offrent un rapport qualité/prix intéressant pour le suivi régulier.' },
        { type: 'footer', productIds: ['strips-100', 'safe-aq-smart', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'glp1-cout/remboursement-mounjaro-france-2026-quand-conditions-ceps.md', slug: 'remboursement-mounjaro-france-2026',
      inserts: [
        { type: 'callout', productId: 'ican-cgm', afterH2: 2 },
        { type: 'footer', productIds: ['ican-cgm', 'strips-100', 'insulin-needles'] },
      ],
    },
    {
      file: 'glp1-cout/remboursement-mounjaro-obesite-has-ceps-calendrier-conditions-2026.md', slug: 'remboursement-mounjaro-obesite-has',
      inserts: [
        { type: 'callout', productId: 'bp-monitor-arm', afterH2: 2 },
        { type: 'footer', productIds: ['bp-monitor-arm', 'ican-cgm', 'insulin-needles'] },
      ],
    },
    {
      file: 'glp1-cout/remboursement-wegovy-mounjaro-securite-sociale-2026.md', slug: 'remboursement-wegovy-mounjaro-ss',
      inserts: [
        { type: 'callout', productId: 'strips-100', afterH2: 2 },
        { type: 'footer', productIds: ['strips-100', 'safe-aq-smart', 'ican-cgm'] },
      ],
    },
    {
      file: 'glp1-cout/remboursement-ozempic-diabete-justificatif-prescription-guide-2026.md', slug: 'remboursement-ozempic-diabete',
      inserts: [
        { type: 'callout', productId: 'safe-aq-smart', afterH2: 2 },
        { type: 'footer', productIds: ['safe-aq-smart', 'strips-100', 'insulin-needles'] },
      ],
    },
    {
      file: 'glp1-cout/mounjaro-remboursement-securite-sociale-conditions-2026.md', slug: 'mounjaro-remboursement-ss',
      inserts: [
        { type: 'callout', productId: 'ican-cgm', afterH2: 2 },
        { type: 'footer', productIds: ['ican-cgm', 'bp-monitor-arm', 'insulin-needles'] },
      ],
    },
  ],

  // ===== Batch 4 — Guides traitements =====
  guides: [
    {
      file: 'traitements-glp1/guide-complet-ozempic.md', slug: 'guide-complet-ozempic',
      inserts: [
        { type: 'card', productId: 'safe-aq-smart', afterH2: 2 },
        { type: 'callout', productId: 'insulin-needles', afterH2: 4, title: 'Aiguilles compatibles stylo Ozempic', body: 'Le stylo Ozempic utilise des aiguilles 32G 4mm standards. Pack 100 aiguilles Sinocare pour environ 15&nbsp;€.' },
        { type: 'footer', productIds: ['safe-aq-smart', 'insulin-needles', 'ican-cgm'] },
      ],
    },
    {
      file: 'traitements-glp1/guide-complet-wegovy.md', slug: 'guide-complet-wegovy',
      inserts: [
        { type: 'card', productId: 'bp-monitor-arm', afterH2: 2 },
        { type: 'callout', productId: 'insulin-needles', afterH2: 4 },
        { type: 'footer', productIds: ['bp-monitor-arm', 'insulin-needles', 'ican-cgm'] },
      ],
    },
    {
      file: 'traitements-glp1/guide-complet-mounjaro.md', slug: 'guide-complet-mounjaro',
      inserts: [
        { type: 'card', productId: 'ican-cgm', afterH2: 2 },
        { type: 'callout', productId: 'insulin-needles', afterH2: 4 },
        { type: 'footer', productIds: ['ican-cgm', 'insulin-needles', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'traitements-glp1/guide-complet-trulicity.md', slug: 'guide-complet-trulicity',
      inserts: [
        { type: 'card', productId: 'safe-aq-smart', afterH2: 2 },
        { type: 'footer', productIds: ['safe-aq-smart', 'strips-100', 'insulin-needles'] },
      ],
    },
    {
      file: 'traitements-glp1/guide-complet-rybelsus.md', slug: 'guide-complet-rybelsus',
      inserts: [
        { type: 'card', productId: 'safe-aq-air', afterH2: 2 },
        { type: 'footer', productIds: ['safe-aq-air', 'strips-100', 'ican-cgm'] },
      ],
    },
    {
      file: 'traitements-glp1/guide-complet-saxenda.md', slug: 'guide-complet-saxenda',
      inserts: [
        { type: 'card', productId: 'insulin-needles', afterH2: 2 },
        { type: 'footer', productIds: ['insulin-needles', 'safe-aq-smart', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'traitements-glp1/guide-complet-zepbound.md', slug: 'guide-complet-zepbound',
      inserts: [
        { type: 'card', productId: 'ican-cgm', afterH2: 2 },
        { type: 'footer', productIds: ['ican-cgm', 'bp-monitor-arm', 'insulin-needles'] },
      ],
    },
  ],

  // ===== Batch 5 — Effets secondaires =====
  effets: [
    {
      file: 'effets-secondaires-glp1/effets-secondaires-mounjaro.md', slug: 'effets-secondaires-mounjaro',
      inserts: [
        { type: 'callout', productId: 'bp-monitor-arm', afterH2: 2, title: 'Surveiller tension et rythme cardiaque', body: 'Le tirzépatide peut provoquer des variations de tension et de rythme cardiaque dans les premières semaines. Un tensiomètre fiable à domicile permet d\'objectiver ces variations.' },
        { type: 'footer', productIds: ['bp-monitor-arm', 'ican-cgm', 'safe-aq-smart'] },
      ],
    },
    {
      file: 'effets-secondaires-glp1/effets-secondaires-wegovy.md', slug: 'effets-secondaires-wegovy',
      inserts: [
        { type: 'callout', productId: 'bp-monitor-arm', afterH2: 2 },
        { type: 'footer', productIds: ['bp-monitor-arm', 'safe-aq-smart', 'ican-cgm'] },
      ],
    },
    {
      file: 'effets-secondaires-glp1/effets-secondaires-ozempic.md', slug: 'effets-secondaires-ozempic',
      inserts: [
        { type: 'callout', productId: 'safe-aq-smart', afterH2: 2, title: 'Surveiller l\'hypoglycémie', body: 'En cas d\'association GLP-1 + sulfamides/insuline, le risque d\'hypoglycémie augmente. Un lecteur de glycémie réactif à domicile est indispensable pour confirmer et adapter.' },
        { type: 'footer', productIds: ['safe-aq-smart', 'strips-100', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'effets-secondaires-glp1/effets-secondaires-trulicity.md', slug: 'effets-secondaires-trulicity',
      inserts: [
        { type: 'callout', productId: 'safe-aq-smart', afterH2: 2 },
        { type: 'footer', productIds: ['safe-aq-smart', 'strips-100', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'effets-secondaires-glp1/effets-secondaires-rybelsus.md', slug: 'effets-secondaires-rybelsus',
      inserts: [
        { type: 'callout', productId: 'safe-aq-air', afterH2: 2 },
        { type: 'footer', productIds: ['safe-aq-air', 'strips-50-with-lancets', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'effets-secondaires-glp1/effets-secondaires-victoza.md', slug: 'effets-secondaires-victoza',
      inserts: [
        { type: 'callout', productId: 'safe-aq-smart', afterH2: 2 },
        { type: 'footer', productIds: ['safe-aq-smart', 'strips-100', 'insulin-needles'] },
      ],
    },
    {
      file: 'effets-secondaires-glp1/effets-secondaires-saxenda.md', slug: 'effets-secondaires-saxenda',
      inserts: [
        { type: 'callout', productId: 'bp-monitor-arm', afterH2: 2 },
        { type: 'footer', productIds: ['bp-monitor-arm', 'safe-aq-smart', 'insulin-needles'] },
      ],
    },
    {
      file: 'effets-secondaires-glp1/effets-secondaires-zepbound.md', slug: 'effets-secondaires-zepbound',
      inserts: [
        { type: 'callout', productId: 'ican-cgm', afterH2: 2 },
        { type: 'footer', productIds: ['ican-cgm', 'bp-monitor-arm', 'insulin-needles'] },
      ],
    },
  ],

  // ===== Batch 6 — Régime / perte de poids =====
  regime: [
    {
      file: 'regime-glp1/regime-mounjaro-optimal.md', slug: 'regime-mounjaro-optimal',
      inserts: [
        { type: 'callout', productId: 'ican-cgm', afterH2: 2, title: 'Adapter son régime via la courbe glycémique', body: 'Sous Mounjaro, votre tolérance aux glucides change rapidement. Un capteur de glycémie continue (CGM) Sinocare iCan i3 sur 15 jours permet d\'identifier les aliments qui provoquent pics et hypoglycémies, et d\'ajuster en conséquence.' },
        { type: 'footer', productIds: ['ican-cgm', 'bp-monitor-arm', 'safe-aq-air'] },
      ],
    },
    {
      file: 'regime-glp1/regime-sans-sucre-glp1.md', slug: 'regime-sans-sucre-glp1',
      inserts: [
        { type: 'callout', productId: 'ican-cgm', afterH2: 2 },
        { type: 'footer', productIds: ['ican-cgm', 'safe-aq-air', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'glp1-perte-de-poids/glp1-perte-de-poids.md', slug: 'glp1-perte-de-poids',
      inserts: [
        { type: 'callout', productId: 'bp-monitor-arm', afterH2: 2, title: 'Surveiller tension pendant la perte de poids', body: 'La perte de poids rapide induit souvent des variations de tension. Un tensiomètre Sinocare à domicile permet un suivi quotidien fiable, en complément du suivi médical.' },
        { type: 'footer', productIds: ['bp-monitor-arm', 'ican-cgm', 'safe-aq-air'] },
      ],
    },
    {
      file: 'glp1-perte-de-poids/injection-pour-maigrir-guide-complet-france-2026.md', slug: 'injection-pour-maigrir-guide-complet',
      inserts: [
        { type: 'callout', productId: 'insulin-needles', afterH2: 2 },
        { type: 'footer', productIds: ['insulin-needles', 'bp-monitor-arm', 'ican-cgm'] },
      ],
    },
    {
      file: 'glp1-perte-de-poids/medicament-pour-maigrir-guide-complet-france-2026.md', slug: 'medicament-pour-maigrir',
      inserts: [
        { type: 'callout', productId: 'bp-monitor-arm', afterH2: 2 },
        { type: 'footer', productIds: ['bp-monitor-arm', 'ican-cgm', 'safe-aq-smart'] },
      ],
    },
  ],

  // ===== Batch 7 — Traitements / divers high-traffic =====
  divers: [
    {
      file: 'traitements-glp1/nouveau-stylo-ozempic-3ml-2026-changement-utilisation.md', slug: 'nouveau-stylo-ozempic-3ml-2026',
      inserts: [
        { type: 'callout', productId: 'insulin-needles', afterH2: 2, title: 'Aiguilles compatibles nouveau stylo Ozempic', body: 'Le nouveau stylo Ozempic 3ml utilise toujours des aiguilles standards 32G 4mm. Pack 100 aiguilles Sinocare pour environ 15&nbsp;€.' },
        { type: 'footer', productIds: ['insulin-needles', 'safe-aq-smart', 'ican-cgm'] },
      ],
    },
    {
      file: 'traitements-glp1/mounjaro-avis-patients-france-2026.md', slug: 'mounjaro-avis-patients-france-2026',
      inserts: [
        { type: 'callout', productId: 'ican-cgm', afterH2: 2 },
        { type: 'footer', productIds: ['ican-cgm', 'bp-monitor-arm', 'insulin-needles'] },
      ],
    },
    {
      file: 'traitements-glp1/wegovy-avis-patients-france-2026.md', slug: 'wegovy-avis-patients-france-2026',
      inserts: [
        { type: 'callout', productId: 'bp-monitor-arm', afterH2: 2 },
        { type: 'footer', productIds: ['bp-monitor-arm', 'ican-cgm', 'insulin-needles'] },
      ],
    },
    {
      file: 'traitements-glp1/mounjaro-dosage.md', slug: 'mounjaro-dosage',
      inserts: [
        { type: 'callout', productId: 'ican-cgm', afterH2: 2 },
        { type: 'footer', productIds: ['ican-cgm', 'insulin-needles', 'bp-monitor-arm'] },
      ],
    },
    {
      file: 'traitements-glp1/wegovy-dosage.md', slug: 'wegovy-dosage',
      inserts: [
        { type: 'callout', productId: 'insulin-needles', afterH2: 2 },
        { type: 'footer', productIds: ['insulin-needles', 'bp-monitor-arm', 'ican-cgm'] },
      ],
    },
    {
      file: 'traitements-glp1/comment-s-injecter-glp1-guide-pratique-ozempic-wegovy-mounjaro.md', slug: 'comment-s-injecter-glp1',
      inserts: [
        { type: 'card', productId: 'insulin-needles', afterH2: 2 },
        { type: 'footer', productIds: ['insulin-needles', 'safe-aq-smart', 'ican-cgm'] },
      ],
    },
    {
      file: 'traitements-glp1/wegovy-vs-mounjaro-comparatif-2026.md', slug: 'wegovy-vs-mounjaro-comparatif-2026',
      inserts: [
        { type: 'compare', productIds: ['ican-cgm', 'bp-monitor-arm', 'insulin-needles'], afterH2: 3 },
        { type: 'footer', productIds: ['ican-cgm', 'bp-monitor-arm', 'insulin-needles'] },
      ],
    },
  ],
};

// ========== Engine ==========
function findInsertPosition(content, afterH2) {
  // Find positions of all `## ` lines (H2 in markdown), ignoring those inside frontmatter
  const lines = content.split('\n');
  let inFrontmatter = false;
  let frontmatterEnd = 0;
  // Detect frontmatter
  if (lines[0] === '---') {
    inFrontmatter = true;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') { frontmatterEnd = i; break; }
    }
  }
  const h2Positions = [];
  for (let i = frontmatterEnd + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i]) && !/^###/.test(lines[i])) {
      h2Positions.push(i);
    }
  }
  if (afterH2 === 'last') {
    return h2Positions.length > 0 ? h2Positions[h2Positions.length - 1] : null;
  }
  if (afterH2 === 'before-last') {
    return h2Positions.length > 1 ? h2Positions[h2Positions.length - 2] : null;
  }
  const idx = (typeof afterH2 === 'number' ? afterH2 : 1) - 1;
  return h2Positions[idx] !== undefined ? h2Positions[idx] : null;
}

function insertAfterH2Block(content, h2LineIndex, html) {
  // Insert HTML AFTER the paragraph that follows the H2 line.
  // Strategy: insert after first blank line following the H2 (i.e., end of intro para).
  const lines = content.split('\n');
  let insertAt = h2LineIndex + 1;
  // Skip the H2 itself, then find end of next paragraph (first blank line after content)
  let seenContent = false;
  for (let i = h2LineIndex + 1; i < lines.length; i++) {
    if (lines[i].trim().length > 0) {
      seenContent = true;
    } else if (seenContent) {
      insertAt = i;
      break;
    }
  }
  lines.splice(insertAt, 0, '', html.trim(), '');
  return lines.join('\n');
}

function applyInsertsToFile(filePath, slug, inserts, opts = {}) {
  if (!fs.existsSync(filePath)) {
    console.warn(`SKIP — file not found: ${filePath}`);
    return { ok: false, reason: 'not_found' };
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Idempotent check: if Sinocare data attribute is already in the file, skip.
  if (content.includes('data-sinocare-')) {
    console.log(`SKIP — Sinocare already present: ${filePath}`);
    return { ok: false, reason: 'already_present' };
  }

  // Compute insertions BEFORE mutating, so positions reference original H2 indexes
  // Sort by afterH2 descending so later insertions don't shift earlier line numbers
  const ordered = [...inserts].sort((a, b) => {
    const ka = a.afterH2 === 'last' ? 9999 : (a.afterH2 === 'before-last' ? 9998 : (typeof a.afterH2 === 'number' ? a.afterH2 : 999));
    const kb = b.afterH2 === 'last' ? 9999 : (b.afterH2 === 'before-last' ? 9998 : (typeof b.afterH2 === 'number' ? b.afterH2 : 999));
    return kb - ka;
  });

  let appliedCount = 0;
  let appendFooter = null;

  for (const ins of ordered) {
    let html;
    if (ins.type === 'mention') html = render.mention(ins.productId, slug, ins.linkText);
    else if (ins.type === 'card') html = render.card(ins.productId, slug);
    else if (ins.type === 'compare') html = render.compare(ins.productIds, slug);
    else if (ins.type === 'callout') html = render.callout(ins.productId, slug, ins.title, ins.body);
    else if (ins.type === 'bullet') html = render.bullet(ins.productId, slug, ins.otherItems);
    else if (ins.type === 'doctorQuote') html = render.doctorQuote(ins.productId, slug, ins.quoteBody);
    else if (ins.type === 'footer') { appendFooter = render.footer(ins.productIds, slug); continue; }
    else { console.warn(`Unknown insert type: ${ins.type}`); continue; }

    const pos = findInsertPosition(content, ins.afterH2 || 1);
    if (pos === null) {
      console.warn(`  ! H2 ${ins.afterH2} not found in ${filePath}, fallback to end`);
      content = content + '\n\n' + html.trim() + '\n';
    } else {
      content = insertAfterH2Block(content, pos, html);
    }
    appliedCount++;
  }

  // Footer goes at the very end (before any trailing newline)
  if (appendFooter) {
    content = content.replace(/\s*$/, '') + '\n\n' + appendFooter.trim() + '\n';
    appliedCount++;
  }

  if (opts.dryRun) {
    console.log(`DRY — ${filePath} (${appliedCount} inserts)`);
    return { ok: true, applied: appliedCount, dryRun: true };
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`OK  — ${filePath} (${appliedCount} inserts)`);
  return { ok: true, applied: appliedCount };
}

// ========== CLI ==========
const args = process.argv.slice(2);
const batchArg = args.find(a => a.startsWith('--batch='));
const dryRun = args.includes('--dry-run');
const batchName = batchArg ? batchArg.split('=')[1] : 'all';

const batches = batchName === 'all' ? Object.keys(MAPPING) : [batchName];

let total = 0;
let okCount = 0;
let skipCount = 0;
for (const b of batches) {
  if (!MAPPING[b]) {
    console.error(`Unknown batch: ${b}. Available: ${Object.keys(MAPPING).join(', ')}`);
    process.exit(1);
  }
  console.log(`\n=== BATCH: ${b} (${MAPPING[b].length} articles) ===`);
  for (const article of MAPPING[b]) {
    total++;
    const filePath = path.join(CONTENT, article.file);
    const res = applyInsertsToFile(filePath, article.slug, article.inserts, { dryRun });
    if (res.ok) okCount++;
    else skipCount++;
  }
}

console.log(`\nDone: ${okCount}/${total} OK, ${skipCount} skipped${dryRun ? ' (DRY-RUN)' : ''}.`);
