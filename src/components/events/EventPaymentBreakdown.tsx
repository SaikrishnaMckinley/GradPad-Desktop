import {
  EVENT_DONATION_PROCESSING_FEE_LABEL,
  EVENT_TRANSACTION_FEE_LABEL,
  type ConfirmedPaymentDisplayPricing,
} from "@/lib/events/event-pricing";

type Props = {
  pricing: ConfirmedPaymentDisplayPricing;
  totalLabel?: string;
};

const money = (value: number) => value.toFixed(2);

export function EventPaymentBreakdown({ pricing, totalLabel = "Total paid" }: Props) {
  const {
    ticketLine,
    originalTicketLine,
    discount,
    ticketQuantity,
    donation,
    eventTransactionFee,
    donationProcessingFee,
    total,
  } = pricing;

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-page-secondary/60 p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Payment details
      </p>

      {ticketLine > 0 && (
        <div className="flex items-center justify-between gap-2 text-muted-foreground">
          <span>
            Event ticket{ticketQuantity > 1 ? ` (×${ticketQuantity})` : " (×1)"}
          </span>
          <span className="font-semibold text-foreground">
            $
            {money(
              originalTicketLine != null && discount > 0 ? originalTicketLine : ticketLine,
            )}
          </span>
        </div>
      )}

      {discount > 0 && (
        <div className="flex items-center justify-between gap-2 text-muted-foreground">
          <span>Discount</span>
          <span className="font-semibold text-success">− ${money(discount)}</span>
        </div>
      )}

      {donation > 0 && (
        <div className="flex items-center justify-between gap-2 text-muted-foreground">
          <span>Donation</span>
          <span className="font-semibold text-foreground">${money(donation)}</span>
        </div>
      )}

      {eventTransactionFee > 0 && (
        <div className="flex items-center justify-between gap-2 text-muted-foreground">
          <span>{EVENT_TRANSACTION_FEE_LABEL}</span>
          <span className="font-semibold text-foreground">${money(eventTransactionFee)}</span>
        </div>
      )}

      {donationProcessingFee > 0 && (
        <div className="flex items-center justify-between gap-2 text-muted-foreground">
          <span>{EVENT_DONATION_PROCESSING_FEE_LABEL}</span>
          <span className="font-semibold text-foreground">
            ${money(donationProcessingFee)}
          </span>
        </div>
      )}

      <div className="my-1 h-px bg-border" />

      <div className="flex items-center justify-between gap-2 font-semibold text-foreground">
        <span>{totalLabel}</span>
        <span className="text-primary">${money(total)}</span>
      </div>
    </div>
  );
}

/** Free registration — same section layout as paid breakdown. */
export function EventFreeTicketBreakdown({ ticketName }: { ticketName: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-page-secondary/60 p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Ticket details
      </p>
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <span>{ticketName} (×1)</span>
        <span className="font-semibold text-foreground">Free</span>
      </div>
      <div className="my-1 h-px bg-border" />
      <div className="flex items-center justify-between gap-2 font-semibold text-foreground">
        <span>Total paid</span>
        <span className="text-primary">$0.00</span>
      </div>
    </div>
  );
}
