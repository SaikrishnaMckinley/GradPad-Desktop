import type { HighlightMember } from "@/lib/communities/pick-highlight-members";

const KEY_PREFIX = "gradpad:home:highlights:v1:";

export function readHighlightMembersCache(communityId: string): HighlightMember[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${KEY_PREFIX}${communityId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HighlightMember[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeHighlightMembersCache(communityId: string, members: HighlightMember[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${KEY_PREFIX}${communityId}`, JSON.stringify(members));
  } catch {
    /* ignore quota */
  }
}

export async function fetchHighlightMembers(communityId: string): Promise<HighlightMember[]> {
  const res = await fetch(
    `/api/communities/${encodeURIComponent(communityId)}/highlight-members`,
    { credentials: "include" },
  );
  if (!res.ok) return [];
  const body = (await res.json()) as { members?: HighlightMember[] };
  const members = Array.isArray(body.members) ? body.members : [];
  writeHighlightMembersCache(communityId, members);
  return members;
}
