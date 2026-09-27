// Demandes au PDG : les administrateurs demandent une permission, le PDG répond, accorde ou refuse
import { useEffect, useRef, useState } from "react";
import { supabase, q, rpc, invokeFn } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { PERMISSION_GROUPS, REQ_STATUS, permLabel } from "../lib/constants";
import { dateTime, initials } from "../lib/format";
import { Empty, Note, ScreenTitle } from "../components/common";

const statusClass = (st) => st === "accordee" ? "granted" : st === "refusee" ? "refused" : st === "en_attente" ? "pending" : "info";

export default function Requests({ nav }) {
  const { me, act } = useAdmin();
  const pdg = me.isPdg;
  const [selId, setSelId] = useState(null);
  const [reply, setReply] = useState("");
  const [formOpen, setFormOpen] = useState(!!nav.newPerm && !pdg);
  const [nr, setNr] = useState({ perm: nav.newPerm || "", text: "" });
  const box = useRef();

  const { data, error } = useLoad(async () => {
    const reqs = await q(supabase.from("perm_requests").select("*").order("created_at", { ascending: false }));
    const names = pdg && reqs.length ? await q(supabase.from("admins").select("user_id,display_name").in("user_id", [...new Set(reqs.map((r) => r.admin_id))])) : [];
    const ids = reqs.map((r) => r.id);
    const msgs = ids.length ? await q(supabase.from("perm_request_messages").select("*").in("request_id", ids).order("created_at")) : [];
    return reqs.map((r) => ({ ...r, adminName: (names.find((n) => n.user_id === r.admin_id) || {}).display_name || "Administrateur", messages: msgs.filter((m) => m.request_id === r.id) }));
  });
  const reqs = (data || []).filter((r) => pdg || r.admin_id === me.id);
  const r = reqs.find((x) => x.id === selId);

  // Lecture : remet le compteur de non-lus à zéro
  useEffect(() => {
    if (r && (pdg ? r.unread_pdg : r.unread_admin)) supabase.rpc("mark_perm_request_read", { p_request: r.id });
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId, data]);

  const askable = PERMISSION_GROUPS.flatMap((g) => g.items).filter((it) => !it.ownerOnly && !me.perms.includes(it.key));

  const create = async () => {
    const id = await act(() => rpc("create_perm_request", { p_perm: nr.perm || null, p_body: nr.text.trim() }), "✉️ Demande envoyée au PDG.");
    if (id) {
      setFormOpen(false); setNr({ perm: "", text: "" }); setSelId(id);
      invokeFn("notify-pdg", { request_id: id }).catch(() => { /* le PDG verra quand même la demande dans son menu */ });
    }
  };
  const send = async () => {
    if (!reply.trim()) return;
    if (await act(() => rpc("reply_perm_request", { p_request: r.id, p_body: reply.trim() }))) setReply("");
  };
  const decide = (grant) => act(() => rpc("decide_perm_request", { p_request: r.id, p_grant: grant }), grant ? "✅ Permission accordée : elle s'applique immédiatement." : "Demande refusée.");

  let thread;
  if (!r) thread = <Empty icon="✉️" text={pdg ? "Sélectionnez une demande pour la lire et répondre" : "Sélectionnez une demande, ou écrivez au PDG"} />;
  else thread = (<>
    <div className="conv-thread-header">
      <div><span className={"req-status " + statusClass(r.status)}>{REQ_STATUS[r.status]}</span><h2>{pdg ? r.adminName : "Échange avec le PDG"}</h2>
        {r.perm_key && <span className="field-hint">Permission demandée : <strong>{permLabel(r.perm_key)}</strong></span>}</div>
      <button className="icon-button" onClick={() => setSelId(null)}>✕</button>
    </div>
    <div className="conv-messages" ref={box}>
      {r.messages.map((m) => {
        const mine = pdg ? m.sender === "pdg" : m.sender === "admin";
        const cls = m.sender === "system" ? "system" : mine ? "team" : "user";
        const who = m.sender === "system" ? "" : m.sender === "pdg" ? "PDG · " : `${r.adminName} · `;
        return <div key={m.id} className={"conv-msg " + cls}>{m.body}<span className="conv-msg-when">{who}{dateTime(m.created_at)}</span></div>;
      })}
    </div>
    {pdg && r.perm_key && !["accordee", "refusee"].includes(r.status) && (
      <div className="mp-actions" style={{ marginTop: 10 }}>
        <button className="action-button ok" onClick={() => decide(true)}>✅ Accorder la permission</button>
        <button className="action-button danger" onClick={() => decide(false)}>❌ Refuser</button>
      </div>
    )}
    <div className="conv-reply">
      <input placeholder={pdg ? `Répondre à ${r.adminName}…` : "Écrire au PDG…"} value={reply} autoComplete="off" onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
      <button className="primary-button" onClick={send} style={{ padding: "10px 16px" }}>Envoyer</button>
    </div>
  </>);

  return (<>
    <ScreenTitle eyebrow="ÉQUIPE" title={pdg ? "Demandes de l'équipe" : "Écrire au PDG"}>
      {!pdg && <button className="primary-button" onClick={() => setFormOpen(!formOpen)}>＋ Nouvelle demande</button>}
    </ScreenTitle>
    <Note icon="✉️">{pdg
      ? "Vos administrateurs vous écrivent ici pour demander une permission ou poser une question. Vous êtes prévenu par SMS à chaque nouvelle demande. Vous pouvez répondre, accorder ou refuser en un clic : la permission s'applique immédiatement."
      : "Besoin d'une permission que vous n'avez pas ? Expliquez votre besoin au PDG. Il est prévenu par SMS et vous répond ici."}</Note>
    {formOpen && !pdg && (
      <div className="req-form">
        <strong style={{ fontSize: 14 }}>Nouvelle demande au PDG</strong>
        <span className="field-hint">Permission souhaitée (facultatif)</span>
        <select value={nr.perm} onChange={(e) => setNr({ ...nr, perm: e.target.value })}>
          <option value="">— Autre sujet / question —</option>
          {askable.map((it) => <option key={it.key} value={it.key}>{it.label}{it.sensitive ? " (sensible)" : ""}</option>)}
        </select>
        <span className="field-hint">Votre message : expliquez pourquoi vous en avez besoin</span>
        <textarea rows={4} value={nr.text} onChange={(e) => setNr({ ...nr, text: e.target.value })} placeholder="Ex. : je reçois beaucoup de contestations, j'aurais besoin de pouvoir annuler une sanction quand le signalement était une erreur." />
        <div className="mp-actions"><button className="action-button primary" onClick={create}>✉️ Envoyer au PDG</button><button className="action-button neutral" onClick={() => setFormOpen(false)}>Annuler</button></div>
      </div>
    )}
    <div className="support-layout">
      <div className="reports-list">
        {!data ? <Loading error={error} /> : reqs.length === 0 && <p className="reports-empty">{pdg ? "Aucune demande de l'équipe pour le moment." : "Vous n'avez encore envoyé aucune demande."}</p>}
        {reqs.map((x) => {
          const last = x.messages[x.messages.length - 1];
          const unread = pdg ? x.unread_pdg : x.unread_admin;
          return (
            <button key={x.id} className={"conv-row" + (x.id === selId ? " active" : "")} onClick={() => setSelId(x.id)}>
              <div className="u-avatar">{pdg ? initials(x.adminName) : "👑"}</div>
              <div className="conv-main">
                <div className="conv-top"><strong>{pdg ? x.adminName : "PDG"}</strong><span className={"req-status " + statusClass(x.status)}>{REQ_STATUS[x.status]}</span></div>
                <div className="conv-preview">{x.perm_key ? "🔑 " + permLabel(x.perm_key) : "💬 " + (last ? last.body : "")}</div>
              </div>
              {unread ? <span className="conv-unread">{unread}</span> : null}
            </button>
          );
        })}
      </div>
      <div className="conv-thread">{thread}</div>
    </div>
  </>);
}
