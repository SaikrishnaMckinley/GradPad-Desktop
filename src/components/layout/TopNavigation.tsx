"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarDays, Search, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import { primaryNavHref } from "@/lib/navigation/primary-nav-href";
import { PRIMARY_NAV } from "@/types/navigation";
import type { ShellUser } from "@/types/shell-user";
import { cn } from "@/lib/utils/cn";

type TopNavigationProps = {
  shellUser: ShellUser;
  communityContext: ShellCommunityContext;
};

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  imageUrl?: string | null;
};

type SearchResponse = {
  communities?: SearchItem[];
  events?: SearchItem[];
};

export function TopNavigation({ shellUser, communityContext }: TopNavigationProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasQuery = query.trim().length > 0;
  const totalResults = useMemo(
    () => (results.communities?.length ?? 0) + (results.events?.length ?? 0),
    [results],
  );

  useEffect(() => {
    function onKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeydown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    if (!hasQuery) {
      setResults({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timeout = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          credentials: "include",
        });
        const body = (await res.json()) as SearchResponse;
        if (!cancelled) {
          setResults({
            communities: body.communities ?? [],
            events: body.events ?? [],
          });
        }
      } catch {
        if (!cancelled) {
          setResults({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [query, hasQuery]);

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-card/95 backdrop-blur-sm lg:block">
      <div className="flex h-[62px] items-center gap-4 px-6">
        <nav
          className="flex shrink-0 items-center gap-1"
          aria-label="Primary"
        >
          {PRIMARY_NAV.map((item) => {
            const href = primaryNavHref(item, communityContext);
            const active = item.match?.(pathname) ?? pathname === item.href;
            const Icon = item.icon;
            const isCreate = item.label === "Create";
            return (
              <Link
                key={item.label}
                href={href}
                prefetch
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                {item.label}
                {active && (
                  <span className="absolute -bottom-[13px] left-3 right-3 h-0.5 rounded-full bg-primary" />
                )}
                {isCreate && !active && (
                  <span className="sr-only">Create</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <div ref={containerRef} className="relative w-full max-w-[min(100%,28rem)]">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground/80"
              strokeWidth={2}
            />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search communities and events"
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              className="h-11 w-full rounded-xl border border-border bg-page-secondary pl-11 pr-[4.75rem] text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label="Search communities and events"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-medium leading-none text-muted-foreground">
              <span aria-hidden>⌘</span>
              <span className="ml-1" aria-hidden>
                K
              </span>
            </kbd>

            {open && hasQuery ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                {loading ? (
                  <div className="px-4 py-4 text-sm text-muted-foreground">Searching…</div>
                ) : totalResults === 0 ? (
                  <div className="px-4 py-4 text-sm text-muted-foreground">
                    No results for “{query.trim()}”.
                  </div>
                ) : (
                  <div className="max-h-[26rem] overflow-y-auto py-2">
                    {(results.communities?.length ?? 0) > 0 ? (
                      <div>
                        <p className="px-4 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Communities
                        </p>
                        {results.communities!.map((item) => (
                          <Link
                            key={`community-${item.id}`}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                              <Users className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{item.title}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : null}

                    {(results.events?.length ?? 0) > 0 ? (
                      <div>
                        <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Events
                        </p>
                        {results.events!.map((item) => (
                          <Link
                            key={`event-${item.id}`}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                              <CalendarDays className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{item.title}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/home"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error ring-2 ring-card" />
          </Link>
          <Link
            href={
              shellUser.username ? `/profile/${shellUser.username}` : "/settings/profile"
            }
            aria-label="Your profile"
          >
            <Avatar
              src={shellUser.avatarUrl}
              alt={shellUser.fullName}
              fallback={shellUser.fullName}
              size="md"
            />
          </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
