import { CreateHub, type CreateTab } from "@/components/create/CreateHub";
import { usesStagingApi } from "@/lib/demo-mode";

export const metadata = { title: "Create" };

type Props = {
  searchParams: Promise<{
    tab?: string;
    community?: string;
    channel?: string;
    payout_setup?: string;
  }>;
};

function tabFromParam(raw: string | undefined): CreateTab {
  if (raw === "community" || raw === "event" || raw === "post" || raw === "channel") {
    return raw;
  }
  return "post";
}

export default async function CreatePage({ searchParams }: Props) {
  const { tab, community, channel, payout_setup } = await searchParams;

  let payoutSetupNotice: string | null = null;
  if (payout_setup === "success") {
    payoutSetupNotice = "Payout account updated. Your event draft was restored — finish creating your event.";
  } else if (payout_setup === "cancel") {
    payoutSetupNotice = "Stripe setup was cancelled. You can retry when ready.";
  }

  return (
    <CreateHub
      activeTab={tabFromParam(tab)}
      stagingApi={usesStagingApi()}
      prefillCommunityId={typeof community === "string" ? community : null}
      prefillCommunityRouteKey={null}
      prefillChannelId={typeof channel === "string" ? channel : null}
      payoutSetupNotice={payoutSetupNotice}
    />
  );
}
