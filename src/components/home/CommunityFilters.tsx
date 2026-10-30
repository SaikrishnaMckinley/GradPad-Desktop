"use client";

import { cn } from "@/lib/utils/cn";

const FILTERS = [
  "All updates",
  "UMass Amherst",
  "Duke SoCal",
  "Events",
] as const;

type CommunityFiltersProps = {
  active?: string;
  onChange?: (filter: string) => void;
};

export function CommunityFilters({
  active = "All updates",
  onChange,
}: CommunityFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const selected = filter === active;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange?.(filter)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:border-primary-border hover:text-foreground",
            )}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
