import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getProfileByUsername } from "@/lib/profiles/get-profile-by-username";

type Props = { params: Promise<{ username: string }> };

async function ProfileViewContent({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const session = await getSessionProfile();
  const isOwnProfile = session?.id === profile.id;

  return (
    <PageContainer className="max-w-2xl">
      <Card className="p-6 md:p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <Avatar
            src={profile.avatarUrl}
            alt={profile.fullName}
            fallback={profile.fullName}
            size="xl"
          />
          <div className="mt-4 min-w-0 flex-1 sm:mt-0">
            <h1 className="text-2xl font-semibold tracking-tight">{profile.fullName}</h1>
            {profile.headline && (
              <p className="mt-1 text-muted-foreground">{profile.headline}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">@{profile.username}</p>
            {(profile.institution || profile.location) && (
              <p className="mt-3 text-sm text-muted-foreground">
                {[profile.institution, profile.location].filter(Boolean).join(" · ")}
              </p>
            )}
            {profile.bio && (
              <p className="mt-4 text-sm leading-relaxed text-foreground">{profile.bio}</p>
            )}
            {isOwnProfile && (
              <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link href="/settings/profile">
                  <Button variant="secondary" size="sm" type="button">
                    Edit profile
                  </Button>
                </Link>
                <Link href="/settings/account">
                  <Button variant="outline" size="sm" type="button">
                    Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
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
