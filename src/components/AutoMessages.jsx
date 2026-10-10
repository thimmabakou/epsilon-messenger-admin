// Messages automatiques (page des communiqués) : bienvenue, début / fin / annulation de maintenance.
// Chaque modèle s'allume ou s'éteint et se modifie ici ; les mots entre accolades sont remplis tout seuls.
import { useEffect, useState } from "react";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad } from "../lib/admin";
import { dateTime } from "../lib/format";

const META = {
  welcome: { title: "👋 Bienvenue (nouveau compte)", help: "Arrive dans la discussion « Service client Epsilon » de chaque nouveau compte. {prenom} = son prénom." },
  maint_start: { title: "🛠️ Début de maintenance", help: "Envoyé à tous quand une partie est coupée ou une maintenance programmée. {partie} = la partie concernée, {periode} = les heures." },
  maint_end: { title: "✅ Fin de maintenance", help: "Envoyé à tous quand la partie fonctionne de nouveau (à l'heure prévue pour une maintenance programmée)." },
  maint_cancel: { title: "ℹ️ Maintenance annulée", help: "Envoyé à tous si une maintenance programmée est annulée avant de commencer." },
};
const ORDER = ["welcome", "maint_start", "maint_end", "maint_cancel"];

function Row({ m, onSave }) {
  const [body, setBody] = useState(m.body);
  const [on, setOn] = useState(m.enabled);
  useEffect(() => { setBody(m.body); setOn(m.enabled); }, [m.body, m.enabled]);
  const dirty = body !== m.body || on !== m.enabled;
  return (
    <div className="auto-msg">
      <div className="auto-msg-head">
        <strong>{META[m.key]?.title || m.key}</strong>
        <button className={"toggle-switch" + (on ? " on" : "")} aria-label="Activer" onClick={() => setOn(!on)} />
      </div>
      <span className="field-hint">{META[m.key]?.help}</span>
      <textarea rows={m.key === "welcome" ? 7 : 3} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} disabled={!on} />
      <div className="mp-actions" style={{ alignItems: "center" }}>
        <button className="action-button primary" disabled={!dirty} onClick={() => onSave(m.key, body, on)}>💾 Enregistrer</button>
        <span className="field-hint">{on ? "Activé" : "Désactivé"} · modifié le {dateTime(m.updated_at)}</span>
      </div>
    </div>
  );
}

export default function AutoMessages() {
  const { act } = useAdmin();
  const [open, setOpen] = useState(false);
  const { data, error, reload } = useLoad(() => q(supabase.from("auto_messages").select("*")));
  const list = (data || []).slice().sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  const save = (key, body, enabled) => act(async () => { await rpc("eg_auto_message_save", { p_key: key, p_body: body, p_enabled: enabled }); reload?.(); }, "💾 Message automatique enregistré.");
  return (
    <div className="ver-form" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 14, flex: 1 }}>🤖 Messages automatiques</strong>
        <button className="action-button neutral" onClick={() => setOpen(!open)}>{open ? "Fermer" : "Voir / modifier"}</button>
      </div>
      <span className="field-hint">Envoyés tout seuls : bienvenue aux nouveaux comptes, et communiqués de maintenance (Paramètres → Fonctionnalités / Technique).</span>
      {open && (error ? <span className="field-hint" style={{ color: "var(--danger)" }}>Exécutez d'abord le fichier SQL 43 (messages automatiques) dans Supabase.</span>
        : list.map((m) => <Row key={m.key} m={m} onSave={save} />))}
    </div>
  );
}
