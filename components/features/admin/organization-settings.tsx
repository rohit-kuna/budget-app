import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyInviteLinkButton } from "@/components/features/admin/copy-invite-link-button";
import { createOrganizationAction, regenerateOrganizationInviteAction } from "@/app/actions/auth-roles/admin.actions";
import type { AdminDashboardData } from "@/app/lib/admin-dashboard.types";
import { ROUTES } from "@/app/lib/constants";

type OrganizationSettingsProps = {
  data: AdminDashboardData;
};

export function OrganizationSettings({ data }: OrganizationSettingsProps) {
  const inviteLink = data.inviteLink;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="py-2">
        <CardHeader className="px-4 pt-6 sm:px-8 sm:pt-8">
          <CardTitle className="text-2xl tracking-tight">Organization setup</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-8 sm:pb-8">
          {data.organization ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your organization is ready. Use the invite link below to add new members.
              </p>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Organization name
                </p>
                <p className="mt-1 text-lg font-semibold">{data.organization.name}</p>
              </div>
            </div>
          ) : (
            <form action={createOrganizationAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Acme Finance"
                  autoComplete="organization"
                  required
                />
              </div>
              <Button type="submit">Create organization</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardHeader className="px-4 pt-6 sm:px-8 sm:pt-8">
          <CardTitle className="text-2xl tracking-tight">Invite link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-6 sm:px-8 sm:pb-8">
          {inviteLink ? (
            <>
              <div className="rounded-lg border bg-muted/30 p-4 font-mono text-sm break-all">
                {inviteLink}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <CopyInviteLinkButton inviteLink={inviteLink} />
                <form action={regenerateOrganizationInviteAction}>
                  <Button type="submit" variant="outline" className="w-full sm:w-auto">
                    Regenerate link
                  </Button>
                </form>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with teammates. When they sign in with Google or email through
                Clerk, they will be attached to this organization.
              </p>
            </>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
              Create an organization first to generate a shareable invite link.
            </div>
          )}
          <Button asChild variant="ghost" className="px-0">
            <Link href={ROUTES.SIGN_IN}>Review auth flow</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
