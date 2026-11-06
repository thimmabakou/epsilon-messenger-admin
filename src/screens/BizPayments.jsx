// Epsilon Business : les entreprises abonnées et leurs paiements (mensuel 1 200 FCFA ≈ 2 $, annuel 12 000 FCFA ≈ 20 $).
// Le dirigeant paie par Mobile Money et donne la référence du SMS ; ici on recopie le code reçu sur le téléphone
// d'Epsilon (il doit être identique), puis on valide (30 jours ou 1 an de plus) ou on refuse.
import { useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly, dateTime, fmt, fullName } from "../lib/format";
import { Empty, Note, Pills, ScreenTitle } from "../components/common";
import PayCodeCheck from "../components/PayCodeCheck";
import { printReport, money, dayTime, day } from "../lib/printDoc";

const TABS = [["en_attente", "En attente"], ["validee", "Validés"], ["refusee", "Refusés"], ["orgs", "Entreprises"]];
const PLAN = { mensuel: "Mensuel (30 jours)", annuel: "Annuel (365 jours) ⭐" };

export default function BizPayments() {
  const { can, deny, act } = useAdmin();
  const allowed = can("shops.pay");
  const [tab, setTab] = useState("en_attente");
  const [reject, setReject] = useState(null);
  const [check, setCheck] = useState(null);

  const { data, error, reload } = useLoad(async () => {
    const [pays, orgs] = await Promise.all([
      q(supabase.from("biz_payments").select("*").order("created_at", { ascending: false }).limit(400)),
      q(supabase.from("biz_orgs").select("*").order("created_at", { ascending: false }).limit(500)),
    ]);
    const seats = orgs.length ? q(supabase.from("biz_seats").select("org_id,active,is_owner").in("org_id", orgs.map((o) => o.id))) : [];
    const owners = [...new Set(orgs.map((o) => o.owner_id))];
    const [S, users] = await Promise.all([seats, owners.length ? q(supabase.from("profiles").select("id,first_name,last_name,phone").in("id", owners)) : []]);
    const U = Object.fromEntries(users.map((u) => [u.id, u]));
    const O = Object.fromEntries(orgs.map((o) => [o.id, { ...o, owner: U[o.owner_id], seats: S.filter((x) => x.org_id === o.id && !x.is_owner && x.active).length }]));
    return { pays: pays.map((p) => ({ ...p, org: O[p.org_id] })), orgs: Object.values(O) };
  });
  const list = tab === "orgs" ? [] : (data?.pays || []).filter((p) => p.status === tab);
  const count = (k) => (k === "orgs" ? (data?.orgs || []).length : (data?.pays || []).filter((p) => p.status === k).length);
  const rpc = async (args) => { const { error: e } = await supabase.rpc("eg_biz_pay_decide", args); if (e) throw new Error(e.message); };
  const confirmApprove = async (adminRef) => {
    const p = check;
    const ok = await act(() => rpc({ p_payment: p.id, p_ok: true, p_admin_ref: adminRef }), `✅ Codes identiques : abonnement Business prolongé (${p.plan === "annuel" ? "1 an" : "30 jours"}).`);
    if (ok) { setCheck(null); reload?.(); }
  };
  const confirmReject = () => act(async () => { await rpc({ p_payment: reject.p.id, p_ok: false, p_reason: reject.reason || null }); setReject(null); reload?.(); }, "❌ Paiement refusé. Le dirigeant voit le motif dans Epsilon Business.");
  const active = (o) => o.paid_until && new Date(o.paid_until) > new Date();

  return (<>
    <ScreenTitle eyebrow="COMMERCE" title="Epsilon Business">
      {data && <button className="action-button neutral" onClick={() => printReport(tab === "orgs" ? {
        title: "Epsilon Business — entreprises", subtitle: `${data.orgs.length} entreprise(s)`, landscape: true,
        blocks: [{ table: { cols: ["Créée le", "Entreprise", "Dirigeant", "Téléphone", "Sièges actifs", "Abonnement jusqu'au", "État"],
          rows: data.orgs.map((o) => [day(o.created_at), o.name, o.owner ? fullName(o.owner) : "—", o.owner?.phone, String(o.seats), o.paid_until ? day(o.paid_until) : "—", active(o) ? "Actif" : "Inactif"]) } }],
      } : {
        title: `Epsilon Business — paiements ${TABS.find((t) => t[0] === tab)?.[1]}`, subtitle: `${list.length} paiement(s)`, landscape: true,
        blocks: [{ table: { cols: ["Déclaré le", "Entreprise", "Dirigeant", "Téléphone", "Formule", "Montant", "Code Mobile Money", "Décision", "Motif"],
          align: ["c", "", "", "", "", "r", "c", "c", ""],
          rows: list.map((p) => [dayTime(p.created_at), p.org?.name, p.org?.owner ? fullName(p.org.owner) : "—", p.org?.owner?.phone, PLAN[p.plan] || p.plan, money(p.amount_fcfa), p.pay_ref, dayTime(p.decided_at), p.reject_reason]),
          foot: ["", "", "", "", "Total", money(list.reduce((s, p) => s + Number(p.amount_fcfa || 0), 0)), "", "", ""] } }],
      })}>🖨️ Imprimer</button>}
    </ScreenTitle>
    <Note icon="💼">Abonnement <b>mensuel 1 200 FCFA</b> (≈ 2 $, 30 jours) ou <b>annuel 12 000 FCFA</b> (≈ 20 $, 365 jours). Il permet de connecter <b>jusqu'à 8 ordinateurs</b> (sièges) au compte de l'entreprise. Pour valider, <b>recopiez le code reçu dans le SMS</b> du téléphone d'Epsilon : il doit être identique à celui du dirigeant. Vérifiez aussi le <b>montant</b>.</Note>
    {String(error || "").match(/biz_/) && <Note icon="⚠️">Le fichier SQL 87 (Epsilon Business) n'est pas encore exécuté dans Supabase.</Note>}
    <Pills options={TABS.map(([k, l]) => [k, `${l} (${count(k)})`])} value={tab} onChange={setTab} />
    {!data && <Loading error={error} />}
    {data && tab !== "orgs" && list.length === 0 && <Empty icon="💼" text="Aucun paiement ici." />}
    {data && tab === "orgs" && (data.orgs.length === 0 ? <Empty icon="💼" text="Aucune entreprise pour le moment." /> : (
      <div className="mp-section">{data.orgs.map((o) => (
        <div key={o.id} className="music-row"><div className="music-main">
          <strong>{o.name}</strong>
          <span className="field-hint">Dirigeant : {o.owner ? `${fullName(o.owner)} (${o.owner.phone || "—"})` : "—"} · {o.seats}/8 sièges actifs</span>
          <span className="field-hint">{active(o) ? `✅ Abonnement actif jusqu'au ${dateOnly(o.paid_until)}` : o.paid_until ? `⛔ Expiré depuis le ${dateOnly(o.paid_until)}` : "⏳ Jamais payé"} · créée le {dateOnly(o.created_at)}</span>
        </div></div>))}</div>
    ))}
    <div className="mp-section">
      {list.map((p) => (
        <div key={p.id} className="music-row" style={{ alignItems: "flex-start" }}>
          <div className="music-main">
            <strong>{p.org?.name || "Entreprise supprimée"}</strong>
            <span className="field-hint">Dirigeant : {p.org?.owner ? `${fullName(p.org.owner)} (${p.org.owner.phone || "—"})` : "—"}</span>
            <span className="field-hint">{PLAN[p.plan] || p.plan} · <b>{fmt(p.amount_fcfa)} FCFA</b></span>
            <span className="field-hint">Code du dirigeant : <b style={{ fontSize: 15 }}>{p.pay_ref}</b> · déclaré le {dateTime(p.created_at)}</span>
            {p.org?.paid_until && <span className="field-hint">Abonnement actuel jusqu'au {dateOnly(p.org.paid_until)}</span>}
            {p.status === "refusee" && p.reject_reason && <span className="field-hint">Motif : {p.reject_reason}</span>}
          </div>
          {tab === "en_attente" && (
            <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <button className="action-button primary" onClick={() => (allowed ? setCheck(p) : deny("shops.pay"))}>✅ Valider</button>
              <button className="action-button danger" onClick={() => (allowed ? setReject({ p, reason: "" }) : deny("shops.pay"))}>❌ Refuser</button>
            </div>
          )}
        </div>
      ))}
    </div>
    {check && (
      <PayCodeCheck title={`Vérifier le paiement — ${check.org?.name || "entreprise"}`} sellerRef={check.pay_ref}
        amount={`${fmt(check.amount_fcfa)} FCFA`} details={`Epsilon Business · ${PLAN[check.plan] || check.plan} · déclaré le ${dateTime(check.created_at)}`}
        onValidate={confirmApprove} onCancel={() => setCheck(null)}
        onRefuse={() => { const p = check; setCheck(null); setReject({ p, reason: "" }); }} />
    )}
    {reject && (
      <div onClick={() => setReject(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
        <div className="ver-form" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, width: "100%", background: "var(--card, #fff)" }}>
          <strong style={{ fontSize: 15 }}>Refuser — {reject.p.org?.name}</strong>
          <input placeholder="Motif (ex. référence introuvable, montant incorrect…)" value={reject.reason} maxLength={120} onChange={(e) => setReject({ ...reject, reason: e.target.value })} />
          <div className="mp-actions">
            <button className="action-button danger" onClick={confirmReject}>❌ Refuser</button>
            <button className="action-button neutral" onClick={() => setReject(null)}>Annuler</button>
          </div>
        </div>
      </div>
    )}
  </>);
}
