import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CommunityInviteGuest } from "@/components/communities/CommunityInviteGuest";
import { fetchCommunityOpenRaw } from "@/lib/api/communities";
import { mapCommunityListItem } from "@/lib/api/map-community";
import { communityInviteCompletePath } from "@/lib/communities/community-invite-url";
import { getSessionTokens } from "@/lib/auth/session-cookies";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string; email?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const open = await fetchCommunityOpenRaw(slug);
  const name =
    open.ok && open.data && typeof open.data.name === "string"
      ? open.data.name
      : "Community";
  return { title: `Join ${name}` };
}

export default async function CommunityInvitePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const key = slug.trim();

  if (!key) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        This community link is invalid. Check the link and try again.
      </p>
    );
  }

  const { access } = await getSessionTokens();
  if (access) {
    redirect(communityInviteCompletePath(key));
  }

  const open = await fetchCommunityOpenRaw(key);
  if (!open.ok || !open.data) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        This community link is invalid or we couldn&apos;t load it. Check the link and try again.
      </p>
    );
  }

  const community = mapCommunityListItem(open.data);
  if (!community) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        This community link is invalid. Check the link and try again.
      </p>
    );
  }

  const initialView = query.view === "login" ? "login" : "signup";
  const initialEmail = typeof query.email === "string" ? query.email : "";

  return (
    <CommunityInviteGuest
      community={community}
      initialView={initialView}
      initialEmail={initialEmail}
    />
  );
}
