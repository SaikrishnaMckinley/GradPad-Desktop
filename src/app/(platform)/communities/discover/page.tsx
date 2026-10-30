import { redirect } from "next/navigation";

/** Public browse grid removed — communities live in the sidebar only. */
export default function CommunitiesDiscoverPage() {
  redirect("/communities");
}
