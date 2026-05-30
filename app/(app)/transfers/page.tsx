import { getTransfersDashboardData } from "@/app/actions/auth-roles/expense.actions";
import { TransferManagement } from "@/components/features/transfers/transfer-management";

export default async function TransfersPage() {
  const data = await getTransfersDashboardData();

  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <TransferManagement data={data} />
    </main>
  );
}
