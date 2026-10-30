import { notFound } from "next/navigation";
import { CommunityDemoScreen } from "@/components/communities/CommunityDemoScreen";
import { LiveCommunityHub } from "@/components/communities/LiveCommunityHub";
import { loadCommunityHub } from "@/lib/communities/load-community-hub";
import { DEV_COMMUNITIES } from "@/lib/fixtures/dev-shell-data";
import { isDemoStaticUi } from "@/lib/demo-mode";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (isDemoStaticUi()) {
    const demo = DEV_COMMUNITIES.find((c) => c.slug === slug);
    return { title: demo?.name ?? "Community" };
  }
  const hub = await loadCommunityHub(slug);
  return { title: hub?.community.name ?? "Community" };
}

export default async function CommunityDetailPage({ params }: Props) {
  const { slug } = await params;

  if (isDemoStaticUi()) {
    const demo = DEV_COMMUNITIES.find((c) => c.slug === slug);
    if (!demo) {
      notFound();
    }

    return <CommunityDemoScreen slug={slug} />;
  }

  const hub = await loadCommunityHub(slug);
  if (!hub) {
    notFound();
  }

  return <LiveCommunityHub key={slug} initialHub={hub} />;
}
