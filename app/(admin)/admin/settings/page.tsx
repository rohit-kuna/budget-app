import { getAdminDashboardData } from "@/app/actions/auth-roles/admin.actions";
import { CategoryManagement } from "@/components/features/admin/category-management";
import { OrganizationSettings } from "@/components/features/admin/organization-settings";
import { getOrganizationCategoriesForAdmin } from "@/app/actions/auth-roles/organization-finance.actions";

export default async function SettingsPage() {
  const [data, financeData] = await Promise.all([
    getAdminDashboardData(),
    getOrganizationCategoriesForAdmin(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <OrganizationSettings data={data} />
      <CategoryManagement categories={financeData.categories} />
    </main>
  );
}
