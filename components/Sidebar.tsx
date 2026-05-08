"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/AccountMenu";

interface Props {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: Props) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-12 items-center justify-between px-3">
        <span className="text-sm font-semibold tracking-tight">overtchat</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="New chat"
          onClick={onNewChat}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Plus />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <p className="py-1.5 text-xs text-muted-foreground">
          No conversations yet
        </p>
      </div>

      <div className="border-t border-sidebar-border p-2">
        <AccountMenu />
      </div>
    </aside>
  );
}
