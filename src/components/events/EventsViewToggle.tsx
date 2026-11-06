"use client";

import { cn } from "@/lib/utils/cn";

type EventsViewToggleProps = {
  view: "feed" | "calendar";
  onChange: (view: "feed" | "calendar") => void;
};

export function EventsViewToggle({ view, onChange }: EventsViewToggleProps) {
  return (
    <div className="relative mb-6 flex w-full rounded-[14px] bg-primary-light p-1">
      <div
        className={cn(
          "absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-[11px] bg-primary shadow-sm transition-transform duration-300 ease-out",
          view === "feed" ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden
      />
      {(["feed", "calendar"] as const).map((mode) => {
        const active = view === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "relative z-10 flex-1 rounded-[11px] py-3 text-center text-[15px] font-semibold capitalize transition-colors duration-300",
              active ? "text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}
