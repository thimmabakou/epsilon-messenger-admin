// Documents publics : brouillon par l'équipe, publication par le PDG uniquement
import { useEffect, useState } from "react";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly, dateTime } from "../lib/format";
import { Note, ScreenTitle } from "../components/common";

export default function Documents() {
  const { me, act } = useAdmin();
  const [selId, setSelId] = useState(null);
  const [preview, setPreview] = useState(false);
  const [text, setText] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const { data, error } = useLoad(async () => {
    const [docs, versions] = await Promise.all([
      q(supabase.from("documents").select("*").order("title")),
      q(supabase.from("document_versions").select("id,document_id,version,body,note,published_at").order("version")),
    ]);
    return docs.map((d) => ({ ...d, versions: versions.filter((v) => v.document_id === d.id) }));
  });
  const docs = data || [];
  const doc = docs.find((d) => d.id === selId);

  useEffect(() => {
    if (!doc) return;
    const last = doc.versions[doc.versions.length - 1];
    setText(doc.draft_body ?? last?.body ?? "");
    setSavedMsg(""); setPreview(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId, !!data]);

  const status = (d) => {
    const last = d.versions[d.versions.length - 1];
    if (!last) return "Brouillon";
    return d.draft_body != null && d.draft_body !== last.body ? "Brouillon" : "Publié";
  };
  const updated = (d) => d.draft_updated_at || d.versions[d.versions.length - 1]?.published_at;

  const saveDraft = async () => {
    if (await act(() => rpc("save_document_draft", { p_doc: doc.id, p_body: text }))) setSavedMsg("Brouillon enregistré. Le public voit toujours la dernière version publiée.");
  };
  const publish = async () => {
    const note = window.prompt("Note de version (ex. : ajout de la règle sur l'usurpation d'identité) :", "Mise à jour");
    if (note === null) return;
    const v = await act(() => rpc("publish_document", { p_doc: doc.id, p_body: text, p_note: note || null }));
    if (v) setSavedMsg(`Version ${v} publiée : elle est visible sur le site public.`);
  };

  return (<>
    <ScreenTitle eyebrow="CONTENUS OFFICIELS" title="Documents publics" />
    <Note icon="📌"><strong>Règles de communauté</strong> = ce qui est autorisé ou interdit de publier. <strong>Politique de confidentialité</strong> = comment les données personnelles sont protégées. Ce sont deux documents distincts.</Note>
    <div className="reports-layout" style={{ gridTemplateColumns: "1fr" }}>
      <div className="doc-list">
        {!data && <Loading error={error} />}
        {docs.map((d) => (
          <button key={d.id} className={"doc-row" + (d.id === selId ? " active" : "")} onClick={() => setSelId(d.id === selId ? null : d.id)}>
            <span style={{ fontSize: 20 }}>📄</span>
            <div className="doc-row-main"><strong>{d.title}</strong><span>Mis à jour le {dateOnly(updated(d))} · {d.versions.length} version(s) publiée(s)</span></div>
            <span className={"doc-status " + (status(d) === "Publié" ? "published" : "draft")}>{status(d)}</span>
          </button>
        ))}
      </div>
      {doc && (
        <div className="doc-editor">
          <div className="report-detail-header">
            <div><span className="report-id">{doc.id}</span><h2>{doc.title}</h2></div>
            <button className="icon-button" onClick={() => setSelId(null)}>✕</button>
          </div>
          <div className="pill-group" style={{ marginBottom: 10 }}>
            <button className={"pill" + (!preview ? " active" : "")} onClick={() => setPreview(false)}>✏️ Modifier</button>
            <button className={"pill" + (preview ? " active" : "")} onClick={() => setPreview(true)}>👁️ Prévisualiser</button>
          </div>
          {preview ? <div className="doc-preview-box">{text}</div> : <textarea value={text} onChange={(e) => setText(e.target.value)} />}
          <div className="doc-editor-actions" style={{ marginTop: 12 }}>
            <button className="action-button neutral" onClick={saveDraft}>💾 Enregistrer en brouillon</button>
            {me.isPdg
              ? <button className="action-button primary" onClick={publish}>🚀 Publier</button>
              : <button className="action-button neutral" disabled title="Réservé au PDG">🔒 Publier (réservé au PDG)</button>}
          </div>
          {savedMsg && <p className="field-hint" style={{ color: "#1c8a4b", margin: "0 0 10px" }}>{savedMsg}</p>}
          <p className="field-hint">Les autres administrateurs peuvent préparer un brouillon, mais seul le PDG peut publier.</p>
          <div className="doc-versions">
            <span className="label">Historique des versions</span>
            {doc.versions.length === 0 ? <p className="reports-empty" style={{ padding: "6px 0" }}>Jamais publié.</p> :
              doc.versions.slice().reverse().map((v) => <div key={v.id} className="history-row"><strong>v{v.version} — {v.note || "Publication"}</strong><span>PDG · {dateTime(v.published_at)}</span></div>)}
          </div>
        </div>
      )}
    </div>
  </>);
}
