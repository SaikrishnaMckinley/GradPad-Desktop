"use client";

import { ChevronDown, Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  SegmentedControl,
  SettingToggleRow,
} from "@/components/events/event-create-controls";
import { EventCreateDateTimePicker } from "@/components/events/EventCreateDateTimePicker";
import { EventCreateHostsSection } from "@/components/events/EventCreateHostsSection";
import { EventCreateImageUpload } from "@/components/events/EventCreateImageUpload";
import { EventCreatePayoutPanel } from "@/components/events/EventCreatePayoutPanel";
import { EventCreateSection, EventFieldLabel } from "@/components/events/EventCreateSection";
import { EventLocationAutocomplete } from "@/components/events/EventLocationAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createEvent,
  loadPayoutAccounts,
  startCommunityStripeConnect,
  startPersonalStripeConnect,
  updateEvent,
} from "@/lib/events/actions";
import { notifyEventsInvalidate } from "@/lib/events/events-cache";
import {
  EMPTY_EVENT_DRAFT,
  clearEventCreateDraft,
  consumeEventCreateReturnFlag,
  loadEventCreateDraft,
  newTicketId,
  persistEventCreateDraftForRedirect,
  saveEventCreateDraft,
  type EventCreateDraft,
  type EventTicketDraft,
} from "@/lib/events/event-create-draft";
import { eventCreateReturnPath } from "@/lib/events/site-url";
import { isPayoutAccountReady } from "@/lib/events/payout-accounts";
import { cn } from "@/lib/utils/cn";
import type { SidebarCommunity } from "@/types/community";

type Props = {
  memberships: SidebarCommunity[];
  defaultCommunityId: string | null;
  payoutSetupNotice: string | null;
  editEventId?: string | null;
  initialDraft?: EventCreateDraft | null;
  initialImageUrl?: string | null;
  editCommunityName?: string | null;
};

