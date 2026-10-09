// Discussion signalée : le message signalé et les messages précédents, envoyés par le téléphone de la personne
// qui a signalé (les discussions sont chiffrées de bout en bout : le site ne peut rien lire d'autre).
// Chaque message porte la signature de son auteur : on vérifie ici qu'il n'a pas été inventé ni modifié.
import { useEffect, useRef, useState } from "react";
import { supabase, q } from "../lib/supabase";
import { dateTime, fullName, shortId } from "../lib/format";

const SIG = { name: "ECDSA", namedCurve: "P-256" };
const te = new TextEncoder();
function unb64(s) {
  const bin = atob(s);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}
// Même texte signé que dans l'application (fichier src/lib/e2eCrypto.js de l'application)
const signedText = ({ cid, convId, senderId, type, body, name }) =>
  JSON.stringify(["EPSM1", String(cid), String(convId), String(senderId), String(type || "text"), body || "", name || ""]);

async function verify(jwk, fields, s) {
  try {
    const k = await crypto.subtle.importKey("jwk", { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }, SIG, false, ["verify"]);
    return await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, k, unb64(s), te.encode(signedText(fields)));
  } catch { return false; }
}

const KIND = { image: "📷 Photo", video: "🎥 Vidéo", voice: "🎤 Message vocal", audio: "🎵 Audio", file: "📄 Document", product: "🛍️ Produit" };

export default function ReportedChat({ report }) {
  const ev = report.evidence;
  const items = ev?.items || [];
  const [people, setPeople] = useState({});
  const [checks, setChecks] = useState({}); // id → "ok" | "bad" | "plain"
  const logged = useRef(null);

  useEffect(() => {
    if (!items.length) return;
    // Chaque ouverture d'un dossier avec discussion est inscrite au journal de sécurité
    if (logged.current !== report.id) {
      logged.current = report.id;
      supabase.rpc("eg_report_opened", { p_report: String(report.id) }).then(() => {}, () => {});
    }
    let alive = true;
    const ids = [...new Set(items.map((m) => m.sender_id))];
    (async () => {
      const [profs, keys] = await Promise.all([
        q(supabase.from("profiles").select("id,first_name,last_name").in("id", ids)).catch(() => []),
        q(supabase.from("user_keys").select("user_id,sig_pub").in("user_id", ids)).catch(() => []),
      ]);
      if (!alive) return;
      setPeople(Object.fromEntries(profs.map((p) => [p.id, p])));
      const kBy = Object.fromEntries(keys.map((k) => [k.user_id, k.sig_pub]));
      const out = {};
      for (const m of items) {
        if (!m.encrypted || !m.sig) { out[m.id] = "plain"; continue; }
        const jwk = kBy[m.sender_id];
        out[m.id] = jwk && await verify(jwk, { cid: m.cid, convId: ev.conversation, senderId: m.sender_id, type: m.type, body: m.body, name: m.name }, m.sig) ? "ok" : "bad";
      }
      if (alive) setChecks(out);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id]);

  if (!items.length) return null;
  const reported = items.find((m) => m.reported);
  const verdict = reported ? checks[reported.id] : null;
  const who = (id) => (people[id] ? fullName(people[id]) : shortId(id));

  return (
    <div className="report-content-box">
      <span className="label">Discussion signalée — envoyée par le téléphone du signaleur ({items.length - 1} message{items.length - 1 > 1 ? "s" : ""} avant le message signalé)</span>
      {verdict && (
        <div className={"rc-verdict " + verdict}>
          {verdict === "ok" ? "✓ Authentique : le message signalé porte la signature de son auteur et n'a pas été modifié."
            : verdict === "bad" ? "⚠ Non vérifié : la signature ne correspond pas. Le message a pu être modifié ou inventé (ou l'auteur a changé de clés depuis)."
            : "ℹ Message envoyé avant le chiffrement : son authenticité ne peut pas être vérifiée."}
        </div>
      )}
      <div className="rc-thread">
        {items.map((m) => (
          <div key={m.id} className={"rc-msg" + (m.reported ? " reported" : "") + (m.sender_id === report.target_user_id ? " target" : "")}>
            <div className="rc-head">
              <strong>{who(m.sender_id)}</strong>
              <span>{dateTime(m.created_at)}{m.edited_at ? " · modifié" : ""}</span>
              {checks[m.id] === "ok" && <span className="rc-badge ok">Authentique ✓</span>}
              {checks[m.id] === "bad" && <span className="rc-badge bad">Non vérifié ⚠</span>}
            </div>
            <div className="rc-body">
              {m.type === "system" ? <em>Message automatique du groupe</em>
                : <>{KIND[m.type] ? <span className="rc-kind">{KIND[m.type]}{m.name ? ` · ${m.name}` : ""}</span> : null}{m.body || (KIND[m.type] ? "" : <em>(vide ou supprimé)</em>)}</>}
            </div>
          </div>
        ))}
      </div>
      <p className="field-hint" style={{ margin: "8px 0 0" }}>🔒 Le reste de cette discussion reste chiffré : personne ne peut le consulter depuis ce site. Cette consultation est inscrite au journal de sécurité.</p>
    </div>
  );
}
