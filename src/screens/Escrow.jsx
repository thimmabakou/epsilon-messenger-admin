// Paiements sécurisés (fichier SQL 76 de l'application) : la banque intérieure d'Epsilon.
// • À vérifier : l'acheteur a payé au numéro Epsilon et donné son code ; on recopie le code du SMS reçu (deux codes identiques).
// • Argent gardé : commandes payées, en attente de la réception (versement auto au bout de N jours après la livraison).
// • Litiges : l'acheteur a signalé un problème ; on tranche (payer le vendeur ou rembourser l'acheteur).
// • Versements : retraits des vendeurs et remboursements des acheteurs à envoyer par Mobile Money, puis « Payé ».
// • Réglages (PDG) : commission et délai du versement automatique.
// Permission : « Gérer l'argent des commandes » (money.escrow), ou le PDG. Chaque décision va au journal de sécurité.
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateTime, fmt } from "../lib/format";
import { Empty, Note, Pills, ScreenTitle, sqlHint } from "../components/common";
import PayCodeCheck from "../components/PayCodeCheck";

const PERM = "money.escrow";
const OP = { mtn: "MTN MoMo", airtel: "Airtel Money" };
const code = (id) => `EPS-${String(id).padStart(5, "0")}`;
const items = (o) => (o.items || []).map((it) => `${it.name} × ${it.qty || 1}`).join(", ");
const lastStep = (o) => { const s = (o.steps || [])[(o.steps || []).length - 1]; return s ? `${s.k}${s.at ? ` (${dateTime(s.at)})` : ""}` : "—"; };

