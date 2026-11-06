"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Loader2,
  Mail,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { LoginForm } from "@/components/auth/LoginForm";
import { GradPadLogo } from "@/components/brand/GradPadLogo";
import { EventRegisterDonationSection } from "@/components/events/EventRegisterDonationSection";
import { EventShareLinkButton } from "@/components/events/EventShareLinkButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradPadBlueHero } from "@/components/ui/GradPadBlueHero";
import { Input } from "@/components/ui/input";
import { formatEventInviteSchedule } from "@/lib/events/format-event-invite-schedule";
import { calculateDonationCheckout } from "@/lib/donations/stripe-fees";
import {
  buildEventDonationPayload,
  type DonationSelection,
  validateDonationAmount,
} from "@/lib/events/event-donation";
import {
  buildLocalEventRegistrationPricing,
  EVENT_DONATION_PROCESSING_FEE_LABEL,
  EVENT_TRANSACTION_FEE_LABEL,
  getCheckoutDisplayPricing,
  normalizeEventPricing,
  type EventPricingResponse,
  type NormalizedEventPricing,
} from "@/lib/events/event-pricing";
import {
  defaultPublicGuestTicketId,
  isTicketFree,
  shouldShowTicketPicker,
  ticketPriceLabel,
} from "@/lib/events/map-public-event";
import {
  applySequentialTicketVisibility,
  formatTicketSupportingDetails,
  isTicketPurchasable,
  orderEventTicketsForDisplay,
} from "@/lib/events/ticket-sale-window";
import {
  fetchPublicEventTicketClient,
  createGuestEventPaymentLinkClient,
  fetchEventCalculatePriceClient,
  fetchPublicEventClient,
  paymentLinkFromResponse,
  registerPublicEventClient,
  resendPublicEventConfirmationClient,
} from "@/lib/events/public-event-client";
import {
  normalizeEventQrCode,
  persistGuestRegistration,
  readStoredGuestRegistration,
} from "@/lib/events/public-guest-registration";
import type { PublicEventGuestView } from "@/lib/events/public-event-types";
import { cn } from "@/lib/utils/cn";

type Props = {
  event: PublicEventGuestView;
  initialView?: "login" | "signup";
  initialEmail?: string;
  stripeGuestEmail?: string;
};

type Panel = "register" | "success" | "auth";
type RegisterStep = "details" | "checkout";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const EVENT_COVER_FALLBACK = "/images/event-thumb.jpg";

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function validateClassYear(year: string): boolean {
  const clean = year.replace(/\D/g, "");
  if (clean.length !== 4) return false;
  const n = parseInt(clean, 10);
  const max = new Date().getFullYear() + 1;
  return n >= 1900 && n <= max;
}

