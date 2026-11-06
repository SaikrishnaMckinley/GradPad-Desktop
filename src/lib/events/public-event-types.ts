import type { EventRegistrationDonationContext } from "@/lib/events/event-donation";

export type PublicEventTicket = {
  id: string;
  name?: string;
  description?: string;
  cost?: number | string | null;
  is_free?: boolean;
  sale_status?: "available" | "upcoming" | "sold_out" | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  limit_sales?: boolean;
  allowed_sales?: number | null;
  sales?: number | null;
  remaining?: number | null;
  remaining_tickets?: number | null;
  quantity_available?: number | null;
  created_at?: string | null;
};

export type PublicEventGuestView = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  location: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  isPublic: boolean;
  allowGuest: boolean;
  communityId?: string;
  communityName?: string;
  attendeeCount: number;
  capacity?: number;
  tickets: PublicEventTicket[];
  donation: EventRegistrationDonationContext;
};
