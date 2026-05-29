import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminDashboardData } from "@/app/lib/admin-dashboard.types";
import { updateOrganizationMemberRoleAction } from "@/app/actions/auth-roles/admin.actions";
import { ROLES } from "@/app/lib/roles";

type MemberManagementProps = {
  data: AdminDashboardData;
};

export function MemberManagement({ data }: MemberManagementProps) {
  return (
    <Card className="py-2">
      <CardHeader className="px-4 pt-6 sm:px-8 sm:pt-8">
        <CardTitle className="text-2xl tracking-tight">Members</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-6 sm:px-8 sm:pb-8">
        {data.members.length ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="border-b bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Updated role</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((member) => (
                  <tr key={member.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">
                      {member.name}
                      {member.role === ROLES.ADMIN ? (
                        <Badge variant="secondary" className="ml-2 align-middle">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 align-middle">
                          User
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                    <td className="px-4 py-3">{member.role}</td>
                    <td className="px-4 py-3">
                      <form action={updateOrganizationMemberRoleAction} className="flex flex-col gap-2 sm:flex-row">
                        <input type="hidden" name="userId" value={member.id} />
                        <select
                          name="role"
                          defaultValue={member.role}
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value={ROLES.ADMIN}>ADMIN</option>
                          <option value={ROLES.USER}>USER</option>
                        </select>
                        <Button type="submit" variant="outline" className="w-full sm:w-auto">
                          Save
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            No members yet. Once users accept the invite link, they will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
