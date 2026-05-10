import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { modelPresets } from "@/lib/db/schema";

export type PresetRow = typeof modelPresets.$inferSelect;

export type PresetInput = {
  label: string;
  baseUrl: string;
  apiKey?: string | null;
  model: string;
  extraBody?: Record<string, unknown> | null;
  sortOrder?: number;
};

export async function listPresets(): Promise<PresetRow[]> {
  return db
    .select()
    .from(modelPresets)
    .orderBy(asc(modelPresets.sortOrder), asc(modelPresets.label));
}

export async function getPreset(id: string): Promise<PresetRow | null> {
  const [row] = await db
    .select()
    .from(modelPresets)
    .where(eq(modelPresets.id, id))
    .limit(1);
  return row ?? null;
}

export async function createPreset(input: PresetInput): Promise<PresetRow> {
  const [row] = await db
    .insert(modelPresets)
    .values({
      id: crypto.randomUUID(),
      label: input.label,
      baseUrl: input.baseUrl.replace(/\/$/, ""),
      apiKey: input.apiKey ?? null,
      model: input.model,
      extraBody: input.extraBody ?? null,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return row;
}

export async function updatePreset(
  id: string,
  input: PresetInput,
): Promise<PresetRow | null> {
  const [row] = await db
    .update(modelPresets)
    .set({
      label: input.label,
      baseUrl: input.baseUrl.replace(/\/$/, ""),
      apiKey: input.apiKey ?? null,
      model: input.model,
      extraBody: input.extraBody ?? null,
      sortOrder: input.sortOrder ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(modelPresets.id, id))
    .returning();
  return row ?? null;
}

export async function deletePreset(id: string): Promise<void> {
  await db.delete(modelPresets).where(eq(modelPresets.id, id));
}
