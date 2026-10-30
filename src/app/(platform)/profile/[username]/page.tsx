import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProfileViewSections } from "@/components/profile/ProfileViewSections";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getUserProfileView } from "@/lib/profiles/get-profile-by-username";
import { cn } from "@/lib/utils/cn";

type Props = { params: Promise<{ username: string }> };

async function ProfileViewContent({ params }: Props) {
  const { username } = await params;
  const profile = await getUserProfileView(username);

  if (!profile) {
    notFound();
  }

  const session = await getSessionProfile();
  const isOwnProfile = session?.id === profile.id;
  const handle = profile.nickname ?? profile.id;

  return (
    <PageContainer className="max-w-2xl space-y-6">
      <Card className="p-6 md:p-8 shadow-card">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <Avatar
            src={profile.photo}
            alt={profile.fullName}
            fallback={profile.fullName}
            size="xl"
          />
          <div className="mt-4 min-w-0 flex-1 sm:mt-0">
            <h1 className="text-2xl font-semibold tracking-tight">{profile.fullName}</h1>
            {profile.shortBio ? (
              <p className="mt-1 text-muted-foreground">{profile.shortBio}</p>
            ) : null}
            <p className="mt-1 text-sm text-muted-foreground">@{handle}</p>
            {isOwnProfile ? (
              <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link href="/settings/profile" className={cn(buttonVariants({ size: "sm" }))}>
                  Edit profile
                </Link>
                <Link
                  href="/settings/account"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Account
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
      <ProfileViewSections profile={profile} />
    </PageContainer>
  );
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const profile = await getUserProfileView(username);
  return { title: profile?.fullName ?? "Profile" };
}

export default function ProfilePage(props: Props) {
  return (
    <Suspense
      fallback={
        <PageContainer className="max-w-2xl">
          <div className="h-48 animate-pulse rounded-[20px] bg-border/60" />
        </PageContainer>
      }
    >
      <ProfileViewContent {...props} />
    </Suspense>
  );
}
