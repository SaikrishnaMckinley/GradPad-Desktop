import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoStaticUi } from "@/lib/demo-mode";

async function RootRedirect(): Promise<null> {
  if (isDemoStaticUi()) {
    redirect("/home");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("gradpad_access_token")?.value;
  redirect(token ? "/home" : "/login");
  return null;
}

export default function RootPage() {
  return (
    <Suspense fallback={null}>
      <RootRedirect />
    </Suspense>
  );
}
