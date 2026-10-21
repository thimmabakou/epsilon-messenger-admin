// Fiches pratiques du Service client (rubrique Service client, sous les messages automatiques) :
// une fiche par sujet, étape par étape, à lire au client au téléphone ou à lui copier dans sa discussion.
import { useEffect, useMemo, useState } from "react";
import { HELP_SHEETS, sheetAsText } from "../lib/helpSheets";
import { CLIENT_ZONES, convertDeep, conversionNote, loadRates } from "../lib/money";
import { printReport } from "../lib/printDoc";

// Imprimer une fiche (tarifs, étapes, problèmes) en tableaux A4, dans la monnaie choisie
function sheetBlocks(raw, zone) {
  const s = convertDeep(raw, zone);
  const note = conversionNote(zone);
  const steps = (list) => ({ table: { cols: ["Étape", "Détail"], rows: list.map((st) => [st.t, st.d]) } });
  const blocks = [];
  if (note) blocks.push({ note });
  blocks.push({ text: s.intro });
  if (s.who) blocks.push({ kv: [["Pour", s.who]] });
  if (s.prices) blocks.push({ h: "Prix" }, { table: { cols: ["Article", "Prix"], align: ["", "r"], rows: s.prices, num: false } });
  if (s.pricing) {
    blocks.push({ h: "Tarifs" }, { note: s.pricing.base }, { table: { cols: s.pricing.head, rows: s.pricing.rows, num: false } });
    if (s.pricing.extra?.length) blocks.push({ text: s.pricing.extra.map((e) => `• ${e}`).join("\n") });
    (s.pricing.tables || []).forEach((t) => blocks.push({ h: t.title }, { table: { cols: t.head, rows: t.rows, num: false } }));
    if (s.pricing.note) blocks.push({ note: s.pricing.note });
    if (s.pricing.examples?.length) blocks.push({ h: "Exemples concrets" }, { text: s.pricing.examples.map((e) => `• ${e}`).join("\n") });
  }
  blocks.push({ h: "Étape par étape" }, steps(s.steps));
  if (s.debate) blocks.push({ h: s.debate.title }, { text: s.debate.intro }, steps(s.debate.steps));
  if (s.tips?.length) blocks.push({ h: "Bon à savoir" }, { text: s.tips.map((t) => `• ${t}`).join("\n") });
  if (s.problems?.length) blocks.push({ h: "Quand ça bloque" }, { table: { cols: ["Le client dit…", "Ce qu'il faut faire"], rows: s.problems.map((p) => [p.q, p.a]) } });
  return blocks;
}
export function printSheet(raw, zone) {
  return printReport({ title: `${raw.icon || ""} ${raw.title}`.trim(), subtitle: "Fiche pratique du Service client · Epsilon Messenger", blocks: sheetBlocks(raw, zone) });
}
// Le classeur complet : sommaire puis une fiche par page
export function printAllSheets(zone) {
  const blocks = [{ h: "Sommaire" }, { table: { cols: ["Fiche", "Pour"], rows: HELP_SHEETS.map((x) => [`${x.icon || ""} ${x.title}`, x.who]) } }];
  HELP_SHEETS.forEach((x) => blocks.push({ pageBreak: true }, { h: `${x.icon || ""} ${x.title}` }, ...sheetBlocks(x, zone)));
  return printReport({ title: "Classeur des fiches pratiques", subtitle: `${HELP_SHEETS.length} fiches · Service client Epsilon Messenger`, blocks });
}

// Fiche prête à envoyer à un client : montants dans sa monnaie (+ phrase sur le taux du jour)
export function sheetForClient(s, zoneId) {
  const note = conversionNote(zoneId);
  const text = sheetAsText(convertDeep(s, zoneId));
  return note ? `${note}\n\n${text}` : text;
}

// Copier une fiche entière (dans la monnaie du client) : bouton sur chaque ligne de la liste ET dans la fiche ouverte
async function copySheet(raw, zone) {
  const text = sheetForClient(raw, zone);
  try { await navigator.clipboard.writeText(text); return true; }
  catch { window.prompt("Copiez le texte :", text); return false; }
}

function CopyButton({ s, zone, big }) {
  const [done, setDone] = useState(false);
  const go = async (e) => {
    e.stopPropagation();
    if (await copySheet(s, zone)) { setDone(true); setTimeout(() => setDone(false), 2500); }
  };
  return big
    ? <button className="action-button neutral" onClick={go}>{done ? "✅ Fiche copiée : collez-la dans la discussion du client" : "📋 Copier la fiche (pour l'envoyer au client)"}</button>
    : <button className={"hs-copy" + (done ? " done" : "")} onClick={go} aria-label="Copier la fiche">{done ? "✅ Copiée" : "📋 Copier"}</button>;
}

function Steps({ steps }) {
  return (
    <ol className="hs-steps">
      {steps.map((st, i) => (
        <li key={i}>
          <span className="hs-num">Étape {i + 1}</span>
          <strong>{st.t}</strong>
          <p>{st.d}</p>
        </li>
      ))}
    </ol>
  );
}

