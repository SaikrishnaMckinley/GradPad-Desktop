import Link from "next/link";
import { Suspense } from "react";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { LoginForm } from "@/components/auth/LoginForm";

type Props = {
  searchParams: Promise<{ next?: string; error?: string; session?: string; communityId?: string }>;
};

export const metadata = { title: "Sign in" };

async function LoginContent({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <AuthFormCard
      title="Welcome back"
      description={
        params.communityId
          ? "Sign in to send your join request for the community from your invite link."
          : "Sign in with your Grad Pad staging account."
      }
    >
      {params.error === "auth_callback" && (
        <p className="mb-4 rounded-xl border border-error/30 bg-red-50 px-3 py-2 text-sm text-error">
          Authentication callback failed. Please try again.
        </p>
      )}
      <div className="my-2">
        <LoginForm
          next={params.next ?? "/home"}
          sessionMessage={
            params.session === "expired"
              ? "Your session expired. Please sign in again."
              : null
          }
        />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthFormCard>
  );
}

export default function LoginPage(props: Props) {
  return (
    <Suspense
      fallback={
        <AuthFormCard title="Welcome back" description="Loading sign in…">
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
        </AuthFormCard>
      }
    >
      <LoginContent {...props} />
    </Suspense>
  );
}
