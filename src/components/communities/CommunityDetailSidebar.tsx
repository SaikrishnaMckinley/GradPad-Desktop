import Link from "next/link";
import { CircleHelp, Plus } from "lucide-react";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";
import { formatEventUpcomingLine } from "@/lib/events/format-event-datetime";
import type { CommunityListItem } from "@/types/community";
import type { ShellUser } from "@/types/shell-user";

function quickActions(communityId: string | undefined, canCreateInCommunity: boolean) {
  const q = communityId ? encodeURIComponent(communityId) : "";
  const items: { label: string; href: string }[] = [];
  if (canCreateInCommunity && communityId) {
    items.push(
      { label: "Create a post", href: `/create?tab=post&community=${q}` },
      { label: "Create an event", href: `/create?tab=event&community=${q}` },
    );
  }
  items.push({ label: "Create a community", href: "/create?tab=community" });
  return items;
}

type EventRow = {
  id: string;
  title: string;
  start_at: string;
};

type Props = {
  user: ShellUser;
  communityId?: string;
  /** Active member of the hub community (not pending / not browsing only). */
  canCreateInCommunity?: boolean;
  memberships: CommunityListItem[];
  upcomingEvents: EventRow[];
};

function membershipLabel(c: CommunityListItem): string {
  if (c.membershipRole === "owner") return "Owner · Active";
  if (c.membershipRole === "admin") return "Admin";
  if (c.membershipStatus === "pending") return "Pending";
  return "Member";
}

export function CommunityDetailSidebar({
  user,
  communityId,
  canCreateInCommunity = false,
  memberships,
  upcomingEvents,
}: Props) {
  const actions = quickActions(communityId, canCreateInCommunity);

  return (
    <div className="relative space-y-5 pb-14">
      <Card className="shadow-card">
        <CardContent className="flex flex-col items-center pt-5 text-center">
          <Avatar
            src={user.avatarUrl}
            alt={user.fullName}
            fallback={user.fullName}
            size="xl"
          />
          <h2 className="mt-3 text-base font-semibold">{user.fullName}</h2>
          {user.headline ? (
            <p className="text-sm text-muted-foreground">{user.headline}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Community membership
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {memberships.length === 0 ? (
            <p className="text-sm text-muted-foreground">No communities yet.</p>
          ) : (
            memberships.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <CommunityMark
                    name={c.name}
                    initials={communityInitials(c.name)}
                    accentColor={communityAccentColor(c.slug)}
                    logoUrl={c.logoUrl}
                    size="sm"
                  />
                  <span className="truncate text-sm font-medium">{c.name}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {membershipLabel(c)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick actions
          </p>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
          {actions.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-xl px-1 py-2.5 text-sm font-medium text-foreground hover:bg-page-secondary"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-primary">
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </span>
              {label}
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming events
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
          ) : (
            upcomingEvents.slice(0, 3).map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                prefetch
                className="block hover:opacity-90"
              >
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatEventUpcomingLine(event.start_at)}
                </p>
              </Link>
            ))
          )}
          <Link
            href="/events"
            className="inline-block pt-1 text-sm font-medium text-primary hover:underline"
          >
            View calendar
          </Link>
        </CardContent>
      </Card>

      <button
        type="button"
        className="fixed bottom-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-card hover:text-foreground xl:absolute xl:bottom-0 xl:right-0"
        aria-label="Help"
      >
        <CircleHelp className="h-5 w-5" />
      </button>
    </div>
  );
}
