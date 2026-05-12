import { AccountMenu } from "@/components/AccountMenu";
import { SidebarClient } from "@/components/SidebarClient";
import type { ProjectOption } from "@/components/SidebarChatList";

type RecentChat = { id: string; title: string | null; updatedAt: number };
type ProjectWithChats = ProjectOption & {
  chats: { id: string; title: string | null }[];
};

export function Sidebar({
  unprojected,
  projects,
  projectOptions,
}: {
  unprojected: RecentChat[];
  projects: ProjectWithChats[];
  projectOptions: ProjectOption[];
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <SidebarClient
        unprojected={unprojected}
        projects={projects}
        projectOptions={projectOptions}
      />
      <div className="border-t border-sidebar-border p-2">
        <AccountMenu />
      </div>
    </aside>
  );
}
