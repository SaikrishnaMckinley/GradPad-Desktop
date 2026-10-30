import Link from "next/link";
import { Suspense } from "react";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { SignupForm } from "@/components/auth/SignupForm";
import { SignupNextCapture } from "@/components/auth/SignupNextCapture";

export const metadata = { title: "Sign up" };

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

async function SignupContent({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthFormCard
      title="Join Grad Pad"
      description="Create your account with email. We’ll send a one-time code to verify your address."
    >
      <SignupNextCapture next={next} />
      <div className="my-6">
        <SignupForm adminSignupEnabled={false} nextAfterVerify={next} />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={loginHref} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthFormCard>
  );
}

export default function SignupPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <AuthFormCard title="Join Grad Pad" description="Loading…">
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
        </AuthFormCard>
      }
    >
      <SignupContent {...props} />
    </Suspense>
  );
}
