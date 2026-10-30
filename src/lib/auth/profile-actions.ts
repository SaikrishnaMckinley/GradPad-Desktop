"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { readStagingActionError, serverFetchForm } from "@/lib/api/server-fetch";
import { SESSION_PROFILE_CACHE_TAG } from "@/lib/auth/get-api-session-profile";
import type { StagingUserDetail } from "@/types/profile";

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  nickname: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Handle: letters, numbers, underscore only"),
  shortBio: z.string().trim().max(500).optional(),
  program: z.string().trim().max(120).optional(),
  graduationYear: z.string().trim().max(4).optional(),
  currentIndustry: z.string().trim().max(120).optional(),
  company: z.string().trim().max(200).optional(),
  country: z.string().trim().max(120).optional(),
  hometown: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  linkedin: z.string().trim().max(300).optional(),
});

function invalidateProfileCaches(nickname: string | null) {
  updateTag(SESSION_PROFILE_CACHE_TAG);
  revalidatePath("/", "layout");
  if (nickname) {
    revalidatePath(`/profile/${nickname}`);
  }
}

export async function updateProfile(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    nickname: formData.get("nickname"),
    shortBio: formData.get("shortBio") || undefined,
    program: formData.get("program") || undefined,
    graduationYear: formData.get("graduationYear") || undefined,
    currentIndustry: formData.get("currentIndustry") || undefined,
    company: formData.get("company") || undefined,
    country: formData.get("country") || undefined,
    hometown: formData.get("hometown") || undefined,
    phone: formData.get("phone") || undefined,
    linkedin: formData.get("linkedin") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const body = new FormData();
  body.set("first_name", parsed.data.firstName);
  body.set("last_name", parsed.data.lastName);
  body.set("nickname", parsed.data.nickname);
  if (parsed.data.shortBio) body.set("short_bio", parsed.data.shortBio);
  if (parsed.data.program) body.set("program", parsed.data.program);
  if (parsed.data.graduationYear) body.set("graduation_year", parsed.data.graduationYear);
  if (parsed.data.currentIndustry) body.set("current_industry", parsed.data.currentIndustry);
  if (parsed.data.company) body.set("company", parsed.data.company);
  if (parsed.data.country) body.set("country", parsed.data.country);
  if (parsed.data.hometown) body.set("hometown", parsed.data.hometown);
  if (parsed.data.phone) body.set("phone", parsed.data.phone);
  if (parsed.data.linkedin) body.set("linkedin", parsed.data.linkedin);

  const result = await serverFetchForm<StagingUserDetail>("users/detail/", "PATCH", body);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not update profile." };
  }

  invalidateProfileCaches(parsed.data.nickname);
  return { success: true };
}

export async function updateProfilePhoto(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Photo must be 5 MB or smaller." };
  }

  const body = new FormData();
  body.set("photo", file);

  const result = await serverFetchForm<StagingUserDetail>("users/detail/", "PATCH", body);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not upload photo." };
  }

  const nickname = result.data?.nickname?.trim() || null;
  invalidateProfileCaches(nickname);
  return { success: true as const, photo: result.data?.photo ?? null };
}
