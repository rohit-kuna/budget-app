import { getAdminDashboardData } from "@/app/actions/auth-roles/admin.actions";
import { MemberManagement } from "@/components/features/admin/member-management";
import { OrganizationOverview } from "@/components/features/admin/organization-overview";
import { OrganizationSettings } from "@/components/features/admin/organization-settings";

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <OrganizationOverview data={data} />
      <OrganizationSettings data={data} />
      <MemberManagement data={data} />
    </main>
  );
}
