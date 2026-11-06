"use client";

import { cn } from "@/lib/utils/cn";

type EventsViewToggleProps = {
  view: "feed" | "calendar";
  onChange: (view: "feed" | "calendar") => void;
};

export function EventsViewToggle({ view, onChange }: EventsViewToggleProps) {
  return (
    <div className="relative mb-4 flex w-full rounded-[12px] bg-primary-light p-0.5 md:mb-6 md:rounded-[14px] md:p-1">
      <div
        className={cn(
          "absolute inset-y-0.5 w-[calc(50%-0.125rem)] rounded-[9px] bg-primary shadow-sm transition-transform duration-300 ease-out md:inset-y-1 md:w-[calc(50%-0.25rem)] md:rounded-[11px]",
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
              "relative z-10 flex-1 rounded-[9px] py-2.5 text-center text-sm font-semibold capitalize transition-colors duration-300 md:rounded-[11px] md:py-3 md:text-[15px]",
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
