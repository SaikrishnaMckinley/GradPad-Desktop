import { Card } from "@/components/ui/card";

const ITEMS = [
  { d: "09", t: "Social Circles Collaboration", m: "4:00 PM · Sawubona" },
  { d: "11", t: "Chapter Office Hours", m: "12:30 PM · Online" },
  { d: "14", t: "New Grad Coffee Chat", m: "10:30 AM · Westwood" },
] as const;

export function EventsComingUpRail() {
  return (
    <Card className="p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        March 2024
      </p>
      <h2 className="mt-1 text-lg font-semibold">Coming up this week</h2>
      <ul className="mt-4 divide-y divide-border">
        {ITEMS.map((e) => (
          <li key={e.d} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-primary-border bg-primary-light text-sm font-bold text-primary">
              {e.d}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{e.t}</p>
              <p className="text-xs text-muted-foreground">{e.m}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
