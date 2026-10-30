import { CreateHub, type CreateTab } from "@/components/create/CreateHub";
import { usesStagingApi } from "@/lib/demo-mode";

export const metadata = { title: "Create" };

type Props = { searchParams: Promise<{ tab?: string }> };

function tabFromParam(raw: string | undefined): CreateTab {
  if (raw === "community" || raw === "event" || raw === "post") return raw;
  return "post";
}

export default async function CreatePage({ searchParams }: Props) {
  const { tab } = await searchParams;

  return <CreateHub activeTab={tabFromParam(tab)} stagingApi={usesStagingApi()} />;
}
