"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/i, "Username: letters, numbers, underscore only"),
  headline: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(2000).optional(),
  institution: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
});

export async function updateProfile(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    username: formData.get("username"),
    headline: formData.get("headline") || undefined,
    bio: formData.get("bio") || undefined,
    institution: formData.get("institution") || undefined,
    location: formData.get("location") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: existingUsername } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", parsed.data.username.toLowerCase())
    .neq("id", user.id)
    .maybeSingle();

  if (existingUsername) {
    return { error: "That username is already taken." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      username: parsed.data.username.toLowerCase(),
      headline: parsed.data.headline ?? null,
      bio: parsed.data.bio ?? null,
      institution: parsed.data.institution ?? null,
      location: parsed.data.location ?? null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/profile/${parsed.data.username.toLowerCase()}`);
  return { success: true };
}

export async function updateAvatarUrl(avatarUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true as const };
}
