// Annonce à TOUS les utilisateurs (communiqué, alerte, urgence sanitaire…) : elle arrive dans la discussion
// « Service client Epsilon » de chaque personne, avec une notification sur les téléphones.
// Texte : équipe du Service client. Photo, vidéo ou document : réservé au PDG (fichiers rangés par le PDG).
import { useRef, useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad } from "../lib/admin";
import { dateTime } from "../lib/format";
import { uploadMusicFile } from "../lib/files";
import { SecurityGate } from "./common";

const APP = "https://epsilon-messenger-app.pages.dev";
const kindOf = (f) => (!f ? "text" : f.type.startsWith("image/") ? "photo" : f.type.startsWith("video/") ? "video" : "document");
const KIND = { text: "📝 Texte", photo: "🖼️ Photo", video: "🎥 Vidéo", document: "📄 Document" };

export default function SupportBroadcast() {
  const { me, can, deny, act } = useAdmin();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [gate, setGate] = useState(false);
  const [progress, setProgress] = useState(null); // « Notifications : 80 / 240 »
  const pick = useRef(null);
  const allowed = me?.isPdg || can("support.reply");
  const { data, reload } = useLoad(() => q(supabase.from("support_broadcasts").select("*").eq("archived", false).order("created_at", { ascending: false }).limit(10)));

  async function notifyAll(preview) {
    const { data: s } = await supabase.auth.getSession();
    const token = s?.session?.access_token;
    let offset = 0, sent = 0, guard = 0;
    while (offset != null && guard++ < 500) {
      const r = await fetch(`${APP}/api/push`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ kind: "broadcast", preview, offset }) });
      if (!r.ok) { setProgress(`Notifications : erreur ${r.status} ${(await r.text()).slice(0, 120)}`); break; }
      const j = await r.json();
      sent += j.sent || 0;
      setProgress(`Notifications envoyées : ${sent}${j.total ? ` / ${j.total}` : ""}${j.error ? ` — erreur : ${j.error}` : ""}${j.reason ? ` — ${j.reason}` : ""}`);
      offset = j.next;
    }
    return sent;
  }

  const ask = () => {
    if (!allowed) return deny("support.reply");
    if (!text.trim() && !file) return act(async () => { throw new Error("Écrivez le message ou choisissez un fichier."); });
    if (file && !me?.isPdg) return act(async () => { throw new Error("Les photos, vidéos et documents sont réservés au PDG. Envoyez un texte."); });
    setGate(true);
  };
  const send = async () => {
    setGate(false);
    await act(async () => {
      setProgress("Envoi du fichier…");
      const media_url = file ? await uploadMusicFile(file, "annonces") : null;
      await q(supabase.from("support_broadcasts").insert({ kind: kindOf(file), body: text.trim() || null, media_url, file_name: file?.name || null }));
      setProgress("Annonce publiée. Envoi des notifications…");
      await notifyAll(text.trim() || (file ? KIND[kindOf(file)] : ""));
      setText(""); setFile(null); setOpen(false); reload?.();
    }, "📢 Annonce envoyée : elle est dans la discussion « Service client Epsilon » de tous les utilisateurs.");
    setTimeout(() => setProgress(null), 60000);
  };
  // Deux façons de retirer : seulement de cette liste, ou de la discussion de TOUS les utilisateurs
  const [delAsk, setDelAsk] = useState(null);
  const removeFor = (b, forAll) => act(async () => {
    const { data: n, error: e } = await supabase.rpc("eg_broadcast_remove", { p_id: b.id, p_for_all: forAll });
    if (e) throw new Error(/function|schema cache/i.test(e.message) ? "Exécutez d'abord le fichier SQL 27 (retirer les annonces) dans Supabase." : e.message);
    if (!n) throw new Error("Rien n'a été retiré (annonce introuvable ou droits insuffisants).");
    setDelAsk(null); reload?.();
  }, forAll ? "🗑️ Annonce supprimée de la discussion de tous les utilisateurs." : "Annonce masquée de cette liste (les utilisateurs la gardent).");

  return (
    <div className="ver-form" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 14, flex: 1 }}>📢 Annonce à tous les utilisateurs</strong>
        <button className="action-button primary" onClick={() => (allowed ? setOpen(!open) : deny("support.reply"))}>{open ? "Fermer" : "＋ Nouvelle annonce"}</button>
      </div>
      <span className="field-hint">Communiqué, alerte, urgence sanitaire… L'annonce arrive dans la discussion <b>« Service client Epsilon »</b> de <b>chaque utilisateur</b>, avec une notification. Les conversations privées ne sont pas touchées.</span>
      {open && (<>
        <textarea rows={4} maxLength={2000} placeholder="Votre message à tous les utilisateurs" value={text} onChange={(e) => setText(e.target.value)} />
        {me?.isPdg && <>
          <button className="action-button neutral" onClick={() => pick.current?.click()}>📎 {file ? `${KIND[kindOf(file)]} : ${file.name}` : "Joindre une photo, une vidéo ou un document (facultatif)"}</button>
          <input ref={pick} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" style={{ display: "none" }} onChange={(e) => { setFile(e.target.files?.[0] || null); e.target.value = ""; }} />
          {file && <button className="action-button neutral" onClick={() => setFile(null)}>Retirer le fichier</button>}
        </>}
        <div className="mp-actions"><button className="action-button primary" onClick={ask}>📢 Envoyer à tous</button></div>
      </>)}
      {progress && <span className="field-hint"><b>{progress}</b></span>}
      {(data || []).map((b) => (
        <div key={b.id} className="field-hint" style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 6 }}>
          <span style={{ flex: 1 }}>{KIND[b.kind]} · {b.body ? b.body.slice(0, 80) : b.file_name || ""} · {dateTime(b.created_at)}</span>
          <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <button className="action-button neutral" onClick={() => removeFor(b, false)}>Masquer du site</button>
            <button className="action-button danger" onClick={() => setDelAsk(b)}>🗑️ Supprimer pour tous</button>
          </div>
        </div>
      ))}
      {delAsk && <SecurityGate title={`Supprimer cette annonce de la discussion de TOUS les utilisateurs`} onConfirm={() => removeFor(delAsk, true)} onCancel={() => setDelAsk(null)} />}
      {gate && <SecurityGate title={`Envoyer cette annonce à TOUS les utilisateurs d'Epsilon`} onConfirm={send} onCancel={() => setGate(false)} />}
    </div>
  );
}
