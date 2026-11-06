import type { ChatConversation, ChatMessage } from "@/lib/chat/types";

const INBOX_KEY = "gradpad:chat:inbox:v1";
const THREAD_PREFIX = "gradpad:chat:thread:v1:";

function threadKey(threadId: string, type: "user" | "group") {
  return `${THREAD_PREFIX}${type}:${threadId}`;
}

export function readInboxCache(): ChatConversation[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(INBOX_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatConversation[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeInboxCache(conversations: ChatConversation[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(INBOX_KEY, JSON.stringify(conversations));
  } catch {
    /* ignore quota */
  }
}

export function readThreadCache(
  threadId: string,
  type: "user" | "group",
): { messages: ChatMessage[]; conversation: ChatConversation | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(threadKey(threadId, type));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      messages?: ChatMessage[];
      conversation?: ChatConversation | null;
    };
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    return { messages: parsed.messages, conversation: parsed.conversation ?? null };
  } catch {
    return null;
  }
}

export function writeThreadCache(
  threadId: string,
  type: "user" | "group",
  messages: ChatMessage[],
  conversation: ChatConversation | null,
) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      threadKey(threadId, type),
      JSON.stringify({ messages, conversation }),
    );
  } catch {
    /* ignore */
  }
}
