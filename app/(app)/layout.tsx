import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { listChats } from "@/lib/db/chats";
import { listProjects } from "@/lib/db/projects";
import { AppShell } from "@/components/AppShell";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [chats, projects] = await Promise.all([
    listChats(session.user.id),
    listProjects(session.user.id),
  ]);

  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));
  const unprojected = chats
    .filter((c) => c.projectId == null)
    .map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt.getTime(),
    }));
  const chatsByProject = new Map<
    string,
    { id: string; title: string | null }[]
  >();
  for (const c of chats) {
    if (!c.projectId) continue;
    const list = chatsByProject.get(c.projectId) ?? [];
    list.push({ id: c.id, title: c.title });
    chatsByProject.set(c.projectId, list);
  }
  const projectsWithChats = projectOptions.map((p) => ({
    ...p,
    chats: chatsByProject.get(p.id) ?? [],
  }));
  const allChats = chats.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt.getTime(),
  }));

  return (
    <AppShell
      sidebar={
        <Sidebar
          unprojected={unprojected}
          projects={projectsWithChats}
          projectOptions={projectOptions}
        />
      }
      allChats={allChats}
    >
      {children}
    </AppShell>
  );
}
