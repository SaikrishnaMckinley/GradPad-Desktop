import type { CommunityDetail, CommunityListItem } from "@/types/community";
import type { ShellUser } from "@/types/shell-user";

export type CommunityHubPayload = {
  community: CommunityDetail;
  channels: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
  }[];
  events: {
    id: string;
    title: string;
    start_at: string;
    location?: string | null;
    event_type?: string | null;
  }[];
  posts: {
    id: string;
    title: string | null;
    content: string;
    authorName: string;
    createdAt: string;
  }[];
  membersPreview: { fullName: string; avatarUrl: string | null }[];
  canManage: boolean;
  isMember: boolean;
  shellUser: ShellUser;
  memberships: CommunityListItem[];
};

const SESSION_PREFIX = "gradpad:hub:";
const MAX_AGE_MS = 1000 * 60 * 30;

const memory = new Map<string, CommunityHubPayload>();

let lastDisplayed: { routeKey: string; payload: CommunityHubPayload } | null = null;

type Stored = { savedAt: number; payload: CommunityHubPayload };

function storageKey(routeKey: string) {
  return `${SESSION_PREFIX}${routeKey}`;
}

export function readHubCache(routeKey: string): CommunityHubPayload | null {
  const mem = memory.get(routeKey);
  if (mem) return mem;

  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(routeKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(storageKey(routeKey));
      return null;
    }
    memory.set(routeKey, parsed.payload);
    return parsed.payload;
  } catch {
    return null;
  }
}

export function rememberDisplayedHub(routeKey: string, payload: CommunityHubPayload) {
  lastDisplayed = { routeKey, payload };
  writeHubCache(routeKey, payload);
}

/** Cached hub for this route while the server segment loads (client navigation / PPR hole). */
export function resolveHubFallback(routeKey: string): CommunityHubPayload | null {
  const cached = readHubCache(routeKey);
  if (cached) return cached;
  if (lastDisplayed?.routeKey === routeKey) return lastDisplayed.payload;
  return null;
}

export function writeHubCache(routeKey: string, payload: CommunityHubPayload) {
  memory.set(routeKey, payload);
  if (typeof window === "undefined") return;
  try {
    const stored: Stored = { savedAt: Date.now(), payload };
    sessionStorage.setItem(storageKey(routeKey), JSON.stringify(stored));
  } catch {
    /* quota — memory cache still works for the session */
  }
}

export function clearHubCache() {
  memory.clear();
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(SESSION_PREFIX)) keys.push(key);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
