"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatMemberOption } from "@/lib/chat/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  communityId: string | null;
  currentUserId: string;
  existingMemberIds: string[];
  onBack: () => void;
  onAdd: (userIds: string[]) => Promise<void>;
};

export function ChatAddGroupMembersPanel({
  communityId,
  currentUserId,
  existingMemberIds,
  onBack,
  onAdd,
}: Props) {
  const [query, setQuery] = useState("");
  const [allMembers, setAllMembers] = useState<ChatMemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [selected, setSelected] = useState<ChatMemberOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const existingKey = existingMemberIds.join("|");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!communityId) {
        setAllMembers([]);
        setLoadingMembers(false);
        return;
      }
      setLoadingMembers(true);
      try {
        const res = await fetch(`/api/chat/members?communityId=${encodeURIComponent(communityId)}`, {
          credentials: "include",
        });
        const body = (await res.json()) as { members?: ChatMemberOption[] };
        if (!cancelled) {
          setAllMembers(body.members ?? []);
        }
      } catch {
        if (!cancelled) setAllMembers([]);
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [communityId]);

  const available = useMemo(() => {
    const existing = new Set(existingMemberIds);
    return allMembers.filter(
      (m) => m.id && m.id !== currentUserId && !existing.has(m.id),
    );
  }, [allMembers, currentUserId, existingKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email?.toLowerCase().includes(q) ?? false),
    );
  }, [available, query]);

  function toggleMember(member: ChatMemberOption) {
    setSelected((prev) => {
      const exists = prev.some((m) => m.id === member.id);
      if (exists) return prev.filter((m) => m.id !== member.id);
      return [...prev, member];
    });
  }

  async function handleAdd() {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      await onAdd(selected.map((m) => m.id));
      setSelected([]);
      onBack();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-primary"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h2 className="text-sm font-semibold">Add members</h2>
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
            {communityId
              ? "No members to add."
              : "Select a community in the sidebar to add members."}
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
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={submitting || selected.length === 0}
          onClick={() => void handleAdd()}
        >
          {submitting ? "Adding…" : `Add (${selected.length})`}
        </Button>
      </div>
    </div>
  );
}
