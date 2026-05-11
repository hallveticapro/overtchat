import { auth } from "@/lib/auth/server";
import {
  deleteModelConfig,
  getModelConfig,
  updateModelConfig,
  type ModelConfigInput,
  type ModelConfigRow,
} from "@/lib/db/modelConfigs";
import type { AdminModelConfig } from "@/lib/config";

function toAdmin(row: ModelConfigRow): AdminModelConfig {
  return {
    id: row.id,
    label: row.label,
    baseUrl: row.baseUrl,
    apiKey: row.apiKey,
    model: row.model,
    extraBody: row.extraBody,
    sortOrder: row.sortOrder,
  };
}

async function requireAdmin(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return { error: new Response("Unauthorized", { status: 401 }) };
  if (session.user.role !== "admin") {
    return { error: new Response("Forbidden", { status: 403 }) };
  }
  return { session };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req);
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const existing = await getModelConfig(id);
  if (!existing) return new Response("Not found", { status: 404 });

  const body = (await req.json()) as ModelConfigInput;
  if (!body.label?.trim() || !body.baseUrl?.trim() || !body.model?.trim()) {
    return Response.json(
      { error: "label, baseUrl, and model are required" },
      { status: 400 },
    );
  }
  const row = await updateModelConfig(id, body);
  if (!row) return new Response("Not found", { status: 404 });
  return Response.json({ modelConfig: toAdmin(row) });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req);
  if ("error" in guard) return guard.error;

  const { id } = await params;
  await deleteModelConfig(id);
  return new Response(null, { status: 204 });
}
