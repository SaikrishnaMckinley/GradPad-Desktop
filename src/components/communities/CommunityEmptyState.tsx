import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Hash, Newspaper } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Variant = "channels" | "events" | "posts";

const COPY: Record<
  Variant,
  { title: string; description: string; icon: typeof Hash; cta?: { label: string; href: string } }
> = {
  channels: {
    title: "No channels yet",
    description:
      "Channels are where members discuss topics. Create a General channel to get conversations started.",
    icon: Hash,
    cta: { label: "Create channel", href: "/create" },
  },
  events: {
    title: "No upcoming events",
    description:
      "When you schedule mixers, networking nights, or meetups, they will show up here for the whole community.",
    icon: CalendarDays,
    cta: { label: "Create event", href: "/events" },
  },
  posts: {
    title: "No posts yet",
    description:
      "Share updates, photos, and announcements with your community. Be the first to start the feed.",
    icon: Newspaper,
    cta: { label: "Create post", href: "/create" },
  },
};

type Props = {
  variant: Variant;
  className?: string;
};

export function CommunityEmptyState({ variant, className }: Props) {
  const { title, description, icon: Icon, cta } = COPY[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[22px] border border-dashed border-border bg-page-secondary/80 px-6 py-10 text-center shadow-card",
        className,
      )}
    >
      <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-card ring-1 ring-border">
        <Image
          src="/images/gradpad_icon.png"
          alt=""
          width={40}
          height={40}
          className="opacity-90"
        />
        <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md">
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {cta ? (
        <Link href={cta.href} className={cn(buttonVariants({ variant: "secondary" }), "mt-5")}>
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
