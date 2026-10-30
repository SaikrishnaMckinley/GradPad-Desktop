"use client";

import Image from "next/image";
import { useState } from "react";
import {
  buildEventIcs,
  buildGoogleCalendarDatesParam,
  formatWallClockIsoLocal,
  getEventCalendarExportStamps,
  type EventCalendarFields,
} from "@/lib/events/event-calendar-export";
import { cn } from "@/lib/utils/cn";

const CALENDAR_SERVICES = [
  { id: "google", label: "Google Calendar", icon: "/svgs/google_calendar.png" },
  { id: "apple", label: "Apple Calendar", icon: "/svgs/apple_calendar.png" },
  { id: "outlook", label: "Outlook Calendar", icon: "/svgs/outlook_calendar.png" },
  { id: "yahoo", label: "Yahoo Calendar", icon: "/svgs/yahoo.svg" },
] as const;

type Props = {
  event: EventCalendarFields;
  className?: string;
};

export function CalendarFlipButton({ event, className }: Props) {
  const [flipped, setFlipped] = useState(false);

  function closeSoon() {
    setTimeout(() => setFlipped(false), 200);
  }

  function openGoogle() {
    const dates = buildGoogleCalendarDatesParam(event);
    const title = encodeURIComponent(event.title || "Event");
    const location = encodeURIComponent(event.location || "");
    const description = encodeURIComponent(
      (event.description || "").replace(/<[^>]*>?/gm, ""),
    );
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${description}&location=${location}&sf=true&output=xml`,
      "_blank",
    );
    closeSoon();
  }

  function downloadIcs(filenameHint: string) {
    const ics = buildEventIcs(event);
    const filename = `${filenameHint.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "event"}.ics`;
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    closeSoon();
  }

  function openOutlook() {
    const { start, end } = getEventCalendarExportStamps(event);
    const title = encodeURIComponent(event.title || "Event");
    const location = encodeURIComponent(event.location || "");
    const description = encodeURIComponent(
      (event.description || "").replace(/<[^>]*>?/gm, ""),
    );
    const startDt = formatWallClockIsoLocal(start);
    const endDt = formatWallClockIsoLocal(end);
    const opened = window.open(
      `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDt}&enddt=${endDt}&location=${location}&body=${description}`,
      "_blank",
    );
    if (!opened) downloadIcs(event.title || "event");
    closeSoon();
  }

  function openYahoo() {
    const { start, end } = getEventCalendarExportStamps(event);
    const title = encodeURIComponent(event.title || "Event");
    const location = encodeURIComponent(event.location || "");
    const description = encodeURIComponent(
      (event.description || "").replace(/<[^>]*>?/gm, ""),
    );
    window.open(
      `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${start}&et=${end}&desc=${description}&in_loc=${location}`,
      "_blank",
    );
    closeSoon();
  }

  function onService(id: (typeof CALENDAR_SERVICES)[number]["id"]) {
    if (id === "google") openGoogle();
    else if (id === "apple") downloadIcs(event.title || "event");
    else if (id === "outlook") openOutlook();
    else openYahoo();
  }

  return (
    <div className={cn("w-[11.625rem] max-w-full shrink-0", className)}>
      <button
        type="button"
        aria-expanded={flipped}
        onClick={() => setFlipped((v) => !v)}
        className="h-10 w-full [perspective:800px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span
          className={cn(
            "relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <span className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-[10px] bg-primary px-3 text-sm font-medium text-white shadow-sm [backface-visibility:hidden]">
            <span className="whitespace-nowrap">Add to Calendar</span>
            <svg width="18" height="18" viewBox="0 0 14 16" fill="none" aria-hidden>
              <path
                d="M9.66667 1.33398V4.00065M4.33333 1.33398V4.00065M1 6.66732H13M2.33333 2.66732H11.6667C12.403 2.66732 13 3.26427 13 4.00065V13.334C13 14.0704 12.403 14.6673 11.6667 14.6673H2.33333C1.59695 14.6673 1 14.0704 1 13.334V4.00065C1 3.26427 1.59695 2.66732 2.33333 2.66732Z"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-[10px] bg-primary px-2 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {CALENDAR_SERVICES.map((service, index) => (
              <span
                key={service.id}
                role="button"
                tabIndex={0}
                title={service.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onService(service.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onService(service.id);
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 shadow-sm transition-transform hover:-translate-y-0.5"
                style={{ transitionDelay: flipped ? `${index * 50}ms` : "0ms" }}
              >
                <Image
                  src={service.icon}
                  alt=""
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] object-contain"
                />
              </span>
            ))}
          </span>
        </span>
      </button>
    </div>
  );
}
