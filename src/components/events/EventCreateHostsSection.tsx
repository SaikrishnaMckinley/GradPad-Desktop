"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import type { EventHostDraft } from "@/lib/events/event-create-draft";

type Props = {
  communityId: string;
  hosts: EventHostDraft[];
  onChange: (hosts: EventHostDraft[]) => void;
};

const MAX_HOSTS = 5;

export function EventCreateHostsSection({ communityId, hosts, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EventHostDraft[]>([]);

  useEffect(() => {
    if (!communityId || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/communities/${communityId}/members/search?query=${encodeURIComponent(query.trim())}`,
        );
        const data = (await res.json()) as { members?: EventHostDraft[] };
        const list = data.members ?? [];
        setResults(list.filter((m) => !hosts.some((h) => h.id === m.id)));
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [communityId, query, hosts]);

  function addHost(host: EventHostDraft) {
    if (hosts.length >= MAX_HOSTS) return;
    onChange([...hosts, host]);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Add up to {MAX_HOSTS} co-hosts from your community (optional).
      </p>
      {hosts.length > 0 ? (
        <ul className="space-y-2">
          {hosts.map((host) => (
            <li
              key={host.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-page-secondary/40 px-3 py-2"
            >
              <Avatar src={host.photo} alt={host.name} fallback={host.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{host.name}</p>
                {host.email ? (
                  <p className="truncate text-xs text-muted-foreground">{host.email}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onChange(hosts.filter((h) => h.id !== host.id))}
                aria-label={`Remove ${host.name}`}
              >
                <X className="h-4 w-4" />
              </button>
              <input type="hidden" name="owner" value={host.id} />
            </li>
          ))}
        </ul>
      ) : null}
      {communityId && hosts.length < MAX_HOSTS ? (
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members by name or email"
            className="h-11 w-full rounded-lg border border-input-border bg-page-secondary/50 px-3 text-sm"
          />
          {results.length > 0 ? (
            <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-card">
              {results.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-page-secondary"
                    onClick={() => addHost(m)}
                  >
                    <Avatar src={m.photo} alt={m.name} fallback={m.name} size="sm" />
                    <span className="truncate">{m.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
