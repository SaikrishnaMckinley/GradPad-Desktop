import "server-only";

import { fetchChatThreadForGroupRaw } from "@/lib/api/chat";
import { serverFetchJson } from "@/lib/api/server-fetch";

function senderIdFromMessage(row: Record<string, unknown>): string {
  const sender = row.sender;
  if (typeof sender === "string") return sender;
  if (sender && typeof sender === "object") {
    const s = sender as Record<string, unknown>;
    return s.id != null ? String(s.id) : "";
  }
  return "";
}

/** Group unread uses Message.is_seen — mark others' messages read when opening a group thread. */
export async function markGroupThreadSeen(groupId: string, viewerUserId: string): Promise<void> {
  const result = await fetchChatThreadForGroupRaw(groupId);
  if (!result.ok || !result.data || typeof result.data !== "object") return;

  const messagesRaw = (result.data as Record<string, unknown>).messages;
  if (!Array.isArray(messagesRaw)) return;

  const toMark = messagesRaw
    .filter((item) => item && typeof item === "object")
    .map((item) => item as Record<string, unknown>)
    .filter((row) => {
      if (row.is_seen === true) return false;
      const senderId = senderIdFromMessage(row);
      return senderId && senderId !== viewerUserId;
    })
    .map((row) => String(row.id))
    .filter(Boolean);

  await Promise.all(
    toMark.map((messageId) =>
      serverFetchJson(`chat/${messageId}/update/`, {
        method: "PATCH",
        body: JSON.stringify({ is_seen: true }),
      }),
    ),
  );
}
