// Ligne téléphonique du Service client (site ↔ application Epsilon), appels vocaux WebRTC.
// • Les utilisateurs appellent la boîte « user:support » ; tous les membres de l'équipe connectés au site
//   entendent la sonnerie, le premier qui décroche prend l'appel (les autres arrêtent de sonner).
// • L'équipe peut appeler un utilisateur : l'appel arrive dans son application comme un appel normal,
//   affiché « Service client Epsilon ».
// • Même langage que les appels de l'application (offer / answer / ringing / end…), voir src/lib/calls.js de l'app.
import { supabase } from "./supabase";

const APP = "https://epsilon-messenger-app.pages.dev";
const LINE = "support";
const ME_CARD = { id: LINE, first_name: "Service client", last_name: "Epsilon", avatar_url: "/icon-192.png" }; // l'application l'affiche depuis sa propre adresse
const RING_TIMEOUT = 45000;
const STUN = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];
const PRIVATE = { config: { private: true, broadcast: { self: false, ack: false } } };

let agent = null;          // membre de l'équipe connecté
let line = null;           // abonnement à « user:support »
let pc = null, local = null, audioEl = null;
let pending = null;        // appel entrant en attente
let timers = [];
let state = { phase: "idle" };
const listeners = new Set();
const outbox = new Map();

const set = (patch) => { state = { ...state, ...patch }; listeners.forEach((fn) => fn(state)); };
export const onLine = (fn) => { listeners.add(fn); fn(state); return () => listeners.delete(fn); };
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
const clearTimers = () => { timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); timers = []; };

async function token() { const { data } = await supabase.auth.getSession(); return data?.session?.access_token || null; }

// Envoyer dans la boîte d'un utilisateur (ou de la ligne support)
function boxSend(userId, event, payload) {
  let ch = outbox.get(userId);
  if (!ch) { ch = supabase.channel(`user:${userId}`, PRIVATE); outbox.set(userId, ch); }
  try {
    if (typeof ch.httpSend === "function") return ch.httpSend(event, payload).catch(() => {});
    return ch.send({ type: "broadcast", event, payload });
  } catch { return null; }
}
const toUser = (userId, payload) => boxSend(userId, "call", { ...payload, callId: payload.callId || state.callId, fromId: LINE });