function defaultStartIso() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultEndIso(start: string) {
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return defaultStartIso();
  d.setHours(d.getHours() + 2);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventCreateForm({
  memberships,
  defaultCommunityId,
  payoutSetupNotice,
  editEventId = null,
  initialDraft = null,
  initialImageUrl = null,
  editCommunityName = null,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = Boolean(editEventId);
  const submitAction = useMemo(
    () => (editEventId ? updateEvent.bind(null, editEventId) : createEvent),
    [editEventId],
  );
  const [state, formAction, pending] = useActionState(submitAction, null);
  const allowRedirectRef = useRef(false);
  const hydratedRef = useRef(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl);
  const [, setImageFile] = useState<File | null>(null);

  const urlCommunity = searchParams.get("community");
  const initialCommunity = useMemo(() => {
    if (isEditMode && defaultCommunityId) return defaultCommunityId;
    if (urlCommunity && memberships.some((m) => m.id === urlCommunity)) return urlCommunity;
    if (defaultCommunityId && memberships.some((m) => m.id === defaultCommunityId)) {
      return defaultCommunityId;
    }
    if (defaultCommunityId) return defaultCommunityId;
    return memberships[0]?.id ?? "";
  }, [defaultCommunityId, memberships, urlCommunity, isEditMode]);

  const [draft, setDraft] = useState<EventCreateDraft>(() => {
    if (isEditMode && initialDraft) {
      return {
        ...initialDraft,
        communityId: initialDraft.communityId || defaultCommunityId || "",
      };
    }
    return {
      ...EMPTY_EVENT_DRAFT,
      communityId: defaultCommunityId || memberships[0]?.id || "",
      startAt: defaultStartIso(),
      endAt: defaultEndIso(defaultStartIso()),
    };
  });
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payout, setPayout] = useState<Awaited<ReturnType<typeof loadPayoutAccounts>> | null>(
    null,
  );
  const [connectingStripe, setConnectingStripe] = useState(false);

  const isPublic = !draft.isPrivate;
  const hasPaidTicket = draft.tickets.some((t) => t.type === "paid");

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (isEditMode && initialDraft) {
      setDraft({
        ...initialDraft,
        communityId: initialDraft.communityId || initialCommunity,
      });
      return;
    }
    const returned = consumeEventCreateReturnFlag();
    const saved = loadEventCreateDraft();
    if (saved && (returned || saved.title || saved.communityId)) {
      setDraft({
        ...saved,
        communityId: saved.communityId || initialCommunity,
        startAt: saved.startAt || defaultStartIso(),
        endAt: saved.endAt || defaultEndIso(saved.startAt || defaultStartIso()),
      });
      if (returned) {
        toast.success("Welcome back — your event draft was restored.");
        if (saved.location?.trim() && !saved.locationId) {
          toast.message(
            "Re-select your venue from the address list if this is an in-person event.",
          );
        }
      }
    } else {
      setDraft((prev) => ({
        ...prev,
        communityId: initialCommunity,
        startAt: prev.startAt || defaultStartIso(),
        endAt: prev.endAt || defaultEndIso(prev.startAt || defaultStartIso()),
      }));
    }
  }, [initialCommunity, isEditMode, initialDraft]);

  useEffect(() => {
    if (payoutSetupNotice) toast.message(payoutSetupNotice);
  }, [payoutSetupNotice]);

  useEffect(() => {
    if (!isEditMode) saveEventCreateDraft(draft);
  }, [draft, isEditMode]);

  const updateDraft = useCallback((patch: Partial<EventCreateDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const selectedCommunity = memberships.find((m) => m.id === draft.communityId);

  useEffect(() => {
    if (!draft.communityId) {
      setPayout(null);
      return;
    }
    let cancelled = false;
    setPayoutLoading(true);
    loadPayoutAccounts(draft.communityId).then((result) => {
      if (!cancelled) {
        setPayout(result);
        setPayoutLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [draft.communityId]);

  const readyAccounts = (payout?.accounts ?? []).filter(isPayoutAccountReady);

  useEffect(() => {
    if (!readyAccounts.length) return;
    const match = readyAccounts.find(
      (a) => a.type === draft.payoutAccountType && a.id === draft.payoutAccountId,
    );
    if (!match) {
      const first = readyAccounts[0];
      updateDraft({ payoutAccountType: first.type, payoutAccountId: first.id });
    }
  }, [readyAccounts, draft.payoutAccountType, draft.payoutAccountId, updateDraft]);

  useEffect(() => {
    if (!allowRedirectRef.current) return;

    if (state?.error) {
      toast.error(state.error);
      allowRedirectRef.current = false;
      return;
    }

    if (state?.success) toast.success(state.success);

    if (state?.redirectTo) {
      allowRedirectRef.current = false;
      if (!isEditMode) clearEventCreateDraft();
      notifyEventsInvalidate(isEditMode && editEventId ? editEventId : undefined);
      router.push(state.redirectTo);
    }
  }, [state, router, isEditMode]);

  function flushDraftForRedirect() {
    persistEventCreateDraftForRedirect(draft);
  }

  async function handleConnectBankAccount() {
    if (!selectedCommunity) return;
    flushDraftForRedirect();
    setConnectingStripe(true);
    const returnPath = eventCreateReturnPath(selectedCommunity.id, "success");
    if (payout?.isPaymentOwner) {
      const result = await startCommunityStripeConnect(
        selectedCommunity.id,
        selectedCommunity.slug,
        returnPath,
      );
      if (result.error) {
        toast.error(result.error);
        setConnectingStripe(false);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
        return;
      }
    }
    router.push(
      `/communities/${selectedCommunity.slug}/manage-payout?return=${encodeURIComponent(returnPath)}`,
    );
    setConnectingStripe(false);
  }

  async function handlePersonalBank() {
    if (!draft.communityId) return;
    flushDraftForRedirect();
    setConnectingStripe(true);
    const result = await startPersonalStripeConnect(draft.communityId);
    if (result.error) {
      toast.error(result.error);
      setConnectingStripe(false);
      return;
    }
    if (result.url) window.location.href = result.url;
  }

  function updateTicket(id: string, patch: Partial<EventTicketDraft>) {
    updateDraft({
      tickets: draft.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  }

  function addTicket() {
    updateDraft({
      tickets: [
        ...draft.tickets,
        { id: newTicketId(), name: "Ticket", type: "free", price: "" },
      ],
    });
  }

  function removeTicket(id: string) {
    if (draft.tickets.length <= 1) return;
    updateDraft({ tickets: draft.tickets.filter((t) => t.id !== id) });
  }

  if (memberships.length === 0) {
    return (
      <p className="w-full rounded-xl border border-border bg-page-secondary/80 px-4 py-3 text-sm text-muted-foreground">
        Join a community before creating an event.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="min-w-0 w-full max-w-full space-y-4 pb-24"
      onSubmit={() => {
        allowRedirectRef.current = true;
      }}
    >
      <input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
      <input type="hidden" name="isPrivate" value={String(draft.isPrivate)} />
      <input type="hidden" name="payoutAccountType" value={draft.payoutAccountType} />
      <input type="hidden" name="payoutAccountId" value={draft.payoutAccountId} />
      <input type="hidden" name="ticketsJson" value={JSON.stringify(draft.tickets)} />
      <input type="hidden" name="donationsEnabled" value={String(draft.donationsEnabled)} />
      <input type="hidden" name="donationGoal" value={draft.donationGoal} />

      <EventCreateSection>
        <EventFieldLabel htmlFor="communityId" required>
          Post to community
        </EventFieldLabel>
        {isEditMode ? (
          <>
            <input type="hidden" name="communityId" value={draft.communityId} />
            <div
              id="communityId"
              className="flex h-11 w-full items-center rounded-lg border border-input-border bg-page-secondary/50 px-3 text-sm text-foreground"
            >
              {editCommunityName?.trim() ||
                selectedCommunity?.name ||
                memberships.find((m) => m.id === draft.communityId)?.name ||
                "—"}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Community can&apos;t be changed when editing an event.
            </p>
          </>
        ) : (
          <div className="relative w-full">
            <select
              id="communityId"
              name="communityId"
              className="h-11 w-full appearance-none rounded-lg border border-input-border bg-page-secondary/50 px-3 pr-10 text-sm"
              value={draft.communityId}
              onChange={(e) => updateDraft({ communityId: e.target.value })}
              required
            >
              <option value="">Select community</option>
              {memberships.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        )}
      </EventCreateSection>

      <EventCreateSection>
        <EventFieldLabel required>Event image</EventFieldLabel>
        <EventCreateImageUpload
          previewUrl={imagePreview}
          onPreviewChange={setImagePreview}
          onFileChange={setImageFile}
        />
      </EventCreateSection>

      <EventCreateSection title="Event details">
        <div className="space-y-4">
          <div>
            <EventFieldLabel htmlFor="title" required>
              Event name
            </EventFieldLabel>
            <Input
              id="title"
              name="title"
              className="h-11 w-full bg-page-secondary/50"
              placeholder="e.g., Summer Music Festival"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              required
            />
          </div>

          <EventCreateDateTimePicker
            startAt={draft.startAt}
            endAt={draft.endAt}
            onStartChange={(startAt) =>
              updateDraft({
                startAt,
                endAt: draft.endAt || defaultEndIso(startAt),
              })
            }
            onEndChange={(endAt) => updateDraft({ endAt })}
          />

          <div>
            <EventFieldLabel required>Location</EventFieldLabel>
            <EventLocationAutocomplete
              value={draft.location}
              locationId={draft.locationId}
              onChange={(location, locationId) => updateDraft({ location, locationId })}
            />
          </div>

          <div>
            <EventFieldLabel htmlFor="description" required>
              Description
            </EventFieldLabel>
            <textarea
              id="description"
              name="description"
              rows={5}
              maxLength={500}
              className="w-full rounded-lg border border-input-border bg-page-secondary/50 px-3 py-2.5 text-sm"
              placeholder="What should attendees know?"
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              required
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {draft.description.length}/500
            </p>
          </div>
        </div>
      </EventCreateSection>

      <EventCreateSection title="Event hosts">
        <EventCreateHostsSection
          communityId={draft.communityId}
          hosts={draft.hosts}
          onChange={(hosts) => updateDraft({ hosts })}
        />
      </EventCreateSection>

      <EventCreateSection>
        <SettingToggleRow
          title="Public event"
          description={
            isPublic
              ? "Public — listed for broader discovery where staging allows."
              : "Private — only community members on GradPad can discover and register."
          }
          checked={isPublic}
          label="Public event"
          onChange={(checked) => updateDraft({ isPrivate: !checked })}
        />
      </EventCreateSection>

      <EventCreateSection title="Event capacity">
        <p className="mb-3 text-xs text-muted-foreground">
          Limit total people at the venue, or leave unlimited.
        </p>
        <SegmentedControl
          value={draft.capacityLimited ? "limited" : "unlimited"}
          options={[
            { value: "unlimited", label: "Unlimited" },
            { value: "limited", label: "Set limit" },
          ]}
          onChange={(v) =>
            updateDraft({
              capacityLimited: v === "limited",
              capacity: v === "limited" ? draft.capacity : "",
            })
          }
        />
        {draft.capacityLimited ? (
          <div>
            <EventFieldLabel htmlFor="capacity">Maximum attendees</EventFieldLabel>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="2"
              className="h-11 w-full bg-page-secondary/50"
              placeholder="e.g., 50"
              value={draft.capacity}
              onChange={(e) => updateDraft({ capacity: e.target.value })}
            />
          </div>
        ) : (
          <input type="hidden" name="capacity" value="" />
        )}
      </EventCreateSection>

      <EventCreateSection>
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-base font-semibold">
            Ticket options<span className="text-error"> *</span>
          </p>
          <Button type="button" size="sm" variant="secondary" className="gap-1" onClick={addTicket}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {draft.communityId && selectedCommunity ? (
          <div className="mb-6 w-full">
            <EventCreatePayoutPanel
              communityId={selectedCommunity.id}
              communitySlug={selectedCommunity.slug}
              communityName={selectedCommunity.name}
              loading={payoutLoading}
              apiError={payout?.apiError ?? null}
              readyAccounts={readyAccounts}
              selectedType={draft.payoutAccountType}
              selectedId={draft.payoutAccountId}
              connectingStripe={connectingStripe}
              onSelectAccount={(account) =>
                updateDraft({
                  payoutAccountType: account.type,
                  payoutAccountId: account.id,
                })
              }
              onConnectStripe={handleConnectBankAccount}
              onBeforeNavigate={flushDraftForRedirect}
            />
            {payout?.allowPersonalPayoutAccounts ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-primary"
                disabled={connectingStripe}
                onClick={() => {
                  flushDraftForRedirect();
                  void handlePersonalBank();
                }}
              >
                Connect personal payout account instead
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-4">
          {draft.tickets.map((ticket, index) => (
            <div key={ticket.id} className="relative rounded-xl border border-border p-4">
              {draft.tickets.length > 1 ? (
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => removeTicket(ticket.id)}
                  aria-label="Remove ticket"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Ticket {index + 1}
              </p>
              <div className="mt-3 space-y-3">
                <Input
                  className="h-11 w-full bg-page-secondary/50"
                  placeholder="Ticket name"
                  value={ticket.name}
                  onChange={(e) => updateTicket(ticket.id, { name: e.target.value })}
                />
                <SegmentedControl
                  value={ticket.type}
                  options={[
                    { value: "free", label: "Free" },
                    { value: "paid", label: "Paid" },
                  ]}
                  onChange={(mode) => updateTicket(ticket.id, { type: mode })}
                />
                {ticket.type === "paid" ? (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-11 w-full bg-page-secondary/50"
                    placeholder="Price (USD)"
                    value={ticket.price}
                    onChange={(e) => updateTicket(ticket.id, { price: e.target.value })}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
        {hasPaidTicket && !draft.payoutAccountId && selectedCommunity ? (
          <div className="mt-4 w-full rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5 text-sm text-foreground">
            Paid tickets need a verified bank account.{" "}
            <button
              type="button"
              className="font-semibold text-primary underline"
              onClick={handleConnectBankAccount}
            >
              Connect bank account
            </button>
          </div>
        ) : null}
      </EventCreateSection>

      <EventCreateSection title="Donations">
        <SettingToggleRow
          title="Accept donations at this event"
          description="Optional fundraising alongside tickets (payout account required when combined with paid tickets)."
          checked={draft.donationsEnabled}
          label="Donations"
          onChange={(donationsEnabled) => updateDraft({ donationsEnabled })}
        />
        {draft.donationsEnabled ? (
          <div className="mt-4">
            <EventFieldLabel htmlFor="donationGoal">Fundraising goal (USD, optional)</EventFieldLabel>
            <Input
              id="donationGoal"
              type="number"
              min="0"
              step="0.01"
              className="h-11 w-full bg-page-secondary/50"
              placeholder="e.g., 5000"
              value={draft.donationGoal}
              onChange={(e) => updateDraft({ donationGoal: e.target.value })}
            />
          </div>
        ) : null}
      </EventCreateSection>

      <div className="sticky bottom-0 z-10 -mx-1 border-t border-border bg-page/95 py-4 backdrop-blur">
        <Button type="submit" className="h-11 w-full text-base" disabled={pending}>
          {pending
            ? isEditMode
              ? "Saving…"
              : "Creating event…"
            : isEditMode
              ? "Save changes"
              : "Create event"}
        </Button>
      </div>
    </form>
  );
}
