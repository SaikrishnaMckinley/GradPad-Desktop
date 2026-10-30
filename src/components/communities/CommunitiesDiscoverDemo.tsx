import Link from "next/link";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Card } from "@/components/ui/card";
import { DEV_COMMUNITIES } from "@/lib/fixtures/dev-shell-data";

const MEMBER_COUNTS: Record<string, string> = {
  ucla: "1,248 members",
  "boston-latin": "892 members",
  pepperdine: "534 members",
  "usc-alumni": "2,103 members",
  duke: "976 members",
};

const DESCRIPTIONS: Record<string, string> = {
  ucla: "Reconnect with Bruins alumni across careers, events, and local chapters.",
  "boston-latin": "Stay connected with classmates and mentors from Boston Latin School.",
  pepperdine: "Wave family updates, mentorship, and West Coast meetups.",
  "usc-alumni": "Trojan network for jobs, game days, and professional events.",
  duke: "Blue Devil alumni community for networking and giving back.",
};

export function CommunitiesDiscoverDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {DEV_COMMUNITIES.map((community) => (
        <Link key={community.id} href={`/communities/${community.slug}`}>
          <Card className="flex h-full flex-col gap-4 p-5 shadow-card transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
              <CommunityMark
                name={community.name}
                initials={community.initials}
                accentColor={community.accentColor}
                logoUrl={community.logoUrl}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{community.name}</p>
                <p className="text-sm text-muted-foreground">
                  {MEMBER_COUNTS[community.slug] ?? "Members"}
                </p>
              </div>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {DESCRIPTIONS[community.slug] ?? "Alumni community on Grad Pad."}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
