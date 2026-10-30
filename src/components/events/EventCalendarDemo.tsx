"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

/** March 2024 — static demo month */
const MARCH_2024: (number | null)[] = [
  null,
  null,
  null,
  null,
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
];

const EVENT_DAYS = new Set([14, 21]);
const SELECTED_DAY = 9;

export function EventCalendarDemo() {
  return (
    <Card className="overflow-hidden shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-base font-semibold">March 2024</p>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-page-secondary/40">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[11px] font-semibold tracking-wide text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {MARCH_2024.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-[52px] border-b border-r border-border/80" />;
          }
          const selected = day === SELECTED_DAY;
          const hasEvent = EVENT_DAYS.has(day);
          return (
            <div
              key={day}
              className="flex min-h-[52px] flex-col items-center justify-center border-b border-r border-border/80 py-2"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium",
                  selected && "bg-primary text-white",
                  !selected && "text-foreground",
                )}
              >
                {day}
              </span>
              {hasEvent && !selected ? (
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              ) : selected ? (
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
              ) : (
                <span className="mt-0.5 h-1.5 w-1.5" aria-hidden />
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-border p-5">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              March 9
            </p>
            <h3 className="text-base font-semibold">Events on this day</h3>
          </div>
          <span className="text-sm text-muted-foreground">1 event</span>
        </div>
        <div className="rounded-xl border border-border bg-page-secondary/30 p-4">
          <span className="inline-block rounded-lg bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
            4:00 PM
          </span>
          <p className="mt-2 font-semibold">Social Circles Collaboration</p>
          <p className="mt-1 text-sm text-muted-foreground">
            MS University · NYC Chapter · Sawubona
          </p>
        </div>
      </div>
    </Card>
  );
}
