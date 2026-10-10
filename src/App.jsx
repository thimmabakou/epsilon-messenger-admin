// Aiguillage du site : pages publiques (#/, #/aide, #/doc/…) et espace administration (#/admin)
import { useEffect, useState } from "react";
import logo from "./assets/logo.png";
import PublicPage from "./pages/PublicPage";
import DocPage from "./pages/DocPage";
import HelpPage from "./pages/HelpPage";
import AdminEntry from "./pages/AdminEntry";
import { go } from "./lib/nav";
import { initialHash, authLink } from "./lib/supabase";

function readRoute(first) {
  const h = (first ? initialHash : window.location.hash).replace(/^#/, "");
  if (/access_token=|type=(recovery|invite)|error_description=/.test(h) || authLink.recovery) return { page: "admin" };
  const parts = h.split("/").filter(Boolean);
  if (parts[0] === "admin") return { page: "admin" };
  if (parts[0] === "aide") return { page: "help" };
  if (parts[0] === "doc" && parts[1]) return { page: "doc", doc: decodeURIComponent(parts[1]) };
  return { page: "public" };
}


const TOP_PAGES = [
  { key: "public", path: "/", label: "Site public", icon: "🌐" },
  { key: "help", path: "/aide", label: "Centre d'aide", icon: "🛟" },
  { key: "admin", path: "/admin", label: "Administration", icon: "🛡️" },
];

export function TopSwitcher({ page, floating }) {
  return (
    <nav className={"top-switcher" + (floating ? " floating" : "")}>
      {TOP_PAGES.map((p) => (
        <button key={p.key} className={"top-switcher-item" + (page === p.key ? " active" : "")} onClick={() => go(p.path)}>
          <span>{p.icon}</span><span>{p.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <img src={logo} alt="Epsilon Messenger" className="site-logo-mark" />
      <span className="site-logo-text">Epsilon Messenger</span>
    </header>
  );
}

export default function App() {
  const [route, setRoute] = useState(() => readRoute(true));
  useEffect(() => {
    const on = () => { setRoute(readRoute()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  if (route.page === "admin") return <AdminEntry />;
  return (
    <div className="site-root">
      <SiteHeader />
      <TopSwitcher page={route.page === "doc" ? "public" : route.page} />
      <div className="site-content">
        {route.page === "help" ? <HelpPage /> : route.page === "doc" ? <DocPage id={route.doc} /> : <PublicPage />}
      </div>
    </div>
  );
}
