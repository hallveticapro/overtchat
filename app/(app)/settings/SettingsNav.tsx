"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plug, Settings2, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";

type Item = {
  href: string;
  label: string;
  icon: typeof Plug;
};

const USER_ITEMS: Item[] = [
  { href: "/settings/general", label: "General", icon: Settings2 },
  { href: "/settings/api-endpoint", label: "API endpoint", icon: Plug },
  { href: "/settings/account", label: "Account", icon: User },
];

const ADMIN_ITEMS: Item[] = [
  { href: "/settings/users", label: "Users", icon: Users },
];

export function SettingsNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="space-y-5">
      <Section label="User settings" items={USER_ITEMS} pathname={pathname} />
      {isAdmin && (
        <Section label="Admin settings" items={ADMIN_ITEMS} pathname={pathname} />
      )}
    </nav>
  );
}

function Section({
  label,
  items,
  pathname,
}: {
  label: string;
  items: Item[];
  pathname: string;
}) {
  return (
    <div>
      <p className="mb-1.5 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
