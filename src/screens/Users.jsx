// Utilisateurs : recherche, fiche détaillée, avertir / suspendre / réactiver
import { useState } from "react";
import { PlaceNav, Pager, continentOf, countryName, sqlMissing84 } from "../components/Classeur";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { ageRange, ago, countryLabel, dateOnly, dateTime, fullName, maskPhone, shortId, statusLabel } from "../lib/format";
import { Avatar, Empty, History, Note, Pills, ScreenTitle } from "../components/common";
import SanctionPanel from "../components/SanctionPanel";
import { printReport, day, dayTime } from "../lib/printDoc";

const KIND_LABEL = { avertissement: "Avertissement envoyé", suspension: "Compte suspendu", retrait_contenu: "Contenu retiré", retrait_produit: "Produit retiré" };

export default function Users({ nav, goto }) {
  const { can, deny, act } = useAdmin();
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tous");
  const [place, setPlace] = useState({ cont: "", cc: "", city: "" });
  const [page, setPage] = useState(1);
  const [selId, setSelId] = useState(nav.userId || null);
  const [panel, setPanel] = useState(null);
  const SIZE = 20;
  const ST = { Tous: "", Actif: "actif", Averti: "averti", Suspendu: "suspendu" };

  // Classeur : continent › pays › ville (nombres calculés par la base), puis la liste en feuilles de 20
  const placesQ = useLoad(() => rpc("eg_users_places"));
  const places = placesQ.data || [];
  const ccArg = place.cc || (place.cont ? [...new Set(places.filter((p) => continentOf(p.cc) === place.cont).map((p) => p.cc))].join(",") || "-" : "");
  const args = { p_cc: ccArg || null, p_city: place.city || null, p_status: ST[status] || null, p_q: query || null };
  const { data, error } = useLoad(() => rpc("eg_users_find", { ...args, p_page: page, p_size: SIZE }), [JSON.stringify(args), page]);
  const list = data?.rows || [];
  const missing = sqlMissing84(error) || sqlMissing84(placesQ.error);
  const sumOf = (k) => places.reduce((n, p) => n + Number(p[k] || 0), 0);
  const one = useLoad(async () => (selId ? (await q(supabase.from("profiles")
    .select("id,first_name,last_name,phone,country_code,avatar_url,city,birth_year,status,suspended_until,created_at,last_seen_at").eq("id", selId).limit(1)))[0] || null : null), [selId]);
  const sel = one.data && one.data.id === selId ? one.data : null;
  const cnt = (st) => sumOf(st === "actif" ? "actifs" : st === "averti" ? "avertis" : "suspendus");
  const printUsers = (onlyPage) => act(async () => {
    let rows = list, total = data?.total || 0;
    if (!onlyPage) {
      rows = [];
      for (let p = 1; p <= 20; p++) {
        const r = await rpc("eg_users_find", { ...args, p_page: p, p_size: 500 });
        rows.push(...r.rows); total = r.total;
        if (rows.length >= r.total || !r.rows.length) break;
      }
    }
    const where = place.city || (place.cc ? countryName(place.cc) : place.cont || "toutes les régions");
    await printReport({
      title: "Registre des utilisateurs", landscape: true,
      subtitle: `${where}${status !== "Tous" ? ` · ${status}` : ""}${query ? ` · recherche « ${query} »` : ""} — ${onlyPage ? `feuille ${page}, ` : ""}${rows.length} sur ${total}`,
      blocks: [{ table: {
        cols: ["Identifiant", "Nom", "Téléphone", "Ville", "Pays", "Âge", "Statut", "Inscrit le", "Dernière visite"],
        align: ["", "", "", "", "", "c", "c", "c", "c"],
        rows: rows.map((u) => [shortId(u.id), fullName(u), u.phone, u.city, countryName(u.cc), ageRange(u.birth_year), statusLabel(u.status), day(u.created_at), dayTime(u.last_seen_at)]),
      } }],
    });
  });

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
  if (selId && !sel) detailView = <Loading error={one.error} />;
  else if (!sel) detailView = <Empty icon="👥" text="Sélectionnez un utilisateur pour voir sa fiche" />;
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
        <div><span className="label">Pays</span><strong>{countryLabel(sel.phone, sel.country_code)}</strong></div>
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
            {d.reports > 0 && <button className="action-button neutral" onClick={() => goto("reports", { q: sel.phone || fullName(sel) })}>🚩 Voir les signalements</button>}
            <button className="action-button neutral" onClick={() => goto("support", { userId: sel.id })}>💬 Conversation service client</button>
          </div>
          {panel && <SanctionPanel key={panel} mode={panel} onConfirm={confirm} onCancel={() => setPanel(null)} />}
        </>)}
      <History label="Historique des actions sur ce compte" rows={hist} />
    </>);
  }

  return (<>
    <ScreenTitle eyebrow="COMPTES" title="Utilisateurs">
      {data && <button className="action-button neutral" onClick={() => printUsers(true)}>🖨️ Cette feuille</button>}
      {data && <button className="action-button neutral" onClick={() => printUsers(false)}>🖨️ Registre complet</button>}
    </ScreenTitle>
    {missing && <p className="field-hint">⚠️ Exécutez d'abord le fichier SQL 84 (parties 1, 2 et 3) dans Supabase.</p>}
    <section className="users-summary">
      <div className="u-sum"><span>Total inscrits</span><strong>{sumOf("total")}</strong></div>
      <div className="u-sum ok"><span>Actifs</span><strong>{cnt("actif")}</strong></div>
      <div className="u-sum warn"><span>Avertis</span><strong>{cnt("averti")}</strong></div>
      <div className="u-sum bad"><span>Suspendus</span><strong>{cnt("suspendu")}</strong></div>
    </section>
    {placesQ.data && <PlaceNav places={places} value={place} onChange={(v) => { setPlace(v); setPage(1); }} extra="suspendus" extraLabel="suspendu(s)" />}
    <form className="cl-search" onSubmit={(e) => { e.preventDefault(); setQuery(typed.trim()); setPage(1); }}>
      <span>🔍</span>
      <input value={typed} onChange={(e) => setTyped(e.target.value)} inputMode="search" placeholder={`Numéro de téléphone, nom ou identifiant EM-…${place.city ? ` à ${place.city}` : place.cc ? ` (${countryName(place.cc)})` : ""}`} autoComplete="off" />
      {query && <button type="button" className="cl-clear" onClick={() => { setTyped(""); setQuery(""); setPage(1); }}>✕</button>}
      <button type="submit" className="action-button primary">Rechercher</button>
    </form>
    <div className="cl-filters"><Pills options={["Tous", "Actif", "Averti", "Suspendu"]} value={status} onChange={(v) => { setStatus(v); setPage(1); }} /></div>
    <div className="users-layout">
      <div className="reports-list">
        {data && <Pager page={page} total={data.total} size={SIZE} onPage={setPage} label="compte(s)" />}
        {!data ? (!missing && <Loading error={error} />) : list.length === 0 && <p className="reports-empty">Aucun utilisateur ne correspond à cette recherche.</p>}
        {list.map((u) => (
          <button key={u.id} className={"user-row" + (u.id === selId ? " active" : "")} onClick={() => { setSelId(u.id); setPanel(null); }}>
            <Avatar url={u.avatar_url} name={fullName(u)} />
            <div className="u-main"><strong>{fullName(u)}</strong><span>{shortId(u.id)} · {u.phone || "—"}</span><span>📍 {u.city || "Ville inconnue"} · {countryName(u.cc)}</span></div>
            <span className={"u-status " + statusLabel(u.status)}>{statusLabel(u.status)}</span>
          </button>
        ))}
        {data && data.total > SIZE && <Pager page={page} total={data.total} size={SIZE} onPage={setPage} label="compte(s)" />}
      </div>
      <div className="report-detail">{detailView}</div>
    </div>
  </>);
}
