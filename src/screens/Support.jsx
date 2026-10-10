// Service client : boîte de réception des conversations avec les utilisateurs
import { useEffect, useRef, useState } from "react";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateTime, fullName } from "../lib/format";
import { Avatar, Empty, Note, Pills, ScreenTitle } from "../components/common";
import { callUser, notifyUser } from "../lib/supportLine";
import SupportStatus from "../components/SupportStatus";
import SupportBroadcast from "../components/SupportBroadcast";
import AutoMessages from "../components/AutoMessages";
import { startVoice, uploadVoice, fmtSecs } from "../lib/voice";

export default function Support({ nav, goto }) {
  const { can, deny, act, toast, me } = useAdmin();
  const [filter, setFilter] = useState("Tous");
  const [selId, setSelId] = useState(null);
  const [reply, setReply] = useState("");
  const msgBox = useRef();
  const [editing, setEditing] = useState(null); // ma réponse en cours de correction
  const [rec, setRec] = useState(null);         // enregistrement vocal en cours
  const [recSecs, setRecSecs] = useState(0);
  const [voiceBusy, setVoiceBusy] = useState(false);
  useEffect(() => {
    if (!rec) return undefined;
    const t = setInterval(() => setRecSecs(Math.round((Date.now() - rec.started) / 1000)), 500);
    return () => clearInterval(t);
  }, [rec]);
  // Changer de conversation : on abandonne une correction ou un vocal en cours
  useEffect(() => { setEditing(null); rec?.cancel(); setRec(null); }, [selId]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, error, reload } = useLoad(async () => {
    const convs = await q(supabase.from("support_conversations")
      .select("*, user:profiles!support_conversations_user_id_fkey(id,first_name,last_name,avatar_url,status)")
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
  // Défilement libre : en bas à l'ouverture d'une conversation ou à l'arrivée d'un nouveau message
  // (seulement si on est déjà en bas) ; si on lit plus haut, la vérification automatique ne bouge rien.
  const lastSeen = useRef({ conv: null, id: null });
  const atBottom = useRef(true);
  useEffect(() => {
    const b = msgBox.current; const list = msgs.data;
    if (!b || !list) return;
    const last = list[list.length - 1]?.id ?? null;
    const opened = lastSeen.current.conv !== selId;
    const changed = last !== lastSeen.current.id;
    lastSeen.current = { conv: selId, id: last };
    if (opened || (changed && atBottom.current)) b.scrollTop = b.scrollHeight;
  }, [msgs.data, selId]);

  const newUser = useLoad(async () => newFor ? q(supabase.from("profiles").select("id,first_name,last_name").eq("id", newFor).maybeSingle()) : null, [newFor]);

  const list = convs.filter((c) => filter === "Tous" || (filter === "Non lus" ? c.unread_for_team > 0 : filter === "Support" ? c.tag === "support" : c.tag === "contestation"));
  const unreadTotal = convs.reduce((n, c) => n + c.unread_for_team, 0);
  const waiting = convs.filter((c) => c.last?.sender === "user").length;

  const send = async () => {
    if (!reply.trim()) return;
    if (!can("support.reply")) return deny("support.reply");
    const body = reply.trim();
    if (editing) {
      if (body !== editing.body && await act(() => rpc("eg_support_team_edit", { p_id: editing.id, p_body: body }), "✏️ Réponse corrigée.")) {
        notifyUser(conv.user_id, body); msgs.reload?.(); reload?.();
      }
      setEditing(null); setReply("");
      return;
    }
    if (newFor) {
      const id = await act(() => rpc("support_start", { p_user: newFor, p_body: body }), "Message envoyé.");
      if (id) { notifyUser(newFor, body); setReply(""); setNewFor(null); setSelId(id); reload?.(); }
    } else if (await act(() => rpc("support_reply", { p_conversation: selId, p_body: body }))) {
      notifyUser(conv.user_id, body); // l'application de la personne affiche la réponse aussitôt (+ notification)
      setReply(""); msgs.reload?.(); reload?.();
    }
  };

  // ——— Corriger une de mes réponses ———
  const startEdit = (m) => { setEditing(m); setReply(m.body || ""); };
  const cancelEdit = () => { setEditing(null); setReply(""); };

  // ——— Message vocal ———
  const recordVoice = async () => {
    if (!can("support.reply")) return deny("support.reply");
    try { const r = await startVoice(); setRecSecs(0); setRec(r); }
    catch (e) { toast(e?.name === "NotAllowedError" ? "🎙️ Micro refusé par le navigateur : autorisez-le (cadenas à gauche de l'adresse)." : "🎙️ Micro introuvable sur cet appareil."); }
  };
  const cancelVoice = () => { rec?.cancel(); setRec(null); };
  const sendVoice = async () => {
    const r = rec; setRec(null);
    if (!r) return;
    const v = await r.stop();
    if (v.duration < 1 || !v.blob.size) return toast("Vocal trop court.");
    setVoiceBusy(true);
    const ok = await act(async () => {
      const url = await uploadVoice(v);
      return rpc("eg_support_team_voice", { p_conversation: selId, p_media_url: url, p_duration: v.duration });
    }, "🎤 Vocal envoyé.");
    setVoiceBusy(false);
    if (ok) { notifyUser(conv.user_id, "🎤 Message vocal"); msgs.reload?.(); reload?.(); }
  };

  const lift = async () => {
    if (!can("mod.cancel")) return deny("mod.cancel");
    await act(async () => {
      const active = await q(supabase.from("sanctions").select("id").eq("user_id", conv.user_id).is("cancelled_at", null).is("shop_id", null).in("kind", ["suspension", "avertissement"]));
      if (!active.length) throw new Error("Aucune sanction active à lever pour cette personne.");
      for (const s of active) await rpc("lift_sanction", { p_sanction: s.id, p_reason: "Contestation acceptée par le Service client" });
    }, "↩️ Sanction levée. La personne a reçu un message.");
  };

  const replyBox = (placeholder, withVoice) => (<>
    {editing && (
      <div className="conv-editing">✏️ <span>Correction de votre réponse</span>
        <button className="icon-button" onClick={cancelEdit} aria-label="Annuler">✕</button></div>
    )}
    {rec ? (
      <div className="conv-reply conv-rec">
        <button className="icon-button" onClick={cancelVoice} aria-label="Annuler">🗑️</button>
        <span className="rec-dot" /> <strong>{fmtSecs(recSecs)}</strong> <span className="conv-rec-note">Enregistrement…</span>
        <button className="primary-button" onClick={sendVoice} style={{ padding: "10px 16px", marginLeft: "auto" }}>Envoyer le vocal</button>
      </div>
    ) : (
      <div className="conv-reply">
        <input placeholder={editing ? "Corriger votre réponse…" : placeholder} value={reply} autoComplete="off" onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        {withVoice && !editing && !reply.trim() && (
          <button className="icon-button conv-mic" onClick={recordVoice} disabled={voiceBusy} aria-label="Message vocal" title="Message vocal">{voiceBusy ? "…" : "🎤"}</button>
        )}
        <button className="primary-button" onClick={send} style={{ padding: "10px 16px" }}>{editing ? "Corriger" : "Envoyer"}</button>
      </div>
    )}
  </>);

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
      <div className="conv-messages" ref={msgBox} onScroll={(e) => { const b = e.currentTarget; atBottom.current = b.scrollHeight - b.scrollTop - b.clientHeight < 120; }}>
        {(msgs.data || []).map((m) => (
          <div key={m.id} className={"conv-msg " + (m.sender === "user" ? "user" : m.sender === "system" ? "system" : "team")}>
            {m.kind === "voice" && m.media_url ? <audio className="conv-audio" src={m.media_url} controls preload="none" /> : m.body}
            <span className="conv-msg-when">
              {m.sender === "team" ? "Équipe Epsilon · " : ""}{dateTime(m.created_at)}{m.edited_at ? " · modifié" : ""}
              {m.sender === "team" && (m.kind || "text") === "text" && (!m.author_id || m.author_id === me?.id || me?.isPdg) && (
                <button className="conv-edit" onClick={() => startEdit(m)} title="Corriger cette réponse">✏️ Modifier</button>
              )}
            </span></div>
        ))}
      </div>
      {conv.tag === "contestation" && (status === "suspendu" || status === "averti") && (
        <div className="mp-actions" style={{ marginTop: 10 }}><button className="action-button ok" onClick={lift}>↩️ Lever la sanction</button></div>
      )}
      {replyBox("Écrire une réponse au client…", true)}
    </>);
  }

  return (<>
    <ScreenTitle eyebrow="SERVICE CLIENT" title="Boîte de réception" />
    <SupportBroadcast />
    <AutoMessages />
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
            <Avatar url={c.user?.avatar_url} name={fullName(c.user)} />
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
