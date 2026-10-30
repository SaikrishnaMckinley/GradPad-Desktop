import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const EVENTS = [
  {
    id: "1",
    timeLabel: "5:00 PM",
    dayLabel: "Today",
    org: "MS University · NYC Chapter",
    title: "Tech Industry: Social Circles Collaboration",
    desc: "Your source for logistics and Q&A related to the networking event.",
    badges: [
      { label: "Managing", tone: "primary" as const },
      { label: "Private", tone: "muted" as const },
      { label: "New York, NY", tone: "muted" as const },
      { label: "$30", tone: "muted" as const },
    ],
    action: "Manage",
  },
  {
    id: "2",
    timeLabel: "7:00 PM",
    dayLabel: "Tomorrow",
    org: "MS University · NYC Chapter",
    title: "New Grad Networking Night",
    desc: "Your source for logistics and Q&A related to the networking event.",
    badges: [
      { label: "Attending", tone: "success" as const },
      { label: "Public", tone: "muted" as const },
      { label: "New York, NY", tone: "muted" as const },
      { label: "Free", tone: "muted" as const },
    ],
    action: "View details",
  },
] as const;

function badgeClass(tone: "primary" | "success" | "muted") {
  if (tone === "primary") return "bg-primary-light text-primary";
  if (tone === "success") return "bg-success-bg text-success";
  return "bg-page-secondary text-muted-foreground";
}

export function EventFeedDemo() {
  return (
    <div className="space-y-5">
      {EVENTS.map((event) => (
        <Card key={event.id} className="overflow-hidden shadow-card">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
            <div className="flex shrink-0 items-start gap-4 sm:w-[72px] sm:flex-col sm:gap-0 sm:pt-1 sm:text-right lg:w-[80px]">
              <div>
                <p className="text-[15px] font-semibold leading-tight text-foreground">
                  {event.timeLabel}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{event.dayLabel}</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
                <div className="relative mx-auto aspect-[4/3] w-full max-w-[200px] shrink-0 overflow-hidden rounded-2xl sm:mx-0 sm:h-[132px] sm:w-[176px] sm:max-w-none">
                  <Image
                    src="/images/event-thumb.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="176px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {event.org}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold leading-snug text-foreground">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {event.desc}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.badges.map((b) => (
                      <span
                        key={b.label}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-medium",
                          badgeClass(b.tone),
                        )}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {["A", "B", "C"].map((x) => (
                          <Avatar key={x} alt="" fallback={x} size="sm" />
                        ))}
                      </div>
                      <span className="ml-2 text-xs font-medium text-muted-foreground">+12</span>
                    </div>
                    <Button variant="secondary" size="sm" className="shrink-0">
                      {event.action}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        </Card>
      ))}
    </div>
  );
}
