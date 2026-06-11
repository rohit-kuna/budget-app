"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { categoryTags } from "@/db/schema";
import type { CategoryTagRecordDto } from "@/app/lib/finance.types";

type DbExecutor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function getCategoryTagsByOrg(orgId: number): Promise<CategoryTagRecordDto[]> {
  const records = await db
    .select({
      categoryId: categoryTags.categoryId,
      tagId: categoryTags.tagId,
      usageCount: categoryTags.usageCount,
    })
    .from(categoryTags)
    .where(eq(categoryTags.orgId, orgId));

  return records;
}

export async function incrementCategoryTagUsage(
  executor: DbExecutor,
  orgId: number,
  categoryId: number,
  tagIds: number[]
): Promise<void> {
  if (!tagIds.length) return;

  for (const tagId of tagIds) {
    await executor
      .insert(categoryTags)
      .values({ orgId, categoryId, tagId, usageCount: 1 })
      .onConflictDoUpdate({
        target: [categoryTags.categoryId, categoryTags.tagId],
        set: {
          usageCount: sql`${categoryTags.usageCount} + 1`,
          updatedAt: new Date(),
        },
      });
  }
}

export async function setCategoryTags(
  orgId: number,
  categoryId: number,
  tagIds: number[]
): Promise<void> {
  const existing = await db
    .select({ tagId: categoryTags.tagId })
    .from(categoryTags)
    .where(and(eq(categoryTags.orgId, orgId), eq(categoryTags.categoryId, categoryId)));

  const existingIds = new Set(existing.map((row) => row.tagId));
  const nextIds = new Set(tagIds);

  const toAdd = tagIds.filter((tagId) => !existingIds.has(tagId));
  const toRemove = [...existingIds].filter((tagId) => !nextIds.has(tagId));

  for (const tagId of toAdd) {
    await db.insert(categoryTags).values({ orgId, categoryId, tagId, usageCount: 0 });
  }

  if (toRemove.length) {
    await db
      .delete(categoryTags)
      .where(
        and(
          eq(categoryTags.orgId, orgId),
          eq(categoryTags.categoryId, categoryId),
          inArray(categoryTags.tagId, toRemove)
        )
      );
  }
}

export async function decrementCategoryTagUsage(
  executor: DbExecutor,
  orgId: number,
  categoryId: number,
  tagIds: number[]
): Promise<void> {
  if (!tagIds.length) return;

  for (const tagId of tagIds) {
    await executor
      .update(categoryTags)
      .set({
        usageCount: sql`GREATEST(${categoryTags.usageCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(categoryTags.orgId, orgId),
          eq(categoryTags.categoryId, categoryId),
          eq(categoryTags.tagId, tagId)
        )
      );
  }
}
