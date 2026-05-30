"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/app/lib/auth";
import { ROUTES } from "@/app/lib/constants";
import {
  createTransactionModeRecord,
  deleteTransactionModeRecord,
  ensureDefaultTransactionModesForUser,
  getTransactionModeById,
  getTransactionModesByUser,
  setDefaultTransactionModeForUser,
  updateTransactionModeRecord,
} from "@/app/actions/tables/transaction-modes.table.actions";
import type { FinanceActionState } from "@/app/actions/auth-roles/finance.types";

const transactionModeSchema = z.object({
  name: z.string().trim().min(2, "Transaction mode name is required").max(255),
});

const transactionModeIdSchema = z.object({
  transactionModeId: z.coerce.number().int().positive(),
});

export async function getTransactionModesData() {
  const currentUser = await requireUser();
  const transactionModes = await ensureDefaultTransactionModesForUser(currentUser.id);

  return {
    transactionModes,
    currentUser: {
      id: currentUser.id,
      role: currentUser.role,
      orgId: currentUser.orgId,
    },
  };
}

export async function createTransactionModeAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  const currentUser = await requireUser();
  const parsed = transactionModeSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to create transaction mode" };
  }

  const existingModes = await getTransactionModesByUser(currentUser.id);

  if (existingModes.some((mode) => mode.name.toLowerCase() === parsed.data.name.toLowerCase())) {
    return { error: "Transaction mode already exists" };
  }

  await createTransactionModeRecord({
    userId: currentUser.id,
    name: parsed.data.name,
    isDefault: existingModes.length === 0,
  });

  redirect(ROUTES.TRANSACTION_MODES);
}

export async function updateTransactionModeAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  const currentUser = await requireUser();
  const parsed = transactionModeSchema.safeParse({
    name: formData.get("name"),
  });
  const transactionModeIdResult = transactionModeIdSchema.safeParse({
    transactionModeId: formData.get("transactionModeId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to update transaction mode" };
  }

  if (!transactionModeIdResult.success) {
    return { error: "Transaction mode is required" };
  }

  const transactionMode = await getTransactionModeById(transactionModeIdResult.data.transactionModeId);

  if (!transactionMode) {
    return { error: "Transaction mode does not exist" };
  }

  if (transactionMode.userId !== currentUser.id) {
    return { error: "You can only edit your own transaction modes" };
  }

  const existingModes = await getTransactionModesByUser(currentUser.id);
  if (
    existingModes.some(
      (existing) =>
        existing.id !== transactionMode.id &&
        existing.name.toLowerCase() === parsed.data.name.toLowerCase()
    )
  ) {
    return { error: "Transaction mode already exists" };
  }

  await updateTransactionModeRecord(transactionMode.id, {
    name: parsed.data.name,
    updatedAt: new Date(),
  });

  redirect(ROUTES.TRANSACTION_MODES);
}

export async function setDefaultTransactionModeAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  const currentUser = await requireUser();
  const transactionModeIdResult = transactionModeIdSchema.safeParse({
    transactionModeId: formData.get("transactionModeId"),
  });

  if (!transactionModeIdResult.success) {
    return { error: "Transaction mode is required" };
  }

  const transactionMode = await getTransactionModeById(transactionModeIdResult.data.transactionModeId);

  if (!transactionMode) {
    return { error: "Transaction mode does not exist" };
  }

  if (transactionMode.userId !== currentUser.id) {
    return { error: "You can only update your own transaction modes" };
  }

  const updated = await setDefaultTransactionModeForUser(currentUser.id, transactionMode.id);

  if (!updated) {
    return { error: "Unable to set default transaction mode" };
  }

  redirect(ROUTES.TRANSACTION_MODES);
}

export async function deleteTransactionModeAction(
  _previousState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  const currentUser = await requireUser();
  const transactionModeIdResult = transactionModeIdSchema.safeParse({
    transactionModeId: formData.get("transactionModeId"),
  });

  if (!transactionModeIdResult.success) {
    return { error: "Transaction mode is required" };
  }

  const transactionMode = await getTransactionModeById(transactionModeIdResult.data.transactionModeId);

  if (!transactionMode) {
    return { error: "Transaction mode does not exist" };
  }

  if (transactionMode.userId !== currentUser.id) {
    return { error: "You can only delete your own transaction modes" };
  }

  await deleteTransactionModeRecord(transactionMode.id);

  if (transactionMode.isDefault) {
    const remainingModes = await getTransactionModesByUser(currentUser.id);
    if (remainingModes.length && !remainingModes.some((mode) => mode.isDefault)) {
      await setDefaultTransactionModeForUser(currentUser.id, remainingModes[0].id);
    }
  }

  redirect(ROUTES.TRANSACTION_MODES);
}
