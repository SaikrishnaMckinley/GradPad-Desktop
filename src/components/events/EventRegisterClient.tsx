"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradPadBlueHero } from "@/components/ui/GradPadBlueHero";
import { Input } from "@/components/ui/input";
import { EventRegisterDonationSection } from "@/components/events/EventRegisterDonationSection";
import { quoteEventRegistrationPrice, startEventCheckout } from "@/lib/events/actions";
import {
  type DonationSelection,
  type EventRegistrationDonationContext,
  validateDonationAmount,
} from "@/lib/events/event-donation";
import { calculateDonationCheckout } from "@/lib/donations/stripe-fees";
import {
  EVENT_DONATION_PROCESSING_FEE_LABEL,
  EVENT_TRANSACTION_FEE_LABEL,
  buildLocalEventRegistrationPricing,
  getCheckoutDisplayPricing,
  type NormalizedEventPricing,
} from "@/lib/events/event-pricing";
import { formatEventFeedLabels } from "@/lib/events/format-event-datetime";
import type { EventDetailViewModel } from "@/lib/events/map-event-detail";
import { cn } from "@/lib/utils/cn";

type Props = {
  event: EventDetailViewModel;
  viewerName: string;
  viewerEmail: string;
  donationContext: EventRegistrationDonationContext;
};

const emptyDonation = (fundId: string | null): DonationSelection => ({
  amount: 0,
  isCustom: false,
  coverFees: false,
  isAnonymous: false,
  message: "",
  fundId,
});

