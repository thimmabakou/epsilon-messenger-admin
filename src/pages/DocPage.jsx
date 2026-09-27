// Page publique d'un document officiel : affiche la dernière version PUBLIÉE (jamais le brouillon)
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { DOCUMENT_LINKS } from "../lib/constants";
import { dateOnly } from "../lib/format";
import { go } from "../lib/nav";

export default function DocPage({ id }) {
  const [doc, setDoc] = useState(undefined);
  useEffect(() => {
    supabase.rpc("public_documents").then(({ data }) => setDoc((data || []).find((d) => d.id === id) || null));
  }, [id]);
  const title = doc?.title || DOCUMENT_LINKS.find((d) => d.doc === id)?.label || "Document";

  return (<>
    <button className="ghost-button" onClick={() => go("/")} style={{ marginBottom: 16 }}>← Retour</button>
    <article className="public-doc">
      <span className="eyebrow">DOCUMENT OFFICIEL</span>
      <h1>{title}</h1>
      {doc && <p className="field-hint" style={{ margin: "0 0 18px" }}>Version {doc.version} · en vigueur depuis le {dateOnly(doc.published_at)}</p>}
      {doc === undefined
        ? <div className="public-doc-body" style={{ color: "var(--ink-soft)" }}>Chargement…</div>
        : doc
          ? <div className="public-doc-body">{doc.body}</div>
          : <div className="public-doc-body" style={{ color: "var(--ink-soft)" }}>Ce document est en cours de rédaction et sera bientôt disponible.</div>}
    </article>
    <p className="field-hint" style={{ textAlign: "center", marginTop: 18 }}>Une question ? <button className="link-button" onClick={() => go("/aide")}>Contacter le service client</button></p>
  </>);
}
