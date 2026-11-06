import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function ManageDonationsPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/communities/${slug}/admin?tab=donations`);
}
