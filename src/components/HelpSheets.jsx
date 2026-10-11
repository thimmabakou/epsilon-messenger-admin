// Fiches pratiques du Service client (rubrique Service client, sous les messages automatiques) :
// une fiche par sujet, étape par étape, à lire au client au téléphone ou à lui copier dans sa discussion.
import { useMemo, useState } from "react";
import { HELP_SHEETS, sheetAsText } from "../lib/helpSheets";

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

function Sheet({ s }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(sheetAsText(s)); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { window.prompt("Copiez le texte :", sheetAsText(s)); }
  };
  return (
    <div className="hs-sheet">
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
              <tbody>{s.pricing.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 3 ? "hs-price" : ""}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <ul className="hs-list">{s.pricing.extra.map((e) => <li key={e}>{e}</li>)}</ul>
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
        <button className="action-button neutral" onClick={copy}>{copied ? "✅ Copiée" : "📋 Copier la fiche (pour l'envoyer au client)"}</button>
      </div>
    </div>
  );
}

export default function HelpSheets() {
  const [open, setOpen] = useState(false);
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
        <button className="action-button neutral" onClick={() => setOpen(!open)}>{open ? "Fermer" : "Ouvrir les fiches"}</button>
      </div>
      <span className="field-hint">Quand un client appelle parce qu'il ne s'en sort pas, ouvrez la fiche du sujet et lisez-lui les étapes une par une, en attendant qu'il ait fini chaque étape avant de passer à la suivante. Le bouton « Copier la fiche » permet aussi de la lui envoyer par écrit dans sa discussion.</span>
      {open && (
        <>
          <input className="hs-search" placeholder="Chercher un mot (ex. référence, débat, musique, recharge…)" value={q} onChange={(e) => setQ(e.target.value)} />
          {list.length === 0 && <span className="field-hint">Aucune fiche ne parle de « {q} ».</span>}
          {list.map((s) => (
            <div key={s.id} className={"hs-item" + (cur === s.id ? " open" : "")}>
              <button className="hs-head" onClick={() => setCur(cur === s.id ? null : s.id)}>
                <span className="hs-icon">{s.icon}</span>
                <span className="hs-title">{s.title}</span>
                <span className="hs-chev">{cur === s.id ? "▾" : "▸"}</span>
              </button>
              {cur === s.id && <Sheet s={s} />}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
