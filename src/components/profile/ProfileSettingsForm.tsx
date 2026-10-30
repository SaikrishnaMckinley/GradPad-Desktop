"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/auth/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfileView } from "@/types/profile";

type ProfileSettingsFormProps = {
  profile: UserProfileView;
};

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, null);
  const handle = profile.nickname ?? "";

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
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
          Handle (nickname)
        </label>
        <Input
          id="nickname"
          name="nickname"
          defaultValue={handle}
          required
          pattern="[A-Za-z0-9_]{3,30}"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Public profile: /profile/{handle || "your_handle"}
        </p>
      </div>
      <div>
        <label htmlFor="shortBio" className="mb-1.5 block text-sm font-medium">
          Short bio
        </label>
        <textarea
          id="shortBio"
          name="shortBio"
          defaultValue={profile.shortBio ?? ""}
          className="min-h-[96px] w-full rounded-xl border border-input-border bg-card px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
          />
        </div>
      </div>
      <div>
        <label htmlFor="currentIndustry" className="mb-1.5 block text-sm font-medium">
          Current industry
        </label>
        <Input
          id="currentIndustry"
          name="currentIndustry"
          defaultValue={profile.currentIndustry ?? ""}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-medium">
            Company
          </label>
          <Input id="company" name="company" defaultValue={profile.company ?? ""} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
            Phone
          </label>
          <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
      <div>
        <label htmlFor="linkedin" className="mb-1.5 block text-sm font-medium">
          LinkedIn URL
        </label>
        <Input id="linkedin" name="linkedin" type="url" defaultValue={profile.linkedin ?? ""} />
      </div>
      {state?.error && (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-success" role="status">
          Profile saved.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
