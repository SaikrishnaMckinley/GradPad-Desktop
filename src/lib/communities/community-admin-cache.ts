import type { CommunityAdminDashboardData } from "@/lib/communities/load-admin-dashboard";

const PREFIX = "gradpad:community-admin:v1:";
const MAX_AGE_MS = 1000 * 60 * 30;

type Stored = { savedAt: number; data: CommunityAdminDashboardData };

const memory = new Map<string, CommunityAdminDashboardData>();

function key(slug: string) {
  return `${PREFIX}${slug.toLowerCase()}`;
}

export function readCommunityAdminCache(slug: string): CommunityAdminDashboardData | null {
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

export function writeCommunityAdminCache(data: CommunityAdminDashboardData) {
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

export function patchCommunityAdminCache(
  slug: string,
  patch: Partial<Pick<CommunityAdminDashboardData, "pending" | "members">>,
) {
  const current = readCommunityAdminCache(slug);
  if (!current) return;
  writeCommunityAdminCache({ ...current, ...patch });
}

export const COMMUNITY_ADMIN_INVALIDATE = "gradpad:community-admin-invalidate";

export function notifyCommunityAdminInvalidate(slug: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COMMUNITY_ADMIN_INVALIDATE, { detail: { slug } }));
}
