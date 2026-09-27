// Petits outils d'affichage (dates, nombres, initiales…)

export const fmt = (n) => Math.round(Number(n) || 0).toLocaleString("fr-FR").replace(/ | /g, " ");

const p2 = (n) => String(n).padStart(2, "0");

export function dateTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

export function dateOnly(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function ago(ts) {
  if (!ts) return "jamais";
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 172800) return "hier";
  return `il y a ${Math.floor(s / 86400)} jours`;
}

export function initials(name) {
  const parts = String(name || "?").replace("#", "").split(" ").filter(Boolean);
  return ((parts[0] || "?")[0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
}

export function ageRange(birthYear) {
  if (!birthYear) return "—";
  const a = new Date().getFullYear() - birthYear;
  if (a < 25) return "18-24 ans";
  if (a < 35) return "25-34 ans";
  if (a < 45) return "35-44 ans";
  return "45 ans et +";
}

export function duration(sec) {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60), s = sec % 60;
  return m ? `${m} min ${p2(s)} s` : `${s} s`;
}

// Masque le milieu d'un numéro : +242 06 •• •• 41
export function maskPhone(p) {
  if (!p) return "—";
  const d = String(p).replace(/\s/g, "");
  if (d.length < 8) return p;
  return `${d.slice(0, 4)} ${d.slice(4, 6)} •• •• ${d.slice(-2)}`;
}

const STATUS = { actif: "Actif", averti: "Averti", suspendu: "Suspendu" };
export const statusLabel = (s) => STATUS[s] || s;

export const fullName = (p) => (p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Utilisateur" : "Utilisateur");

// Identifiant court et lisible à partir d'un identifiant technique
export const shortId = (uuid, prefix = "EM") => (uuid ? `${prefix}-${String(uuid).replace(/-/g, "").slice(0, 6).toUpperCase()}` : "—");
