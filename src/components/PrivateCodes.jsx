// Codes d'accès des chaînes privées (fichiers SQL 53 à 55) — réservé au PDG.
// Deux étapes, toujours :
//   1) « Générer » : l'application fabrique un code pour la chaîne. Il est EN ATTENTE et ne débloque rien.
//   2) « Valider » : le PDG l'active en confirmant avec SON code PDG (qui n'est jamais le code de la chaîne).
// Le code actif est celui que le responsable voit dans « Gérer ma chaîne » et donne à son public.
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { dateOnly } from "../lib/format";
import { SecurityGate } from "./common";

const sqlHint = (e) => (/eg_tv_|schema cache|pending_code|tv_private/i.test(e?.message || "")
  ? "Exécutez d'abord les fichiers SQL 53, 54 et 55 (chaînes privées) dans Supabase." : e?.message || String(e));

function CodeChip({ code, kind }) {
  const [copied, setCopied] = useState(false);
  if (!code) return <span className="pc-none">—</span>;
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { window.prompt("Code :", code); } };
  return (
    <button className={"pc-code " + kind} onClick={copy} title="Copier le code">
      <span>{code}</span><small>{copied ? "✓ copié" : "📋"}</small>
    </button>
  );
}

export default function PrivateCodes({ rows, allowed, deny, act, reload }) {
  const [gate, setGate] = useState(null);
  const rpc = async (fn, args) => { const { data, error } = await supabase.rpc(fn, args); if (error) throw new Error(sqlHint(error)); return data; };
  const run = (fn, c, msg) => (allowed ? act(async () => { await rpc(fn, { p_channel: c.id }); reload?.(); }, msg) : deny("PDG"));
  const guarded = (title, note, fn, c, msg) => (allowed
    ? setGate({ title, note, run: async () => { setGate(null); await act(async () => { await rpc(fn, typeof c === "function" ? c() : { p_channel: c.id }); reload?.(); }, msg); } })
    : deny("PDG"));

  const generate = (c) => run("eg_tv_generate_code", c, "🔑 Code généré. Il est en attente : validez-le pour l'activer.");
  const cancel = (c) => run("eg_tv_cancel_code", c, "Code en attente annulé.");
  const activate = (c) => guarded(`Activer le code ${c.privPending} pour « ${c.name} »`,
    "Pour valider, saisissez VOTRE code de sécurité du PDG. Ce n'est pas le code de la chaîne : le code de la chaîne est celui affiché en doré, et c'est lui que vous donnerez au responsable.",
    "eg_tv_activate_code", c, "✅ Code activé : la chaîne est maintenant privée. Le responsable voit ce code dans « Gérer ma chaîne ».");
  const makePublic = (c) => guarded(`Rendre « ${c.name} » publique`,
    "Pour confirmer, saisissez VOTRE code de sécurité du PDG. La chaîne redeviendra visible par tout le monde, sans code.",
    "eg_tv_set_private", () => ({ p_channel: c.id, p_on: false }), "🌐 Chaîne redevenue publique.");
  const makePrivateAgain = (c) => guarded(`Rendre « ${c.name} » privée avec son code ${c.privCode}`,
    "Pour confirmer, saisissez VOTRE code de sécurité du PDG. Le code de la chaîne ne change pas.",
    "eg_tv_set_private", () => ({ p_channel: c.id, p_on: true }), "🔒 Chaîne de nouveau privée.");
  const clearAccess = (c) => guarded(`Retirer l'accès aux ${c.privViewers} spectateur(s) de « ${c.name} »`,
    "Pour confirmer, saisissez VOTRE code de sécurité du PDG. Les spectateurs devront retaper un code valide.",
    "eg_tv_clear_access", c, "🚫 Accès retirés.");

  const sorted = [...rows].sort((a, b) => (a.channel_no ?? 1e9) - (b.channel_no ?? 1e9));
  const nPriv = rows.filter((c) => c.is_private).length;
  const nWait = rows.filter((c) => c.privPending).length;

  return (
    <div className="pc-panel">
      <div className="pc-head">
        <div className="pc-badge">🔐</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pc-eyebrow">ACCÈS PRIVÉS · RÉSERVÉ AU PDG</div>
          <h3 className="pc-title">Codes des chaînes privées</h3>
          <div className="pc-sub">{nPriv} chaîne(s) privée(s){nWait ? ` · ${nWait} code(s) en attente de validation` : ""}</div>
        </div>
      </div>
      <div className="pc-steps">
        <span><b>1</b> Générer un code</span><i>→</i><span><b>2</b> Le valider (votre code PDG)</span><i>→</i><span><b>3</b> Le responsable le donne à son public</span>
      </div>

      <div className="pc-table">
        <div className="pc-row pc-th">
          <span>Canal</span><span>Chaîne</span><span>Statut</span><span>Code actif</span><span>En attente</span><span>Accès</span><span />
        </div>
        {sorted.map((c) => {
          const status = c.is_private ? { t: "🔒 Privée", k: "priv" } : c.privCode ? { t: "🌐 Publique (code gardé)", k: "pub" } : { t: "🌐 Publique", k: "pub" };
          return (
            <div key={c.id} className={"pc-row" + (c.is_private ? " is-priv" : "")}>
              <span className="pc-no" data-l="Canal">{c.channel_no ?? "–"}</span>
              <span className="pc-name" data-l="Chaîne">{c.name}</span>
              <span data-l="Statut"><em className={"pc-status " + status.k}>{status.t}</em></span>
              <span data-l="Code actif" className={c.privCode ? "" : "pc-empty"}>
                <CodeChip code={c.privCode} kind="gold" />
                {c.privActivatedAt && c.privCode && <small className="pc-date">depuis le {dateOnly(c.privActivatedAt)}</small>}
              </span>
              <span data-l="En attente" className={c.privPending ? "" : "pc-empty"}>
                {c.privPending ? (
                  <span className="pc-pending">
                    <CodeChip code={c.privPending} kind="wait" />
                    <span className="pc-btns">
                      <button className="pc-btn ok" onClick={() => activate(c)}>✅ Valider</button>
                      <button className="pc-btn ghost" onClick={() => cancel(c)}>✕</button>
                    </span>
                  </span>
                ) : <span className="pc-none">—</span>}
              </span>
              <span data-l="Accès" className="pc-viewers">{c.privViewers || 0} 👥</span>
              <span className="pc-actions">
                <button className="pc-btn gold" onClick={() => generate(c)}>🔑 {c.privCode || c.privPending ? "Nouveau code" : "Générer un code"}</button>
                {c.is_private && <button className="pc-btn ghost" onClick={() => makePublic(c)}>🌐 Rendre publique</button>}
                {!c.is_private && c.privCode && <button className="pc-btn ghost" onClick={() => makePrivateAgain(c)}>🔒 Rendre privée</button>}
                {c.privViewers > 0 && <button className="pc-btn ghost" onClick={() => clearAccess(c)}>🚫 Retirer les accès</button>}
              </span>
            </div>
          );
        })}
      </div>
      <p className="pc-foot">Un code en attente ne débloque rien. Une fois validé, il remplace l'ancien code (qui cesse de fonctionner) ; les spectateurs déjà autorisés gardent l'accès, sauf si vous retirez les accès. L'équipe Epsilon voit toujours le contenu des chaînes privées.</p>
      {gate && <SecurityGate title={gate.title} note={gate.note} onConfirm={gate.run} onCancel={() => setGate(null)} />}
    </div>
  );
}
