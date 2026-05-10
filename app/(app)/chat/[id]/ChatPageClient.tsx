"use client";

import type { UIMessage } from "ai";
import { ChatArea } from "@/components/ChatArea";

interface Props {
  chatId: string;
  initialMessages: UIMessage[];
}

export function ChatPageClient({ chatId, initialMessages }: Props) {
  return <ChatArea chatId={chatId} initialMessages={initialMessages} />;
}
