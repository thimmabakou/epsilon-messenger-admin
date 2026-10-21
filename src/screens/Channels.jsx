// Epsilon TV — gestion des chaînes (réservé au PDG, chaque action demande le code de sécurité du PDG).
// Démarrage : la chaîne paie par Mobile Money / espèces, puis le PDG active ici sa formule pour la durée payée.
// Tarif (validé par le PDG le 11/10/2026) : 1,20 FCFA par minute regardée (1 spectateur pendant 1 minute).
// Formules (bonus validés le 11/10/2026) : Bronze 24 000 FCFA (21 000 min) · Argent 120 000 FCFA (110 000 min) · Platine 300 000 FCFA (287 500 min) · Or 600 000 FCFA (600 000 min)
//            · Sur mesure 1,20 FCFA la minute (packs prépayés) · Recharge 12 000 FCFA (+10 000 min).
import { useRef, useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import PrivateCodes, { CodesRegistry } from "../components/PrivateCodes";
import { COUNTRIES, dateOnly, fmt, fullName } from "../lib/format";
import { uploadMusicFile } from "../lib/files";
import { Empty, Note, ScreenTitle, SecurityGate, Pills } from "../components/common";
import { printChannelList, printCodesRegistry, printPayments, printReceipt, printContract } from "../lib/printTv";

export const PRICE_PER_MINUTE = 1.2; // FCFA par minute regardée
export const STUDIO_PRICE = 10000;   // Epsilon TV Studio (site de gestion des chaînes) : FCFA par mois (validé le 16/10/2026)
const priceOf = (minutes) => Math.round((Number(minutes) || 0) * PRICE_PER_MINUTE);
export const PLANS = {
  bronze: { label: "Bronze", price: 24000, minutes: 21000, gb: 10 },
  argent: { label: "Argent", price: 120000, minutes: 110000, gb: 30 },
  platine: { label: "Platine", price: 300000, minutes: 287500, gb: 60 }, // fichier SQL 45
  or: { label: "Or", price: 600000, minutes: 600000, gb: 100 },
  sur_mesure: { label: "Sur mesure", price: null, minutes: null, gb: 10 },
};
const MONTHS = [1, 3, 6, 12];
// Stockage des vidéos en différé (fichier SQL 47) : 90 FCFA le Go par mois, compris dans chaque formule
export const STORAGE_PRICE_GB = 90;
const storageCost = (plan) => (PLANS[plan]?.gb || 0) * STORAGE_PRICE_GB;
// Prix total d'une formule pour un mois : direct + stockage
const totalFor = (plan, minutes, months) => (plan === "sur_mesure"
  ? priceOf(minutes) + storageCost(plan) * months
  : (PLANS[plan].price + storageCost(plan)) * months);

const isOpen = (c) => c.status === "active" && c.paid_until && new Date(c.paid_until) > new Date();
const daysLeft = (c) => (c.paid_until ? Math.ceil((new Date(c.paid_until) - Date.now()) / 86400000) : 0);
const digits = (v) => String(v ?? "").replace(/\D/g, "");

async function findByPhone(raw) {
  let d = digits(raw).replace(/^00/, "");
  // Numéro avec l'indicatif d'un autre pays (Sénégal, Mali, Burkina Faso, Niger) : enregistré tel quel
  const intl = Object.keys(COUNTRIES).find((c) => c !== "242" && d.startsWith(c) && d.length === c.length + COUNTRIES[c][2]);
  if (intl) return (await q(supabase.from("profiles").select("id,first_name,last_name,phone").eq("phone", d).limit(1)))[0] || null;
  if (d.startsWith("242") && d.length > 9) d = d.slice(3);
  if (d.length < 8) return null;
  const rows = await q(supabase.from("profiles").select("id,first_name,last_name,phone")
    .or(`phone.eq.${d},phone.eq.242${d},phone.eq.0${d.replace(/^0/, "")},phone.eq.${d.replace(/^0/, "")}`).limit(1));
  return rows[0] || null;
}

export default function Channels() {
  const { me, deny, act } = useAdmin();
  const allowed = !!me?.isPdg;
  const [gate, setGate] = useState(null);
  const [open, setOpen] = useState(false);
  const [showReg, setShowReg] = useState(false); // registre des codes des chaînes privées (façon tableur)
  const [form, setForm] = useState({ name: "", description: "", phone: "", logo: null });
  const [pay, setPay] = useState(null);       // { c, kind: "formule"|"recharge", plan, months, amount, minutes, note }
  const [hist, setHist] = useState(null);     // chaîne dont on regarde l'historique
  const logoIn = useRef(null);

  const { data, error, reload } = useLoad(async () => {
    const chans = await q(supabase.from("tv_channels").select("*").order("created_at", { ascending: false }));
    const ids = [...new Set(chans.map((c) => c.owner_id).filter(Boolean))];
    const owners = ids.length ? await q(supabase.from("profiles").select("id,first_name,last_name,phone").in("id", ids)) : [];
    const byId = Object.fromEntries(owners.map((o) => [o.id, o]));
    // Chaînes privées (fichier SQL 53) : leur code et le nombre de spectateurs autorisés
    let codes = [], access = [];
    {
      codes = (await supabase.from("tv_private_codes").select("*")).data || [];
      access = (await supabase.from("tv_private_access").select("channel_id")).data || [];
    }
    return chans.map((c) => ({ ...c, owner: byId[c.owner_id] || null,
      privCode: codes.find((k) => k.channel_id === c.id)?.code || null,
      privPending: codes.find((k) => k.channel_id === c.id)?.pending_code || null,
      privActivatedAt: codes.find((k) => k.channel_id === c.id)?.activated_at || null,
      privViewers: access.filter((a) => a.channel_id === c.id).length }));
  });
  const payments = useLoad(async () => (hist ? q(supabase.from("tv_payments").select("*").eq("channel_id", hist.id).order("created_at", { ascending: false })) : null), [hist?.id]);
  const rows = data || [];
  const protect = (title, run) => (allowed ? setGate({ title, run: async () => { setGate(null); await run(); reload?.(); } }) : deny("PDG"));

  // ---------- Créer une chaîne ----------
  const create = () => {
    if (!allowed) return deny("PDG");
    if (form.name.trim().length < 2) return act(async () => { throw new Error("Indiquez le nom de la chaîne."); });
    protect(`Créer la chaîne « ${form.name.trim()} »`, () => act(async () => {
      let owner = null;
      if (form.phone.trim()) {
        owner = await findByPhone(form.phone);
        if (!owner) throw new Error("Aucun compte Epsilon avec ce numéro. Le responsable de la chaîne doit d'abord s'inscrire dans l'application.");
      }
      const logo_url = form.logo ? await uploadMusicFile(form.logo, "tv-logos") : null;
      await q(supabase.from("tv_channels").insert({
        name: form.name.trim(), description: form.description.trim() || null, owner_id: owner?.id || null, logo_url, status: "active",
      }));
      setForm({ name: "", description: "", phone: "", logo: null }); setOpen(false);
    }, "📺 Chaîne créée. Activez maintenant sa formule après paiement."));
  };

  // ---------- Activer / renouveler / recharger ----------
  const startPay = (c, kind) => {
    if (!allowed) return deny("PDG");
    if (kind === "recharge") setPay({ c, kind, minutes: 10000, amount: 12000, note: "", ref: "", cash: false });
    else if (kind === "studio") setPay({ c, kind, months: 1, amount: STUDIO_PRICE, note: "", ref: "", cash: false });
    else if (kind === "stockage") setPay({ c, kind, gb: 10, amount: 10 * STORAGE_PRICE_GB, note: "", ref: "", cash: false });
    else { const plan = PLANS[c.plan] ? c.plan : "bronze"; setPay({ c, kind, plan, months: 1, amount: totalFor(plan, 100000, 1), minutes: 100000, note: "", ref: "", cash: false }); }
  };
  const setPlan = (plan) => setPay((p) => ({ ...p, plan, amount: totalFor(plan, p.minutes, p.months) }));
  const setMonths = (months) => setPay((p) => ({ ...p, months, amount: totalFor(p.plan, p.minutes, months) }));
  const confirmPay = () => {
    const p = pay;
    const amount = Number(digits(p.amount)) || 0;
    const minutes = Number(digits(p.minutes)) || 0;
    // Code de la transaction Mobile Money obligatoire (inscrit au registre : il ne pourra plus resservir)
    if (!p.cash && String(p.ref || "").replace(/[\s\-_.:/]/g, "").length < 4) return act(async () => { throw new Error("Recopiez le code de la transaction Mobile Money reçu par SMS (ou cochez « Payé en espèces »)."); });
    const refArgs = { p_ref: p.cash ? null : p.ref.trim(), p_cash: !!p.cash };
    if (p.kind === "stockage") {
      const gb = Number(digits(p.gb)) || 0;
      if (!gb) return act(async () => { throw new Error("Indiquez le nombre de Go."); });
      return protect(`Ajouter ${gb} Go d'espace à « ${p.c.name} » (${fmt(amount)} FCFA reçus)`, () => act(async () => {
        const { error: e } = await supabase.rpc("eg_tv_add_storage", { p_channel: p.c.id, p_gb: gb, p_amount: amount, p_note: p.note || null, ...refArgs });
        if (e) throw new Error(/eg_tv_add_storage/.test(e.message) ? "Exécutez d'abord le fichier SQL 47 (stockage Epsilon TV) dans Supabase." : e.message);
        setPay(null);
      }, "💾 Espace ajouté à la chaîne jusqu'à la fin de sa formule."));
    }
    if (p.kind === "studio") {
      return protect(`Activer Epsilon TV Studio pour « ${p.c.name} » — ${p.months} mois (${fmt(amount)} FCFA reçus)`, () => act(async () => {
        const { error: e } = await supabase.rpc("eg_tv_studio_activate", { p_channel: p.c.id, p_months: p.months, p_amount: amount, p_note: p.note || null, ...refArgs });
        if (e) throw new Error(/eg_tv_studio_activate/.test(e.message) ? "Exécutez d'abord le fichier SQL 70 (abonnement Studio) dans Supabase." : e.message);
        setPay(null);
      }, "🖥️ Epsilon TV Studio activé : le responsable peut gérer sa chaîne sur le site."));
    }
    if (p.kind === "recharge") {
      if (!minutes) return act(async () => { throw new Error("Indiquez le nombre de minutes."); });
      return protect(`Recharger « ${p.c.name} » de ${fmt(minutes)} minutes (${fmt(amount)} FCFA reçus)`, () => act(async () => {
        const { error: e } = await supabase.rpc("eg_tv_recharge", { p_channel: p.c.id, p_minutes: minutes, p_amount: amount, p_note: p.note || null, ...refArgs });
        if (e) throw new Error(e.message);
        setPay(null);
      }, "➕ Minutes ajoutées à la chaîne."));
    }
    if (p.plan === "sur_mesure" && !minutes) return act(async () => { throw new Error("Indiquez le nombre de minutes achetées."); });
    protect(`Activer « ${p.c.name} » — ${PLANS[p.plan].label}, ${p.months} mois (${fmt(amount)} FCFA reçus)`, () => act(async () => {
      const { error: e } = await supabase.rpc("eg_tv_activate", {
        p_channel: p.c.id, p_plan: p.plan, p_months: p.months, p_amount: amount,
        p_minutes: p.plan === "sur_mesure" ? minutes : null, p_note: p.note || null, ...refArgs,
      });
      if (e) throw new Error(e.message);
      setPay(null);
    }, "✅ Formule activée : la chaîne est visible dans Epsilon TV."));
  };
  const togglePause = (c) => protect(c.status === "active" ? `Mettre « ${c.name} » en pause` : `Remettre « ${c.name} » en service`,
    () => act(() => q(supabase.from("tv_channels").update({ status: c.status === "active" ? "paused" : "active" }).eq("id", c.id)),
      c.status === "active" ? "⏸ Chaîne en pause (invisible)." : "▶ Chaîne remise en service."));
  // Numéro de canal (fichier SQL 49) : le PDG peut le changer s'il est libre
  const setNo = (c) => {
    const v = window.prompt(`Numéro de canal pour « ${c.name} »`, c.channel_no ?? "");
    const n = parseInt(String(v || "").replace(/\D/g, ""), 10);
    if (!n || n === c.channel_no) return;
    protect(`Mettre « ${c.name} » sur le canal ${n}`, () => act(async () => {
      const { error: e } = await supabase.rpc("eg_tv_set_no", { p_channel: c.id, p_no: n });
      if (e) throw new Error(/eg_tv_set_no/.test(e.message) ? "Exécutez d'abord le fichier SQL 49 (numéros de canal) dans Supabase." : e.message);
    }, `🔢 « ${c.name} » est maintenant sur le canal ${n}.`));
  };
  // Modération : retirer les bandeaux défilants d'une chaîne qui enfreint les règles (fichier SQL 48)
  const clearTicker = (c) => protect(`Retirer les bandeaux défilants de « ${c.name} »`,
    () => act(async () => {
      const { error: e } = await supabase.rpc("eg_tv_set_ticker", { p_channel: c.id, p_items: [], p_on: false });
      if (e) throw new Error(e.message);
    }, "🧹 Bandeaux retirés."));
  const remove = (c) => protect(`Supprimer définitivement la chaîne « ${c.name} » et ses vidéos`,
    () => act(() => q(supabase.from("tv_channels").delete().eq("id", c.id)), "🗑️ Chaîne supprimée."));

  return (<>
    <ScreenTitle eyebrow="CONTENU" title="Epsilon TV — Chaînes">
      <button className="action-button neutral" onClick={() => (allowed ? setShowReg(!showReg) : deny("PDG"))}>📋 Registre des codes</button>
      {data && <button className="action-button neutral" onClick={() => printChannelList(rows, PLANS)}>🖨️ Liste des chaînes</button>}
      {data && <button className="action-button neutral" onClick={() => (allowed ? printCodesRegistry(rows) : deny("PDG"))}>🖨️ Registre des codes</button>}
      <button className="primary-button" onClick={() => (allowed ? setOpen(!open) : deny("PDG"))}>＋ Créer une chaîne</button>
    </ScreenTitle>
    <Note icon="📺">Une chaîne n'apparaît dans l'application qu'après <b>activation d'une formule</b>, une fois le paiement reçu (Mobile Money ou espèces). Tarif : <b>1,20 FCFA par minute regardée</b> (1 spectateur pendant 1 minute ; Cloudflare nous coûte ≈ 0,60). Stockage du différé compris (90 FCFA le Go par mois) : Bronze 10 Go · Argent 30 Go · Platine 60 Go · Or 100 Go · Sur mesure 10 Go. Formules : <b>Bronze</b> 24 000 FCFA (21 000 min, +5 %) · <b>Argent</b> 120 000 FCFA (110 000 min, +10 %) · <b>Platine</b> 300 000 FCFA (287 500 min, +15 %) · <b>Or</b> 600 000 FCFA (600 000 min, +20 %) · <b>Sur mesure</b> 1,20 FCFA la minute · <b>Recharge</b> 12 000 FCFA (+10 000 min) · <b>🖥️ Epsilon TV Studio</b> (gestion sur le site) 10 000 FCFA par mois, gestion depuis le téléphone gratuite. À la fin de la période payée, la chaîne disparaît toute seule. 🔐 Réservé au PDG.</Note>

    {open && (
      <div className="ver-form">
        <strong style={{ fontSize: 14 }}>Nouvelle chaîne</strong>
        <input placeholder="Nom de la chaîne (ex. Télé Bouenza)" value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" />
        <textarea placeholder="Présentation (facultatif)" rows={3} value={form.description} maxLength={400} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Téléphone du responsable (son compte Epsilon)" value={form.phone} inputMode="tel" onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="off" />
        <span className="field-hint">Le responsable pourra publier les vidéos et faire les directs depuis l'application.</span>
        <button className="action-button neutral" onClick={() => logoIn.current?.click()}>🖼️ {form.logo ? form.logo.name : "Logo de la chaîne (facultatif)"}</button>
        <input ref={logoIn} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { setForm({ ...form, logo: e.target.files?.[0] || null }); e.target.value = ""; }} />
        <div className="mp-actions">
          <button className="action-button primary" onClick={create}>💾 Créer la chaîne</button>
          <button className="action-button neutral" onClick={() => setOpen(false)}>Annuler</button>
        </div>
      </div>
    )}

    {showReg && data && <CodesRegistry rows={rows} onClose={() => setShowReg(false)} />}
    {data && rows.length > 0 && <PrivateCodes rows={rows} allowed={allowed} deny={deny} act={act} reload={reload} />}

    {!data && <Loading error={error} />}
    {data && rows.length === 0 && <Empty icon="📺" text="Aucune chaîne pour le moment." />}
    <div className="mp-section">
      {rows.map((c) => {
        const openNow = isOpen(c), left = daysLeft(c);
        const used = Number(c.used_minutes || 0), quota = Number(c.quota_minutes || 0);
        return (
          <div key={c.id} className="music-row">
            <div className="music-cover">{c.logo_url ? <img src={c.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} /> : "📺"}</div>
            <div className="music-main">
              <strong>{c.channel_no != null ? `Canal ${c.channel_no} · ` : ""}{c.name}{c.is_private ? " · 🔒 privée" : ""}{c.is_live ? " · 🔴 en direct" : ""}</strong>
              <span className="field-hint">Responsable : {c.owner ? `${fullName(c.owner)} (${c.owner.phone || "—"})` : "aucun"}</span>
              <span className="field-hint">
                Formule {PLANS[c.plan]?.label || c.plan} · {c.paid_until ? (left > 0 ? `jusqu'au ${dateOnly(c.paid_until)} (${left} j)` : `terminée le ${dateOnly(c.paid_until)}`) : "jamais activée"}
              </span>
              <span className="field-hint">🖥️ Epsilon TV Studio : {c.studio_until && new Date(c.studio_until) > new Date() ? `actif jusqu'au ${dateOnly(c.studio_until)}` : "non abonné (gestion depuis le téléphone seulement)"}</span>
              <span className="field-hint">Minutes : {fmt(used)} / {fmt(quota)}{quota ? ` (${Math.round((used / quota) * 100)} %)` : ""}</span>
              {(c.ticker || []).length > 0 && <span className="field-hint">📰 Bandeaux{c.ticker_on === false ? " (masqués)" : ""} : {c.ticker.join(" • ")}</span>}
              <span className="field-hint">Espace vidéos : {(PLANS[c.plan]?.gb || 0) + Number(c.storage_extra_gb || 0)} Go{Number(c.storage_extra_gb || 0) ? ` (dont ${c.storage_extra_gb} Go en plus)` : ""}</span>
            </div>
            <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <span className={"u-status " + (openNow ? "Actif" : "Suspendu")} style={{ textAlign: "center" }}>
                {c.status === "paused" ? "En pause" : openNow ? "Visible" : "Non payée"}
              </span>
              <button className="action-button primary" onClick={() => startPay(c, "formule")}>💳 {c.paid_until ? "Renouveler" : "Activer"}</button>
              <button className="action-button neutral" onClick={() => startPay(c, "recharge")}>➕ Recharge</button>
              <button className="action-button neutral" onClick={() => startPay(c, "stockage")}>💾 Espace en plus</button>
              <button className="action-button neutral" onClick={() => startPay(c, "studio")}>🖥️ Studio (site)</button>
              <button className="action-button neutral" onClick={() => setHist(hist?.id === c.id ? null : c)}>🧾 Paiements</button>
              <button className="action-button neutral" onClick={() => act(async () => {
                const list = await q(supabase.from("tv_payments").select("*").eq("channel_id", c.id).order("created_at"));
                await printContract(c, list, { plans: PLANS, pricePerMinute: PRICE_PER_MINUTE, studioPrice: STUDIO_PRICE, storagePriceGb: STORAGE_PRICE_GB });
              })}>📄 Contrat d'abonnement</button>
              <button className="action-button neutral" onClick={() => setNo(c)}>🔢 Numéro de canal</button>
              <button className="action-button neutral" onClick={() => togglePause(c)}>{c.status === "active" ? "⏸ Pause" : "▶ Reprendre"}</button>
              {(c.ticker || []).length > 0 && <button className="action-button neutral" onClick={() => clearTicker(c)}>🧹 Retirer les bandeaux</button>}
              <button className="action-button danger" onClick={() => remove(c)}>🗑️ Supprimer</button>
            </div>
            {hist?.id === c.id && (
              <div style={{ gridColumn: "1 / -1", width: "100%", marginTop: 8 }}>
                {payments.data?.length > 0 && <button className="action-button neutral" style={{ marginBottom: 6 }} onClick={() => printPayments(c, payments.data)}>🖨️ Imprimer l'historique</button>}
                {!payments.data ? <Loading error={payments.error} /> : payments.data.length === 0 ? <span className="field-hint">Aucun paiement enregistré.</span> : (
                  payments.data.map((p) => (
                    <div key={p.id} className="field-hint" style={{ padding: "4px 0", borderTop: "1px solid var(--line, #eee)" }}>
                      <button className="link-button" style={{ float: "right" }} onClick={() => printReceipt(c, p)}>🧾 Reçu</button>
                      {dateOnly(p.created_at)} · {p.kind === "recharge" ? "Recharge" : p.kind === "studio" ? `Epsilon TV Studio ${p.months} mois` : p.kind === "stockage" ? `Espace en plus ${p.storage_gb} Go` : `${PLANS[p.plan]?.label || p.plan} ${p.months} mois`} · {p.kind === "stockage" || p.kind === "studio" ? "" : `${fmt(p.minutes)} min · `} <b>{fmt(p.amount_fcfa)} FCFA</b>{p.pay_ref ? ` · code ${p.pay_ref}` : ""}{p.note ? ` · ${p.note}` : ""}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>

    {pay && (
      <div className="modal-backdrop" onClick={() => setPay(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
        <div className="ver-form" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, width: "100%", background: "var(--card, #fff)" }}>
          <strong style={{ fontSize: 15 }}>{pay.kind === "studio" ? `Epsilon TV Studio — ${pay.c.name}` : pay.kind === "recharge" ? `Recharge — ${pay.c.name}` : pay.kind === "stockage" ? `Espace en plus — ${pay.c.name}` : `${pay.c.paid_until ? "Renouveler" : "Activer"} — ${pay.c.name}`}</strong>
          {pay.kind === "formule" && (<>
            <span className="field-hint">Formule</span>
            <Pills options={Object.entries(PLANS).map(([k, v]) => [k, v.label])} value={pay.plan} onChange={setPlan} />
            <span className="field-hint">Durée payée</span>
            <Pills options={MONTHS.map((m) => [m, `${m} mois`])} value={pay.months} onChange={setMonths} />
            {pay.plan === "sur_mesure" && (<>
              <span className="field-hint">Minutes achetées (1,20 FCFA la minute regardée)</span>
              <input inputMode="numeric" value={pay.minutes} onChange={(e) => { const m = digits(e.target.value); setPay({ ...pay, minutes: m, amount: totalFor("sur_mesure", m, pay.months) }); }} />
            </>)}
            {pay.plan !== "sur_mesure" && <span className="field-hint">Inclus : {fmt(PLANS[pay.plan].minutes * pay.months)} minutes regardées</span>}
            <span className="field-hint">💾 Stockage des vidéos compris : {PLANS[pay.plan].gb} Go = {fmt(storageCost(pay.plan))} FCFA par mois · Total à recevoir : <b>{fmt(totalFor(pay.plan, pay.minutes, pay.months))} FCFA</b>{pay.months > 1 ? ` (${pay.months} mois)` : ""}</span>
          </>)}
          {pay.kind === "stockage" && (<>
            <span className="field-hint">Go d'espace en plus (90 FCFA le Go par mois, valable jusqu'à la fin de la formule en cours)</span>
            <input inputMode="numeric" value={pay.gb} onChange={(e) => { const g = digits(e.target.value); setPay({ ...pay, gb: g, amount: (Number(g) || 0) * STORAGE_PRICE_GB }); }} />
          </>)}
          {pay.kind === "studio" && (<>
            <span className="field-hint">Accès au site de gestion de la chaîne (epsilon-messenger-app.pages.dev/studio) : {fmt(STUDIO_PRICE)} FCFA par mois. Gérer depuis le téléphone reste gratuit.</span>
            <Pills options={MONTHS.map((m) => [m, `${m} mois`])} value={pay.months} onChange={(m) => setPay({ ...pay, months: m, amount: STUDIO_PRICE * m })} />
            <span className="field-hint">Total à recevoir : <b>{fmt(STUDIO_PRICE * pay.months)} FCFA</b></span>
          </>)}
          {pay.kind === "recharge" && (<>
            <span className="field-hint">Minutes ajoutées (1,20 FCFA la minute regardée)</span>
            <input inputMode="numeric" value={pay.minutes} onChange={(e) => { const m = digits(e.target.value); setPay({ ...pay, minutes: m, amount: priceOf(m) }); }} />
          </>)}
          <span className="field-hint">Montant reçu (FCFA)</span>
          <input inputMode="numeric" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: digits(e.target.value) })} />
          <span className="field-hint">Code de la transaction Mobile Money (reçu par SMS)</span>
          <input placeholder="Code reçu dans votre SMS" value={pay.ref} disabled={pay.cash} maxLength={40} autoComplete="off"
            onChange={(e) => setPay({ ...pay, ref: e.target.value })} style={{ fontWeight: 700, letterSpacing: ".5px" }} />
          <label className="field-hint" style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={!!pay.cash} onChange={(e) => setPay({ ...pay, cash: e.target.checked, ref: e.target.checked ? "" : pay.ref })} style={{ width: "auto" }} />
            Payé en espèces (pas de code)
          </label>
          <span className="field-hint">Un code déjà validé une fois (boutique, publicité ou télé) est refusé pour toujours.</span>
          <input placeholder="Note (ex. payé par…)" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} />
          <div className="mp-actions">
            <button className="action-button primary" onClick={confirmPay}>✅ Confirmer (code PDG)</button>
            <button className="action-button neutral" onClick={() => setPay(null)}>Annuler</button>
          </div>
        </div>
      </div>
    )}
    {gate && <SecurityGate title={gate.title} onConfirm={gate.run} onCancel={() => setGate(null)} />}
  </>);
}
