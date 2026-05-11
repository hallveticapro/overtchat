import { auth } from "@/lib/auth/server";
import {
  createModelConfig,
  listModelConfigs,
  type ModelConfigInput,
  type ModelConfigRow,
} from "@/lib/db/modelConfigs";
import type { AdminModelConfig, PublicModelConfig } from "@/lib/config";

function toPublic(row: ModelConfigRow): PublicModelConfig {
  return {
    id: row.id,
    label: row.label,
    model: row.model,
    hasExtraBody: !!row.extraBody && Object.keys(row.extraBody).length > 0,
  };
}

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

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const wantAdmin = url.searchParams.get("admin") === "1";
  const rows = await listModelConfigs();

  if (wantAdmin) {
    if (session.user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
    return Response.json({ modelConfigs: rows.map(toAdmin) });
  }
  return Response.json({ modelConfigs: rows.map(toPublic) });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const body = (await req.json()) as ModelConfigInput;
  if (!body.label?.trim() || !body.baseUrl?.trim() || !body.model?.trim()) {
    return Response.json(
      { error: "label, baseUrl, and model are required" },
      { status: 400 },
    );
  }
  const row = await createModelConfig(body);
  return Response.json({ modelConfig: toAdmin(row) }, { status: 201 });
}
