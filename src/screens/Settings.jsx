// Paramètres de la plateforme : options, fonctionnalités (modules), technique
import { useState } from "react";
import logo from "../assets/logo.png";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { FEATURE_LIST, KIND_LABEL } from "../lib/constants";
import { ScreenTitle, SecurityGate } from "../components/common";
import StorageMove from "../components/StorageMove";
import { notifyAll } from "../lib/broadcastPush";

const PART = { all: "Toute l'application", messaging: "La messagerie", calls: "Les appels", statuses: "Les statuts", marketplace: "Les boutiques", support: "Le service client", reports: "Les signalements" };
const toLocalInput = (d) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 16); };
const fmtWhen = (iso) => new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const FILE_SIZES = [["100 Mo", 100], ["200 Mo", 200], ["500 Mo", 500], ["1 Go", 1024]];

export default function Settings({ goto }) {
  const { me, can, deny, act } = useAdmin();
  const [tab, setTab] = useState("options");
  const [confirmKey, setConfirmKey] = useState(null); // module à désactiver
  const [gate, setGate] = useState(null); // { title, run(code) }
  const [maint, setMaint] = useState(null); // fenêtre « couper une partie » : { target, when, start, end, announce }
  const [pushInfo, setPushInfo] = useState(null);
  const plans = useLoad(async () => (await q(supabase.from("maintenance_plans").select("*").eq("status", "prevue").order("starts_at")))
    .filter((p) => !p.ends_at || new Date(p.ends_at) > new Date())); // celles dont l'heure de fin est passée sont terminées

  const { data, error } = useLoad(async () => {
    const [settings, versions] = await Promise.all([
      q(supabase.from("platform_settings").select("key,value,updated_at")),
      q(supabase.from("app_versions").select("version,kind,stage,notes").in("stage", ["production", "test", "validation"])),
    ]);
    const s = {}; settings.forEach((r) => { s[r.key] = r.value; });
    return { s, versions };
  });
  const s = data?.s || {};
  const modules = s.modules || {};

  // Enregistre un paramètre ; si l'action est critique et que c'est le PDG, demande le code d'abord
  const save = (key, value, { critical = false, perm = "settings.modules", title = "" } = {}) => {
    if (!can(perm)) return deny(perm);
    const run = (code) => act(() => rpc("set_setting", { p_key: key, p_value: value, p_code: code || null }), "Paramètre enregistré.");
    if (critical && me.isPdg) setGate({ title, run: async (code) => { if (await run(code)) { setGate(null); setConfirmKey(null); } } });
    else run().then(() => setConfirmKey(null));
  };
  // Un module absent de la liste est ouvert dans l'application : seul « false » le coupe
  const isOn = (key) => modules[key] !== false;
  // Prévenir tout le monde : communiqué automatique (si le modèle est allumé) + notifications
  const announce = async (res) => {
    if (!res?.body) return;
    setPushInfo("Communiqué publié. Envoi des notifications…");
    await notifyAll(res.body, setPushInfo);
    setTimeout(() => setPushInfo(null), 30000);
  };
  const reopen = (target) => {
    const perm = target === "all" ? "settings.maintenance" : "settings.modules";
    if (!can(perm)) return deny(perm);
    const run = async (code) => {
      const ok = await act(async () => {
        if (target === "all") await rpc("set_setting", { p_key: "maintenance", p_value: false, p_code: code || null });
        else await rpc("set_setting", { p_key: "modules", p_value: { ...modules, [target]: true }, p_code: code || null });
        try { await announce(await rpc("eg_maint_announce", { p_kind: "end", p_target: target })); } catch { /* SQL 43 pas encore exécuté */ }
      }, `✅ ${PART[target]} : de nouveau disponible.`);
      if (ok) setGate(null);
      return ok;
    };
    if (target === "all" && me.isPdg) setGate({ title: "Désactiver le mode maintenance", run }); else run();
  };
  const openMaint = (target) => {
    const perm = target === "all" ? "settings.maintenance" : "settings.modules";
    if (!can(perm)) return deny(perm);
    const now = new Date();
    setMaint({ target, when: "now", start: toLocalInput(new Date(now.getTime() + 3600000)), end: "", announce: true });
  };
  const confirmMaint = () => {
    const m = maint;
    const startIso = m.when === "plan" ? new Date(m.start).toISOString() : new Date().toISOString();
    const endIso = m.end ? new Date(m.end).toISOString() : null;
    if (m.when === "plan" && !m.start) return act(async () => { throw new Error("Choisissez l'heure de début."); });
    if (endIso && new Date(endIso) <= new Date(startIso)) return act(async () => { throw new Error("La fin doit être après le début."); });
    const run = async (code) => {
      const ok = await act(async () => {
        if (m.when === "now" && !endIso) {
          // Coupé tout de suite, jusqu'à nouvel ordre : l'interrupteur, puis le communiqué
          if (m.target === "all") await rpc("set_setting", { p_key: "maintenance", p_value: true, p_code: code || null });
          else await rpc("set_setting", { p_key: "modules", p_value: { ...modules, [m.target]: false }, p_code: code || null });
          if (m.announce) { try { await announce(await rpc("eg_maint_announce", { p_kind: "start", p_target: m.target })); } catch { /* SQL 43 */ } }
        } else {
          // Heures précises : maintenance programmée (début et retour automatiques)
          await announce(await rpc("eg_maint_plan", { p_target: m.target, p_start: startIso, p_end: endIso, p_announce: m.announce }));
        }
        setMaint(null); setConfirmKey(null); plans.reload?.();
      }, m.when === "plan" ? "⏰ Maintenance programmée." : `🛠️ ${PART[m.target]} : en maintenance.`);
      if (ok) setGate(null);
      return ok;
    };
    if (me.isPdg) setGate({ title: `${PART[m.target]} en maintenance`, run }); else run();
  };
  const stopPlan = (p) => act(async () => {
    await announce(await rpc("eg_maint_stop", { p_id: p.id }));
    plans.reload?.();
  }, new Date(p.starts_at) > new Date() ? "Maintenance annulée." : "✅ Maintenance terminée.");
  const toggleModule = (key) => {
    if (isOn(key)) return openMaint(key); // couper = fenêtre (maintenant ou programmé, message automatique)
    reopen(key);
  };

  const fc = FEATURE_LIST.find((f) => f.key === confirmKey);
  const prod = data?.versions.find((v) => v.stage === "production");
  const test = data?.versions.find((v) => v.stage !== "production");

  let body;
  if (!data) body = <Loading error={error} />;
  else if (tab === "options") body = (
    <div className="settings-group">
      <div className="settings-field"><div className="settings-field-main"><strong>Nom de l'application</strong><span>Affiché dans l'app et sur le site</span></div><strong>{s.app_name || "Epsilon Messenger"}</strong></div>
      <div className="settings-field"><div className="settings-field-main"><strong>Logo</strong><span>Logo rose officiel</span></div><img src={logo} alt="" style={{ width: 34, height: 34, objectFit: "contain" }} /></div>
      <div className="settings-field"><div className="settings-field-main"><strong>Langue par défaut</strong><span>Pour les nouveaux utilisateurs</span></div>
        <select className="settings-select" value={s.language} onChange={(e) => save("language", e.target.value)}>{["Français", "Lingala", "Kituba", "English"].map((o) => <option key={o}>{o}</option>)}</select></div>
      <div className="settings-field"><div className="settings-field-main"><strong>Fuseau horaire</strong><span>Heure utilisée dans les journaux</span></div>
        <select className="settings-select" value={s.timezone} onChange={(e) => save("timezone", e.target.value)}>{[["Africa/Brazzaville", "Africa/Brazzaville (UTC+1)"], ["Africa/Kinshasa", "Africa/Kinshasa (UTC+1)"], ["UTC", "UTC"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div className="settings-field"><div className="settings-field-main"><strong>Taille maximale des fichiers</strong><span>Photos, vidéos et documents envoyés</span></div>
        <select className="settings-select" value={s.max_file_mb} onChange={(e) => save("max_file_mb", Number(e.target.value))}>{FILE_SIZES.map(([l, v]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div className="settings-field"><div className="settings-field-main"><strong>Sauvegardes automatiques</strong><span>Fréquence de sauvegarde des données</span></div>
        <select className="settings-select" value={s.backup} onChange={(e) => save("backup", e.target.value, { perm: "settings.backups" })}>{["Chaque heure", "Chaque jour à 03:00", "Chaque semaine"].map((o) => <option key={o}>{o}</option>)}</select></div>
    </div>
  );
  else if (tab === "features") body = (<>
    <div className="settings-group">
      {FEATURE_LIST.map((f) => (
        <div key={f.key} className="settings-field">
          <div className="settings-field-main"><strong>{f.label}</strong><span>{f.desc}</span></div>
          <button className={"toggle-switch" + (isOn(f.key) ? " on" : "")} onClick={() => toggleModule(f.key)} aria-label={f.label} />
        </div>
      ))}
    </div>
  </>);
  else body = (<>
    {s.maintenance === true && <div className="maintenance-banner">🛠️ <strong>Mode maintenance actif.</strong> Les utilisateurs voient : « Epsilon Messenger est temporairement en maintenance. Merci de patienter. »</div>}
    <div className="settings-group">
      <div className="settings-field"><div className="settings-field-main"><strong>Mode maintenance</strong><span>Protégé par le code de sécurité du PDG</span></div>
        <button className={"toggle-switch" + (s.maintenance === true ? " on" : "")} aria-label="Mode maintenance"
          onClick={() => (s.maintenance === true ? reopen("all") : openMaint("all"))} /></div>
      <div className="settings-field"><div className="settings-field-main"><strong>Gestion des versions</strong><span>Préparer, tester et publier les versions de l'application</span></div><button className="action-button neutral" onClick={() => goto("versions")}>Ouvrir →</button></div>
      <div className="settings-field"><div className="settings-field-main"><strong>Version en production</strong><span>{prod ? prod.notes.slice(0, 3).join(", ") : "Aucune version publiée"}</span></div><span className="sec-badge">{prod ? prod.version : "—"}</span></div>
      {test && <div className="settings-field"><div className="settings-field-main"><strong>Version en test</strong><span>{KIND_LABEL[test.kind]} · {test.notes[0] || ""}</span></div><span className="sec-badge" style={{ background: "#fff0e0", color: "#b5650a" }}>{test.version}</span></div>}
      <div className="settings-field"><div className="settings-field-main"><strong>Sauvegardes</strong><span>{s.backup || "—"}</span></div><span className="field-hint">Gérées par Supabase</span></div>
    </div>
    <StorageMove />
    <p className="field-hint">Le code de l'application se modifie dans votre environnement de développement (React / Bolt), jamais ici. Ce site sert uniquement à piloter et publier les versions.</p>
  </>);

  return (<>
    <ScreenTitle eyebrow="PLATEFORME" title="Paramètres" />
    <div className="settings-tabs">
      {[["options", "Options"], ["features", "Fonctionnalités"], ["technical", "Technique"]].map(([k, l]) => <button key={k} className={"settings-tab" + (k === tab ? " active" : "")} onClick={() => setTab(k)}>{l}</button>)}
    </div>
    {body}
    {(plans.data || []).length > 0 && (tab === "features" || tab === "technical") && (
      <div className="ver-form" style={{ marginTop: 14 }}>
        <strong style={{ fontSize: 14 }}>⏰ Maintenances programmées</strong>
        {plans.data.map((p) => {
          const live = new Date(p.starts_at) <= new Date();
          return (
            <div key={p.id} className="settings-field">
              <div className="settings-field-main">
                <strong>{PART[p.target] || p.target} {live ? "· 🛠️ en cours" : "· prévue"}</strong>
                <span>{p.ends_at ? `du ${fmtWhen(p.starts_at)} au ${fmtWhen(p.ends_at)}` : `à partir du ${fmtWhen(p.starts_at)}, jusqu'à nouvel ordre`} — début et retour automatiques</span>
              </div>
              <button className="action-button neutral" onClick={() => stopPlan(p)}>{live ? "⏹ Terminer maintenant" : "Annuler"}</button>
            </div>
          );
        })}
      </div>
    )}
    {pushInfo && <p className="field-hint"><b>{pushInfo}</b></p>}
    {maint && (
      <div className="pcc-back" onClick={() => setMaint(null)}>
        <div className="ver-form pcc" onClick={(e) => e.stopPropagation()}>
          <strong style={{ fontSize: 15 }}>🛠️ {PART[maint.target]} en maintenance</strong>
          <span className="field-hint">{maint.target === "all" ? "Toute l'application affichera l'écran de maintenance (sauf pour l'équipe et votre compte personnel)." : "Cette partie affichera « en maintenance » pour tous ; le reste de l'application continue de fonctionner."}</span>
          <span className="pcc-label">Quand ?</span>
          <div className="mp-actions">
            <button className={"action-button " + (maint.when === "now" ? "primary" : "neutral")} onClick={() => setMaint({ ...maint, when: "now" })}>Maintenant</button>
            <button className={"action-button " + (maint.when === "plan" ? "primary" : "neutral")} onClick={() => setMaint({ ...maint, when: "plan" })}>⏰ Programmer</button>
          </div>
          {maint.when === "plan" && (<>
            <span className="pcc-label">Début</span>
            <input type="datetime-local" value={maint.start} onChange={(e) => setMaint({ ...maint, start: e.target.value })} />
          </>)}
          <span className="pcc-label">Fin {maint.when === "now" ? "(retour prévu — facultatif)" : "(facultatif)"}</span>
          <input type="datetime-local" value={maint.end} onChange={(e) => setMaint({ ...maint, end: e.target.value })} />
          <span className="field-hint">{maint.end ? "À l'heure de fin, tout revient tout seul et le message « de nouveau disponible » apparaît chez tout le monde." : "Sans heure de fin : jusqu'à nouvel ordre (vous rallumerez vous-même)."}</span>
          <label className="field-hint" style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 13.5 }}>
            <input type="checkbox" checked={maint.announce} onChange={(e) => setMaint({ ...maint, announce: e.target.checked })} style={{ width: "auto" }} />
            📢 Prévenir tous les utilisateurs (message automatique + notification)
          </label>
          <div className="mp-actions">
            <button className="action-button danger" onClick={confirmMaint}>{maint.when === "plan" ? "⏰ Programmer" : "🛠️ Mettre en maintenance"}{me.isPdg ? " (code PDG)" : ""}</button>
            <button className="action-button neutral" onClick={() => setMaint(null)}>Annuler</button>
          </div>
        </div>
      </div>
    )}
    {gate && <SecurityGate title={gate.title} onConfirm={gate.run} onCancel={() => setGate(null)} />}
  </>);
}
