import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/app/lib/auth";
import { ROUTES } from "@/app/lib/constants";
import { ROLES } from "@/app/lib/roles";
import { getOrganizationById } from "@/app/actions/tables/organizations.table.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingDashboard } from "@/components/features/onboarding/onboarding-dashboard";

export default async function DashboardPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect(ROUTES.SIGN_IN);
  }

  if (!user.orgId) {
    return (
      <main className="mx-auto w-full max-w-7xl p-6">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Onboarding
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome — let’s get your workspace set up
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Join an existing organization with an invite code, or create a new one and become
            its admin.
          </p>
        </div>
        <OnboardingDashboard />
      </main>
    );
  }

  const organization = await getOrganizationById(user.orgId);
  const isAdmin = user.role === ROLES.ADMIN;

  return (
    <main className="mx-auto w-full max-w-7xl p-6">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="py-2">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-3xl tracking-tight">
              Welcome back{organization ? `, ${organization.name}` : ""}
            </CardTitle>
            <CardDescription>
              Your organization workspace is ready. Use the navigation to review activity and
              billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Organization
                </p>
                <p className="mt-2 text-lg font-semibold">{organization?.name ?? "Workspace"}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Membership
                </p>
                <p className="mt-2 text-lg font-semibold">Active</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                <p className="mt-2 text-lg font-semibold">{user.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-xl tracking-tight">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-8 pb-8">
            {isAdmin ? (
              <Button asChild className="w-full justify-start">
                <Link href={ROUTES.ADMIN}>Open admin dashboard</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={ROUTES.DASHBOARD_ACTIVITY}>View activity</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={ROUTES.DASHBOARD_EXPENSES}>Manage expenses</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={ROUTES.DASHBOARD_BUDGETS}>Manage budgets</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
