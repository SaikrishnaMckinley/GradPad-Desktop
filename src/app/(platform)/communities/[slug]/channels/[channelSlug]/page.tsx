import { notFound } from "next/navigation";
import { CommunityChannelDemoScreen } from "@/components/communities/CommunityChannelDemoScreen";
import { LiveCommunityChannel } from "@/components/communities/LiveCommunityChannel";
import { loadCommunityChannel } from "@/lib/communities/load-community-channel";
import { DEV_CHANNELS, DEV_COMMUNITIES } from "@/lib/fixtures/dev-shell-data";
import { isDemoStaticUi } from "@/lib/demo-mode";

type Props = {
  params: Promise<{ slug: string; channelSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug, channelSlug } = await params;
  if (isDemoStaticUi()) {
    const demo = DEV_COMMUNITIES.find((c) => c.slug === slug);
    const ch = DEV_CHANNELS.find((c) => c.slug === channelSlug);
    return { title: ch ? `${ch.name} · ${demo?.name ?? "Community"}` : "Channel" };
  }
  const data = await loadCommunityChannel(slug, channelSlug);
  if (!data) return { title: "Channel" };
  return {
    title: `${data.channel.name} · ${data.community.name}`,
  };
}

export default async function CommunityChannelPage({ params }: Props) {
  const { slug, channelSlug } = await params;

  if (isDemoStaticUi()) {
    const demo = DEV_COMMUNITIES.find((c) => c.slug === slug);
    const ch = DEV_CHANNELS.find((c) => c.slug === channelSlug);
    if (!demo || !ch) {
      notFound();
    }
    return (
      <CommunityChannelDemoScreen communitySlug={slug} channelSlug={channelSlug} />
    );
  }

  const data = await loadCommunityChannel(slug, channelSlug);
  if (!data) {
    notFound();
  }

  return (
    <LiveCommunityChannel
      key={`${slug}:${channelSlug}`}
      initial={data}
    />
  );
}
