import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EventCreateForm } from "@/components/events/EventCreateForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { fetchCommunityDetailRaw } from "@/lib/api/communities";
import { fetchEventDetailRaw, fetchJoinedEventsRaw } from "@/lib/api/events";
import { mapEventsResponse } from "@/lib/events/map-event";
import {
  extractCommunityFromEventRow,
  isGenericCommunityLabel,
  resolveEventCommunityLabel,
} from "@/lib/events/event-community";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { mapEventDetailToDraft, extractAddressIdFromEventRaw } from "@/lib/events/map-event-to-draft";
import { mapEventDetail } from "@/lib/events/map-event-detail";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";
import { getShellCommunityContext } from "@/lib/communities/shell-data";
import type { SidebarCommunity } from "@/types/community";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Props = { params: Promise<{ eventId: string }> };

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  return { title: `Edit event · ${eventId}` };
}

export default async function EventEditPage({ params }: Props) {
  if (isDemoStaticUi()) redirect("/events");

  const { eventId } = await params;
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const result = await fetchEventDetailRaw(eventId);
  if (!result.ok || !result.data) notFound();

  const raw = result.data as Record<string, unknown>;
  const event = mapEventDetail(raw);
  if (!event) notFound();
  if (!event.isOwner) redirect(`/events/${eventId}`);

  const { memberships: shellMemberships } = await getShellCommunityContext(session.id);

  const fromRaw = extractCommunityFromEventRow(raw);
  let communityId = event.communityId || fromRaw.id;

  let communityName =
    fromRaw.name && !isGenericCommunityLabel(fromRaw.name)
      ? fromRaw.name
      : !isGenericCommunityLabel(event.communityName)
        ? event.communityName
        : null;

  if (!communityId || !communityName) {
    const joinedResult = await fetchJoinedEventsRaw();
    if (joinedResult.ok && joinedResult.data) {
      const joined = mapEventsResponse(joinedResult.data);
      const match = joined.find((e) => e.id === eventId);
      if (match) {
        communityId = communityId || match.communityId;
        if (!communityName && !isGenericCommunityLabel(match.communityName)) {
          communityName = match.communityName;
        }
      }
    }
  }

  const memberMatch = communityId
    ? shellMemberships.find((m) => m.id === communityId)
    : undefined;
  if (memberMatch) {
    communityName = memberMatch.name;
    communityId = memberMatch.id;
  }

  if (communityId && (!communityName || isGenericCommunityLabel(communityName))) {
    const communityResult = await fetchCommunityDetailRaw(communityId);
    if (communityResult.ok && communityResult.data) {
      const apiName = communityResult.data.name;
      if (typeof apiName === "string" && apiName.trim()) {
        communityName = apiName.trim();
      }
    }
  }

  communityName = resolveEventCommunityLabel(communityId, communityName, shellMemberships);

  const eventForDraft = { ...event, communityId, communityName };
  const initialDraft = mapEventDetailToDraft(
    eventForDraft,
    extractAddressIdFromEventRaw(raw),
  );
  initialDraft.communityId = communityId ?? initialDraft.communityId;

  let memberships: SidebarCommunity[] = shellMemberships;
  if (communityId && !memberships.some((m) => m.id === communityId)) {
    memberships = [
      {
        id: communityId,
        name: communityName,
        slug: communityId,
        logoUrl: null,
        initials: communityInitials(communityName),
        accentColor: communityAccentColor(communityId),
      },
      ...memberships,
    ];
  }

  return (
    <PageContainer>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Edit event</h1>
          <p className="mt-1 text-sm text-muted-foreground">{event.title}</p>
        </div>
        <Link
          href={`/events/${eventId}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Cancel
        </Link>
      </div>
      <EventCreateForm
        key={`edit-${eventId}`}
        memberships={memberships}
        defaultCommunityId={communityId}
        payoutSetupNotice={null}
        editEventId={eventId}
        initialDraft={initialDraft}
        initialImageUrl={event.imageUrl}
        editCommunityName={communityName}
      />
    </PageContainer>
  );
}
