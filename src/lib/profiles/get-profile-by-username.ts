import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, headline, bio, institution, location, avatar_url, graduation_year",
    )
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error || !data?.username) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name ?? "Member",
    headline: data.headline,
    bio: data.bio,
    institution: data.institution,
    location: data.location,
    avatarUrl: data.avatar_url,
    graduationYear: data.graduation_year,
  };
}
