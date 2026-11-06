import { Card } from "@/components/ui/card";
import { formatEventCard } from "@/lib/events/format-event-datetime";
import type { EventsRailPreviewModel } from "@/lib/events/events-rail-preview";

const DEMO_PREVIEW: EventsRailPreviewModel = {
  monthHeading: "March 2024",
  sectionTitle: "Coming up this week",
  events: [
    { id: "d1", title: "Social Circles Collaboration", startAt: "2024-03-09T16:00:00" },
    { id: "d2", title: "Chapter Office Hours", startAt: "2024-03-11T12:30:00" },
    { id: "d3", title: "New Grad Coffee Chat", startAt: "2024-03-14T10:30:00" },
  ],
};

type Props = {
  preview?: EventsRailPreviewModel;
};

export function EventsComingUpRail({ preview }: Props) {
  const isLive = preview !== undefined;
  const model = isLive ? preview : DEMO_PREVIEW;
  const { events, sectionTitle, monthHeading } = model;
  const heading = monthHeading ?? (isLive ? "Upcoming" : "March 2024");

  return (
    <Card className="p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{heading}</p>
      <h2 className="mt-1 text-lg font-semibold">{sectionTitle}</h2>
      {isLive && events.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No events on your calendar right now. Check back when something new is scheduled.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {events.map((e) => {
            const { day, time } = formatEventCard(e.startAt);
            return (
              <li key={e.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-primary-border bg-primary-light text-sm font-bold text-primary">
                  {day}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
