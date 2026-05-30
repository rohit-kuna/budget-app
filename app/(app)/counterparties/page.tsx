import { getOrganizationCounterpartiesData } from "@/app/actions/auth-roles/counterparties.actions";
import { CounterpartyManagement } from "@/components/features/counterparties/counterparty-management";

export default async function CounterpartiesPage() {
  const data = await getOrganizationCounterpartiesData();

  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <CounterpartyManagement counterparties={data.counterparties} />
    </main>
  );
}
