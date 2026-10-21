// Impression des documents du site administrateur (A4, prêts à archiver ou à scanner).
// La fenêtre d'impression de l'ordinateur ou du téléphone liste les imprimantes reconnues (USB, Wi-Fi,
// Bluetooth) et propose « Enregistrer en PDF ». Les pages se suivent toutes seules quand une page est
// pleine ; les en-têtes des tableaux se répètent en haut de chaque page ; chaque page est numérotée.
//
//  • printDoc({ title, subtitle, body })          : un texte (conditions, confidentialité…)
//  • printReport({ title, subtitle, blocks, landscape, ref }) : rapport / registre / contrat en tableaux
//      blocs : { h }, { text }, { note }, { kv: [[libellé, valeur], …] },
//              { table: { cols: [...], rows: [[...], …], foot: [...], align: ["", "r", …] } },
//              { sign: ["Pour Epsilon", "Pour le client"] }, { pageBreak: true }
//  • printScreen(élément, titre)                   : la page affichée, nettoyée (sans boutons ni menus)

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const today = () => new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const now = () => new Date().toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const CSS = (landscape) => `
@page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 15mm 14mm 17mm;
  @bottom-left { content: "Epsilon · imprimé le ${now()}"; font: 8pt Arial, sans-serif; color: #777; }
  @bottom-right { content: "Page " counter(page) " / " counter(pages); font: 8pt Arial, sans-serif; color: #777; } }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; background: #fff; }
body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 10pt; line-height: 1.45; }
.hd { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #7A3B8C; padding-bottom: 8px; margin-bottom: 14px; }
.hd img { width: 38px; height: 38px; object-fit: contain; }
.hd .brand { font: 800 14pt/1.1 Arial, sans-serif; color: #7A3B8C; letter-spacing: .03em; }
.hd .sub { font-size: 8.5pt; color: #555; margin-top: 2px; }
.hd .ref { margin-left: auto; text-align: right; font-size: 8.5pt; color: #444; }
h1 { font-size: 15pt; line-height: 1.25; margin: 0 0 3px; }
.meta { font-size: 9pt; color: #555; margin-bottom: 12px; }
h2 { font-size: 11.5pt; margin: 16px 0 6px; color: #5b2a70; break-after: avoid; page-break-after: avoid; }
p.t { margin: 0 0 8px; white-space: pre-wrap; text-align: justify; }
.doc { white-space: pre-wrap; word-wrap: break-word; text-align: justify; font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.55; }
.note { border-left: 3px solid #C2338F; background: #faf3f8; padding: 6px 10px; margin: 8px 0; font-size: 9pt; }
table { width: 100%; border-collapse: collapse; margin: 4px 0 10px; font-size: 9pt; }
thead { display: table-header-group; }
tfoot { display: table-row-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
th { background: #efe6f3; color: #3d1d4b; text-align: left; font-weight: 700; }
th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; word-break: break-word; }
tbody tr:nth-child(even) td { background: #fafafa; }
td.r, th.r { text-align: right; white-space: nowrap; }
td.c, th.c { text-align: center; }
td.n { width: 28px; text-align: center; color: #666; }
tfoot td { font-weight: 700; background: #f3eef6; }
table.kv td:first-child { width: 36%; background: #f6f2f8; font-weight: 700; color: #3d1d4b; }
.sign { display: flex; gap: 18px; margin-top: 26px; break-inside: avoid; page-break-inside: avoid; }
.sign div { flex: 1; border: 1px solid #999; border-radius: 4px; height: 92px; padding: 6px 8px; font-size: 9pt; color: #333; }
.sign small { display: block; color: #777; margin-top: 2px; }
.pb { break-after: page; page-break-after: always; }
/* Page de l'écran recopiée */
.screen button, .screen input[type=file], .screen .no-print, .screen .modal-backdrop, .screen .maintenance-banner { display: none !important; }
.screen * { box-shadow: none !important; max-width: 100% !important; }
.screen img { max-height: 70px; }
.screen svg { max-width: 100%; height: auto; }
.screen .val { border-bottom: 1px dotted #999; padding: 0 2px; }
`;

function head(title, subtitle, ref) {
  const logo = `${location.origin}/logo.png`;
  return `<div class="hd"><img src="${esc(logo)}" alt=""><div><div class="brand">EPSILON</div><div class="sub">Epsilon Messenger · Administration</div></div>
<div class="ref">${ref ? `<b>${esc(ref)}</b><br>` : ""}${esc(today())}</div></div>
<h1>${esc(title)}</h1>${subtitle ? `<div class="meta">${esc(subtitle)}</div>` : ""}`;
}

function page(title, inner, { landscape = false, extraCss = "" } = {}) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"><style>${CSS(landscape)}${extraCss}</style></head><body>${inner}</body></html>`;
}

