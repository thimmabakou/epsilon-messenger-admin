// Sonneries Epsilon : la sonnerie qui retentit chez la personne qu'on appelle (et le son des nouveaux messages).
// La sonnerie « par défaut » est celle de tout le monde ; chaque utilisateur peut en choisir une autre
// parmi celles proposées ici (Paramètres de l'application).
// Réservé au PDG : chaque ajout, changement ou suppression demande le code de sécurité du PDG.
import { useEffect, useRef, useState } from "react";
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
  const { error } = await supabase.storage.from("music").upload(path, file, { cacheControl: "31536000", contentType: file.type || undefined });
  if (error) throw new Error(/mime|type/i.test(error.message) ? "Format de fichier non accepté." : /size|large/i.test(error.message) ? "Fichier trop lourd (20 Mo maximum)." : error.message);
  return supabase.storage.from("music").getPublicUrl(path).data.publicUrl;
}

// ---------- Découpage d'un extrait (pour faire une sonnerie à partir d'une chanson entière) ----------
const LENGTHS = [15, 20, 30];
const RATE = 22050; // mono 22 kHz : 30 s ≈ 1,3 Mo, largement suffisant pour une sonnerie

async function cutExtract(file, start, len) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  let buf;
  try { buf = await ctx.decodeAudioData(await file.arrayBuffer()); } finally { ctx.close?.(); }
  const end = Math.min(buf.duration, start + len);
  const frames = Math.max(1, Math.floor((end - start) * RATE));
  const off = new OfflineAudioContext(1, frames, RATE);
  const src = off.createBufferSource();
  src.buffer = buf;
  const g = off.createGain();
  const d = end - start;
  const fadeIn = Math.min(0.4, d / 4), fadeOut = Math.min(1.5, d / 3);
  g.gain.setValueAtTime(0, 0);
  g.gain.linearRampToValueAtTime(1, fadeIn);
  g.gain.setValueAtTime(1, d - fadeOut);
  g.gain.linearRampToValueAtTime(0, d);
  src.connect(g).connect(off.destination);
  src.start(0, start, d);
  const out = await off.startRendering();
  const pcm = out.getChannelData(0);
  const wav = new DataView(new ArrayBuffer(44 + pcm.length * 2));
  const str = (o, t) => [...t].forEach((c, i) => wav.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF"); wav.setUint32(4, 36 + pcm.length * 2, true); str(8, "WAVE"); str(12, "fmt ");
  wav.setUint32(16, 16, true); wav.setUint16(20, 1, true); wav.setUint16(22, 1, true);
  wav.setUint32(24, RATE, true); wav.setUint32(28, RATE * 2, true); wav.setUint16(32, 2, true); wav.setUint16(34, 16, true);
  str(36, "data"); wav.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) wav.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i])) * 0x7fff, true);
  return { file: new File([wav], "sonnerie.wav", { type: "audio/wav" }), duration: d };
}

const fmtT = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Trimmer({ file, value, onChange }) {
  const ref = useRef(null);
  const timer = useRef(null);
  const [url, setUrl] = useState(null);
  const [total, setTotal] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { const u = URL.createObjectURL(file); setUrl(u); return () => URL.revokeObjectURL(u); }, [file]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const { start, len } = value;
  const maxStart = Math.max(0, total - len);
  const set = (v) => onChange({ ...value, ...v });
  const preview = () => {
    const a = ref.current; if (!a) return;
    clearTimeout(timer.current);
    if (playing) { a.pause(); setPlaying(false); return; }
    a.currentTime = start; a.play(); setPlaying(true);
    timer.current = setTimeout(() => { a.pause(); setPlaying(false); }, len * 1000);
  };
  if (total && total <= LENGTHS[0] + 1) return <span className="field-hint">✅ Ce son dure {fmtT(total)} : il sera utilisé tel quel.</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 10, borderRadius: 10, background: "rgba(200,107,224,.08)" }}>
      <strong style={{ fontSize: 13 }}>✂️ Choisir le passage de la chanson</strong>
      <span className="field-hint">Écoutez la chanson ci-dessous. Au bon moment (le refrain par exemple), mettez sur pause puis touchez « Commencer ici ».</span>
      {url && <audio ref={ref} src={url} controls preload="metadata" style={{ width: "100%", height: 34 }}
        onLoadedMetadata={(e) => setTotal(e.target.duration || 0)} onPause={() => setPlaying(false)} />}
      <button className="action-button neutral" onClick={() => { const t = ref.current?.currentTime || 0; set({ start: Math.min(t, maxStart) }); }}>📍 Commencer ici ({fmtT(ref.current?.currentTime || 0)})</button>
      {total > 0 && <>
        <span className="field-hint">Début : <b>{fmtT(start)}</b> → fin : <b>{fmtT(Math.min(total, start + len))}</b> (chanson de {fmtT(total)})</span>
        <input type="range" min={0} max={maxStart} step={0.5} value={Math.min(start, maxStart)} onChange={(e) => set({ start: Number(e.target.value) })} />
      </>}
      <div className="mp-actions" style={{ flexWrap: "wrap" }}>
        {LENGTHS.map((n) => (
          <button key={n} className={"action-button " + (len === n ? "primary" : "neutral")} onClick={() => set({ len: n })}>{n} s</button>
        ))}
      </div>
      <button className="action-button primary" onClick={preview}>{playing ? "⏸ Arrêter" : "▶ Écouter l'extrait"}</button>
    </div>
  );
}

const fmtDur = (s) => (s ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : "—");

export default function Ringtones() {
  const { me, deny, act } = useAdmin();
  const [gate, setGate] = useState(null);
  const [form, setForm] = useState({ title: "", kind: "call", audio: null, isDefault: false });
  const [cut, setCut] = useState({ start: 0, len: 20 });
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
      let file = form.audio;
      let duration = await audioDuration(file);
      if (!duration || duration > LENGTHS[0] + 1) {
        try {
          const r = await cutExtract(file, cut.start, cut.len);
          file = r.file; duration = r.duration;
        } catch {
          throw new Error("Impossible de découper ce fichier sur cet appareil. Essayez un autre fichier MP3.");
        }
      }
      const audio_url = await upload(file);
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
    <Note icon="🔔">La sonnerie <b>par défaut</b> (⭐) retentit chez la personne qu'on appelle, pour tout le monde. Chaque utilisateur peut choisir une autre sonnerie proposée ici dans ses Paramètres. S'il n'y en a aucune, l'application utilise sa petite mélodie intégrée. Vous pouvez choisir une chanson entière : vous choisissez ensuite le passage (15, 20 ou 30 secondes), et seul cet extrait est enregistré. Il est répété tant que ça sonne. 🔐 Réservé au PDG : chaque modification demande votre code de sécurité.</Note>

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
        {form.audio && <Trimmer key={form.audio.name + form.audio.size} file={form.audio} value={cut} onChange={setCut} />}
        <label className="field-hint" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
          ⭐ En faire la sonnerie par défaut d'Epsilon
        </label>
        <span className="field-hint">20 Mo maximum.</span>
        <div className="mp-actions">
          <button className="action-button primary" disabled={busy} onClick={add}>{busy ? "Envoi en cours…" : "💾 Ajouter la sonnerie"}</button>
          <button className="action-button neutral" onClick={() => setOpen(false)}>Annuler</button>
        </div>
        <input ref={audioIn} type="file" accept={AUDIO_TYPES} style={{ display: "none" }} onChange={(e) => { setForm({ ...form, audio: e.target.files?.[0] || null }); setCut({ start: 0, len: 20 }); e.target.value = ""; }} />
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
