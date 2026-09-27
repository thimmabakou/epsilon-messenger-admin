// Connexion unique à la base Supabase (adresse + clé publique, voir le fichier .env)
import { createClient } from "@supabase/supabase-js";

// Adresse d'arrivée, mémorisée avant que Supabase ne lise puis n'efface le lien d'invitation ou de réinitialisation
export const initialHash = typeof window !== "undefined" ? window.location.hash : "";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// Lance une requête et renvoie ses données, ou lève une erreur lisible en français
export async function q(promise) {
  const { data, error } = await promise;
  if (error) throw new Error(frenchError(error));
  return data;
}

export async function rpc(name, args = {}) {
  return q(supabase.rpc(name, args));
}

export function frenchError(error) {
  const m = error?.message || String(error);
  if (/permission denied|42501|Accès refusé/i.test(m) && !/Réservé|Seul|Personne|Code/i.test(m)) return "Action refusée : vous n'avez pas la permission.";
  if (/Failed to fetch|NetworkError|network/i.test(m)) return "Connexion au serveur impossible. Vérifiez votre connexion Internet.";
  if (/JWT|expired/i.test(m)) return "Votre session a expiré. Reconnectez-vous.";
  return m;
}

// Appelle une fonction serveur (Edge Function) et renvoie un message d'erreur lisible
export async function invokeFn(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let msg = error.message;
    try { msg = (await error.context.json()).error || msg; } catch { /* réseau */ }
    if (/Failed to send|not found|404/i.test(msg)) msg = `La fonction serveur « ${name} » n'est pas encore installée dans Supabase.`;
    throw new Error(msg);
  }
  return data;
}
