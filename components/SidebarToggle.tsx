"use client";

import { Dialog } from "@base-ui/react/dialog";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarToggle({ className }: { className?: string }) {
  return (
    <Dialog.Trigger
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open menu"
          className={className}
        >
          <PanelLeft />
        </Button>
      }
    />
  );
}
