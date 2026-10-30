"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { startEventCheckout } from "@/lib/events/actions";
import { formatEventFeedLabels } from "@/lib/events/format-event-datetime";
import type { EventDetailViewModel } from "@/lib/events/map-event-detail";
import { cn } from "@/lib/utils/cn";

type Props = {
  event: EventDetailViewModel;
  viewerName: string;
  viewerEmail: string;
};

export function EventRegisterClient({ event, viewerName, viewerEmail }: Props) {
  const [state, formAction, pending] = useActionState(
    startEventCheckout.bind(null, event.id),
    null,
  );
  const paidTickets = event.tickets.filter((t) => !t.isFree && t.cost > 0);
  const tickets = paidTickets.length > 0 ? paidTickets : event.tickets;
  const [ticketId, setTicketId] = useState(tickets[0]?.id ?? "");
  const [plusOne, setPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [plusOneEmail, setPlusOneEmail] = useState("");
  const [coupon, setCoupon] = useState("");

  const selected = tickets.find((t) => t.id === ticketId) ?? tickets[0];
  const subtotal = selected ? selected.cost : 0;
  const fee = useMemo(() => Math.round(subtotal * 0.029 * 100 + 30) / 100, [subtotal]);
  const total = subtotal + fee;

  const { timeLabel, dayLabel } = formatEventFeedLabels(event.startAt);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-primary px-6 py-8 text-white">
        <Link
          href={`/events/${event.id}`}
          className="text-sm text-white/80 hover:text-white"
        >
          ← Back to event
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Event registration</h1>
        <p className="mt-1 text-sm text-white/85">Choose your ticket and confirm your details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-6 shadow-card">
          <h2 className="text-lg font-semibold">{event.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {dayLabel}, {timeLabel} · {event.locationLabel ?? "TBD"}
          </p>

          <div className="mt-6 rounded-xl bg-page-secondary/80 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Your info</p>
            <p className="mt-2 font-medium">{viewerName}</p>
            <p className="text-sm text-muted-foreground">{viewerEmail}</p>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold">Tickets</p>
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setTicketId(ticket.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-4 text-left",
                  ticketId === ticket.id
                    ? "border-primary bg-primary-light/40"
                    : "border-border",
                )}
              >
                <div>
                  <p className="font-semibold">{ticket.name}</p>
                  {ticket.description ? (
                    <p className="text-xs text-muted-foreground">{ticket.description}</p>
                  ) : null}
                </div>
                <p className="font-semibold">${ticket.cost.toFixed(2)}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-border p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium">
              Bring a plus-one
              <input
                type="checkbox"
                checked={plusOne}
                onChange={(e) => setPlusOne(e.target.checked)}
              />
            </label>
            {plusOne ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Guest name"
                  value={plusOneName}
                  onChange={(e) => setPlusOneName(e.target.value)}
                />
                <Input
                  placeholder="Guest email"
                  type="email"
                  value={plusOneEmail}
                  onChange={(e) => setPlusOneEmail(e.target.value)}
                />
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="h-fit p-6 shadow-card">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Order summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{selected?.name ?? "Ticket"}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Event transaction fee</span>
              <span>${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Input
            className="mt-4"
            placeholder="Coupon code (optional)"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
          />

          <form action={formAction} className="mt-5">
            <input type="hidden" name="ticketId" value={ticketId} />
            <input type="hidden" name="hasPlusOne" value={String(plusOne)} />
            <input type="hidden" name="plusOneName" value={plusOneName} />
            <input type="hidden" name="plusOneEmail" value={plusOneEmail} />
            <input type="hidden" name="couponCode" value={coupon} />
            <Button type="submit" className="w-full" disabled={pending || !ticketId}>
              {pending ? "Redirecting to Stripe…" : "Pay with Stripe"}
            </Button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Secure checkout on staging uses Stripe test mode. You will be redirected to Stripe to
            complete payment.
          </p>
        </Card>
      </div>
    </div>
  );
}
