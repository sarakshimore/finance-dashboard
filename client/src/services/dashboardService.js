import { get } from "../api/fetchClient";

export async function fetchDashboardSummary() {
  const response = await get("/dashboard/summary");
  return response.data;
}

export async function fetchRecentActivity() {
  const response = await get("/dashboard/recent-activity", { limit: 5 });
  return response.data;
}
