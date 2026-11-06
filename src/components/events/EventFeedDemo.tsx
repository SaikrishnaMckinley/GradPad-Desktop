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

function isPriceDemoLabel(label: string): boolean {
  const t = label.trim();
  if (/^free$/i.test(t)) return true;
  return /^\$[\d,.]+$/.test(t);
}

function demoRawPriceValue(badges: (typeof EVENTS)[number]["badges"]): string | null {
  const priceLabels = badges.map((b) => b.label.trim()).filter(isPriceDemoLabel);
  if (priceLabels.length === 0) return null;
  if (priceLabels.length === 1) return priceLabels[0]!;

  const dollarValues: number[] = [];
  let hasFree = false;
  for (const label of priceLabels) {
    if (/^free$/i.test(label)) {
      hasFree = true;
      continue;
    }
    const m = label.match(/^\$([\d,.]+)/);
    if (m) {
      const n = Number.parseFloat(m[1]!.replace(/,/g, ""));
      if (!Number.isNaN(n)) dollarValues.push(n);
    }
  }
  if (dollarValues.length >= 2) {
    const min = Math.min(...dollarValues);
    const formatted = min % 1 === 0 ? min.toFixed(0) : min.toFixed(2);
    return `From $${formatted}`;
  }
  if (dollarValues.length === 1) {
    const n = dollarValues[0]!;
    const formatted = n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
    return hasFree ? `From $${formatted}` : `$${formatted}`;
  }
  return hasFree ? "Free" : priceLabels[0]!;
}

function demoTicketPriceLine(badges: (typeof EVENTS)[number]["badges"]): string | null {
  const raw = demoRawPriceValue(badges);
  if (!raw) return null;
  if (/^free$/i.test(raw.trim())) return "Free";
  if (/^from\s+/i.test(raw.trim())) {
    return `Starting from ${raw.replace(/^from\s+/i, "").trim()}`;
  }
  if (raw.trim().startsWith("$")) {
    return `Starting from ${raw.trim()}`;
  }
  return `Starting from ${raw.trim()}`;
}

function demoBadgesWithoutPrice(
  badges: (typeof EVENTS)[number]["badges"],
  showPriceLine: boolean,
) {
  if (!showPriceLine) return badges;
  return badges.filter((b) => !isPriceDemoLabel(b.label));
}

export function EventFeedDemo() {
  return (
    <div className="space-y-3 md:space-y-5">
      {EVENTS.map((event) => {
        const priceRow = demoTicketPriceLine(event.badges);
        const badgesToShow = demoBadgesWithoutPrice(event.badges, Boolean(priceRow));
        return (
          <Card key={event.id} className="overflow-hidden shadow-card">
            <div className="flex flex-col md:flex-row md:items-stretch md:gap-5 md:p-5">
              <div className="hidden shrink-0 md:flex md:w-[72px] md:flex-col md:gap-0 md:pt-1 md:text-right lg:w-[80px]">
                <div>
                  <p className="text-[15px] font-semibold leading-tight text-foreground">
                    {event.timeLabel}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{event.dayLabel}</p>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col md:flex-row md:items-stretch md:gap-4">
                <div className="flex items-start justify-between border-b border-border px-3 py-3 md:hidden">
                  <div>
                    <p className="text-sm font-semibold leading-tight text-foreground">
                      {event.timeLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{event.dayLabel}</p>
                  </div>
                </div>
                <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-page-secondary md:mx-0 md:aspect-auto md:h-[132px] md:w-[176px] md:max-w-[200px] md:shrink-0 md:rounded-2xl lg:max-w-none">
                  <Image
                    src="/images/event-thumb.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 100vw, 176px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 pt-3 md:px-0 md:pb-0 md:pt-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary md:text-xs">
                    {event.org}
                  </p>
                  <h2 className="mt-0.5 text-base font-semibold leading-snug text-foreground md:mt-1 md:text-lg">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {event.desc}
                  </p>
                  {priceRow ? (
                    <p className="mt-2 text-xs font-semibold text-foreground md:text-sm">
                      {priceRow}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2">
                    <span className="flex flex-wrap gap-1.5 md:hidden">
                      {badgesToShow.map((b) => (
                        <span
                          key={`${event.id}-m-${b.label}`}
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-medium",
                            badgeClass(b.tone),
                          )}
                        >
                          {b.label}
                        </span>
                      ))}
                    </span>
                    <span className="hidden flex-wrap gap-2 md:flex">
                      {badgesToShow.map((b) => (
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
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3 md:gap-3 md:pt-4">
                    <div className="hidden items-center md:flex">
                      <div className="flex -space-x-2">
                        {["A", "B", "C"].map((x) => (
                          <Avatar key={x} alt="" fallback={x} size="sm" />
                        ))}
                      </div>
                      <span className="ml-2 text-xs font-medium text-muted-foreground">+12</span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="ml-auto h-8 shrink-0 px-2.5 text-xs md:h-9 md:px-3 md:text-sm"
                    >
                      {event.action}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
