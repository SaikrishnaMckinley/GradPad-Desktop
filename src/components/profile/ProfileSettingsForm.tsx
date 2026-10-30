"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/auth/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileSettingsFormProps = {
  defaults: {
    fullName: string;
    username: string;
    headline: string;
    bio: string;
    institution: string;
    location: string;
  };
};

export function ProfileSettingsForm({ defaults }: ProfileSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
          Full name
        </label>
        <Input id="fullName" name="fullName" defaultValue={defaults.fullName} required />
      </div>
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
          Username
        </label>
        <Input
          id="username"
          name="username"
          defaultValue={defaults.username}
          required
          pattern="[A-Za-z0-9_]{3,30}"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Public profile URL: /profile/{defaults.username || "username"}
        </p>
      </div>
      <div>
        <label htmlFor="headline" className="mb-1.5 block text-sm font-medium">
          Headline
        </label>
        <Input
          id="headline"
          name="headline"
          defaultValue={defaults.headline}
          placeholder="UMass Amherst Alumni"
        />
      </div>
      <div>
        <label htmlFor="institution" className="mb-1.5 block text-sm font-medium">
          Institution
        </label>
        <Input id="institution" name="institution" defaultValue={defaults.institution} />
      </div>
      <div>
        <label htmlFor="location" className="mb-1.5 block text-sm font-medium">
          Location
        </label>
        <Input id="location" name="location" defaultValue={defaults.location} />
      </div>
      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={defaults.bio}
          className="min-h-[120px] w-full rounded-xl border border-input-border bg-card px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        />
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
