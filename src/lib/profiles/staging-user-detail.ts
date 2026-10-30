import "server-only";

import { serverFetchJson } from "@/lib/api/server-fetch";
import type { StagingUserDetail, UserProfileView } from "@/types/profile";

export type { StagingUserDetail, UserProfileView };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUserIdSlug(slug: string): boolean {
  return UUID_RE.test(slug) || /^\d+$/.test(slug);
}

export function mapStagingUserDetail(raw: StagingUserDetail): UserProfileView {
  const firstName = raw.first_name?.trim() ?? "";
  const lastName = raw.last_name?.trim() ?? "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    raw.nickname?.trim() ||
    raw.email?.split("@")[0] ||
    "Member";

  return {
    id: String(raw.id),
    email: raw.email?.trim() || null,
    firstName,
    lastName,
    fullName,
    nickname: raw.nickname?.trim() || null,
    shortBio: raw.short_bio?.trim() || null,
    photo: raw.photo ?? null,
    program: raw.program?.trim() || null,
    graduationYear:
      raw.graduation_year != null && String(raw.graduation_year).trim() !== ""
        ? String(raw.graduation_year)
        : null,
    currentIndustry: raw.current_industry?.trim() || null,
    company: raw.company?.trim() || null,
    country: raw.country?.trim() || null,
    hometown: raw.hometown?.trim() || null,
    phone: raw.phone?.trim() || null,
    linkedin: raw.linkedin?.trim() || null,
  };
}

export async function fetchCurrentStagingUserDetail(): Promise<UserProfileView | null> {
  const { ok, data } = await serverFetchJson<StagingUserDetail>("users/detail/");
  if (!ok || !data) return null;
  return mapStagingUserDetail(data);
}

export async function fetchStagingUserDetailById(
  userId: string,
): Promise<UserProfileView | null> {
  const { ok, data } = await serverFetchJson<StagingUserDetail>(
    `users/${encodeURIComponent(userId)}/details/`,
  );
  if (!ok || !data) return null;
  return mapStagingUserDetail(data);
}
