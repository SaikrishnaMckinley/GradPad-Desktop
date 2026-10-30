"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setActiveCommunitySlug } from "@/lib/communities/active-community";
import { requireActiveCommunityMember } from "@/lib/communities/membership-guard";
import { canAssignRole, canManageCommunity } from "@/lib/communities/permissions";
import { getCommunityBySlug } from "@/lib/communities/queries";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getSessionTokens } from "@/lib/auth/session-cookies";
import { stagingCreateChannel } from "@/lib/api/staging-channel";
import { stagingCreateCommunity } from "@/lib/api/staging-community";
import {
  serverFetchForm,
  serverFetchJson,
  serverFetchPost,
  readStagingActionError,
} from "@/lib/api/server-fetch";
import { fetchCommunityDetailRaw } from "@/lib/api/communities";
import { mapCommunityDetail, mapSidebarCommunity } from "@/lib/api/map-community";
import { communityHubAfterInvitePath } from "@/lib/communities/community-invite-url";
import { resolveCommunityId } from "@/lib/communities/api-queries";
import { isDemoStaticUi, usesStagingApi } from "@/lib/demo-mode";
import { createClient } from "@/lib/supabase/server";
import {
  channelFormSchema,
  communityFormSchema,
  memberRoleSchema,
} from "@/lib/validations/community";
import type { MembershipRole, MembershipStatus } from "@/types/community";

export type ActionResult = {
  error?: string;
  success?: string;
  redirectTo?: string;
  /** Hint for client shell refresh after create */
  refreshShell?: boolean;
};

const STAGING_MUTATION_MSG =
  "This action is not wired to the staging API in desktop yet (see gradpad-web / gradpad-api).";

function blockIfStagingOnlyMutation(): ActionResult | null {
  if (usesStagingApi()) {
    return { error: STAGING_MUTATION_MSG };
  }
  return null;
}

async function requireUserId(): Promise<string | ActionResult> {
  const session = await getSessionProfile();
  if (!session) {
    return { error: "Sign in to continue." };
  }
  return session.id;
}

function revalidateCommunity(slug: string) {
  revalidatePath("/communities");
  revalidatePath(`/communities/${slug}`);
  revalidatePath(`/communities/${slug}/admin`);
  revalidatePath(`/communities/${slug}/members`);
  revalidatePath("/home");
  revalidatePath("/", "layout");
}

function revalidateChannel(communityRouteKey: string, channelSlug: string) {
  revalidateCommunity(communityRouteKey);
  revalidatePath(`/communities/${communityRouteKey}/channels/${channelSlug}`);
}

function stagingCommunityFormData(
  formData: FormData,
  parsed: {
    name: string;
    description?: string;
    visibility: "public" | "private" | "hidden";
  },
): FormData {
  const body = new FormData();
  body.append("name", parsed.name);
  body.append("description", parsed.description?.trim() ?? "");
  body.append("is_private", parsed.visibility === "private" ? "true" : "false");

  const logo = formData.get("logo");
  const image = formData.get("image");
  if (logo instanceof File && logo.size > 0) {
    body.append("logo", logo);
  }
  if (image instanceof File && image.size > 0) {
    body.append("image", image);
  }
  return body;
}

