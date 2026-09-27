// Vue d'ensemble : chiffres clés, alertes à traiter, activités récentes
import { supabase } from "../lib/supabase";
import { useAdmin, useLoad } from "../lib/admin";
import { ago, fmt } from "../lib/format";
import { ScreenTitle } from "../components/common";

async function count(table, filter) {
  let qy = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) qy = filter(qy);
  const { count: n, error } = await qy;
  return error ? null : n;
}

export default function Overview({ goto, flags }) {
  const { me, can, canSee } = useAdmin();
  const { data } = useLoad(async () => {
    const [stats, pendingReports, convs, shops, products, log, failedLogins] = await Promise.all([
      can("stats.view") ? supabase.rpc("stats_summary", { p_days: 7 }).then((r) => r.data) : null,
      can("mod.view") ? count("reports", (x) => x.eq("status", "en_attente")) : null,
      can("support.inbox") ? supabase.from("support_conversations").select("unread_for_team").then((r) => r.data || []) : [],
      count("shops", (x) => x.neq("status", "suspendu")),
      can("market.manage") ? count("products", (x) => x.eq("status", "en_ligne")) : null,
      supabase.from("security_log").select("actor_name,action,created_at").order("created_at", { ascending: false }).limit(6).then((r) => r.data || []),
      me.isPdg ? count("admin_logins", (x) => x.eq("success", false).gte("created_at", new Date(Date.now() - 86400000).toISOString())) : 0,
    ]);
    return { stats, pendingReports, unread: convs.reduce((n, c) => n + c.unread_for_team, 0), shops, products, log, failedLogins };
  });

  const d = data || {};
  const cards = [
    { label: "Utilisateurs", value: d.stats ? fmt(d.stats.total_users) : "—", trend: d.stats ? `+${fmt(d.stats.new_users)} cette semaine` : "statistiques non autorisées", icon: "👥" },
    { label: "Actifs cette semaine", value: d.stats ? fmt(d.stats.active_users) : "—", trend: "connectés dans les 7 derniers jours", icon: "📊" },
    { label: "Appels au service client", value: d.stats ? fmt(d.stats.support_calls) : "—", trend: "ces 7 derniers jours", icon: "📞" },
    { label: "Boutiques actives", value: d.shops != null ? fmt(d.shops) : "—", trend: d.products != null ? `${fmt(d.products)} produits en ligne` : "marketplace", icon: "🛍️" },
  ];
  const alerts = [
    { icon: "⚠️", label: "Signalements non traités", count: d.pendingReports || 0, goTo: "reports" },
    { icon: "⏳", label: "Messages client non lus", count: d.unread || 0, goTo: "support" },
    { icon: "🛡️", label: "Connexions échouées (24 h)", count: d.failedLogins || 0, goTo: "security" },
    { icon: "✉️", label: "Demandes de l'équipe au PDG", count: flags.reqUnread || 0, goTo: "requests" },
  ].filter((a) => canSee(a.goTo) && (a.goTo !== "requests" || me.isPdg));

  return (<>
    <ScreenTitle eyebrow="TABLEAU DE BORD" title="Vue d'ensemble"><div className="header-bell">🔔</div></ScreenTitle>
    <section className="cards-grid">
      {cards.map((c) => (
        <div key={c.label} className="metric-card"><div className="metric-icon">{c.icon}</div>
          <div className="metric-body"><span className="metric-label">{c.label}</span><strong className="metric-value">{c.value}</strong><span className="metric-trend">{c.trend}</span></div></div>
      ))}
    </section>
    <section className="alerts-block">
      <div className="section-heading"><span>⚠️</span><h2>Alertes</h2></div>
      <div className="alerts-list">
        {alerts.map((a) => (
          <button key={a.label} className="alert-row" disabled={!a.count} onClick={() => goto(a.goTo)}>
            <span>{a.icon}</span><span className="alert-label">{a.label}</span><span className={"alert-count" + (a.count ? "" : " zero")}>{a.count}</span><span>›</span>
          </button>
        ))}
      </div>
    </section>
    <section className="activity-block">
      <div className="section-heading"><span>🕒</span><h2>Activités récentes</h2></div>
      <table className="activity-table"><tbody>
        {(d.log || []).length === 0 && <tr><td className="reports-empty">Aucune activité pour le moment.</td></tr>}
        {(d.log || []).map((r, i) => <tr key={i}><td className="activity-who">{r.actor_name}</td><td>{r.action}</td><td className="activity-when">{ago(r.created_at)}</td></tr>)}
      </tbody></table>
    </section>
  </>);
}
