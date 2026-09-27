// Cadre de l'espace administration : en-tête, menu, bandeaux d'état et écran choisi
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { supabase } from "../lib/supabase";
import { AdminProvider, useAdmin } from "../lib/admin";
import { NAV_ITEMS } from "../lib/constants";
import { initials } from "../lib/format";
import { TopSwitcher } from "../App";
import Overview from "../screens/Overview";
import Users from "../screens/Users";
import Calls from "../screens/Calls";
import Marketplace from "../screens/Marketplace";
import Support from "../screens/Support";
import Reports from "../screens/Reports";
import Stats from "../screens/Stats";
import Documents from "../screens/Documents";
import Admins from "../screens/Admins";
import Versions from "../screens/Versions";
import Requests from "../screens/Requests";
import Security from "../screens/Security";
import Settings from "../screens/Settings";

const SCREENS = { overview: Overview, users: Users, calls: Calls, marketplace: Marketplace, support: Support, reports: Reports, stats: Stats, documents: Documents, admins: Admins, versions: Versions, requests: Requests, security: Security, settings: Settings };

export default function AdminApp({ me, onLogout, reloadMe }) {
  const [section, setSection] = useState("overview");
  const [nav, setNav] = useState({}); // paramètres passés à l'écran (ex. utilisateur à ouvrir)
  const goto = (s, params = {}) => { setSection(s); setNav(params); window.scrollTo(0, 0); };
  return (
    <AdminProvider me={me} onGoto={goto} onRequestPerm={(perm) => goto("requests", { newPerm: perm })}>
      <Shell me={me} section={section} nav={nav} goto={goto} onLogout={onLogout} reloadMe={reloadMe} />
    </AdminProvider>
  );
}

function Shell({ me, section, nav, goto, onLogout, reloadMe }) {
  const { canSee, version } = useAdmin();
  const [flags, setFlags] = useState({ frozen: false, maintenance: false, reqUnread: 0 });

  useEffect(() => {
    (async () => {
      const { data: st } = await supabase.from("platform_settings").select("key,value").in("key", ["frozen", "maintenance"]);
      const get = (k) => (st || []).find((x) => x.key === k)?.value === true;
      const { data: reqs } = await supabase.from("perm_requests").select("admin_id,unread_pdg,unread_admin");
      const reqUnread = (reqs || []).reduce((n, r) => n + (me.isPdg ? r.unread_pdg : (r.admin_id === me.id ? r.unread_admin : 0)), 0);
      setFlags({ frozen: get("frozen"), maintenance: get("maintenance"), reqUnread });
    })();
    reloadMe(); // les permissions ont pu changer (accordées par le PDG)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, section]);

  const current = canSee(section) ? section : "overview";
  const Screen = SCREENS[current];

  return (
    <div className="site-root">
      <TopSwitcher page="admin" floating />
      <div className="admin-app">
        <header className="admin-header">
          <div className="admin-logo">
            <img src={logo} alt="Epsilon Messenger" className="admin-logo-mark" />
            <span className="admin-logo-text">Epsilon Messenger</span>
            <span className="admin-logo-sub">Administration</span>
          </div>
          <div className="admin-user">
            <div className="who"><strong>{me.name}</strong><span>{me.isPdg ? "PDG · toutes les permissions" : `Administrateur · ${me.perms.length} permission(s)`}</span></div>
            <div className="u-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{me.isPdg ? "👑" : initials(me.name)}</div>
            <button className="logout-btn" onClick={onLogout}>Se déconnecter</button>
          </div>
        </header>
        <div className="admin-body">
          <aside className="admin-sidebar">
            {NAV_ITEMS.filter((it) => canSee(it.key)).map((it) => {
              const badge = it.key === "requests" ? flags.reqUnread : 0;
              const label = it.key === "requests" ? (me.isPdg ? "Demandes de l'équipe" : "Écrire au PDG") : it.label;
              return (
                <button key={it.key} className={"sidebar-item" + (current === it.key ? " active" : "")} onClick={() => goto(it.key)}>
                  <span>{it.icon}</span><span className="label">{label}</span>{badge ? <span className="nav-badge">{badge}</span> : null}
                </button>
              );
            })}
          </aside>
          <main className="admin-main">
            {flags.frozen && current !== "security" && <div className="maintenance-banner" style={{ background: "#2a2a2a", color: "#fff", borderColor: "#444" }}>🧊 <strong>Plateforme gelée.</strong> Les actions sensibles sont bloquées jusqu'au dégel par le PDG.</div>}
            {flags.maintenance && current !== "settings" && <div className="maintenance-banner">🛠️ Mode maintenance actif pour les utilisateurs.</div>}
            <Screen key={current} nav={nav} goto={goto} flags={flags} />
          </main>
        </div>
      </div>
    </div>
  );
}
