"use server";

import type { AppRole } from "@/app/lib/roles";
import type { AdminUserTableRow } from "@/app/lib/user.types";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

type CreateUserInput = {
  clerkUserId: string;
  email: string;
  name: string;
  role: AppRole;
};

type UpdateUserInput = Partial<{
  email: string;
  name: string;
  role: AppRole;
  orgId: number | null;
}>;

export async function createUser(input: CreateUserInput) {
  const [createdUser] = await db.insert(users).values(input).returning();
  return createdUser ?? null;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function getUserByClerkUserId(clerkUserId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);
  return user ?? null;
}

export async function getAllUsers(): Promise<AdminUserTableRow[]> {
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
    .orderBy(desc(users.createdAt));
}

export async function updateUserById(id: string, input: UpdateUserInput) {
  const [updatedUser] = await db
    .update(users)
    .set(input)
    .where(eq(users.id, id))
    .returning();

  return updatedUser ?? null;
}

export async function deleteUserById(id: string) {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();

  return deletedUser ?? null;
}
