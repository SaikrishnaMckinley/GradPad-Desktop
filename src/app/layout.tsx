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
    default: "Grad Pad",
    template: "%s · Grad Pad",
  },
  description:
    "Grad Pad — community platform for alumni, events, channels, and messaging.",
  icons: {
    icon: [{ url: "/images/gradpad_icon.webp", type: "image/webp" }],
  },
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
