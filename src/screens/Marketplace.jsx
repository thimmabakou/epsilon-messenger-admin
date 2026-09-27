// Marketplace : boutiques et produits, contrôle après publication
import { Fragment, useState } from "react";
import { supabase, q, rpc } from "../lib/supabase";
import { useAdmin, useLoad, Loading } from "../lib/admin";
import { dateOnly, dateTime, fmt, fullName, statusLabel } from "../lib/format";
import { History, Note, Pills, ScreenTitle } from "../components/common";
import SanctionPanel from "../components/SanctionPanel";

export default function Marketplace() {
  const { act } = useAdmin();
  const [openShop, setOpenShop] = useState(null);
  const [panel, setPanel] = useState(null); // { type: "shop"|"product", id, mode }
  const [pf, setPf] = useState("Tous");

  const { data, error } = useLoad(async () => {
    const [shops, products, reported, sanctions] = await Promise.all([
      q(supabase.from("shops").select("*, owner:profiles!shops_owner_id_fkey(first_name,last_name)").order("created_at", { ascending: false })),
      q(supabase.from("products").select("*").order("published_at", { ascending: false }).limit(500)),
      q(supabase.from("reports").select("content_ref,target_user_id,status").eq("content_type", "produit").eq("status", "en_attente")),
      q(supabase.from("sanctions").select("*").or("shop_id.not.is.null,product_id.not.is.null").order("created_at", { ascending: false })),
    ]);
    return { shops, products, reported, sanctions };
  });
  const d = data || { shops: [], products: [], reported: [], sanctions: [] };
  const shopName = (id) => d.shops.find((s) => s.id === id)?.name || "—";
  const isReported = (p) => d.reported.some((r) => String(r.content_ref) === String(p.id));
  const shopReports = (s) => d.reported.filter((r) => r.target_user_id === s.owner_id).length;
  const weekAgo = Date.now() - 7 * 86400000;
  const products = d.products.filter((p) => pf === "Tous" || (pf === "Signalés" ? isReported(p) : p.status === "retire"));

  const confirm = async ({ rule, text, duration }) => {
    const { type, id, mode } = panel;
    const kind = type === "product" ? "retrait_produit" : mode === "suspend" ? "suspension" : "avertissement";
    const ok = await act(() => rpc("apply_sanction", { p_kind: kind, p_rule: rule, p_message: text || null, p_shop: type === "shop" ? id : null, p_product: type === "product" ? id : null, p_duration: duration }),
      type === "product" ? "🗑️ Produit retiré. Le vendeur a été prévenu." : mode === "suspend" ? "🚫 Boutique suspendue. Le compte personnel du vendeur reste actif." : "⚠️ Boutique avertie.");
    if (ok) setPanel(null);
  };
  const lift = (filterFn, msg) => act(async () => {
    const list = d.sanctions.filter((s) => !s.cancelled_at && filterFn(s));
    if (!list.length) throw new Error("Aucune sanction active à lever.");
    for (const s of list) await rpc("lift_sanction", { p_sanction: s.id, p_reason: "Levée depuis l'écran Marketplace" });
  }, msg);

  const panelFor = (type, id) => panel && panel.type === type && panel.id === id
    ? <SanctionPanel key={panel.mode} mode={type === "product" ? "remove" : panel.mode} onConfirm={confirm} onCancel={() => setPanel(null)} /> : null;

  return (<>
    <ScreenTitle eyebrow="COMMERCE" title="Marketplace" />
    <Note icon="ℹ️">Les vendeurs publient leurs produits immédiatement, sans validation préalable. Le contrôle se fait après : les produits signalés remontent ici automatiquement.</Note>
    <section className="users-summary">
      <div className="u-sum ok"><span>Boutiques actives</span><strong>{d.shops.filter((s) => s.status !== "suspendu").length}</strong></div>
      <div className="u-sum"><span>Produits en ligne</span><strong>{d.products.filter((p) => p.status === "en_ligne").length}</strong></div>
      <div className="u-sum bad"><span>Produits signalés</span><strong>{d.products.filter((p) => p.status === "en_ligne" && isReported(p)).length}</strong></div>
      <div className="u-sum"><span>Publications (7 jours)</span><strong>{fmt(d.products.filter((p) => new Date(p.published_at).getTime() > weekAgo).length)}</strong></div>
    </section>
    {!data && <Loading error={error} />}
    <div className="mp-section">
      <h2>Boutiques</h2>
      <div style={{ overflowX: "auto" }}><table className="mp-table">
        <thead><tr><th>Boutique</th><th>Produits</th><th>Signalements</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          {data && d.shops.length === 0 && <tr><td colSpan={5} className="reports-empty">Aucune boutique pour le moment.</td></tr>}
          {d.shops.map((s) => {
            const open = s.id === openShop;
            const st = statusLabel(s.status);
            const hist = d.sanctions.filter((x) => x.shop_id === s.id).map((x) => ({ action: `${x.kind === "suspension" ? "Boutique suspendue " + (x.duration || "") : "Boutique avertie"} — ${x.rule}${x.cancelled_at ? " (levée)" : ""}`, who: "Équipe", when: dateTime(x.created_at) }));
            return (<Fragment key={s.id}>
              <tr>
                <td><strong>{s.name}</strong><br /><span className="field-hint">{s.city || "—"}</span></td>
                <td>{d.products.filter((p) => p.shop_id === s.id && p.status === "en_ligne").length}</td>
                <td>{shopReports(s)}</td>
                <td><span className={"u-status " + st}>{st}</span></td>
                <td><div className="mp-actions"><button className="action-button neutral" onClick={() => { setOpenShop(open ? null : s.id); setPanel(null); }}>{open ? "Fermer" : "Voir"}</button></div></td>
              </tr>
              {open && <tr><td colSpan={5}><div className="mp-shop-detail">
                <div className="report-info-grid">
                  <div><span className="label">Vendeur</span><strong>{fullName(s.owner)}</strong></div>
                  <div><span className="label">Créée le</span><strong>{dateOnly(s.created_at)}</strong></div>
                </div>
                <div className="report-actions">
                  {s.status === "suspendu"
                    ? <button className="action-button ok" onClick={() => lift((x) => x.shop_id === s.id, "✅ Boutique réactivée.")}>✅ Réactiver la boutique</button>
                    : (<>
                      <button className="action-button warning" onClick={() => setPanel({ type: "shop", id: s.id, mode: "warn" })}>⚠️ Avertir</button>
                      <button className="action-button danger" onClick={() => setPanel({ type: "shop", id: s.id, mode: "suspend" })}>🚫 Suspendre la boutique</button>
                    </>)}
                </div>
                {panelFor("shop", s.id)}
                {hist.length > 0 && <History label="Historique de la boutique" rows={hist} />}
              </div></td></tr>}
            </Fragment>);
          })}
        </tbody>
      </table></div>
    </div>
    <div className="mp-section">
      <h2>Produits</h2>
      <Pills options={["Tous", "Signalés", "Retirés"]} value={pf} onChange={setPf} style={{ marginBottom: 12 }} />
      <div style={{ overflowX: "auto" }}><table className="mp-table">
        <thead><tr><th>Produit</th><th>Boutique</th><th>Prix</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          {data && products.length === 0 && <tr><td colSpan={5} className="reports-empty">Aucun produit dans cette catégorie.</td></tr>}
          {products.map((p) => (<Fragment key={p.id}>
            <tr>
              <td><strong>{p.name}</strong>{p.status === "en_ligne" && isReported(p) && <> <span className="sec-badge alert">Signalé</span></>}<br /><span className="field-hint">Publié le {dateOnly(p.published_at)}</span></td>
              <td>{shopName(p.shop_id)}</td>
              <td>{p.price_fcfa != null ? `${fmt(p.price_fcfa)} FCFA` : "—"}</td>
              <td><span className={"doc-status " + (p.status === "en_ligne" ? "published" : "draft")}>{p.status === "en_ligne" ? "En ligne" : "Retiré"}</span>{p.removed_reason && <><br /><span className="field-hint">{p.removed_reason}</span></>}</td>
              <td>{p.status === "en_ligne"
                ? <button className="action-button danger" onClick={() => setPanel({ type: "product", id: p.id, mode: "remove" })}>🗑️ Retirer</button>
                : <button className="action-button ok" onClick={() => lift((x) => x.product_id === p.id, "↩️ Produit remis en ligne.")}>↩️ Remettre en ligne</button>}</td>
            </tr>
            {panel && panel.type === "product" && panel.id === p.id && <tr><td colSpan={5}>{panelFor("product", p.id)}</td></tr>}
          </Fragment>))}
        </tbody>
      </table></div>
    </div>
  </>);
}
