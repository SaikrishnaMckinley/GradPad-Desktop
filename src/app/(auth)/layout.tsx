import { Suspense } from "react";
import { AuthLayoutFooter } from "@/components/auth/AuthLayoutFooter";
import { GradPadLogo } from "@/components/brand/GradPadLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="border-b border-border bg-card px-6 py-4">
        <GradPadLogo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Suspense fallback={null}>
        <AuthLayoutFooter />
      </Suspense>
    </div>
  );
}
