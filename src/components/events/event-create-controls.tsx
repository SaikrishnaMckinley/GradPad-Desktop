"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function SettingToggleRow({
  title,
  description,
  checked,
  onChange,
  label,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <div className="grid w-full min-w-0 max-w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:items-center sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 justify-self-end pt-0.5 sm:pt-0">
        <ToggleSwitch checked={checked} onChange={onChange} label={label} />
      </div>
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-[3.25rem] shrink-0 overflow-hidden rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted/80",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-[left]",
          checked ? "left-[calc(100%-1.75rem)]" : "left-1",
        )}
      />
    </button>
  );
}

type SegmentOption<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full gap-1 rounded-xl border border-border bg-page-secondary/60 p-1",
        options.length === 2 && "grid-cols-2",
        options.length === 3 && "grid-cols-3",
        className,
      )}
      role="group"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function PayoutStatusBadge({ ready }: { ready: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        ready ? "bg-success-bg text-success" : "bg-warning/15 text-warning",
      )}
    >
      {ready ? "Connected" : "Setup needed"}
    </span>
  );
}