const cell = (v) => (v == null || v === "" ? "—" : esc(v));
function tableHtml({ cols = [], rows = [], foot = null, align = [], num = true }) {
  const cls = (i) => (align[i] === "r" ? ' class="r"' : align[i] === "c" ? ' class="c"' : "");
  const th = `${num ? '<th class="c">N°</th>' : ""}${cols.map((c, i) => `<th${cls(i)}>${esc(c)}</th>`).join("")}`;
  const body = rows.length
    ? rows.map((r, k) => `<tr>${num ? `<td class="n">${k + 1}</td>` : ""}${r.map((v, i) => `<td${cls(i)}>${cell(v)}</td>`).join("")}</tr>`).join("")
    : `<tr><td colspan="${cols.length + (num ? 1 : 0)}" class="c">Aucune ligne.</td></tr>`;
  const ft = foot ? `<tfoot><tr>${num ? "<td></td>" : ""}${foot.map((v, i) => `<td${cls(i)}>${v == null ? "" : esc(v)}</td>`).join("")}</tr></tfoot>` : "";
  return `<table><thead><tr>${th}</tr></thead><tbody>${body}</tbody>${ft}</table>`;
}

function blockHtml(b) {
  if (!b) return "";
  if (b.h) return `<h2>${esc(b.h)}</h2>`;
  if (b.text != null) return `<p class="t">${esc(b.text)}</p>`;
  if (b.note) return `<div class="note">${esc(b.note)}</div>`;
  if (b.kv) return `<table class="kv"><tbody>${b.kv.filter(Boolean).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${cell(v)}</td></tr>`).join("")}</tbody></table>`;
  if (b.table) return tableHtml(b.table);
  if (b.sign) return `<div class="sign">${b.sign.map((s) => `<div>${esc(s)}<small>Nom, date et signature</small></div>`).join("")}</div>`;
  if (b.pageBreak) return '<div class="pb"></div>';
  return "";
}

// Imprime une page HTML complète depuis un cadre invisible (la page du site reste intacte)
export function printHtml(html) {
  return new Promise((resolve) => {
    const f = document.createElement("iframe");
    f.setAttribute("aria-hidden", "true");
    f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;";
    document.body.appendChild(f);
    const done = () => setTimeout(() => { try { f.remove(); } catch { /* déjà retiré */ } }, 1500);
    f.onload = () => {
      const w = f.contentWindow;
      // les images (logo) ont le temps d'arriver avant la fenêtre d'impression
      const imgs = [...w.document.images].filter((i) => !i.complete);
      Promise.race([Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 2500))]).then(() => {
        try { w.focus(); w.print(); resolve(true); } catch { resolve(false); }
        w.onafterprint = done; setTimeout(done, 60000);
      });
    };
    f.srcdoc = html;
  });
}

// Un texte officiel (conditions, confidentialité, règles…)
export function printableHtml({ title, subtitle = "", body = "" }) {
  return page(title, `${head(title, subtitle)}<div class="doc">${esc(body)}</div>`);
}
export const printDoc = (doc) => printHtml(printableHtml(doc));

// Rapport, registre, contrat… en tableaux
export function printReport({ title, subtitle = "", blocks = [], landscape = false, ref = "" }) {
  return printHtml(page(title, head(title, subtitle, ref) + blocks.map(blockHtml).join(""), { landscape }));
}

// La page affichée à l'écran, recopiée proprement : mêmes couleurs, sans boutons, menus ni fenêtres ;
// les champs remplis deviennent du texte.
export function printScreen(el, title, subtitle = "") {
  if (!el) return Promise.resolve(false);
  const clone = el.cloneNode(true);
  const src = el.querySelectorAll("input, textarea, select");
  clone.querySelectorAll("input, textarea, select").forEach((x, i) => {
    const o = src[i];
    if (!o || o.type === "file" || o.type === "hidden") { x.remove(); return; }
    let v = o.tagName === "SELECT" ? o.options[o.selectedIndex]?.text || "" : o.type === "checkbox" || o.type === "radio" ? (o.checked ? "☑" : "☐") : o.value;
    if (o.type === "password") v = "••••";
    const s = document.createElement("span"); s.className = "val"; s.textContent = v || "";
    x.replaceWith(s);
  });
  // Les feuilles de style du site (pour garder les couleurs et la mise en page des cartes)
  const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')].map((n) => n.outerHTML).join("");
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title>${styles}
<style>${CSS(false)} body { background: #fff !important; } .screen { width: 100%; }</style></head>
<body>${head(title, subtitle)}<div class="screen">${clone.innerHTML}</div></body></html>`;
  return printHtml(html);
}

// Petits outils de mise en forme pour les rapports
export const money = (n) => (n == null || n === "" ? "—" : `${Math.round(Number(n) || 0).toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`);
export const num = (n) => (n == null || n === "" ? "—" : Math.round(Number(n) || 0).toLocaleString("fr-FR").replace(/ | /g, " "));
export const day = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
export const dayTime = (d) => (d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
