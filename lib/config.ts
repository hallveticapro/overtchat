import { useLocalStorage } from "@/lib/useLocalStorage";

/** Public-facing preset DTO. `apiKey` is intentionally omitted — it never leaves the server. */
export interface PublicPreset {
  id: string;
  label: string;
  model: string;
  hasExtraBody: boolean;
}

/** Admin-facing preset DTO. Includes `apiKey` + `extraBody` for editing. */
export interface AdminPreset {
  id: string;
  label: string;
  baseUrl: string;
  apiKey: string | null;
  model: string;
  extraBody: Record<string, unknown> | null;
  sortOrder: number;
}

export interface PresetInput {
  label: string;
  baseUrl: string;
  apiKey?: string | null;
  model: string;
  extraBody?: Record<string, unknown> | null;
  sortOrder?: number;
}

const SELECTED_PRESET_KEY = "overtchat_selected_preset";

export function useSelectedPreset(): [string, (id: string) => void] {
  return useLocalStorage<string>(SELECTED_PRESET_KEY, "");
}

export async function fetchPresets(): Promise<PublicPreset[]> {
  const res = await fetch("/api/presets");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { presets: PublicPreset[] };
  return json.presets;
}

export async function fetchAdminPresets(): Promise<AdminPreset[]> {
  const res = await fetch("/api/presets?admin=1");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { presets: AdminPreset[] };
  return json.presets;
}

export async function fetchModelsForEndpoint(
  baseUrl: string,
  apiKey?: string | null,
): Promise<string[]> {
  const res = await fetch("/api/models", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseUrl, apiKey: apiKey ?? "" }),
  });
  const json = (await res.json()) as { models?: string[]; error?: string };
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.models ?? [];
}
