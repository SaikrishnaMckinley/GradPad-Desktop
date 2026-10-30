import type { FeedPostRow } from "@/lib/posts/map-post";

const SESSION_PREFIX = "gradpad:home-feed:";
const MAX_AGE_MS = 1000 * 60 * 15;

const memory = new Map<string, { posts: FeedPostRow[]; at: number }>();

function storageKey(communityId: string) {
  return `${SESSION_PREFIX}${communityId}`;
}

export function readHomeFeedCache(communityId: string): FeedPostRow[] | null {
  const mem = memory.get(communityId);
  if (mem && Date.now() - mem.at < MAX_AGE_MS) {
    return mem.posts;
  }

  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(communityId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { posts: FeedPostRow[]; at: number };
    if (Date.now() - parsed.at > MAX_AGE_MS) return null;
    memory.set(communityId, { posts: parsed.posts, at: parsed.at });
    return parsed.posts;
  } catch {
    return null;
  }
}

export function writeHomeFeedCache(communityId: string, posts: FeedPostRow[]) {
  const at = Date.now();
  memory.set(communityId, { posts, at });
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(communityId), JSON.stringify({ posts, at }));
  } catch {
    /* quota */
  }
}

export function invalidateHomeFeedCache(communityId?: string) {
  if (communityId) {
    memory.delete(communityId);
    if (typeof sessionStorage !== "undefined") {
      try {
        sessionStorage.removeItem(storageKey(communityId));
      } catch {
        /* ignore */
      }
    }
    return;
  }

  memory.clear();
  if (typeof sessionStorage === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(SESSION_PREFIX)) keys.push(key);
    }
    for (const key of keys) sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const HOME_FEED_INVALIDATE_EVENT = "gradpad:home-feed-invalidate";

export function notifyHomeFeedInvalidate(communityId?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(HOME_FEED_INVALIDATE_EVENT, { detail: { communityId } }),
  );
}
