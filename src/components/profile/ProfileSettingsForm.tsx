"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/auth/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfileView } from "@/types/profile";
import { cn } from "@/lib/utils/cn";

type ProfileSettingsFormProps = {
  profile: UserProfileView;
};

function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

const textareaClass =
  "min-h-[100px] w-full rounded-xl border border-input-border bg-card px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25";

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, null);
  const handle = profile.nickname ?? "";

  return (
    <form action={formAction} className="space-y-10">
      <FormSection title="Basic information">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">
              First name
            </label>
            <Input id="firstName" name="firstName" defaultValue={profile.firstName} required />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">
              Last name
            </label>
            <Input id="lastName" name="lastName" defaultValue={profile.lastName} required />
          </div>
        </div>
        <div>
          <label htmlFor="nickname" className="mb-1.5 block text-sm font-medium">
            Handle
          </label>
          <Input
            id="nickname"
            name="nickname"
            defaultValue={handle}
            required
            pattern="[A-Za-z0-9_]{3,30}"
            className="font-mono text-sm"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            /profile/{handle || "your_handle"}
          </p>
        </div>
        <div>
          <label htmlFor="shortBio" className="mb-1.5 block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="shortBio"
            name="shortBio"
            defaultValue={profile.shortBio ?? ""}
            placeholder="A short intro for your profile card…"
            className={textareaClass}
          />
        </div>
      </FormSection>

      <FormSection
        title="Education & work"
        description="Optional—helps classmates find people in similar paths."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="program" className="mb-1.5 block text-sm font-medium">
              Program
            </label>
            <Input id="program" name="program" defaultValue={profile.program ?? ""} />
          </div>
          <div>
            <label htmlFor="graduationYear" className="mb-1.5 block text-sm font-medium">
              Graduation year
            </label>
            <Input
              id="graduationYear"
              name="graduationYear"
              defaultValue={profile.graduationYear ?? ""}
              inputMode="numeric"
              placeholder="2026"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="currentIndustry" className="mb-1.5 block text-sm font-medium">
              Industry
            </label>
            <Input
              id="currentIndustry"
              name="currentIndustry"
              defaultValue={profile.currentIndustry ?? ""}
            />
          </div>
          <div>
            <label htmlFor="company" className="mb-1.5 block text-sm font-medium">
              Company
            </label>
            <Input id="company" name="company" defaultValue={profile.company ?? ""} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact & location">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
              Phone
            </label>
            <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
          </div>
          <div>
            <label htmlFor="linkedin" className="mb-1.5 block text-sm font-medium">
              LinkedIn
            </label>
            <Input
              id="linkedin"
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/…"
              defaultValue={profile.linkedin ?? ""}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="hometown" className="mb-1.5 block text-sm font-medium">
              Hometown
            </label>
            <Input id="hometown" name="hometown" defaultValue={profile.hometown ?? ""} />
          </div>
          <div>
            <label htmlFor="country" className="mb-1.5 block text-sm font-medium">
              Country
            </label>
            <Input id="country" name="country" defaultValue={profile.country ?? ""} />
          </div>
        </div>
      </FormSection>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-[1.25rem] text-sm">
          {state?.error ? (
            <p className="text-error" role="alert">
              {state.error}
            </p>
          ) : state?.success ? (
            <p className="font-medium text-success" role="status">
              Profile saved.
            </p>
          ) : (
            <p className="text-muted-foreground">Changes apply to your public profile.</p>
          )}
        </div>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto sm:min-w-[140px]">
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
