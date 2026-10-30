"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatEventFeedLabels } from "@/lib/events/format-event-datetime";
import { cn } from "@/lib/utils/cn";
import type { EventListItem } from "@/types/events";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function monthMatrix(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type Props = {
  events: EventListItem[];
};

export function EventCalendarView({ events }: Props) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());

  const eventsByDay = useMemo(() => {
    const map = new Map<number, EventListItem[]>();
    for (const event of events) {
      const d = new Date(event.startAt);
      if (d.getFullYear() !== cursor.year || d.getMonth() !== cursor.month) continue;
      const day = d.getDate();
      const list = map.get(day) ?? [];
      list.push(event);
      map.set(day, list);
    }
    return map;
  }, [events, cursor.month, cursor.year]);

  const eventDays = useMemo(() => new Set(eventsByDay.keys()), [eventsByDay]);

  const matrix = useMemo(
    () => monthMatrix(cursor.year, cursor.month),
    [cursor.month, cursor.year],
  );

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedEvents =
    selectedDay != null ? (eventsByDay.get(selectedDay) ?? []) : [];

  function shiftMonth(delta: number) {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDay(null);
  }

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === cursor.year && today.getMonth() === cursor.month;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-base font-semibold">{monthLabel}</p>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
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

        <div className="grid grid-cols-7 gap-px bg-border p-px">
          {matrix.map((day, index) => {
            if (day == null) {
              return <div key={`empty-${index}`} className="min-h-[52px] bg-card" />;
            }
            const hasEvent = eventDays.has(day);
            const isSelected = selectedDay === day;
            const isToday = isCurrentMonth && today.getDate() === day;

            const highlightDay = isToday || isSelected;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className="relative flex min-h-[52px] flex-col items-center justify-start bg-card px-1 pt-2 text-sm transition-colors hover:bg-page-secondary/80"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full font-medium text-foreground",
                    highlightDay && "bg-primary text-white",
                  )}
                >
                  {day}
                </span>
                {hasEvent ? (
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDay != null ? (
        <Card className="p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground">
            {new Date(cursor.year, cursor.month, selectedDay).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No events on this day.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedEvents.map((event) => {
                const { timeLabel } = formatEventFeedLabels(event.startAt);
                return (
                  <li key={event.id} className="border-t border-border pt-3 first:border-0 first:pt-0">
                    <p className="text-xs font-medium text-primary">{event.communityName}</p>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{timeLabel}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : null}
    </div>
  );
}
