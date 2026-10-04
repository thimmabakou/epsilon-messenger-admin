// Publicités Epsilon Market (réservé au PDG, chaque action demande le code de sécurité du PDG).
// Le commerçant demande sa publicité dans l'application et paie par Mobile Money en donnant la référence ;
// le PDG compare avec son propre SMS puis valide (la publicité démarre tout de suite) ou refuse.
// Prix : 2 jours 500 FCFA · 5 jours 1 000 FCFA · 1 semaine 1 500 FCFA.
import { useEffect, useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly, fmt, fullName } from "../lib/format";
import { Empty, Note, ScreenTitle, SecurityGate, Pills } from "../components/common";

const TABS = [["pending", "En attente"], ["active", "En ligne"], ["ended", "Terminées"], ["rejected", "Refusées"]];
const stateOf = (a) => (a.status === "active" ? (new Date(a.ends_at) > new Date() ? "active" : "ended") : a.status);

export default function Ads() {
  const { me, deny, act } = useAdmin();
  const allowed = !!me?.isPdg;
  const [tab, setTab] = useState("pending");
  const [gate, setGate] = useState(null);
  const [reject, setReject] = useState(null);   // { a, reason }
  const [pay, setPay] = useState(null);         // formulaire des numéros de paiement

  const { data, error, reload } = useLoad(async () => {
    const [ads, settings] = await Promise.all([
      q(supabase.from("market_ads").select("*").order("created_at", { ascending: false }).limit(300)),
      q(supabase.from("pay_settings").select("*").limit(1)),
    ]);
    const shopIds = [...new Set(ads.map((a) => a.shop_id))];
    const userIds = [...new Set(ads.map((a) => a.owner_id))];
    const prodIds = [...new Set(ads.map((a) => a.product_id).filter(Boolean))];
    const [shops, users, prods] = await Promise.all([
      shopIds.length ? q(supabase.from("shops").select("id,name").in("id", shopIds)) : [],
      userIds.length ? q(supabase.from("profiles").select("id,first_name,last_name,phone").in("id", userIds)) : [],
      prodIds.length ? q(supabase.from("products").select("id,name").in("id", prodIds)) : [],
    ]);
    const by = (rows) => Object.fromEntries(rows.map((r) => [String(r.id), r]));
    const S = by(shops), U = by(users), P = by(prods);
    return {
      ads: ads.map((a) => ({ ...a, shop: S[a.shop_id], owner: U[a.owner_id], product: a.product_id ? P[a.product_id] : null })),
      pay: settings[0] || {},
    };
  });
  useEffect(() => { if (data && !pay) setPay({ momo: data.pay.momo_number || "", airtel: data.pay.airtel_number || "", name: data.pay.pay_name || "" }); }, [data]); // eslint-disable-line

  const rows = (data?.ads || []).filter((a) => stateOf(a) === tab);
  const count = (k) => (data?.ads || []).filter((a) => stateOf(a) === k).length;
  const protect = (title, run) => (allowed ? setGate({ title, run: async () => { setGate(null); await run(); reload?.(); } }) : deny("PDG"));
  const rpc = async (name, args) => { const { error: e } = await supabase.rpc(name, args); if (e) throw new Error(e.message); };

  const approve = (a) => protect(`Valider la publicité de « ${a.shop?.name || "?"} » — ${a.days} jours, ${fmt(a.price_fcfa)} FCFA (réf. ${a.pay_ref})`,
    () => act(() => rpc("eg_ad_decide", { p_ad: a.id, p_ok: true }), "✅ Publicité en ligne dans Epsilon Market."));
  const confirmReject = () => {
    const { a, reason } = reject;
    protect(`Refuser la publicité de « ${a.shop?.name || "?"} »`,
      () => act(async () => { await rpc("eg_ad_decide", { p_ad: a.id, p_ok: false, p_reason: reason || null }); setReject(null); }, "❌ Publicité refusée."));
  };
  const stop = (a) => protect(`Arrêter tout de suite la publicité de « ${a.shop?.name || "?"} »`,
    () => act(() => rpc("eg_ad_stop", { p_ad: a.id }), "⏹ Publicité arrêtée."));
  const savePay = () => protect("Enregistrer les numéros de paiement d'Epsilon",
    () => act(() => rpc("eg_set_pay_info", { p_momo: pay.momo, p_airtel: pay.airtel, p_name: pay.name }), "💾 Numéros enregistrés : ils s'affichent dans l'application."));

  return (<>
    <ScreenTitle eyebrow="CONTENU" title="Publicités — Epsilon Market" />
    <Note icon="📣">Prix : <b>2 jours 500 FCFA</b> · <b>5 jours 1 000 FCFA</b> · <b>1 semaine 1 500 FCFA</b>. Avant de valider, <b>comparez la référence</b> donnée par le commerçant avec le SMS reçu sur le téléphone d'Epsilon, et vérifiez que le montant est le bon. La publicité démarre à la validation et s'arrête seule à la fin. 🔐 Réservé au PDG.</Note>

    {pay && (
      <div className="ver-form" style={{ marginBottom: 16 }}>
        <strong style={{ fontSize: 14 }}>📱 Numéros de paiement d'Epsilon (affichés aux commerçants)</strong>
        <input placeholder="Numéro MTN Mobile Money" value={pay.momo} inputMode="tel" onChange={(e) => setPay({ ...pay, momo: e.target.value })} autoComplete="off" />
        <input placeholder="Numéro Airtel Money (facultatif)" value={pay.airtel} inputMode="tel" onChange={(e) => setPay({ ...pay, airtel: e.target.value })} autoComplete="off" />
        <input placeholder="Au nom de (ex. Epsilon Messenger)" value={pay.name} onChange={(e) => setPay({ ...pay, name: e.target.value })} autoComplete="off" />
        <div className="mp-actions"><button className="action-button primary" onClick={savePay}>💾 Enregistrer (code PDG)</button></div>
      </div>
    )}

    <Pills options={TABS.map(([k, l]) => [k, `${l} (${count(k)})`])} value={tab} onChange={setTab} />
    {!data && <Loading error={error} />}
    {data && rows.length === 0 && <Empty icon="📣" text="Aucune publicité ici." />}
    <div className="mp-section">
      {rows.map((a) => (
        <div key={a.id} className="music-row" style={{ alignItems: "flex-start" }}>
          <div style={{ width: 150, flexShrink: 0 }}>
            {a.media_type === "video"
              ? <video src={a.media_urls[0]} muted loop playsInline controls style={{ width: "100%", borderRadius: 10, background: "#111" }} />
              : <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{a.media_urls.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8 }} /></a>)}</div>}
          </div>
          <div className="music-main">
            <strong>{a.shop?.name || "Boutique inconnue"}{a.product ? ` — ${a.product.name}` : " — toute la boutique"}</strong>
            <span className="field-hint">Commerçant : {a.owner ? `${fullName(a.owner)} (${a.owner.phone || "—"})` : "—"}</span>
            <span className="field-hint">{a.days} jours · <b>{fmt(a.price_fcfa)} FCFA</b> · référence <b>{a.pay_ref}</b> · demandé le {dateOnly(a.created_at)}</span>
            {a.caption && <span className="field-hint">Texte : « {a.caption} »</span>}
            {a.status === "active" && <span className="field-hint">{tab === "active" ? `En ligne jusqu'au ${dateOnly(a.ends_at)}` : `Terminée le ${dateOnly(a.ends_at)}`} · {fmt(a.views)} vues · {fmt(a.clicks)} touches</span>}
            {a.status === "rejected" && a.reject_reason && <span className="field-hint">Motif : {a.reject_reason}</span>}
          </div>
          <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
            {tab === "pending" && <>
              <button className="action-button primary" onClick={() => approve(a)}>✅ Valider</button>
              <button className="action-button danger" onClick={() => (allowed ? setReject({ a, reason: "" }) : deny("PDG"))}>❌ Refuser</button>
            </>}
            {tab === "active" && <button className="action-button danger" onClick={() => stop(a)}>⏹ Arrêter</button>}
          </div>
        </div>
      ))}
    </div>

    {reject && (
      <div onClick={() => setReject(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
        <div className="ver-form" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, width: "100%", background: "var(--card, #fff)" }}>
          <strong style={{ fontSize: 15 }}>Refuser — {reject.a.shop?.name}</strong>
          <input placeholder="Motif (ex. paiement introuvable, image choquante…)" value={reject.reason} maxLength={120} onChange={(e) => setReject({ ...reject, reason: e.target.value })} />
          <span className="field-hint">Le commerçant verra ce motif dans « Mes publicités ». Pensez à le rembourser si le paiement a bien été reçu.</span>
          <div className="mp-actions">
            <button className="action-button danger" onClick={confirmReject}>❌ Refuser (code PDG)</button>
            <button className="action-button neutral" onClick={() => setReject(null)}>Annuler</button>
          </div>
        </div>
      </div>
    )}
    {gate && <SecurityGate title={gate.title} onConfirm={gate.run} onCancel={() => setGate(null)} />}
  </>);
}
