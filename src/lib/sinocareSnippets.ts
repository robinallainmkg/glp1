// HTML helpers — génèrent les fragments à injecter dans articles markdown
// Inline-styled (pattern projet, cohérent avec PartnerCTA.astro)
// rel="sponsored noopener" + target="_blank" + disclosure obligatoires
import { buildAwinUrl, getProductById, type SinocareProduct } from './sinocareProducts';

const SPONSORED = 'rel="sponsored noopener" target="_blank"';
const DISCLOSURE = '<span style="font-size:.72rem;color:#94a3b8;font-style:italic;">Lien sponsorisé</span>';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

function productOrFail(id: string): SinocareProduct {
  const p = getProductById(id);
  if (!p) throw new Error(`Unknown sinocare product: ${id}`);
  return p;
}

// 1. ProductMention — hyperlink inline dans un paragraphe
export function productMention(productId: string, slug: string, linkText?: string): string {
  const p = productOrFail(productId);
  const url = buildAwinUrl(productId, 'mention', slug);
  const text = escapeHtml(linkText || p.name);
  return `<a href="${url}" ${SPONSORED} data-sinocare-mention style="color:#1B6FA0;font-weight:600;text-decoration:underline;text-decoration-color:#7dd3fc;text-underline-offset:3px;">${text}</a>`;
}

// 2. ProductCard — carte compacte 320px max, inline-block in article flow
export function productCard(productId: string, slug: string): string {
  const p = productOrFail(productId);
  const url = buildAwinUrl(productId, 'card', slug);
  return `<aside data-sinocare-card style="margin:1.5rem auto;max-width:380px;border:1px solid #e2e8f0;border-radius:14px;padding:1.1rem;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.04);box-sizing:border-box;">
  <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem;">
    <span style="font-size:.72rem;background:#f0f9ff;color:#0369a1;padding:.2rem .55rem;border-radius:4px;font-weight:600;letter-spacing:.02em;">SINOCARE</span>
    <span style="font-size:.78rem;color:#475569;">★ ${p.rating}/5</span>
  </div>
  <h4 style="margin:0 0 .4rem 0;font-size:1.02rem;font-weight:700;color:#0f172a;line-height:1.3;">${escapeHtml(p.name)}</h4>
  <p style="margin:0 0 .8rem 0;font-size:.88rem;color:#475569;line-height:1.5;">${escapeHtml(p.shortDesc)}</p>
  <div style="display:flex;align-items:center;justify-content:space-between;gap:.6rem;flex-wrap:wrap;margin-bottom:.5rem;">
    <span style="font-size:1.05rem;font-weight:700;color:#0f172a;">À partir de ${p.priceFromEur.toFixed(2).replace('.', ',')}&nbsp;€</span>
    <a href="${url}" ${SPONSORED} style="background:#1B6FA0;color:#fff;font-size:.88rem;font-weight:600;padding:.55rem 1.1rem;border-radius:7px;text-decoration:none;white-space:nowrap;">Voir &rarr;</a>
  </div>
  ${DISCLOSURE}
</aside>`;
}

// 3. ProductCompare — table comparative 2-3 colonnes
export function productCompare(productIds: string[], slug: string): string {
  if (productIds.length < 2) throw new Error('productCompare needs >= 2 products');
  const items = productIds.slice(0, 3).map(productOrFail);
  const cols = items.map(p => {
    const url = buildAwinUrl(p.id, 'compare', slug);
    return `<td style="border:1px solid #e2e8f0;padding:1rem;vertical-align:top;width:${100 / items.length}%;background:#fff;">
      <div style="font-size:.7rem;color:#0369a1;font-weight:600;margin-bottom:.3rem;letter-spacing:.02em;">SINOCARE</div>
      <h4 style="margin:0 0 .4rem 0;font-size:.95rem;color:#0f172a;line-height:1.3;">${escapeHtml(p.name)}</h4>
      <p style="margin:0 0 .6rem 0;font-size:.82rem;color:#475569;line-height:1.45;">${escapeHtml(p.shortDesc)}</p>
      <div style="font-size:.95rem;font-weight:700;color:#0f172a;margin-bottom:.7rem;">Dès ${p.priceFromEur.toFixed(2).replace('.', ',')}&nbsp;€</div>
      <div style="font-size:.78rem;color:#475569;margin-bottom:.7rem;">★ ${p.rating}/5</div>
      <a href="${url}" ${SPONSORED} style="display:inline-block;background:#1B6FA0;color:#fff;font-size:.82rem;font-weight:600;padding:.45rem .9rem;border-radius:6px;text-decoration:none;">Découvrir</a>
    </td>`;
  }).join('');
  return `<div data-sinocare-compare style="margin:1.75rem 0;overflow-x:auto;">
  <table style="width:100%;border-collapse:collapse;font-family:inherit;">
    <tbody><tr>${cols}</tr></tbody>
  </table>
  <p style="margin:.6rem 0 0 0;font-size:.78rem;color:#94a3b8;text-align:right;font-style:italic;">Liens sponsorisés &middot; Sinocare via Awin</p>
</div>`;
}

// 4. ProductBulletList — liste à puces stylée avec produit en 1er item
export function productBulletList(productId: string, slug: string, otherItems: string[]): string {
  const p = productOrFail(productId);
  const url = buildAwinUrl(productId, 'bullet', slug);
  const others = otherItems.map(it => `<li style="margin-bottom:.4rem;">${it}</li>`).join('');
  return `<ul data-sinocare-bullet style="margin:1rem 0;padding-left:1.3rem;">
  <li style="margin-bottom:.4rem;"><a href="${url}" ${SPONSORED} style="color:#1B6FA0;font-weight:600;">${escapeHtml(p.name)}</a> — ${escapeHtml(p.shortDesc)} <span style="font-size:.72rem;color:#94a3b8;">(sponsorisé)</span></li>
  ${others}
</ul>`;
}

