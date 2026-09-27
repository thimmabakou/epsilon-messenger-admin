// Gestion des versions de l'application : brouillon → test → validation → déploiement
import { useState } from "react";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { KIND_KEY, KIND_LABEL, STAGE_INDEX, VERSION_STEPS } from "../lib/constants";
import { dateOnly } from "../lib/format";
import { Note, Pills, ScreenTitle, SecurityGate } from "../components/common";

export default function Versions() {
  const { me, can, deny, act } = useAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [nv, setNv] = useState({ v: "", type: "Mineure", notes: "" });
  const [gate, setGate] = useState(null); // version à déployer

  const { data, error } = useLoad(() => q(supabase.from("app_versions").select("*").order("created_at", { ascending: false })));
  const versions = data || [];
  const live = versions.find((v) => v.stage === "production");
  const next = versions.filter((v) => ["brouillon", "test", "validation"].includes(v.stage));

  const create = async () => {
    if (!/^\d+\.\d+\.\d+$/.test(nv.v.trim())) return act(async () => { throw new Error("Numéro de version invalide (exemple : 1.2.0)."); });
    const ok = await act(() => rpc("create_app_version", { p_version: nv.v.trim(), p_kind: KIND_KEY[nv.type], p_notes: nv.notes.split("\n").map((s) => s.trim()).filter(Boolean) }), "Version enregistrée en brouillon.");
    if (ok) { setFormOpen(false); setNv({ v: "", type: "Mineure", notes: "" }); }
  };
  const advance = (v) => can("ver.test") ? act(() => rpc("advance_app_version", { p_id: v.id }), v.stage === "brouillon" ? "🧪 Version envoyée aux testeurs." : "✅ Version validée.") : deny("ver.test");
  const deploy = async (v, code) => {
    const ok = await act(() => rpc("deploy_app_version", { p_id: v.id, p_code: code || null }), `🚀 Version ${v.version} déployée pour tous les utilisateurs.`);
    if (ok) setGate(null);
  };
  const askDeploy = (v) => {
    if (!can("ver.publish")) return deny("ver.publish");
    if (me.isPdg) setGate(v); else deploy(v);
  };

  const stepper = (v) => {
    const s = STAGE_INDEX[v.stage];
    return <div className="stepper">{VERSION_STEPS.map((st, i) => <div key={st} className={"step" + (i < s ? " done" : i === s ? " current" : "")}>{i < s ? "✓ " : ""}{st}</div>)}</div>;
  };
  const action = (v) => v.stage === "brouillon" ? <button className="action-button primary" onClick={() => advance(v)}>🧪 Envoyer aux testeurs</button>
    : v.stage === "test" ? <button className="action-button ok" onClick={() => advance(v)}>✅ Valider après les tests</button>
    : <button className="action-button danger" onClick={() => askDeploy(v)}>🚀 Déployer pour tous les utilisateurs</button>;

  return (<>
    <ScreenTitle eyebrow="APPLICATION" title="Gestion des versions">
      <button className="primary-button" onClick={() => setFormOpen(!formOpen)}>＋ Créer une nouvelle version</button>
    </ScreenTitle>
    <Note icon="🧩">Ce site ne contient pas le code de l'application. Vous développez et testez dans votre environnement (React / Bolt), puis vous venez ici pour déclarer, tester et publier la version.</Note>
    {formOpen && (
      <div className="ver-form">
        <strong style={{ fontSize: 14 }}>Nouvelle version</strong>
        <input placeholder="Numéro de version (ex. 1.2.0)" value={nv.v} onChange={(e) => setNv({ ...nv, v: e.target.value })} autoComplete="off" />
        <span className="field-hint">Type de mise à jour</span>
        <Pills options={["Majeure", "Mineure", "Sécurité"]} value={nv.type} onChange={(t) => setNv({ ...nv, type: t })} />
        <textarea rows={4} placeholder="Nouveautés, une par ligne" value={nv.notes} onChange={(e) => setNv({ ...nv, notes: e.target.value })} />
        <div className="mp-actions"><button className="action-button primary" onClick={create}>💾 Enregistrer en brouillon</button><button className="action-button neutral" onClick={() => setFormOpen(false)}>Annuler</button></div>
      </div>
    )}
    {!data && <Loading error={error} />}
    <div className="ver-cards">
      {live && (
        <div className="ver-card prod">
          <span className="sec-badge">En production</span>
          <h2>{live.version}</h2><span className="field-hint">{KIND_LABEL[live.kind]} · publiée le {dateOnly(live.deployed_at)}</span>
          <ul>{live.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
      )}
      {next.map((v) => (
        <div key={v.id} className="ver-card">
          <span className="sec-badge" style={{ background: "#fff0e0", color: "#b5650a" }}>En préparation</span>
          <h2>{v.version}</h2><span className="field-hint">{KIND_LABEL[v.kind]} · créée le {dateOnly(v.created_at)}{v.stage !== "brouillon" ? ` · ${v.testers} testeurs` : ""}</span>
          {stepper(v)}
          <ul>{v.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          <div className="mp-actions">{action(v)}</div>
        </div>
      ))}
      {data && !live && next.length === 0 && <p className="reports-empty">Aucune version déclarée pour le moment.</p>}
    </div>
    <section className="activity-block">
      <div className="section-heading"><span>🗂️</span><h2>Historique des versions</h2></div>
      <table className="activity-table"><tbody>
        {versions.map((v) => (
          <tr key={v.id}><td className="activity-who">{v.version}</td><td>{KIND_LABEL[v.kind]} — {v.notes[0] || ""}</td>
            <td className="activity-when" style={{ width: 170 }}>{v.stage === "production" ? "En production" : v.stage === "archivee" ? "Archivée" : VERSION_STEPS[STAGE_INDEX[v.stage]]} · {dateOnly(v.created_at)}</td></tr>
        ))}
      </tbody></table>
    </section>
    {gate && <SecurityGate title={`Déployer la version ${gate.version} pour tous`} onConfirm={(code) => deploy(gate, code)} onCancel={() => setGate(null)} />}
  </>);
}