export function EventRegisterClient({
  event,
  viewerName,
  viewerEmail,
  donationContext,
}: Props) {
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
  const [selectedFundId, setSelectedFundId] = useState(
    donationContext.defaultFundId,
  );
  const [donation, setDonation] = useState<DonationSelection>(() =>
    emptyDonation(donationContext.defaultFundId),
  );
  const [serverPricing, setServerPricing] = useState<NormalizedEventPricing | null>(null);
  const quoteRequestId = useRef(0);

  const selected = tickets.find((t) => t.id === ticketId) ?? tickets[0];
  const { timeLabel, dayLabel } = formatEventFeedLabels(event.startAt);

  const donationError =
    donation.amount > 0
      ? validateDonationAmount(donation.amount, donationContext.settings)
      : null;

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const donationCoverAddon = useMemo(() => {
    if (donation.amount <= 0 || !donation.coverFees) return 0;
    return calculateDonationCheckout(donation.amount, true).processingFeeAddon;
  }, [donation.amount, donation.coverFees]);

  const localPricing = useMemo((): NormalizedEventPricing | null => {
    if (!selected || selected.isFree) return null;
    return buildLocalEventRegistrationPricing({
      ticketUnitCost: selected.cost,
      hasPlusOne: plusOne,
      communityId: event.communityId ?? "",
      donationAmount: donation.amount > 0 ? donation.amount : 0,
      donationCoverFeeAddon: donationCoverAddon,
    });
  }, [selected, plusOne, event.communityId, donation.amount, donationCoverAddon]);

  useEffect(() => {
    setServerPricing(null);
  }, [ticketId, plusOne, coupon, donation.amount, donation.coverFees, donation.fundId]);

  useEffect(() => {
    if (!ticketId || !selected || selected.isFree) {
      setServerPricing(null);
      return;
    }

    const requestId = ++quoteRequestId.current;
    const delay = donation.isCustom ? 280 : 0;

    const timer = window.setTimeout(() => {
      void (async () => {
        const result = await quoteEventRegistrationPrice(event.id, {
          ticketId,
          hasPlusOne: plusOne,
          couponCode: coupon || undefined,
          donationAmount: donation.amount > 0 ? donation.amount : undefined,
          donationCoverFees: donation.coverFees,
          donationFundId: donation.fundId ?? selectedFundId,
        });
        if (requestId !== quoteRequestId.current) return;
        if ("error" in result) {
          if (coupon.trim()) toast.error(result.error);
        } else if (result.pricing) {
          setServerPricing(result.pricing);
        }
      })();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    event.id,
    ticketId,
    plusOne,
    coupon,
    donation.amount,
    donation.coverFees,
    donation.fundId,
    donation.isCustom,
    selected,
    selectedFundId,
  ]);

  const display = useMemo(
    () => getCheckoutDisplayPricing(serverPricing ?? localPricing),
    [serverPricing, localPricing],
  );

  const ticketLine = display?.ticketLine ?? 0;
  const eventFee = display?.platformFee ?? 0;
  const donationLine = display?.donation ?? 0;
  const donationFeeLine = display?.donationFeeCoverage ?? 0;
  const total = display?.total ?? 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (plusOne && !plusOneName.trim()) {
      e.preventDefault();
      toast.error("Plus-one guest full name is required.");
      return;
    }
    if (plusOne && !plusOneEmail.trim()) {
      e.preventDefault();
      toast.error("Plus-one guest email is required.");
      return;
    }
    if (donationError) {
      e.preventDefault();
      toast.error(donationError);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <GradPadBlueHero>
        <Link
          href={`/events/${event.id}`}
          className="text-xs font-medium text-white/85 hover:text-white md:text-sm"
        >
          ← Back to event
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight md:mt-3 md:text-[1.65rem]">
          Event registration
        </h1>
        <p className="mt-1 text-xs text-white/90 md:text-sm">
          Choose your ticket and confirm your details.
        </p>
      </GradPadBlueHero>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden rounded-xl border-primary-border/60 p-4 shadow-card md:rounded-2xl md:p-6">
          <h2 className="text-base font-semibold md:text-lg">{event.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
            {dayLabel}, {timeLabel} · {event.locationLabel ?? "TBD"}
          </p>

          <div className="mt-4 rounded-lg border border-primary-border/50 bg-primary-light/35 p-3 md:mt-6 md:rounded-xl md:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary md:text-xs">
              Your info
            </p>
            <p className="mt-1.5 text-sm font-medium md:mt-2">{viewerName}</p>
            <p className="text-xs text-muted-foreground md:text-sm">{viewerEmail}</p>
          </div>

          <div className="mt-4 space-y-2 md:mt-6 md:space-y-3">
            <p className="text-xs font-semibold text-foreground md:text-sm">Select a ticket</p>
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setTicketId(ticket.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border bg-card p-3 text-left shadow-sm transition-all md:rounded-xl md:p-4",
                  ticketId === ticket.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div>
                  <p className="text-sm font-semibold md:text-base">{ticket.name}</p>
                  {ticket.description ? (
                    <p className="text-[11px] text-muted-foreground md:text-xs">{ticket.description}</p>
                  ) : null}
                </div>
                <p className="text-sm font-semibold md:text-base">${ticket.cost.toFixed(2)}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-primary-border/40 bg-primary-light/15 p-3 md:mt-6 md:rounded-xl md:p-4">
            <label className="flex items-center justify-between gap-3 text-xs font-medium text-foreground md:text-sm">
              Bring a plus-one
              <input
                type="checkbox"
                className="accent-primary"
                checked={plusOne}
                onChange={(e) => setPlusOne(e.target.checked)}
              />
            </label>
            {plusOne ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Guest full name"
                  className="bg-white"
                  autoComplete="name"
                  value={plusOneName}
                  onChange={(e) => setPlusOneName(e.target.value)}
                  required={plusOne}
                />
                <Input
                  placeholder="Guest email"
                  type="email"
                  className="bg-white"
                  autoComplete="email"
                  value={plusOneEmail}
                  onChange={(e) => setPlusOneEmail(e.target.value)}
                  required={plusOne}
                />
              </div>
            ) : null}
          </div>

          {donationContext.available ? (
            <EventRegisterDonationSection
              settings={donationContext.settings}
              funds={donationContext.funds}
              selectedFundId={selectedFundId}
              onFundChange={setSelectedFundId}
              value={donation}
              onChange={setDonation}
              disabled={pending}
            />
          ) : null}
        </Card>

        <Card className="h-fit overflow-hidden rounded-xl border-primary-border/60 p-0 shadow-card md:rounded-2xl">
          <div className="border-b border-primary-border/40 bg-primary-light/30 px-4 py-2.5 md:px-6 md:py-4">
            <h3 className="text-xs font-semibold text-primary md:text-sm">Order summary</h3>
          </div>
          <div className="space-y-1.5 px-4 pt-3 text-xs md:space-y-2 md:px-6 md:pt-4 md:text-sm">
            <div className="flex justify-between">
              <span>{selected?.name ?? "Ticket"}</span>
              <span>${ticketLine.toFixed(2)}</span>
            </div>
            {display && display.discount > 0 ? (
              <div className="flex justify-between text-primary">
                <span>Discount</span>
                <span>-${display.discount.toFixed(2)}</span>
              </div>
            ) : null}
            {eventFee > 0 && selected && !selected.isFree ? (
              <div className="flex justify-between text-muted-foreground">
                <span>{EVENT_TRANSACTION_FEE_LABEL}</span>
                <span>${eventFee.toFixed(2)}</span>
              </div>
            ) : null}
            {donationLine > 0 ? (
              <div className="flex justify-between">
                <span>Donation</span>
                <span>${donationLine.toFixed(2)}</span>
              </div>
            ) : null}
            {donationFeeLine > 0 ? (
              <div className="flex justify-between text-muted-foreground">
                <span>{EVENT_DONATION_PROCESSING_FEE_LABEL}</span>
                <span>${donationFeeLine.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-primary-border/50 pt-2 text-sm font-semibold md:pt-3 md:text-base">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <form action={formAction} className="space-y-3 px-4 pb-4 pt-4 md:space-y-4 md:px-6 md:pb-6 md:pt-5" onSubmit={handleSubmit}>
            <Input
              placeholder="Promo code"
              className="border-primary-border/60 focus-visible:ring-primary/40"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            />
            <input type="hidden" name="ticketId" value={ticketId} />
            <input type="hidden" name="hasPlusOne" value={String(plusOne)} />
            <input type="hidden" name="plusOneName" value={plusOneName} />
            <input type="hidden" name="plusOneEmail" value={plusOneEmail} />
            <input type="hidden" name="couponCode" value={coupon} />
            <input type="hidden" name="donationAmount" value={String(donation.amount)} />
            <input type="hidden" name="donationCoverFees" value={String(donation.coverFees)} />
            <input type="hidden" name="donationIsCustom" value={String(donation.isCustom)} />
            <input type="hidden" name="donationIsAnonymous" value={String(donation.isAnonymous)} />
            <input type="hidden" name="donationMessage" value={donation.message} />
            <input
              type="hidden"
              name="donationFundId"
              value={donation.fundId ?? selectedFundId ?? ""}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={pending || !ticketId || Boolean(donationError)}
            >
              {pending ? "Redirecting to Stripe…" : "Pay with Stripe"}
            </Button>
          </form>

          <p className="px-4 pb-4 text-[11px] leading-relaxed text-muted-foreground md:px-6 md:pb-6 md:text-xs">
            {EVENT_TRANSACTION_FEE_LABEL} includes Stripe and Grad Pad processing fees. Secure
            checkout on staging uses Stripe test mode.
          </p>
        </Card>
      </div>
    </div>
  );
}
