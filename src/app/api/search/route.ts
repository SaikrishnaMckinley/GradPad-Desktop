import { NextResponse } from "next/server";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { listDiscoverableCommunities } from "@/lib/communities/queries";
import { getJoinedEvents } from "@/lib/events/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ communities: [], events: [] });
  }

  const query = q.toLowerCase();
  const session = await getApiSessionProfile();

  const [communities, events] = await Promise.all([
    listDiscoverableCommunities(session?.id ?? null, q),
    getJoinedEvents(),
  ]);

  return NextResponse.json({
    communities: communities.slice(0, 5).map((community) => ({
      id: community.id,
      title: community.name,
      subtitle:
        community.institution ||
        community.location ||
        (community.memberCount > 0 ? `${community.memberCount} members` : "Community"),
      href: `/communities/${encodeURIComponent(community.slug)}`,
      logoUrl: community.logoUrl,
    })),
    events: events
      .filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.communityName.toLowerCase().includes(query) ||
          (event.locationLabel?.toLowerCase().includes(query) ?? false),
      )
      .slice(0, 5)
      .map((event) => ({
        id: event.id,
        title: event.title,
        subtitle: event.communityName,
        href: `/events/${encodeURIComponent(event.id)}`,
        imageUrl: event.imageUrl,
      })),
  });
}
