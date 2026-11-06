/** Public invite landing — no app shell or auth required (gradpad-web parity). */
export default function CommunityInviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-page">
      <main className="flex min-h-dvh justify-center px-4 py-6 sm:px-6 md:py-10 lg:px-8">
        {children}
      </main>
    </div>
  );
}
