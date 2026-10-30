"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmail } from "@/lib/auth/client-auth";
import { signInSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";

type LoginFormProps = { next: string; sessionMessage?: string | null };

export function LoginForm({ next, sessionMessage }: LoginFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setPending(true);
    try {
      const result = await signInWithEmail(parsed.data);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(next.startsWith("/") ? next : "/home");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
      {sessionMessage && (
        <p className="rounded-xl border border-primary-border bg-primary-light px-3 py-2 text-sm text-foreground">
          {sessionMessage}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </div>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
