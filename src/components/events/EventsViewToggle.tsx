"use client";

import { cn } from "@/lib/utils/cn";

type EventsViewToggleProps = {
  view: "feed" | "calendar";
  onChange: (view: "feed" | "calendar") => void;
};

export function EventsViewToggle({ view, onChange }: EventsViewToggleProps) {
  return (
    <div className="mb-6 flex w-full rounded-[14px] bg-primary-light p-1">
      {(["feed", "calendar"] as const).map((mode) => {
        const active = view === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "flex-1 rounded-[11px] py-3 text-center text-[15px] font-semibold capitalize transition-colors",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}
