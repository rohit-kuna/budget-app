import type { organizations, users } from "@/db/schema";

export type OrganizationRecord = typeof organizations.$inferSelect;

export type OrganizationMemberRecord = Pick<
  typeof users.$inferSelect,
  "id" | "clerkUserId" | "email" | "name" | "role" | "orgId" | "createdAt" | "updatedAt"
>;

export type AdminDashboardData = {
  organization: OrganizationRecord | null;
  members: OrganizationMemberRecord[];
  inviteLink: string | null;
};
