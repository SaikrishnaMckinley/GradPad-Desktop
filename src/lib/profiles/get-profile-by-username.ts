import {
  fetchCurrentStagingUserDetail,
  fetchStagingUserDetailById,
  isUserIdSlug,
} from "@/lib/profiles/staging-user-detail";
import type { UserProfileView } from "@/types/profile";

/** @deprecated Use UserProfileView from staging-user-detail; kept for imports. */
export type PublicProfile = {
  id: string;
  username: string;
  fullName: string;
  headline: string | null;
  bio: string | null;
  institution: string | null;
  location: string | null;
  avatarUrl: string | null;
  graduationYear: number | null;
};

export async function getProfileByUsername(
  username: string,
): Promise<PublicProfile | null> {
  const slug = username.trim();
  if (!slug) return null;

  if (isUserIdSlug(slug)) {
    const byId = await fetchStagingUserDetailById(slug);
    return byId ? toLegacyPublicProfile(byId) : null;
  }

  const current = await fetchCurrentStagingUserDetail();
  if (!current) return null;

  const nicknameMatch =
    current.nickname && current.nickname.toLowerCase() === slug.toLowerCase();
  const idMatch = current.id === slug;

  if (!nicknameMatch && !idMatch) {
    return null;
  }

  return toLegacyPublicProfile(current);
}

/** Full staging profile for profile page (own user or by user id slug). */
export async function getUserProfileView(username: string) {
  const slug = username.trim();
  if (!slug) return null;

  if (isUserIdSlug(slug)) {
    return fetchStagingUserDetailById(slug);
  }

  const current = await fetchCurrentStagingUserDetail();
  if (!current) return null;

  const nicknameMatch =
    current.nickname && current.nickname.toLowerCase() === slug.toLowerCase();
  if (nicknameMatch || current.id === slug) {
    return current;
  }

  return null;
}

function toLegacyPublicProfile(profile: UserProfileView): PublicProfile {
  const p = profile;
  const grad = p.graduationYear ? Number.parseInt(p.graduationYear, 10) : NaN;
  return {
    id: p.id,
    username: p.nickname ?? p.id,
    fullName: p.fullName,
    headline: p.shortBio,
    bio: p.shortBio,
    institution: p.company,
    location: [p.hometown, p.country].filter(Boolean).join(" · ") || null,
    avatarUrl: p.photo,
    graduationYear: Number.isFinite(grad) ? grad : null,
  };
}
