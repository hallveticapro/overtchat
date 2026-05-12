"use client";

import { createContext, useContext } from "react";

interface SidebarCtx {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (v: boolean) => void;
  openPalette: () => void;
}

export const SidebarContext = createContext<SidebarCtx | null>(null);

export function useSidebar(): SidebarCtx {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarContext");
  return ctx;
}
