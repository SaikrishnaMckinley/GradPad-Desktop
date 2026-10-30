import { GradPadLogo } from "@/components/brand/GradPadLogo";

/** Public invite landing — no app shell or auth required (gradpad-web parity). */
export default function CommunityInviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="border-b border-border bg-card px-6 py-4">
        <GradPadLogo />
      </header>
      <main className="flex flex-1 justify-center px-4 py-8 md:py-10">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
