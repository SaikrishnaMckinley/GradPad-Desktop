export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function eventCreateReturnPath(communityId: string, payoutSetup?: string) {
  const params = new URLSearchParams({ tab: "event", community: communityId });
  if (payoutSetup) params.set("payout_setup", payoutSetup);
  return `/create?${params.toString()}`;
}
