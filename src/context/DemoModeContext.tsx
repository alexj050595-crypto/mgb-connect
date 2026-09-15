"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface DemoModeContextValue {
  enabled: boolean;
  loading: boolean;
  setEnabled: (enabled: boolean) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [enabled, setEnabledState] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const refresh = useCallback(async () => {
    if (!user) { setEnabledState(false); setLoading(false); return; }
    const { data, error } = await supabase.rpc("is_demo_mode");
    if (!error) setEnabledState(data === true);
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
    if (!user) return;
    const interval = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(interval);
  }, [authLoading, refresh, user]);

  const setEnabled = useCallback(async (nextEnabled: boolean) => {
    if (!user) return false;
    setLoading(true);
    const { data, error } = await supabase.rpc("set_demo_mode", { p_enabled: nextEnabled });
    if (error || data !== true) { setLoading(false); return false; }
    setEnabledState(nextEnabled); setLoading(false); return true;
  }, [supabase, user]);

  const value = useMemo(() => ({ enabled, loading, setEnabled, refresh }), [enabled, loading, setEnabled, refresh]);
  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) throw new Error("useDemoMode must be used inside a DemoModeProvider");
  return context;
}
