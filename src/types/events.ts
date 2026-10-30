export type EventBadgeTone = "primary" | "success" | "muted";

export type EventListItem = {
  id: string;
  title: string;
  description: string;
  communityName: string;
  communityId: string | null;
  startAt: string;
  locationLabel: string | null;
  imageUrl: string | null;
  isOwner: boolean;
  isAttendee: boolean;
  hasRequested: boolean;
  isPublic: boolean;
  priceLabel: string | null;
  badges: { label: string; tone: EventBadgeTone }[];
  actionLabel: string;
};

export type EventRailItem = {
  id: string;
  title: string;
  startAt: string;
};