export async function createCommunity(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { access } = await getSessionTokens();
  if (!access) {
    return { error: "Sign in again — your session cookie is missing." };
  }

  const parsed = communityFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    institution: formData.get("institution"),
    location: formData.get("location"),
    visibility: formData.get("visibility"),
    joinApprovalRequired: formData.get("joinApprovalRequired") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (usesStagingApi()) {
    const logo = formData.get("logo");
    const image = formData.get("image");

    const result = await stagingCreateCommunity(access, {
      name: parsed.data.name,
      description: parsed.data.description?.trim() ?? "",
      isPrivate: parsed.data.visibility === "private",
      logo: logo instanceof File ? logo : null,
      image: image instanceof File ? image : null,
    });

    if (!result.ok) {
      return { error: result.error };
    }

    const mapped = mapSidebarCommunity({
      ...result.community,
      is_owner: true,
      is_admin: true,
      is_member: true,
    });
    const routeKey =
      mapped?.slug ?? (result.community.id != null ? String(result.community.id) : parsed.data.slug);

    await setActiveCommunitySlug(routeKey);
    revalidateCommunity(routeKey);
    revalidatePath("/", "layout");

    return {
      success: "Community created.",
      redirectTo: `/communities/${routeKey}`,
      refreshShell: true,
    };
  }

  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_community_with_owner", {
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_description: parsed.data.description || null,
    p_institution: parsed.data.institution || null,
    p_location: parsed.data.location || null,
    p_visibility: parsed.data.visibility,
    p_join_approval_required: parsed.data.joinApprovalRequired,
    p_logo_url: null,
    p_cover_image_url: null,
  });

  if (error) {
    if (error.message.includes("Could not find the function")) {
      return {
        error:
          "Communities database setup is missing. In Supabase → SQL Editor, run the files in supabase/migrations/ (oldest first), then try again. Or set DATABASE_URL and run: npm run db:migrate",
      };
    }
    if (error.message.includes("duplicate") || error.code === "23505") {
      return { error: "That community URL is already taken. Choose another slug." };
    }
    return { error: error.message };
  }

  await setActiveCommunitySlug(parsed.data.slug);
  revalidateCommunity(parsed.data.slug);
  redirect(`/communities/${parsed.data.slug}/edit?created=1`);
}

