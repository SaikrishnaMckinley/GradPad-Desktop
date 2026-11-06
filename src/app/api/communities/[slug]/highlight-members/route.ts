import { NextResponse } from "next/server";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { resolveCommunityId } from "@/lib/communities/api-queries";
import { fetchCommunityHighlightMembers } from "@/lib/communities/fetch-community-highlight-members";
import { pickHighlightMembers } from "@/lib/communities/pick-highlight-members";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const routeKey = slug.trim();
  if (!routeKey) {
    return NextResponse.json({ members: [] }, { status: 400 });
  }

  const communityId = await resolveCommunityId(routeKey);
  if (!communityId) {
    return NextResponse.json({ members: [] }, { status: 404 });
  }

  const session = await getApiSessionProfile();
  const members = await fetchCommunityHighlightMembers(communityId);
  const highlights = pickHighlightMembers(members, {
    limit: 3,
    excludeUserId: session?.id ?? null,
  });

  return NextResponse.json({ members: highlights });
}
