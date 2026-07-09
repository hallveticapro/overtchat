const fs = require("node:fs/promises");
const path = require("node:path");

const CHAT_MAX_DURATION_ENV = "CHAT_MAX_DURATION_SECONDS";
const DEFAULT_CHAT_MAX_DURATION_SECONDS = 300;
const CHAT_FUNCTION_ROUTES = ["/api/chat", "/api/chat/[id]/stream"];

function parseChatMaxDurationSeconds(value = process.env[CHAT_MAX_DURATION_ENV]) {
  if (value == null || String(value).trim() === "") {
    return DEFAULT_CHAT_MAX_DURATION_SECONDS;
  }

  const raw = String(value).trim();
  if (!/^\d+$/.test(raw)) {
    throw new Error(
      `${CHAT_MAX_DURATION_ENV} must be a positive integer number of seconds.`,
    );
  }

  const seconds = Number(raw);
  if (!Number.isSafeInteger(seconds) || seconds < 1) {
    throw new Error(
      `${CHAT_MAX_DURATION_ENV} must be a positive integer number of seconds.`,
    );
  }

  return seconds;
}

async function patchFunctionsConfigManifest(manifestPath, seconds) {
  let raw;
  try {
    raw = await fs.readFile(manifestPath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }

  const manifest = JSON.parse(raw);
  if (!manifest.functions || typeof manifest.functions !== "object") {
    manifest.functions = {};
  }

  for (const route of CHAT_FUNCTION_ROUTES) {
    const existing = manifest.functions[route];
    manifest.functions[route] =
      existing && typeof existing === "object"
        ? { ...existing, maxDuration: seconds }
        : { maxDuration: seconds };
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return true;
}

async function main() {
  const seconds = parseChatMaxDurationSeconds();
  const manifestPath =
    process.env.NEXT_FUNCTIONS_CONFIG_MANIFEST ||
    path.join(
      process.cwd(),
      "apps/web/.next/server/functions-config-manifest.json",
    );

  const patched = await patchFunctionsConfigManifest(manifestPath, seconds);
  if (patched) {
    console.log(`Chat route maxDuration set to ${seconds}s`);
  } else {
    console.warn(
      `Could not find Next functions config manifest at ${manifestPath}; chat route maxDuration was not patched.`,
    );
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

module.exports = {
  CHAT_FUNCTION_ROUTES,
  CHAT_MAX_DURATION_ENV,
  DEFAULT_CHAT_MAX_DURATION_SECONDS,
  parseChatMaxDurationSeconds,
  patchFunctionsConfigManifest,
};
