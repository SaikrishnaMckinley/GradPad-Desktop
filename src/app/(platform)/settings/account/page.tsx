import { Suspense } from "react";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";

export const metadata = { title: "Account settings" };

async function AccountSettingsContent() {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login?next=/settings/account");
  }

  return (
    <PageContainer className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Change your password after using a reset link or when signed in.
        </p>
      </div>
      <Card className="p-6">
        <UpdatePasswordForm />
      </Card>
    </PageContainer>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="max-w-xl">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-border/60" />
        </PageContainer>
      }
    >
      <AccountSettingsContent />
    </Suspense>
  );
}
