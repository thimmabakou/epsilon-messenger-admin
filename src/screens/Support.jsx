// Service client : boîte de réception des conversations avec les utilisateurs
import { useEffect, useRef, useState } from "react";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateTime, fullName, initials } from "../lib/format";
import { Empty, Note, Pills, ScreenTitle } from "../components/common";
import { callUser, notifyUser } from "../lib/supportLine";
import SupportStatus from "../components/SupportStatus";

export default function Support({ nav, goto }) {
  const { can, deny, act } = useAdmin();
  const [filter, setFilter] = useState("Tous");
  const [selId, setSelId] = useState(null);
  const [reply, setReply] = useState("");
  const msgBox = useRef();

  const { data, error, reload } = useLoad(async () => {
    const convs = await q(supabase.from("support_conversations")
      .select("*, user:profiles!support_conversations_user_id_fkey(id,first_name,last_name,status)")
      .order("updated_at", { ascending: false }).limit(300));
    const ids = convs.map((c) => c.id);
    const last = ids.length ? await q(supabase.from("support_messages").select("conversation_id,sender,body,created_at").in("conversation_id", ids).order("created_at", { ascending: false }).limit(1000)) : [];
    const lastBy = {};
    last.forEach((m) => { if (!lastBy[m.conversation_id]) lastBy[m.conversation_id] = m; });
    return convs.map((c) => ({ ...c, last: lastBy[c.id] }));
  });
  const convs = data || [];

  // Ouverture directe depuis la fiche d'un utilisateur
  const [newFor, setNewFor] = useState(null);
  useEffect(() => {
    if (!nav.userId || !data) return;
    const c = convs.find((x) => x.user_id === nav.userId);
    if (c) setSelId(c.id); else setNewFor(nav.userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.userId, !!data]);

  const conv = convs.find((c) => c.id === selId);
  const msgs = useLoad(async () => {
    if (!selId) return [];
    const m = await q(supabase.from("support_messages").select("*").eq("conversation_id", selId).order("created_at"));
    if (conv?.unread_for_team) await supabase.rpc("support_mark_read", { p_conversation: selId });
    return m;
  }, [selId]);
  // Mise à jour toute seule : message d'un utilisateur reçu (instantané) + vérification toutes les 10 s
  useEffect(() => {
    const again = () => { reload?.(); msgs.reload?.(); };
    window.addEventListener("epsilon-support-new", again);
    const t = setInterval(() => { if (document.visibilityState === "visible") again(); }, 10000);
    return () => { window.removeEventListener("epsilon-support-new", again); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId]);
  useEffect(() => { if (msgBox.current) msgBox.current.scrollTop = msgBox.current.scrollHeight; }, [msgs.data]);

  const newUser = useLoad(async () => newFor ? q(supabase.from("profiles").select("id,first_name,last_name").eq("id", newFor).maybeSingle()) : null, [newFor]);

  const list = convs.filter((c) => filter === "Tous" || (filter === "Non lus" ? c.unread_for_team > 0 : filter === "Support" ? c.tag === "support" : c.tag === "contestation"));
  const unreadTotal = convs.reduce((n, c) => n + c.unread_for_team, 0);
  const waiting = convs.filter((c) => c.last?.sender === "user").length;

  const send = async () => {
    if (!reply.trim()) return;
    if (!can("support.reply")) return deny("support.reply");
    const body = reply.trim();
    if (newFor) {
      const id = await act(() => rpc("support_start", { p_user: newFor, p_body: body }), "Message envoyé.");
      if (id) { notifyUser(newFor, body); setReply(""); setNewFor(null); setSelId(id); reload?.(); }
    } else if (await act(() => rpc("support_reply", { p_conversation: selId, p_body: body }))) {
      notifyUser(conv.user_id, body); // l'application de la personne affiche la réponse aussitôt (+ notification)
      setReply(""); msgs.reload?.(); reload?.();
    }
  };

  const lift = async () => {
    if (!can("mod.cancel")) return deny("mod.cancel");
    await act(async () => {
      const active = await q(supabase.from("sanctions").select("id").eq("user_id", conv.user_id).is("cancelled_at", null).is("shop_id", null).in("kind", ["suspension", "avertissement"]));
      if (!active.length) throw new Error("Aucune sanction active à lever pour cette personne.");
      for (const s of active) await rpc("lift_sanction", { p_sanction: s.id, p_reason: "Contestation acceptée par le Service client" });
    }, "↩️ Sanction levée. La personne a reçu un message.");
  };

  const replyBox = (placeholder) => (
    <div className="conv-reply">
      <input placeholder={placeholder} value={reply} autoComplete="off" onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
      <button className="primary-button" onClick={send} style={{ padding: "10px 16px" }}>Envoyer</button>
    </div>
  );

  let thread;
  if (newFor && !conv) {
    const u = newUser.data;
    thread = (<>
      <div className="conv-thread-header"><div><span className="conv-tag support">Nouveau</span><h2>{u ? fullName(u) : "…"}</h2></div>
        <div className="mp-actions">{u && <button className="action-button ok" onClick={() => callUser({ id: newFor, first_name: u.first_name, last_name: u.last_name })}>📞 Appeler</button>}
        <button className="icon-button" onClick={() => setNewFor(null)}>✕</button></div></div>
      <Note icon="💬">Cette personne n'a encore jamais écrit au Service client. Votre message ouvrira la conversation dans son application.</Note>
      {replyBox("Écrire un premier message…")}
    </>);
  } else if (!conv) thread = <Empty icon="🎧" text="Sélectionnez une conversation pour lire et répondre" />;
  else {
    const status = conv.user?.status;
    thread = (<>
      <div className="conv-thread-header">
        <div><span className={"conv-tag " + conv.tag}>{conv.tag === "support" ? "Support" : "Contestation"}</span><h2>{fullName(conv.user)}</h2></div>
        <div className="mp-actions">
          {conv.user && <button className="action-button ok" onClick={() => callUser({ id: conv.user_id, first_name: conv.user.first_name, last_name: conv.user.last_name })}>📞 Appeler</button>}
          {conv.user && can("users.list") && <button className="action-button neutral" onClick={() => goto("users", { userId: conv.user_id })}>👤 Fiche</button>}
          <button className="icon-button" onClick={() => setSelId(null)}>✕</button>
        </div>
      </div>
      {conv.tag === "contestation" && <Note icon="⚖️" style={{ marginBottom: 10 }}>Contestation d'une sanction. Vous pouvez dialoguer librement ; annuler ou modifier la sanction demande la permission « Annuler ou modifier une sanction ».</Note>}
      <div className="conv-messages" ref={msgBox}>
        {(msgs.data || []).map((m) => (
          <div key={m.id} className={"conv-msg " + (m.sender === "user" ? "user" : m.sender === "system" ? "system" : "team")}>{m.body}
            <span className="conv-msg-when">{m.sender === "team" ? "Équipe Epsilon · " : ""}{dateTime(m.created_at)}</span></div>
        ))}
      </div>
      {conv.tag === "contestation" && (status === "suspendu" || status === "averti") && (
        <div className="mp-actions" style={{ marginTop: 10 }}><button className="action-button ok" onClick={lift}>↩️ Lever la sanction</button></div>
      )}
      {replyBox("Écrire une réponse au client…")}
    </>);
  }

  return (<>
    <ScreenTitle eyebrow="SERVICE CLIENT" title="Boîte de réception" />
    <SupportStatus />
    <section className="users-summary">
      <div className="u-sum"><span>Conversations</span><strong>{convs.length}</strong></div>
      <div className="u-sum bad"><span>Messages non lus</span><strong>{unreadTotal}</strong></div>
      <div className="u-sum warn"><span>En attente de réponse</span><strong>{waiting}</strong></div>
      <div className="u-sum"><span>Contestations</span><strong>{convs.filter((c) => c.tag === "contestation").length}</strong></div>
    </section>
    <Pills options={["Tous", "Non lus", "Support", "Contestation"]} value={filter} onChange={setFilter} style={{ marginBottom: 14 }} />
    <div className="support-layout">
      <div className="reports-list">
        {!data ? <Loading error={error} /> : list.length === 0 && <p className="reports-empty">Aucune conversation dans cette catégorie.</p>}
        {list.map((c) => (
          <button key={c.id} className={"conv-row" + (c.id === selId ? " active" : "")} onClick={() => { setSelId(c.id); setNewFor(null); setReply(""); }}>
            <div className="u-avatar">{initials(fullName(c.user))}</div>
            <div className="conv-main">
              <div className="conv-top"><strong>{fullName(c.user)}</strong><span className={"conv-tag " + c.tag}>{c.tag === "support" ? "Support" : "Contestation"}</span></div>
              <div className="conv-preview">{c.last ? (c.last.sender === "team" ? "Vous : " : "") + c.last.body : ""}</div>
            </div>
            {c.unread_for_team > 0 && <span className="conv-unread">{c.unread_for_team}</span>}
          </button>
        ))}
      </div>
      <div className="conv-thread">{thread}</div>
    </div>
  </>);
}
