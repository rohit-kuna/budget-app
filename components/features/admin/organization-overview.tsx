import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/app/lib/constants";
import { ROLES } from "@/app/lib/roles";
import type { AdminDashboardData } from "@/app/lib/admin-dashboard.types";

type OrganizationOverviewProps = {
  data: AdminDashboardData;
};

export function OrganizationOverview({ data }: OrganizationOverviewProps) {
  const memberCount = data.members.length;
  const adminCount = data.members.filter((member) => member.role === ROLES.ADMIN).length;

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Card className="py-2">
        <CardHeader className="space-y-3 px-8 pt-8">
          <Badge variant="secondary" className="w-fit">
            Admin dashboard
          </Badge>
          <CardTitle className="text-3xl tracking-tight">
            Manage your organization
          </CardTitle>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create an organization, share invite codes, and keep roles aligned with the team
            structure.
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {data.organization ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Organization
                </p>
                <p className="mt-2 text-lg font-semibold">{data.organization.name}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Members</p>
                <p className="mt-2 text-lg font-semibold">{memberCount}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Admins</p>
                <p className="mt-2 text-lg font-semibold">{adminCount}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/20 p-6">
              <p className="font-medium">No organization yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create the first organization to start sharing invite codes and managing access.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardHeader className="px-8 pt-8">
          <CardTitle className="text-xl tracking-tight">Quick navigation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-8 pb-8">
          <Button asChild variant="outline" className="justify-start">
            <Link href={ROUTES.ADMIN_USERS}>Manage members</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href={ROUTES.ADMIN_SETTINGS}>Organization settings</Link>
          </Button>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            Google OAuth is handled by Clerk. Enable the Google provider in Clerk so invited
            users can sign in with Google or email, then return here through the invite link.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