function Sheet({ s: raw, zone }) {
  const s = convertDeep(raw, zone);
  const note = conversionNote(zone);
  return (
    <div className="hs-sheet">
      <div className="mp-actions"><CopyButton s={raw} zone={zone} big /><button className="action-button neutral" onClick={() => printSheet(raw, zone)}>🖨️ Imprimer la fiche</button></div>
      {note && <p className="hs-base">{note}</p>}
      <p className="hs-intro">{s.intro}</p>
      <span className="field-hint">Pour : {s.who}</span>

      {s.prices && (
        <table className="hs-table"><tbody>
          {s.prices.map(([a, b]) => <tr key={a}><td>{a}</td><td className="hs-price">{b}</td></tr>)}
        </tbody></table>
      )}
      {s.pricing && (
        <>
          <p className="hs-base">💰 {s.pricing.base}</p>
          <div className="hs-scroll">
            <table className="hs-table">
              <thead><tr>{s.pricing.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{s.pricing.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === (s.pricing.priceCol ?? 3) ? "hs-price" : ""}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <ul className="hs-list">{s.pricing.extra.map((e) => <li key={e}>{e}</li>)}</ul>
          {(s.pricing.tables || []).map((t) => (
            <div key={t.title} className="hs-block">
              <h4>📊 {t.title}</h4>
              <div className="hs-scroll">
                <table className="hs-table">
                  <thead><tr>{t.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{t.rows.map((r) => <tr key={r[0]}>{r.map((v, i) => <td key={i} className={i === 0 ? "hs-price" : ""}>{v}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </div>
          ))}
          {s.pricing.note && <span className="field-hint">{s.pricing.note}</span>}
          {s.pricing.examples && (
            <div className="hs-block">
              <h4>🎯 Exemples concrets</h4>
              <ul className="hs-list">{s.pricing.examples.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
          )}
        </>
      )}

      <Steps steps={s.steps} />

      {s.debate && (
        <div className="hs-block">
          <h4>🎙️ {s.debate.title}</h4>
          <p className="hs-intro">{s.debate.intro}</p>
          <Steps steps={s.debate.steps} />
        </div>
      )}

      {s.tips?.length > 0 && (
        <div className="hs-block">
          <h4>💡 Bon à savoir</h4>
          <ul className="hs-list">{s.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      )}
      {s.problems?.length > 0 && (
        <div className="hs-block">
          <h4>🛟 Quand ça bloque</h4>
          {s.problems.map((p) => <div key={p.q} className="hs-qa"><b>{p.q}</b><span>{p.a}</span></div>)}
        </div>
      )}

      <div className="mp-actions">
        <CopyButton s={raw} zone={zone} big />
      </div>
    </div>
  );
}

export default function HelpSheets() {
  const [open, setOpen] = useState(false);
  const [zone, setZone] = useState("XAF"); // monnaie du client à qui on lit / envoie la fiche
  const [, setReady] = useState(0);
  useEffect(() => { if (open) loadRates().then(() => setReady((x) => x + 1)); }, [open]);
  const [cur, setCur] = useState(null);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return HELP_SHEETS;
    return HELP_SHEETS.filter((s) => JSON.stringify(s).toLowerCase().includes(t));
  }, [q]);

  return (
    <div className="ver-form" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 14, flex: 1 }}>📘 Fiches pratiques (guider un client)</strong>
        {open && <button className="action-button neutral" onClick={() => printAllSheets(zone)}>🖨️ Imprimer tout le classeur</button>}
        <button className="action-button neutral" onClick={() => setOpen(!open)}>{open ? "Fermer" : "Ouvrir les fiches"}</button>
      </div>
      <span className="field-hint">Quand un client appelle parce qu'il ne s'en sort pas, ouvrez la fiche du sujet et lisez-lui les étapes une par une, en attendant qu'il ait fini chaque étape avant de passer à la suivante. S'il ne comprend toujours pas, touchez « 📋 Copier » à côté de la fiche, puis collez-la dans sa discussion : il pourra la relire tranquillement, autant de fois qu'il faut.</span>
      {open && (
        <>
          <label className="hs-zone">💱 Monnaie du client :
            <select value={zone} onChange={(e) => setZone(e.target.value)}>
              {CLIENT_ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
            </select>
          </label>
          <input className="hs-search" placeholder="Chercher un mot (ex. référence, débat, musique, recharge…)" value={q} onChange={(e) => setQ(e.target.value)} />
          {list.length === 0 && <span className="field-hint">Aucune fiche ne parle de « {q} ».</span>}
          {list.map((s) => (
            <div key={s.id} className={"hs-item" + (cur === s.id ? " open" : "")}>
              <div className="hs-row">
                <button className="hs-head" onClick={() => setCur(cur === s.id ? null : s.id)}>
                  <span className="hs-icon">{s.icon}</span>
                  <span className="hs-title">{s.title}</span>
                  <span className="hs-chev">{cur === s.id ? "▾" : "▸"}</span>
                </button>
                <CopyButton s={s} zone={zone} />
              </div>
              {cur === s.id && <Sheet s={s} zone={zone} />}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
