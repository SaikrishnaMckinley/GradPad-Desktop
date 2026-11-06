import type { CommunityMembersDirectorySnapshot } from "@/lib/communities/load-community-members-directory";

const PREFIX = "gradpad:community-members-dir:v1:";
const MAX_AGE_MS = 1000 * 60 * 30;

type Stored = { savedAt: number; data: CommunityMembersDirectorySnapshot };

const memory = new Map<string, CommunityMembersDirectorySnapshot>();

function key(slug: string) {
  return `${PREFIX}${slug.toLowerCase()}`;
}

export function readCommunityMembersDirectoryCache(
  slug: string,
): CommunityMembersDirectorySnapshot | null {
  const mem = memory.get(slug.toLowerCase());
  if (mem) return mem;

  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(key(slug));
      return null;
    }
    memory.set(slug.toLowerCase(), parsed.data);
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeCommunityMembersDirectoryCache(data: CommunityMembersDirectorySnapshot) {
  const slug = data.slug.toLowerCase();
  memory.set(slug, data);
  if (typeof sessionStorage === "undefined") return;
  try {
    const stored: Stored = { savedAt: Date.now(), data };
    sessionStorage.setItem(key(slug), JSON.stringify(stored));
  } catch {
    /* quota */
  }
}