// 5. ProductCallout — encart conseil "💡 Pratique" pastel vert
export function productCallout(productId: string, slug: string, title?: string, body?: string): string {
  const p = productOrFail(productId);
  const url = buildAwinUrl(productId, 'callout', slug);
  const calloutTitle = title || `Conseil pratique`;
  const calloutBody = body || `Pour un suivi régulier, beaucoup de patients utilisent un appareil simple comme le ${p.name} — disponible dès ${p.priceFromEur.toFixed(2).replace('.', ',')}&nbsp;€.`;
  return `<div data-sinocare-callout style="margin:1.5rem 0;background:linear-gradient(135deg,#ecfdf5,#f0fdfa);border-left:4px solid #14b8a6;border-radius:8px;padding:1.1rem 1.2rem;">
  <p style="margin:0 0 .4rem 0;font-weight:700;color:#0f766e;font-size:.95rem;">💡 ${escapeHtml(calloutTitle)}</p>
  <p style="margin:0 0 .7rem 0;color:#134e4a;font-size:.92rem;line-height:1.55;">${calloutBody}</p>
  <a href="${url}" ${SPONSORED} style="display:inline-block;font-size:.85rem;color:#0f766e;font-weight:600;text-decoration:underline;">Voir le produit (lien sponsorisé) &rarr;</a>
</div>`;
}

// 6. ProductImageWithCaption — image éditoriale + caption
export function productImageWithCaption(productId: string, slug: string, caption?: string): string {
  const p = productOrFail(productId);
  const url = buildAwinUrl(productId, 'imgcaption', slug);
  const cap = caption || `${p.name} — disponible chez Sinocare`;
  return `<figure data-sinocare-figure style="margin:1.5rem 0;text-align:center;">
  <a href="${url}" ${SPONSORED} style="display:inline-block;">
    <img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" loading="lazy" style="max-width:100%;height:auto;border-radius:10px;border:1px solid #e2e8f0;" />
  </a>
  <figcaption style="margin-top:.5rem;font-size:.82rem;color:#64748b;font-style:italic;">${escapeHtml(cap)} <span style="color:#94a3b8;">(lien sponsorisé)</span></figcaption>
</figure>`;
}

// 7. DoctorQuote — citation Dr Marie Dubois avec recommandation factuelle
export function doctorQuote(productId: string, slug: string, quoteBody: string): string {
  const p = productOrFail(productId);
  const url = buildAwinUrl(productId, 'doctorquote', slug);
  // quoteBody doit contenir une recommandation factuelle, pas un claim médical inventé
  const bodyWithLink = quoteBody.replace('[PRODUCT]', `<a href="${url}" ${SPONSORED} style="color:#1B6FA0;font-weight:600;">${escapeHtml(p.name)}</a>`);
  return `<blockquote data-sinocare-quote style="margin:1.75rem 0;padding:1.2rem 1.4rem;background:#f8fafc;border-left:4px solid #1B6FA0;border-radius:6px;">
  <p style="margin:0 0 .7rem 0;font-style:italic;color:#1e293b;font-size:1rem;line-height:1.6;">«&nbsp;${bodyWithLink}&nbsp;»</p>
  <footer style="display:flex;align-items:center;gap:.6rem;font-size:.85rem;color:#475569;">
    <a href="/auteurs/dr-marie-dubois/" style="color:#1B6FA0;text-decoration:none;font-weight:600;">Dr Marie Dubois</a>
    <span style="color:#94a3b8;">&middot; rédactrice santé GLP-1 France &middot; ${DISCLOSURE.replace('<span', '<span style="font-size:.72rem;color:#94a3b8;font-style:italic;"').replace('Lien sponsorisé', 'lien sponsorisé')}</span>
  </footer>
</blockquote>`;
}

// 8. ProductFooter — encart fin d'article "Matériel mentionné"
export function productFooter(productIds: string[], slug: string): string {
  const items = productIds.slice(0, 3).map(productOrFail);
  const links = items.map(p => {
    const url = buildAwinUrl(p.id, 'footer', slug);
    return `<li style="margin-bottom:.45rem;font-size:.88rem;line-height:1.5;"><a href="${url}" ${SPONSORED} style="color:#1B6FA0;font-weight:600;">${escapeHtml(p.name)}</a> — ${escapeHtml(p.shortDesc)} <span style="color:#94a3b8;">(dès ${p.priceFromEur.toFixed(2).replace('.', ',')}&nbsp;€)</span></li>`;
  }).join('');
  return `<aside data-sinocare-footer style="margin:2rem 0 1rem 0;padding:1.1rem 1.3rem;border:1px solid #e2e8f0;border-radius:10px;background:#fafbfc;">
  <p style="margin:0 0 .6rem 0;font-size:.85rem;font-weight:700;color:#475569;letter-spacing:.02em;text-transform:uppercase;">📦 Matériel mentionné dans cet article</p>
  <ul style="margin:0;padding-left:1.2rem;">${links}</ul>
  <p style="margin:.7rem 0 0 0;font-size:.75rem;color:#94a3b8;font-style:italic;">Les liens ci-dessus sont sponsorisés — Sinocare est un partenaire commercial via Awin.</p>
</aside>`;
}