export default function Escrow() {
  const { can, deny, act, me } = useAdmin();
  const allowed = can(PERM);
  const [tab, setTab] = useState("verifier");
  const [check, setCheck] = useState(null);     // commande à vérifier (deux codes)
  const [reject, setReject] = useState(null);   // { o, reason }
  const [judge, setJudge] = useState(null);     // { o, to, note }
  const [pay, setPay] = useState(null);         // { p, ref, note }
  const [cfg, setCfg] = useState(null);         // { pct, days }

  const { data, error } = useLoad(async () => {
    const { data: d, error: e } = await supabase.rpc("eg_escrow_overview");
    if (e) throw new Error(sqlHint(e, "76-paiement-securise (parties 1 à 5)"));
    return d;
  });
  const orders = data?.orders || [], payouts = data?.payouts || [];
  const L = {
    verifier: orders.filter((o) => o.pay_status === "declaree"),
    gardee: orders.filter((o) => o.pay_status === "gardee"),
    litige: orders.filter((o) => o.pay_status === "litige"),
    versements: payouts.filter((p) => p.status === "demandee"),
    historique: orders.filter((o) => ["versee", "remboursee", "refusee"].includes(o.pay_status)),
  };
  const TABS = [["verifier", "À vérifier"], ["gardee", "Argent gardé"], ["litige", "Litiges"], ["versements", "Versements à faire"], ["historique", "Historique"]];
  const guard = (fn) => (allowed ? fn() : deny(PERM));
  const rpc = (name, args) => async () => { const { error: e } = await supabase.rpc(name, args); if (e) throw new Error(e.message); };

  return (<>
    <ScreenTitle eyebrow="COMMERCE" title="Paiements sécurisés" />
    <Note icon="🔒">L'acheteur paie au <b>numéro Epsilon</b> et donne le code de son SMS. Après vérification (les deux codes identiques), l'argent est <b>gardé par Epsilon</b>. Il est versé au vendeur, moins la commission de <b>{data?.settings?.pct ?? 3} %</b>, quand l'acheteur touche « Commande reçue », ou automatiquement <b>{data?.settings?.days ?? 3} jours</b> après la livraison sans réclamation. En cas de litige, c'est vous qui tranchez.</Note>
    {!data && <Loading error={error} />}
    {data && (<>
      <section className="cards-grid">
        {[["🔒", "Argent gardé", data.held, "commandes payées, pas encore confirmées"], ["💼", "Dû aux vendeurs", data.owed, "soldes disponibles"],
          ["📤", "Versements à faire", data.to_pay, `${L.versements.length} demande(s)`], ["💰", "Commissions gagnées", data.commissions, "depuis le début"],
          ["📥", "Total reçu", data.received, "paiements vérifiés"], ["✅", "Total versé", data.paid_out, "retraits et remboursements payés"]].map(([ic, l, v, t]) => (
          <div key={l} className="metric-card"><div className="metric-icon">{ic}</div>
            <div className="metric-body"><span className="metric-label">{l}</span><strong className="metric-value">{fmt(v)} FCFA</strong><span className="metric-trend">{t}</span></div></div>
        ))}
      </section>
      {data.auto_released > 0 && <Note icon="⏱️">{data.auto_released} commande(s) viennent d'être versées automatiquement au vendeur (délai dépassé, sans réclamation).</Note>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Pills options={TABS.map(([k, l]) => [k, `${l} (${L[k].length})`])} value={tab} onChange={setTab} />
        {me?.isPdg && <button className="action-button neutral" onClick={() => setCfg({ pct: String(data.settings?.pct ?? 3), days: String(data.settings?.days ?? 3) })}>⚙️ Réglages</button>}
      </div>
      {L[tab].length === 0 && <Empty icon={tab === "litige" ? "🤝" : "💳"} text={tab === "litige" ? "Aucun litige. 👍" : "Rien ici pour le moment."} />}

      <div className="mp-section">
        {tab !== "versements" && L[tab].map((o) => (
          <div key={o.id} className="music-row" style={{ alignItems: "flex-start" }}>
            <div className="music-main">
              <strong>{code(o.id)} · {o.shop_name || "Boutique"} · {fmt(o.pay_amount || o.total)} FCFA</strong>
              <span className="field-hint">Acheteur : <b>{o.buyer?.name || "—"}</b> ({o.buyer?.phone || "—"}) · Vendeur : <b>{o.seller?.name || "—"}</b> ({o.seller?.phone || "—"})</span>
              <span className="field-hint">Articles : {items(o)}</span>
              <span className="field-hint">{OP[o.pay_op] || o.pay_op} · code de l'acheteur : <b style={{ fontSize: 15 }}>{o.pay_ref}</b> · déclaré le {dateTime(o.pay_declared_at)}</span>
              {o.pay_held_at && <span className="field-hint">Vérifié le {dateTime(o.pay_held_at)} · dernière étape du colis : {lastStep(o)}</span>}
              {o.pay_status === "litige" && <span className="field-hint" style={{ color: "#b42318" }}>⚠️ Problème signalé le {dateTime(o.dispute_at)} : « {o.dispute_reason} »</span>}
              {o.pay_status === "versee" && <span className="field-hint">✅ Versé au vendeur : {fmt(o.seller_amount)} FCFA · commission {fmt(o.commission)} FCFA · le {dateTime(o.released_at)}</span>}
              {o.pay_status === "remboursee" && <span className="field-hint">↩️ Remboursé à l'acheteur le {dateTime(o.released_at)}</span>}
              {o.pay_status === "refusee" && <span className="field-hint">❌ Refusé{o.pay_reject_reason ? ` : ${o.pay_reject_reason}` : ""}</span>}
              {o.resolved_note && <span className="field-hint">Décision : « {o.resolved_note} »</span>}
            </div>
            {tab === "verifier" && (
              <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <button className="action-button primary" onClick={() => guard(() => setCheck(o))}>✅ Vérifier</button>
                <button className="action-button danger" onClick={() => guard(() => setReject({ o, reason: "" }))}>❌ Refuser</button>
              </div>
            )}
            {tab === "litige" && (
              <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <button className="action-button primary" onClick={() => guard(() => setJudge({ o, to: "vendeur", note: "" }))}>💼 Payer le vendeur</button>
                <button className="action-button danger" onClick={() => guard(() => setJudge({ o, to: "acheteur", note: "" }))}>↩️ Rembourser l'acheteur</button>
              </div>
            )}
          </div>
        ))}
        {tab === "versements" && L.versements.map((p) => (
          <div key={p.id} className="music-row" style={{ alignItems: "flex-start" }}>
            <div className="music-main">
              <strong>{p.kind === "remboursement" ? "↩️ Remboursement" : "💼 Retrait"} · {fmt(p.amount)} FCFA</strong>
              <span className="field-hint">À : <b>{p.name || "—"}</b> · {OP[p.op] || p.op || "—"} · numéro <b style={{ fontSize: 15 }}>{p.phone || "—"}</b></span>
              {p.order_id && <span className="field-hint">Commande {code(p.order_id)}{p.note ? ` · ${p.note}` : ""}</span>}
              <span className="field-hint">Demandé le {dateTime(p.created_at)}</span>
            </div>
            <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <button className="action-button primary" onClick={() => guard(() => setPay({ p, ref: "", note: "" }))}>📤 J'ai envoyé l'argent</button>
              {p.kind === "retrait" && <button className="action-button neutral" onClick={() => guard(() => act(rpc("eg_payout_decide", { p_payout: p.id, p_paid: false, p_ref: null, p_note: "Annulé par Epsilon" }), "Retrait annulé : l'argent revient dans le solde du vendeur."))}>Annuler</button>}
            </div>
          </div>
        ))}
      </div>
    </>)}

    {check && (
      <PayCodeCheck title={`Vérifier le paiement — ${code(check.id)}`} sellerRef={check.pay_ref} amount={`${fmt(check.pay_amount)} FCFA`}
        details={`${OP[check.pay_op] || check.pay_op} · acheteur ${check.buyer?.name || "—"} (${check.buyer?.phone || "—"}) · ${check.shop_name || ""}`}
        onCancel={() => setCheck(null)} onRefuse={() => { const o = check; setCheck(null); setReject({ o, reason: "" }); }}
        onValidate={async (ref) => { const ok = await act(rpc("eg_escrow_pay_decide", { p_order: check.id, p_ok: true, p_admin_ref: ref, p_reason: null }), "✅ Codes identiques : paiement vérifié, l'argent est gardé par Epsilon. Le vendeur voit « Payée »."); if (ok) setCheck(null); }} />
    )}
    {reject && (
      <Modal onClose={() => setReject(null)} title={`Refuser le paiement — ${code(reject.o.id)}`}>
        <input placeholder="Motif (ex. code introuvable, montant incorrect…)" value={reject.reason} maxLength={120} onChange={(e) => setReject({ ...reject, reason: e.target.value })} />
        <span className="field-hint">L'acheteur voit ce motif et peut donner un autre code.</span>
        <div className="mp-actions">
          <button className="action-button danger" onClick={async () => { if (await act(rpc("eg_escrow_pay_decide", { p_order: reject.o.id, p_ok: false, p_reason: reject.reason || null, p_admin_ref: null }), "❌ Paiement refusé.")) setReject(null); }}>❌ Refuser</button>
          <button className="action-button neutral" onClick={() => setReject(null)}>Annuler</button>
        </div>
      </Modal>
    )}
    {judge && (
      <Modal onClose={() => setJudge(null)} title={judge.to === "vendeur" ? `💼 Payer le vendeur — ${code(judge.o.id)}` : `↩️ Rembourser l'acheteur — ${code(judge.o.id)}`}>
        <span className="field-hint">Problème signalé : « {judge.o.dispute_reason} »</span>
        <span className="field-hint">{judge.to === "vendeur" ? `Le vendeur reçoit ${fmt(Math.round(judge.o.pay_amount * (1 - (data?.settings?.pct ?? 3) / 100)))} FCFA dans son solde.` : `Un remboursement de ${fmt(judge.o.pay_amount)} FCFA à envoyer à l'acheteur sera ajouté dans « Versements à faire ».`}</span>
        <textarea rows={3} placeholder="Votre décision, expliquée (visible par l'acheteur et le vendeur)" value={judge.note} maxLength={500} onChange={(e) => setJudge({ ...judge, note: e.target.value })} />
        <div className="mp-actions">
          <button className={"action-button " + (judge.to === "vendeur" ? "primary" : "danger")} disabled={judge.note.trim().length < 5}
            onClick={async () => { if (await act(rpc("eg_escrow_resolve", { p_order: judge.o.id, p_to: judge.to, p_note: judge.note }), "Litige tranché.")) setJudge(null); }}>Confirmer</button>
          <button className="action-button neutral" onClick={() => setJudge(null)}>Annuler</button>
        </div>
      </Modal>
    )}
    {pay && (
      <Modal onClose={() => setPay(null)} title={`📤 ${pay.p.kind === "remboursement" ? "Remboursement" : "Retrait"} de ${fmt(pay.p.amount)} FCFA`}>
        <span className="field-hint">Envoyez <b>{fmt(pay.p.amount)} FCFA</b> par <b>{OP[pay.p.op] || pay.p.op}</b> au <b>{pay.p.phone}</b> ({pay.p.name}), puis recopiez ici le code de la transaction de votre SMS.</span>
        <input placeholder="Code de la transaction envoyée" value={pay.ref} maxLength={60} onChange={(e) => setPay({ ...pay, ref: e.target.value })} />
        <input placeholder="Note (facultatif)" value={pay.note} maxLength={120} onChange={(e) => setPay({ ...pay, note: e.target.value })} />
        <div className="mp-actions">
          <button className="action-button primary" disabled={pay.ref.trim().length < 4}
            onClick={async () => { if (await act(rpc("eg_payout_decide", { p_payout: pay.p.id, p_paid: true, p_ref: pay.ref, p_note: pay.note || null }), "✅ Versement enregistré comme payé.")) setPay(null); }}>✅ Payé</button>
          <button className="action-button neutral" onClick={() => setPay(null)}>Annuler</button>
        </div>
      </Modal>
    )}
    {cfg && (
      <Modal onClose={() => setCfg(null)} title="⚙️ Réglages du paiement sécurisé">
        <label className="field-hint">Commission d'Epsilon (%)</label>
        <input inputMode="decimal" value={cfg.pct} onChange={(e) => setCfg({ ...cfg, pct: e.target.value })} />
        <label className="field-hint">Versement automatique au vendeur, après la livraison (jours)</label>
        <input inputMode="numeric" value={cfg.days} onChange={(e) => setCfg({ ...cfg, days: e.target.value })} />
        <div className="mp-actions">
          <button className="action-button primary" onClick={async () => { if (await act(rpc("eg_escrow_settings", { p_pct: Number(String(cfg.pct).replace(",", ".")), p_days: Number(cfg.days) }), "Réglages enregistrés.")) setCfg(null); }}>Enregistrer</button>
          <button className="action-button neutral" onClick={() => setCfg(null)}>Annuler</button>
        </div>
      </Modal>
    )}
  </>);
}

function Modal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div className="ver-form" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, width: "100%", background: "var(--card, #fff)" }}>
        <strong style={{ fontSize: 15 }}>{title}</strong>
        {children}
      </div>
    </div>
  );
}
