"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { CoreModuleKey } from "@/lib/modules/contracts";
import { supabase } from "@/lib/supabase";

type AdminModulesContextValue = {
  enabledModules: Set<CoreModuleKey> | null;
  refreshModules: () => Promise<void>;
};

const AdminModulesContext = createContext<AdminModulesContextValue | null>(null);

export default function AdminModulesProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [enabledModules, setEnabledModules] = useState<Set<CoreModuleKey> | null>(null);

  const refreshModules = useCallback(async () => {
    const { data: workspaceData, error: workspaceError } = await supabase.rpc("list_my_businesses");
    if (workspaceError) return;

    const workspaces = (workspaceData ?? []) as Array<{ business_id: string; is_default: boolean }>;
    const workspace = workspaces.find((item) => item.is_default) ?? workspaces[0];
    if (!workspace) return;

    const { data, error } = await supabase
      .from("business_modules")
      .select("module_key")
      .eq("business_id", workspace.business_id)
      .eq("enabled", true);
    if (error) return;

    setEnabledModules(new Set(
      (data ?? []).map((row) => row.module_key as CoreModuleKey),
    ));
  }, []);

  useEffect(() => {
    void refreshModules();
  }, [pathname, refreshModules]);

  useEffect(() => {
    const handleModulesChanged = () => void refreshModules();
    window.addEventListener("onestudio:modules-changed", handleModulesChanged);
    return () => window.removeEventListener("onestudio:modules-changed", handleModulesChanged);
  }, [refreshModules]);

  const value = useMemo(
    () => ({ enabledModules, refreshModules }),
    [enabledModules, refreshModules],
  );

  return <AdminModulesContext.Provider value={value}>{children}</AdminModulesContext.Provider>;
}

export function useAdminModules() {
  const context = useContext(AdminModulesContext);
  if (!context) throw new Error("useAdminModules must be used inside AdminModulesProvider");
  return context;
}
