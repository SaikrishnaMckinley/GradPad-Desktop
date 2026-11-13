import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EventSelfCheckInPanel } from "@/components/events/EventSelfCheckInPanel";
import { EventManagePageFallback } from "@/components/events/EventManagePageFallback";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonVariants } from "@/components/ui/button";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { fetchEventDetailRaw } from "@/lib/api/events";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft } from "lucide-react";

type Props = { params: Promise<{ eventId: string }> };

export const instant = true;

async function SelfCheckInContent({ params }: Props) {
  if (isDemoStaticUi()) redirect("/events");

  const { eventId } = await params;
  const result = await fetchEventDetailRaw(eventId);
  if (!result.ok) redirect("/events");

  const title =
    (result.data as { title?: string })?.title ?? "Event";

  return (
  <div className="w-full max-w-lg space-y-6">
    <Link
      href={`/events/${eventId}`}
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 px-0")}
    >
      <ChevronLeft className="h-4 w-4" />
      Back to event
    </Link>
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Self check-in</h1>
      <p className="mt-1 text-sm text-muted-foreground">{title}</p>
    </div>
    <EventSelfCheckInPanel eventId={eventId} />
  </div>
  );
}

export default function EventSelfCheckInPage(props: Props) {
  return (
    <PageContainer className="max-w-5xl">
      <Suspense fallback={<EventManagePageFallback />}>
        <SelfCheckInContent {...props} />
      </Suspense>
    </PageContainer>
  );
}
