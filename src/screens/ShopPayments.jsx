// Paiements des boutiques (abonnement) : ouverture 500 FCFA, puis 500 FCFA/mois (Standard) ou 2 000 FCFA/mois (Pro).
// Le commerçant paie par Mobile Money et donne la référence du SMS ; ici, on compare avec le SMS reçu
// sur le téléphone d'Epsilon, puis on valide (la boutique est visible 30 jours de plus) ou on refuse.
// Accessible au PDG et aux administrateurs qui ont la permission « Valider les paiements des boutiques ».
import { useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly, dateTime, fmt, fullName } from "../lib/format";
import { Empty, Note, Pills, ScreenTitle } from "../components/common";

const TABS = [["en_attente", "En attente"], ["validee", "Validés"], ["refusee", "Refusés"]];
const KIND = { ouverture: "Ouverture", mensuel: "Mois" };
const PLAN = { basic: "Standard", pro: "Pro ⭐" };

export default function ShopPayments() {
  const { can, deny, act } = useAdmin();
  const allowed = can("shops.pay");
  const [tab, setTab] = useState("en_attente");
  const [reject, setReject] = useState(null);
  const [check, setCheck] = useState(null); // { p, ref, error } : validation avec la référence lue dans le SMS d'Epsilon

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

  // Valider : on recopie la référence du SMS reçu sur le téléphone d'Epsilon ; elle doit être identique
  // à celle donnée par le commerçant (majuscules, espaces et tirets ignorés), sinon rien n'est validé.
  const norm = (s) => String(s || "").toUpperCase().replace(/[\s\-_.:]/g, "");
  const approve = (p) => (allowed ? setCheck({ p, ref: "", error: "" }) : deny("shops.pay"));
  const confirmApprove = async () => {
    const { p, ref } = check;
    if (!ref.trim()) return setCheck({ ...check, error: "Recopiez la référence reçue dans le SMS de paiement." });
    if (norm(ref) !== norm(p.pay_ref)) return setCheck({ ...check, error: "❌ Les références ne correspondent pas. Ne validez pas : vérifiez le SMS, ou refusez ce paiement." });
    const ok = await act(() => rpc({ p_payment: p.id, p_ok: true }), "✅ Références identiques : paiement validé, la boutique est visible 30 jours de plus.");
    if (ok) setCheck(null);
  };
  const confirmReject = () => act(async () => { await rpc({ p_payment: reject.p.id, p_ok: false, p_reason: reject.reason || null }); setReject(null); }, "❌ Paiement refusé. Le commerçant voit le motif dans sa boutique.");

  return (<>
    <ScreenTitle eyebrow="COMMERCE" title="Paiements des boutiques" />
    <Note icon="💳">Ouverture <b>500 FCFA</b> (1er mois) · puis chaque mois <b>500 FCFA</b> (Standard) ou <b>2 000 FCFA</b> (Pro, plus de visibilité). Avant de valider, <b>comparez la référence</b> avec le SMS reçu sur le téléphone d'Epsilon et vérifiez le <b>montant</b>. Chaque décision est inscrite au journal de sécurité.</Note>
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
            <span className="field-hint">Référence : <b style={{ fontSize: 15 }}>{p.pay_ref}</b> · déclaré le {dateTime(p.created_at)}</span>
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
      <div onClick={() => setCheck(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
        <div className="ver-form" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, width: "100%", background: "var(--card, #fff)" }}>
          <strong style={{ fontSize: 15 }}>Valider — {check.p.shop?.name}</strong>
          <span className="field-hint">Montant attendu : <b>{fmt(check.p.amount_fcfa)} FCFA</b>. Ouvrez le SMS de paiement reçu sur le téléphone d'Epsilon et recopiez ici sa référence (le code de la transaction).</span>
          <input placeholder="Référence lue dans votre SMS" value={check.ref} maxLength={40} autoFocus autoComplete="off"
            onChange={(e) => setCheck({ ...check, ref: e.target.value, error: "" })} onKeyDown={(e) => e.key === "Enter" && confirmApprove()} />
          {check.error && <span className="field-hint" style={{ color: "var(--danger)", fontWeight: 600 }}>{check.error}</span>}
          <span className="field-hint">La validation ne se fait que si votre référence est identique à celle donnée par le commerçant. Vérifiez aussi que le montant du SMS est le bon.</span>
          <div className="mp-actions">
            <button className="action-button primary" onClick={confirmApprove}>✅ Comparer et valider</button>
            <button className="action-button neutral" onClick={() => setCheck(null)}>Annuler</button>
          </div>
        </div>
      </div>
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
