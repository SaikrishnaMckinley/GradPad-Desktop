import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MoreHorizontal, Plus } from "lucide-react";
import { DemoPostCard } from "@/components/posts/DemoPostCard";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEV_ACTIVE_COMMUNITY, DEV_COMMUNITIES } from "@/lib/fixtures/dev-shell-data";
import { cn } from "@/lib/utils/cn";

const DEMO_EVENTS = [
  {
    day: "21",
    month: "Oct",
    time: "5:00 PM · IN PERSON",
    title: "Alumni Mixer",
  },
  {
    day: "24",
    month: "Oct",
    time: "6:00 PM · IN PERSON",
    title: "New Grad Networking Night",
  },
] as const;

const DEMO_LOCATIONS: Record<string, string> = {
  ucla: "Westwood, CA",
  "boston-latin": "Boston, MA",
  pepperdine: "Malibu, CA",
  "usc-alumni": "Los Angeles, CA",
  duke: "Durham, NC",
};

const DEMO_ABOUT: Record<string, string> = {
  ucla:
    "A welcoming space for UCLA alumni to reconnect, exchange ideas, discover opportunities, and take part in local events.",
};

type CommunityDetailDemoProps = {
  slug?: string;
};

export function CommunityDetailDemo({ slug = DEV_ACTIVE_COMMUNITY.slug }: CommunityDetailDemoProps) {
  const community =
    DEV_COMMUNITIES.find((c) => c.slug === slug) ?? DEV_ACTIVE_COMMUNITY;
  const about =
    DEMO_ABOUT[community.slug] ??
    `A welcoming space for ${community.name} alumni to reconnect, exchange ideas, and take part in local events.`;
  const postsSubtitle = `Latest updates from ${community.name}`;

  return (
    <>
      <div className="overflow-hidden rounded-[22px] border border-border bg-card shadow-card">
        <div className="relative h-44 md:h-52">
          <Image
            src="/images/community-cover.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
        <div className="relative px-5 pb-6 pt-0 md:px-8">
          <div className="-mt-10 flex gap-4">
            <CommunityMark
              name={community.name}
              initials={community.initials}
              accentColor={community.accentColor}
              logoUrl={community.logoUrl}
              shape="rounded"
              size="lg"
              className="h-20 w-20 shrink-0 text-xl ring-4 ring-card"
            />
            <div className="min-w-0 flex-1 pt-12 md:pt-10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-semibold">{community.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {DEMO_LOCATIONS[community.slug] ?? "United States"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary"
                    aria-label="Share community"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{about}</p>
          <div className="mt-4 flex items-center">
            <div className="flex -space-x-2">
              {["PJ", "EW", "MC", "RD"].map((initials) => (
                <Avatar key={initials} alt="" fallback={initials} size="sm" />
              ))}
            </div>
            <span className="ml-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-primary-light px-2 text-xs font-semibold text-primary">
              +12
            </span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-11 w-full">
              Make a donation
            </Button>
            <Link
              href={`/communities/${community.slug}/admin`}
              className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")}
            >
              Admin dashboard
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Channels</h2>
            <p className="text-sm text-muted-foreground">
              Discuss topics with your community
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
            aria-label="Add channel"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Card className="p-5 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white"
                aria-hidden
              >
                #
              </div>
              <div className="min-w-0">
                <p className="font-semibold">General</p>
                <p className="text-sm text-muted-foreground">
                  Join the latest conversations in the general channel
                </p>
              </div>
            </div>
            <Link
              href={`/communities/${community.slug}#posts`}
              className={cn(buttonVariants({ variant: "secondary" }), "shrink-0")}
            >
              Open channel
            </Link>
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Events</h2>
            <p className="text-sm text-muted-foreground">
              Gather with people from this community
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
            aria-label="Add event"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {DEMO_EVENTS.map((event) => (
            <Card
              key={event.title}
              className="flex min-w-[min(100%,280px)] shrink-0 gap-4 p-4 shadow-card sm:min-w-[300px]"
            >
              <div className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-page-secondary">
                <span className="text-xl font-bold leading-none">{event.day}</span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {event.month}
                </span>
              </div>
              <div className="min-w-0 py-1">
                <p className="text-xs font-medium text-muted-foreground">{event.time}</p>
                <p className="mt-1 font-semibold">{event.title}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="posts" className="mt-8 scroll-mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Posts</h2>
            <p className="text-sm text-muted-foreground">{postsSubtitle}</p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
            aria-label="Create post"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <DemoPostCard />
      </section>
    </>
  );
}
