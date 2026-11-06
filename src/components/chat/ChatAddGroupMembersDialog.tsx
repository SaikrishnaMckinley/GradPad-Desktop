"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatMemberOption } from "@/lib/chat/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  communityId: string | null;
  currentUserId: string;
  existingMemberIds: string[];
  onAdd: (userIds: string[]) => Promise<void>;
  busy?: boolean;
};

export function ChatAddGroupMembersDialog({
  open,
  onClose,
  communityId,
  currentUserId,
  existingMemberIds,
  onAdd,
  busy,
}: Props) {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<ChatMemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selected, setSelected] = useState<ChatMemberOption[]>([]);

  const existingKey = existingMemberIds.join("|");

  useEffect(() => {
    if (!open) {
      setMembers([]);
      return;
    }
    setQuery("");
    setSelected([]);
    let cancelled = false;
    (async () => {
      if (!communityId) {
        setMembers([]);
        setLoadingMembers(false);
        return;
      }
      setLoadingMembers(true);
      try {
        const res = await fetch(`/api/chat/members?communityId=${encodeURIComponent(communityId)}`, {
          credentials: "include",
        });
        const body = (await res.json()) as { members?: ChatMemberOption[] };
        const existing = new Set(existingMemberIds);
        const list = (body.members ?? []).filter(
          (m) => m.id && m.id !== currentUserId && !existing.has(m.id),
        );
        if (!cancelled) setMembers(list);
      } catch {
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, communityId, currentUserId, existingKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email?.toLowerCase().includes(q) ?? false),
    );
  }, [members, query]);

  function toggleMember(member: ChatMemberOption) {
    setSelected((prev) => {
      const exists = prev.some((m) => m.id === member.id);
      if (exists) return prev.filter((m) => m.id !== member.id);
      return [...prev, member];
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" aria-hidden onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">Add members</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search community members"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {loadingMembers ? (
            <li className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              {communityId ? "No members to add." : "Select a community in the sidebar to add members."}
            </li>
          ) : (
            filtered.map((member) => {
              const picked = selected.some((m) => m.id === member.id);
              return (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => toggleMember(member)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-secondary/80",
                      picked && "bg-primary-light/60",
                    )}
                  >
                    <Avatar alt={member.name} src={member.photo} fallback={member.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{member.name}</p>
                      {member.email ? (
                        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div className="flex gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={busy || selected.length === 0}
            onClick={() => void onAdd(selected.map((m) => m.id))}
          >
            {busy ? "Adding…" : `Add (${selected.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
