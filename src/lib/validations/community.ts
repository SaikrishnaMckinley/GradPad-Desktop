import { z } from "zod";

export const communityFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  institution: z.string().trim().max(200).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  visibility: z.enum(["public", "private", "hidden"]),
  joinApprovalRequired: z.coerce.boolean(),
});

export type CommunityFormValues = z.infer<typeof communityFormSchema>;

export const memberRoleSchema = z.enum(["admin", "moderator", "member"]);
