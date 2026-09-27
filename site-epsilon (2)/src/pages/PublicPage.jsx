// Page d'accueil publique
import { useState } from "react";
import { DOCUMENT_LINKS, FEATURES } from "../lib/constants";
import { go } from "../lib/nav";

export default function PublicPage() {
  const [soon, setSoon] = useState(false);
  return (<>
    <section className="public-hero">
      <div className="public-hero-content">
        <span className="eyebrow">EPSILON MESSENGER</span>
        <h1>Un renouveau de la messagerie, pensé et fait au Congo</h1>
        <p>Discutez, appelez, publiez des statuts et vendez sur une seule application pensée pour l'Afrique.</p>
        <button className="primary-button" onClick={() => setSoon(true)}>⬇️ Télécharger l'application</button>
        {soon && <p style={{ marginTop: 10, fontSize: 14 }}>L'application sera bientôt disponible au téléchargement.</p>}
      </div>
    </section>
    <section className="public-features">
      <h2>Fonctionnalités</h2>
      <div className="feature-grid">
        {FEATURES.map((f) => <div key={f.label} className="feature-chip"><span>{f.icon}</span><span>{f.label}</span></div>)}
      </div>
    </section>
    <section className="public-documents">
      <h2>Documents &amp; assistance</h2>
      <div className="document-grid">
        {DOCUMENT_LINKS.map((d) => (
          <button key={d.label} className="document-card" onClick={() => go(d.doc ? "/doc/" + d.doc : "/aide")}>
            <span style={{ fontSize: 20 }}>{d.icon}</span><span>{d.label}</span>
          </button>
        ))}
      </div>
    </section>
    <footer className="public-footer">© Epsilon Messenger — www.epsilonmessenger.cg — Fait au Congo</footer>
  </>);
}
