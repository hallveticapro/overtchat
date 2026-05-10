"use client";

import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicPreset } from "@/lib/config";

interface Props {
  presets: PublicPreset[] | null;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ModelPicker({ presets, selectedId, onSelect }: Props) {
  const loading = presets === null;
  const selected = presets?.find((p) => p.id === selectedId) ?? null;

  const label = loading
    ? "Loading…"
    : selected
      ? selected.label
      : presets && presets.length > 0
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
            disabled={loading || !presets || presets.length === 0}
          />
        }
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="shrink-0 text-muted-foreground" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={6}>
          <Menu.Popup className="z-50 max-h-80 w-64 overflow-y-auto rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none">
            {presets?.map((p) => (
              <Menu.Item
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
              >
                <Check
                  className={cn(
                    "size-3.5 shrink-0",
                    p.id === selectedId ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{p.label}</span>
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
