import { parseEventStartIso } from "@/lib/events/format-event-datetime";

type Fields = {
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
};

function formatTimePart(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDatePart(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventInviteSchedule(fields: Fields): { dateLine: string; timeLine: string } {
  const startIso = parseEventStartIso({
    start_date: fields.start_date,
    start_time: fields.start_time,
  });
  if (!startIso) {
    return { dateLine: "Date TBD", timeLine: "" };
  }

  const endIso = parseEventStartIso({
    start_date: fields.end_date ?? fields.start_date,
    start_time: fields.end_time,
  });

  const dateLine = formatDatePart(startIso);
  const startTime = formatTimePart(startIso);
  const endTime = endIso ? formatTimePart(endIso) : "";
  const timeLine =
    startTime && endTime && startTime !== endTime
      ? `${startTime} – ${endTime}`
      : startTime || endTime;

  return { dateLine, timeLine };
}
