"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { signUpWithEmail } from "@/lib/auth/client-auth";
import { storeSignupPayloadForOtp } from "@/components/auth/VerifyOtpForm";
import { registerAccount, type RegisterState } from "@/lib/auth/register-action";
import { signUpSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";

type SignupFormProps = {
  /** When true, server uses service_role to create user without verification email. */
  adminSignupEnabled: boolean;
};

function AdminSignupForm() {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    registerAccount,
    null,
  );

  return (
    <form action={formAction} className="space-y-4" autoComplete="on">
      <SignupFields />
      {state?.error && <SignupError message={state.error} />}
      <SubmitButton pending={pending} />
    </form>
  );
}

function isExistingAccountError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("already exists") || lower.includes("already registered");
}

function ClientSignupForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      fullName: form.get("fullName"),
      email: form.get("email"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setPending(true);
    try {
      const { confirmPassword: _confirm, ...signupPayload } = parsed.data;
      const result = await signUpWithEmail(signupPayload);
      if ("error" in result && result.error) {
        if (isExistingAccountError(result.error)) {
          storeSignupPayloadForOtp(signupPayload);
          const params = new URLSearchParams({ email: parsed.data.email });
          router.push(`/verify-otp?${params.toString()}`);
          return;
        }
        setError(result.error);
        return;
      }
      if ("needsOtp" in result && result.needsOtp) {
        storeSignupPayloadForOtp(signupPayload);
        const params = new URLSearchParams({ email: parsed.data.email });
        router.push(`/verify-otp?${params.toString()}`);
        return;
      }
      router.push("/home");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
      <SignupFields />
      {error && <SignupError message={error} />}
      <SubmitButton pending={pending} />
    </form>
  );
}

export function SignupForm({ adminSignupEnabled }: SignupFormProps) {
  return adminSignupEnabled ? <AdminSignupForm /> : <ClientSignupForm />;
}

function SignupFields() {
  return (
    <>
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
          Full name
        </label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
          Confirm password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
    </>
  );
}

function SignupError({ message }: { message: string }) {
  return (
    <p
      className="rounded-xl border border-error/25 bg-red-50 px-3 py-2 text-sm text-error"
      role="alert"
    >
      {message}
    </p>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}
