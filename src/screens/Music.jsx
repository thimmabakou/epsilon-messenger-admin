// Musiques des statuts : la bibliothèque dans laquelle les utilisateurs de l'application
// choisissent une chanson pour accompagner un statut. Seules les musiques ajoutées ici sont proposées.
// Réservé au PDG : chaque ajout, masquage ou suppression demande le code de sécurité du PDG.
import { uploadMusicFile, removeMusicFiles } from "../lib/files";
import { useRef, useState } from "react";
import { supabase, q } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly } from "../lib/format";
import { Empty, Note, ScreenTitle, SecurityGate } from "../components/common";

const AUDIO_TYPES = "audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/wav,audio/webm,.mp3,.m4a,.aac,.ogg,.wav";

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

const upload = (file, folder) => uploadMusicFile(file, folder);

const fmtDur = (s) => (s ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : "—");

export default function Music() {
  const { me, deny, act } = useAdmin();
  const [gate, setGate] = useState(null); // { title, run }
  const [form, setForm] = useState({ title: "", artist: "", audio: null, cover: null });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const audioIn = useRef(null);
  const coverIn = useRef(null);

  const { data, error } = useLoad(() => q(supabase.from("music_tracks").select("*").order("created_at", { ascending: false })));
  const tracks = data || [];
  const allowed = !!me?.isPdg;
  const protect = (title, run) => (allowed ? setGate({ title, run: async () => { setGate(null); await run(); } }) : deny("PDG"));

  const add = () => {
    if (!allowed) return deny("PDG");
    if (!form.title.trim() || !form.artist.trim() || !form.audio) {
      return act(async () => { throw new Error("Indiquez le titre, l'artiste et choisissez le fichier audio."); });
    }
    protect(`Ajouter « ${form.title.trim()} »`, doAdd);
  };
  const doAdd = async () => {
    setBusy(true);
    const ok = await act(async () => {
      const duration = await audioDuration(form.audio);
      const audio_url = await upload(form.audio, "audio");
      const cover_url = form.cover ? await upload(form.cover, "covers") : null;
      await q(supabase.from("music_tracks").insert({ title: form.title.trim(), artist: form.artist.trim(), audio_url, cover_url, duration }));
    }, "🎵 Musique ajoutée. Elle est maintenant proposée dans l'application.");
    setBusy(false);
    if (ok) { setForm({ title: "", artist: "", audio: null, cover: null }); setOpen(false); }
  };

  const toggle = (t) => protect(t.active ? `Masquer « ${t.title} »` : `Proposer de nouveau « ${t.title} »`,
    () => act(() => q(supabase.from("music_tracks").update({ active: !t.active }).eq("id", t.id)), t.active ? "Musique masquée dans l'application." : "Musique de nouveau proposée."));

  const remove = (t) => {
    protect(`Supprimer définitivement « ${t.title} »`, () => act(async () => {
      await q(supabase.from("music_tracks").delete().eq("id", t.id));
      await removeMusicFiles([t.audio_url, t.cover_url]);
    }, "🗑️ Musique supprimée."));
  };

  return (<>
    <ScreenTitle eyebrow="CONTENU" title="Musiques des statuts">
      <button className="primary-button" onClick={() => (allowed ? setOpen(!open) : deny("PDG"))}>＋ Ajouter une musique</button>
    </ScreenTitle>
    <Note icon="🎵">Les utilisateurs choisissent une de ces musiques pour accompagner un statut (photo ou texte). Ajoutez seulement des morceaux que vous avez le droit de diffuser. « Masquer » retire une musique de la liste sans la supprimer. 🔐 Réservé au PDG : chaque modification demande votre code de sécurité.</Note>

    {open && (
      <div className="ver-form">
        <strong style={{ fontSize: 14 }}>Nouvelle musique</strong>
        <input placeholder="Titre du morceau" value={form.title} maxLength={80} onChange={(e) => setForm({ ...form, title: e.target.value })} autoComplete="off" />
        <input placeholder="Artiste" value={form.artist} maxLength={80} onChange={(e) => setForm({ ...form, artist: e.target.value })} autoComplete="off" />
        <div className="mp-actions" style={{ flexWrap: "wrap" }}>
          <button className="action-button neutral" onClick={() => audioIn.current?.click()}>🎧 {form.audio ? form.audio.name : "Choisir le fichier audio (MP3, M4A…)"}</button>
          <button className="action-button neutral" onClick={() => coverIn.current?.click()}>🖼️ {form.cover ? form.cover.name : "Pochette (facultatif)"}</button>
        </div>
        <span className="field-hint">20 Mo maximum par fichier.</span>
        <div className="mp-actions">
          <button className="action-button primary" disabled={busy} onClick={add}>{busy ? "Envoi en cours…" : "💾 Ajouter à la bibliothèque"}</button>
          <button className="action-button neutral" onClick={() => setOpen(false)}>Annuler</button>
        </div>
        <input ref={audioIn} type="file" accept={AUDIO_TYPES} style={{ display: "none" }} onChange={(e) => { setForm({ ...form, audio: e.target.files?.[0] || null }); e.target.value = ""; }} />
        <input ref={coverIn} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { setForm({ ...form, cover: e.target.files?.[0] || null }); e.target.value = ""; }} />
      </div>
    )}

    {!data && <Loading error={error} />}
    {data && tracks.length === 0 && <Empty icon="🎵" text="Aucune musique pour le moment. Ajoutez votre premier morceau." />}
    <div className="mp-section">
      {tracks.map((t) => (
        <div key={t.id} className="music-row">
          {t.cover_url ? <img src={t.cover_url} alt="" className="music-cover" /> : <div className="music-cover">🎵</div>}
          <div className="music-main">
            <strong>{t.title}</strong>
            <span className="field-hint">{t.artist} · {fmtDur(t.duration)} · ajoutée le {dateOnly(t.created_at)}</span>
            <audio src={t.audio_url} controls preload="none" style={{ width: "100%", marginTop: 6, height: 34 }} />
          </div>
          <div className="mp-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <span className={"u-status " + (t.active ? "Actif" : "Suspendu")} style={{ textAlign: "center" }}>{t.active ? "Proposée" : "Masquée"}</span>
            <button className="action-button neutral" onClick={() => toggle(t)}>{t.active ? "🙈 Masquer" : "👁️ Proposer"}</button>
            <button className="action-button danger" onClick={() => remove(t)}>🗑️ Supprimer</button>
          </div>
        </div>
      ))}
    </div>
    {gate && <SecurityGate title={gate.title} onConfirm={gate.run} onCancel={() => setGate(null)} />}
  </>);
}
