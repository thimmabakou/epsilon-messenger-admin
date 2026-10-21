// Signalements : liste, dossier complet et actions de modération
import { useState } from "react";
import { PlaceNav, Pager, continentOf, countryName, sqlMissing84 } from "../components/Classeur";
import { monthLabel } from "../components/MonthlyReport";
import { printReport, dayTime } from "../lib/printDoc";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { CONTENT_TYPES } from "../lib/constants";
import { ccOfPhone, dateTime, fullName, maskPhone, shortId } from "../lib/format";
import { Empty, History, Pills, ScreenTitle } from "../components/common";
import SanctionPanel from "../components/SanctionPanel";
import ReportedChat from "../components/ReportedChat";

const KIND_LABEL = { avertissement: "Avertissement envoyé", suspension: "Compte suspendu", retrait_contenu: "Contenu retiré", retrait_produit: "Produit retiré" };
const MODE_PERM = { warn: "mod.warn", suspend: "mod.suspend", remove: "mod.remove" };
const MODE_KIND = { warn: "avertissement", suspend: "suspension", remove: "retrait_contenu" };

function snapshotText(r) {
  const s = r.content_snapshot;
  if (!s) return r.content_ref ? `[${CONTENT_TYPES[r.content_type]}] ${r.content_ref}` : "Aucune copie du contenu n'a été jointe.";
  if (typeof s === "string") return s;
  return s.text || s.description || s.caption || JSON.stringify(s);
}

// Dossier de la discussion signalée (accepte aussi un texte JSON, selon la façon dont la colonne a été créée)
function evidenceOf(r) {
  const e = r?.evidence;
  if (!e) return null;
  if (typeof e === "string") { try { return JSON.parse(e); } catch { return null; } }
  return e;
}

const SIZE = 20;
const STATUS = { en_attente: "En attente", traite: "Traité" };
const statusOf = (s) => STATUS[s] || "Traité";

// Fiche A4 d'un signalement (pour une enquête, la police ou les archives)
function printFiche(r, histRows, fullPhone) {
  const ph = (p) => (p?.phone ? (fullPhone ? p.phone : maskPhone(p.phone)) : "—");
  const person = (p, id) => (p ? `${fullName(p)} · ${shortId(id)}` : shortId(id));
  const ev = evidenceOf(r);
  const blocks = [
    { h: "Dossier" },
    { kv: [["Numéro", `SIG-${r.id}`], ["Date du signalement", dayTime(r.created_at)], ["Statut", statusOf(r.status)], ["Traité le", r.handled_at ? dayTime(r.handled_at) : "—"],
      ["Type de contenu", CONTENT_TYPES[r.content_type] || r.content_type], ["Référence du contenu", r.content_ref || "—"]] },
    { h: "Personnes" },
    { table: { cols: ["Rôle", "Nom et identifiant", "Téléphone", "Ville", "Pays"], num: false, rows: [
      ["Signalé par", person(r.reporter, r.reporter_id), ph(r.reporter), r.reporter?.city, r.reporter ? countryName(r.reporter.cc) : "—"],
      ["Compte concerné", person(r.target, r.target_user_id), ph(r.target), r.target?.city, r.target ? countryName(r.target.cc) : "—"]] } },
    { h: "Motif et arguments du signaleur" }, { text: `${r.reason}${r.details ? ` — « ${r.details} »` : ""}` },
  ];
  if (ev?.items?.length) {
    blocks.push({ h: "Discussion signalée (envoyée par le téléphone du signaleur)" },
      { table: { cols: ["Date", "Auteur", "Message"], rows: ev.items.map((m) => [dayTime(m.created_at), m.sender_id === r.target_user_id ? "Compte concerné" : m.sender_id === r.reporter_id ? "Signaleur" : shortId(m.sender_id),
        `${m.reported ? "⚑ MESSAGE SIGNALÉ — " : ""}${m.type && m.type !== "text" ? `[${m.type}${m.name ? ` · ${m.name}` : ""}] ` : ""}${m.body || ""}`]) } });
  } else blocks.push({ h: "Contenu signalé" }, { text: snapshotText(r) });
  blocks.push({ h: "Décisions de l'équipe" },
    { table: { cols: ["Date", "Décision"], rows: histRows.map((h) => [h.when, h.action]) } },
    { note: "Les conversations privées sont chiffrées de bout en bout : seul ce qui a été joint au signalement est visible par Epsilon." },
    { sign: ["Certifié conforme — pour Epsilon (nom, fonction, signature)", "Reçu par (autorité ou service)"] });
  return printReport({ title: `Fiche de signalement SIG-${r.id}`, subtitle: `${CONTENT_TYPES[r.content_type] || r.content_type} · ${r.reason}`, ref: `SIG-${r.id}`, blocks });
}

