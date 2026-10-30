"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  ok: "Join request sent successfully!",
  pending: "Your join request is pending approval.",
  error: "Could not complete your join request. Try again from the community page.",
};

export function CommunityJoinStatusToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    const join = searchParams.get("join");
    if (!join || handled.current) return;
    handled.current = true;

    const message = MESSAGES[join];
    if (message) {
      if (join === "error") toast.error(message);
      else toast.success(message);
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("join");
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }, [router, searchParams]);

  return null;
}
