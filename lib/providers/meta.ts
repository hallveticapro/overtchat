export type ProviderId = "openai-compatible" | "anthropic" | "google";

export interface ProviderMeta {
  label: string;
  defaultBaseUrl: string;
  requiresApiKey: boolean;
  modelPlaceholder: string;
}

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  "openai-compatible": {
    label: "OpenAI-compatible",
    defaultBaseUrl: "",
    requiresApiKey: false,
    modelPlaceholder: "gpt-4o-mini",
  },
  anthropic: {
    label: "Anthropic",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    requiresApiKey: true,
    modelPlaceholder: "claude-sonnet-4-5",
  },
  google: {
    label: "Google Gemini",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    requiresApiKey: true,
    modelPlaceholder: "gemini-2.5-flash",
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];
