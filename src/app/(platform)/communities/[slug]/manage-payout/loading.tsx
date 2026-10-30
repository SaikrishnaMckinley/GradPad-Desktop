import { Card } from "@/components/ui/card";

export default function ManagePayoutLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card className="animate-pulse p-6 shadow-card">
        <div className="h-3 w-20 rounded bg-page-secondary" />
        <div className="mt-4 h-7 w-56 rounded bg-page-secondary" />
        <div className="mt-3 h-14 rounded bg-page-secondary" />
        <div className="mt-6 h-11 rounded-xl bg-page-secondary" />
        <div className="mt-3 h-11 rounded-xl bg-page-secondary" />
      </Card>
    </div>
  );
}