export async function createChannel(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!usesStagingApi()) {
    return {
      error:
        "Channel creation uses the staging API. Set NEXT_PUBLIC_DEMO_STATIC_UI=false and sign in with staging.",
    };
  }

  const { access } = await getSessionTokens();
  if (!access) {
    return { error: "Sign in again — your session cookie is missing." };
  }

  const parsed = channelFormSchema.safeParse({
    communityId: formData.get("communityId"),
    communityRouteKey: formData.get("communityRouteKey"),
    name: formData.get("name"),
    description: formData.get("description"),
    visibility: formData.get("visibility"),
    passcode: formData.get("passcode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const membershipError = await requireActiveCommunityMember(parsed.data.communityId);
  if (membershipError) {
    return { error: membershipError };
  }

  const logo = formData.get("logo");
  const image = formData.get("image");
  if (!(logo instanceof File) || logo.size === 0) {
    return { error: "Add a channel logo using the preview card above." };
  }

  const result = await stagingCreateChannel(access, parsed.data.communityId, {
    name: parsed.data.name,
    description: parsed.data.description,
    visibility: parsed.data.visibility,
    passcode: parsed.data.passcode,
    logo,
    image: image instanceof File ? image : null,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  const communityRouteKey = parsed.data.communityRouteKey;
  const channelSlug = result.channel.slug;
  revalidateChannel(communityRouteKey, channelSlug);
  revalidatePath("/", "layout");

  return {
    success: "Channel created.",
    redirectTo: `/communities/${communityRouteKey}/channels/${channelSlug}`,
    refreshShell: true,
  };
}

export async function updateCommunity(
  communityId: string,
  slug: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const community = await getCommunityBySlug(slug, userId);
  if (!community || !canManageCommunity(community.membershipRole)) {
    return { error: "You are not allowed to edit this community." };
  }

  const parsed = communityFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    institution: formData.get("institution"),
    location: formData.get("location"),
    visibility: formData.get("visibility"),
    joinApprovalRequired: formData.get("joinApprovalRequired") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (usesStagingApi()) {
    const result = await serverFetchForm(
      `community/${communityId}/`,
      "PATCH",
      stagingCommunityFormData(formData, parsed.data),
    );
    const err = readStagingActionError(result);
    if (err) return { error: err };

    await setActiveCommunitySlug(slug);
    revalidateCommunity(slug);
    return { success: "Community updated." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("communities")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      institution: parsed.data.institution || null,
      location: parsed.data.location || null,
      visibility: parsed.data.visibility,
      join_approval_required: parsed.data.joinApprovalRequired,
    })
    .eq("id", communityId);

  if (error) {
    if (error.code === "23505") {
      return { error: "That community URL is already taken." };
    }
    return { error: error.message };
  }

  await setActiveCommunitySlug(parsed.data.slug);
  revalidateCommunity(parsed.data.slug);
  return { success: "Community updated." };
}

export async function updateCommunityImageUrls(
  communityId: string,
  slug: string,
  patch: { logoUrl?: string | null; coverImageUrl?: string | null },
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const community = await getCommunityBySlug(slug, userId);
  if (!community || !canManageCommunity(community.membershipRole)) {
    return { error: "You are not allowed to update community images." };
  }

  if (usesStagingApi()) {
    return {
      error:
        "Upload logo or cover from the edit community page (Save changes uploads files to staging).",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("communities")
    .update({
      ...(patch.logoUrl !== undefined ? { logo_url: patch.logoUrl } : {}),
      ...(patch.coverImageUrl !== undefined ? { cover_image_url: patch.coverImageUrl } : {}),
    })
    .eq("id", communityId);

  if (error) {
    return { error: error.message };
  }

  revalidateCommunity(slug);
  return { success: "Image updated." };
}

export async function joinCommunityAction(communityId: string, slug: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  if (usesStagingApi()) {
    const result = await serverFetchPost("requests/create/", {
      request_type: "community",
      message: "Join request",
      community: communityId,
    });
    if (!result.ok) {
      return { error: "Could not send join request. Try again." };
    }
    await setActiveCommunitySlug(communityId);
    revalidateCommunity(slug);
    revalidatePath("/", "layout");
    return {
      success: "Join request sent. You'll be notified when approved.",
      redirectTo: communityHubAfterInvitePath(communityId, "pending"),
    };
  }

  const supabase = await createClient();
  const { data: status, error } = await supabase.rpc("join_community", {
    p_community_id: communityId,
  });

  if (error) {
    return { error: error.message };
  }

  if (status === "active") {
    await setActiveCommunitySlug(slug);
  }

  revalidateCommunity(slug);
  return {
    success:
      status === "pending"
        ? "Membership request sent."
        : "You joined the community.",
    redirectTo: `/communities/${slug}`,
  };
}

/**
 * After opening a share link while signed in (gradpad-web `checkAndHandleCommunityAccess`).
 */
export async function completeCommunityInviteFromLink(routeKey: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  if (!usesStagingApi()) {
    return { error: "Community invite links are only supported against staging." };
  }

  const communityId = await resolveCommunityId(routeKey);
  if (!communityId) {
    return { error: "Community not found.", redirectTo: "/communities/discover" };
  }

  const detail = await fetchCommunityDetailRaw(communityId);
  if (!detail.ok || !detail.data) {
    return { error: "Community not found.", redirectTo: "/communities/discover" };
  }

  const community = mapCommunityDetail(detail.data);
  if (!community) {
    return { error: "Community not found.", redirectTo: "/communities/discover" };
  }

  const raw = detail.data;
  if (raw.is_member || raw.is_owner || raw.is_admin) {
    await setActiveCommunitySlug(community.id);
    revalidatePath("/", "layout");
    return {
      success: "Welcome back!",
      redirectTo: communityHubAfterInvitePath(community.id),
    };
  }

  if (raw.applied) {
    await setActiveCommunitySlug(community.id);
    revalidatePath("/", "layout");
    return {
      success: "Your join request is pending approval.",
      redirectTo: communityHubAfterInvitePath(community.id, "pending"),
    };
  }

  return joinCommunityAction(community.id, community.slug);
}

export async function leaveCommunityAction(
  communityId: string,
  slug: string,
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  if (usesStagingApi()) {
    const result = await serverFetchPost(`community/${communityId}/remove-member/${userId}/`, {});
    if (!result.ok) {
      return { error: "Could not leave this community." };
    }
    revalidateCommunity(slug);
    revalidatePath("/", "layout");
    return { success: "You left the community." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_community", {
    p_community_id: communityId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateCommunity(slug);
  revalidatePath("/", "layout");
  return { success: "You left the community." };
}

export async function reviewMembershipRequest(
  requestId: string,
  communityId: string,
  slug: string,
  decision: "active" | "rejected",
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const community = await getCommunityBySlug(slug, userId);
  if (!community || !canManageCommunity(community.membershipRole)) {
    return { error: "You are not allowed to review membership requests." };
  }

  void communityId;

  if (usesStagingApi()) {
    const result =
      decision === "active"
        ? await serverFetchJson(`requests/${requestId}/accept/`, {
            method: "PATCH",
            body: JSON.stringify({}),
          })
        : await serverFetchJson(`requests/${requestId}/`, { method: "DELETE" });

    if (!result.ok) {
      return {
        error:
          readStagingActionError(result) ??
          (decision === "active" ? "Could not approve request." : "Could not reject request."),
      };
    }

    revalidateCommunity(slug);
    revalidatePath(`/communities/${slug}/admin`);
    return { success: decision === "active" ? "Member approved." : "Request rejected." };
  }

  const blocked = blockIfStagingOnlyMutation();
  if (blocked) return blocked;

  const supabase = await createClient();
  const { error } = await supabase
    .from("community_members")
    .update({ status: decision satisfies MembershipStatus })
    .eq("id", requestId)
    .eq("community_id", communityId)
    .eq("status", "pending");

  if (error) {
    return { error: error.message };
  }

  revalidateCommunity(slug);
  return { success: decision === "active" ? "Member approved." : "Request rejected." };
}

export async function updateMemberRoleAction(
  membershipId: string,
  communityId: string,
  slug: string,
  nextRole: MembershipRole,
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const parsedRole = memberRoleSchema.safeParse(nextRole);
  if (!parsedRole.success) {
    return { error: "Invalid role." };
  }

  const community = await getCommunityBySlug(slug, userId);
  const actorRole = community?.membershipRole;
  if (!community || !actorRole || !canManageCommunity(actorRole)) {
    return { error: "You are not allowed to change roles." };
  }

  if (!canAssignRole(actorRole, parsedRole.data)) {
    return { error: "You cannot assign that role." };
  }

  const blocked = blockIfStagingOnlyMutation();
  if (blocked) return blocked;

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("community_members")
    .select("user_id, role, status")
    .eq("id", membershipId)
    .eq("community_id", communityId)
    .maybeSingle();

  if (!target || target.status !== "active") {
    return { error: "Member not found." };
  }

  if (target.user_id === userId) {
    return { error: "You cannot change your own role." };
  }

  if (target.role === "owner") {
    return { error: "The community owner role cannot be changed here." };
  }

  const { error } = await supabase
    .from("community_members")
    .update({ role: parsedRole.data })
    .eq("id", membershipId)
    .eq("community_id", communityId);

  if (error) {
    return { error: error.message };
  }

  revalidateCommunity(slug);
  return { success: "Role updated." };
}

export async function removeMemberAction(
  membershipId: string,
  communityId: string,
  slug: string,
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const community = await getCommunityBySlug(slug, userId);
  if (!community || !canManageCommunity(community.membershipRole)) {
    return { error: "You are not allowed to remove members." };
  }

  const blocked = blockIfStagingOnlyMutation();
  if (blocked) return blocked;

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("community_members")
    .select("user_id, role")
    .eq("id", membershipId)
    .eq("community_id", communityId)
    .maybeSingle();

  if (!target) {
    return { error: "Member not found." };
  }
  if (target.user_id === userId) {
    return { error: "Use leave community to remove yourself." };
  }
  if (target.role === "owner") {
    return { error: "The owner cannot be removed." };
  }

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("id", membershipId)
    .eq("community_id", communityId);

  if (error) {
    return { error: error.message };
  }

  revalidateCommunity(slug);
  return { success: "Member removed." };
}

export async function activateCommunitySlug(slug: string): Promise<void> {
  await setActiveCommunitySlug(slug);
  revalidatePath("/", "layout");
}
