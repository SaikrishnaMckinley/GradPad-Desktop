import type { CommunityChannelPayload } from "@/lib/communities/load-community-channel";

const SESSION_PREFIX = "gradpad:channel:";
const MAX_AGE_MS = 1000 * 60 * 30;

const memory = new Map<string, CommunityChannelPayload>();

type Stored = { savedAt: number; payload: CommunityChannelPayload };

function storageKey(communityKey: string, channelKey: string) {
  return `${SESSION_PREFIX}${communityKey}:${channelKey}`;
}

function routeKeys(payload: CommunityChannelPayload) {
  const communityKey = payload.community.slug ?? payload.community.id;
  const channelKey = payload.channel.slug ?? payload.channel.id;
  return { communityKey, channelKey };
}

export function readChannelCache(
  communityRouteKey: string,
  channelRouteKey: string,
): CommunityChannelPayload | null {
  const memKey = `${communityRouteKey}:${channelRouteKey}`;
  const mem = memory.get(memKey);
  if (mem) return mem;

  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(communityRouteKey, channelRouteKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(storageKey(communityRouteKey, channelRouteKey));
      return null;
    }
    memory.set(memKey, parsed.payload);
    return parsed.payload;
  } catch {
    return null;
  }
}

export function writeChannelCache(payload: CommunityChannelPayload) {
  const { communityKey, channelKey } = routeKeys(payload);
  const memKey = `${communityKey}:${channelKey}`;
  memory.set(memKey, payload);
  if (typeof window === "undefined") return;
  try {
    const stored: Stored = { savedAt: Date.now(), payload };
    sessionStorage.setItem(storageKey(communityKey, channelKey), JSON.stringify(stored));
  } catch {
    /* quota */
  }
}

export function resolveChannelFallback(
  communityRouteKey: string,
  channelRouteKey: string,
): CommunityChannelPayload | null {
  return readChannelCache(communityRouteKey, channelRouteKey);
}
