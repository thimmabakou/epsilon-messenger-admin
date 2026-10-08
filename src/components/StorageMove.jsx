// Déplacer les anciens fichiers de Supabase vers Cloudflare R2 (PDG) : photos de profil, boutiques,
// statuts, musiques, sonneries. Supabase gratuit = 5 Go d'envoi par mois ; Cloudflare R2 = gratuit.
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdmin } from "../lib/admin";

const APP = "https://epsilon-messenger-app.pages.dev";

export default function StorageMove() {
  const { me } = useAdmin();
  const [state, setState] = useState(null); // { running, done, failed, remaining, error, finished }
  if (!me?.isPdg) return null;

  async function run() {
    let done = 0, failed = 0, guard = 0, remaining = null;
    setState({ running: true, done, failed, remaining });
    while (guard++ < 400) {
      const { data: s } = await supabase.auth.getSession();
      let j;
      try {
        const r = await fetch(`${APP}/api/migrate`, { method: "POST", headers: { authorization: `Bearer ${s?.session?.access_token}`, "content-type": "application/json" }, body: JSON.stringify({ skip: failed }) });
        j = await r.json().catch(() => ({ error: `erreur ${r.status}` }));
      } catch { j = { error: "Pas de connexion internet." }; }
      if (j.error) {
        const msg = j.error === "sql29" ? "Exécutez d'abord le fichier SQL 29 (déplacer les fichiers) dans Supabase." : j.error === "pdg" ? "Réservé au PDG." : j.error;
        return setState({ running: false, done, failed, remaining, error: msg });
      }
      done += j.done; failed += j.failed; remaining = j.remaining;
      setState({ running: true, done, failed, remaining });
      if (!j.done && !j.failed) break; // plus rien à déplacer
      if (remaining - failed <= 0) break;
    }
    setState({ running: false, done, failed, remaining, finished: true });
  }

  return (
    <div className="settings-group">
      <div className="settings-field">
        <div className="settings-field-main">
          <strong>🚚 Déplacer les anciens fichiers vers Cloudflare</strong>
          <span>Photos de profil, boutiques, statuts, musiques et sonneries encore servis par Supabase (limite gratuite 5 Go/mois). Chez Cloudflare, c'est gratuit. Rien n'est effacé.</span>
        </div>
        <button className="action-button primary" disabled={state?.running} onClick={run}>{state?.running ? "En cours…" : "Déplacer"}</button>
      </div>
      {state && (
        <p className="field-hint" style={{ padding: "0 16px 12px" }}>
          {state.error ? <b style={{ color: "var(--danger, #c0392b)" }}>{state.error}</b>
            : <b>{state.finished ? "✅ Terminé" : "⏳ En cours"} : {state.done} fichier(s) déplacé(s){state.failed ? ` · ${state.failed} introuvable(s), laissé(s) tel(s) quel(s)` : ""}{state.remaining != null && !state.finished ? ` · reste ${Math.max(0, state.remaining)}` : ""}</b>}
        </p>
      )}
    </div>
  );
}
