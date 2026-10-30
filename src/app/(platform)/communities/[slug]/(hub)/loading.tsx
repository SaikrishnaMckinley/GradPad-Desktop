import { CommunityDetailLoading } from "@/components/communities/CommunityDetailLoading";

/** Loading state for community hub only — not admin, payout, or edit routes. */
export default function CommunityHubLoading() {
  return <CommunityDetailLoading />;
}
