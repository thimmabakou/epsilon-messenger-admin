// Sonneries Epsilon : la sonnerie qui retentit chez la personne qu'on appelle (et le son des nouveaux messages).
// La sonnerie « par défaut » est celle de tout le monde ; chaque utilisateur peut en choisir une autre
// parmi celles proposées ici (Paramètres de l'application).
// Réservé au PDG : chaque ajout, changement ou suppression demande le code de sécurité du PDG.
import { useRef, useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly } from "../lib/format";
import { Empty, Note, ScreenTitle, SecurityGate } from "../components/common";

const AUDIO_TYPES = "audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/wav,audio/webm,.mp3,.m4a,.aac,.ogg,.wav";
const KINDS = { call: "📞 Sonnerie d'appel", message: "💬 Son de message" };

function audioDuration(file) {
  return new Promise((resolve) => {
    const a = document.createElement("audio");
    const url = URL.createObjectURL(file);
    a.preload = "metadata";
    a.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(Number.isFinite(a.duration) ? a.duration : null); };
    a.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    a.src = url;
  });
}

async function upload(file) {
  const ext = (file.name.match(/\.(\w{2,4})$/)?.[1] || "bin").toLowerCase();
  const path = `ringtones/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage.from("music").upload(path, file, { contentType: file.type || undefined });
  if (error) throw new Error(/mime|type/i.test(error.message) ? "Format de fichier non accepté." : /size|large/i.test(error.message) ? "Fichier trop lourd (20 Mo maximum)." : error.message);
  return supabase.storage.from("music").getPublicUrl(path).data.publicUrl;
}

const fmtDur = (s) => (s ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : "—");

export default function Ringtones() {
  const { me, deny, act } = useAdmin();
  const [gate, setGate] = useState(null);
  const [form, setForm] = useState({ title: "", kind: "call", audio: null, isDefault: false });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const audioIn = useRef(null);

  const { data, error, reload } = useLoad(() => q(supabase.from("ringtones").select("*").order("created_at", { ascending: false })));
  const rows = data || [];
  const allowed = !!me?.isPdg;
  const protect = (title, run) => (allowed ? setGate({ title, run: async () => { setGate(null); await run(); reload?.(); } }) : deny("PDG"));

  const add = () => {
    if (!allowed) return deny("PDG");
    if (!form.title.trim() || !form.audio) {
      return act(async () => { throw new Error("Indiquez le nom de la sonnerie et choisissez le fichier audio."); });
    }
    protect(`Ajouter la sonnerie « ${form.title.trim()} »`, doAdd);
  };
  const doAdd = async () => {
    setBusy(true);
    const ok = await act(async () => {
      const duration = await audioDuration(form.audio);
      const audio_url = await upload(form.audio);
      await q(supabase.from("ringtones").insert({ title: form.title.trim(), kind: form.kind, audio_url, duration, is_default: form.isDefault }));
    }, "🔔 Sonnerie ajoutée. Elle est maintenant proposée dans l'application.");
    setBusy(false);
    if (ok) { setForm({ title: "", kind: "call", audio: null, isDefault: false }); setOpen(false); }
  };

  const makeDefault = (t) => protect(`Mettre « ${t.title} » comme sonnerie par défaut`,
    () => act(() => q(supabase.from("ringtones").update({ is_default: true, active: true }).eq("id", t.id)), "⭐ C'est maintenant la sonnerie par défaut d'Epsilon."));

  const toggle = (t) => protect(t.active ? `Masquer « ${t.title} »` : `Proposer de nouveau « ${t.title} »`,
    () => act(() => q(supabase.from("ringtones").update({ active: !t.active, ...(t.active ? { is_default: false } : {}) }).eq("id", t.id)),
      t.active ? "Sonnerie masquée dans l'application." : "Sonnerie de nouveau proposée."));

  const remove = (t) => protect(`Supprimer définitivement « ${t.title} »`, () => act(async () => {
    await q(supabase.from("ringtones").delete().eq("id", t.id));
    const path = decodeURIComponent(t.audio_url.split("/music/")[1] || "");
    if (path) await supabase.storage.from("music").remove([path]);
  }, "🗑️ Sonnerie supprimée."));

  return (<>
    <ScreenTitle eyebrow="CONTENU" title="Sonneries Epsilon">
      <button className="primary-button" onClick={() => (allowed ? setOpen(!open) : deny("PDG"))}>＋ Ajouter une sonnerie</button>
    </ScreenTitle>
    <Note icon="🔔">La sonnerie <b>par défaut</b> (⭐) retentit chez la personne qu'on appelle, pour tout le monde. Chaque utilisateur peut choisir une autre sonnerie proposée ici dans ses Paramètres. S'il n'y en a aucune, l'application utilise sa petite mélodie intégrée. Choisissez un son court (10 à 30 secondes) : il est répété tant que ça sonne. 🔐 Réservé au PDG : chaque modification demande votre code de sécurité.</Note>

    {open && (
      <div className="ver-form">
        <strong style={{ fontSize: 14 }}>Nouvelle sonnerie</strong>
        <input placeholder="Nom de la sonnerie (ex. Epsilon Classique)" value={form.title} maxLength={60} onChange={(e) => setForm({ ...form, title: e.target.value })} autoComplete="off" />
        <div className="mp-actions" style={{ flexWrap: "wrap" }}>
          {Object.entries(KINDS).map(([k, label]) => (
            <button key={k} className={"action-button " + (form.kind === k ? "primary" : "neutral")} onClick={() => setForm({ ...form, kind: k })}>{label}</button>
          ))}
        </div>
        <button className="action-button neutral" onClick={() => audioIn.current?.click()}>🎧 {form.audio ? form.audio.name : "Choisir le fichier audio (MP3, M4A…)"}</button>
        <label className="field-hint" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
          ⭐ En faire la sonnerie par défaut d'Epsilon
        </label>
        <span className="field-hint">20 Mo maximum.</span>
        <div className="mp-actions">
          <button className="action-button primary" disabled={busy} onClick={add}>{busy ? "Envoi en cours…" : "💾 Ajouter la sonnerie"}</button>
          <button className="action-button neutral" onClick={() => setOpen(false)}>Annuler</button>
        </div>
        <input ref={audioIn} type="file" accept={AUDIO_TYPES} style={{ display: "none" }} onChange={(e) => { setForm({ ...form, audio: e.target.files?.[0] || null }); e.target.value = ""; }} />
      </div>
    )}

    {!data && <Loading error={error} />}
    {data && rows.length === 0 && <Empty icon="🔔" text="Aucune sonnerie pour le moment. Ajoutez la sonnerie officielle d'Epsilon." />}
    <div className="mp-section">
      {rows.map((t) => (
        <div key={t.id} className="music-row">
          <div className="music-cover">{t.kind === "call" ? "📞" : "💬"}</div>
          <div className="music-main">
            <strong>{t.is_default ? "⭐ " : ""}{t.title}</strong>
            <span className="field-hint">{KINDS[t.kind]} · {fmtDur(t.duration)} · ajoutée le {dateOnly(t.created_at)}{t.is_default ? " · par défaut" : ""}</span>
            <audio src={t.audio_url} controls preload="none" style={{ width: "100%", marginTop: 6, height: 34 }} />
          </div>
          <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <span className={"u-status " + (t.active ? "Actif" : "Suspendu")} style={{ textAlign: "center" }}>{t.active ? "Proposée" : "Masquée"}</span>
            {!t.is_default && <button className="action-button primary" onClick={() => makeDefault(t)}>⭐ Par défaut</button>}
            <button className="action-button neutral" onClick={() => toggle(t)}>{t.active ? "🙈 Masquer" : "👁️ Proposer"}</button>
            <button className="action-button danger" onClick={() => remove(t)}>🗑️ Supprimer</button>
          </div>
        </div>
      ))}
    </div>
    {gate && <SecurityGate title={gate.title} onConfirm={gate.run} onCancel={() => setGate(null)} />}
  </>);
}
