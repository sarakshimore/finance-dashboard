import { Card, CardContent, CardHeader } from "./ui/card";

export function StatCard({ label, value }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <p className="text-sm text-slate-500">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
