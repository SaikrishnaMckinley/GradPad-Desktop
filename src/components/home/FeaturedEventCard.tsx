import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FeaturedEventCard() {
  return (
    <Card className="overflow-hidden shadow-card">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-page-secondary text-center">
            <span className="text-lg font-bold leading-none text-foreground">21</span>
            <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              May
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Duke SoCal · 5:00 PM
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Alumni Mixer</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Spring mixer for alumni in the LA region
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Peter Jackson · Sawubona, Los Angeles
            </p>
          </div>
        </div>
        <Button className="w-full shrink-0 sm:w-auto">RSVP</Button>
      </div>
    </Card>
  );
}
