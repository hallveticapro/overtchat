"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type ApiConfig, fetchModels, loadConfig, saveConfig } from "@/lib/config";

type TestStatus = "idle" | "loading" | "ok" | "error";

export function ApiEndpointForm() {
  const [config, setConfig] = useState<ApiConfig>({ baseUrl: "", apiKey: "", model: "" });
  const [models, setModels] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testError, setTestError] = useState("");
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  function handleBaseUrlChange(value: string) {
    setConfig((c) => ({ ...c, baseUrl: value }));
    setTestStatus("idle");
    setModels([]);
  }

  async function testConnection() {
    setTestStatus("loading");
    setTestError("");
    setModels([]);
    try {
      const ids = await fetchModels(config);
      if (!ids.length) throw new Error("No models available at this endpoint");
      setModels(ids);
      setTestStatus("ok");
      setConfig((c) => ({ ...c, model: ids.includes(c.model) ? c.model : ids[0] }));
    } catch (e) {
      setTestStatus("error");
      setTestError(e instanceof Error ? e.message : String(e));
    }
  }

  function handleSave() {
    saveConfig(config);
    setSavedAt(Date.now());
  }

  const canSave = Boolean(config.baseUrl && config.model);

  return (
    <div className="max-w-xl space-y-6">
      <header>
        <h1 className="font-heading text-xl font-semibold tracking-tight">API endpoint</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Point overtchat at any OpenAI-compatible endpoint.
        </p>
      </header>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            placeholder="http://localhost:8000/v1"
            value={config.baseUrl}
            onChange={(e) => handleBaseUrlChange(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apiKey">
            API key{" "}
            <span className="font-normal text-muted-foreground">— optional</span>
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="sk-…"
            value={config.apiKey}
            onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!config.baseUrl || testStatus === "loading"}
            onClick={testConnection}
          >
            {testStatus === "loading" ? "Testing…" : "Test connection"}
          </Button>
          {testStatus === "ok" && (
            <span className="text-sm text-green-600 dark:text-green-400">
              {models.length} model{models.length === 1 ? "" : "s"} available
            </span>
          )}
          {testStatus === "error" && (
            <span className="text-sm text-destructive">{testError}</span>
          )}
        </div>

        {models.length > 0 && (
          <div className="space-y-1.5">
            <Label>Model</Label>
            <Select
              value={config.model}
              onValueChange={(v) => setConfig((c) => ({ ...c, model: v ?? "" }))}
            >
              <SelectTrigger className={cn(!config.model && "text-muted-foreground")}>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t pt-4">
        <Button disabled={!canSave} onClick={handleSave}>
          Save
        </Button>
        {savedAt > 0 && (
          <span className="text-sm text-muted-foreground">Saved</span>
        )}
      </div>
    </div>
  );
}
