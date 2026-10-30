import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Home,
  MessageCircle,
  Plus,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  {
    href: "/home",
    label: "Home",
    icon: Home,
    match: (p) => p === "/home" || p === "/",
  },
  {
    href: "/communities",
    label: "Communities",
    icon: Users,
    match: (p) => p.startsWith("/communities"),
  },
  {
    href: "/events",
    label: "Events",
    icon: CalendarDays,
    match: (p) => p.startsWith("/events"),
  },
  {
    href: "/chat",
    label: "Chat",
    icon: MessageCircle,
    match: (p) => p.startsWith("/chat"),
  },
  {
    href: "/create",
    label: "Create",
    icon: Plus,
    match: (p) => p.startsWith("/create"),
  },
];

export const MOBILE_NAV: NavItem[] = PRIMARY_NAV;
