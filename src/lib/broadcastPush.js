// Notifications d'une annonce à tous les téléphones (par paquets), via /api/push de l'application
import { supabase } from "./supabase";

const APP = "https://epsilon-messenger-app.pages.dev";

export async function notifyAll(preview, onProgress) {
  const { data: s } = await supabase.auth.getSession();
  const token = s?.session?.access_token;
  let offset = 0, sent = 0, guard = 0;
  while (offset != null && guard++ < 500) {
    const r = await fetch(`${APP}/api/push`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ kind: "broadcast", preview, offset }) });
    if (!r.ok) { onProgress?.(`Notifications : erreur ${r.status} ${(await r.text()).slice(0, 120)}`); break; }
    const j = await r.json();
    sent += j.sent || 0;
    onProgress?.(`Notifications envoyées : ${sent}${j.total ? ` / ${j.total}` : ""}${j.error ? ` — erreur : ${j.error}` : ""}${j.reason ? ` — ${j.reason}` : ""}`);
    offset = j.next;
  }
  return sent;
}
