"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchModelsForEndpoint,
  type AdminModelConfig,
  type ModelConfigInput,
} from "@/lib/config";

type Mode = AdminModelConfig | "new" | null;

export function ModelConfigDialog({
  mode,
  onClose,
  onSave,
}: {
  mode: Mode;
  onClose: () => void;
  onSave: (input: ModelConfigInput, id?: string) => Promise<void>;
}) {
  const open = mode !== null;
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg outline-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity">
          {mode && (
            <ModelConfigForm
              editing={mode === "new" ? null : mode}
              onClose={onClose}
              onSave={onSave}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ModelConfigForm({
  editing,
  onClose,
  onSave,
}: {
  editing: AdminModelConfig | null;
  onClose: () => void;
  onSave: (input: ModelConfigInput, id?: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ModelConfigInput>(() =>
    editing
      ? {
          label: editing.label,
          baseUrl: editing.baseUrl,
          apiKey: editing.apiKey ?? "",
          model: editing.model,
          systemPrompt: editing.systemPrompt ?? "",
          extraBody: editing.extraBody,
          sortOrder: editing.sortOrder,
        }
      : {
          label: "",
          baseUrl: "",
          apiKey: "",
          model: "",
          systemPrompt: "",
          extraBody: null,
          sortOrder: 0,
        },
  );
  const [extraBodyText, setExtraBodyText] = useState(() =>
    editing?.extraBody ? JSON.stringify(editing.extraBody, null, 2) : "",
  );
  const [models, setModels] = useState<string[]>([]);
  const [probingModels, setProbingModels] = useState(false);
  const [probeError, setProbeError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<
    | { ok: true; text: string; elapsedMs: number; inputTokens: number | null; outputTokens: number | null }
    | { ok: false; error: string }
    | null
  >(null);

  function updateDraft(patch: Partial<ModelConfigInput>) {
    setDraft((d) => ({ ...d, ...patch }));
    setPingResult(null);
  }

  async function probeModels() {
    setProbingModels(true);
    setProbeError("");
    try {
      const ids = await fetchModelsForEndpoint(draft.baseUrl, draft.apiKey);
      setModels(ids);
      if (ids.length > 0 && !ids.includes(draft.model)) {
        setDraft((d) => ({ ...d, model: ids[0] }));
      }
    } catch (e) {
      setProbeError(e instanceof Error ? e.message : String(e));
    } finally {
      setProbingModels(false);
    }
  }

  function parseExtraBody(): { ok: true; value: Record<string, unknown> | null } | { ok: false; error: string } {
    const trimmed = extraBodyText.trim();
    if (!trimmed) return { ok: true, value: null };
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return { ok: false, error: "Must be a JSON object" };
      }
      return { ok: true, value: parsed as Record<string, unknown> };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  async function ping() {
    const parsed = parseExtraBody();
    if (!parsed.ok) {
      setPingResult({ ok: false, error: `Extra body: ${parsed.error}` });
      return;
    }
    setPinging(true);
    setPingResult(null);
    try {
      const res = await fetch("/api/model-configs/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: draft.baseUrl,
          apiKey: draft.apiKey,
          model: draft.model,
          extraBody: parsed.value,
        }),
      });
      const json = (await res.json()) as {
        text?: string;
        elapsedMs?: number;
        inputTokens?: number | null;
        outputTokens?: number | null;
        error?: string;
      };
      if (!res.ok || json.error) {
        setPingResult({ ok: false, error: json.error ?? `HTTP ${res.status}` });
        return;
      }
      setPingResult({
        ok: true,
        text: json.text ?? "",
        elapsedMs: json.elapsedMs ?? 0,
        inputTokens: json.inputTokens ?? null,
        outputTokens: json.outputTokens ?? null,
      });
    } catch (e) {
      setPingResult({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setPinging(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");

    const parsed = parseExtraBody();
    if (!parsed.ok) {
      setSaveError(`Extra body must be valid JSON object: ${parsed.error}`);
      return;
    }

    setSaving(true);
    try {
      await onSave({ ...draft, extraBody: parsed.value }, editing?.id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog.Title className="font-heading text-lg font-semibold tracking-tight">
        {editing ? "Edit model" : "Add model"}
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-muted-foreground">
        The label is what users see in the picker. The rest is how we call the endpoint.
      </Dialog.Description>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-label">Label</Label>
          <Input
            id="p-label"
            placeholder="Qwen3 (thinking)"
            required
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-base-url">Base URL</Label>
          <Input
            id="p-base-url"
            placeholder="http://host.docker.internal:8000/v1"
            required
            value={draft.baseUrl}
            onChange={(e) => updateDraft({ baseUrl: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-api-key">
            API key <span className="font-normal text-muted-foreground">— optional</span>
          </Label>
          <Input
            id="p-api-key"
            type="password"
            autoComplete="new-password"
            placeholder="sk-…"
            value={draft.apiKey ?? ""}
            onChange={(e) => updateDraft({ apiKey: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="p-model">Model</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!draft.baseUrl || probingModels}
              onClick={probeModels}
              className="h-7 text-xs"
            >
              {probingModels ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> Fetching…
                </>
              ) : (
                "Fetch models"
              )}
            </Button>
          </div>
          {models.length > 0 ? (
            <select
              id="p-model"
              value={draft.model}
              onChange={(e) => updateDraft({ model: e.target.value })}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="p-model"
              placeholder="qwen3-8b"
              required
              value={draft.model}
              onChange={(e) => updateDraft({ model: e.target.value })}
            />
          )}
          {probeError && <p className="text-xs text-destructive">{probeError}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-system-prompt">
            System prompt{" "}
            <span className="font-normal text-muted-foreground">
              — optional, sent with every chat
            </span>
          </Label>
          <textarea
            id="p-system-prompt"
            rows={4}
            placeholder="You are a helpful assistant…"
            value={draft.systemPrompt ?? ""}
            onChange={(e) => updateDraft({ systemPrompt: e.target.value })}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-extra">
            Extra body{" "}
            <span className="font-normal text-muted-foreground">
              — optional JSON, merged into the request
            </span>
          </Label>
          <textarea
            id="p-extra"
            rows={5}
            placeholder='{ "chat_template_kwargs": { "thinking": true } }'
            value={extraBodyText}
            onChange={(e) => {
              setExtraBodyText(e.target.value);
              setPingResult(null);
            }}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        {pingResult?.ok === true && (
          <div className="rounded-lg border border-ring/40 bg-ring/5 px-3 py-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-ring">
              <CheckCircle2 className="size-3.5" />
              Connected
              <span className="ml-auto font-normal text-muted-foreground">
                {pingResult.elapsedMs}ms
                {pingResult.inputTokens != null && pingResult.outputTokens != null && (
                  <> · {pingResult.inputTokens} in / {pingResult.outputTokens} out</>
                )}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-foreground">
              {pingResult.text || "(empty response)"}
            </p>
          </div>
        )}
        {pingResult?.ok === false && (
          <div className="flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
            <XCircle className="size-3.5 shrink-0 mt-0.5" />
            <span className="break-words">{pingResult.error}</span>
          </div>
        )}

        {saveError && <p className="text-sm text-destructive">{saveError}</p>}

        <div className="flex items-center gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!draft.baseUrl || !draft.model || pinging}
            onClick={ping}
          >
            {pinging ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Testing…
              </>
            ) : (
              "Test connection"
            )}
          </Button>
          <div className="flex-1" />
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </>
  );
}
