"use server";

import { desc, eq } from "drizzle-orm";
import { cache } from "react";
import type { OrganizationMemberRecord, OrganizationRecord } from "@/app/lib/admin-dashboard.types";
import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { ROLES } from "@/app/lib/roles";

export async function createOrganizationRecord(input: {
  name: string;
  inviteCode: string;
  createdBy: string;
}) {
  const [organization] = await db
    .insert(organizations)
    .values(input)
    .returning();

  return organization ?? null;
}

export const getOrganizationById = cache(async (id: number): Promise<OrganizationRecord | null> => {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);

  return organization ?? null;
});

export async function getOrganizationByInviteCode(
  inviteCode: string
): Promise<OrganizationRecord | null> {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.inviteCode, inviteCode))
    .limit(1);

  return organization ?? null;
}

export async function updateOrganizationInviteCode(id: number, inviteCode: string) {
  const [organization] = await db
    .update(organizations)
    .set({ inviteCode, updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning();

  return organization ?? null;
}

export async function updateOrganizationName(id: number, name: string) {
  const [organization] = await db
    .update(organizations)
    .set({ name, updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning();

  return organization ?? null;
}

export async function getOrganizationMembers(orgId: number): Promise<OrganizationMemberRecord[]> {
  return db
    .select({
      id: users.id,
      clerkUserId: users.clerkUserId,
      email: users.email,
      name: users.name,
      role: users.role,
      orgId: users.orgId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.orgId, orgId))
    .orderBy(desc(users.createdAt));
}

export async function getOrganizationAdminCount(orgId: number) {
  const records = await db
    .select({
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(eq(users.orgId, orgId));

  return records.filter((record) => record.role === ROLES.ADMIN).length;
}
