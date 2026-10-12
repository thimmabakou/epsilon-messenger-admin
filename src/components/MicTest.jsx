// « Tester mon micro » (avant un appel) : on parle 4 secondes, la barre montre le son capté, puis on réécoute.
// Permet de savoir tout de suite si le micro est refusé, occupé par une autre application, ou muet.
import { useRef, useState } from "react";

export default function MicTest() {
  const [st, setSt] = useState(null); // { step: "rec"|"play"|"done"|"err", level, msg, url, heard }
  const stop = useRef(null);
  const run = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e) {
      setSt({ step: "err", msg: e?.name === "NotAllowedError"
        ? "Micro refusé. Touchez le cadenas 🔒 à gauche de l'adresse du site → Autorisations → Micro → Autoriser. Sur téléphone, vérifiez aussi : Paramètres du téléphone → Applications → Chrome → Autorisations → Micro."
        : e?.name === "NotReadableError" ? "Le micro est occupé par une autre application (WhatsApp, appel en cours, application Epsilon…). Fermez-la, puis réessayez."
        : "Aucun micro utilisable n'a été trouvé sur cet appareil." });
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const an = ctx.createAnalyser(); an.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize);
    let max = 0;
    const chunks = [];
    let rec = null;
    try { rec = new MediaRecorder(stream); rec.ondataavailable = (e) => e.data.size && chunks.push(e.data); rec.start(); } catch { rec = null; }
    setSt({ step: "rec", level: 0 });
    const timer = setInterval(() => {
      an.getByteTimeDomainData(buf);
      let peak = 0;
      for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
      const level = Math.min(1, peak / 50);
      max = Math.max(max, level);
      setSt((s) => (s?.step === "rec" ? { ...s, level } : s));
    }, 100);
    stop.current = async () => {
      clearInterval(timer);
      await new Promise((r) => { if (rec && rec.state !== "inactive") { rec.onstop = r; rec.stop(); } else r(); });
      stream.getTracks().forEach((t) => t.stop());
      ctx.close().catch(() => {});
      const url = chunks.length ? URL.createObjectURL(new Blob(chunks, { type: rec?.mimeType || "audio/webm" })) : null;
      setSt({ step: "done", heard: max > 0.06, url });
    };
    setTimeout(() => stop.current?.(), 4000);
  };
  return (
    <div className="mic-test">
      <button className="action-button neutral" disabled={st?.step === "rec"} onClick={run}>🎙️ {st?.step === "rec" ? "Parlez maintenant…" : "Tester mon micro"}</button>
      {st?.step === "rec" && <div className="sp-meter mic-test-bar"><i style={{ width: `${Math.round((st.level || 0) * 100)}%` }} /></div>}
      {st?.step === "done" && (
        <div className={"mic-test-res " + (st.heard ? "ok" : "bad")}>
          {st.heard ? "✅ Votre micro capte bien votre voix. Réécoutez-vous :" : "⚠️ Le micro est autorisé mais ne capte presque rien. Un autre logiciel l'utilise peut-être (WhatsApp, appel, application Epsilon), ou ce n'est pas le bon micro (écouteurs Bluetooth). Fermez les autres applications et réessayez."}
          {st.url && <audio src={st.url} controls style={{ width: "100%", marginTop: 6 }} />}
        </div>
      )}
      {st?.step === "err" && <div className="mic-test-res bad">⚠️ {st.msg}</div>}
    </div>
  );
}
