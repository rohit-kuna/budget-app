import { redirect } from "next/navigation";
import { ROUTES } from "@/app/lib/constants";

export default function BillingRedirectPage() {
  redirect(ROUTES.DASHBOARD_BUDGETS);
}
