import { auth } from "@/lib/auth/server";
import {
  createPreset,
  listPresets,
  type PresetInput,
} from "@/lib/db/presets";
import type { AdminPreset, PublicPreset } from "@/lib/config";
import type { PresetRow } from "@/lib/db/presets";

function toPublic(row: PresetRow): PublicPreset {
  return {
    id: row.id,
    label: row.label,
    model: row.model,
    hasExtraBody: !!row.extraBody && Object.keys(row.extraBody).length > 0,
  };
}

function toAdmin(row: PresetRow): AdminPreset {
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
  const rows = await listPresets();

  if (wantAdmin) {
    if (session.user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
    return Response.json({ presets: rows.map(toAdmin) });
  }
  return Response.json({ presets: rows.map(toPublic) });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const body = (await req.json()) as PresetInput;
  if (!body.label?.trim() || !body.baseUrl?.trim() || !body.model?.trim()) {
    return Response.json(
      { error: "label, baseUrl, and model are required" },
      { status: 400 },
    );
  }
  const row = await createPreset(body);
  return Response.json({ preset: toAdmin(row) }, { status: 201 });
}
