// Messages vocaux du site : enregistrement au micro, puis envoi du fichier chez Cloudflare R2
// (epsilon-messenger-app.pages.dev/api/upload, dossier « support »), servi depuis /media/support/…
import { supabase } from "./supabase";

const APP = "https://epsilon-messenger-app.pages.dev";

export async function startVoice() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const type = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"].find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";
  const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
  const chunks = [];
  const started = Date.now();
  rec.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
  rec.start(250);
  const stopTracks = () => stream.getTracks().forEach((t) => t.stop());
  return {
    started,
    // Arrête et renvoie l'enregistrement { blob, ext, mime, duration }
    stop: () => new Promise((resolve) => {
      rec.onstop = () => {
        stopTracks();
        const mime = (rec.mimeType || type || "audio/webm").split(";")[0];
        const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
        resolve({ blob: new Blob(chunks, { type: mime }), ext, mime, duration: Math.round((Date.now() - started) / 1000) });
      };
      if (rec.state !== "inactive") rec.stop(); else rec.onstop();
    }),
    cancel: () => { try { rec.onstop = null; if (rec.state !== "inactive") rec.stop(); } catch { /* déjà arrêté */ } stopTracks(); },
  };
}

export async function uploadVoice({ blob, ext, mime }) {
  const { data } = await supabase.auth.getSession();
  const r = await fetch(`${APP}/api/upload?bucket=support&ext=${ext}`, {
    method: "POST", headers: { authorization: `Bearer ${data?.session?.access_token || ""}`, "content-type": mime }, body: blob,
  });
  if (!r.ok) throw new Error(r.status === 400 ? "Le serveur de l'application n'est pas encore à jour. Réessayez dans quelques minutes." : "Envoi du vocal impossible. Réessayez.");
  const j = await r.json();
  if (!j.url) throw new Error("Envoi du vocal impossible. Réessayez.");
  return j.url;
}

export const fmtSecs = (s) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, "0")}`;
