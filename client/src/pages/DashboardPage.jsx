import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchDashboardSummary, fetchRecentActivity } from "../services/dashboardService";
import { StatCard } from "../components/StatCard";
import { formatCurrency } from "../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboardSummary(), fetchRecentActivity()])
      .then(([summaryData, recent]) => {
        setSummary(summaryData);
        setActivity(recent);
      })
      .catch((error) => toast.error(error.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-600">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Income" value={formatCurrency(summary?.totalIncome)} />
        <StatCard label="Total Expense" value={formatCurrency(summary?.totalExpense)} />
        <StatCard label="Net Balance" value={formatCurrency(summary?.netBalance)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activity.length === 0 ? <p className="text-sm text-slate-500">No recent activity found.</p> : null}
          {activity.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-slate-100 p-3">
              <div>
                <p className="font-medium text-slate-700">{item.category}</p>
                <p className="text-xs text-slate-500">{item.type} | {new Date(item.date).toLocaleDateString()}</p>
              </div>
              <p className="font-semibold text-slate-800">{formatCurrency(item.amount)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
