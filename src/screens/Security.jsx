// Sécurité (PDG) : gel d'urgence, sessions, connexions, code de sécurité, journal
import { useState } from "react";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { ago, dateTime } from "../lib/format";
import { PwInput, ScreenTitle, SecurityGate } from "../components/common";

export default function Security({ flags }) {
  const { act } = useAdmin();
  const [gate, setGate] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [cc, setCc] = useState({ current: "", next: "", confirm: "", message: "", ok: false });

  const { data, error } = useLoad(async () => {
    const [sessions, logins, log] = await Promise.all([
      rpc("active_admin_sessions"),
      q(supabase.from("admin_logins").select("*, admin:admins(display_name)").order("created_at", { ascending: false }).limit(30)),
      q(supabase.from("security_log").select("*").order("created_at", { ascending: false }).limit(100)),
    ]);
    return { sessions, logins, log };
  });
  const d = data || { sessions: [], logins: [], log: [] };
  const dayAgo = Date.now() - 86400000;
  const failed = d.logins.filter((l) => !l.success && new Date(l.created_at).getTime() > dayAgo);
  const failedByEmail = {};
  failed.forEach((l) => { failedByEmail[l.email_tried] = (failedByEmail[l.email_tried] || 0) + 1; });

  const freeze = async (code) => { if (await act(() => rpc("freeze_platform", { p_on: !flags.frozen, p_code: code }), flags.frozen ? "Plateforme dégelée." : "🧊 Plateforme gelée. Les autres administrateurs sont déconnectés.")) setGate(false); };
  const kill = (s) => act(() => rpc("kill_admin_session", { p_session: s.session_id }), `Session de ${s.admin_name} déconnectée.`);
  const saveCode = async () => {
    if (cc.next !== cc.confirm) return setCc({ ...cc, message: "Les deux nouveaux codes ne sont pas identiques.", ok: false });
    try {
      if (cc.current && !(await rpc("check_pdg_code", { p_code: cc.current }))) {
        return setCc({ ...cc, current: "", message: "Code actuel incorrect. Après 5 essais incorrects, le code est bloqué 15 minutes.", ok: false });
      }
      await rpc("set_pdg_code", { p_current: cc.current, p_new: cc.next });
      setCc({ current: "", next: "", confirm: "", message: "✅ Code de sécurité enregistré.", ok: true });
    } catch (e) { setCc({ ...cc, message: e.message, ok: false }); }
  };

  return (<>
    <ScreenTitle eyebrow="PROTECTION" title="Sécurité" />
    <div className={"emergency-card" + (flags.frozen ? " frozen" : "")}>
      <h2>{flags.frozen ? "🧊 Plateforme gelée" : "🚨 Gel d'urgence de la plateforme"}</h2>
      <p>{flags.frozen
        ? "L'application est suspendue pour tous les utilisateurs (écran « momentanément suspendu »), les sessions administrateurs sont déconnectées et aucune action sensible n'est possible. Vous seul pouvez dégeler la plateforme."
        : "En cas d'attaque grave ou de fuite : un clic fige tout. L'application s'arrête pour tous les utilisateurs, les sessions administrateurs sont déconnectées, les actions sensibles bloquées. Réservé au PDG, protégé par votre code de sécurité."}</p>
      <button className="primary-button danger" onClick={() => setGate(true)}>{flags.frozen ? "Dégeler la plateforme" : "Geler la plateforme"}</button>
    </div>
    {!data && <Loading error={error} />}
    <div className="sec-grid">
      <div className="sec-card">
        <h2>🟢 Sessions actives</h2>
        {d.sessions.length === 0 && <p className="reports-empty">Aucune session active.</p>}
        {d.sessions.map((s) => (
          <div key={s.session_id} className="sec-row">
            <div className="sec-row-main"><strong>{s.admin_name}{s.is_pdg ? " (PDG)" : ""}</strong><span>Connecté {ago(s.verified_at)} · expire le {dateTime(s.expires_at)}</span></div>
            {s.is_current ? <span className="sec-badge">Cette session</span> : <button className="action-button danger" onClick={() => kill(s)}>Déconnecter</button>}
          </div>
        ))}
      </div>
      <div className="sec-card">
        <h2>🚨 Alertes automatiques</h2>
        {Object.entries(failedByEmail).map(([email, n]) => (
          <div key={email} className="sec-row"><div className="sec-row-main"><strong>{n} tentative(s) de connexion échouée(s)</strong><span>{email || "(adresse vide)"} · dernières 24 h</span></div><span className="sec-badge alert">À vérifier</span></div>
        ))}
        {failed.length === 0 && <div className="sec-row"><div className="sec-row-main"><strong>Aucune tentative suspecte</strong><span>Dernières 24 heures</span></div><span className="sec-badge">OK</span></div>}
        <div className="sec-row"><div className="sec-row-main"><strong>Double authentification</strong><span>Obligatoire pour tous les administrateurs</span></div><span className="sec-badge">Activée</span></div>
      </div>
      <div className="sec-card">
        <h2>👑 Protection du compte du PDG</h2>
        <div className="sec-row"><div className="sec-row-main"><strong>Vos permissions</strong><span>Personne ne peut les modifier ni vous rétrograder</span></div><span className="sec-badge">Verrouillé</span></div>
        <div className="sec-row"><div className="sec-row-main"><strong>Journal des actions critiques</strong><span>Personne ne peut effacer ses propres traces</span></div><span className="sec-badge">Protégé</span></div>
        <div className="sec-row"><div className="sec-row-main"><strong>Code de sécurité du PDG</strong><span>Demandé avant chaque action critique · bloqué 15 min après 5 erreurs</span></div>
          <button className="action-button neutral" onClick={() => setCodeOpen(!codeOpen)}>{codeOpen ? "Fermer" : "Créer / modifier"}</button></div>
        {codeOpen && (
          <div className="owner-code-form">
            <PwInput value={cc.current} onChange={(v) => setCc({ ...cc, current: v })} placeholder="Code actuel (vide si c'est le premier)" />
            <PwInput value={cc.next} onChange={(v) => setCc({ ...cc, next: v })} placeholder="Nouveau code (8 caractères minimum)" />
            <PwInput value={cc.confirm} onChange={(v) => setCc({ ...cc, confirm: v })} placeholder="Confirmer le nouveau code" onEnter={saveCode} />
            {cc.message && <div className={cc.ok ? "field-hint" : "gate-error"} style={cc.ok ? { color: "#1c8a4b" } : undefined}>{cc.message}</div>}
            <span className="field-hint">Au moins 8 caractères, mélangeant lettres, chiffres et caractères spéciaux (@ # ! $ % & *…).</span>
            <button className="action-button primary" onClick={saveCode}>Enregistrer le code</button>
            <span className="field-hint">Notez-le en lieu sûr : il n'est jamais enregistré en clair, personne ne peut le lire.</span>
          </div>
        )}
      </div>
      <div className="sec-card">
        <h2>🔑 Connexions des administrateurs</h2>
        {d.logins.length === 0 && <p className="reports-empty">Aucune connexion enregistrée.</p>}
        {d.logins.slice(0, 8).map((l) => (
          <div key={l.id} className="sec-row"><div className="sec-row-main"><strong>{l.admin?.display_name || l.email_tried}</strong><span>{dateTime(l.created_at)} · {l.device || "—"}{l.ip ? " · " + l.ip : ""}</span></div>
            <span className={"sec-badge" + (l.success ? "" : " alert")}>{l.success ? "Réussie" : (l.place || "Échec")}</span></div>
        ))}
      </div>
    </div>
    <section className="activity-block">
      <div className="section-heading"><span>📜</span><h2>Journal des actions critiques</h2></div>
      <table className="activity-table"><tbody>
        {d.log.map((l) => <tr key={l.id}><td className="activity-who">{l.actor_name}</td><td>{l.critical ? "⚠️ " : ""}{l.action}</td><td className="activity-when" style={{ width: 130 }}>{dateTime(l.created_at)}</td></tr>)}
      </tbody></table>
    </section>
    {gate && <SecurityGate title={flags.frozen ? "Dégeler la plateforme" : "Gel d'urgence de la plateforme"} onConfirm={freeze} onCancel={() => setGate(false)} />}
  </>);
}
