import "server-only";

import { serverFetchForm, serverFetchJson } from "@/lib/api/server-fetch";

export async function fetchPostsByCommunityRaw(communityId: string, limit = 50) {
  return serverFetchJson<unknown>(
    `posts/?community=${encodeURIComponent(communityId)}&limit=${limit}&page_size=${limit}`,
  );
}

export async function fetchPostsByChannelRaw(channelId: string, limit = 50) {
  return serverFetchJson<unknown>(
    `posts/?channel=${encodeURIComponent(channelId)}&limit=${limit}&page_size=${limit}`,
  );
}

export async function stagingCreatePostRaw(form: FormData) {
  return serverFetchForm<unknown>("posts/", "POST", form);
}

export async function stagingUpdatePostRaw(postId: string, form: FormData) {
  return serverFetchForm<unknown>(`posts/${postId}/`, "PATCH", form);
}

export async function stagingDeletePostRaw(postId: string) {
  return serverFetchJson<unknown>(`posts/${postId}/`, { method: "DELETE" });
}

export async function fetchPostByIdRaw(postId: string) {
  return serverFetchJson<unknown>(`posts/${postId}/`);
}

export async function stagingLikePostRaw(postId: string, category = "like") {
  return serverFetchJson<unknown>(`posts/${postId}/like/`, {
    method: "POST",
    body: JSON.stringify({ category, is_active: true }),
  });
}

export async function stagingUnlikePostRaw(postId: string, category = "like") {
  return serverFetchJson<unknown>(`posts/${postId}/unlike/`, {
    method: "POST",
    body: JSON.stringify({ category, is_active: false }),
  });
}

export async function stagingAddPostCommentRaw(postId: string, commentText: string) {
  const form = new FormData();
  form.append("comment", commentText);
  return serverFetchForm<unknown>(`posts/${postId}/comment/`, "POST", form);
}

export async function stagingSharePostRaw(postId: string, levelCount: number) {
  const form = new FormData();
  form.append("level_count", String(levelCount));
  return serverFetchForm<unknown>(`posts/${postId}/`, "PATCH", form);
}
