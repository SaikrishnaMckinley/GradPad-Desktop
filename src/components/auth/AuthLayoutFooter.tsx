import Link from "next/link";
import { isDemoStaticUi } from "@/lib/demo-mode";

export async function AuthLayoutFooter() {
  if (isDemoStaticUi()) {
    return (
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        <Link href="/home" className="text-primary hover:underline">
          Continue without signing in
        </Link>{" "}
        (demo UI)
      </footer>
    );
  }

  /* No footer link on auth pages — sign-in/up/forgot flows link to each other in-card. */
  return null;
}
