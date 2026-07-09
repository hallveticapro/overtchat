import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  DEFAULT_CHAT_MAX_DURATION_SECONDS,
  parseChatMaxDurationSeconds,
  patchFunctionsConfigManifest,
} = require("../../scripts/chat-max-duration.cjs") as {
  DEFAULT_CHAT_MAX_DURATION_SECONDS: number;
  parseChatMaxDurationSeconds: (value?: string | null) => number;
  patchFunctionsConfigManifest: (
    manifestPath: string,
    seconds: number,
  ) => Promise<boolean>;
};

describe("chat max duration config", () => {
  it("defaults to 300 seconds when unset", () => {
    expect(parseChatMaxDurationSeconds(undefined)).toBe(
      DEFAULT_CHAT_MAX_DURATION_SECONDS,
    );
    expect(parseChatMaxDurationSeconds("")).toBe(
      DEFAULT_CHAT_MAX_DURATION_SECONDS,
    );
  });

  it("accepts positive integer second values", () => {
    expect(parseChatMaxDurationSeconds("900")).toBe(900);
    expect(parseChatMaxDurationSeconds(" 1200 ")).toBe(1200);
  });

  it("rejects invalid values instead of silently changing timeout behavior", () => {
    expect(() => parseChatMaxDurationSeconds("0")).toThrow(
      "CHAT_MAX_DURATION_SECONDS",
    );
    expect(() => parseChatMaxDurationSeconds("-1")).toThrow(
      "CHAT_MAX_DURATION_SECONDS",
    );
    expect(() => parseChatMaxDurationSeconds("1.5")).toThrow(
      "CHAT_MAX_DURATION_SECONDS",
    );
    expect(() => parseChatMaxDurationSeconds("slow")).toThrow(
      "CHAT_MAX_DURATION_SECONDS",
    );
  });

  it("patches only chat stream function durations in the built Next manifest", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "overtchat-duration-"));
    const manifestPath = path.join(dir, "functions-config-manifest.json");
    await writeFile(
      manifestPath,
      JSON.stringify({
        version: 1,
        functions: {
          "/api/chat": { maxDuration: 300 },
          "/api/chat/[id]/stream": { maxDuration: 300 },
          "/api/chats/[id]/title": { maxDuration: 60 },
        },
      }),
    );

    await expect(patchFunctionsConfigManifest(manifestPath, 900)).resolves.toBe(
      true,
    );

    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    expect(manifest.functions["/api/chat"].maxDuration).toBe(900);
    expect(manifest.functions["/api/chat/[id]/stream"].maxDuration).toBe(900);
    expect(manifest.functions["/api/chats/[id]/title"].maxDuration).toBe(60);
  });
});
