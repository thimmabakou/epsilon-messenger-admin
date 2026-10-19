// Epsilon IA : l'assistante automatique du Service client (discussion « Service client Epsilon » de l'application).
// Elle répond à partir des fiches pratiques du Service client ; quand ce n'est pas dans les fiches, elle passe
// la main à un conseiller. Ici : l'allumer ou l'éteindre, et suivre ses réponses pour compléter les fiches.
// Base : fichiers SQL 78-epsilon-ia-partie1 et partie2 (dépôt de l'application).
import { useState } from "react";
import { rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateTime, fmt } from "../lib/format";
import { Note, Pills, ScreenTitle } from "../components/common";
import { HELP_SHEETS } from "../lib/helpSheets";

const SQL_LINK = "https://epsilon-messenger-app.pages.dev/sql/?f=78-epsilon-ia-partie1";
const LIMITS = [20, 40, 80, 150];
const sheetName = (id) => { const s = HELP_SHEETS.find((x) => x.id === id); return s ? `${s.icon} ${s.title}` : id; };

function Metric({ icon, label, value, sub }) {
  return (
    <div className="metric-card"><div className="metric-icon">{icon}</div>
      <div className="metric-body"><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong>{sub && <span className="metric-trend">{sub}</span>}</div></div>
  );
}

export default function EpsilonIA() {
  const { can, deny, act } = useAdmin();
  const { data, error } = useLoad(() => rpc("eg_ia_stats"));
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);

  if (error) {
    const missing = /eg_ia_stats|schema cache|does not exist|introuvable/i.test(error);
    return (<>
      <ScreenTitle eyebrow="SERVICE CLIENT" title="🤖 Epsilon IA" />
      {missing
        ? <Note icon="🛠️">Epsilon IA n'est pas encore installée dans la base. Exécutez dans Supabase les fichiers <a href={SQL_LINK} target="_blank" rel="noreferrer">78-epsilon-ia-partie1</a> puis <a href={SQL_LINK.replace("partie1", "partie2")} target="_blank" rel="noreferrer">78-epsilon-ia-partie2</a>.</Note>
        : <Loading error={error} />}
    </>);
  }
  if (!data) return <Loading />;

  const cfg = data.config || { enabled: false, daily_limit: 40 };
  const solved = (p) => Number(p?.solved || 0);
  const pct = (p) => (p?.total ? Math.round((solved(p) / p.total) * 100) + " % réglées" : "—");
  const rows = (data.recent || []).filter((r) => filter === "all" || (filter === "handoff" ? r.handoff : filter === "human" ? r.human_asked : !r.handoff && !r.human_asked));

  const toggle = () => {
    if (!can("support.reply")) return deny("support.reply");
    return act(() => rpc("eg_ia_admin_set", { p_enabled: !cfg.enabled, p_limit: null }), cfg.enabled ? "Epsilon IA est éteinte." : "Epsilon IA est allumée.");
  };
  const setLimit = (n) => {
    if (!can("support.reply")) return deny("support.reply");
    return act(() => rpc("eg_ia_admin_set", { p_enabled: cfg.enabled, p_limit: Number(n) }), "Limite enregistrée.");
  };

  return (<>
    <ScreenTitle eyebrow="SERVICE CLIENT" title="🤖 Epsilon IA">
      <button className={"primary-button" + (cfg.enabled ? " danger" : "")} onClick={toggle}>{cfg.enabled ? "Éteindre Epsilon IA" : "Allumer Epsilon IA"}</button>
    </ScreenTitle>

    <Note icon={cfg.enabled ? "🟢" : "⚪"} style={{ marginBottom: 14 }}>
      {cfg.enabled
        ? "Epsilon IA répond toute seule aux messages écrits envoyés au Service client, dans la langue de la personne, à partir des fiches pratiques. Quand la réponse n'est pas dans les fiches (ou qu'il faut une décision humaine), elle transmet : la conversation reste « non lue » dans votre boîte de réception."
        : "Epsilon IA est éteinte : tous les messages du Service client attendent la réponse d'un conseiller, comme avant."}
      {" "}Elle se tait dans une conversation pendant 12 h après la réponse d'un conseiller, et pendant 24 h quand la personne touche « Parler à un conseiller ».
    </Note>

    <section className="cards-grid">
      <Metric icon="💬" label="Questions aujourd'hui" value={fmt(data.today?.total)} sub={pct(data.today)} />
      <Metric icon="👤" label="Transmises aujourd'hui" value={fmt((data.today?.total || 0) - solved(data.today))} sub={`${fmt(data.today?.handoff)} par l'IA · ${fmt(data.today?.human)} à la demande`} />
      <Metric icon="📅" label="Questions sur 7 jours" value={fmt(data.week?.total)} sub={pct(data.week)} />
      <Metric icon="🛡️" label="Limite par personne" value={`${cfg.daily_limit} / jour`} sub="contre les abus" />
    </section>

    <div className="stats-filters">
      <span className="label">Limite de réponses par personne et par jour :</span>
      <Pills options={LIMITS.map((n) => [n, String(n)])} value={cfg.daily_limit} onChange={setLimit} />
    </div>

    <div className="section-heading"><span>📝</span><h2>Dernières questions</h2></div>
    <Note icon="💡" style={{ marginBottom: 10 }}>
      Une question « transmise » ou « conseiller demandé » montre souvent ce qui manque dans les fiches pratiques. Complétez la fiche concernée : Epsilon IA saura répondre la prochaine fois.
    </Note>
    <Pills style={{ marginBottom: 12 }} value={filter} onChange={setFilter}
      options={[["all", "Toutes"], ["ok", "✅ Réglées par l'IA"], ["handoff", "↪️ Transmises par l'IA"], ["human", "👤 Conseiller demandé"]]} />

    {rows.length === 0 && <p className="reports-empty">Aucune question dans cette catégorie pour le moment.</p>}
    <div className="ia-list">
      {rows.map((r) => (
        <button key={r.id} className={"ia-row" + (open === r.id ? " open" : "")} onClick={() => setOpen(open === r.id ? null : r.id)}>
          <div className="ia-top">
            <strong>{r.name || "Utilisateur"}</strong>
            <span className={"ia-tag " + (r.human_asked ? "human" : r.handoff ? "handoff" : "ok")}>{r.human_asked ? "👤 Conseiller demandé" : r.handoff ? "↪️ Transmise" : "✅ Réglée"}</span>
            <span className="ia-when">{dateTime(r.created_at)}{r.lang && r.lang !== "fr" ? ` · ${r.lang.toUpperCase()}` : ""}</span>
          </div>
          <div className="ia-q">« {r.question} »</div>
          {open === r.id && (<>
            <div className="ia-a"><b>🤖 Réponse :</b> {r.answer}</div>
            <div className="ia-sheets">Fiches utilisées : {(r.sheets || []).length ? r.sheets.map(sheetName).join(" · ") : "aucune"}</div>
          </>)}
        </button>
      ))}
    </div>
  </>);
}
