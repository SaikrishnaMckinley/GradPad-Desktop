import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProfileHeaderActions } from "@/components/profile/ProfileHeaderActions";
import { ProfileViewSections } from "@/components/profile/ProfileViewSections";
import { ProfileAvatarLink } from "@/components/profile/ProfileAvatarLink";
import { Card } from "@/components/ui/card";
import { resolveStagingMediaUrl } from "@/lib/api/media-url";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getUserProfileView } from "@/lib/profiles/get-profile-by-username";

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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
            <ProfileAvatarLink
              userId={profile.id}
              linkable={false}
              src={resolveStagingMediaUrl(profile.photo)}
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
            </div>
          </div>
          <ProfileHeaderActions profileUserId={profile.id} isOwnProfile={isOwnProfile} />
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