// Prévenir l'application d'un utilisateur : nouveau message du Service client (+ notification si l'app est fermée)
export async function notifyUser(userId, preview) {
  boxSend(userId, "new", { support: true });
  push({ kind: "support", to: userId, preview });
}
async function push(body) {
  try {
    const t = await token();
    await fetch(`${APP}/api/push`, { method: "POST", headers: { authorization: `Bearer ${t}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  } catch { /* sans gravité */ }
}

async function iceServers() {
  try {
    const t = await token();
    const r = await fetch(`${APP}/api/turn`, { headers: { authorization: `Bearer ${t}` } });
    if (r.ok) { const j = await r.json(); if (j.iceServers?.length) return j.iceServers; }
  } catch { /* sans relais */ }
  return STUN;
}

// ---------- Sons (générés, pas de fichier) ----------
let ac = null, toneTimer = null;
function beep(freq, ms, vol = 0.18) {
  try {
    audioCtx();
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = freq; g.gain.value = vol; o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + ms / 1000);
  } catch { /* pas de son */ }
}
function playTone(kind) {
  stopTone();
  const once = kind === "ring" ? () => { beep(880, 350); setTimeout(() => beep(660, 350), 450); } : () => beep(440, 900, 0.08);
  once();
  toneTimer = setInterval(once, kind === "ring" ? 2200 : 3500);
}
function stopTone() { clearInterval(toneTimer); toneTimer = null; }

// ---------- Micro de l'équipe ----------
// Le micro peut être autorisé mais n'envoyer que du silence (autre application qui le tient — WhatsApp,
// appel téléphonique —, page passée en arrière-plan sur un téléphone, mauvais micro choisi…).
// On mesure donc le son capté pendant l'appel : barre de niveau + alerte si rien n'est capté,
// et on rebranche le micro automatiquement s'il s'arrête.
const MIC = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
const getMic = () => navigator.mediaDevices.getUserMedia({ audio: MIC, video: false });
let meter = null; // { src, an, timer }
function audioCtx() {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === "suspended") ac.resume().catch(() => {});
  return ac;
}
function stopMeter() {
  if (!meter) return;
  clearInterval(meter.timer);
  try { meter.src.disconnect(); } catch { /* déjà débranché */ }
  meter = null;
}
function watchMic() {
  stopMeter();
  const track = local?.getAudioTracks()[0];
  if (!track) return;
  track.onended = () => { if (["connecting", "active"].includes(state.phase)) restartMic(); };
  try {
    const ctx = audioCtx();
    const src = ctx.createMediaStreamSource(new MediaStream([track]));
    const an = ctx.createAnalyser(); an.fftSize = 512;
    src.connect(an);
    const buf = new Uint8Array(an.fftSize);
    let silentMs = 0;
    const timer = setInterval(() => {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      an.getByteTimeDomainData(buf);
      let peak = 0;
      for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
      const level = Math.min(1, peak / 50);
      const live = track.readyState === "live" && !track.muted;
      if (state.muted || state.phase !== "active") silentMs = 0;
      else silentMs = level > 0.03 && live ? 0 : silentMs + 250;
      set({ micLevel: state.muted ? 0 : level, micSilent: silentMs >= 8000 });
    }, 250);
    meter = { src, an, timer };
  } catch { /* mesure impossible : l'appel continue */ }
}
// Rebrancher le micro (bouton du site, ou automatiquement s'il s'arrête) sans couper l'appel
export async function restartMic() {
  if (!pc) return;
  try {
    const fresh = await getMic();
    const track = fresh.getAudioTracks()[0];
    const sender = pc.getSenders().find((x) => x.track?.kind === "audio" || x.track === null);
    if (sender) await sender.replaceTrack(track);
    local?.getTracks().forEach((t) => { t.onended = null; t.stop(); });
    local = fresh;
    track.enabled = !state.muted;
    watchMic();
    set({ micSilent: false });
  } catch (e) {
    set({ micError: e?.name === "NotAllowedError" ? "permission" : "error" });
  }
}
if (typeof document !== "undefined") {
  // Page revenue au premier plan : si le téléphone a coupé le micro entre-temps, on le rebranche
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || !["connecting", "active"].includes(state.phase)) return;
    const t = local?.getAudioTracks()[0];
    if (!t || t.readyState !== "live") restartMic();
    else audioCtx();
  });
}

// ---------- Connexion ----------
async function makePeer() {
  const conn = new RTCPeerConnection({ iceServers: await iceServers() });
  conn.ontrack = (e) => {
    if (!audioEl) { audioEl = new Audio(); audioEl.autoplay = true; }
    audioEl.srcObject = e.streams[0] || new MediaStream([e.track]);
    audioEl.play().catch(() => {});
  };
  conn.onconnectionstatechange = () => {
    const s = conn.connectionState;
    if (s === "connected" && state.phase !== "active") { stopTone(); set({ phase: "active", startedAt: Date.now() }); }
    if (s === "failed") finish("failed", true);
  };
  return conn;
}
function gathered(conn) {
  if (conn.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const check = () => { if (conn.iceGatheringState === "complete") { conn.removeEventListener("icegatheringstatechange", check); resolve(); } };
    conn.addEventListener("icegatheringstatechange", check);
    setTimeout(resolve, 3000);
  });
}
function cleanup() {
  clearTimers(); stopTone(); stopMeter();
  try { pc?.close(); } catch { /* déjà fermé */ }
  pc = null;
  local?.getTracks().forEach((t) => { t.onended = null; t.stop(); }); local = null;
  if (audioEl) audioEl.srcObject = null;
  pending = null;
}
function logCall() {
  if (!state.user?.id || !state.startedAt) return;
  supabase.rpc("eg_support_call_log", {
    p_user: state.user.id, p_started: new Date(state.startedAt).toISOString(),
    p_duration: Math.round((Date.now() - state.startedAt) / 1000), p_missed: false,
  }).then(() => {}, () => {});
}
function finish(reason, notify) {
  if (state.phase === "idle" || state.phase === "ended") return;
  if (notify && state.user?.id) toUser(state.user.id, { type: "end", reason });
  logCall();
  cleanup();
  set({ phase: "ended", reason });
  setTimeout(() => { if (state.phase === "ended") set({ phase: "idle", user: null, callId: null, reason: null, startedAt: null }); }, 2000);
}

// ---------- Actions de l'équipe ----------
export function startLine(me) {
  if (line && agent?.id === me.id) return () => {};
  agent = me;
  line = supabase.channel(`user:${LINE}`, PRIVATE)
    .on("broadcast", { event: "call" }, ({ payload }) => onSignal(payload))
    .on("broadcast", { event: "new" }, () => window.dispatchEvent(new Event("epsilon-support-new")))
    .subscribe();
  return () => { if (line) supabase.removeChannel(line); line = null; };
}

// Appeler un utilisateur depuis le site
export async function callUser(user) {
  if (state.phase !== "idle") return;
  const callId = newId();
  set({ phase: "outgoing", direction: "out", callId, user, ringing: false, muted: false, startedAt: null, reason: null, micLevel: 0, micSilent: false, micError: null });
  audioCtx(); // créé au moment du clic (sinon le téléphone peut bloquer le son)
  try {
    local = await getMic();
    pc = await makePeer();
    local.getTracks().forEach((t) => pc.addTrack(t, local));
    watchMic();
    await pc.setLocalDescription(await pc.createOffer());
    await gathered(pc);
    if (state.callId !== callId) return;
    playTone("back");
    const offer = { type: "offer", callId, video: false, sdp: pc.localDescription.sdp, from: ME_CARD };
    toUser(user.id, offer);
    push({ kind: "support_call", to: user.id, callId });
    const again = setInterval(() => {
      if (state.callId !== callId || state.phase !== "outgoing") { clearInterval(again); return; }
      if (!state.ringing) toUser(user.id, offer);
    }, 4000);
    timers.push(again);
    later(() => { if (state.callId === callId && state.phase === "outgoing") finish("missed", true); }, RING_TIMEOUT);
  } catch (e) {
    finish(e?.name === "NotAllowedError" ? "permission" : "error", true);
  }
}

export async function acceptLine() {
  if (state.phase !== "incoming" || !pending) return;
  const offer = pending;
  stopTone(); clearTimers();
  set({ phase: "connecting", micLevel: 0, micSilent: false, micError: null });
  audioCtx();
  boxSend(LINE, "call", { type: "taken", callId: offer.callId, by: agent?.name || "" }); // les collègues arrêtent de sonner
  try {
    local = await getMic();
    pc = await makePeer();
    local.getTracks().forEach((t) => pc.addTrack(t, local));
    watchMic();
    await pc.setRemoteDescription({ type: "offer", sdp: offer.sdp });
    await pc.setLocalDescription(await pc.createAnswer());
    await gathered(pc);
    toUser(state.user.id, { type: "answer", sdp: pc.localDescription.sdp });
    later(() => { if (state.phase === "connecting") finish("failed", true); }, 30000);
  } catch (e) {
    finish(e?.name === "NotAllowedError" ? "permission" : "error", true);
  }
}

// Ne pas répondre (les collègues peuvent encore décrocher)
export function ignoreLine() {
  if (state.phase !== "incoming") return;
  cleanup();
  set({ phase: "idle", user: null, callId: null, ignored: state.callId });
}

export function hangUpLine() {
  if (state.phase === "outgoing") { finish("cancelled", true); return; }
  finish("ended", true);
}

export function toggleLineMute() {
  const on = !state.muted;
  local?.getAudioTracks().forEach((t) => { t.enabled = !on; });
  set({ muted: on });
}

// ---------- Signaux reçus ----------
async function onSignal(p) {
  if (!p || !p.type) return;
  if (p.type === "taken") {
    if (state.phase === "incoming" && p.callId === state.callId) { cleanup(); set({ phase: "idle", user: null, callId: null, takenBy: p.by }); }
    return;
  }
  if (p.type === "offer") {
    if (p.callId === state.callId || p.callId === state.ignored) {
      if (state.phase === "incoming") toUser(p.fromId, { type: "ringing", callId: p.callId });
      return;
    }
    if (state.phase !== "idle") return; // occupé : un collègue peut répondre
    pending = p;
    const u = p.from || { id: p.fromId };
    set({ phase: "incoming", direction: "in", callId: p.callId, user: { id: p.fromId, first_name: u.first_name, last_name: u.last_name, phone: u.phone }, muted: false, startedAt: null, reason: null });
    toUser(p.fromId, { type: "ringing", callId: p.callId });
    playTone("ring");
    later(() => { if (state.phase === "incoming" && state.callId === p.callId) { cleanup(); set({ phase: "idle", user: null, callId: null }); } }, RING_TIMEOUT + 5000);
    return;
  }
  if (p.callId !== state.callId) return;
  switch (p.type) {
    case "ringing": if (state.phase === "outgoing") set({ ringing: true }); break;
    case "answer":
      if (state.phase === "outgoing" && pc) {
        clearTimers(); stopTone(); set({ phase: "connecting" });
        try { await pc.setRemoteDescription({ type: "answer", sdp: p.sdp }); } catch { finish("error", true); return; }
        later(() => { if (state.phase === "connecting") finish("failed", true); }, 30000);
      }
      break;
    case "decline": finish("declined", false); break;
    case "busy": finish("busy", false); break;
    case "end":
      if (state.phase === "incoming") { cleanup(); set({ phase: "idle", user: null, callId: null }); }
      else finish("ended", false);
      break;
    default: break;
  }
}
