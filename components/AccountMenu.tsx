"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { ChevronUp, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccountMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-auto w-full justify-start gap-2 px-2 py-2 text-sidebar-foreground hover:bg-sidebar-accent"
          />
        }
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="size-3.5" />
        </span>
        <span className="flex-1 text-left text-sm font-medium">You</span>
        <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="top" align="start" sideOffset={6}>
          <Menu.Popup className="z-50 w-56 rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none">
            <Menu.Item
              render={<Link href="/settings" />}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              <Settings className="size-3.5 shrink-0 text-muted-foreground" />
              <span>Admin settings</span>
            </Menu.Item>
            <Menu.Item
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 opacity-50 outline-none"
            >
              <LogOut className="size-3.5 shrink-0 text-muted-foreground" />
              <span>Log out</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
