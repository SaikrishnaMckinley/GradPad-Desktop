import { AppShell } from "@/components/layout/AppShell";
import { ShellDataProvider } from "@/components/layout/ShellDataProvider";

export const instant = false;

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShellDataProvider>
      <AppShell>{children}</AppShell>
    </ShellDataProvider>
  );
}
