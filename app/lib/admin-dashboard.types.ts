import type { organizations, users } from "@/db/schema";
import type { AppRole } from "@/app/lib/roles";

export type OrganizationRecord = typeof organizations.$inferSelect;

export type OrganizationMemberRecord = Pick<
  typeof users.$inferSelect,
  "id" | "clerkUserId" | "email" | "name" | "createdAt" | "updatedAt"
> & {
  role: AppRole;
  orgId: number;
};

export type AdminDashboardData = {
  organization: OrganizationRecord | null;
  members: OrganizationMemberRecord[];
  inviteLink: string | null;
};
