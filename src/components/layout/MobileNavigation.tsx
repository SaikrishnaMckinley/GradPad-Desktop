"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { primaryNavHref } from "@/lib/navigation/primary-nav-href";
import { MOBILE_NAV } from "@/types/navigation";
import { cn } from "@/lib/utils/cn";

export function MobileNavigation() {
  const pathname = usePathname();
  const { communityContext } = useShellData();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile primary"
    >
      <ul className="flex h-16 items-stretch justify-around px-1">
        {MOBILE_NAV.map((item) => {
          const href = primaryNavHref(item, communityContext);
          const active = item.match?.(pathname) ?? pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex flex-1">
              <Link
                href={href}
                prefetch
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
