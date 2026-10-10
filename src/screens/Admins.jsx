// Administrateurs et permissions : case par case, jamais les droits du PDG
import { useState } from "react";
import { supabase, q, rpc, invokeFn } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { PERMISSION_GROUPS, PROFILE_PRESETS } from "../lib/constants";
import { dateTime, initials } from "../lib/format";
import { Empty, History, Note, ScreenTitle, SecurityGate } from "../components/common";

export default function Admins() {
  const { me, act } = useAdmin();
  const [selId, setSelId] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inv, setInv] = useState({ name: "", email: "", phone: "+242" });
  const [gate, setGate] = useState(null);

  const { data, error, reload } = useLoad(async () => {
    const [admins, perms] = await Promise.all([
      q(supabase.from("admins").select("*").eq("is_pdg", false).order("created_at")),
      q(supabase.from("admin_permissions").select("admin_id,perm_key")),
    ]);
    return admins.map((a) => ({ ...a, perms: perms.filter((p) => p.admin_id === a.user_id).map((p) => p.perm_key) }));
  });
  const admins = (data || []).filter((a) => a.user_id !== me.id && !a.deleted_at);
  const a = admins.find((x) => x.user_id === selId);

  const log = useLoad(async () => a && me.isPdg
    ? q(supabase.from("security_log").select("actor_name,action,created_at").or(`actor_id.eq.${a.user_id},action.ilike."%${a.display_name.replace(/[%,()"]/g, "")}%"`).order("created_at", { ascending: false }).limit(8))
    : [], [selId]);

  const invite = async () => {
    const r = await act(() => invokeFn("invite-admin", { name: inv.name.trim(), email: inv.email.trim(), phone: inv.phone.replace(/\s/g, ""), redirectTo: window.location.origin + "/" }),
      "✉️ Invitation envoyée. L'administrateur démarre sans aucune permission : cochez maintenant ce qu'il peut faire.");
    if (r) { setSelId(r.id); setInviteOpen(false); setInv({ name: "", email: "", phone: "+242" }); }
  };
  const toggle = (key, grant) => act(() => rpc("set_admin_permission", { p_admin: a.user_id, p_perm: key, p_grant: grant }));
  const profile = (label) => label === "Personnalisé" ? null : act(() => rpc("apply_admin_profile", { p_admin: a.user_id, p_label: label, p_perms: PROFILE_PRESETS[label] }), `Profil « ${label} » appliqué.`);
  const clear = () => act(() => rpc("apply_admin_profile", { p_admin: a.user_id, p_label: "Personnalisé", p_perms: [] }), "Toutes les permissions ont été retirées.");
  const setActive = () => act(() => rpc("set_admin_active", { p_admin: a.user_id, p_active: !a.active }), a.active ? "Administrateur désactivé." : "Administrateur réactivé.");

  // Supprimer définitivement (PDG seulement, avec le code de sécurité du PDG)
  const remove = () => setGate({
    title: `Supprimer définitivement l'administrateur « ${a.display_name} »`,
    run: async (code) => {
      setGate(null);
      const r = await act(() => rpc("eg_admin_delete", { p_admin: a.user_id, p_code: code }),
        `🗑 « ${a.display_name} » a été supprimé. Il n'a plus aucun accès au site.`);
      if (r) { setSelId(null); reload?.(); }
    },
  });

  let detail;
  if (!a) detail = <Empty icon="🔑" text="Sélectionnez un administrateur pour définir ses permissions" />;
  else detail = (<>
    <div className="report-detail-header" style={{ marginBottom: 0 }}>
      <div className="user-head">
        <div className="u-avatar big">{initials(a.display_name)}</div>
        <div><h2>{a.display_name}</h2><div className="sub">{a.email} · {a.phone || "pas de numéro"}</div></div>
      </div>
      <button className="icon-button" onClick={() => setSelId(null)}>✕</button>
    </div>
    <div className="report-actions" style={{ marginBottom: 14 }}>
      <button className={"action-button " + (a.active ? "danger" : "ok")} onClick={setActive}>{a.active ? "⏸ Désactiver" : "▶ Réactiver"}</button>
      <button className="action-button neutral" onClick={clear}>🧹 Retirer toutes les permissions</button>
      {me.isPdg && <button className="action-button danger" onClick={remove}>🗑 Supprimer (code PDG)</button>}
    </div>
    {me.isPdg && <JobTitle key={a.user_id} admin={a} />}
    <span className="field-hint">Appliquer un profil type (vous pourrez ensuite ajuster case par case)</span>
    <div className="pill-group" style={{ margin: "6px 0 14px" }}>
      {[...Object.keys(PROFILE_PRESETS), "Personnalisé"].map((pn) => <button key={pn} className={"pill" + (a.profile_label === pn ? " active" : "")} onClick={() => profile(pn)}>{pn}</button>)}
    </div>
    {PERMISSION_GROUPS.map((g) => (
      <div key={g.title} className="perm-group"><h3>{g.title}</h3>
        {g.items.map((it) => (
          <label key={it.key} className={"perm-item" + (it.ownerOnly ? " locked" : "")}>
            <input type="checkbox" checked={a.perms.includes(it.key)} disabled={it.ownerOnly} onChange={(e) => toggle(it.key, e.target.checked)} />
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.ownerOnly ? <span className="perm-flag owner">PDG uniquement</span> : it.sensitive ? <span className="perm-flag sensitive">Sensible</span> : null}
          </label>
        ))}
      </div>
    ))}
    {me.isPdg && <History label="Historique des actions de cet administrateur" rows={(log.data || []).map((h) => ({ action: h.action, who: h.actor_name, when: dateTime(h.created_at) }))} />}
  </>);

  return (<>
    <ScreenTitle eyebrow="ÉQUIPE" title="Administrateurs et permissions" />
    <Note icon="🔐">Pas de rôles imposés : vous décidez permission par permission. Les administrateurs n'obtiennent jamais vos droits de PDG, et ne peuvent pas s'attribuer eux-mêmes de permissions.</Note>
    <div className="users-layout">
      <div className="reports-list" style={{ maxHeight: "none" }}>
        {me.isPdg && <div className="owner-card"><strong>👑 Vous — PDG</strong><span>Toutes les permissions · compte principal verrouillé : personne ne peut modifier vos droits.</span></div>}
        {inviteOpen ? (
          <div className="invite-form">
            <strong style={{ fontSize: 13 }}>Inviter un administrateur</strong>
            <input placeholder="Nom" value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} autoComplete="off" />
            <input placeholder="Adresse e-mail" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} autoComplete="off" />
            <input placeholder="Téléphone (+242…)" value={inv.phone} onChange={(e) => setInv({ ...inv, phone: e.target.value })} autoComplete="off" inputMode="tel" />
            <span className="field-hint">La personne reçoit une invitation par e-mail pour choisir son mot de passe. Elle démarre sans aucun pouvoir : vous cochez ensuite ce qu'elle peut faire. Ses codes de connexion arriveront par SMS sur ce numéro.</span>
            <div className="mp-actions"><button className="action-button primary" onClick={invite}>Envoyer l'invitation</button><button className="action-button neutral" onClick={() => setInviteOpen(false)}>Annuler</button></div>
          </div>
        ) : <button className="primary-button" onClick={() => setInviteOpen(true)} style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}>＋ Inviter un administrateur</button>}
        {!data && <Loading error={error} />}
        {data && admins.length === 0 && <p className="reports-empty">Aucun autre administrateur pour le moment.</p>}
        {admins.map((ad) => (
          <button key={ad.user_id} className={"user-row" + (ad.user_id === selId ? " active" : "")} onClick={() => setSelId(ad.user_id)}>
            <div className="u-avatar">{initials(ad.display_name)}</div>
            <div className="u-main"><strong>{ad.display_name}</strong><span>{ad.profile_label} · {ad.perms.length} permission(s)</span></div>
            <span className={"u-status " + (ad.active ? "Actif" : "Suspendu")}>{ad.active ? "Actif" : "Désactivé"}</span>
          </button>
        ))}
      </div>
      <div className="report-detail">{detail}</div>
    </div>
    {gate && <SecurityGate title={gate.title} onConfirm={gate.run} onCancel={() => setGate(null)} />}
  </>);
}

// Poste de l'administrateur : c'est le nom sous lequel il apparaît dans la messagerie de l'équipe
function JobTitle({ admin }) {
  const { act } = useAdmin();
  const [v, setV] = useState(admin.job_title || "");
  const save = () => act(() => rpc("eg_team_set_title", { p_admin: admin.user_id, p_title: v }), "Poste enregistré.");
  return (
    <div style={{ marginBottom: 14 }}>
      <span className="field-hint">Poste (nom affiché dans la messagerie de l'équipe, ex. « Administrateur commercial »)</span>
      <div className="conv-reply" style={{ marginTop: 6 }}>
        <input value={v} maxLength={60} placeholder="Ex. Administrateur commercial" onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} />
        <button className="primary-button" onClick={save} style={{ padding: "10px 16px" }}>Enregistrer</button>
      </div>
    </div>
  );
}
