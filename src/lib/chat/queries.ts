import "server-only";

import {
  fetchChatConversationsRaw,
  fetchChatThreadForGroupRaw,
  fetchChatThreadForUserRaw,
} from "@/lib/api/chat";
import { mapConversationsList, mapThreadResponse } from "@/lib/chat/map-chat";
import type { ChatConversation, ChatThreadPayload } from "@/lib/chat/types";

export async function loadChatConversations(): Promise<ChatConversation[]> {
  const result = await fetchChatConversationsRaw();
  if (!result.ok || !result.data) return [];
  return mapConversationsList(result.data);
}

export async function loadChatThread(
  threadId: string,
  type: "user" | "group",
  fallback?: ChatConversation | null,
): Promise<ChatThreadPayload> {
  const result =
    type === "group"
      ? await fetchChatThreadForGroupRaw(threadId)
      : await fetchChatThreadForUserRaw(threadId);

  if (!result.ok) {
    return { conversation: fallback ?? null, messages: [] };
  }

  const mapped = mapThreadResponse(result.data, threadId, type, fallback);
  if (!mapped.conversation && fallback) {
    mapped.conversation = fallback;
  }
  return mapped;
}
