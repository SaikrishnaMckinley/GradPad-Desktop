"use client";

import { useState } from "react";
import { updatePassword } from "@/lib/auth/client-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UpdatePasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const result = await updatePassword(password);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      event.currentTarget.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          New password
        </label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
          Confirm password
        </label>
        <Input id="confirm" name="confirm" type="password" minLength={8} required />
      </div>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-success" role="status">
          Password updated.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
