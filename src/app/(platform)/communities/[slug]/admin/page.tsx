import { redirect } from "next/navigation";
import { CommunityAdminDashboard } from "@/components/communities/CommunityAdminDashboard";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { loadCommunityAdminDashboard } from "@/lib/communities/load-admin-dashboard";

export const instant = true;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Admin · ${slug}` };
}

export default async function CommunityAdminPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login");
  }

  const data = await loadCommunityAdminDashboard(slug, session.id);
  if (!data) {
    redirect(`/communities/${slug}`);
  }

  const initialTab =
    tab === "requests" || tab === "members" || tab === "donations" || tab === "bank"
      ? tab
      : null;

  return (
    <PageContainer>
      <CommunityAdminDashboard {...data} initialTab={initialTab} />
    </PageContainer>
  );
}
