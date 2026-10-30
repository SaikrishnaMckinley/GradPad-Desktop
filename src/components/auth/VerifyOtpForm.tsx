"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearAuthNextPath, readAuthNextPath } from "@/lib/auth/auth-next";
import { resendSignupOtp, verifySignupOtp } from "@/lib/auth/client-auth";
import {
  clearCommunityInviteContext,
  readCommunityInviteContext,
} from "@/lib/communities/community-invite-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SIGNUP_PAYLOAD_KEY = "gradpad_signup_payload";

type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

function readSignupPayload(email: string): SignupPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SIGNUP_PAYLOAD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignupPayload;
    if (parsed.email !== email) return null;
    return parsed;
  } catch {
    return null;
  }
}

type VerifyOtpFormProps = { initialEmail: string };

export function VerifyOtpForm({ initialEmail }: VerifyOtpFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const otp = String(form.get("otp") ?? "").trim();

    if (!email || !otp) {
      setError("Email and verification code are required.");
      return;
    }

    setPending(true);
    try {
      const result = await verifySignupOtp({ email, otp });
      if (result.error) {
        setError(result.error);
        return;
      }
      sessionStorage.removeItem(SIGNUP_PAYLOAD_KEY);
      const invite = readCommunityInviteContext();
      const storedNext = readAuthNextPath();
      const next =
        (storedNext?.startsWith("/") ? storedNext : null) ??
        (invite?.redirect?.startsWith("/") ? invite.redirect : null) ??
        "/home";
      clearAuthNextPath();
      clearCommunityInviteContext();
      router.push(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    setError(null);
    setResent(false);
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const email = emailInput?.value.trim() ?? initialEmail;
    const payload = readSignupPayload(email);
    if (!payload) {
      setError("Sign up again to resend a code.");
      return;
    }
    setPending(true);
    try {
      const result = await resendSignupOtp(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      setResent(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={initialEmail}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="otp">
          Verification code
        </label>
        <Input id="otp" name="otp" inputMode="numeric" autoComplete="one-time-code" required />
      </div>
      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {resent && (
        <p className="text-sm text-muted-foreground">A new code was sent if the account exists.</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Verifying…" : "Verify and continue"}
      </Button>
      <button
        type="button"
        className="w-full text-center text-sm text-primary hover:underline"
        onClick={onResend}
        disabled={pending}
      >
        Resend code
      </button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function storeSignupPayloadForOtp(payload: SignupPayload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SIGNUP_PAYLOAD_KEY, JSON.stringify(payload));
}
