"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, expenses, users } from "@/db/schema";
import type { ExpenseRecordDto } from "@/app/lib/expense.types";
import type { ExpenseMode, ExpenseScope, ExpenseType } from "@/db/schema";

function toExpenseDto(
  record: typeof expenses.$inferSelect & {
    categoryName: string;
    userName: string;
    userEmail: string;
  }
): ExpenseRecordDto {
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    userName: record.userName,
    userEmail: record.userEmail,
    categoryId: record.categoryId,
    categoryName: record.categoryName,
    amount: record.amount.toString(),
    type: record.type as ExpenseType,
    transactionMode: record.transactionMode as ExpenseMode,
    scope: record.scope as ExpenseScope,
    necessityScore: Number(record.necessityScore),
    note: record.note,
    occurredAt: record.occurredAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function getExpensesByOrg(orgId: number): Promise<ExpenseRecordDto[]> {
  const records = await db
    .select({
      id: expenses.id,
      orgId: expenses.orgId,
      userId: expenses.userId,
      userName: users.name,
      userEmail: users.email,
      categoryId: expenses.categoryId,
      categoryName: categories.name,
      amount: expenses.amount,
      type: expenses.type,
      transactionMode: expenses.transactionMode,
      scope: expenses.scope,
      necessityScore: expenses.necessityScore,
      note: expenses.note,
      occurredAt: expenses.occurredAt,
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
    })
    .from(expenses)
    .innerJoin(categories, eq(categories.id, expenses.categoryId))
    .innerJoin(users, eq(users.id, expenses.userId))
    .where(eq(expenses.orgId, orgId))
    .orderBy(desc(expenses.occurredAt), desc(expenses.createdAt));

  return records.map(toExpenseDto);
}

export async function getExpenseById(id: number): Promise<ExpenseRecordDto | null> {
  const [record] = await db
    .select({
      id: expenses.id,
      orgId: expenses.orgId,
      userId: expenses.userId,
      userName: users.name,
      userEmail: users.email,
      categoryId: expenses.categoryId,
      categoryName: categories.name,
      amount: expenses.amount,
      type: expenses.type,
      transactionMode: expenses.transactionMode,
      scope: expenses.scope,
      necessityScore: expenses.necessityScore,
      note: expenses.note,
      occurredAt: expenses.occurredAt,
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
    })
    .from(expenses)
    .innerJoin(categories, eq(categories.id, expenses.categoryId))
    .innerJoin(users, eq(users.id, expenses.userId))
    .where(eq(expenses.id, id))
    .limit(1);

  return record ? toExpenseDto(record) : null;
}

export async function createExpenseRecord(input: {
  orgId: number;
  userId: string;
  categoryId: number;
  amount: string;
  type: ExpenseType;
  transactionMode: ExpenseMode;
  scope: ExpenseScope;
  necessityScore: number;
  note: string | null;
  occurredAt: Date;
}) {
  const [record] = await db.insert(expenses).values(input).returning();
  return record ?? null;
}

export async function updateExpenseRecord(
  id: number,
  input: Partial<{
    categoryId: number;
    amount: string;
    type: ExpenseType;
    transactionMode: ExpenseMode;
    scope: ExpenseScope;
    necessityScore: number;
    note: string | null;
    occurredAt: Date;
    updatedAt: Date;
  }>
) {
  const [record] = await db.update(expenses).set(input).where(eq(expenses.id, id)).returning();
  return record ?? null;
}

export async function deleteExpenseRecord(id: number) {
  const [record] = await db.delete(expenses).where(eq(expenses.id, id)).returning();
  return record ?? null;
}
