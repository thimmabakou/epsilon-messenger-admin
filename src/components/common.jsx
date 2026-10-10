// Petits éléments réutilisés sur plusieurs écrans
import { useState } from "react";
import { rpc } from "../lib/supabase";

export function PwInput({ id, value, onChange, placeholder, autoComplete = "off", style, onEnter }) {
  const [show, setShow] = useState(false);
  return (
    <span className="pw-wrap">
      <input id={id} type={show ? "text" : "password"} value={value} placeholder={placeholder} autoComplete={autoComplete}
        style={style} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()} />
      <button type="button" className="pw-eye" onClick={() => setShow(!show)}
        title={show ? "Masquer" : "Afficher"} aria-label={show ? "Masquer" : "Afficher"}>{show ? "🙈" : "👁️"}</button>
    </span>
  );
}

export function Empty({ icon, text }) {
  return <div className="report-detail-empty"><span style={{ fontSize: 26 }}>{icon}</span><span>{text}</span></div>;
}

export function ScreenTitle({ eyebrow, title, children }) {
  return <div className="screen-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>{children}</div>;
}

export function Note({ icon, children, style }) {
  return <div className="privacy-note" style={style}><span>{icon}</span><span>{children}</span></div>;
}

export function Pills({ options, value, onChange, style }) {
  return (
    <div className="pill-group" style={style}>
      {options.map((o) => {
        const [k, l] = Array.isArray(o) ? o : [o, o];
        return <button key={k} className={"pill" + (k === value ? " active" : "")} onClick={() => onChange(k)}>{l}</button>;
      })}
    </div>
  );
}

export function History({ label, rows, empty = "Aucune action enregistrée." }) {
  return (
    <div className="user-history">
      <span className="label">{label}</span>
      {rows.length === 0
        ? <p className="reports-empty" style={{ padding: "6px 0" }}>{empty}</p>
        : rows.map((h, i) => <div key={i} className="history-row"><strong>{h.action}</strong><span>{h.who} · {h.when}</span></div>)}
    </div>
  );
}

// Fenêtre qui demande le code de sécurité du PDG avant une action critique
export function SecurityGate({ title, onConfirm, onCancel }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    if (!code) return setError("Saisissez votre code de sécurité.");
    setBusy(true); setError("");
    try {
      const ok = await rpc("check_pdg_code", { p_code: code });
      if (!ok) { setError("Code incorrect. Si vous n'avez pas encore créé votre code, faites-le dans Sécurité. Après 5 erreurs, il est bloqué 15 minutes."); setCode(""); setBusy(false); return; }
      await onConfirm(code);
    } catch (e) { setError(e.message); setBusy(false); }
  };
  return (
    <div className="gate-modal-overlay">
      <div className="gate-modal">
        <h3>🔐 {title}</h3>
        <p>Cette action est protégée. Saisissez votre <strong>code de sécurité du PDG</strong> pour confirmer.</p>
        <PwInput id="gate-code" value={code} onChange={setCode} placeholder="••••••••" style={{ letterSpacing: 2 }} onEnter={confirm} />
        {error && <div className="gate-error">{error}</div>}
        <div className="gate-actions">
          <button className="action-button danger" disabled={busy} onClick={confirm}>{busy ? "Vérification…" : "Confirmer"}</button>
          <button className="action-button neutral" onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

// Photo de profil (ou initiales si la personne n'a pas de photo / si l'image ne se charge pas)
export function Avatar({ url, name, big, style }) {
  const [broken, setBroken] = useState(false);
  const letters = String(name || "?").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className={"u-avatar" + (big ? " big" : "")} style={style}>
      {url && !broken
        ? <img src={url} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} />
        : letters}
    </div>
  );
}
