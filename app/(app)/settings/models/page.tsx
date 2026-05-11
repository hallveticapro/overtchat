import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { listModelConfigs, toAdminModelConfig } from "@/lib/db/modelConfigs";
import { ModelsPanel } from "./ModelsPanel";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/settings/general");

  const rows = await listModelConfigs();
  return <ModelsPanel initial={rows.map(toAdminModelConfig)} />;
}
