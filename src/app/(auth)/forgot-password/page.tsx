import Link from "next/link";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthFormCard
      title="Reset your password"
      description="Password reset for staging is handled on gradpad.io for now."
    >
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthFormCard>
  );
}
