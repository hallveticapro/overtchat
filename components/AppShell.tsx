"use client";

export function AppShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebar}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
