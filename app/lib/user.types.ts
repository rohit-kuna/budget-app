import type { AppRole } from "@/app/lib/roles";

export type AdminUserTableRow = {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  role: AppRole;
  orgId: number | null;
  createdAt: Date;
  updatedAt: Date;
};
