import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CommunityMemberRow } from "@/types/community";

type EventPreview = {
  id: string;
  title: string;
  start_at: string;
  location: string | null;
};

type Props = {
  slug: string;
  memberCount: number;
  membershipRole: string | null;
  membersPreview: CommunityMemberRow[];
  events: EventPreview[];
};

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-US", { day: "2-digit" }),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function CommunityRightSidebar({
  slug,
  memberCount,
  membershipRole,
  membersPreview,
  events,
}: Props) {
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="pt-5">
          <h3 className="text-base font-semibold">Membership</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {memberCount.toLocaleString()} active member{memberCount === 1 ? "" : "s"}
          </p>
          {membershipRole ? (
            <p className="mt-1 text-sm">
              Your role:{" "}
              <span className="font-medium capitalize text-foreground">{membershipRole}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">You are not a member yet.</p>
          )}
          <Link
            href={`/communities/${slug}/members`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "mt-4 w-full",
            )}
          >
            View all members
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-base font-semibold">Upcoming events</h3>
          <Link href="/events" className="text-sm font-medium text-primary hover:underline">
            View calendar
          </Link>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
          ) : (
            events.map((event) => {
              const { day, month, time } = formatEventDate(event.start_at);
              return (
                <div key={event.id} className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-primary-border bg-primary-light text-primary">
                    <span className="text-[10px] font-bold uppercase">{day}</span>
                    <span className="text-[10px] font-semibold uppercase">{month}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {time}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {membersPreview.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold">Members</h3>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {membersPreview.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar
                  src={member.avatarUrl}
                  alt={member.fullName}
                  fallback={member.fullName}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{member.fullName}</p>
                  <p className="truncate text-xs capitalize text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
