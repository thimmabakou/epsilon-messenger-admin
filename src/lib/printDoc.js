// Imprimer un document Epsilon (conditions, confidentialité, contrats…) sur l'imprimante de l'appareil.
// La fenêtre d'impression du téléphone ou de l'ordinateur liste les imprimantes branchées ou en Wi-Fi
// (et « Enregistrer en PDF »).
// (Site administrateur : impression du navigateur, sans module Android.)


const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// { title, subtitle, body } → page HTML prête à imprimer (format A4, logo Epsilon)
export function printableHtml({ title, subtitle = "", body = "", logo = "" }) {
  const origin = typeof location !== "undefined" ? location.origin : "";
  const img = logo || `${origin}/logo.png`;
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
@page { size: A4; margin: 18mm 16mm 20mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Georgia, "Times New Roman", serif; color: #111; font-size: 11.5pt; line-height: 1.55; background: #fff; }
.hd { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #7A3B8C; padding-bottom: 10px; margin-bottom: 18px; }
.hd img { width: 42px; height: 42px; object-fit: contain; }
.hd .brand { font: 800 15pt/1.1 Arial, sans-serif; color: #7A3B8C; letter-spacing: .02em; }
.hd .sub { font: 9pt Arial, sans-serif; color: #555; margin-top: 2px; }
h1 { font: 800 17pt/1.25 Arial, sans-serif; margin: 0 0 4px; }
.meta { font: 9pt Arial, sans-serif; color: #555; margin-bottom: 18px; }
.body { white-space: pre-wrap; word-wrap: break-word; text-align: justify; }
.ft { margin-top: 28px; border-top: 1px solid #ccc; padding-top: 8px; font: 8.5pt Arial, sans-serif; color: #666; }
</style></head><body>
<div class="hd"><img src="${esc(img)}" alt="" onerror="this.style.display='none'"><div><div class="brand">EPSILON</div><div class="sub">Document officiel</div></div></div>
<h1>${esc(title)}</h1>
${subtitle ? `<div class="meta">${esc(subtitle)}</div>` : ""}
<div class="body">${esc(body)}</div>
<div class="ft">Imprimé le ${esc(today)} · Epsilon</div>
</body></html>`;
}

// Ouvre la fenêtre d'impression de l'appareil. Renvoie false si l'impression n'est pas possible ici.
export async function printDoc(doc) {
  const html = printableHtml(doc);
  return new Promise((resolve) => {
    const f = document.createElement("iframe");
    f.setAttribute("aria-hidden", "true");
    f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;";
    document.body.appendChild(f);
    const done = () => setTimeout(() => { try { f.remove(); } catch { /* déjà retiré */ } }, 1500);
    f.onload = () => {
      const w = f.contentWindow;
      // le logo a le temps d'arriver avant la fenêtre d'impression
      setTimeout(() => {
        try { w.focus(); w.print(); resolve(true); }
        catch { resolve(false); }
        // la fenêtre d'impression bloque jusqu'à sa fermeture ; on nettoie après
        w.onafterprint = done; setTimeout(done, 60000);
      }, 350);
    };
    f.srcdoc = html;
  });
}
