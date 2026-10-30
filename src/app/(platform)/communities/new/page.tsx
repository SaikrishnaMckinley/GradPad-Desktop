import { redirect } from "next/navigation";

/** Community creation lives under Create → Community tab. */
export default function LegacyNewCommunityPage() {
  redirect("/create?tab=community");
}
