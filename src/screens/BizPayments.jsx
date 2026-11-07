// Epsilon Business : les entreprises abonnées et leurs paiements (mensuel 1 200 FCFA ≈ 2 $, annuel 12 000 FCFA ≈ 20 $).
// Le dirigeant paie par Mobile Money et donne la référence du SMS ; ici on recopie le code reçu sur le téléphone
// d'Epsilon (il doit être identique), puis on valide (30 jours ou 1 an de plus) ou on refuse.
import { certifState, bizCountryName } from "../lib/bizLegal.js";
import { useEffect, useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly, dateTime, fmt, fullName } from "../lib/format";
import { Empty, Note, Pills, ScreenTitle } from "../components/common";
import PayCodeCheck from "../components/PayCodeCheck";
import { printReport, money, dayTime, day } from "../lib/printDoc";

const TABS = [["en_attente", "En attente"], ["validee", "Validés"], ["refusee", "Refusés"], ["orgs", "Entreprises"], ["bilan", "📊 Bilan"]];
const USD_FCFA = 600; // même taux que les prix affichés (1 $ ≈ 600 FCFA)
// Où vérifier les papiers en ligne, selon le pays de l'entreprise
const VERIFY_AT = {
  fr: "https://annuaire-entreprises.data.gouv.fr", be: "https://kbopub.economie.fgov.be",
  us: "Site du Secretary of State de l'État (« Business Search »)", ca: "https://ised-isde.canada.ca/cc/lgcy/fdrlCrpSrch.html (fédéral) ou registre de la province",
  cg: "ACPCE (Agence congolaise pour la création des entreprises)", ci: "CEPICI — https://cepici.gouv.ci", cd: "Guichet unique de création d'entreprise (GUCE)",
};
const PLAN = { premium: "Premium (12 000 FCFA / 30 jours)", mensuel: "Standard mensuel (1 200 FCFA / 30 jours)", annuel: "Standard annuel (12 000 FCFA / 365 jours) ⭐", pro: "Pro IA mensuel (7 000 FCFA / 30 jours) 🤖", pro_annuel: "Pro IA annuel (70 000 FCFA / 365 jours) 🤖", premium_annuel: "Premium annuel (108 000 FCFA / 365 jours) 👑" };