export default function Reports({ nav = {} }) {
  const { can, deny, act } = useAdmin();
  const [filter, setFilter] = useState("en_attente");
  const [month, setMonth] = useState("");
  const [type, setType] = useState("");
  const [place, setPlace] = useState({ cont: "", cc: "", city: "" });
  const [typed, setTyped] = useState(nav.q || "");
  const [qry, setQry] = useState(nav.q || "");
  const [page, setPage] = useState(1);
  const [selId, setSelId] = useState(null);
  const [panel, setPanel] = useState(null);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const summary = useLoad(() => rpc("eg_reports_summary", { p_month: month || null, p_status: filter }), [month, filter]);
  const places = summary.data?.places || [];
  const ccArg = place.cc || (place.cont ? [...new Set(places.filter((p) => continentOf(p.cc) === place.cont).map((p) => p.cc))].join(",") || "-" : "");
  const args = { p_month: month || null, p_cc: ccArg || null, p_city: place.city || null, p_status: filter, p_type: type || null, p_q: qry || null };
  const { data, error } = useLoad(() => rpc("eg_reports_find", { ...args, p_page: page, p_size: SIZE }), [JSON.stringify(args), page]);
  const list = data?.rows || [];
  const missing = sqlMissing84(error) || sqlMissing84(summary.error);

  // Le dossier ouvert est chargé seul (même s'il n'est pas sur la feuille affichée)
  const one = useLoad(async () => {
    if (!selId) return null;
    const r = (await q(supabase.from("reports").select("*").eq("id", selId).limit(1)))[0];
    if (!r) return null;
    const ids = [r.reporter_id, r.target_user_id].filter(Boolean);
    const ps = ids.length ? await q(supabase.from("profiles").select("id,first_name,last_name,phone,city,country_code").in("id", ids)) : [];
    const P = Object.fromEntries(ps.map((p) => [p.id, { ...p, cc: ccOfPhone(p.phone, p.country_code) }]));
    return { ...r, reporter: P[r.reporter_id] || null, target: P[r.target_user_id] || null };
  }, [selId]);
  const sel = one.data && String(one.data.id) === String(selId) ? one.data : null;

  // Registre (toute la sélection actuelle, en A4) : chargé par paquets de 500, 10 000 lignes au plus
  const printRegister = (onlyPage) => act(async () => {
    let rows = list, total = data?.total || 0;
    if (!onlyPage) {
      rows = [];
      for (let p = 1; p <= 20; p++) {
        const r = await rpc("eg_reports_find", { ...args, p_page: p, p_size: 500 });
        rows.push(...r.rows); total = r.total;
        if (rows.length >= r.total || !r.rows.length) break;
      }
    }
    const where = place.city || (place.cc ? countryName(place.cc) : place.cont || "toutes les régions");
    await printReport({
      title: "Registre des signalements", landscape: true,
      subtitle: `${month ? monthLabel(month) : "Tous les mois"} · ${where} · ${filter === "tous" ? "tous les statuts" : statusOf(filter)}${type ? ` · ${CONTENT_TYPES[type]}` : ""}${qry ? ` · recherche « ${qry} »` : ""} — ${onlyPage ? `feuille ${page}, ` : ""}${rows.length} sur ${total}`,
      blocks: [{ table: { cols: ["N° SIG", "Date", "Type", "Motif", "Signalé par", "Compte concerné", "Ville", "Pays", "Statut"],
        rows: rows.map((r) => [`SIG-${r.id}`, dayTime(r.created_at), CONTENT_TYPES[r.content_type] || r.content_type, r.reason, r.reporter_name, r.target_name, r.target_city, countryName(r.target_cc), statusOf(r.status)]) } }],
    });
  });
  const printMonths = () => printReport({
    title: "Signalements par mois", subtitle: `${summary.data.total} signalement(s) depuis le lancement · ${summary.data.pending} en attente`,
    blocks: [{ table: { cols: ["Mois", "Total", "En attente", "Traités"], align: ["", "r", "r", "r"], num: false,
      rows: summary.data.months.map((m) => [monthLabel(m.mois), m.total, m.en_attente, m.traites]) } },
      { h: `Par pays et par ville${month ? ` — ${monthLabel(month)}` : ""}` },
      { table: { cols: ["Continent", "Pays", "Ville", "Total", "En attente"], align: ["", "", "", "r", "r"],
        rows: places.map((p) => [continentOf(p.cc), countryName(p.cc), p.ville, p.total, p.en_attente]) } }],
  });

  const hist = useLoad(async () => sel ? q(supabase.from("sanctions").select("kind,rule,duration,created_at,cancelled_at").eq("report_id", sel.id).order("created_at")) : [], [selId]);

  const open = (mode) => can(MODE_PERM[mode]) ? setPanel(mode) : deny(MODE_PERM[mode]);
  const confirm = async ({ rule, text, duration }) => {
    const ok = await act(() => rpc("apply_sanction", { p_kind: MODE_KIND[panel], p_rule: rule, p_message: text || null, p_report: sel.id, p_duration: duration }),
      panel === "suspend" ? "🚫 Compte suspendu et message officiel envoyé." : panel === "remove" ? "🗑️ Contenu retiré." : "⚠️ Avertissement envoyé.");
    if (ok) setPanel(null);
  };
  const noViolation = () => can("mod.view") && act(() => rpc("close_report_no_violation", { p_report: sel.id }), "✅ Dossier clos : aucune violation constatée.");

  const who = (p, id) => p ? fullName(p) : shortId(id);
  let detail;
  if (selId && !sel) detail = <Loading error={one.error} />;
  else if (!sel) detail = <Empty icon="🚩" text="Sélectionnez un signalement pour voir le dossier" />;
  else {
    const type = CONTENT_TYPES[sel.content_type] || sel.content_type;
    const rows = (hist.data || []).map((h) => ({ action: `${KIND_LABEL[h.kind]}${h.duration ? " " + h.duration : ""} — ${h.rule}${h.cancelled_at ? " (levée)" : ""}`, who: "Équipe", when: dateTime(h.created_at) }));
    if (sel.status === "traite" && rows.length === 0) rows.push({ action: "Aucune violation constatée", who: "Équipe", when: dateTime(sel.handled_at) });
    detail = (<>
      <div className="report-detail-header">
        <div><span className="report-id">SIG-{sel.id}</span><h2>{type} signalé pour {String(sel.reason).toLowerCase()}</h2></div>
        <span style={{ display: "flex", gap: 6 }}>
          <button className="action-button neutral" onClick={() => printFiche(sel, rows, can("users.detail"))}>🖨️ Fiche A4</button>
          <button className="icon-button" onClick={() => { setSelId(null); setPanel(null); }}>✕</button>
        </span>
      </div>
      <div className="report-info-grid">
        <div><span className="label">Signalé par</span><strong>{who(sel.reporter, sel.reporter_id)}</strong></div>
        <div><span className="label">Compte concerné</span><strong>{who(sel.target, sel.target_user_id)}</strong></div>
        <div><span className="label">Date</span><strong>{dateTime(sel.created_at)}</strong></div>
        <div><span className="label">Lieu du compte concerné</span><strong>{sel.target ? `${sel.target.city || "Ville inconnue"} · ${countryName(sel.target.cc)}` : "—"}</strong></div>
        <div><span className="label">Statut</span><strong>{sel.status === "en_attente" ? "En attente" : "Traité"}</strong></div>
      </div>
      {evidenceOf(sel)?.items?.length
        ? <ReportedChat report={{ ...sel, evidence: evidenceOf(sel) }} />
        : <div className="report-content-box"><span className="label">Contenu signalé (remonté automatiquement)</span><p>{snapshotText(sel)}</p></div>}
      <div className="report-content-box"><span className="label">Motif choisi et arguments du signaleur</span><p><strong>{sel.reason}</strong>{sel.details ? ` — « ${sel.details} »` : ""}</p></div>
      <div className="report-actions">
        <button className="action-button danger" onClick={() => open("remove")}>🗑️ Retirer le contenu</button>
        <button className="action-button warning" onClick={() => open("warn")}>⚠️ Avertir</button>
        <button className="action-button danger" onClick={() => open("suspend")}>🚫 Suspendre</button>
        {sel.status === "en_attente" && <button className="action-button neutral" onClick={noViolation}>✅ Aucune violation</button>}
      </div>
      <p className="field-hint" style={{ margin: "8px 0 0" }}>Les actions sont indépendantes : vous pouvez retirer le contenu, puis avertir ou suspendre, selon la gravité.</p>
      {panel && <SanctionPanel key={panel} mode={panel} onConfirm={confirm} onCancel={() => setPanel(null)} />}
      {rows.length > 0 && <div className="report-history" style={{ marginTop: 16 }}><History label="Historique du dossier" rows={rows} /></div>}
    </>);
  }

  return (<>
    <ScreenTitle eyebrow="MODÉRATION" title="Signalements">
      {data && <button className="action-button neutral" onClick={() => printRegister(true)}>🖨️ Cette feuille</button>}
      {data && <button className="action-button neutral" onClick={() => printRegister(false)}>🖨️ Registre complet</button>}
      {summary.data && <button className="action-button neutral" onClick={printMonths}>🖨️ Par mois et par ville</button>}
    </ScreenTitle>
    {missing && <p className="field-hint">⚠️ Exécutez d'abord le fichier SQL 84 (classeur des signalements, parties 1, 2 et 3) dans Supabase.</p>}

    {/* Recherche : n° SIG, nom, téléphone, motif */}
    <form className="cl-search" onSubmit={(e) => { e.preventDefault(); setQry(typed.trim()); setPage(1); }}>
      <span>🔍</span>
      <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="N° SIG-…, nom, téléphone ou motif" autoComplete="off" />
      {qry && <button type="button" className="cl-clear" onClick={() => { setTyped(""); setQry(""); setPage(1); }}>✕</button>}
      <button type="submit" className="action-button primary">Rechercher</button>
    </form>

    <div className="cl-filters">
      <select value={month} onChange={(e) => reset(setMonth)(e.target.value)}>
        <option value="">📅 Tous les mois{summary.data ? ` (${summary.data.total})` : ""}</option>
        {(summary.data?.months || []).map((m) => <option key={m.mois} value={m.mois}>{monthLabel(m.mois)} — {m.total}{m.en_attente ? ` (${m.en_attente} en attente)` : ""}</option>)}
      </select>
      <select value={type} onChange={(e) => reset(setType)(e.target.value)}>
        <option value="">Tous les contenus</option>
        {Object.entries(CONTENT_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <Pills options={[["en_attente", "En attente"], ["traite", "Traité"], ["tous", "Tous"]]} value={filter} onChange={reset(setFilter)} />
    </div>
    {summary.data && <PlaceNav places={places} value={place} onChange={reset(setPlace)} />}

    <div className="reports-layout">
      <div className="reports-list">
        {data && <Pager page={page} total={data.total} size={SIZE} onPage={setPage} label="signalement(s)" />}
        {!data ? (!missing && <Loading error={error} />) : list.length === 0 && <p className="reports-empty">Aucun signalement ne correspond.</p>}
        {list.map((r) => (
          <button key={r.id} className={"report-row" + (String(r.id) === String(selId) ? " active" : "")} onClick={() => { setSelId(r.id); setPanel(null); }}>
            <div className="report-row-top"><span className="report-id">SIG-{r.id}</span><span className={"report-status " + (r.status === "en_attente" ? "pending" : "done")}>{statusOf(r.status)}</span></div>
            <span className="report-meta">{CONTENT_TYPES[r.content_type] || r.content_type} · {r.reason}</span>
            <span className="report-meta">👤 {r.target_name || "—"} · 📍 {r.target_city || "Ville inconnue"}, {countryName(r.target_cc)}</span>
            <span className="report-date">{dateTime(r.created_at)}</span>
          </button>
        ))}
        {data && data.total > SIZE && <Pager page={page} total={data.total} size={SIZE} onPage={setPage} label="signalement(s)" />}
      </div>
      <div className="report-detail">{detail}</div>
    </div>
  </>);
}
