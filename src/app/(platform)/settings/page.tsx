import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";

export const metadata = { title: "Settings" };

async function SettingsHubContent() {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login?next=/settings");
  }

  return (
    <PageContainer className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account.</p>
      </div>
      <Card className="divide-y divide-border shadow-card">
        <Link
          href="/settings/profile"
          className="flex px-5 py-4 text-sm font-medium hover:bg-page-secondary"
        >
          Profile & photo
        </Link>
        <Link
          href="/settings/account"
          className="flex px-5 py-4 text-sm font-medium hover:bg-page-secondary"
        >
          Password & account
        </Link>
      </Card>
      <Card className="p-5 shadow-card">
        <p className="text-sm text-muted-foreground">
          Sign out on this device (calls staging <code className="text-xs">auth/logout/</code>{" "}
          and clears tokens).
        </p>
        <SignOutButton variant="outline" className="mt-4" />
      </Card>
    </PageContainer>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="max-w-xl">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-border/60" />
        </PageContainer>
      }
    >
      <SettingsHubContent />
    </Suspense>
  );
}
