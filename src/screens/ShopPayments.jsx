// Paiements des boutiques (abonnement) : ouverture 500 FCFA, puis 500 FCFA/mois (Standard) ou 2 000 FCFA/mois (Pro).
// Le commerçant paie par Mobile Money et donne la référence du SMS ; ici, on compare avec le SMS reçu
// sur le téléphone d'Epsilon, puis on valide (la boutique est visible 30 jours de plus) ou on refuse.
// Accessible au PDG et aux administrateurs qui ont la permission « Valider les paiements des boutiques ».
import { useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly, dateTime, fmt, fullName } from "../lib/format";
import { Empty, Note, Pills, ScreenTitle } from "../components/common";
import PayCodeCheck from "../components/PayCodeCheck";

const TABS = [["en_attente", "En attente"], ["validee", "Validés"], ["refusee", "Refusés"]];
const KIND = { ouverture: "Ouverture", mensuel: "Mois" };
const PLAN = { basic: "Standard", pro: "Pro ⭐" };

export default function ShopPayments() {
  const { can, deny, act } = useAdmin();
  const allowed = can("shops.pay");
  const [tab, setTab] = useState("en_attente");
  const [reject, setReject] = useState(null);
  const [check, setCheck] = useState(null); // paiement en cours de vérification (deux codes)

  const { data, error } = useLoad(async () => {
    const pays = await q(supabase.from("shop_payments").select("*").order("created_at", { ascending: false }).limit(400));
    const shopIds = [...new Set(pays.map((p) => p.shop_id))];
    const userIds = [...new Set(pays.map((p) => p.owner_id))];
    const [shops, users] = await Promise.all([
      shopIds.length ? q(supabase.from("shops").select("id,name,city,plan,paid_until").in("id", shopIds)) : [],
      userIds.length ? q(supabase.from("profiles").select("id,first_name,last_name,phone").in("id", userIds)) : [],
    ]);
    const S = Object.fromEntries(shops.map((s) => [String(s.id), s]));
    const U = Object.fromEntries(users.map((u) => [u.id, u]));
    return pays.map((p) => ({ ...p, shop: S[String(p.shop_id)], owner: U[p.owner_id] }));
  });
  const list = (data || []).filter((p) => p.status === tab);
  const count = (k) => (data || []).filter((p) => p.status === k).length;
  const rpc = async (args) => { const { error: e } = await supabase.rpc("eg_shop_pay_decide", args); if (e) throw new Error(e.message); };

  // Valider : deux cases — le code du commerçant (verrouillé) et celui reçu dans le SMS d'Epsilon.
  // « Valider » ne s'active que s'ils sont identiques ; la base refait la vérification et refuse un code déjà consommé.
  const approve = (p) => (allowed ? setCheck(p) : deny("shops.pay"));
  const confirmApprove = async (adminRef) => {
    const p = check;
    const ok = await act(() => rpc({ p_payment: p.id, p_ok: true, p_admin_ref: adminRef }), "✅ Codes identiques : paiement validé, la boutique est visible 30 jours de plus.");
    if (ok) setCheck(null);
  };
  const confirmReject = () => act(async () => { await rpc({ p_payment: reject.p.id, p_ok: false, p_reason: reject.reason || null }); setReject(null); }, "❌ Paiement refusé. Le commerçant voit le motif dans sa boutique.");

  return (<>
    <ScreenTitle eyebrow="COMMERCE" title="Paiements des boutiques" />
    <Note icon="💳">Ouverture <b>500 FCFA</b> (1er mois) · puis chaque mois <b>500 FCFA</b> (Standard) ou <b>2 000 FCFA</b> (Pro, plus de visibilité). Pour valider, <b>recopiez le code reçu dans le SMS</b> du téléphone d'Epsilon : il doit être identique au code du commerçant (la case devient verte). Vérifiez aussi le <b>montant</b>. Un code validé ne peut plus jamais resservir. Chaque décision est inscrite au journal de sécurité.</Note>
    <Pills options={TABS.map(([k, l]) => [k, `${l} (${count(k)})`])} value={tab} onChange={setTab} />
    {!data && <Loading error={error} />}
    {data && list.length === 0 && <Empty icon="💳" text="Aucun paiement ici." />}
    <div className="mp-section">
      {list.map((p) => (
        <div key={p.id} className="music-row" style={{ alignItems: "flex-start" }}>
          <div className="music-main">
            <strong>{p.shop?.name || "Boutique supprimée"}{p.shop?.city ? ` · ${p.shop.city}` : ""}</strong>
            <span className="field-hint">Commerçant : {p.owner ? `${fullName(p.owner)} (${p.owner.phone || "—"})` : "—"}</span>
            <span className="field-hint">{KIND[p.kind] || p.kind} · formule {PLAN[p.plan] || p.plan} · <b>{fmt(p.amount_fcfa)} FCFA</b></span>
            <span className="field-hint">Code du commerçant : <b style={{ fontSize: 15 }}>{p.pay_ref}</b> · déclaré le {dateTime(p.created_at)}</span>
            {p.shop?.paid_until && <span className="field-hint">Abonnement actuel jusqu'au {dateOnly(p.shop.paid_until)}</span>}
            {p.status === "refusee" && p.reject_reason && <span className="field-hint">Motif : {p.reject_reason}</span>}
            {p.decided_at && <span className="field-hint">Décision le {dateTime(p.decided_at)}</span>}
          </div>
          {tab === "en_attente" && (
            <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <button className="action-button primary" onClick={() => approve(p)}>✅ Valider</button>
              <button className="action-button danger" onClick={() => (allowed ? setReject({ p, reason: "" }) : deny("shops.pay"))}>❌ Refuser</button>
            </div>
          )}
        </div>
      ))}
    </div>
    {check && (
      <PayCodeCheck title={`Vérifier le paiement — ${check.shop?.name || "boutique"}`} sellerRef={check.pay_ref}
        amount={`${fmt(check.amount_fcfa)} FCFA`} details={`${KIND[check.kind] || check.kind} · formule ${PLAN[check.plan] || check.plan} · déclaré le ${dateTime(check.created_at)}`}
        onValidate={confirmApprove} onCancel={() => setCheck(null)}
        onRefuse={() => { const p = check; setCheck(null); setReject({ p, reason: "" }); }} />
    )}
    {reject && (
      <div onClick={() => setReject(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
        <div className="ver-form" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, width: "100%", background: "var(--card, #fff)" }}>
          <strong style={{ fontSize: 15 }}>Refuser — {reject.p.shop?.name}</strong>
          <input placeholder="Motif (ex. référence introuvable, montant incorrect…)" value={reject.reason} maxLength={120} onChange={(e) => setReject({ ...reject, reason: e.target.value })} />
          <span className="field-hint">Le commerçant verra ce motif dans sa boutique et pourra déclarer à nouveau.</span>
          <div className="mp-actions">
            <button className="action-button danger" onClick={confirmReject}>❌ Refuser</button>
            <button className="action-button neutral" onClick={() => setReject(null)}>Annuler</button>
          </div>
        </div>
      </div>
    )}
  </>);
}
