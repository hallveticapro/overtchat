"use client";

import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicModelConfig } from "@/lib/config";
import { PROVIDERS, PROVIDER_IDS, type ProviderId } from "@/lib/providers/meta";

interface Props {
  models: PublicModelConfig[] | null;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ModelPicker({ models, selectedId, onSelect }: Props) {
  const loading = models === null;
  const selected = models?.find((m) => m.id === selectedId) ?? null;

  const label = loading
    ? "Loading…"
    : selected
      ? selected.label
      : models && models.length > 0
        ? "Select a model"
        : "No models";

  const grouped = groupByProvider(models ?? []);

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "min-w-0 max-w-[60%] gap-1.5",
              !selected && "text-muted-foreground",
            )}
            disabled={loading || !models || models.length === 0}
          />
        }
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="shrink-0 text-muted-foreground" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={6}>
          <Menu.Popup className="z-50 max-h-80 w-72 overflow-y-auto rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none">
            {PROVIDER_IDS.map((providerId) => {
              const items = grouped[providerId];
              if (!items || items.length === 0) return null;
              return (
                <Menu.Group
                  key={providerId}
                  className="py-1 first:pt-0 last:pb-0 not-first:border-t not-first:mt-1 not-first:pt-2"
                >
                  <Menu.GroupLabel className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {PROVIDERS[providerId].label}
                  </Menu.GroupLabel>
                  {items.map((m) => (
                    <Menu.Item
                      key={m.id}
                      onClick={() => onSelect(m.id)}
                      className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 size-3.5 shrink-0",
                          m.id === selectedId ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{m.label}</span>
                        {m.label !== m.model && (
                          <span className="truncate text-xs text-muted-foreground">
                            {m.model}
                          </span>
                        )}
                      </span>
                    </Menu.Item>
                  ))}
                </Menu.Group>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function groupByProvider(
  models: PublicModelConfig[],
): Partial<Record<ProviderId, PublicModelConfig[]>> {
  const out: Partial<Record<ProviderId, PublicModelConfig[]>> = {};
  for (const m of models) {
    (out[m.provider] ??= []).push(m);
  }
  return out;
}
