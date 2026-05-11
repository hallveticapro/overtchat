"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";

export function AppShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="flex h-dvh overflow-hidden bg-background">
        <div className="hidden md:flex">{sidebar}</div>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 md:hidden" />
          <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex transition-transform duration-200 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full md:hidden">
            {sidebar}
          </Dialog.Popup>
        </Dialog.Portal>
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </Dialog.Root>
  );
}
