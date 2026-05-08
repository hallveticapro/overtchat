"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { type ApiConfig, loadConfig } from "@/lib/config";

interface ShellContext {
  config: ApiConfig;
  setConfig: (config: ApiConfig) => void;
  chatKey: number;
  newChat: () => void;
}

const Ctx = createContext<ShellContext | null>(null);

export function useAppShell() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppShell must be used inside <AppShell>");
  return ctx;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ApiConfig>({ baseUrl: "", apiKey: "", model: "" });
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    setConfig(loadConfig());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "overtchat_config") setConfig(loadConfig());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<ShellContext>(
    () => ({
      config,
      setConfig,
      chatKey,
      newChat: () => setChatKey((k) => k + 1),
    }),
    [config, chatKey],
  );

  return (
    <Ctx.Provider value={value}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar onNewChat={value.newChat} />
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </Ctx.Provider>
  );
}
