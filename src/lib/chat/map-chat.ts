import { resolveStagingMediaUrl } from "@/lib/api/media-url";
import type { ChatConversation, ChatGroupPerson, ChatMessage } from "@/lib/chat/types";

function str(value: unknown): string {
  return value != null ? String(value) : "";
}

function senderIdFromRaw(sender: unknown): string {
  if (typeof sender === "string") return sender;
  if (sender && typeof sender === "object") {
    const s = sender as Record<string, unknown>;
    return str(s.id ?? s.email);
  }
  return "";
}

function senderNameFromRaw(sender: unknown): string {
  if (typeof sender === "string") {
    if (sender.includes("@")) return sender.split("@")[0] ?? sender;
    return sender;
  }
  if (sender && typeof sender === "object") {
    const s = sender as Record<string, unknown>;
    const full =
      (typeof s.full_name === "string" && s.full_name.trim()) ||
      [s.first_name, s.last_name].filter(Boolean).join(" ").trim();
    if (full) return full;
    if (typeof s.email === "string") return s.email.split("@")[0] ?? s.email;
  }
  return "Member";
}

function senderPhotoFromRaw(sender: unknown): string | null {
  if (sender && typeof sender === "object") {
    const photo = (sender as Record<string, unknown>).photo;
    return typeof photo === "string" && photo.trim() ? photo : null;
  }
  return null;
}

function mapGroupPerson(raw: unknown): ChatGroupPerson | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = str(row.id);
  if (!id) return null;
  const first = str(row.first_name);
  const last = str(row.last_name);
  const name =
    [first, last].filter(Boolean).join(" ").trim() ||
    str(row.name) ||
    str(row.full_name) ||
    (typeof row.email === "string" ? row.email.split("@")[0] : "") ||
    "Member";
  const photo =
    resolveStagingMediaUrl(
      (typeof row.photo === "string" && row.photo) ||
        (typeof row.avatar_url === "string" && row.avatar_url) ||
        null,
    ) ?? null;
  return {
    id,
    name,
    email: typeof row.email === "string" ? row.email : undefined,
    photo,
  };
}

function mapGroupPeople(raw: unknown): ChatGroupPerson[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapGroupPerson).filter(Boolean) as ChatGroupPerson[];
}

export function mapConversationRow(raw: unknown): ChatConversation | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = str(row.id);
  if (!id) return null;
  const type = row.type === "group" ? "group" : "user";
  return {
    id,
    name: str(row.name) || (type === "group" ? "Group chat" : "Member"),
    email: typeof row.email === "string" ? row.email : undefined,
    type,
    image:
      (typeof row.image === "string" && row.image) ||
      (typeof row.avatar_url === "string" && row.avatar_url) ||
      null,
    lastMessage:
      typeof row.last_message === "string"
        ? row.last_message
        : row.last_message == null
          ? null
          : "Media",
    lastAt: str(row.last_at) || new Date().toISOString(),
    unreadCount: typeof row.unread_count === "number" ? row.unread_count : 0,
    isBlocked: Boolean(row.is_blocked),
    blockedByMe: Boolean(row.blocked_by_me),
    userHasLeft: Boolean(row.user_has_left ?? row.has_left_group),
    memberStatus: typeof row.member_status === "string" ? row.member_status : null,
    members: type === "group" ? mapGroupPeople(row.members) : undefined,
    admins: type === "group" ? mapGroupPeople(row.admins) : undefined,
    createdById:
      row.created_by && typeof row.created_by === "object"
        ? str((row.created_by as Record<string, unknown>).id) || null
        : null,
    description: typeof row.description === "string" ? row.description : null,
  };
}

export function mapConversationsList(data: unknown): ChatConversation[] {
  const list = Array.isArray(data) ? data : [];
  const mapped = list.map(mapConversationRow).filter(Boolean) as ChatConversation[];
  const seen = new Set<string>();
  return mapped.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

export function mapMessageRow(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = str(row.id);
  if (!id) return null;
  const sender = row.sender;
  const mediaRaw = Array.isArray(row.media) ? row.media : [];
  const media = mediaRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const m = item as Record<string, unknown>;
      const file = str(m.file);
      if (!file) return null;
      return {
        id: str(m.id) || file,
        file,
        mediaType: str(m.media_type ?? m.mediaType) || "image",
      };
    })
    .filter(Boolean) as ChatMessage["media"];

  return {
    id,
    text: str(row.text),
    createdAt: str(row.created_at) || new Date().toISOString(),
    messageType: row.message_type === "group" ? "group" : "private",
    senderId: senderIdFromRaw(sender),
    senderName: senderNameFromRaw(sender),
    senderPhoto: senderPhotoFromRaw(sender),
    isDeleted: Boolean(row.is_deleted),
    isEdited: Boolean(row.is_edited),
    media,
  };
}

export function mapThreadResponse(
  data: unknown,
  threadId: string,
  type: "user" | "group",
  fallback?: ChatConversation | null,
): { conversation: ChatConversation | null; messages: ChatMessage[] } {
  if (type === "group" && data && typeof data === "object") {
    const body = data as Record<string, unknown>;
    const messagesRaw = Array.isArray(body.messages) ? body.messages : [];
    const messages = messagesRaw.map(mapMessageRow).filter(Boolean) as ChatMessage[];
    const group = body.group && typeof body.group === "object" ? (body.group as Record<string, unknown>) : null;
    let conversation = fallback ?? null;
    if (group) {
      conversation = {
        id: str(group.id) || threadId,
        name: str(group.name) || fallback?.name || "Group chat",
        type: "group",
        image: typeof group.image === "string" ? group.image : fallback?.image ?? null,
        lastMessage: messages.at(-1)?.text ?? fallback?.lastMessage ?? null,
        lastAt: messages.at(-1)?.createdAt ?? fallback?.lastAt ?? new Date().toISOString(),
        unreadCount: fallback?.unreadCount ?? 0,
        userHasLeft: Boolean(group.has_left_group),
        members: mapGroupPeople(group.members),
        admins: mapGroupPeople(group.admins),
        createdById:
          group.created_by && typeof group.created_by === "object"
            ? str((group.created_by as Record<string, unknown>).id) || null
            : fallback?.createdById ?? null,
        description:
          typeof group.description === "string" ? group.description : fallback?.description ?? null,
      };
    }
    return { conversation, messages };
  }

  const messagesRaw = Array.isArray(data) ? data : [];
  const messages = messagesRaw.map(mapMessageRow).filter(Boolean) as ChatMessage[];
  return { conversation: fallback ?? null, messages };
}
