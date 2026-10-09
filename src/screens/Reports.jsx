// Signalements : liste, dossier complet et actions de modération
import { useState } from "react";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { CONTENT_TYPES } from "../lib/constants";
import { dateTime, fullName, shortId } from "../lib/format";
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

export default function Reports() {
  const { can, deny, act } = useAdmin();
  const [filter, setFilter] = useState("en_attente");
  const [selId, setSelId] = useState(null);
  const [panel, setPanel] = useState(null);

  const { data, error } = useLoad(() => q(supabase.from("reports")
    .select("*, reporter:profiles!reports_reporter_id_fkey(first_name,last_name), target:profiles!reports_target_user_id_fkey(first_name,last_name)")
    .order("created_at", { ascending: false }).limit(300)));
  const reports = data || [];
  const list = reports.filter((r) => filter === "tous" || r.status === filter);
  const sel = reports.find((r) => r.id === selId);

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
  if (!sel) detail = <Empty icon="🚩" text="Sélectionnez un signalement pour voir le dossier" />;
  else {
    const type = CONTENT_TYPES[sel.content_type] || sel.content_type;
    const rows = (hist.data || []).map((h) => ({ action: `${KIND_LABEL[h.kind]}${h.duration ? " " + h.duration : ""} — ${h.rule}${h.cancelled_at ? " (levée)" : ""}`, who: "Équipe", when: dateTime(h.created_at) }));
    if (sel.status === "traite" && rows.length === 0) rows.push({ action: "Aucune violation constatée", who: "Équipe", when: dateTime(sel.handled_at) });
    detail = (<>
      <div className="report-detail-header">
        <div><span className="report-id">SIG-{sel.id}</span><h2>{type} signalé pour {String(sel.reason).toLowerCase()}</h2></div>
        <button className="icon-button" onClick={() => { setSelId(null); setPanel(null); }}>✕</button>
      </div>
      <div className="report-info-grid">
        <div><span className="label">Signalé par</span><strong>{who(sel.reporter, sel.reporter_id)}</strong></div>
        <div><span className="label">Compte concerné</span><strong>{who(sel.target, sel.target_user_id)}</strong></div>
        <div><span className="label">Date</span><strong>{dateTime(sel.created_at)}</strong></div>
        <div><span className="label">Statut</span><strong>{sel.status === "en_attente" ? "En attente" : "Traité"}</strong></div>
      </div>
      {sel.evidence?.items?.length
        ? <ReportedChat report={sel} />
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
    <ScreenTitle eyebrow="MODÉRATION" title="Signalements" />
    <div className="report-filters"><Pills options={[["en_attente", "En attente"], ["traite", "Traité"], ["tous", "Tous"]]} value={filter} onChange={setFilter} /></div>
    <div className="reports-layout">
      <div className="reports-list">
        {!data ? <Loading error={error} /> : list.length === 0 && <p className="reports-empty">Aucun signalement dans cette catégorie.</p>}
        {list.map((r) => (
          <button key={r.id} className={"report-row" + (r.id === selId ? " active" : "")} onClick={() => { setSelId(r.id); setPanel(null); }}>
            <div className="report-row-top"><span className="report-id">SIG-{r.id}</span><span className={"report-status " + (r.status === "en_attente" ? "pending" : "done")}>{r.status === "en_attente" ? "En attente" : "Traité"}</span></div>
            <span className="report-meta">{CONTENT_TYPES[r.content_type] || r.content_type} · {r.reason}</span>
            <span className="report-date">{dateTime(r.created_at)}</span>
          </button>
        ))}
      </div>
      <div className="report-detail">{detail}</div>
    </div>
  </>);
}
