// Statistiques des PRODUITS VENDUS (fichier SQL 83, parties 2 et 3) : les produits les plus vendus, dans quelles
// régions, par catégorie, par boutique, par mois — et les abonnements vendus (Epsilon TV, boutiques, publicités).
import { useState } from "react";
import { rpc } from "../lib/supabase";
import { useLoad, Loading } from "../lib/admin";
import { fmt } from "../lib/format";
import { BarChart } from "../components/charts";
import { monthLabel, sqlMissing } from "../components/MonthlyReport";
import { printReport, money, num } from "../lib/printDoc";

const p2 = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
// Périodes : ce mois, le mois dernier, 3 / 12 derniers mois, depuis le lancement, ou un mois précis
function range(k) {
  const now = new Date();
  if (k === "mois") return [iso(new Date(now.getFullYear(), now.getMonth(), 1)), iso(now), "Ce mois-ci"];
  if (k === "dernier") return [iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)), iso(new Date(now.getFullYear(), now.getMonth(), 0)), "Le mois dernier"];
  if (k === "3m") return [iso(new Date(now.getFullYear(), now.getMonth() - 2, 1)), iso(now), "3 derniers mois"];
  if (k === "12m") return [iso(new Date(now.getFullYear(), now.getMonth() - 11, 1)), iso(now), "12 derniers mois"];
  if (/^\d{4}-\d{2}$/.test(k)) { const [y, m] = k.split("-").map(Number); return [iso(new Date(y, m - 1, 1)), iso(new Date(y, m, 0)), monthLabel(k)]; }
  return [null, null, "Depuis le lancement"];
}
const lastMonths = () => { const now = new Date(); return Array.from({ length: 24 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}`; }); };

const T = (cols, rows, align) => ({ cols, rows, align });
function tables(d) {
  return [
    ["🏆 Produits les plus vendus", "Classés par quantité vendue ; « Régions » = villes des acheteurs",
      T(["Produit", "Boutique", "Catégorie", "Ville du vendeur", "Quantité", "Commandes", "Montant (FCFA)", "Régions (quantité)"],
        d.top.map((r) => [r.produit, r.boutique, r.categorie, r.ville_vendeur, num(r.quantite), num(r.commandes), num(r.montant), r.regions]), ["", "", "", "", "r", "r", "r", ""])],
    ["📍 Ventes par région de l'acheteur", "Où les produits sont achetés",
      T(["Ville", "Commandes", "Quantité", "Montant (FCFA)"], d.par_ville_acheteur.map((r) => [r.ville, num(r.commandes), num(r.quantite), num(r.montant)]), ["", "r", "r", "r"])],
    ["🏪 Ventes par région du vendeur", "D'où les produits sont vendus",
      T(["Ville", "Commandes", "Quantité", "Montant (FCFA)"], d.par_ville_vendeur.map((r) => [r.ville, num(r.commandes), num(r.quantite), num(r.montant)]), ["", "r", "r", "r"])],
    ["🗂️ Ventes par catégorie", "",
      T(["Catégorie", "Commandes", "Quantité", "Montant (FCFA)"], d.par_categorie.map((r) => [r.categorie, num(r.commandes), num(r.quantite), num(r.montant)]), ["", "r", "r", "r"])],
    ["🥇 Meilleures boutiques", "",
      T(["Boutique", "Ville", "Commandes", "Quantité", "Montant (FCFA)"], d.par_boutique.map((r) => [r.boutique, r.ville, num(r.commandes), num(r.quantite), num(r.montant)]), ["", "", "r", "r", "r"])],
    ["📅 Ventes par mois", "",
      T(["Mois", "Commandes", "Quantité", "Montant (FCFA)"], d.par_mois.map((r) => [monthLabel(r.mois), num(r.commandes), num(r.quantite), num(r.montant)]), ["", "r", "r", "r"])],
    ["📺 Abonnements Epsilon TV vendus", "Par formule et par ville du responsable de la chaîne",
      T(["Objet", "Ville", "Nombre", "Montant (FCFA)"], d.abo_tv.map((r) => [r.objet, r.ville, num(r.nombre), num(r.montant)]), ["", "", "r", "r"])],
    ["🛒 Abonnements des boutiques", "Paiements validés, par ville de la boutique",
      T(["Objet", "Ville", "Nombre", "Montant (FCFA)"], d.abo_boutiques.map((r) => [r.objet.replace("basic", "Standard").replace("pro", "Pro"), r.ville, num(r.nombre), num(r.montant)]), ["", "", "r", "r"])],
    ["📣 Publicités vendues", "Par durée et par ville de la boutique",
      T(["Durée", "Ville", "Nombre", "Montant (FCFA)"], d.publicites.map((r) => [r.objet, r.ville, num(r.nombre), num(r.montant)]), ["", "", "r", "r"])],
  ];
}

export default function StatsProducts() {
  const [per, setPer] = useState("mois");
  const [city, setCity] = useState("");
  const [from, to, perLabel] = range(per);
  const res = useLoad(async () => {
    const args = { p_from: from, p_to: to, p_city: city || null };
    const [prod, subs] = await Promise.all([rpc("eg_stats_products", args), rpc("eg_stats_subs", args)]);
    return { ...prod, ...subs };
  }, [per, city]);
  const d = res.data;
  const tbl = d ? tables(d) : [];
  const subtitle = `${perLabel}${city ? ` · ${city}` : " · toutes les régions"}`;
  const doPrint = () => printReport({
    title: "Statistiques des produits vendus", subtitle, landscape: true,
    blocks: [{ kv: [["Commandes", num(d.commandes)], ["Articles vendus", num(d.articles)], ["Ventes", money(d.ventes_fcfa)]] },
      ...tbl.flatMap(([h, sub, t]) => [{ h: h.replace(/^\S+\s/, "") }, ...(sub ? [{ note: sub }] : []), { table: t }])],
  });

  return (
    <>
      <div className="stats-filters">
        <span className="label">Période</span>
        {[["mois", "Ce mois"], ["dernier", "Mois dernier"], ["3m", "3 mois"], ["12m", "12 mois"], ["tout", "Depuis le lancement"]].map(([k, l]) => (
          <button key={k} className={"pill" + (per === k ? " active" : "")} onClick={() => setPer(k)}>{l}</button>
        ))}
        <select className="users-city" value={/^\d{4}-\d{2}$/.test(per) ? per : ""} onChange={(e) => e.target.value && setPer(e.target.value)}>
          <option value="">Un mois précis…</option>
          {lastMonths().map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
        </select>
        <select className="users-city" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Toutes les régions</option>
          {(d?.villes || []).slice().sort().map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        {d && <button className="action-button neutral" onClick={doPrint}>🖨️ Imprimer</button>}
      </div>
      {!d && (sqlMissing(res.error)
        ? <p className="field-hint">⚠️ Exécutez d'abord le fichier SQL 83 (statistiques mensuelles, parties 1, 2 et 3) dans Supabase.</p>
        : <Loading error={res.error} />)}
      {d && (<>
        <section className="stats-hero">
          <div className="hero-card"><span className="k">Ventes · {subtitle}</span><span className="v">{fmt(d.ventes_fcfa)} FCFA</span><span className="d">{fmt(d.commandes)} commande(s) · {fmt(d.articles)} article(s)</span></div>
          <div className="tiles">
            <div className="tile"><span className="k">Produit n° 1</span><span className="v" style={{ fontSize: 18 }}>{d.top[0]?.produit || "—"}</span><span className="d">{d.top[0] ? `${fmt(d.top[0].quantite)} vendu(s)` : "aucune vente"}</span></div>
            <div className="tile"><span className="k">Région n° 1 (acheteurs)</span><span className="v" style={{ fontSize: 18 }}>{d.par_ville_acheteur[0]?.ville || "—"}</span><span className="d">{d.par_ville_acheteur[0] ? `${fmt(d.par_ville_acheteur[0].montant)} FCFA` : ""}</span></div>
            <div className="tile"><span className="k">Abonnements TV vendus</span><span className="v">{fmt(d.abo_tv.reduce((s, r) => s + Number(r.nombre), 0))}</span><span className="d">{fmt(d.abo_tv.reduce((s, r) => s + Number(r.montant), 0))} FCFA</span></div>
            <div className="tile"><span className="k">Abonnements boutiques</span><span className="v">{fmt(d.abo_boutiques.reduce((s, r) => s + Number(r.nombre), 0))}</span><span className="d">{fmt(d.abo_boutiques.reduce((s, r) => s + Number(r.montant), 0))} FCFA</span></div>
          </div>
        </section>
        <section className="viz-grid">
          <div className="viz-card"><div className="viz-head"><div><h2>🏆 Top 10 des produits</h2><p className="viz-sub">Quantité vendue</p></div></div>
            <BarChart items={d.top.slice(0, 10).map((r) => [r.produit, Number(r.quantite)])} name="vendus" height={220} /></div>
          <div className="viz-card"><div className="viz-head"><div><h2>📍 Régions des acheteurs</h2><p className="viz-sub">Montant (FCFA)</p></div></div>
            <BarChart items={d.par_ville_acheteur.slice(0, 10).map((r) => [r.ville, Number(r.montant)])} name="FCFA" height={220} /></div>
        </section>
        {tbl.map(([h, sub, t]) => (
          <div key={h} className="viz-card mr-card">
            <h3 className="mr-h">{h}</h3>{sub && <p className="viz-sub">{sub}</p>}
            <div className="mr-scroll">
              <table className="mr-table">
                <thead><tr>{t.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>{t.rows.length === 0 ? <tr><td colSpan={t.cols.length} style={{ textAlign: "center" }}>Aucune vente sur cette période.</td></tr>
                  : t.rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j} className={t.align[j] === "r" ? "r" : ""}>{v ?? "—"}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        ))}
      </>)}
    </>
  );
}
