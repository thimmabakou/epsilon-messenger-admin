// Règles légales (fichier SQL 118) : conventions collectives, SMIG, barèmes de paie et taxes de chaque pays.
// Une version publiée ici arrive dans toutes les entreprises du pays dès qu'elles se connectent ; elle s'applique
// à partir de sa date d'effet (les mois passés et les paies validées gardent l'ancienne règle).
import { useMemo, useState } from "react";
import { rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { BIZ_COUNTRIES } from "../lib/bizLegal";
import { Note, Pills, ScreenTitle } from "../components/common";

const KINDS = { conv: "Convention collective", smig: "Salaire minimum", paie: "Barème de paie", taxe: "Taxe / impôt", autre: "Autre règle" };
const today = () => new Date().toISOString().slice(0, 10);
const frDate = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR") : "—");

// Champs simples d'un objet (chemin → valeur) pour l'éditer sans écrire de JSON
function flat(o, pre = "", out = []) {
  if (o !== null && typeof o === "object") { for (const k of Object.keys(o)) flat(o[k], pre ? `${pre}.${k}` : k, out); }
  else out.push([pre, o]);
  return out;
}
function setPath(o, path, v) {
  const c = structuredClone(o), ks = path.split(".");
  let t = c;
  for (const k of ks.slice(0, -1)) t = t[k];
  t[ks[ks.length - 1]] = v;
  return c;
}

export default function Rules() {
  const { can, deny, act } = useAdmin();
  const { data, error, reload } = useLoad(() => rpc("eg_legal_rules"));
  const [country, setCountry] = useState("cg");
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState(null); // { code, kind, title, effective, source, data, json, isNew }
  const [confirm, setConfirm] = useState(false);
  const rows = data || [];

  const latest = useMemo(() => {
    const by = new Map();
    for (const r of rows) if (r.code.startsWith(country + ".")) { const o = by.get(r.code); if (!o || r.version > o.version) by.set(r.code, r); }
    return [...by.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title, "fr"));
  }, [rows, country]);
  const count = (c) => new Set(rows.filter((r) => r.code.startsWith(c + ".")).map((r) => r.code)).size;

  const start = (r) => {
    if (!can("rules.publish")) return deny("rules.publish");
    setConfirm(false);
    setForm(r ? { code: r.code, kind: r.kind, title: r.title, effective: today(), source: r.source || "", data: r.data || {}, json: JSON.stringify(r.data || {}, null, 2), isNew: false }
      : { code: `${country}.conv.`, kind: "conv", title: "", effective: today(), source: "", data: {}, json: "{\n  \"short\": \"\",\n  \"detail\": false,\n  \"doc\": \"https://… (lien du texte PDF)\",\n  \"refs\": [{ \"l\": \"Journal officiel n° …\", \"u\": \"https://…\" }]\n}", isNew: true });
  };
  const publish = async () => {
    let d;
    try { d = form.isNew || form.raw ? JSON.parse(form.json) : form.data; } catch { return act(async () => { throw new Error("Le contenu (JSON) n'est pas valide."); }); }
    const ok = await act(() => rpc("eg_legal_rule_publish", { p_code: form.code.trim(), p_kind: form.kind, p_title: form.title.trim(), p_effective: form.effective, p_source: form.source.trim(), p_data: d }),
      "📜 Règle publiée : toutes les entreprises du pays la reçoivent à leur prochaine connexion.");
    if (ok) { setForm(null); setConfirm(false); reload(); }
  };

  return (<>
    <ScreenTitle eyebrow="EPSILON BUSINESS" title="Règles légales par pays">
      <button className="primary-button" onClick={() => start(null)}>＋ Nouvelle règle</button>
    </ScreenTitle>
    <Note icon="📜">Conventions collectives, SMIG, barèmes de paie et taxes de chaque pays. Chaque modification est publiée comme une NOUVELLE VERSION avec sa date d'effet et sa source officielle : elle arrive automatiquement dans toutes les entreprises du pays (au démarrage de l'application, au retour d'Internet et toutes les 3 heures). Les mois passés et les paies déjà validées ne changent pas.</Note>
    <Pills style={{ margin: "12px 0", flexWrap: "wrap" }} value={country} onChange={(c) => { setCountry(c); setOpen(null); }}
      options={BIZ_COUNTRIES.map((c) => [c.c, `${c.flag} ${c.names.fr} (${count(c.c)})`])} />
    {!data && <Loading error={error} />}

    {form && (
      <div className="ver-form">
        <strong style={{ fontSize: 14 }}>{form.isNew ? "Nouvelle règle" : `Nouvelle version — ${form.title}`}</strong>
        {form.isNew && (<>
          <span className="field-hint">Type</span>
          <Pills options={Object.entries(KINDS)} value={form.kind} onChange={(k) => setForm({ ...form, kind: k, code: `${country}.${k === "conv" ? "conv." : k}` })} />
          <span className="field-hint">Code (pays.type.nom, ex. cg.conv.petrole)</span>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "") })} />
        </>)}
        <span className="field-hint">Titre officiel</span>
        <input value={form.title} maxLength={200} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <span className="field-hint">Date d'effet (à partir de quand la règle s'applique)</span>
        <input type="date" value={form.effective} onChange={(e) => setForm({ ...form, effective: e.target.value })} />
        <span className="field-hint">Source officielle (texte, numéro, date, Journal officiel, lien)</span>
        <input value={form.source} maxLength={500} onChange={(e) => setForm({ ...form, source: e.target.value })} />
        {!form.isNew && !form.raw && (<>
          <span className="field-hint">Valeurs (modifier seulement ce qui change)</span>
          <div className="rules-grid">
            {flat(form.data).map(([k, v]) => (
              <label key={k}><span>{k}</span>
                <input value={v ?? ""} onChange={(e) => {
                  const t = e.target.value;
                  const nv = typeof v === "number" ? (t === "" ? null : Number(t.replace(",", "."))) : typeof v === "boolean" ? t === "true" : t;
                  setForm({ ...form, data: setPath(form.data, k, nv) });
                }} /></label>
            ))}
          </div>
          <button className="action-button neutral" onClick={() => setForm({ ...form, raw: true, json: JSON.stringify(form.data, null, 2) })}>Ajouter ou retirer des champs (contenu complet)</button>
        </>)}
        {(form.isNew || form.raw) && (<>
          <span className="field-hint">Contenu complet (JSON)</span>
          <textarea rows={12} style={{ fontFamily: "monospace" }} value={form.json} onChange={(e) => setForm({ ...form, json: e.target.value })} />
        </>)}
        {!confirm ? (
          <div className="mp-actions">
            <button className="action-button primary" disabled={!form.title.trim() || !form.effective || !/^[a-z]{2}\.[a-z0-9_.]{2,60}$/.test(form.code)} onClick={() => setConfirm(true)}>📜 Publier</button>
            <button className="action-button neutral" onClick={() => setForm(null)}>Annuler</button>
          </div>
        ) : (
          <div className="mp-actions">
            <span className="field-hint">Publier pour TOUTES les entreprises du pays, à partir du {frDate(form.effective)} ?</span>
            <button className="action-button danger" onClick={publish}>Oui, publier</button>
            <button className="action-button neutral" onClick={() => setConfirm(false)}>Non</button>
          </div>
        )}
      </div>
    )}

    {data && latest.length === 0 && <p className="reports-empty">Aucune règle pour ce pays pour le moment.</p>}
    <div className="rules-list">
      {latest.map((r) => {
        const hist = rows.filter((x) => x.code === r.code).sort((a, b) => b.version - a.version);
        const partial = r.data?.detail === false;
        return (
          <div key={r.code} className="ver-card">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className="sec-badge">{KINDS[r.kind] || r.kind}</span>
              {partial && <span className="sec-badge" style={{ background: "#fff0e0", color: "#b5650a" }}>Titre seulement — chiffres à intégrer</span>}
              {r.data?.nodate && <span className="sec-badge" style={{ background: "#fff0e0", color: "#b5650a" }}>Date à confirmer</span>}
            </div>
            <h2 style={{ fontSize: 16, margin: "8px 0 2px" }}>{r.title}</h2>
            <span className="field-hint">Version {r.version} · en vigueur depuis le {frDate(r.effective)} · {r.code}</span>
            {r.source && <div className="field-hint" style={{ marginTop: 4 }}>Source : {r.source}</div>}
            {/* Le texte officiel et les sites où il a été trouvé (Journal officiel, patronat, ministère…) */}
            {Array.isArray(r.data?.refs) && r.data.refs.length > 0 && (
              <ul className="rules-refs">
                {r.data.refs.map((x) => <li key={x.u}><a href={x.u} target="_blank" rel="noreferrer">🔗 {x.l}</a></li>)}
              </ul>
            )}
            <div className="mp-actions">
              {r.data?.doc ? <a className="action-button primary" href={r.data.doc} target="_blank" rel="noreferrer">📄 Ouvrir le texte (PDF)</a>
                : <span className="field-hint">📄 Texte PDF pas encore déposé : voir les liens ci-dessus</span>}
              <button className="action-button neutral" onClick={() => setOpen(open === r.code ? null : r.code)}>{open === r.code ? "Masquer" : "Voir le détail"}</button>
              <button className="action-button primary" onClick={() => start(r)}>＋ Nouvelle version</button>
            </div>
            {open === r.code && (<>
              <table className="activity-table"><tbody>
                {flat(r.data || {}).map(([k, v]) => <tr key={k}><td className="activity-who">{k}</td><td>{String(v)}</td></tr>)}
              </tbody></table>
              {hist.length > 1 && <div className="field-hint" style={{ marginTop: 6 }}>Historique : {hist.map((h) => `v${h.version} (${frDate(h.effective)})`).join(" · ")}</div>}
            </>)}
          </div>
        );
      })}
    </div>
  </>);
}
