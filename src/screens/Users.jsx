// Utilisateurs : recherche, fiche détaillée, avertir / suspendre / réactiver
import { useMemo, useState } from "react";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { ageRange, ago, dateOnly, dateTime, fullName, maskPhone, shortId, statusLabel } from "../lib/format";
import { Avatar, Empty, History, Note, Pills, ScreenTitle } from "../components/common";
import SanctionPanel from "../components/SanctionPanel";

const KIND_LABEL = { avertissement: "Avertissement envoyé", suspension: "Compte suspendu", retrait_contenu: "Contenu retiré", retrait_produit: "Produit retiré" };

export default function Users({ nav, goto }) {
  const { can, deny, act } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tous");
  const [city, setCity] = useState("Toutes");
  const [selId, setSelId] = useState(nav.userId || null);
  const [panel, setPanel] = useState(null);

  const { data, error } = useLoad(() => q(supabase.from("profiles")
    .select("id,first_name,last_name,phone,avatar_url,city,birth_year,status,suspended_until,created_at,last_seen_at")
    .order("created_at", { ascending: false }).limit(1000)));
  const users = data || [];
  const cities = useMemo(() => ["Toutes", ...[...new Set(users.map((u) => u.city).filter(Boolean))].sort()], [users]);
  const list = users.filter((u) => {
    const s = query.trim().toLowerCase();
    return (status === "Tous" || statusLabel(u.status) === status) && (city === "Toutes" || u.city === city) &&
      (!s || fullName(u).toLowerCase().includes(s) || shortId(u.id).toLowerCase().includes(s) || (u.phone || "").includes(s) || (u.city || "").toLowerCase().includes(s));
  });
  const sel = users.find((u) => u.id === selId);
  const cnt = (st) => users.filter((u) => u.status === st).length;

  const detail = useLoad(async () => {
    if (!selId) return null;
    const [sanctions, reports] = await Promise.all([
      (can("users.detail") || can("mod.view")) ? q(supabase.from("sanctions").select("*").eq("user_id", selId).is("shop_id", null).order("created_at", { ascending: false })) : [],
      can("mod.view") ? supabase.from("reports").select("id", { count: "exact", head: true }).eq("target_user_id", selId).then((r) => r.count) : null,
    ]);
    return { sanctions, reports };
  }, [selId]);

  const open = (mode) => {
    const perm = mode === "warn" ? "mod.warn" : "mod.suspend";
    can(perm) ? setPanel(mode) : deny(perm);
  };
  const confirm = async ({ rule, text, duration }) => {
    const ok = await act(() => rpc("apply_sanction", { p_kind: panel === "warn" ? "avertissement" : "suspension", p_rule: rule, p_message: text || null, p_user: sel.id, p_duration: duration }),
      panel === "warn" ? "⚠️ Avertissement envoyé par le Service client." : "🚫 Compte suspendu et message officiel envoyé.");
    if (ok) setPanel(null);
  };
  const reactivate = async () => {
    if (!can("mod.cancel")) return deny("mod.cancel");
    const active = (detail.data?.sanctions || []).filter((s) => !s.cancelled_at && (s.kind === "suspension" || s.kind === "avertissement"));
    if (!active.length) return;
    await act(async () => { for (const s of active) await rpc("lift_sanction", { p_sanction: s.id, p_reason: "Compte réactivé depuis la fiche utilisateur" }); },
      "✅ Compte réactivé. La personne a été prévenue par le Service client.");
  };

  let detailView;
  if (!sel) detailView = <Empty icon="👥" text="Sélectionnez un utilisateur pour voir sa fiche" />;
  else {
    const d = detail.data || {};
    const st = statusLabel(sel.status);
    const hist = (d.sanctions || []).map((s) => ({ action: `${KIND_LABEL[s.kind]}${s.duration ? " " + s.duration : ""} — ${s.rule}${s.cancelled_at ? " (levée)" : ""}`, who: "Équipe", when: dateTime(s.created_at) }));
    detailView = (<>
      <div className="report-detail-header" style={{ marginBottom: 0 }}>
        <div className="user-head">
          <a href={sel.avatar_url || undefined} target="_blank" rel="noreferrer" title={sel.avatar_url ? "Voir la photo en grand" : ""}><Avatar url={sel.avatar_url} name={fullName(sel)} style={{ width: 96, height: 96, fontSize: 32 }} /></a>
          <div><h2>{fullName(sel)}</h2><div className="sub">{shortId(sel.id)} · <span className={"u-status " + st}>{st}</span></div></div>
        </div>
        <button className="icon-button" onClick={() => setSelId(null)}>✕</button>
      </div>
      <div className="report-info-grid">
        <div><span className="label">Téléphone</span><strong>{can("users.detail") ? (sel.phone || "—") : maskPhone(sel.phone)}</strong></div>
        <div><span className="label">Ville</span><strong>{sel.city || "—"}</strong></div>
        <div><span className="label">Tranche d'âge</span><strong>{ageRange(sel.birth_year)}</strong></div>
        <div><span className="label">Inscrit le</span><strong>{dateOnly(sel.created_at)}</strong></div>
        <div><span className="label">Dernière connexion</span><strong>{ago(sel.last_seen_at)}</strong></div>
        <div><span className="label">{sel.status === "suspendu" ? "Suspendu jusqu'au" : "Signalements reçus"}</span><strong>{sel.status === "suspendu" ? (sel.suspended_until ? dateTime(sel.suspended_until) : "Définitivement") : (d.reports ?? "—")}</strong></div>
      </div>
      <Note icon="🔒">Les conversations privées de cet utilisateur ne sont pas accessibles depuis l'administration. Seules les informations de compte et les contenus signalés sont visibles.</Note>
      {sel.status === "suspendu"
        ? <div className="report-actions"><button className="action-button ok" onClick={reactivate}>✅ Réactiver le compte</button></div>
        : (<>
          <div className="report-actions">
            <button className="action-button warning" onClick={() => open("warn")}>⚠️ Avertir</button>
            <button className="action-button danger" onClick={() => open("suspend")}>🚫 Suspendre</button>
            {sel.status === "averti" && <button className="action-button ok" onClick={reactivate}>↩️ Lever l'avertissement</button>}
            {d.reports > 0 && <button className="action-button neutral" onClick={() => goto("reports")}>🚩 Voir les signalements</button>}
            <button className="action-button neutral" onClick={() => goto("support", { userId: sel.id })}>💬 Conversation service client</button>
          </div>
          {panel && <SanctionPanel key={panel} mode={panel} onConfirm={confirm} onCancel={() => setPanel(null)} />}
        </>)}
      <History label="Historique des actions sur ce compte" rows={hist} />
    </>);
  }

  return (<>
    <ScreenTitle eyebrow="COMPTES" title="Utilisateurs" />
    <section className="users-summary">
      <div className="u-sum"><span>Total inscrits</span><strong>{users.length}</strong></div>
      <div className="u-sum ok"><span>Actifs</span><strong>{cnt("actif")}</strong></div>
      <div className="u-sum warn"><span>Avertis</span><strong>{cnt("averti")}</strong></div>
      <div className="u-sum bad"><span>Suspendus</span><strong>{cnt("suspendu")}</strong></div>
    </section>
    <div className="users-toolbar">
      <label className="users-search"><span>🔍</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par nom, identifiant, numéro ou ville" autoComplete="off" /></label>
      <Pills options={["Tous", "Actif", "Averti", "Suspendu"]} value={status} onChange={setStatus} />
      <select className="users-city" value={city} onChange={(e) => setCity(e.target.value)}>{cities.map((c) => <option key={c}>{c}</option>)}</select>
    </div>
    <div className="users-layout">
      <div className="reports-list">
        {!data ? <Loading error={error} /> : list.length === 0 && <p className="reports-empty">{users.length ? "Aucun utilisateur ne correspond à cette recherche." : "Aucun utilisateur inscrit pour le moment."}</p>}
        {list.map((u) => (
          <button key={u.id} className={"user-row" + (u.id === selId ? " active" : "")} onClick={() => { setSelId(u.id); setPanel(null); }}>
            <Avatar url={u.avatar_url} name={fullName(u)} />
            <div className="u-main"><strong>{fullName(u)}</strong><span>{shortId(u.id)} · {u.city || "—"}</span></div>
            <span className={"u-status " + statusLabel(u.status)}>{statusLabel(u.status)}</span>
          </button>
        ))}
      </div>
      <div className="report-detail">{detailView}</div>
    </div>
  </>);
}
