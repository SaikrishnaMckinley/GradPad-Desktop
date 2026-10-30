import { serverFetchJson } from "@/lib/api/server-fetch";
import type { SessionProfile } from "@/lib/auth/get-session-profile";

type ApiUserDetail = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  nickname?: string | null;
  short_bio?: string | null;
  photo?: string | null;
};

export async function getApiSessionProfile(): Promise<SessionProfile | null> {
  try {
    const { ok, data } = await serverFetchJson<ApiUserDetail>("users/detail/");
    if (!ok || !data) return null;
    const fullName =
      [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
      data.nickname?.trim() ||
      data.email?.split("@")[0] ||
      "Member";

    return {
      id: String(data.id),
      fullName,
      username: data.nickname?.trim() || null,
      headline: data.short_bio?.trim() || null,
      avatarUrl: data.photo ?? null,
    };
  } catch {
    return null;
  }
}
