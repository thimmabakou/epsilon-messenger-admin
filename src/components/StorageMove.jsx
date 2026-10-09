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
    // 2) Tous les fichiers encore rangés chez Supabase (y compris les anciens fichiers des discussions),
    //    recopiés chez Cloudflare sous le nom attendu par l'application
    let copied = 0, copyFailed = 0;
    for (let g = 0; g < 300; g++) {
      const { data: s } = await supabase.auth.getSession();
      let j;
      try {
        const r = await fetch(`${APP}/api/migrate`, { method: "POST", headers: { authorization: `Bearer ${s?.session?.access_token}`, "content-type": "application/json" }, body: JSON.stringify({ op: "storage" }) });
        j = await r.json().catch(() => ({ error: `erreur ${r.status}` }));
      } catch { j = { error: "Pas de connexion internet." }; }
      if (j.error) return setState({ running: false, done, failed, remaining, copied, copyFailed, error: j.error === "pdg" ? "Réservé au PDG." : j.error });
      copied += j.done; copyFailed = j.failed;
      setState({ running: true, done, failed, remaining, copied, copyFailed, left: j.remaining });
      if (!j.done) break; // plus rien à recopier (ou seulement des fichiers impossibles à lire)
    }
    setState({ running: false, done, failed, remaining, copied, copyFailed, finished: true });
  }

  return (
    <div className="settings-group">
      <div className="settings-field">
        <div className="settings-field-main">
          <strong>🚚 Déplacer les anciens fichiers vers Cloudflare</strong>
          <span>Photos de profil, boutiques, statuts, musiques, sonneries et anciens fichiers des discussions encore servis par Supabase (limite gratuite 5 Go/mois). Chez Cloudflare, c'est gratuit. Rien n'est effacé.</span>
        </div>
        <button className="action-button primary" disabled={state?.running} onClick={run}>{state?.running ? "En cours…" : "Déplacer"}</button>
      </div>
      {state && (
        <p className="field-hint" style={{ padding: "0 16px 12px" }}>
          {state.error ? <b style={{ color: "var(--danger, #c0392b)" }}>{state.error}</b>
            : <b>{state.finished ? "✅ Terminé" : "⏳ En cours"} : {state.done} fichier(s) déplacé(s){state.failed ? ` · ${state.failed} introuvable(s), laissé(s) tel(s) quel(s)` : ""}{state.remaining != null && !state.finished ? ` · reste ${Math.max(0, state.remaining)}` : ""}{state.copied != null ? ` · ${state.copied} autre(s) fichier(s) recopié(s)${state.left && !state.finished ? ` (reste ${state.left})` : ""}${state.copyFailed ? ` · ${state.copyFailed} impossible(s) à lire` : ""}` : ""}</b>}
        </p>
      )}
    </div>
  );
}
