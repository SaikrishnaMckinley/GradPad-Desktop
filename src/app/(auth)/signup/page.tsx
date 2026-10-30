import Link from "next/link";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <AuthFormCard
      title="Join Grad Pad"
      description="Create your account with email. We’ll send a one-time code to verify your address."
    >
      <div className="my-6">
        <SignupForm adminSignupEnabled={false} />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthFormCard>
  );
}
