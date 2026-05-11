export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const { db } = await import("@/lib/db/client");

  migrate(db, {
    migrationsFolder:
      process.env.DRIZZLE_MIGRATIONS ?? `${process.cwd()}/drizzle`,
  });

  const { sweepOrphanedUploads } = await import("@/lib/db/uploads");
  sweepOrphanedUploads().catch((err) =>
    console.error("[sweep-orphan-uploads]", err),
  );
}
