"use client";

import { Suspense, useState } from "react";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { MobileSidebarDrawer } from "@/components/layout/MobileSidebarDrawer";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { NavPrefetch } from "@/components/layout/NavPrefetch";
import { TopNavigation } from "@/components/layout/TopNavigation";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { shellUser, communityContext } = useShellData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-page">
      <NavPrefetch />
      <DesktopSidebar shellUser={shellUser} communityContext={communityContext} />
      <MobileSidebarDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        shellUser={shellUser}
        communityContext={communityContext}
      />
      <div className="flex min-h-dvh min-w-0 flex-col lg:pl-[276px]">
        <Suspense fallback={null}>
          <TopNavigation shellUser={shellUser} communityContext={communityContext} />
        </Suspense>
        <MobileHeader shellUser={shellUser} onMenuOpen={() => setMobileMenuOpen(true)} />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <Suspense fallback={null}>
          <MobileNavigation />
        </Suspense>
      </div>
    </div>
  );
}
