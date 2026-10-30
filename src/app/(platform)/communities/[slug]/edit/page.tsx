import { notFound, redirect } from "next/navigation";
import { CommunityForm } from "@/components/communities/CommunityForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { updateCommunity } from "@/lib/communities/actions";
import { canManageCommunity } from "@/lib/communities/permissions";
import { getCommunityBySlug } from "@/lib/communities/queries";
import { usesStagingApi } from "@/lib/demo-mode";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
}

export default async function EditCommunityPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login");
  }

  const community = await getCommunityBySlug(slug, session.id);
  if (!community) {
    notFound();
  }
  if (!canManageCommunity(community.membershipRole)) {
    redirect(`/communities/${slug}`);
  }

  const boundUpdate = updateCommunity.bind(null, community.id, community.slug);
  const staging = usesStagingApi();

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Edit community</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update branding and details shown on your community hub.
        </p>
      </div>

      <Card className="max-w-3xl p-6 md:p-8">
        <CommunityForm
          action={boundUpdate}
          submitLabel="Save changes"
          branding={{
            logoUrl: community.logoUrl,
            coverImageUrl: community.coverImageUrl,
          }}
          slugHint={
            staging
              ? "Community URL on staging is tied to your community ID; slug here is for reference only."
              : undefined
          }
          initial={{
            name: community.name,
            slug: community.slug,
            description: community.description ?? "",
            institution: community.institution ?? "",
            location: community.location ?? "",
            visibility: community.visibility,
            joinApprovalRequired: community.joinApprovalRequired,
          }}
        />
      </Card>
    </PageContainer>
  );
}
