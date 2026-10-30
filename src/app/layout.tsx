import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ToasterClient } from "@/components/ui/ToasterClient";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "GradPad",
    template: "%s · GradPad",
  },
  description:
    "GradPad — community platform for alumni, events, channels, and messaging.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
