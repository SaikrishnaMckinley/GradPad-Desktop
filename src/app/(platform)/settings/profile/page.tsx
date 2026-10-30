import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { isDemoStaticUi } from "@/lib/demo-mode";

export const metadata = { title: "Profile settings" };

async function ProfileSettingsContent() {
  if (isDemoStaticUi()) {
    redirect("/home");
  }

  const session = await getSessionProfile();
  if (!session) {
    redirect("/login?next=/settings/profile");
  }

  const username = session.username ?? "";

  return (
    <PageContainer className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Profile settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update how you appear across Grad Pad (staging API).
        </p>
      </div>
      <Card className="p-6">
        <ProfileSettingsForm
          defaults={{
            fullName: session.fullName,
            username,
            headline: session.headline ?? "",
            bio: "",
            institution: "",
            location: "",
          }}
        />
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
