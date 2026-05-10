import "server-only";
import fs from "node:fs";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { uploads } from "@/lib/db/schema";

export type UploadRow = typeof uploads.$inferSelect;

const DB_PATH = process.env.DATABASE_URL ?? "./data/chat.db";
export const UPLOADS_DIR = path.join(path.dirname(DB_PATH), "uploads");

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export function uploadPath(id: string): string {
  return path.join(UPLOADS_DIR, id);
}

export async function createUpload(row: {
  id: string;
  userId: string;
  filename: string;
  mediaType: string;
  size: number;
}): Promise<void> {
  await db.insert(uploads).values(row);
}

export async function getUpload(
  id: string,
  userId: string,
): Promise<UploadRow | null> {
  const [row] = await db
    .select()
    .from(uploads)
    .where(and(eq(uploads.id, id), eq(uploads.userId, userId)))
    .limit(1);
  return row ?? null;
}