export default function BizPayments() {
  const { can, deny, act } = useAdmin();
  const allowed = can("shops.pay");
  const [tab, setTab] = useState("en_attente");
  // Bilan mensuel : argent encaissé, coût réel de l'IA (facturé par Cloudflare), ce qui reste à Epsilon
  const [fin, setFin] = useState(null);
  const [finErr, setFinErr] = useState("");
  useEffect(() => {
    if (tab !== "bilan" || fin) return;
    supabase.rpc("eg_biz_finance", { p_months: 12 }).then(({ data: d, error: e }) => (e ? setFinErr(e.message) : setFin(d || [])));
  }, [tab, fin]);
  const [reject, setReject] = useState(null);
  const [check, setCheck] = useState(null);

  const { data, error, reload } = useLoad(async () => {
    const [pays, orgs] = await Promise.all([
      q(supabase.from("biz_payments").select("*").order("created_at", { ascending: false }).limit(400)),
      q(supabase.from("biz_orgs").select("*").order("created_at", { ascending: false }).limit(500)),
    ]);
    const ids = orgs.map((o) => o.id);
    const seats = ids.length ? q(supabase.from("biz_seats").select("id,org_id,name,kind,active,is_owner,post_id").in("org_id", ids)) : [];
    // Conseils de direction ouverts (succession du dirigeant) — absents si la partie 5 du fichier 87 n'est pas exécutée
    const docs = ids.length ? await supabase.from("biz_docs").select("id,org_id,kind,title,number,visibility,mime,req").in("org_id", ids).then((r) => r.data || [], () => []) : [];
    const councils = ids.length ? await supabase.from("biz_council").select("*").eq("status", "ouvert").in("org_id", ids).then((r) => r.data || []) : [];
    const owners = [...new Set(orgs.map((o) => o.owner_id))];
    const [S, users] = await Promise.all([seats, owners.length ? q(supabase.from("profiles").select("id,first_name,last_name,phone").in("id", owners)) : []]);
    const U = Object.fromEntries(users.map((u) => [u.id, u]));
    const O = Object.fromEntries(orgs.map((o) => [o.id, { ...o, owner: U[o.owner_id], seats: S.filter((x) => x.org_id === o.id && x.kind === "poste" && x.active).length,
      people: S.filter((x) => x.org_id === o.id && x.kind === "membre" && x.active).length,
      council: councils.find((c) => c.org_id === o.id), docs: docs.filter((x) => x.org_id === o.id), seatName: (id) => S.find((x) => x.id === id)?.name || "—" }]));
    // Les demandes de badge en premier
    const list = Object.values(O).sort((a, b) => (b.verify_requested_at && !b.verified_at ? 1 : 0) - (a.verify_requested_at && !a.verified_at ? 1 : 0));
    return { pays: pays.map((p) => ({ ...p, org: O[p.org_id] })), orgs: list };
  });
  const list = tab === "orgs" || tab === "bilan" ? [] : (data?.pays || []).filter((p) => p.status === tab);
  const count = (k) => (k === "bilan" ? (fin?.length ?? "…") : k === "orgs" ? (data?.orgs || []).length : (data?.pays || []).filter((p) => p.status === k).length);
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
        blocks: [{ table: { cols: ["Créée le", "Entreprise", "Créateur", "Téléphone", "Ordinateurs actifs", "Abonnement jusqu'au", "État"],
          rows: data.orgs.map((o) => [day(o.created_at), o.name, o.owner ? fullName(o.owner) : "—", o.owner?.phone, String(o.seats), o.paid_until ? day(o.paid_until) : "—", active(o) ? "Actif" : "Inactif"]) } }],
      } : {
        title: `Epsilon Business — paiements ${TABS.find((t) => t[0] === tab)?.[1]}`, subtitle: `${list.length} paiement(s)`, landscape: true,
        blocks: [{ table: { cols: ["Déclaré le", "Entreprise", "Dirigeant", "Téléphone", "Formule", "Montant", "Code Mobile Money", "Décision", "Motif"],
          align: ["c", "", "", "", "", "r", "c", "c", ""],
          rows: list.map((p) => [dayTime(p.created_at), p.org?.name, p.org?.owner ? fullName(p.org.owner) : "—", p.org?.owner?.phone, PLAN[p.plan] || p.plan, money(p.amount_fcfa), p.pay_ref, dayTime(p.decided_at), p.reject_reason]),
          foot: ["", "", "", "", "Total", money(list.reduce((s, p) => s + Number(p.amount_fcfa || 0), 0)), "", "", ""] } }],
      })}>🖨️ Imprimer</button>}
    </ScreenTitle>
    <Note icon="💼">Six formules : <b>Standard</b> 1 200 FCFA / 30 jours ou 12 000 FCFA / 365 jours (8 ordinateurs) ; <b>Pro IA</b> 7 000 FCFA / 30 jours ou 70 000 FCFA / 365 jours (12 ordinateurs, 50 % du prix en crédit IA) ; <b>Premium</b> 12 000 FCFA / 30 jours ou 108 000 FCFA / 365 jours (20 ordinateurs ; crédit IA : 35 % au mois, 45 % à l'année). Attention : Standard annuel et Premium ont le même montant (12 000 FCFA) : vérifiez bien la formule demandée. Pour valider, <b>recopiez le code reçu dans le SMS</b> du téléphone d'Epsilon : il doit être identique à celui du dirigeant. Vérifiez aussi le <b>montant</b>.</Note>
    {String(error || "").match(/biz_/) && <Note icon="⚠️">Le fichier SQL 87 (Epsilon Business) n'est pas encore exécuté dans Supabase.</Note>}
    <Pills options={TABS.map(([k, l]) => [k, `${l} (${count(k)})`])} value={tab} onChange={setTab} />
    {!data && <Loading error={error} />}
    {tab === "bilan" && (<>
      <Note icon="📊">Pour chaque mois : l'argent <b>encaissé</b> par Epsilon Business (paiements validés), le <b>coût réel de l'assistante IA</b> (facturé par Cloudflare, converti à 1 $ ≈ {USD_FCFA} FCFA) et <b>ce qui reste à Epsilon</b> pour ses autres charges (Supabase, Cloudflare, serveurs, SMS…). Le crédit IA non utilisé par les entreprises n'est pas dépensé : il reste dans la caisse d'Epsilon.</Note>
      {finErr && <Note icon="⚠️">{/function|schema/.test(finErr) ? "Le fichier SQL 95 n'est pas encore exécuté dans Supabase." : finErr}</Note>}
      {!fin && !finErr && <Loading />}
      {fin && (
        <div className="mp-section">
          <table className="bv-table">
            <thead><tr><th>Mois</th><th>Encaissé</th><th>Coût IA</th><th>Reste à Epsilon</th><th>Paiements</th><th>Réponses IA</th></tr></thead>
            <tbody>{fin.map((r) => {
              const ia = Math.round(Number(r.ia_usd) * USD_FCFA);
              return <tr key={r.mois}><td>{r.mois}</td><td>{fmt(r.encaisse_fcfa)} FCFA</td><td>{fmt(ia)} FCFA</td><td><b>{fmt(r.encaisse_fcfa - ia)} FCFA</b></td><td>{r.paiements}</td><td>{fmt(r.ia_reponses)}</td></tr>;
            })}</tbody>
            <tfoot><tr><th>Total</th>
              <th>{fmt(fin.reduce((t, r) => t + Number(r.encaisse_fcfa), 0))} FCFA</th>
              <th>{fmt(Math.round(fin.reduce((t, r) => t + Number(r.ia_usd), 0) * USD_FCFA))} FCFA</th>
              <th>{fmt(fin.reduce((t, r) => t + Number(r.encaisse_fcfa), 0) - Math.round(fin.reduce((t, r) => t + Number(r.ia_usd), 0) * USD_FCFA))} FCFA</th>
              <th>{fin.reduce((t, r) => t + Number(r.paiements), 0)}</th><th>{fmt(fin.reduce((t, r) => t + Number(r.ia_reponses), 0))}</th></tr></tfoot>
          </table>
          <span className="field-hint">Le coût IA est calculé à partir de chaque réponse (modèle et longueur) ; la facture Cloudflare fait foi. L'abonnement Cloudflare Workers (5 $ par mois) et les autres charges ne sont pas comptés ici.</span>
        </div>
      )}
    </>)}
    {data && tab !== "orgs" && tab !== "bilan" && list.length === 0 && <Empty icon="💼" text="Aucun paiement ici." />}
    {data && tab === "orgs" && (data.orgs.length === 0 ? <Empty icon="💼" text="Aucune entreprise pour le moment." /> : (
      <div className="mp-section">{data.orgs.map((o) => (
        <div key={o.id} className="music-row"><div className="music-main">
          <strong>{o.name}</strong>
          <span className="field-hint">Créateur du compte : {o.owner ? `${fullName(o.owner)} (${o.owner.phone || "—"})` : "—"} · {o.people} personne(s) · {o.seats}/8 ordinateurs</span>
          {o.council && <span className="field-hint">⚖️ Conseil de direction ouvert le {dateOnly(o.council.opened_at)} — successeur proposé : <b>{o.seatName(o.council.candidate)}</b>
            {" "}<button className="action-button neutral" onClick={() => window.confirm("Confirmer la succession SANS attendre 7 jours ? Seulement avec les pièces (acte de décès, procès-verbal du conseil).") && act(async () => {
              const { data: r, error: e } = await supabase.rpc("eg_biz_council_apply", { p_council: o.council.id, p_force: true });
              if (e) throw new Error(e.message);
              if (r === "votes") throw new Error("Tous les membres n'ont pas encore reconnu le successeur.");
              reload?.();
            }, "✅ Succession confirmée : le successeur occupe le poste le plus élevé.")}>Confirmer sur pièces</button></span>}
          <span className="field-hint">{o.tier === "premium" ? "👑 Premium (20 ordinateurs)" : o.tier === "pro" ? "🤖 Pro IA (12 ordinateurs)" : "Standard (8 ordinateurs)"}{o.activity ? ` · ${o.activity}` : ""}{o.verified_at ? " · ✔ Papiers vérifiés" : ""}</span>
          {o.verify_requested_at && !o.verified_at && (() => { const cs = certifState(o.country, o.docs); return (
            <span className="field-hint">🏅 <b>Badge demandé le {dateOnly(o.verify_requested_at)}</b> — pays : {bizCountryName(o.country) || "—"}.
              {" "}Documents exigés : {cs.list.filter((x) => x.req).map((x) => `${x.doc ? "✅" : "❌"} ${x.name}`).join(" · ")}.
              {VERIFY_AT[o.country] ? ` Vérifier en ligne : ${VERIFY_AT[o.country]}` : ""}</span>); })()}
          {o.docs.length > 0 && <span className="field-hint">📑 Documents : {o.docs.map((x) => `${x.title}${x.number ? ` (${x.number})` : ""} [${x.visibility}]`).join(" · ")}</span>}
          <span className="field-hint">
            {o.docs.map((x) => <button key={x.id} className="action-button neutral" style={{ marginRight: 6 }} onClick={() => act(async () => {
              const { data: ses } = await supabase.auth.getSession();
              const r = await fetch(`https://epsilon-messenger-app.pages.dev/api/biz?doc=${x.id}`, { headers: { authorization: `Bearer ${ses?.session?.access_token || ""}` } });
              if (!r.ok) throw new Error("Document introuvable");
              window.open(URL.createObjectURL(await r.blob()), "_blank");
            })}>📄 {x.title}</button>)}
            <button className="action-button neutral" onClick={() => window.confirm(o.verified_at ? "Retirer le badge « Papiers vérifiés » ?" : "Confirmer : vous avez vérifié les documents officiels de cette entreprise (registre du commerce, numéro fiscal…) ?") && act(async () => {
              const { error: e } = await supabase.rpc("eg_biz_verify", { p_org: o.id, p_ok: !o.verified_at });
              if (e) throw new Error(e.message);
              reload?.();
            }, o.verified_at ? "Badge retiré." : "✔ Entreprise marquée « papiers vérifiés ».")}>{o.verified_at ? "Retirer le badge ✔" : "✔ Papiers vérifiés"}</button>
            {o.verify_requested_at && !o.verified_at && <button className="action-button neutral" style={{ marginLeft: 6 }} onClick={() => window.confirm("Refuser la demande de badge (documents faux, illisibles ou manquants) ?") && act(async () => {
              const { error: e } = await supabase.rpc("eg_biz_verify", { p_org: o.id, p_ok: false });
              if (e) throw new Error(e.message);
              reload?.();
            }, "Demande de badge refusée.")}>✖ Refuser la demande</button>}
          </span>
          <span className="field-hint">{active(o) ? `✅ Abonnement actif jusqu'au ${dateOnly(o.paid_until)}` : o.paid_until ? `⛔ Expiré depuis le ${dateOnly(o.paid_until)}` : "⏳ Jamais payé"} · créée le {dateOnly(o.created_at)}</span>
        </div></div>))}</div>
    ))}
    <div className="mp-section">
      {list.map((p) => (
        <div key={p.id} className="music-row" style={{ alignItems: "flex-start" }}>
          <div className="music-main">
            <strong>{p.org?.name || "Entreprise supprimée"}</strong>
            <span className="field-hint">Créateur : {p.org?.owner ? `${fullName(p.org.owner)} (${p.org.owner.phone || "—"})` : "—"}</span>
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
