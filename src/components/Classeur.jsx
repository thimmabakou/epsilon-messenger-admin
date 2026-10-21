// Classement « comme un classeur » pour les grandes listes (utilisateurs, signalements) :
//  • PlaceNav : Monde › continent › pays › ville, avec le nombre à chaque niveau ;
//  • Pager    : la liste en feuilles (20 par feuille), comme des pages A4 : « Feuille 3 / 120 ».
// Les nombres viennent de la base (fichier SQL 84) : rien n'est chargé en entier, même avec des millions de comptes.
import { useState } from "react";
import { COUNTRIES } from "../lib/format";

// Indicatif → continent (les pays d'Epsilon aujourd'hui sont en Afrique ; les autres sont prévus)
export function continentOf(cc) {
  const c = String(cc || "");
  if (c.startsWith("2")) return "Afrique";
  if (c === "1") return "Amérique du Nord";
  if (c.startsWith("5")) return "Amérique du Sud";
  if (c.startsWith("3") || c.startsWith("4")) return "Europe";
  if (c.startsWith("6") || c.startsWith("8") || c.startsWith("9")) return "Asie et Océanie";
  return "Autre";
}
export const countryName = (cc) => (COUNTRIES[cc] ? `${COUNTRIES[cc][0]} ${COUNTRIES[cc][1]}` : `+${cc}`);
export const sqlMissing84 = (e) => /eg_(reports|users)_(find|summary|places)|eg_cc|Could not find the function|schema cache/i.test(e?.message || "");

const sum = (rows) => rows.reduce((s, r) => s + Number(r.total || 0), 0);
const fmtN = (n) => Number(n || 0).toLocaleString("fr-FR").replace(/ | /g, " ");

// places : [{ cc, ville, total, en_attente? }] ; value : { cont, cc, city }
export function PlaceNav({ places, value, onChange, extra = "en_attente", extraLabel = "en attente" }) {
  const [cityQ, setCityQ] = useState("");
  const all = places || [];
  const inCont = value.cont ? all.filter((p) => continentOf(p.cc) === value.cont) : all;
  const inCc = value.cc ? inCont.filter((p) => p.cc === value.cc) : inCont;
  const group = (rows, key) => {
    const m = new Map();
    rows.forEach((r) => { const k = key(r); const o = m.get(k) || { k, total: 0, x: 0 }; o.total += Number(r.total || 0); o.x += Number(r[extra] || 0); m.set(k, o); });
    return [...m.values()].sort((a, b) => b.total - a.total);
  };
  let level, chips;
  if (!value.cont) { level = "continent"; chips = group(all, (r) => continentOf(r.cc)).map((g) => ({ ...g, label: `🌍 ${g.k}`, pick: { cont: g.k, cc: "", city: "" } })); }
  else if (!value.cc) { level = "pays"; chips = group(inCont, (r) => r.cc).map((g) => ({ ...g, label: countryName(g.k), pick: { ...value, cc: g.k, city: "" } })); }
  else if (!value.city) {
    level = "ville";
    const t = cityQ.trim().toLowerCase();
    chips = group(inCc, (r) => r.ville).filter((g) => !t || g.k.toLowerCase().includes(t)).map((g) => ({ ...g, label: `📍 ${g.k}`, pick: { ...value, city: g.k } }));
  } else { level = null; chips = []; }
  const shown = level === "ville" && !cityQ ? chips.slice(0, 40) : chips;

  return (
    <div className="cl-nav">
      <div className="cl-crumbs">
        <button className={!value.cont ? "cur" : ""} onClick={() => onChange({ cont: "", cc: "", city: "" })}>🌐 Monde <b>{fmtN(sum(all))}</b></button>
        {value.cont && <><span>›</span><button className={!value.cc ? "cur" : ""} onClick={() => onChange({ cont: value.cont, cc: "", city: "" })}>{value.cont} <b>{fmtN(sum(inCont))}</b></button></>}
        {value.cc && <><span>›</span><button className={!value.city ? "cur" : ""} onClick={() => onChange({ ...value, city: "" })}>{countryName(value.cc)} <b>{fmtN(sum(inCc))}</b></button></>}
        {value.city && <><span>›</span><button className="cur">📍 {value.city} <b>{fmtN(sum(inCc.filter((p) => p.ville === value.city)))}</b></button></>}
      </div>
      {level && (
        <>
          <div className="cl-level">Choisir {level === "continent" ? "un continent" : level === "pays" ? "un pays" : "une ville"} :</div>
          {level === "ville" && chips.length > 8 && <input className="cl-cityq" placeholder="Chercher une ville…" value={cityQ} onChange={(e) => setCityQ(e.target.value)} />}
          <div className="cl-chips">
            {shown.map((c) => (
              <button key={c.k} onClick={() => { setCityQ(""); onChange(c.pick); }}>
                <span>{c.label}</span><b>{fmtN(c.total)}</b>{c.x > 0 && <em>{fmtN(c.x)} {extraLabel}</em>}
              </button>
            ))}
            {shown.length === 0 && <span className="field-hint">Rien ici pour le moment.</span>}
            {level === "ville" && !cityQ && chips.length > shown.length && <span className="field-hint">… et {chips.length - shown.length} autres villes : utilisez la recherche ci-dessus.</span>}
          </div>
        </>
      )}
    </div>
  );
}

// Feuilles : ‹ Feuille 3 / 120 › et saut direct à une feuille
export function Pager({ page, total, size, onPage, label = "élément(s)" }) {
  const pages = Math.max(1, Math.ceil((total || 0) / size));
  const [jump, setJump] = useState("");
  const go = (p) => onPage(Math.min(pages, Math.max(1, p)));
  return (
    <div className="cl-pager">
      <button disabled={page <= 1} onClick={() => go(1)} aria-label="Première feuille">«</button>
      <button disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Feuille précédente">‹</button>
      <span className="cl-sheet">📄 Feuille <b>{page}</b> / {fmtN(pages)} <small>· {fmtN(total)} {label}</small></span>
      <button disabled={page >= pages} onClick={() => go(page + 1)} aria-label="Feuille suivante">›</button>
      <button disabled={page >= pages} onClick={() => go(pages)} aria-label="Dernière feuille">»</button>
      {pages > 2 && (
        <form onSubmit={(e) => { e.preventDefault(); const n = parseInt(jump, 10); if (n) go(n); setJump(""); }} className="cl-jump">
          <input inputMode="numeric" placeholder="N°" value={jump} onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))} />
          <button type="submit">Aller</button>
        </form>
      )}
    </div>
  );
}
