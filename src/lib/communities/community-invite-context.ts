"use client";

export const COMMUNITY_INVITE_CONTEXT_KEY = "community_invite_context";

export type CommunityInviteContext = {
  communityId: string;
  redirect?: string;
};

export function saveCommunityInviteContext(ctx: CommunityInviteContext) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMMUNITY_INVITE_CONTEXT_KEY, JSON.stringify(ctx));
}

export function readCommunityInviteContext(): CommunityInviteContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COMMUNITY_INVITE_CONTEXT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CommunityInviteContext;
  } catch {
    return null;
  }
}

export function clearCommunityInviteContext() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMMUNITY_INVITE_CONTEXT_KEY);
}
