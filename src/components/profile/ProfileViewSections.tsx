import { Card } from "@/components/ui/card";
import type { UserProfileView } from "@/types/profile";

function InfoRow({ label, value }: { label: string; value: string | null }) {
  const display = value?.trim() ? value : "—";
  return (
    <div className="border-b border-border/60 py-3 last:border-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground break-words">{display}</p>
    </div>
  );
}

type Props = {
  profile: UserProfileView;
};

export function ProfileViewSections({ profile }: Props) {
  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Basic info</h2>
        <div className="mt-2">
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Phone" value={profile.phone} />
          <InfoRow
            label="Location"
            value={[profile.hometown, profile.country].filter(Boolean).join(" · ") || null}
          />
        </div>
      </Card>
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Education & work</h2>
        <div className="mt-2">
          <InfoRow label="Program" value={profile.program} />
          <InfoRow label="Graduation year" value={profile.graduationYear} />
          <InfoRow label="Current industry" value={profile.currentIndustry} />
          <InfoRow label="Company" value={profile.company} />
          <InfoRow label="LinkedIn" value={profile.linkedin} />
        </div>
      </Card>
    </div>
  );
}
