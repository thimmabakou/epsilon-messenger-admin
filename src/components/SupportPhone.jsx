// Téléphone du Service client, visible sur toutes les pages du site :
// appel entrant (sonnerie + Décrocher / Ignorer), appel en cours (durée, Micro, Raccrocher).
import { useEffect, useState } from "react";
import { onLine, startLine, acceptLine, ignoreLine, hangUpLine, toggleLineMute } from "../lib/supportLine";

const name = (u) => [u?.first_name, u?.last_name].filter(Boolean).join(" ") || "Utilisateur Epsilon";
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const REASONS = { declined: "Appel refusé", busy: "Occupé", missed: "Pas de réponse", failed: "Connexion impossible", permission: "Micro refusé par le navigateur", error: "Erreur", cancelled: "Appel annulé", ended: "Appel terminé" };

export default function SupportPhone({ me }) {
  const [s, setS] = useState({ phase: "idle" });
  const [, tick] = useState(0);
  useEffect(() => startLine(me), [me]);
  useEffect(() => onLine(setS), []);
  useEffect(() => {
    if (s.phase !== "active") return undefined;
    const t = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [s.phase]);

  if (s.phase === "idle") return null;
  const secs = s.startedAt ? Math.floor((Date.now() - s.startedAt) / 1000) : 0;
  const label = s.phase === "incoming" ? "📞 Appel entrant — Service client"
    : s.phase === "outgoing" ? (s.ringing ? "Ça sonne…" : "Appel en cours…")
    : s.phase === "connecting" ? "Connexion…"
    : s.phase === "active" ? `En communication · ${mmss(secs)}`
    : REASONS[s.reason] || "Appel terminé";

  return (
    <div className={"support-phone" + (s.phase === "incoming" ? " ringing" : "")}>
      <div className="sp-avatar">🎧</div>
      <div className="sp-main">
        <strong>{name(s.user)}</strong>
        <span>{label}</span>
      </div>
      <div className="sp-actions">
        {s.phase === "incoming" && <>
          <button className="sp-btn ok" onClick={acceptLine}>Décrocher</button>
          <button className="sp-btn" onClick={ignoreLine}>Ignorer</button>
        </>}
        {(s.phase === "active" || s.phase === "connecting") && (
          <button className="sp-btn" onClick={toggleLineMute}>{s.muted ? "🎙️ Réactiver" : "🔇 Micro"}</button>
        )}
        {(s.phase === "outgoing" || s.phase === "connecting" || s.phase === "active") && (
          <button className="sp-btn bad" onClick={hangUpLine}>Raccrocher</button>
        )}
      </div>
    </div>
  );
}
