// Musiques et sonneries : rangées chez Cloudflare R2 par le serveur de l'application Epsilon
// (epsilon-messenger-app.pages.dev/api/upload, réservé au PDG), servies gratuitement depuis /media/…
// Si R2 n'est pas disponible, on range comme avant dans Supabase (espace « music »).
import { supabase } from "./supabase";

const APP = "https://epsilon-messenger-app.pages.dev";
const isR2 = (u) => String(u || "").startsWith(`${APP}/media/`);

async function token() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

export async function uploadMusicFile(file, folder) {
  const ext = (file.name?.match(/\.(\w{2,4})$/)?.[1] || "bin").toLowerCase();
  const type = file.type || "application/octet-stream";
  try {
    const r = await fetch(`${APP}/api/upload?bucket=music&ext=${ext}`, {
      method: "POST", headers: { authorization: `Bearer ${await token()}`, "content-type": type }, body: file,
    });
    if (r.ok) { const j = await r.json(); if (j.url) return j.url; }
    if (r.status === 413) throw new Error("Fichier trop lourd (60 Mo maximum).");
    if (r.status === 403) throw new Error("Réservé au PDG.");
  } catch (e) { if (/Mo maximum|PDG/.test(e.message)) throw e; /* sinon : Supabase */ }
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage.from("music").upload(path, file, { cacheControl: "31536000", contentType: file.type || undefined });
  if (error) throw new Error(/mime|type/i.test(error.message) ? "Format de fichier non accepté." : /size|large/i.test(error.message) ? "Fichier trop lourd (20 Mo maximum)." : error.message);
  return supabase.storage.from("music").getPublicUrl(path).data.publicUrl;
}

export async function removeMusicFiles(urls) {
  const list = (urls || []).filter(Boolean);
  const r2 = list.filter(isR2);
  const sb = list.filter((u) => !isR2(u)).map((u) => decodeURIComponent(u.split("/music/")[1]?.split("?")[0] || "")).filter(Boolean);
  if (r2.length) {
    try {
      await fetch(`${APP}/api/upload`, { method: "DELETE", headers: { authorization: `Bearer ${await token()}`, "content-type": "application/json" }, body: JSON.stringify({ urls: r2 }) });
    } catch { /* sans gravité */ }
  }
  if (sb.length) await supabase.storage.from("music").remove(sb);
}
