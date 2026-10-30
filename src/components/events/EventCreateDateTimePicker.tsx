"use client";

import {
  addMonths,
  format,
  isBefore,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Props = {
  startAt: string;
  endAt: string;
  onStartChange: (iso: string) => void;
  onEndChange: (iso: string) => void;
};

function toIso(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseLocal(iso: string, fallback: Date): Date {
  if (!iso) return fallback;
  const d = parseISO(iso);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

export function EventCreateDateTimePicker({ startAt, endAt, onStartChange, onEndChange }: Props) {
  const now = new Date();
  const start = parseLocal(startAt, now);
  const end = parseLocal(endAt, new Date(now.getTime() + 3_600_000));

  const [dateTarget, setDateTarget] = useState<"start" | "end" | null>(null);
  const [timeTarget, setTimeTarget] = useState<"start" | "end" | null>(null);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(start));

  const timeError =
    endAt && startAt && (isBefore(end, start) || end.getTime() === start.getTime())
      ? "End must be after start"
      : "";

  const monthDays = useMemo(() => {
    const startM = startOfMonth(monthCursor);
    const endM = endOfMonth(monthCursor);
    return eachDayOfInterval({ start: startM, end: endM });
  }, [monthCursor]);

  const leadingBlanks = startOfMonth(monthCursor).getDay();

  function applyDate(target: "start" | "end", day: Date) {
    const base = target === "start" ? start : end;
    const next = setMinutes(setHours(day, base.getHours()), base.getMinutes());
    if (target === "start") {
      onStartChange(toIso(next));
      if (!isBefore(end, next) && end.getTime() <= next.getTime()) {
        onEndChange(toIso(new Date(next.getTime() + 3_600_000)));
      }
    } else {
      onEndChange(toIso(next));
    }
    setDateTarget(null);
  }

  function openTime(target: "start" | "end") {
    setTimeTarget(target);
  }

  return (
    <div className="w-full rounded-xl border border-border bg-page-secondary/50 p-4 sm:p-5">
      <DateTimeRow
        label="Start"
        date={start}
        onDate={() => {
          setMonthCursor(startOfMonth(start));
          setDateTarget("start");
        }}
        onTime={() => openTime("start")}
      />
      <div className="my-3 border-t border-border" />
      <DateTimeRow
        label="End"
        date={end}
        hasError={Boolean(timeError)}
        onDate={() => {
          setMonthCursor(startOfMonth(end));
          setDateTarget("end");
        }}
        onTime={() => openTime("end")}
      />
      {timeError ? <p className="mt-2 text-xs text-error">{timeError}</p> : null}

      <input type="hidden" name="startAt" value={startAt} />
      <input type="hidden" name="endAt" value={endAt} />

      {dateTarget ? (
        <Modal onClose={() => setDateTarget(null)}>
          <div className="w-[min(100vw-2rem,26rem)] min-w-[20rem] rounded-2xl bg-card p-5 shadow-card sm:min-w-[22rem]">
            <div className="mb-4 flex items-center justify-between px-1">
              <button type="button" onClick={() => setMonthCursor(addMonths(monthCursor, -1))}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-base font-semibold">{format(monthCursor, "MMMM yyyy")}</p>
              <button type="button" onClick={() => setMonthCursor(addMonths(monthCursor, 1))}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-muted-foreground">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="py-1.5">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`b-${i}`} />
              ))}
              {monthDays.map((day) => {
                const selected =
                  dateTarget === "start"
                    ? isSameDay(day, start)
                    : isSameDay(day, end);
                const isToday = isSameDay(day, now);
                const past = isBefore(startOfDay(day), startOfDay(now));
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={past}
                    onClick={() => applyDate(dateTarget, day)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-medium sm:h-11",
                      selected && "bg-primary text-white",
                      isToday && !selected && "bg-primary text-white",
                      past && "opacity-30",
                      !selected && !isToday && !past && "hover:bg-page-secondary",
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      ) : null}

      {timeTarget ? (
        <TimePickerModal
          initial={timeTarget === "start" ? start : end}
          onClose={() => setTimeTarget(null)}
          onConfirm={(d) => {
            if (timeTarget === "start") onStartChange(toIso(d));
            else onEndChange(toIso(d));
            setTimeTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}

function DateTimeRow({
  label,
  date,
  hasError,
  onDate,
  onTime,
}: {
  label: string;
  date: Date;
  hasError?: boolean;
  onDate: () => void;
  onTime: () => void;
}) {
  return (
    <div className="grid w-full grid-cols-[4.5rem_1fr] items-center gap-2 sm:grid-cols-[5rem_1fr] sm:gap-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex w-full min-w-0 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onDate}
          className={cn(
            "h-11 min-w-0 flex-[1.35] rounded-lg border px-3 text-left text-sm sm:px-4",
            hasError
              ? "border-error/40 bg-error/5 text-error"
              : "border-border bg-card hover:bg-page-secondary",
          )}
        >
          <span className="truncate">{format(date, "MMM d, yyyy")}</span>
        </button>
        <button
          type="button"
          onClick={onTime}
          className={cn(
            "h-11 min-w-[6.75rem] shrink-0 flex-1 rounded-lg border px-3 text-left text-sm sm:min-w-[7.5rem] sm:flex-none sm:w-[8.25rem] sm:px-4",
            hasError
              ? "border-error/40 bg-error/5 text-error"
              : "border-border bg-card hover:bg-page-secondary",
          )}
        >
          {format(date, "h:mm a")}
        </button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-foreground/40" onClick={onClose} aria-label="Close" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function TimePickerModal({
  initial,
  onClose,
  onConfirm,
}: {
  initial: Date;
  onClose: () => void;
  onConfirm: (d: Date) => void;
}) {
  const h12 = initial.getHours() % 12 || 12;
  const [hour, setHour] = useState(h12);
  const [minute, setMinute] = useState(initial.getMinutes());
  const [period, setPeriod] = useState<"AM" | "PM">(initial.getHours() >= 12 ? "PM" : "AM");

  function confirm() {
    let h24 = hour % 12;
    if (period === "PM") h24 += 12;
    if (period === "AM" && hour === 12) h24 = 0;
    onConfirm(setMinutes(setHours(initial, h24), minute));
  }

  return (
    <Modal onClose={onClose}>
      <div className="w-[min(100vw-2rem,22rem)] min-w-[18rem] rounded-2xl bg-card p-6 shadow-card sm:min-w-[20rem]">
        <p className="mb-5 text-center text-base font-semibold">Select time</p>
        <div className="flex items-stretch justify-center gap-3 sm:gap-4">
          <ScrollColumn values={Array.from({ length: 12 }, (_, i) => i + 1)} value={hour} onChange={setHour} />
          <ScrollColumn
            values={Array.from({ length: 60 }, (_, i) => i)}
            value={minute}
            onChange={setMinute}
            format={(v) => String(v).padStart(2, "0")}
          />
          <div className="flex min-w-[4.5rem] flex-col justify-center gap-2">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-semibold",
                  period === p ? "bg-primary text-white" : "bg-page-secondary",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <Button type="button" className="mt-5 w-full" onClick={confirm}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

function ScrollColumn({
  values,
  value,
  onChange,
  format: fmt,
}: {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const label = (v: number) => (fmt ? fmt(v) : String(v));
  return (
    <div className="h-52 w-[4.75rem] overflow-y-auto rounded-xl border border-border bg-page-secondary/80 sm:h-56 sm:w-20">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "block w-full py-2.5 text-center text-base tabular-nums",
            v === value && "bg-primary font-semibold text-white",
          )}
        >
          {label(v)}
        </button>
      ))}
    </div>
  );
}
