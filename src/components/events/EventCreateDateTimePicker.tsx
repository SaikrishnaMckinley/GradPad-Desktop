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
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const MINUTE_STEP = 5;

function snapMinute(minutes: number): number {
  const snapped = Math.round(minutes / MINUTE_STEP) * MINUTE_STEP;
  return snapped >= 60 ? 60 - MINUTE_STEP : snapped;
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
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center overscroll-none p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 max-h-[calc(100dvh-2rem)]">{children}</div>
    </div>,
    document.body,
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
  const [minute, setMinute] = useState(() => snapMinute(initial.getMinutes()));
  const [period, setPeriod] = useState<"AM" | "PM">(initial.getHours() >= 12 ? "PM" : "AM");
  const hourValues = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minuteValues = useMemo(
    () => Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP),
    [],
  );

  function confirm() {
    let h24 = hour % 12;
    if (period === "PM") h24 += 12;
    if (period === "AM" && hour === 12) h24 = 0;
    onConfirm(setMinutes(setHours(initial, h24), minute));
  }

  return (
    <Modal onClose={onClose}>
      <div className="w-[min(100vw-2rem,22rem)] min-w-[18rem] rounded-2xl bg-card p-6 shadow-card sm:min-w-[20rem]">
        <p className="mb-4 text-center text-base font-semibold">Select time</p>
        <div className="relative rounded-2xl bg-page-secondary/35 px-3 py-2 sm:px-4">
          <div
            className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-11 -translate-y-1/2 rounded-xl border border-primary/20 bg-primary/10 sm:inset-x-4"
            aria-hidden
          />
          <div className="relative z-20 flex items-center justify-center gap-1.5 sm:gap-2">
            <ScrollColumn values={hourValues} value={hour} onChange={setHour} />
            <div
              className="flex shrink-0 items-center justify-center text-xl font-semibold leading-none text-muted-foreground"
              style={{ height: WHEEL_HEIGHT, width: "0.75rem" }}
              aria-hidden
            >
              :
            </div>
            <ScrollColumn
              values={minuteValues}
              value={minute}
              onChange={setMinute}
              format={(v) => String(v).padStart(2, "0")}
            />
            <PeriodSelector period={period} onChange={setPeriod} />
          </div>
        </div>
        <Button type="button" className="mt-5 w-full" onClick={confirm}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

const WHEEL_ITEM_H = 44;
const WHEEL_VISIBLE_ROWS = 5;
const WHEEL_PAD = ((WHEEL_VISIBLE_ROWS - 1) / 2) * WHEEL_ITEM_H;
const WHEEL_HEIGHT = WHEEL_VISIBLE_ROWS * WHEEL_ITEM_H;

function PeriodSelector({
  period,
  onChange,
}: {
  period: "AM" | "PM";
  onChange: (p: "AM" | "PM") => void;
}) {
  return (
    <div
      className="ml-1 flex shrink-0 items-center sm:ml-2"
      style={{ height: WHEEL_HEIGHT }}
    >
      <div
        className="flex rounded-xl border border-border/80 bg-card/90 p-1 shadow-sm"
        role="group"
        aria-label="AM or PM"
      >
        {(["AM", "PM"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              "h-9 min-w-[2.65rem] rounded-lg px-2.5 text-sm font-semibold transition-colors sm:min-w-[2.85rem] sm:px-3",
              period === p
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-page-secondary/80 hover:text-foreground",
            )}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncingRef = useRef(false);

  function scrollToValue(v: number, behavior: ScrollBehavior = "auto") {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = values.indexOf(v);
    if (idx < 0) return;
    syncingRef.current = true;
    el.scrollTo({ top: idx * WHEEL_ITEM_H, behavior });
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }

  useLayoutEffect(() => {
    scrollToValue(value);
  }, [value, values]);

  function onScroll() {
    if (syncingRef.current) return;
    if (scrollEndRef.current) clearTimeout(scrollEndRef.current);
    scrollEndRef.current = setTimeout(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const idx = Math.min(
        values.length - 1,
        Math.max(0, Math.round(el.scrollTop / WHEEL_ITEM_H)),
      );
      const next = values[idx];
      if (next !== undefined && next !== value) onChange(next);
    }, 80);
  }

  function onItemClick(v: number) {
    onChange(v);
    scrollToValue(v, "smooth");
  }

  return (
    <div
      className="relative w-14 shrink-0 sm:w-[3.75rem]"
      style={{ height: WHEEL_HEIGHT }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-14 bg-gradient-to-b from-card to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-14 bg-gradient-to-t from-card to-transparent"
        aria-hidden
      />
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className={cn(
          "h-full snap-y snap-mandatory overflow-y-auto overscroll-contain",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <div style={{ height: WHEEL_PAD }} aria-hidden />
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onItemClick(v)}
            style={{ height: WHEEL_ITEM_H }}
            className={cn(
              "flex w-full snap-center items-center justify-center text-lg tabular-nums transition-colors",
              v === value ? "font-semibold text-foreground" : "font-medium text-muted-foreground/70",
            )}
          >
            {label(v)}
          </button>
        ))}
        <div style={{ height: WHEEL_PAD }} aria-hidden />
      </div>
    </div>
  );
}
