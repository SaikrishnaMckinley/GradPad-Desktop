import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/** Shown at /communities when the signed-in user has no memberships (live mode). */
export function CommunitiesMembershipEmpty() {
  return (
    <PageContainer>
      <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-card shadow-card ring-1 ring-border">
          <Image src="/images/gradpad_icon.png" alt="" width={48} height={48} className="opacity-90" />
          <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md">
            <Users className="h-5 w-5" strokeWidth={2.25} />
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">No community selected</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Communities you own or join appear in the left sidebar. Pick one there to open its hub
          with channels, events, and posts — like the reference layout.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The public list on staging is not shown here; only your memberships.
        </p>
        <Link
          href="/create?tab=community"
          className={cn(buttonVariants(), "mt-8")}
        >
          Create a community
        </Link>
      </div>
    </PageContainer>
  );
}
