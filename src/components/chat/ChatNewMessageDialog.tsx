"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  communitySlug: string | null;
  currentUserId: string;
  onStartDirect: (member: ChatMemberOption) => void;
  onCreateGroup: (payload: {
    members: ChatMemberOption[];
    name: string;
    message: string;
  }) => Promise<void>;
  busy?: boolean;
};

export function ChatNewMessageDialog({
  open,
  onClose,
  communityId,
  communitySlug,
  currentUserId,
  onStartDirect,
  onCreateGroup,
  busy,
}: Props) {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<ChatMemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selected, setSelected] = useState<ChatMemberOption[]>([]);
  const [groupName, setGroupName] = useState("");
  const [openingMessage, setOpeningMessage] = useState("");

  const loadMembers = useCallback(async () => {
    if (!communityId) {
      setMembers([]);
      return;
    }
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/chat/members?communityId=${encodeURIComponent(communityId)}`, {
        credentials: "include",
      });
      const body = (await res.json()) as { members?: ChatMemberOption[] };
      const list = (body.members ?? []).filter((m) => m.id && m.id !== currentUserId);
      setMembers(list);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, [communityId, currentUserId]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelected([]);
    setGroupName("");
    setOpeningMessage("");
    void loadMembers();
  }, [open, loadMembers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email?.toLowerCase().includes(q) ?? false),
    );
  }, [members, query]);

  const isGroup = selected.length > 1;

  function toggleMember(member: ChatMemberOption) {
    setSelected((prev) => {
      const exists = prev.some((m) => m.id === member.id);
      if (exists) return prev.filter((m) => m.id !== member.id);
      return [...prev, member];
    });
  }

  async function handleContinue() {
    if (selected.length === 0) return;
    if (selected.length === 1) {
      onStartDirect(selected[0]!);
      onClose();
      return;
    }
    const message = openingMessage.trim();
    if (!message) return;
    await onCreateGroup({
      members: selected,
      name: groupName.trim(),
      message,
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
        className="flex max-h-[min(640px,90dvh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="new-chat-title" className="text-lg font-semibold">
            New message
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!communityId ? (
          <p className="p-4 text-sm text-muted-foreground">
            Open a community from the sidebar first, then start a chat with its members.
          </p>
        ) : (
          <>
            <div className="border-b border-border p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search members"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {communitySlug ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Showing members from your active community.
                </p>
              ) : null}
              {selected.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMember(m)}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-1 text-xs font-medium text-primary"
                    >
                      {m.name}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto">
              {loadingMembers ? (
                <li className="flex justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </li>
              ) : filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">No members found.</li>
              ) : (
                filtered.map((member) => {
                  const active = selected.some((s) => s.id === member.id);
                  return (
                    <li key={member.id}>
                      <button
                        type="button"
                        onClick={() => toggleMember(member)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/80",
                          active && "bg-primary-light/60",
                        )}
                      >
                        <Avatar alt={member.name} src={member.photo} fallback={member.name} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{member.name}</p>
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

            {isGroup ? (
              <div className="space-y-2 border-t border-border p-4">
                <Input
                  placeholder="Group name (optional)"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <Input
                  placeholder="Opening message"
                  value={openingMessage}
                  onChange={(e) => setOpeningMessage(e.target.value)}
                />
              </div>
            ) : null}

            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={selected.length === 0 || busy || (isGroup && !openingMessage.trim())}
                onClick={() => void handleContinue()}
              >
                {busy ? "Creating…" : selected.length <= 1 ? "Message" : "Create group"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
