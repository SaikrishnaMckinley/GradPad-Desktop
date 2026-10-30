import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { isDemoStaticUi } from "@/lib/demo-mode";

export default async function ProfileIndexPage() {
  if (isDemoStaticUi()) {
    redirect("/home");
  }

  const session = await getSessionProfile();
  if (!session) {
    redirect("/login?next=/profile");
  }

  if (session.username) {
    redirect(`/profile/${session.username}`);
  }

  redirect("/settings/profile");
}
