import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
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
    <PageContainer className="max-w-4xl">
      <div className="mb-6 space-y-3">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Settings
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">
            Profile
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Update how you appear to other members—name, photo, bio, and contact details.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[22px] border-border shadow-card">
        <div className="border-b border-border bg-page-secondary/40 px-6 py-6 md:px-8 md:py-7">
          <AvatarUpload fullName={profile.fullName} avatarUrl={profile.photo} />
        </div>
        <div className="px-6 py-6 md:px-8 md:py-8">
          <ProfileSettingsForm profile={profile} />
        </div>
      </Card>
    </PageContainer>
  );
}

export default function ProfileSettingsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="max-w-4xl">
          <div className="mb-6 h-24 animate-pulse rounded-2xl bg-border/50" />
          <div className="h-[480px] animate-pulse rounded-[22px] bg-border/40" />
        </PageContainer>
      }
    >
      <ProfileSettingsContent />
    </Suspense>
  );
}
