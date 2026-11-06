import "server-only";

import { serverFetchForm, serverFetchJson } from "@/lib/api/server-fetch";

export async function fetchChatConversationsRaw() {
  return serverFetchJson<unknown>("chat/conversations/");
}

export async function fetchChatThreadForUserRaw(userId: string) {
  return serverFetchJson<unknown>(`chat/thread/?user_id=${encodeURIComponent(userId)}`);
}

export async function fetchChatThreadForGroupRaw(groupId: string) {
  return serverFetchJson<unknown>(`chat/thread/?group_id=${encodeURIComponent(groupId)}`);
}

export async function stagingSendChatMessageRaw(form: FormData) {
  return serverFetchForm<unknown>("chat/send/", "POST", form);
}

export async function stagingMarkChatThreadSeenRaw(threadId: string) {
  return serverFetchJson<unknown>(`chat/thread/${threadId}/seen/`, { method: "POST" });
}

export async function stagingCreateGroupChatRaw(body: {
  name?: string;
  admins: string[];
  members: string[];
  message: string;
}) {
  return serverFetchJson<unknown>("chat/group/create/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function stagingEditChatMessageRaw(messageId: string, text: string) {
  return serverFetchJson<unknown>(`chat/${messageId}/update/`, {
    method: "PATCH",
    body: JSON.stringify({ text }),
  });
}

export async function stagingDeleteChatMessageRaw(messageId: string, deleteFor: "me" | "everyone") {
  return serverFetchJson<unknown>(
    `chat/${messageId}/delete/?delete_for=${encodeURIComponent(deleteFor)}`,
    { method: "DELETE" },
  );
}

export async function stagingBlockChatUserRaw(userId: string) {
  return serverFetchJson<unknown>("chat/block/", {
    method: "POST",
    body: JSON.stringify({ blocked: userId }),
  });
}

export async function stagingUnblockChatUserRaw(userId: string) {
  return serverFetchJson<unknown>(`chat/unblock/${userId}/`, { method: "DELETE" });
}

export async function stagingLeaveGroupRaw(groupId: string) {
  return serverFetchJson<unknown>(`chat/group/${groupId}/leave/`, { method: "POST" });
}

export async function stagingAddGroupMembersRaw(groupId: string, userIds: string[]) {
  return serverFetchJson<unknown>(`chat/group/${groupId}/add-member/`, {
    method: "POST",
    body: JSON.stringify({ user_id: userIds }),
  });
}

export async function stagingDeleteChatConversationRaw(type: "user" | "group", id: string) {
  return serverFetchJson<unknown>("chat/conversations/delete/", {
    method: "DELETE",
    body: JSON.stringify({ type, id }),
  });
}
