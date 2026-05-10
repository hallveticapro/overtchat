"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchAdminPresets,
  type AdminPreset,
  type PresetInput,
} from "@/lib/config";
import { PresetDialog } from "./PresetDialog";

export function ModelsPanel() {
  const [presets, setPresets] = useState<AdminPreset[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AdminPreset | "new" | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await fetchAdminPresets();
      setPresets(list);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchAdminPresets();
        if (cancelled) return;
        setPresets(list);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove(id: string, label: string) {
    if (!confirm(`Delete "${label}"?`)) return;
    const res = await fetch(`/api/presets/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(`Failed to delete (${res.status})`);
      return;
    }
    void load();
  }

  async function save(input: PresetInput, id?: string) {
    const url = id ? `/api/presets/${id}` : "/api/presets";
    const method = id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(json.error ?? `HTTP ${res.status}`);
    }
    setEditing(null);
    void load();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">Models</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the endpoints and models everyone can pick from.
          </p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus /> Add model
        </Button>
      </header>

      {status === "loading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Loading…
        </div>
      )}
      {status === "error" && <p className="text-sm text-destructive">{error}</p>}

      {status === "ready" && presets.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No models yet. Click “Add model” to create the first one.
        </p>
      )}

      {status === "ready" && presets.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Label</th>
                <th className="px-3 py-2 text-left font-medium">Model</th>
                <th className="px-3 py-2 text-left font-medium">Endpoint</th>
                <th className="w-20 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {presets.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{p.label}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {p.model}
                  </td>
                  <td className="px-3 py-2 truncate text-xs text-muted-foreground">
                    {p.baseUrl}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditing(p)}
                      aria-label={`Edit ${p.label}`}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(p.id, p.label)}
                      aria-label={`Delete ${p.label}`}
                    >
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PresetDialog
        mode={editing}
        onClose={() => setEditing(null)}
        onSave={save}
      />
    </div>
  );
}
