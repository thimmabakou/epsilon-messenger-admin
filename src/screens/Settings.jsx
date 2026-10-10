// Paramètres de la plateforme : options, fonctionnalités (modules), technique
import { useState } from "react";
import logo from "../assets/logo.png";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { FEATURE_LIST, KIND_LABEL } from "../lib/constants";
import { ScreenTitle, SecurityGate } from "../components/common";
import StorageMove from "../components/StorageMove";

const FILE_SIZES = [["100 Mo", 100], ["200 Mo", 200], ["500 Mo", 500], ["1 Go", 1024]];

export default function Settings({ goto }) {
  const { me, can, deny, act } = useAdmin();
  const [tab, setTab] = useState("options");
  const [confirmKey, setConfirmKey] = useState(null); // module à désactiver
  const [gate, setGate] = useState(null); // { title, run(code) }

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
  const toggleModule = (key) => {
    if (isOn(key)) return setConfirmKey(key); // désactiver = confirmation
    save("modules", { ...modules, [key]: true });
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
    {fc && (
      <div className="suspend-box" style={{ margin: "0 0 14px", borderColor: "var(--danger)" }}>
        <span className="label">⚠️ Désactiver « {fc.label} » ?</span>
        <p style={{ fontSize: 13, margin: "0 0 4px" }}>Tous les utilisateurs verront « {fc.label} en maintenance » dans l'application (en moins de 30 secondes) et la base de données refusera les envois. Le changement sera tracé dans le journal.</p>
        <div className="row">
          <button className="action-button danger" onClick={() => save("modules", { ...modules, [fc.key]: false }, { critical: true, title: `Désactiver « ${fc.label} »` })}>{me.isPdg ? "Confirmer avec mon code" : "Confirmer"}</button>
          <button className="action-button neutral" onClick={() => setConfirmKey(null)}>Annuler</button>
        </div>
      </div>
    )}
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
          onClick={() => save("maintenance", !(s.maintenance === true), { critical: true, perm: "settings.maintenance", title: s.maintenance === true ? "Désactiver le mode maintenance" : "Activer le mode maintenance" })} /></div>
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
    {gate && <SecurityGate title={gate.title} onConfirm={gate.run} onCancel={() => setGate(null)} />}
  </>);
}
