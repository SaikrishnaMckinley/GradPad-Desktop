import { z } from "zod";

export const eventCreateSchema = z.object({
  communityId: z.string().min(1, "Choose a community"),
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(1, "Add a description"),
  startAt: z.string().min(1, "Start date and time are required"),
  endAt: z.string().min(1, "End date and time are required"),
  location: z.string().trim().min(1, "Location is required"),
  isPrivate: z.boolean(),
  capacity: z.string().optional(),
  payoutAccountType: z.string().optional(),
  payoutAccountId: z.string().optional(),
  ticketsJson: z.string().min(2, "Add at least one ticket"),
  donationsEnabled: z.boolean().optional(),
  donationGoal: z.string().optional(),
});
