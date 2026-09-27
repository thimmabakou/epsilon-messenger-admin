// Panneau de sanction : avertir / suspendre / retirer, avec la règle enfreinte et une explication
import { useState } from "react";
import { DURATIONS, VIOLATION_RULES } from "../lib/constants";
import { Pills } from "./common";

export default function SanctionPanel({ mode, onConfirm, onCancel }) {
  const [rule, setRule] = useState(VIOLATION_RULES[0]);
  const [text, setText] = useState("");
  const [dur, setDur] = useState("7 jours");
  const [busy, setBusy] = useState(false);
  const isSuspend = mode === "suspend";
  const isRemove = mode === "remove";
  const title = isSuspend ? "Suspendre le compte" : isRemove ? "Retirer le contenu" : "Avertir l'utilisateur";
  const confirmLabel = isSuspend ? "Confirmer la suspension" : isRemove ? "Confirmer le retrait" : "Envoyer l'avertissement";

  const confirm = async () => {
    setBusy(true);
    await onConfirm({ rule, text: text.trim(), duration: isSuspend ? dur : null });
    setBusy(false);
  };

  return (
    <div className="suspend-box">
      <span className="label">{title}</span>
      {isSuspend && (<>
        <span className="field-hint">Durée</span>
        <Pills options={DURATIONS} value={dur} onChange={setDur} style={{ margin: "6px 0 12px" }} />
      </>)}
      <span className="field-hint">Règle enfreinte</span>
      <Pills options={VIOLATION_RULES} value={rule} onChange={setRule} style={{ margin: "6px 0 12px" }} />
      <span className="field-hint">Explication pour la personne (ajoutée au message officiel)</span>
      <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Ex. : votre statut du 23/09 contenait une photo dénudée, interdite dans les espaces publics." />
      <div className="privacy-note" style={{ margin: "10px 0 0" }}><span>💬</span><span>Ce message sera envoyé à la personne dans sa conversation avec le contact <strong>Service client</strong> épinglé. Elle pourra y répondre, et sa réponse arrivera dans votre boîte de réception.</span></div>
      <div className="row">
        <button className="action-button danger" disabled={busy} onClick={confirm}>{busy ? "Envoi…" : confirmLabel}</button>
        <button className="action-button neutral" onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}