export function EventInviteGuest({
  event: initialEvent,
  initialView = "signup",
  initialEmail = "",
  stripeGuestEmail,
}: Props) {
  const [event, setEvent] = useState(initialEvent);
  const [panel, setPanel] = useState<Panel>("register");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("details");
  const [authView, setAuthView] = useState<"login" | "signup">(initialView);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(() =>
    defaultPublicGuestTicketId(initialEvent.tickets),
  );
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: initialEmail,
    class_year: "",
  });
  const [plusOne, setPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [plusOneEmail, setPlusOneEmail] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [selectedFundId, setSelectedFundId] = useState<string | null>(
    initialEvent.donation.defaultFundId,
  );
  const [donation, setDonation] = useState<DonationSelection>({
    amount: 0,
    isCustom: false,
    coverFees: false,
    isAnonymous: false,
    message: "",
    fundId: initialEvent.donation.defaultFundId,
  });

  const invitePath = `/events/${event.id}/event-invite`;
  const authQuery = new URLSearchParams({ next: invitePath });
  const signupHref = `/signup?${authQuery.toString()}`;

  const { dateLine, timeLine } = formatEventInviteSchedule({
    start_date: event.startDate,
    start_time: event.startTime,
    end_date: event.endDate,
    end_time: event.endTime,
  });

  const displayTickets = useMemo(
    () => applySequentialTicketVisibility(orderEventTicketsForDisplay(event.tickets)),
    [event.tickets],
  );
  const showTickets = shouldShowTicketPicker(event.tickets);
  const selectedTicket = useMemo(
    () => displayTickets.find((t) => t.id === selectedTicketId) ?? displayTickets[0],
    [displayTickets, selectedTicketId],
  );
  const donationContext = event.donation;
  const hasDonationStep = donationContext.available;

  const ticketUnitCost = useMemo(() => {
    if (!selectedTicket) return 0;
    const raw = Number(selectedTicket.cost ?? 0);
    return Number.isFinite(raw) ? raw : 0;
  }, [selectedTicket]);

  const selectedFundName = useMemo(() => {
    const id = selectedFundId ?? donation.fundId;
    return donationContext.funds.find((f) => f.id === id)?.name ?? "Community fund";
  }, [donation.fundId, donationContext.funds, selectedFundId]);

  const [quotedPricing, setQuotedPricing] = useState<NormalizedEventPricing | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const pricingReqIdRef = useRef(0);

  const localCheckoutPreview = useMemo(() => {
    const donationFeeAddon =
      donation.amount > 0 && donation.coverFees
        ? calculateDonationCheckout(donation.amount, true).processingFeeAddon
        : 0;
    return buildLocalEventRegistrationPricing({
      ticketUnitCost,
      hasPlusOne: plusOne,
      communityId: event.communityId ?? "",
      donationAmount: donation.amount,
      donationCoverFeeAddon: donationFeeAddon,
    });
  }, [ticketUnitCost, plusOne, event.communityId, donation.amount, donation.coverFees]);

  const effectiveCheckoutPricing = quotedPricing ?? localCheckoutPreview;

  const checkoutLines = useMemo(
    () => getCheckoutDisplayPricing(effectiveCheckoutPricing),
    [effectiveCheckoutPricing],
  );

  const fetchCheckoutQuote = useCallback(async () => {
    const ticketId = selectedTicketId || defaultPublicGuestTicketId(event.tickets);
    const paid = selectedTicket && !isTicketFree(selectedTicket);
    const chargeableDonation = donation.amount > 0;
    if (!paid && !chargeableDonation) {
      setQuotedPricing(null);
      setPricingLoading(false);
      return;
    }

    const reqId = ++pricingReqIdRef.current;
    setPricingLoading(true);
    try {
      const fundId = donation.fundId ?? selectedFundId ?? undefined;
      const res = await fetchEventCalculatePriceClient(event.id, {
        ticket_id: ticketId ?? undefined,
        ticket_quantity: 1,
        has_plus_one: plusOne || undefined,
        donation_amount: chargeableDonation ? donation.amount : undefined,
        donation_cover_fees: chargeableDonation ? donation.coverFees : undefined,
        donation_fund_id: chargeableDonation && fundId ? fundId : undefined,
      });
      if (reqId !== pricingReqIdRef.current) return;
      setQuotedPricing(normalizeEventPricing(res.data as EventPricingResponse));
    } catch {
      if (reqId !== pricingReqIdRef.current) return;
      setQuotedPricing(null);
    } finally {
      if (reqId === pricingReqIdRef.current) setPricingLoading(false);
    }
  }, [
    event.id,
    event.tickets,
    selectedTicketId,
    selectedTicket,
    plusOne,
    donation.amount,
    donation.coverFees,
    donation.fundId,
    selectedFundId,
  ]);

  useEffect(() => {
    if (registerStep !== "checkout") {
      setQuotedPricing(null);
      setPricingLoading(false);
      return;
    }
    const timer = window.setTimeout(() => {
      void fetchCheckoutQuote();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [registerStep, fetchCheckoutQuote]);

  const isPaidCheckout =
    Boolean(selectedTicket && !isTicketFree(selectedTicket)) ||
    (donationContext.available && donation.amount > 0);

  function validateGuestDetails(): string | null {
    const first = form.first_name.trim();
    const last = form.last_name.trim();
    const email = form.email.trim();
    const classYear = form.class_year.trim();
    if (!first) return "First name is required.";
    if (!validateEmail(email)) return "Enter a valid email address.";
    if (!validateClassYear(classYear)) return "Enter a valid 4-digit class year.";
    const ticketId = selectedTicketId || defaultPublicGuestTicketId(event.tickets);
    if (!ticketId) return "No ticket is available for this event.";
    if (plusOne) {
      if (!plusOneName.trim()) return "Plus-one guest name is required.";
      if (!validateEmail(plusOneEmail)) return "Enter a valid plus-one email.";
    }
    return null;
  }

  const about = useMemo(() => stripHtml(event.description), [event.description]);
  const [heroSrc, setHeroSrc] = useState(event.imageUrl ?? EVENT_COVER_FALLBACK);
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    setHeroSrc(event.imageUrl ?? EVENT_COVER_FALLBACK);
    setHeroFailed(false);
  }, [event.imageUrl]);

  const applySuccess = useCallback(
    (payload: { first_name: string; last_name: string; email: string; qr_code?: string }) => {
      const normalized = normalizeEventQrCode(payload.qr_code);
      persistGuestRegistration(event.id, {
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        qr_code: normalized || undefined,
      });
      setSuccessEmail(payload.email);
      setQrCode(normalized);
      setPanel("success");
    },
    [event.id],
  );

  useEffect(() => {
    const stored = readStoredGuestRegistration(event.id);
    if (stored?.email) {
      setSuccessEmail(stored.email);
      setQrCode(normalizeEventQrCode(stored.qr_code));
      setPanel("success");
    }
  }, [event.id]);

  useEffect(() => {
    const email = stripeGuestEmail?.trim();
    if (!email) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchPublicEventTicketClient(event.id, email);
        if (cancelled) return;
        const data = res.data;
        if (data?.qr_code) {
          applySuccess({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || email,
            qr_code: data.qr_code,
          });
        }
      } catch {
        /* guest can resend confirmation manually */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [event.id, stripeGuestEmail, applySuccess]);

  function onContinueFromDetails(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const err = validateGuestDetails();
    if (err) {
      setFormError(err);
      return;
    }
    if (hasDonationStep) {
      setRegisterStep("checkout");
      return;
    }
    void completeRegistration();
  }

  async function completeRegistration(options?: { omitDonation?: boolean }) {
    setFormError(null);

    const err = validateGuestDetails();
    if (err) {
      setFormError(err);
      return;
    }

    const first = form.first_name.trim();
    const last = form.last_name.trim();
    const email = form.email.trim();
    const classYear = form.class_year.trim();
    const ticketId = selectedTicketId || defaultPublicGuestTicketId(event.tickets);
    if (!ticketId) return;

    const omitDonation = options?.omitDonation === true;
    const effectiveDonation = omitDonation
      ? { ...donation, amount: 0, coverFees: false, message: "" }
      : donation;

    if (!omitDonation && effectiveDonation.amount > 0) {
      const donationError = validateDonationAmount(
        effectiveDonation.amount,
        donationContext.settings,
      );
      if (donationError) {
        setFormError(donationError);
        return;
      }
    }

    setSubmitting(true);
    try {
      const ticket = displayTickets.find((t) => t.id === ticketId) ?? selectedTicket;
      const paid = ticket && !isTicketFree(ticket);
      const chargeableDonation =
        !omitDonation && donationContext.available && effectiveDonation.amount > 0;

      if (paid || chargeableDonation) {
        const payRes = await createGuestEventPaymentLinkClient(event.id, {
          ticket_id: ticketId,
          ticket_quantity: 1,
          has_plus_one: plusOne,
          guest_first_name: first,
          guest_last_name: last,
          guest_email: email,
          guest_phone: "",
          class_year: classYear,
          graduation_year: classYear,
          registration_answers: {
            name: `${first} ${last}`.trim(),
            email,
            class_year: classYear,
          },
          ...(plusOne
            ? {
                plus_one_guest: {
                  full_name: plusOneName.trim(),
                  email: plusOneEmail.trim(),
                },
              }
            : {}),
          ...buildEventDonationPayload({
            ...effectiveDonation,
            fundId: effectiveDonation.fundId ?? selectedFundId,
          }),
        });
        const url = paymentLinkFromResponse(payRes.data ?? {});
        if (url) {
          window.location.href = url;
          return;
        }
        throw new Error(
          (payRes.data as { error?: string })?.error || "Could not start checkout.",
        );
      }

      const res = await registerPublicEventClient(event.id, {
        first_name: first,
        last_name: last,
        email,
        ticket_id: ticketId,
        has_plus_one: plusOne,
        plus_one_name: plusOne ? plusOneName.trim() : undefined,
        plus_one_email: plusOne ? plusOneEmail.trim() : undefined,
        class_year: classYear,
        graduation_year: classYear,
        registration_answers: {
          name: `${first} ${last}`.trim(),
          email,
          class_year: classYear,
        },
      });

      const data = res.data;
      if (data?.already_registered) {
        const ticketRes = await fetchPublicEventTicketClient(event.id, email);
        applySuccess({
          first_name: first,
          last_name: last,
          email,
          qr_code: ticketRes.data?.qr_code,
        });
        return;
      }

      applySuccess({
        first_name: first,
        last_name: last,
        email,
        qr_code: data?.qr_code,
      });
      toast.success("You're registered — check your email for confirmation.");
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error)?.message ||
        "Registration failed. Please try again.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onResendEmail() {
    const email = successEmail.trim();
    if (!validateEmail(email)) return;
    setResending(true);
    try {
      await resendPublicEventConfirmationClient(event.id, email);
      toast.success("Confirmation email sent");
    } catch {
      toast.error("Could not resend email. Try again in a moment.");
    } finally {
      setResending(false);
    }
  }

  async function refreshEvent() {
    try {
      const next = await fetchPublicEventClient(event.id);
      setEvent(next);
      if (next.donation.defaultFundId) {
        setSelectedFundId(next.donation.defaultFundId);
        setDonation((d) => ({ ...d, fundId: next.donation.defaultFundId }));
      }
      setSelectedTicketId((current) => current ?? defaultPublicGuestTicketId(next.tickets));
    } catch {
      /* keep initial */
    }
  }

  useEffect(() => {
    void refreshEvent();
  }, []);

  const communityInviteHref = event.communityId
    ? `/communities/${event.communityId}/community-invite?eventId=${encodeURIComponent(event.id)}`
    : null;

  return (
    <div className="w-full max-w-6xl">
      <header className="flex items-center justify-between gap-4 border-b border-border pb-4 md:pb-5">
        <GradPadLogo />
        <EventShareLinkButton eventId={event.id} title={event.title} className="h-9 w-auto px-3" />
      </header>

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,440px)] lg:items-start lg:gap-10 xl:gap-14">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Event invite</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {event.title}
            </h1>
            {event.communityName ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Hosted by <span className="font-medium text-foreground">{event.communityName}</span>
              </p>
            ) : null}
          </div>

          <Card className="overflow-hidden border-border p-0 shadow-card">
            <div className="relative aspect-[2/1] min-h-[200px] bg-page-secondary sm:aspect-[21/9] sm:min-h-[220px]">
              {heroFailed ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-6 text-center">
                  <p className="text-lg font-semibold text-foreground">{event.title}</p>
                  {event.communityName ? (
                    <p className="text-sm text-muted-foreground">{event.communityName}</p>
                  ) : null}
                </div>
              ) : (
                <Image
                  src={heroSrc}
                  alt={event.title ? `${event.title} cover` : "Event cover"}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 720px"
                  priority
                  unoptimized={heroSrc.startsWith("http")}
                  onError={() => {
                    if (heroSrc !== EVENT_COVER_FALLBACK) {
                      setHeroSrc(EVENT_COVER_FALLBACK);
                    } else {
                      setHeroFailed(true);
                    }
                  }}
                />
              )}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                aria-hidden
              />
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light ring-1 ring-primary-border/30">
                    <Calendar className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-foreground">{dateLine}</p>
                    {timeLine ? (
                      <p className="text-sm text-muted-foreground">{timeLine}</p>
                    ) : null}
                  </div>
                </div>
                {event.location ? (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light ring-1 ring-primary-border/30">
                      <MapPin className="h-4 w-4 text-primary" aria-hidden />
                    </div>
                    <p className="min-w-0 pt-0.5 text-sm leading-snug text-foreground">
                      {event.location}
                    </p>
                  </div>
                ) : null}
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light ring-1 ring-primary-border/30">
                    <Users className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <p className="text-sm text-foreground">
                    {event.attendeeCount > 0
                      ? `${event.attendeeCount} attending`
                      : "Be the first to RSVP"}
                    {event.capacity ? (
                      <span className="text-muted-foreground"> · {event.capacity} capacity</span>
                    ) : null}
                  </p>
                </div>
              </div>
              {about ? (
                <div>
                  <h2 className="text-sm font-semibold text-foreground">About</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{about}</p>
                </div>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="mt-8 lg:sticky lg:top-8 lg:mt-0">
          {!event.isPublic ? (
            <Card className="border-border p-5 shadow-card sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">Members only</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This is a private community event. Sign in or create an account and join{" "}
                {event.communityName ?? "the community"} to register.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {communityInviteHref ? (
                  <Link href={communityInviteHref} className={buttonVariants({ size: "lg" })}>
                    Join community
                  </Link>
                ) : null}
                <Button type="button" variant="outline" onClick={() => setPanel("auth")}>
                  Sign in
                </Button>
              </div>
            </Card>
          ) : panel === "success" ? (
            <Card className="overflow-hidden border-primary-border/50 p-0 shadow-card">
              <GradPadBlueHero size="compact" className="rounded-none">
                <p className="text-sm font-medium text-white/90">You&apos;re registered</p>
                <p className="mt-0.5 text-lg font-semibold text-white">Your event ticket</p>
              </GradPadBlueHero>
              <div className="space-y-4 p-5 sm:p-6">
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation to{" "}
                  <span className="font-medium text-foreground">{successEmail}</span>. Show this QR
                  code at check-in.
                </p>
                {qrCode ? (
                  <div className="mx-auto flex max-w-[220px] justify-center rounded-xl border border-border bg-white p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="Event check-in QR code"
                      className="h-auto w-full"
                    />
                  </div>
                ) : (
                  <p className="rounded-lg bg-page-secondary px-3 py-2 text-center text-sm text-muted-foreground">
                    QR code will arrive in your email. You can refresh this page after payment
                    completes.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={resending}
                  onClick={() => void onResendEmail()}
                >
                  {resending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Resend confirmation email
                </Button>
                {communityInviteHref ? (
                  <Link
                    href={communityInviteHref}
                    className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
                  >
                    Join {event.communityName ?? "community"} on Grad Pad
                  </Link>
                ) : null}
              </div>
            </Card>
          ) : panel === "auth" ? (
            <Card className="overflow-hidden border-primary-border/50 p-0 shadow-card">
              <GradPadBlueHero size="compact" className="rounded-none">
                <p className="text-sm font-medium text-white/90">
                  {authView === "signup" ? "Create account" : "Sign in"}
                </p>
                <p className="mt-0.5 text-lg font-semibold text-white">Grad Pad members</p>
              </GradPadBlueHero>
              <div className="space-y-4 p-5 sm:p-6">
                {authView === "signup" ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Create an account to register with your community profile.
                    </p>
                    <Link
                      href={signupHref}
                      className={cn(buttonVariants({ size: "lg" }), "w-full gap-1")}
                    >
                      Continue to sign up
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <LoginForm next={`/events/${event.id}`} />
                )}
                <p className="text-center text-sm text-muted-foreground">
                  {authView === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="font-semibold text-primary hover:underline"
                        onClick={() => setAuthView("login")}
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        className="font-semibold text-primary hover:underline"
                        onClick={() => setAuthView("signup")}
                      >
                        Create account
                      </button>
                    </>
                  )}
                </p>
                <button
                  type="button"
                  className="w-full text-center text-sm font-medium text-primary hover:underline"
                  onClick={() => setPanel("register")}
                >
                  ← Register as guest instead
                </button>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden border-primary-border/50 p-0 shadow-card">
              <GradPadBlueHero size="compact" className="rounded-none">
                {hasDonationStep ? (
                  <p className="text-xs font-medium uppercase tracking-wide text-white/80">
                    Step {registerStep === "details" ? "1" : "2"} of 2
                  </p>
                ) : null}
                <p className="text-sm font-medium text-white/90">
                  {registerStep === "checkout"
                    ? "Review total & optional gift"
                    : "Open to the public"}
                </p>
                <p className="mt-0.5 text-lg font-semibold text-white">
                  {registerStep === "checkout" ? "Finish checkout" : "RSVP for this event"}
                </p>
              </GradPadBlueHero>

              {registerStep === "checkout" ? (
                <div className="space-y-5 p-5 sm:p-6">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    onClick={() => {
                      setRegisterStep("details");
                      setFormError(null);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back to your details
                  </button>

                  <div className="rounded-xl border border-border bg-page-secondary/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                      Registering as{" "}
                      <span className="font-medium text-foreground">
                        {form.first_name.trim()} {form.last_name.trim()}
                      </span>{" "}
                      ({form.email.trim()}).{" "}
                      <span className="text-foreground">
                        A community gift is optional
                      </span>{" "}
                      — your ticket is included either way.
                    </p>
                  </div>

                  <EventRegisterDonationSection
                    surface="inline"
                    settings={donationContext.settings}
                    funds={donationContext.funds}
                    selectedFundId={selectedFundId}
                    onFundChange={(fundId) => {
                      setSelectedFundId(fundId);
                      setDonation((d) => ({ ...d, fundId }));
                    }}
                    value={donation}
                    onChange={setDonation}
                    disabled={submitting}
                  />

                  <div
                    className="rounded-xl border border-primary-border/50 bg-card p-4 shadow-sm"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Order summary
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pricingLoading
                        ? "Updating total…"
                        : quotedPricing
                          ? "Total matches Stripe checkout."
                          : "Updating total…"}
                    </p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="min-w-0 text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {selectedTicket?.name || "Ticket"}
                          </span>
                          {plusOne ? (
                            <span className="block text-xs">Includes plus-one</span>
                          ) : null}
                        </dt>
                        <dd className="shrink-0 font-medium text-foreground">
                          {checkoutLines && checkoutLines.ticketLine > 0
                            ? formatUsd(checkoutLines.ticketLine)
                            : selectedTicket
                              ? ticketPriceLabel(selectedTicket)
                              : "Free"}
                        </dd>
                      </div>
                      {(checkoutLines?.platformFee ?? 0) > 0 ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">{EVENT_TRANSACTION_FEE_LABEL}</dt>
                          <dd className="font-medium text-foreground">
                            {formatUsd(checkoutLines!.platformFee)}
                          </dd>
                        </div>
                      ) : null}
                      <div className="flex justify-between gap-3">
                        <dt className="min-w-0 text-muted-foreground">
                          {donation.amount > 0 ? (
                            <>
                              <span className="font-medium text-foreground">Community gift</span>
                              <span className="block truncate text-xs">{selectedFundName}</span>
                              <button
                                type="button"
                                className="mt-1 text-xs font-medium text-primary hover:underline"
                                disabled={submitting}
                                onClick={() =>
                                  setDonation({
                                    amount: 0,
                                    isCustom: false,
                                    coverFees: false,
                                    isAnonymous: false,
                                    message: "",
                                    fundId: selectedFundId,
                                  })
                                }
                              >
                                Remove gift
                              </button>
                            </>
                          ) : (
                            <span className="italic">Community gift (optional)</span>
                          )}
                        </dt>
                        <dd
                          className={cn(
                            "shrink-0 font-medium",
                            donation.amount > 0 ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {donation.amount > 0 ? formatUsd(donation.amount) : "None"}
                        </dd>
                      </div>
                      {(checkoutLines?.donationFeeCoverage ?? 0) > 0 ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">
                            {EVENT_DONATION_PROCESSING_FEE_LABEL}
                          </dt>
                          <dd className="font-medium text-foreground">
                            {formatUsd(checkoutLines!.donationFeeCoverage)}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-sm font-semibold text-foreground">
                        {isPaidCheckout ? "Estimated total due" : "Total due today"}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {pricingLoading && isPaidCheckout
                          ? "…"
                          : checkoutLines
                            ? formatUsd(checkoutLines.total)
                            : formatUsd(0)}
                      </span>
                    </div>
                    {isPaidCheckout && !pricingLoading && quotedPricing ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Includes ticket, fees, and any gift — same amount on Stripe.
                      </p>
                    ) : null}
                  </div>

                  {formError ? (
                    <p className="text-sm text-destructive" role="alert">
                      {formError}
                    </p>
                  ) : null}

                  <div className="pt-1">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full shadow-sm"
                      disabled={submitting}
                      onClick={() => void completeRegistration()}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing…
                        </>
                      ) : isPaidCheckout ? (
                        checkoutLines
                          ? `Continue to payment · ${formatUsd(checkoutLines.total)}`
                          : "Continue to payment"
                      ) : (
                        "Complete RSVP — free"
                      )}
                    </Button>
                    {donation.amount <= 0 ? (
                      <p className="mt-2 px-1 text-center text-xs leading-relaxed text-muted-foreground">
                        {isPaidCheckout
                          ? "Add a gift above to include it in your total, or continue with your ticket only."
                          : "Add a gift above if you’d like, or complete your free RSVP."}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <form className="space-y-5 p-5 sm:p-6" onSubmit={onContinueFromDetails}>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    No account needed. We&apos;ll email your ticket and QR code after you confirm.
                  </p>

                  {showTickets ? (
                    <div className="space-y-2.5">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <Ticket className="h-4 w-4 text-primary" aria-hidden />
                        Select a ticket
                      </p>
                      <div className="space-y-2">
                        {displayTickets.map((ticket) => {
                          const selected = ticket.id === selectedTicketId;
                          const details = formatTicketSupportingDetails(ticket);
                          const purchasable = isTicketPurchasable(ticket);
                          return (
                            <button
                              key={ticket.id}
                              type="button"
                              disabled={!purchasable}
                              onClick={() => setSelectedTicketId(ticket.id)}
                              className={cn(
                                "flex w-full flex-col rounded-xl border px-3.5 py-3 text-left text-sm transition-all",
                                !purchasable && "cursor-not-allowed opacity-60",
                                selected && purchasable
                                  ? "border-primary bg-primary-light/50 shadow-sm ring-1 ring-primary/20"
                                  : "border-border bg-white hover:border-primary/30 hover:bg-page-secondary/80",
                              )}
                            >
                              <div className="flex w-full items-center justify-between gap-2">
                                <span className="font-medium text-foreground">
                                  {ticket.name || "General admission"}
                                </span>
                                <span className="shrink-0 font-semibold text-primary">
                                  {ticketPriceLabel(ticket)}
                                </span>
                              </div>
                              {details.length > 0 ? (
                                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                  {details.join(" · ")}
                                </p>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-3 border-t border-border pt-4">
                    <p className="text-sm font-semibold text-foreground">Your details</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="guest-first" className="text-sm font-medium">
                          First name
                        </label>
                        <Input
                          id="guest-first"
                          value={form.first_name}
                          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                          autoComplete="given-name"
                          className="border-primary-border/40 bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="guest-last" className="text-sm font-medium">
                          Last name
                        </label>
                        <Input
                          id="guest-last"
                          value={form.last_name}
                          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                          autoComplete="family-name"
                          className="border-primary-border/40 bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="guest-email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="guest-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        autoComplete="email"
                        className="border-primary-border/40 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="guest-class" className="text-sm font-medium">
                        Class year
                      </label>
                      <Input
                        id="guest-class"
                        inputMode="numeric"
                        placeholder="2026"
                        value={form.class_year}
                        onChange={(e) => setForm((f) => ({ ...f, class_year: e.target.value }))}
                        className="border-primary-border/40 bg-white"
                      />
                    </div>
                  </div>

                  {event.allowGuest ? (
                    <div className="rounded-xl border border-border bg-page-secondary/40 p-3.5">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={plusOne}
                          onChange={(e) => setPlusOne(e.target.checked)}
                          className="rounded border-border accent-primary"
                        />
                        Bringing a plus-one
                      </label>
                      {plusOne ? (
                        <div className="mt-3 space-y-3">
                          <Input
                            placeholder="Guest full name"
                            value={plusOneName}
                            onChange={(e) => setPlusOneName(e.target.value)}
                            className="border-primary-border/40 bg-white"
                          />
                          <Input
                            type="email"
                            placeholder="Guest email"
                            value={plusOneEmail}
                            onChange={(e) => setPlusOneEmail(e.target.value)}
                            className="border-primary-border/40 bg-white"
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {formError ? (
                    <p className="text-sm text-destructive" role="alert">
                      {formError}
                    </p>
                  ) : null}

                  <Button type="submit" size="lg" className="w-full shadow-sm" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : hasDonationStep ? (
                      "Continue — review total"
                    ) : selectedTicket && !isTicketFree(selectedTicket) ? (
                      "Continue to payment"
                    ) : (
                      "RSVP — get my ticket"
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Have a Grad Pad account?{" "}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => setPanel("auth")}
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
