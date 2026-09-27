// Appels du service client : manqués à rappeler et historique
import { supabase, q } from "../lib/supabase";
import { useLoad, Loading } from "../lib/admin";
import { dateTime, duration, fullName, maskPhone } from "../lib/format";
import { ScreenTitle } from "../components/common";

export default function Calls() {
  const { data, error } = useLoad(() => q(supabase.from("support_calls")
    .select("*, user:profiles!support_calls_user_id_fkey(first_name,last_name,phone)")
    .order("started_at", { ascending: false }).limit(300)));
  const calls = data || [];
  const today = new Date().toDateString();
  const todayCalls = calls.filter((c) => new Date(c.started_at).toDateString() === today);
  const answered = calls.filter((c) => !c.missed);
  const missed = calls.filter((c) => c.missed);
  const avg = answered.length ? Math.round(answered.reduce((n, c) => n + (c.duration_seconds || 0), 0) / answered.length) : null;

  return (<>
    <ScreenTitle eyebrow="SERVICE CLIENT" title="Appels" />
    <section className="calls-summary">
      <div className="u-sum"><span>Appels aujourd'hui</span><strong>{todayCalls.length}</strong></div>
      <div className="u-sum ok"><span>Répondus</span><strong>{answered.length}</strong></div>
      <div className="u-sum bad"><span>Manqués</span><strong>{missed.length}</strong></div>
      <div className="u-sum"><span>Durée moyenne</span><strong>{avg == null ? "—" : duration(avg)}</strong></div>
    </section>
    <div className="call-note">🔒 Les appels du service client sont enregistrés, séparément des appels privés entre utilisateurs. Le client en est informé une seule fois, lors de son premier appel. Les enregistrements s'effacent automatiquement après <strong>3 mois</strong>. Seules les personnes ayant la permission « Écouter les appels enregistrés » peuvent les écouter.</div>
    {!data && <Loading error={error} />}
    <div className="mp-section">
      <h2>Appels manqués — à rappeler</h2>
      <div className="sec-card" style={{ padding: "0 4px" }}>
        {missed.length === 0 ? <p className="reports-empty" style={{ padding: 14 }}>Aucun appel manqué.</p> :
          missed.map((c) => (
            <div key={c.id} className="call-missed-row"><div className="sec-row-main"><strong>{fullName(c.user)}</strong><span>{dateTime(c.started_at)} · {maskPhone(c.user?.phone)}</span></div>
              {c.user?.phone && <a className="action-button ok" href={`tel:${c.user.phone}`} style={{ textDecoration: "none" }}>📞 Rappeler</a>}</div>
          ))}
      </div>
    </div>
    <div className="mp-section">
      <h2>Historique des appels</h2>
      <div style={{ overflowX: "auto" }}><table className="call-table">
        <thead><tr><th>Client</th><th>Date</th><th>Durée</th><th>Enregistrement</th></tr></thead>
        <tbody>
          {answered.length === 0 && <tr><td colSpan={4} className="reports-empty">Aucun appel pour le moment.</td></tr>}
          {answered.map((c) => (
            <tr key={c.id}><td><strong>{fullName(c.user)}</strong></td><td>{dateTime(c.started_at)}</td><td>{duration(c.duration_seconds)}</td>
              <td>{c.recording_path ? <span className="sec-badge">Enregistré</span> : "—"}</td></tr>
          ))}
        </tbody>
      </table></div>
    </div>
  </>);
}
