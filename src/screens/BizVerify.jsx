// 🏅 Vérification des entreprises (Epsilon Business) :
// • les demandes de badge de certification à traiter (documents, contrôle automatique des numéros) ;
// • le guide par pays (organismes, sites officiels, étapes, signes d'un faux) ;
// • la validation par l'équipe de la liste des documents exigés pour chaque pays (conforme / à corriger).
import { useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly, fullName } from "../lib/format";
import { Empty, Note, Pills, ScreenTitle } from "../components/common";
import { BIZ_COUNTRIES, legalDocs, certifState, bizCountryName } from "../lib/bizLegal.js";
import { GUIDE, GENERAL_STEPS, FAKE_SIGNS, checkNumber } from "../lib/bizVerifyGuide.js";

const APP = "https://epsilon-messenger-app.pages.dev";
async function openDoc(id) {
  const { data: ses } = await supabase.auth.getSession();
  const r = await fetch(`${APP}/api/biz?doc=${id}`, { headers: { authorization: `Bearer ${ses?.session?.access_token || ""}` } });
  if (!r.ok) throw new Error("Document introuvable ou inaccessible.");
  window.open(URL.createObjectURL(await r.blob()), "_blank");
}

function Steps({ items }) { return <ol className="bv-list">{items.map((t, i) => <li key={i}>{t}</li>)}</ol>; }
function Sites({ sites }) {
  if (!sites.length) return <span className="field-hint">Aucun site officiel de recherche en ligne connu : vérifier directement auprès de l'organisme (à compléter par l'équipe).</span>;
  return <ul className="bv-list">{sites.map((s) => <li key={s.u}><a href={s.u} target="_blank" rel="noreferrer">{s.l}</a> <span className="field-hint">{s.u}</span></li>)}</ul>;
}

function CountryGuide({ c, review, onReview }) {
  const gd = GUIDE[c] || { authority: "—", sites: [], steps: [], notes: "" };
  const r = review[c];
  return (
    <div className="music-row"><div className="music-main">
      <strong>{bizCountryName(c)}</strong>
      <span className="field-hint">
        {r ? (r.status === "conforme" ? `✅ Liste validée par l'équipe le ${dateOnly(r.at)}` : `⚠️ À corriger (signalé le ${dateOnly(r.at)})`) : "⏳ Liste pas encore validée par l'équipe"}
        {r?.note ? ` — ${r.note}` : ""}
      </span>
      <b>Organismes officiels</b><span>{gd.authority}</span>
      <b>Documents (★ = exigé pour le badge)</b>
      <ul className="bv-list">{legalDocs(c).map((d) => <li key={d.k}>{d.req ? "★ " : "○ "}{d.name}</li>)}</ul>
      <b>Où vérifier</b><Sites sites={gd.sites} />
      {gd.notes && <Note icon="ℹ️">{gd.notes}</Note>}
      <b>Étapes propres à ce pays</b><Steps items={gd.steps} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        <button className="action-button" onClick={() => onReview(c, "conforme")}>✔ Liste conforme à la loi du pays</button>
        <button className="action-button neutral" onClick={() => onReview(c, "a_corriger")}>⚠️ À corriger</button>
      </div>
    </div></div>
  );
}

