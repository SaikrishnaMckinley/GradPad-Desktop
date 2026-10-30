"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOutClient } from "@/lib/auth/client-auth";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  variant?: "ghost" | "outline";
  className?: string;
};

export function SignOutButton({ variant = "ghost", className }: SignOutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      await signOutClient();
      router.push("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={className}
      disabled={pending}
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4" />
      {pending ? "…" : "Sign out"}
    </Button>
  );
}
