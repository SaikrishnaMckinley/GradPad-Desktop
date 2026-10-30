import { cookies } from "next/headers";
import { ACTIVE_COMMUNITY_COOKIE } from "@/lib/communities/constants";

export { ACTIVE_COMMUNITY_COOKIE };

export async function getActiveCommunitySlug(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_COMMUNITY_COOKIE)?.value ?? null;
}

export async function setActiveCommunitySlug(slug: string) {
  const store = await cookies();
  store.set(ACTIVE_COMMUNITY_COOKIE, slug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
