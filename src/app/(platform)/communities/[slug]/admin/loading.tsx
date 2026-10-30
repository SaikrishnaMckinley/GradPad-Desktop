import { Card } from "@/components/ui/card";

export default function CommunityAdminLoading() {
  return (
    <div className="space-y-6 px-4 py-8 animate-pulse">
      <div className="h-8 w-48 rounded bg-page-secondary" />
      <Card className="h-32 shadow-card" />
      <Card className="h-48 shadow-card" />
    </div>
  );
}
