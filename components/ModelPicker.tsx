"use client";

import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicModelConfig } from "@/lib/config";

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
          <Menu.Popup className="z-50 max-h-80 w-64 overflow-y-auto rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none">
            {models?.map((m) => (
              <Menu.Item
                key={m.id}
                onClick={() => onSelect(m.id)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
              >
                <Check
                  className={cn(
                    "size-3.5 shrink-0",
                    m.id === selectedId ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{m.label}</span>
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
