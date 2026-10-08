// Messagerie de l'équipe : messages écrits, vocaux et appels entre administrateurs (fichier SQL 31-messagerie-equipe).
// Les messages sont rangés dans la table team_messages, jamais avec les discussions des utilisateurs.
import { rpc } from "./supabase";
import { sendBox } from "./supportLine";

const sqlMissing = (e) => /eg_team_|team_messages|schema cache/i.test(e?.message || "");
const wrap = async (fn) => {
  try { return await fn(); } catch (e) {
    if (sqlMissing(e)) throw new Error("Exécutez d'abord le fichier SQL 31-messagerie-equipe dans Supabase.");
    throw e;
  }
};

// Nom affiché d'un collègue : « PDG » pour le PDG, sinon son poste (ou son nom s'il n'a pas de poste)
export const teamName = (a) => (a?.is_pdg ? "PDG" : a?.job_title || a?.display_name || "Administrateur");
export const teamSub = (a) => (a?.is_pdg ? a.display_name : a?.job_title ? a.display_name : a?.profile_label || "Administrateur");

export const loadTeam = () => wrap(() => rpc("eg_team_contacts"));
export const loadTeamThread = (other) => wrap(() => rpc("eg_team_thread", { p_other: other }));
export const teamUnread = () => rpc("eg_team_unread").catch(() => 0);

// Prévenir le collègue : sa page se met à jour aussitôt
const ping = (to, meId) => sendBox(to, "team", { from: meId });

export async function sendTeamText(to, body, meId) {
  const m = await wrap(() => rpc("eg_team_send", { p_other: to, p_body: body }));
  ping(to, meId);
  return m;
}
export async function sendTeamVoice(to, url, duration, meId) {
  const m = await wrap(() => rpc("eg_team_voice", { p_other: to, p_media_url: url, p_duration: duration }));
  ping(to, meId);
  return m;
}
export async function editTeamText(to, id, body, meId) {
  const m = await wrap(() => rpc("eg_team_edit", { p_id: id, p_body: body }));
  ping(to, meId);
  return m;
}
