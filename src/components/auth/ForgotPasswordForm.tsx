"use client";

import { useState } from "react";
import { requestPasswordResetEmail } from "@/lib/auth/client-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";

const emailSchema = z.string().trim().email();

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError("Enter a valid email address");
      return;
    }

    setPending(true);
    try {
      const result = await requestPasswordResetEmail(parsed.data);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <p className="rounded-xl border border-success/30 bg-success-bg px-3 py-3 text-sm text-foreground">
        If an account exists for that email, a reset link has been sent.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
