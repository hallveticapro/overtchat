import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { modelConfigs } from "@/lib/db/schema";

export type ModelConfigRow = typeof modelConfigs.$inferSelect;

export type ModelConfigInput = {
  label: string;
  baseUrl: string;
  apiKey?: string | null;
  model: string;
  extraBody?: Record<string, unknown> | null;
  sortOrder?: number;
};

export async function listModelConfigs(): Promise<ModelConfigRow[]> {
  return db
    .select()
    .from(modelConfigs)
    .orderBy(asc(modelConfigs.sortOrder), asc(modelConfigs.label));
}

export async function getModelConfig(id: string): Promise<ModelConfigRow | null> {
  const [row] = await db
    .select()
    .from(modelConfigs)
    .where(eq(modelConfigs.id, id))
    .limit(1);
  return row ?? null;
}

export async function createModelConfig(input: ModelConfigInput): Promise<ModelConfigRow> {
  const [row] = await db
    .insert(modelConfigs)
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

export async function updateModelConfig(
  id: string,
  input: ModelConfigInput,
): Promise<ModelConfigRow | null> {
  const [row] = await db
    .update(modelConfigs)
    .set({
      label: input.label,
      baseUrl: input.baseUrl.replace(/\/$/, ""),
      apiKey: input.apiKey ?? null,
      model: input.model,
      extraBody: input.extraBody ?? null,
      sortOrder: input.sortOrder ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(modelConfigs.id, id))
    .returning();
  return row ?? null;
}

export async function deleteModelConfig(id: string): Promise<void> {
  await db.delete(modelConfigs).where(eq(modelConfigs.id, id));
}
