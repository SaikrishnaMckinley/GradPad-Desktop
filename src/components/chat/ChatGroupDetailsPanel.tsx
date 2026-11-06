"use client";

import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChatAddGroupMembersPanel } from "@/components/chat/ChatAddGroupMembersPanel";
import { ProfileAvatarLink } from "@/components/profile/ProfileAvatarLink";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ChatConversation } from "@/lib/chat/types";

type Props = {
  conversation: ChatConversation;
  currentUserId: string;
  communityId: string | null;
  onBack: () => void;
  onLeft: () => void;
  onDeleted: () => void;
  onRefresh: () => void;
};

export function ChatGroupDetailsPanel({
  conversation,
  currentUserId,
  communityId,
  onBack,
  onLeft,
  onDeleted,
  onRefresh,
}: Props) {
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const members = conversation.members ?? [];
  const memberIdsKey = useMemo(
    () => members.map((m) => m.id).sort().join("|"),
    [members],
  );
  const adminIds = new Set((conversation.admins ?? []).map((a) => a.id));
  const isAdmin =
    adminIds.has(currentUserId) || conversation.createdById === currentUserId;

  async function leaveGroup() {
    setActionBusy(true);
    try {
      const res = await fetch(`/api/chat/group/${conversation.id}/leave`, {
        method: "POST",
        credentials: "include",
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(body.error ?? "Could not leave group.");
        return;
      }
      toast.success("You left the group.");
      setLeaveOpen(false);
      onLeft();
    } finally {
      setActionBusy(false);
    }
  }

  async function addMembers(userIds: string[]) {
    const res = await fetch(
      `/api/chat/group/${encodeURIComponent(conversation.id)}/add-member`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(body.error ?? "Could not add members.");
      throw new Error(body.error);
    }
    toast.success("Members added.");
    onRefresh();
  }

  async function deleteForMe() {
    setActionBusy(true);
    try {
      const res = await fetch("/api/chat/conversations/delete", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", id: conversation.id }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(body.error ?? "Could not delete conversation.");
        return;
      }
      toast.success("Conversation removed from your inbox.");
      setDeleteOpen(false);
      onDeleted();
    } finally {
      setActionBusy(false);
    }
  }

  if (showAddMembers) {
    return (
      <ChatAddGroupMembersPanel
        key={memberIdsKey}
        communityId={communityId}
        currentUserId={currentUserId}
        existingMemberIds={members.map((m) => m.id)}
        onBack={() => setShowAddMembers(false)}
        onAdd={addMembers}
      />
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-primary"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </button>
          <h2 className="text-sm font-semibold">Group info</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col items-center text-center">
            <ProfileAvatarLink
              userId={null}
              linkable={false}
              src={conversation.image}
              alt={conversation.name}
              fallback={conversation.name}
              size="xl"
            />
            <p className="mt-3 text-xl font-semibold">{conversation.name}</p>
            {conversation.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{conversation.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {members.length} member{members.length === 1 ? "" : "s"}
              {isAdmin ? " · You are an admin" : ""}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Members
            </h3>
            <ul className="mt-3 space-y-2">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ProfileAvatarLink
                      userId={member.id}
                      src={member.photo}
                      alt={member.name}
                      fallback={member.name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{member.name}</p>
                      {member.email ? (
                        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                      ) : null}
                    </div>
                  </div>
                  {adminIds.has(member.id) ? (
                    <span className="shrink-0 text-xs font-medium text-primary">Admin</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2 border-t border-border p-4">
          {isAdmin ? (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowAddMembers(true)}
            >
              <UserPlus className="h-4 w-4" />
              Add members
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={actionBusy}
            onClick={() => setLeaveOpen(true)}
          >
            Leave group
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            disabled={actionBusy}
            onClick={() => setDeleteOpen(true)}
          >
            Delete conversation
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={leaveOpen}
        title="Leave this group?"
        description="You will stop receiving new messages until someone adds you back."
        confirmLabel="Leave group"
        cancelLabel="Stay"
        destructive
        busy={actionBusy}
        onConfirm={() => void leaveGroup()}
        onCancel={() => setLeaveOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete conversation?"
        description="This removes the group chat from your inbox. Other members are not affected."
        confirmLabel="Delete for me"
        cancelLabel="Cancel"
        destructive
        busy={actionBusy}
        onConfirm={() => void deleteForMe()}
        onCancel={() => setDeleteOpen(false)}
      />

      {actionBusy ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}
    </>
  );
}
