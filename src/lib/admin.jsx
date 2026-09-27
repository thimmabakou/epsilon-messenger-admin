// Contexte partagé de l'espace administration : qui est connecté, ses permissions, les messages
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SECTION_PERMS, permLabel } from "./constants";
import { frenchError } from "./supabase";

const AdminCtx = createContext(null);
export const useAdmin = () => useContext(AdminCtx);

export function AdminProvider({ me, children, onGoto, onRequestPerm }) {
  const [toastState, setToast] = useState(null);
  const timer = useRef();
  const [version, setVersion] = useState(0); // incrémenté pour recharger compteurs et menus

  const toast = useCallback((msg, action) => {
    clearTimeout(timer.current);
    setToast({ msg, action });
    timer.current = setTimeout(() => setToast(null), action ? 6000 : 3500);
  }, []);

  const can = useCallback((perm) => !!me && (me.isPdg || me.perms.includes(perm)), [me]);
  const canSee = useCallback((section) => {
    const p = SECTION_PERMS[section];
    if (p == null) return true;
    if (p === "PDG") return !!me?.isPdg;
    return can(p) || (section === "settings" && (can("settings.backups") || can("settings.maintenance")));
  }, [me, can]);

  const deny = useCallback((perm) => {
    if (perm === "PDG") return toast("🔒 Action réservée au PDG.");
    toast(`🔒 Vous n'avez pas la permission « ${permLabel(perm)} ».`, {
      label: "Demander au PDG", run: () => onRequestPerm(perm),
    });
  }, [toast, onRequestPerm]);

  // Exécute une action serveur : message d'erreur propre, puis rafraîchissement
  const act = useCallback(async (fn, okMsg) => {
    try {
      const r = await fn();
      if (okMsg) toast(okMsg);
      setVersion((v) => v + 1);
      return r ?? true;
    } catch (e) {
      toast("⚠️ " + frenchError(e));
      return false;
    }
  }, [toast]);

  const value = { me, can, canSee, deny, toast, act, goto: onGoto, version, refresh: () => setVersion((v) => v + 1) };
  return (
    <AdminCtx.Provider value={value}>
      {children}
      {toastState && (
        <div className="toast" style={{ display: "block" }}>
          {toastState.msg}
          {toastState.action && (
            <button onClick={() => { setToast(null); toastState.action.run(); }}>{toastState.action.label}</button>
          )}
        </div>
      )}
    </AdminCtx.Provider>
  );
}

// Charge des données au montage (et à chaque rafraîchissement demandé)
export function useLoad(loader, deps = []) {
  const ctx = useContext(AdminCtx);
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const reload = useCallback(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    loader().then(
      (data) => alive && setState({ data, error: null, loading: false }),
      (e) => alive && setState({ data: null, error: frenchError(e), loading: false }),
    );
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(reload, [reload, ctx?.version]);
  return { ...state, reload };
}

export function Loading({ error }) {
  if (error) return <div className="privacy-note"><span>⚠️</span><span>{error}</span></div>;
  return <p className="reports-empty">Chargement…</p>;
}