export default function BizVerify() {
  const { act } = useAdmin();
  const [tab, setTab] = useState("req");
  const [country, setCountry] = useState("cg");
  const { data, error, reload } = useLoad(async () => {
    const orgs = await q(supabase.from("biz_orgs").select("*").or("verify_requested_at.not.is.null,verified_at.not.is.null").order("verify_requested_at", { ascending: true }));
    const ids = orgs.map((o) => o.id);
    const docs = ids.length ? await q(supabase.from("biz_docs").select("*").in("org_id", ids)) : [];
    const owners = [...new Set(orgs.map((o) => o.owner_id))];
    const users = owners.length ? await q(supabase.from("profiles").select("id,first_name,last_name,phone").in("id", owners)) : [];
    const review = Object.fromEntries((await supabase.from("biz_legal_review").select("*").then((r) => r.data || [], () => [])).map((x) => [x.country, x]));
    const U = Object.fromEntries(users.map((u) => [u.id, u]));
    const all = orgs.map((o) => ({ ...o, owner: U[o.owner_id], docs: docs.filter((d) => d.org_id === o.id) }));
    return { pending: all.filter((o) => o.verify_requested_at && !o.verified_at), certified: all.filter((o) => o.verified_at), review };
  });

  const decide = (o, ok) => window.confirm(ok ? `Accorder le badge « ✔ Papiers vérifiés » à « ${o.name} » ? Seulement si TOUS les documents exigés ont été vérifiés à la source.` : `Refuser / retirer le badge de « ${o.name} » ?`)
    && act(async () => { const { error: e } = await supabase.rpc("eg_biz_verify", { p_org: o.id, p_ok: ok }); if (e) throw new Error(e.message); reload?.(); },
      ok ? "✔ Entreprise certifiée." : "Badge refusé ou retiré. Prévenez le dirigeant (Service client) de ce qui manque.");
  const onReview = (c, status) => {
    const note = window.prompt(status === "conforme" ? "Remarque (facultatif) : qui a vérifié, avec quelle source ?" : "Qu'est-ce qui doit être corrigé dans la liste de ce pays ?") ;
    if (note === null) return;
    act(async () => { const { error: e } = await supabase.rpc("eg_biz_legal_review", { p_country: c, p_status: status, p_note: note }); if (e) throw new Error(e.message); reload?.(); },
      status === "conforme" ? "✅ Liste du pays marquée conforme." : "⚠️ Liste signalée à corriger. Envoyez la correction à Claude pour mise à jour.");
  };

  return (<>
    <ScreenTitle eyebrow="Epsilon Business" title="🏅 Vérification des entreprises" />
    <Note icon="🏅">Le badge <b>« ✔ Papiers vérifiés par Epsilon »</b> est facultatif. Il n'est accordé qu'après vérification, <b>à la source</b>, des documents exigés par la loi du pays de l'entreprise. Un numéro au bon format peut quand même être faux : vérifiez toujours dans le registre officiel ou auprès de l'organisme.</Note>
    {String(error || "").match(/biz_|legal_review/) && <Note icon="⚠️">Les fichiers SQL 89 et 90 ne sont pas encore exécutés dans Supabase.</Note>}
    <Pills options={[["req", `Demandes (${data?.pending.length ?? "…"})`], ["guide", "Guide par pays"], ["ok", `Certifiées (${data?.certified.length ?? "…"})`]]} value={tab} onChange={setTab} />
    {!data && <Loading error={error} />}

    {data && tab === "req" && (data.pending.length === 0 ? <Empty icon="🏅" text="Aucune demande de badge en attente." /> : (
      <div className="mp-section">{data.pending.map((o) => {
        const cs = certifState(o.country, o.docs);
        const gd = GUIDE[String(o.country || "").toLowerCase()];
        return (
          <div key={o.id} className="music-row"><div className="music-main">
            <strong>{o.name}</strong>
            <span className="field-hint">{bizCountryName(o.country) || "Pays non indiqué"} · {o.activity || o.sector || "—"} · demandé le {dateOnly(o.verify_requested_at)} · créateur : {o.owner ? `${fullName(o.owner)} (${o.owner.phone || "—"})` : "—"}</span>
            <b>Documents</b>
            <ul className="bv-list">{cs.list.map((d) => {
              const chk = d.doc && checkNumber(String(o.country || "").toLowerCase(), d.k, d.doc.number);
              return (
                <li key={d.k}>
                  {d.doc ? "✅" : d.req ? "❌" : "○"} {d.req ? "★ " : ""}{d.name}
                  {d.doc && <> — <i>{d.doc.title}</i>{d.doc.number ? ` · n° ${d.doc.number}` : " · numéro non indiqué"}{d.doc.expires_on ? ` · valable jusqu'au ${dateOnly(d.doc.expires_on)}` : ""}
                    {chk && <span className={chk.ok ? "bv-ok" : "bv-bad"}> {chk.ok ? "✔ format correct" : "✖ format incorrect"} ({chk.label})</span>}
                    {" "}<button className="action-button neutral" onClick={() => act(() => openDoc(d.doc.id))}>📄 Ouvrir</button></>}
                </li>);
            })}</ul>
            {o.docs.filter((x) => !x.req).length > 0 && <span className="field-hint">Autres documents : {o.docs.filter((x) => !x.req).map((x) => x.title).join(" · ")}</span>}
            {!cs.ready && <Note icon="⚠️">Il manque des documents exigés (❌) : refuser la demande et prévenir le dirigeant.</Note>}
            {gd && <details><summary>🔎 Où et comment vérifier ({bizCountryName(o.country)})</summary><Sites sites={gd.sites} /><Steps items={gd.steps} />{gd.notes && <Note icon="ℹ️">{gd.notes}</Note>}</details>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              <button className="action-button" disabled={!cs.ready} onClick={() => decide(o, true)}>✔ Papiers vérifiés</button>
              <button className="action-button neutral" onClick={() => decide(o, false)}>✖ Refuser la demande</button>
            </div>
          </div></div>);
      })}</div>
    ))}

    {data && tab === "guide" && (<>
      <Pills options={BIZ_COUNTRIES.map((c) => [c.c, `${c.flag} ${data.review[c.c]?.status === "conforme" ? "✅" : data.review[c.c] ? "⚠️" : ""}`.trim()])} value={country} onChange={setCountry} />
      <div className="mp-section">
        <CountryGuide c={country} review={data.review} onReview={onReview} />
        <div className="music-row"><div className="music-main"><strong>Étapes pour TOUS les pays</strong><Steps items={GENERAL_STEPS} /></div></div>
        <div className="music-row"><div className="music-main"><strong>🚩 Signes d'un faux document</strong><Steps items={FAKE_SIGNS} /></div></div>
      </div>
    </>)}

    {data && tab === "ok" && (data.certified.length === 0 ? <Empty icon="🏅" text="Aucune entreprise certifiée pour le moment." /> : (
      <div className="mp-section">{data.certified.map((o) => (
        <div key={o.id} className="music-row"><div className="music-main">
          <strong>{o.name} ✔</strong>
          <span className="field-hint">{bizCountryName(o.country)} · certifiée le {dateOnly(o.verified_at)} · {o.docs.length} document(s)</span>
          <div><button className="action-button neutral" onClick={() => decide(o, false)}>Retirer le badge ✔</button></div>
        </div></div>
      ))}</div>
    ))}
  </>);
}
