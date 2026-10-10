// Double vérification d'un paiement Mobile Money (boutiques, publicités) :
// case 1 = code donné par le commerçant (verrouillée, impossible à modifier),
// case 2 = code reçu dans le SMS de l'administrateur. Les deux deviennent vertes quand ils sont identiques ;
// « Valider » ne s'active qu'à ce moment-là. La base de données refait la même comparaison et refuse
// un code déjà consommé (registre permanent).
import { useState } from "react";

export const normRef = (s) => String(s || "").toUpperCase().replace(/[\s\-_.:/]/g, "");

export default function PayCodeCheck({ title, sellerRef, amount, details, onValidate, onRefuse, onCancel, validateLabel = "✅ Valider" }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const typed = normRef(code);
  const match = typed.length > 0 && typed === normRef(sellerRef);
  const wrong = typed.length > 0 && !match;
  const tone = match ? "ok" : wrong ? "bad" : "";

  async function validate() {
    if (!match || busy) return;
    setBusy(true);
    try { await onValidate(code.trim()); } finally { setBusy(false); }
  }

  return (
    <div className="pcc-back" onClick={() => !busy && onCancel()}>
      <div className="ver-form pcc" onClick={(e) => e.stopPropagation()}>
        <strong style={{ fontSize: 15 }}>{title}</strong>
        {details && <span className="field-hint">{details}</span>}
        {amount != null && <span className="field-hint">Montant attendu : <b>{amount}</b> — vérifiez-le aussi dans votre SMS.</span>}

        <label className="pcc-label">1 · Code émis par le vendeur <span>🔒 non modifiable</span></label>
        <input className={"pcc-input locked " + tone} value={sellerRef || ""} readOnly tabIndex={-1} onCopy={(e) => e.preventDefault()} />

        <label className="pcc-label">2 · Code reçu par l'administrateur <span>(recopiez celui de votre SMS)</span></label>
        <input className={"pcc-input " + tone} value={code} maxLength={40} autoFocus autoComplete="off" spellCheck={false}
          placeholder="Code de la transaction reçu par SMS" onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && validate()} />

        <div className={"pcc-verdict " + tone}>
          {match ? "✅ Code valide — les deux codes sont identiques."
            : wrong ? "❌ Code non conforme — les deux codes ne correspondent pas. Ne validez pas."
            : "En attente du code reçu dans votre SMS…"}
        </div>
        <span className="field-hint">Majuscules, espaces et tirets ne comptent pas. Un code déjà validé une fois est refusé pour toujours.</span>

        <div className="mp-actions">
          <button className="action-button primary" disabled={!match || busy} onClick={validate}>{busy ? "…" : validateLabel}</button>
          <button className="action-button danger" disabled={busy} onClick={onRefuse}>❌ Refuser</button>
          <button className="action-button neutral" disabled={busy} onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
}
