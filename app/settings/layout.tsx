import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsNav } from "./SettingsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-3">
        <span className="text-sm font-semibold tracking-tight">Settings</span>
        <Button
          render={<Link href="/" />}
          variant="ghost"
          size="icon-sm"
          aria-label="Close settings"
        >
          <X />
        </Button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 shrink-0 overflow-y-auto border-r p-3">
          <SettingsNav />
        </aside>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </div>
  );
}
