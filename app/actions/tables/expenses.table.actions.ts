"use server";

import { aliasedTable, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, counterParty, expenses, transactionModes, users } from "@/db/schema";
import type { ExpenseRecordDto } from "@/app/lib/expense.types";
import type { ExpenseScope, ExpenseType, TransferStatus } from "@/db/schema";

const transactionModeOwner = aliasedTable(users, "transactionModeOwner");

function toExpenseDto(
  record: typeof expenses.$inferSelect & {
    categoryName: string;
    userName: string;
    userEmail: string;
    counterPartyName: string | null;
    transactionModeName: string | null;
    transactionModeOwnerName: string | null;
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
    counterPartyId: record.counterPartyId,
    counterPartyName: record.counterPartyName,
    transactionModeId: record.transactionModeId,
    transactionModeName: record.transactionModeName,
    transactionModeOwnerName: record.transactionModeOwnerName,
    amount: record.amount.toString(),
    type: record.type as ExpenseType,
    scope: record.scope as ExpenseScope,
    transferStatus: (record.transferStatus as TransferStatus | null) ?? null,
    necessityScore: Number(record.necessityScore),
    note: record.note,
    occurredAt: record.occurredAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function expenseSelectShape() {
  return {
    id: expenses.id,
    orgId: expenses.orgId,
    userId: expenses.userId,
    userName: users.name,
    userEmail: users.email,
    categoryId: expenses.categoryId,
    categoryName: categories.name,
    counterPartyId: expenses.counterPartyId,
    counterPartyName: counterParty.name,
    transactionModeId: expenses.transactionModeId,
    transactionModeName: transactionModes.name,
    transactionModeOwnerName: transactionModeOwner.name,
    amount: expenses.amount,
    type: expenses.type,
    scope: expenses.scope,
    transferStatus: expenses.transferStatus,
    necessityScore: expenses.necessityScore,
    note: expenses.note,
    occurredAt: expenses.occurredAt,
    createdAt: expenses.createdAt,
    updatedAt: expenses.updatedAt,
  } as const;
}

export async function getExpensesByOrg(orgId: number): Promise<ExpenseRecordDto[]> {
  const records = await db
    .select(expenseSelectShape())
    .from(expenses)
    .innerJoin(categories, eq(categories.id, expenses.categoryId))
    .innerJoin(users, eq(users.id, expenses.userId))
    .leftJoin(counterParty, eq(counterParty.id, expenses.counterPartyId))
    .leftJoin(transactionModes, eq(transactionModes.id, expenses.transactionModeId))
    .leftJoin(transactionModeOwner, eq(transactionModeOwner.id, transactionModes.userId))
    .where(eq(expenses.orgId, orgId))
    .orderBy(desc(expenses.occurredAt), desc(expenses.createdAt));

  return records.map(toExpenseDto);
}

export async function getExpenseById(id: number): Promise<ExpenseRecordDto | null> {
  const [record] = await db
    .select(expenseSelectShape())
    .from(expenses)
    .innerJoin(categories, eq(categories.id, expenses.categoryId))
    .innerJoin(users, eq(users.id, expenses.userId))
    .leftJoin(counterParty, eq(counterParty.id, expenses.counterPartyId))
    .leftJoin(transactionModes, eq(transactionModes.id, expenses.transactionModeId))
    .leftJoin(transactionModeOwner, eq(transactionModeOwner.id, transactionModes.userId))
    .where(eq(expenses.id, id))
    .limit(1);

  return record ? toExpenseDto(record) : null;
}

export async function createExpenseRecord(input: {
  orgId: number;
  userId: string;
  categoryId: number;
  counterPartyId: number | null;
  transactionModeId: number | null;
  transferStatus: TransferStatus | null;
  amount: string;
  type: ExpenseType;
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
    counterPartyId: number | null;
    transactionModeId: number | null;
    transferStatus: TransferStatus | null;
    amount: string;
    type: ExpenseType;
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
