/**
 * Development-only fixtures for Phase 1 layout work.
 * Replace with Supabase queries as features are implemented.
 */

export type DevChannel = {
  id: string;
  slug: string;
  name: string;
};

export type DevCommunity = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  accentColor: string;
  logoUrl: string;
};

/** App mark in sidebar and header (`public/images`). */
export const GRADPAD_ICON = "/images/gradpad_icon.png";

export type DevUser = {
  id: string;
  fullName: string;
  headline: string;
  avatarUrl: string | null;
};

export const DEV_ACTIVE_COMMUNITY: DevCommunity = {
  id: "ucla",
  slug: "ucla",
  name: "UCLA",
  initials: "U",
  accentColor: "#2774AE",
  logoUrl: "/images/ucla-bruins.png",
};

export const DEV_CHANNELS: DevChannel[] = [
  { id: "1", slug: "general", name: "General" },
  { id: "2", slug: "career-advice", name: "Career advice" },
  { id: "3", slug: "local-meetups", name: "Local meetups" },
  { id: "4", slug: "class-of-2020", name: "Class of 2020" },
];

export const DEV_COMMUNITIES: DevCommunity[] = [
  DEV_ACTIVE_COMMUNITY,
  {
    id: "bls",
    slug: "boston-latin",
    name: "Boston Latin School",
    initials: "B",
    accentColor: "#8B0000",
    logoUrl: "/images/blsa.jpg",
  },
  {
    id: "pepperdine",
    slug: "pepperdine",
    name: "Pepperdine University",
    initials: "P",
    accentColor: "#00205B",
    logoUrl: "/images/pepperdine.jpg",
  },
  {
    id: "usc",
    slug: "usc-alumni",
    name: "USC Alumni",
    initials: "S",
    accentColor: "#990000",
    logoUrl: "/images/usc_alumni.jpeg",
  },
  {
    id: "duke",
    slug: "duke",
    name: "Duke University",
    initials: "D",
    accentColor: "#003087",
    logoUrl: "/images/Duke_University.webp",
  },
];

export const DEV_CURRENT_USER: DevUser = {
  id: "user-1",
  fullName: "Rondale Davis",
  headline: "UMass Amherst Alumni",
  avatarUrl: null,
};
