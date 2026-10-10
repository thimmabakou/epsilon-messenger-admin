// Publicités Epsilon Market (réservé au PDG, chaque action demande le code de sécurité du PDG).
// Le commerçant demande sa publicité dans l'application et paie par Mobile Money en donnant la référence ;
// le PDG compare avec son propre SMS puis valide (la publicité démarre tout de suite) ou refuse.
// Prix : 2 jours 500 FCFA · 5 jours 1 000 FCFA · 1 semaine 1 500 FCFA.
import { useEffect, useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly, fmt, fullName } from "../lib/format";
import { Empty, Note, ScreenTitle, SecurityGate, Pills } from "../components/common";
import PayCodeCheck from "../components/PayCodeCheck";

const TABS = [["pending", "En attente"], ["active", "En ligne"], ["ended", "Terminées"], ["rejected", "Refusées"]];
const stateOf = (a) => (a.status === "active" ? (new Date(a.ends_at) > new Date() ? "active" : "ended") : a.status);

export default function Ads() {
  const { me, deny, act } = useAdmin();
  const allowed = !!me?.isPdg;
  const [tab, setTab] = useState("pending");
  const [gate, setGate] = useState(null);
  const [reject, setReject] = useState(null);   // { a, reason }
  const [pay, setPay] = useState(null);         // formulaire des numéros de paiement
  const [check, setCheck] = useState(null);
  const [editPay, setEditPay] = useState(false); // numéros verrouillés ; « Modifier » demande le code du PDG     // publicité en cours de vérification (deux codes)

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

  // Valider : d'abord les deux codes identiques (case verte), puis le code de sécurité du PDG
  const approve = (a) => (allowed ? setCheck(a) : deny("PDG"));
  const confirmApprove = async (adminRef) => {
    const a = check;
    setCheck(null);
    protect(`Valider la publicité de « ${a.shop?.name || "?"} » — ${a.days} jours, ${fmt(a.price_fcfa)} FCFA (code ${a.pay_ref})`,
      () => act(() => rpc("eg_ad_decide", { p_ad: a.id, p_ok: true, p_admin_ref: adminRef }), "✅ Codes identiques : publicité en ligne dans Epsilon Market."));
  };
  const confirmReject = () => {
    const { a, reason } = reject;
    protect(`Refuser la publicité de « ${a.shop?.name || "?"} »`,
      () => act(async () => { await rpc("eg_ad_decide", { p_ad: a.id, p_ok: false, p_reason: reason || null }); setReject(null); }, "❌ Publicité refusée."));
  };
  const stop = (a) => protect(`Arrêter tout de suite la publicité de « ${a.shop?.name || "?"} »`,
    () => act(() => rpc("eg_ad_stop", { p_ad: a.id }), "⏹ Publicité arrêtée."));
  const savePay = () => protect("Enregistrer les nouveaux numéros de paiement d'Epsilon",
    async () => { if (await act(() => rpc("eg_set_pay_info", { p_momo: pay.momo, p_airtel: pay.airtel, p_name: pay.name }), "✅ Numéros validés : ils s'affichent dans l'application.")) setEditPay(false); });
  const startEditPay = () => protect("Modifier les numéros de paiement d'Epsilon", async () => setEditPay(true));
  const cancelEditPay = () => { setPay({ momo: data?.pay.momo_number || "", airtel: data?.pay.airtel_number || "", name: data?.pay.pay_name || "" }); setEditPay(false); };
  const payLocked = !editPay && !!(data?.pay.momo_number || data?.pay.airtel_number);

  return (<>
    <ScreenTitle eyebrow="CONTENU" title="Publicités — Epsilon Market" />
    <Note icon="📣">Prix : <b>2 jours 500 FCFA</b> · <b>5 jours 1 000 FCFA</b> · <b>1 semaine 1 500 FCFA</b>. Pour valider, <b>recopiez le code reçu dans le SMS</b> du téléphone d'Epsilon : il doit être identique au code du commerçant (la case devient verte), et vérifiez le montant. Un code validé ne peut plus jamais resservir. La publicité démarre à la validation et s'arrête seule à la fin. 🔐 Réservé au PDG.</Note>

    {pay && payLocked && (
      <div className="pay-locked">
        <strong className="pay-locked-title">✅ Numéros de paiement affichés par Epsilon — validés par le PDG</strong>
        <div className="pay-locked-grid">
          {data.pay.momo_number && (
            <div className="pay-locked-card">
              <span className="pay-badge mtn"><b>MTN</b> MoMo</span>
              <span className="pay-locked-num">{data.pay.momo_number}</span>
            </div>
          )}
          {data.pay.airtel_number && (
            <div className="pay-locked-card">
              <span className="pay-badge airtel"><b>airtel</b> money</span>
              <span className="pay-locked-num">{data.pay.airtel_number}</span>
            </div>
          )}
        </div>
        {data.pay.pay_name && <span className="field-hint">Titulaire des comptes : <b>{data.pay.pay_name}</b></span>}
        <button className="pay-locked-edit" onClick={startEditPay}>✏️ Modifier (code PDG)</button>
      </div>
    )}
    {pay && !payLocked && (
      <div className="ver-form" style={{ marginBottom: 16 }}>
        <strong style={{ fontSize: 14 }}>📱 Numéros de paiement d'Epsilon (affichés aux commerçants)</strong>
        <input placeholder="Numéro MTN Mobile Money" value={pay.momo} inputMode="tel" onChange={(e) => setPay({ ...pay, momo: e.target.value })} autoComplete="off" />
        <input placeholder="Numéro Airtel Money (facultatif)" value={pay.airtel} inputMode="tel" onChange={(e) => setPay({ ...pay, airtel: e.target.value })} autoComplete="off" />
        <input placeholder="Nom exact du titulaire des comptes Mobile Money (tel qu’affiché à celui qui paie)" value={pay.name} onChange={(e) => setPay({ ...pay, name: e.target.value })} autoComplete="off" />
        <div className="mp-actions">
          <button className="action-button primary" onClick={savePay}>✅ Valider les numéros (code PDG)</button>
          {editPay && <button className="action-button neutral" onClick={cancelEditPay}>Annuler</button>}
        </div>
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
            <span className="field-hint">{a.days} jours · <b>{fmt(a.price_fcfa)} FCFA</b> · code du commerçant <b>{a.pay_ref}</b> · demandé le {dateOnly(a.created_at)}</span>
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
    {check && (
      <PayCodeCheck title={`Vérifier le paiement — publicité de ${check.shop?.name || "?"}`} sellerRef={check.pay_ref}
        amount={`${fmt(check.price_fcfa)} FCFA`} details={`${check.days} jours · demandé le ${dateOnly(check.created_at)}`}
        validateLabel="✅ Valider (code PDG)" onValidate={confirmApprove} onCancel={() => setCheck(null)}
        onRefuse={() => { const a = check; setCheck(null); setReject({ a, reason: "" }); }} />
    )}
    {gate && <SecurityGate title={gate.title} onConfirm={gate.run} onCancel={() => setGate(null)} />}
  </>);
}
