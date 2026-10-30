"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteEventAction } from "@/lib/events/manage-actions";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, BarChart3, ScanLine } from "lucide-react";

type Props = {
  eventId: string;
  title: string;
  communityName: string;
};

export function EventManageHubClient({ eventId, title, communityName }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    deleteEventAction.bind(null, eventId),
    null,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  function onDeleteClick() {
    if (
      !window.confirm(
        "Delete this event permanently? Attendees will lose access and this cannot be undone.",
      )
    ) {
      return;
    }
    const form = document.getElementById(`delete-event-${eventId}`) as HTMLFormElement | null;
    form?.requestSubmit();
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Link
        href={`/events/${eventId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 px-0")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to event
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manage event</h1>
        <p className="mt-1 text-sm text-muted-foreground">{communityName}</p>
      </div>

      <Card className="p-6 shadow-card md:p-8">
        <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Check guests in at the door and track attendance for this event.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href={`/events/${eventId}/manage/check-in`}
            className={cn(
              buttonVariants(),
              "h-12 w-full flex-1 gap-2 bg-success text-base text-white hover:bg-success/90",
            )}
          >
            <ScanLine className="h-4 w-4" />
            Start check-in
          </Link>
          <Link
            href={`/events/${eventId}/manage/statistics`}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "h-12 w-full flex-1 gap-2 text-base",
            )}
          >
            <BarChart3 className="h-4 w-4" />
            View event statistics
          </Link>
        </div>
      </Card>

      <Card className="border-destructive/30 p-5 shadow-card">
        <h3 className="text-sm font-semibold text-destructive">Danger zone</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Deleting removes the event, registrations, and check-in history from Grad Pad.
        </p>
        <form id={`delete-event-${eventId}`} action={formAction} className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full border-destructive/40 text-destructive hover:bg-destructive/5"
            disabled={pending}
            onClick={onDeleteClick}
          >
            {pending ? "Deleting…" : "Delete event"}
          </Button>
        </form>
      </Card>

      <Button type="button" variant="ghost" className="w-full" onClick={() => router.back()}>
        Cancel
      </Button>
    </div>
  );
}
