import { redirect } from "next/navigation";
import { completeCommunityInviteFromLink } from "@/lib/communities/actions";

export const instant = false;

export const metadata = { title: "Joining community…" };

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CommunityInviteCompletePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await completeCommunityInviteFromLink(slug.trim());

  if (result.redirectTo) {
    redirect(result.redirectTo);
  }

  redirect("/home");
}
