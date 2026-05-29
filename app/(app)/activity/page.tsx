import { redirect } from "next/navigation";
import { getActivityDashboardData } from "@/app/actions/auth-roles/activity.actions";
import { ROUTES } from "@/app/lib/constants";
import { ActivityDashboard } from "@/components/features/activity/activity-dashboard";

export default async function ActivityPage() {
  const data = await getActivityDashboardData();

  if (!data.currentUser.orgId) {
    redirect(ROUTES.DASHBOARD);
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-6">
      <ActivityDashboard data={data} />
    </main>
  );
}
