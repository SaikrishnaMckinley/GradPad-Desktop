import Link from "next/link";
import { CircleHelp, Plus } from "lucide-react";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DEV_COMMUNITIES, DEV_CURRENT_USER } from "@/lib/fixtures/dev-shell-data";

const MEMBERSHIP_ROLES: Record<string, string> = {
  ucla: "Owner · Active",
  "boston-latin": "Owner",
  pepperdine: "Member",
};

const QUICK_ACTIONS = [
  { label: "Create a post", href: "/create" },
  { label: "Create an event", href: "/events" },
  { label: "Create a community", href: "/create?tab=community" },
] as const;

const UPCOMING = [
  { title: "Alumni mixer", meta: "Thu, 8 Oct · 6:00 PM" },
  { title: "Career office hours", meta: "Online · Next week" },
  { title: "Community town hall", meta: "Fri, 10 Oct · 5:00 PM" },
] as const;

export function CommunityDetailDemoSidebar() {
  const membershipCommunities = DEV_COMMUNITIES.slice(0, 3);

  return (
    <div className="relative space-y-5 pb-14">
      <Card className="shadow-card">
        <CardContent className="flex flex-col items-center pt-5 text-center">
          <Avatar
            alt={DEV_CURRENT_USER.fullName}
            fallback={DEV_CURRENT_USER.fullName}
            size="xl"
          />
          <h2 className="mt-3 text-base font-semibold">{DEV_CURRENT_USER.fullName}</h2>
          <p className="text-sm text-muted-foreground">{DEV_CURRENT_USER.headline}</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Community membership
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {membershipCommunities.map((c) => (
            <div key={c.slug} className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <CommunityMark
                  name={c.name}
                  initials={c.initials}
                  accentColor={c.accentColor}
                  logoUrl={c.logoUrl}
                  size="sm"
                />
                <span className="truncate text-sm font-medium">{c.name}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {MEMBERSHIP_ROLES[c.slug] ?? "Member"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick actions
          </p>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
          {QUICK_ACTIONS.map(({ label, href }) => (
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
          {UPCOMING.map((event) => (
            <div key={event.title}>
              <p className="text-sm font-semibold">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.meta}</p>
            </div>
          ))}
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
