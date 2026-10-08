// Messagerie de l'équipe : chaque administrateur discute avec chacun de ses collègues
// (messages écrits, vocaux, appels depuis le site). Le PDG est épinglé en tête chez tout le monde.
// La conversation existe d'office : un nouvel administrateur apparaît aussitôt chez tous les autres.
import { useEffect, useRef, useState } from "react";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateTime, initials } from "../lib/format";
import { Empty, Note, ScreenTitle } from "../components/common";
import { callAdmin } from "../lib/supportLine";
import { startVoice, uploadVoice, fmtSecs } from "../lib/voice";
import { loadTeam, loadTeamThread, sendTeamText, sendTeamVoice, editTeamText, teamName, teamSub } from "../lib/team";

export default function Team() {
  const { me, act, toast, refresh } = useAdmin();
  const [selId, setSelId] = useState(null);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(null);
  const [rec, setRec] = useState(null);
  const [recSecs, setRecSecs] = useState(0);
  const [busy, setBusy] = useState(false);
  const box = useRef();
  const atBottom = useRef(true);
  const lastSeen = useRef({ id: null, other: null });

  const contacts = useLoad(loadTeam);
  const list = contacts.data || [];
  const other = list.find((c) => c.user_id === selId);
  const thread = useLoad(async () => (selId ? loadTeamThread(selId) : []), [selId]);
  const msgs = thread.data || [];

  // Mise à jour toute seule : message d'un collègue reçu (instantané) + vérification toutes les 10 s
  useEffect(() => {
    const again = () => { contacts.reload?.(); thread.reload?.(); };
    const onNew = () => refresh(); // tout se recharge (conversation, liste, pastille du menu)
    window.addEventListener("epsilon-team-new", onNew);
    const t = setInterval(() => { if (document.visibilityState === "visible") again(); }, 10000);
    return () => { window.removeEventListener("epsilon-team-new", onNew); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId]);
  // Conversation ouverte : ses messages passent en « lus » → la pastille du menu se recalcule
  useEffect(() => { if (selId && thread.data) refresh(); }, [selId, thread.data?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Défilement : en bas à l'ouverture, ou quand un message arrive alors qu'on est déjà en bas
  useEffect(() => {
    const b = box.current;
    if (!b) return;
    const last = msgs[msgs.length - 1]?.id ?? null;
    const opened = lastSeen.current.other !== selId;
    const changed = last !== lastSeen.current.id;
    lastSeen.current = { id: last, other: selId };
    if (opened || (changed && atBottom.current)) b.scrollTop = b.scrollHeight;
  }, [msgs, selId]);

  useEffect(() => {
    if (!rec) return undefined;
    const t = setInterval(() => setRecSecs(Math.round((Date.now() - rec.started) / 1000)), 500);
    return () => clearInterval(t);
  }, [rec]);
  useEffect(() => { setEditing(null); setText(""); rec?.cancel(); setRec(null); }, [selId]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    const body = text.trim();
    if (!body || !other) return;
    if (editing) {
      const m = editing;
      setEditing(null); setText("");
      if (body !== m.body && await act(() => editTeamText(other.user_id, m.id, body, me.id), "✏️ Message corrigé.")) thread.reload?.();
      return;
    }
    setText("");
    if (await act(() => sendTeamText(other.user_id, body, me.id))) { thread.reload?.(); contacts.reload?.(); }
    else setText(body);
  };

  const recordVoice = async () => {
    try { const r = await startVoice(); setRecSecs(0); setRec(r); }
    catch (e) { toast(e?.name === "NotAllowedError" ? "🎙️ Micro refusé par le navigateur : autorisez-le (cadenas à gauche de l'adresse)." : "🎙️ Micro introuvable sur cet appareil."); }
  };
  const cancelVoice = () => { rec?.cancel(); setRec(null); };
  const sendVoice = async () => {
    const r = rec; setRec(null);
    if (!r || !other) return;
    const v = await r.stop();
    if (v.duration < 1 || !v.blob.size) return toast("Vocal trop court.");
    setBusy(true);
    const ok = await act(async () => sendTeamVoice(other.user_id, await uploadVoice(v), v.duration, me.id), "🎤 Vocal envoyé.");
    setBusy(false);
    if (ok) { thread.reload?.(); contacts.reload?.(); }
  };

  const preview = (c) => !c.last_at ? "Écrire ou appeler…"
    : (c.last_sender === me.id ? "Vous : " : "") + (c.last_kind === "voice" ? "🎤 Message vocal" : c.last_body);

  let panel;
  if (!other) panel = <Empty icon="💬" text={list.length ? "Choisissez un collègue pour écrire, envoyer un vocal ou appeler" : "Vos collègues apparaîtront ici dès que vous créerez un administrateur"} />;
  else panel = (<>
    <div className="conv-thread-header">
      <div><span className="conv-tag support">{other.is_pdg ? "👑 PDG" : "Équipe"}</span><h2>{teamName(other)}</h2>
        <div className="team-sub">{teamSub(other)}</div></div>
      <div className="mp-actions">
        <button className="action-button ok" onClick={() => callAdmin({ id: other.user_id, first_name: teamName(other), last_name: "" })}>📞 Appeler</button>
        <button className="icon-button" onClick={() => setSelId(null)}>✕</button>
      </div>
    </div>
    <div className="conv-messages" ref={box} onScroll={(e) => { const b = e.currentTarget; atBottom.current = b.scrollHeight - b.scrollTop - b.clientHeight < 120; }}>
      {!thread.data ? <Loading error={thread.error} /> : msgs.length === 0
        ? <Note icon="👋">Aucun message pour l'instant. Écrivez, envoyez un vocal 🎤 ou appelez 📞 — c'est gratuit et ça reste entre vous.</Note>
        : msgs.map((m) => {
          const mine = m.sender_id === me.id;
          return (
            <div key={m.id} className={"conv-msg " + (mine ? "team" : "user")}>
              {m.kind === "voice" && m.media_url ? <audio className="conv-audio" src={m.media_url} controls preload="none" /> : m.body}
              <span className="conv-msg-when">
                {dateTime(m.created_at)}{m.edited_at ? " · modifié" : ""}{mine && m.read_at ? " · lu" : ""}
                {mine && m.kind === "text" && <button className="conv-edit" onClick={() => { setEditing(m); setText(m.body); }}>✏️ Modifier</button>}
              </span>
            </div>
          );
        })}
    </div>
    {editing && (
      <div className="conv-editing">✏️ <span>Correction de votre message</span>
        <button className="icon-button" onClick={() => { setEditing(null); setText(""); }} aria-label="Annuler">✕</button></div>
    )}
    {rec ? (
      <div className="conv-reply conv-rec">
        <button className="icon-button" onClick={cancelVoice} aria-label="Annuler">🗑️</button>
        <span className="rec-dot" /> <strong>{fmtSecs(recSecs)}</strong> <span className="conv-rec-note">Enregistrement…</span>
        <button className="primary-button" onClick={sendVoice} style={{ padding: "10px 16px", marginLeft: "auto" }}>Envoyer le vocal</button>
      </div>
    ) : (
      <div className="conv-reply">
        <input placeholder={editing ? "Corriger votre message…" : `Écrire à ${teamName(other)}…`} value={text} autoComplete="off"
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        {!editing && !text.trim() && <button className="icon-button conv-mic" onClick={recordVoice} disabled={busy} title="Message vocal">{busy ? "…" : "🎤"}</button>}
        <button className="primary-button" onClick={send} style={{ padding: "10px 16px" }}>{editing ? "Corriger" : "Envoyer"}</button>
      </div>
    )}
  </>);

  return (<>
    <ScreenTitle eyebrow="ÉQUIPE" title="Messagerie de l'équipe" />
    <Note icon="🔒" style={{ marginBottom: 14 }}>Messages, vocaux et appels entre administrateurs, directement depuis le site : gratuits, sans passer par un opérateur téléphonique. Ils restent séparés des discussions des utilisateurs.</Note>
    <div className="support-layout">
      <div className="reports-list">
        {!contacts.data ? <Loading error={contacts.error} /> : list.length === 0 && <p className="reports-empty">Vous êtes seul dans l'équipe pour l'instant.</p>}
        {list.map((c) => (
          <button key={c.user_id} className={"conv-row" + (c.user_id === selId ? " active" : "") + (c.is_pdg ? " pinned" : "")} onClick={() => setSelId(c.user_id)}>
            <div className="u-avatar">{c.is_pdg ? "👑" : initials(teamName(c))}</div>
            <div className="conv-main">
              <div className="conv-top"><strong>{teamName(c)}</strong>{c.is_pdg && <span className="conv-tag support">📌 Épinglé</span>}</div>
              <div className="conv-preview">{preview(c)}</div>
            </div>
            {c.unread > 0 && <span className="conv-unread">{c.unread}</span>}
          </button>
        ))}
      </div>
      <div className="conv-thread">{panel}</div>
    </div>
  </>);
}
