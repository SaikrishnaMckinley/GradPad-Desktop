import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";
import { Card } from "@/components/ui/card";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { fetchCurrentStagingUserDetail } from "@/lib/profiles/staging-user-detail";

export const metadata = { title: "Profile settings" };

async function ProfileSettingsContent() {
  if (isDemoStaticUi()) {
    redirect("/home");
  }

  const profile = await fetchCurrentStagingUserDetail();
  if (!profile) {
    redirect("/login?next=/settings/profile");
  }

  return (
    <PageContainer className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit your Grad Pad profile on staging (same fields as gradpad-web).
        </p>
      </div>
      <Card className="p-6 shadow-card">
        <AvatarUpload fullName={profile.fullName} avatarUrl={profile.photo} />
      </Card>
      <Card className="p-6 shadow-card">
        <ProfileSettingsForm profile={profile} />
      </Card>
    </PageContainer>
  );
}

export default function ProfileSettingsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="max-w-xl">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-border/60" />
        </PageContainer>
      }
    >
      <ProfileSettingsContent />
    </Suspense>
  );
}
