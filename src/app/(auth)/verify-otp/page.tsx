import { Suspense } from "react";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { VerifyOtpForm } from "@/components/auth/VerifyOtpForm";

export const metadata = {
  title: "Verify email",
};

type PageProps = {
  searchParams: Promise<{ email?: string }>;
};

async function VerifyOtpContent({ searchParams }: PageProps) {
  const { email } = await searchParams;
  return (
    <AuthFormCard
      title="Verify your email"
      description="Enter the code we sent to your inbox to finish creating your account."
    >
      <VerifyOtpForm initialEmail={email ?? ""} />
    </AuthFormCard>
  );
}

export default function VerifyOtpPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <AuthFormCard title="Verify your email" description="Loading…">
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
        </AuthFormCard>
      }
    >
      <VerifyOtpContent {...props} />
    </Suspense>
  );
}
