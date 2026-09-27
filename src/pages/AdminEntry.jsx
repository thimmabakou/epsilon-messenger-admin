// Entrée de l'espace administration : connexion (mot de passe + code SMS), puis tableau de bord
import { useCallback, useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";
import { supabase, q, initialHash } from "../lib/supabase";
import { adminLogin, adminLogout, adminResendCode, adminVerifyCode, sendPasswordReset, sessionIsAdmin } from "../lib/adminAuth";
import { PwInput } from "../components/common";
import { SiteHeader, TopSwitcher } from "../App";
import AdminApp from "./AdminApp";

async function loadMe() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adm = await q(supabase.from("admins").select("*").eq("user_id", user.id).maybeSingle());
  if (!adm) return null;
  const perms = await q(supabase.from("admin_permissions").select("perm_key").eq("admin_id", user.id));
  return { id: user.id, name: adm.display_name, email: adm.email, isPdg: adm.is_pdg, profile: adm.profile_label, perms: perms.map((p) => p.perm_key) };
}

export default function AdminEntry() {
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState("credentials"); // credentials | otp | forgot | recovery
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [invited, setInvited] = useState(false);

  const enter = useCallback(async () => {
    const m = await loadMe();
    if (m) { setMe(m); if (!/^#\/admin/.test(window.location.hash)) window.location.hash = "/admin"; }
    return m;
  }, []);

  // Au chargement : une session déjà vérifiée par SMS ? Un lien de réinitialisation du mot de passe ?
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") { setStep("recovery"); setChecking(false); }
    });
    (async () => {
      if (/type=(recovery|invite)/.test(initialHash)) { setInvited(/type=invite/.test(initialHash)); setStep("recovery"); setChecking(false); return; }
      if (/error_description=/.test(initialHash)) setError("Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.");
      try { if (await sessionIsAdmin()) await enter(); } catch { /* pas connecté */ }
      setChecking(false);
    })();
    return () => sub.subscription.unsubscribe();
  }, [enter]);

  const logout = useCallback(async (msg) => {
    await adminLogout();
    setMe(null); setStep("credentials"); setPassword(""); setOtp(""); setError(""); setInfo(msg || "");
  }, []);

  // Déconnexion automatique après 30 minutes sans activité
  const timer = useRef();
  useEffect(() => {
    if (!me) return;
    const reset = () => { clearTimeout(timer.current); timer.current = setTimeout(() => logout("Vous avez été déconnecté après 30 minutes d'inactivité."), 30 * 60_000); };
    const evs = ["click", "keydown", "mousemove", "touchstart"];
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { clearTimeout(timer.current); evs.forEach((e) => window.removeEventListener(e, reset)); };
  }, [me, logout]);

  const run = async (fn) => { setBusy(true); setError(""); setInfo(""); try { await fn(); } catch (e) { setError(e.message); } setBusy(false); };

  const submit = () => run(async () => {
    const r = await adminLogin(email.trim().toLowerCase(), password);
    setPhone(r.phone); setPassword(""); setOtp(""); setStep("otp");
  });
  const verify = () => run(async () => {
    try { await adminVerifyCode(otp.trim()); }
    catch (e) { setOtp(""); throw e; }
    if (!(await enter())) throw new Error("Ce compte n'est pas un compte administrateur.");
  });
  const resend = () => run(async () => { await adminResendCode(); setInfo("Un nouveau code vient d'être envoyé par SMS."); });
  const forgot = () => run(async () => {
    if (!email.trim()) throw new Error("Indiquez votre adresse e-mail.");
    await sendPasswordReset(email.trim().toLowerCase());
    setInfo("Si cette adresse correspond à un compte, un lien de réinitialisation vient d'être envoyé.");
  });
  const saveNewPassword = () => run(async () => {
    if (password.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
    const { error: e } = await supabase.auth.updateUser({ password });
    if (e) throw new Error(e.message);
    await adminLogout();
    window.location.hash = "/admin";
    setPassword(""); setStep("credentials"); setInfo(invited ? "Mot de passe enregistré. Connectez-vous maintenant : un code vous sera envoyé par SMS." : "Mot de passe modifié. Connectez-vous avec le nouveau mot de passe.");
  });

  if (me) return <AdminApp me={me} setMe={setMe} onLogout={() => logout()} reloadMe={enter} />;

  let body;
  if (checking) body = <p className="login-note" style={{ textAlign: "center" }}>Chargement…</p>;
  else if (step === "otp") body = (<>
    <p style={{ fontSize: 13, textAlign: "center", margin: "0 0 4px" }}>🔐 <strong>Double authentification</strong></p>
    <p style={{ fontSize: 13, color: "var(--ink-soft)", textAlign: "center", margin: 0 }}>Un code à 6 chiffres a été envoyé par SMS au <strong>{phone}</strong>.</p>
    <label htmlFor="login-otp">Code reçu</label>
    <input id="login-otp" className="otp-input" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={otp} placeholder="••••••" autoFocus
      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && verify()} />
    {error && <div className="login-error">{error}</div>}
    {info && <div className="login-info">{info}</div>}
    <button className="primary-button" disabled={busy} onClick={verify}>{busy ? "Vérification…" : "Vérifier et entrer"}</button>
    <div className="login-links">
      <button className="link-button" onClick={() => logout()}>← Retour</button>
      <button className="link-button" disabled={busy} onClick={resend}>Renvoyer le code</button>
    </div>
  </>);
  else if (step === "forgot") body = (<>
    <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>Indiquez l'adresse e-mail de votre compte administrateur. Un lien de réinitialisation vous sera envoyé.</p>
    <label htmlFor="login-email">Adresse e-mail</label>
    <input id="login-email" type="email" autoComplete="username" value={email} placeholder="nom@epsilonmessenger.cg" onChange={(e) => setEmail(e.target.value)} />
    {error && <div className="login-error">{error}</div>}
    {info && <div className="login-info">{info}</div>}
    <button className="primary-button" disabled={busy} onClick={forgot}>Envoyer le lien</button>
    <div className="login-links"><button className="link-button" onClick={() => { setStep("credentials"); setInfo(""); setError(""); }}>← Retour à la connexion</button></div>
  </>);
  else if (step === "recovery") body = (<>
    <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>{invited ? "Bienvenue dans l'équipe Epsilon Messenger ! Choisissez votre mot de passe. Vous recevrez ensuite un code par SMS à chaque connexion." : "Choisissez un nouveau mot de passe pour votre compte administrateur."}</p>
    <label htmlFor="new-password">Nouveau mot de passe</label>
    <PwInput id="new-password" value={password} onChange={setPassword} placeholder="8 caractères minimum" autoComplete="new-password" onEnter={saveNewPassword} />
    {error && <div className="login-error">{error}</div>}
    <button className="primary-button" disabled={busy} onClick={saveNewPassword}>Enregistrer le mot de passe</button>
  </>);
  else body = (<>
    <label htmlFor="login-email">Adresse e-mail</label>
    <input id="login-email" type="email" autoComplete="username" value={email} placeholder="nom@epsilonmessenger.cg" onChange={(e) => setEmail(e.target.value)} />
    <label htmlFor="login-password">Mot de passe</label>
    <PwInput id="login-password" value={password} onChange={setPassword} placeholder="Votre mot de passe" autoComplete="current-password" onEnter={submit} />
    {error && <div className="login-error">{error}</div>}
    {info && <div className="login-info">{info}</div>}
    <button className="primary-button" disabled={busy} onClick={submit}>{busy ? "Connexion…" : "Se connecter"}</button>
    <div className="login-links"><button className="link-button" onClick={() => { setStep("forgot"); setError(""); setInfo(""); }}>Mot de passe oublié ?</button></div>
  </>);

  return (
    <div className="site-root">
      <SiteHeader />
      <TopSwitcher page="admin" />
      <div className="login-wrap"><div className="login-card">
        <div className="login-logo"><img src={logo} alt="" /><h1>Espace administration</h1><p>Epsilon Messenger · accès réservé à l'équipe</p></div>
        {body}
        <p className="login-note">🔒 Chaque connexion est enregistrée dans le journal de sécurité. Après 5 essais incorrects, le compte est bloqué 15 minutes. Déconnexion automatique après 30 minutes d'inactivité.</p>
      </div></div>
    </div>
  );
}
