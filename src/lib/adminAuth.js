// Connexion administrateur : mot de passe, puis code SMS (fonction serveur « admin-2fa »)
import { supabase } from "./supabase";

async function call(body) {
  const { data, error } = await supabase.functions.invoke("admin-2fa", { body });
  if (error) {
    let msg = "Connexion impossible. Réessayez.";
    try { msg = (await error.context.json()).error || msg; } catch { /* réseau */ }
    throw new Error(msg);
  }
  return data;
}

// Étape 1 : e-mail + mot de passe → un SMS part. Renvoie le numéro masqué.
export async function adminLogin(email, password) {
  const res = await call({ action: "login", email, password });
  await supabase.auth.setSession(res.session);
  return { phone: res.phone };
}

// Étape 2 : code reçu par SMS → la session devient administratrice.
export async function adminVerifyCode(code) {
  return call({ action: "verify", code }); // { ok, isPdg, name }
}

export async function adminResendCode() {
  return call({ action: "resend" });
}

export async function adminLogout() {
  await supabase.auth.signOut();
}

// La session actuelle est-elle une session administrateur vérifiée par SMS ?
export async function sessionIsAdmin() {
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return false;
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/" });
  if (error) throw new Error(error.message);
}
