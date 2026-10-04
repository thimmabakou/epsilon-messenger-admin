// Statut du Service client : annonce affichée EN TÊTE des statuts de tous les utilisateurs pendant 24 h
// (impossible à masquer ou à mettre en sourdine dans l'application).
import { useRef, useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad } from "../lib/admin";
import { dateTime } from "../lib/format";
import { uploadMusicFile } from "../lib/files";

const COLORS = ["#7A3B8C", "#C2338F", "#1E8A4C", "#2563EB", "#D97706", "#1F1330"];

export default function SupportStatus() {
  const { me, can, deny, act } = useAdmin();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [photo, setPhoto] = useState(null);
  const pick = useRef(null);
  const allowed = me?.isPdg || can("support.reply");
  const { data, reload } = useLoad(() => q(supabase.from("support_statuses").select("*").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false })));
  const live = data || [];

  const publish = () => {
    if (!allowed) return deny("support.reply");
    act(async () => {
      if (!text.trim() && !photo) throw new Error("Écrivez un texte ou choisissez une photo.");
      const media_url = photo ? await uploadMusicFile(photo, "support-status") : null;
      await q(supabase.from("support_statuses").insert({ kind: photo ? "photo" : "text", body: text.trim() || null, bg_color: color, media_url }));
      setText(""); setPhoto(null); setOpen(false); reload?.();
    }, "📢 Statut publié : il s'affiche en tête chez tous les utilisateurs pendant 24 h.");
  };
  const remove = (s) => act(async () => { await q(supabase.from("support_statuses").delete().eq("id", s.id)); reload?.(); }, "Statut retiré.");

  return (
    <div className="ver-form" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 14, flex: 1 }}>📢 Statut du Service client ({live.length} en ligne)</strong>
        <button className="action-button primary" onClick={() => (allowed ? setOpen(!open) : deny("support.reply"))}>{open ? "Fermer" : "＋ Publier un statut"}</button>
      </div>
      <span className="field-hint">Affiché en tête des statuts de <b>tous les utilisateurs</b> pendant 24 h. Ils ne peuvent ni le masquer ni le mettre en sourdine.</span>
      {open && (<>
        <textarea rows={3} maxLength={500} placeholder="Votre annonce (ex. Maintenance ce soir de 22 h à 23 h)" value={text} onChange={(e) => setText(e.target.value)} />
        <div style={{ display: "flex", gap: 8 }}>
          {COLORS.map((c) => <button key={c} onClick={() => setColor(c)} aria-label={c} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: c === color ? "3px solid var(--rose)" : "2px solid var(--border)", cursor: "pointer" }} />)}
        </div>
        {me?.isPdg && <>
          <button className="action-button neutral" onClick={() => pick.current?.click()}>🖼️ {photo ? photo.name : "Ajouter une photo (facultatif)"}</button>
          <input ref={pick} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { setPhoto(e.target.files?.[0] || null); e.target.value = ""; }} />
        </>}
        <div style={{ background: color, color: "#fff", borderRadius: 12, padding: 16, textAlign: "center", fontWeight: 600, minHeight: 50 }}>{text || "Aperçu"}</div>
        <div className="mp-actions"><button className="action-button primary" onClick={publish}>📢 Publier</button></div>
      </>)}
      {live.map((s) => (
        <div key={s.id} className="field-hint" style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: s.bg_color || "#7A3B8C", flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{s.kind === "photo" ? "🖼️ " : ""}{s.body || "(photo)"} · jusqu'au {dateTime(s.expires_at)}</span>
          <button className="action-button danger" onClick={() => remove(s)}>Retirer</button>
        </div>
      ))}
    </div>
  );
}
