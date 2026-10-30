import { z } from "zod";
import { plainTextFromPostHtml } from "@/lib/posts/rich-text";

function plainContentField(max: number) {
  return z
    .string()
    .refine((value) => plainTextFromPostHtml(value).length >= 1, {
      message: "Write something for your post",
    })
    .refine((value) => plainTextFromPostHtml(value).length <= max, {
      message: `Keep the description to ${max} characters or less`,
    });
}

export const postFormSchema = z.object({
  communityId: z.string().trim().min(1, "Choose a community"),
  channelId: z.string().trim().optional().or(z.literal("")),
  title: z.string().trim().min(1, "Title is required").max(200),
  content: plainContentField(1000),
  commentAllow: z.coerce.boolean(),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export const postEditSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: plainContentField(10000),
});

export type PostEditValues = z.infer<typeof postEditSchema>;
