"use client";

import { ChatArea } from "@/components/ChatArea";
import { useAppShell } from "@/components/AppShell";

export default function Home() {
  const { config, setConfig, chatKey } = useAppShell();
  return (
    <ChatArea
      key={chatKey}
      config={config}
      onConfigChange={setConfig}
    />
  );
}
