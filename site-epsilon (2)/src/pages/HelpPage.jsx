// Centre d'aide public : explique comment joindre le service client ou signaler un contenu depuis l'application
import { useState } from "react";

export default function HelpPage() {
  const [mode, setMode] = useState(null);
  return (<>
    <div className="screen-title"><div><span className="eyebrow">SUPPORT &amp; SÉCURITÉ</span><h1>Centre d'aide et de sécurité</h1></div></div>
    <p className="help-subtitle">Besoin d'aide ou signaler un contenu ?</p>

    {!mode && (
      <div className="help-choices">
        <button className="help-choice-card" onClick={() => setMode("support")}><span>🎧</span><strong>Contacter le service client</strong><span className="desc">Une question, un problème avec votre compte</span></button>
        <button className="help-choice-card danger" onClick={() => setMode("report")}><span>🚩</span><strong>Signaler un contenu</strong><span className="desc">Nudité, harcèlement, menace, etc.</span></button>
      </div>
    )}

    {mode === "support" && (
      <div className="help-confirmation">
        <span>🎧</span>
        <strong>Le service client est dans votre application</strong>
        <span className="desc">Ouvrez Epsilon Messenger : le contact « Service client » est épinglé en premier dans vos discussions. Écrivez-lui ou appelez-le directement. Votre demande arrive tout de suite à notre équipe, et vous recevez la réponse au même endroit.</span>
        <button className="ghost-button" onClick={() => setMode(null)}>Retour au centre d'aide</button>
      </div>
    )}

    {mode === "report" && (
      <div className="help-confirmation">
        <span>🚩</span>
        <strong>Signaler depuis l'application</strong>
        <span className="desc">Sur le statut, la vidéo, l'image, le profil ou le produit concerné, touchez « ⋮ » puis « Signaler ». Choisissez le motif et expliquez le problème : une copie du contenu est automatiquement jointe à votre signalement, et notre équipe l'examine rapidement.</span>
        <button className="ghost-button" onClick={() => setMode(null)}>Retour au centre d'aide</button>
      </div>
    )}
  </>);
}
