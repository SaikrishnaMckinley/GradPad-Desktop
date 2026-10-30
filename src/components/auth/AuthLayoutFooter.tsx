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

  return (
    <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
      <Link href="/login" className="text-primary hover:underline">
        Back to sign in
      </Link>
    </footer>
  );
}
