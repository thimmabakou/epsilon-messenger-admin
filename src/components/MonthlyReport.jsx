// Rapport MENSUEL (fichier SQL 83, partie 1) : chaque mois, combien d'inscrits, de boutiques, de produits,
// de commandes, et l'argent reçu par Epsilon. En tableaux, imprimable (A4 paysage) pour les archives.
import { useState } from "react";
import { rpc } from "../lib/supabase";
import { useLoad, Loading } from "../lib/admin";
import { fmt } from "../lib/format";
import { printReport, money, num } from "../lib/printDoc";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const monthLabel = (k) => { const [y, m] = String(k).split("-").map(Number); return `${MOIS[m - 1] || "?"} ${y}`; };
export const sqlMissing = (e) => /eg_stats_(monthly|products|subs)|Could not find the function|schema cache/i.test(e?.message || "");
const revenue = (r) => Number(r.abo_boutiques_fcfa || 0) + Number(r.publicites_fcfa || 0) + Number(r.abo_tv_fcfa || 0) + Number(r.commissions || 0);

// Les deux tableaux (écran et papier) : colonnes [titre, valeur, est-ce de l'argent ?]
const TABLES = [
  { title: "👥 Abonnés et activité", cols: [
    ["Nouveaux inscrits", (r) => r.inscrits], ["Inscrits au total", (r) => r.inscrits_total],
    ["Chaînes TV créées", (r) => r.chaines], ["Appels au service client", (r) => r.appels], ["Signalements", (r) => r.signalements],
  ] },
  { title: "🛍️ Commerce", cols: [
    ["Boutiques ouvertes", (r) => r.boutiques], ["Produits publiés", (r) => r.produits], ["Commandes", (r) => r.commandes],
    ["Commandes reçues", (r) => r.commandes_recues], ["Articles vendus", (r) => r.articles_vendus], ["Ventes (FCFA)", (r) => r.ventes_fcfa, true],
    ["Paiements sécurisés reçus", (r) => r.paiements_securises, true],
  ] },
  { title: "💰 Revenus d'Epsilon", cols: [
    ["Abonnements boutiques", (r) => `${r.abo_boutiques} · ${money(r.abo_boutiques_fcfa)}`, false, (r) => r.abo_boutiques_fcfa],
    ["Publicités", (r) => `${r.publicites} · ${money(r.publicites_fcfa)}`, false, (r) => r.publicites_fcfa],
    ["Epsilon TV", (r) => `${r.abo_tv} · ${money(r.abo_tv_fcfa)}`, false, (r) => r.abo_tv_fcfa],
    ["Commissions", (r) => r.commissions, true], ["Total des revenus", revenue, true],
  ] },
];
const cellText = (c, r) => (c[2] ? money(c[1](r)) : typeof c[1](r) === "number" ? num(c[1](r)) : c[1](r));
const total = (rows, c) => (c[3] ? money(rows.reduce((s, r) => s + Number(c[3](r) || 0), 0))
  : c[0] === "Inscrits au total" ? num(rows[0]?.inscrits_total) : c[2] ? money(rows.reduce((s, r) => s + Number(c[1](r) || 0), 0)) : num(rows.reduce((s, r) => s + Number(c[1](r) || 0), 0)));

export function printMonthly(rows, n) {
  return printReport({
    title: "Rapport mensuel d'Epsilon", subtitle: `${n} derniers mois · du plus récent au plus ancien`, landscape: true,
    blocks: TABLES.flatMap((t) => [{ h: t.title.replace(/^\S+\s/, "") }, { table: {
      cols: ["Mois", ...t.cols.map((c) => c[0])], align: ["", ...t.cols.map(() => "r")], num: false,
      rows: rows.map((r) => [monthLabel(r.mois), ...t.cols.map((c) => cellText(c, r))]),
      foot: ["Total", ...t.cols.map((c) => total(rows, c))],
    } }]),
  });
}

export default function MonthlyReport() {
  const [n, setN] = useState(12);
  const res = useLoad(() => rpc("eg_stats_monthly", { p_months: n }), [n]);
  const rows = res.data || [];
  return (
    <div className="viz-card mr-card">
      <div className="viz-head" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}><h2>📅 Rapport mensuel</h2><p className="viz-sub">Chaque mois : inscriptions, commerce et revenus d'Epsilon</p></div>
        <div className="pill-group">
          {[6, 12, 24].map((k) => <button key={k} className={"pill" + (n === k ? " active" : "")} onClick={() => setN(k)}>{k} mois</button>)}
        </div>
        {rows.length > 0 && <button className="action-button neutral" onClick={() => printMonthly(rows, n)}>🖨️ Imprimer le rapport</button>}
      </div>
      {!res.data && (sqlMissing(res.error)
        ? <p className="field-hint">⚠️ Exécutez d'abord le fichier SQL 83 (statistiques mensuelles, parties 1, 2 et 3) dans Supabase.</p>
        : <Loading error={res.error} />)}
      {rows.length > 0 && TABLES.map((t) => (
        <div key={t.title} className="mr-block">
          <h3 className="mr-h">{t.title}</h3>
          <div className="mr-scroll">
            <table className="mr-table">
              <thead><tr><th>Mois</th>{t.cols.map((c) => <th key={c[0]}>{c[0]}</th>)}</tr></thead>
              <tbody>{rows.map((r) => <tr key={r.mois}><td>{monthLabel(r.mois)}</td>{t.cols.map((c) => <td key={c[0]}>{c[2] ? `${fmt(c[1](r))}` : cellText(c, r)}</td>)}</tr>)}</tbody>
              <tfoot><tr><td>Total</td>{t.cols.map((c) => <td key={c[0]}>{total(rows, c).replace(" FCFA", "")}</td>)}</tr></tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
